package com.bytecraft.service;

import com.bytecraft.model.CodeResponse;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class CodeExecutionService {

    private static final String TEMP_DIR = "temp_code_execution";
    private static final long TIME_OUT_SECONDS = 5;

    public CodeExecutionService() throws IOException {
        Files.createDirectories(Path.of(TEMP_DIR));
    }

    public CodeResponse executeCode(String code, String input) {
        String uniqueId = UUID.randomUUID().toString();
        String className = "Main"; // Assuming the user provides a class named Main
        // In a real world scenario, we might parse the class name or support dynamic
        // names.
        // For simplicity, we enforce 'public class Main'

        Path sourcePath = Path.of(TEMP_DIR, uniqueId, className + ".java");
        Path classPath = Path.of(TEMP_DIR, uniqueId);

        try {
            Files.createDirectories(classPath);
            Files.writeString(sourcePath, code);

            // 1. Compile
            ProcessBuilder compileProcessBuilder = new ProcessBuilder("javac", className + ".java");
            compileProcessBuilder.directory(classPath.toFile());
            Process compileProcess = compileProcessBuilder.start();

            String compileError = readStream(compileProcess.getErrorStream());
            boolean compiled = compileProcess.waitFor(10, TimeUnit.SECONDS);

            if (!compiled || compileProcess.exitValue() != 0) {
                return new CodeResponse("", "Compilation Error:\n" + compileError, false, 0);
            }

            // 2. Execute
            ProcessBuilder runProcessBuilder = new ProcessBuilder("java", "-cp", ".", className);
            runProcessBuilder.directory(classPath.toFile());
            long startTime = System.currentTimeMillis();
            Process runProcess = runProcessBuilder.start();

            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                    writer.write(input);
                    writer.flush();
                }
            }

            boolean finished = runProcess.waitFor(TIME_OUT_SECONDS, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!finished) {
                runProcess.destroyForcibly();
                return new CodeResponse("", "Execution Timed Out (Limit: " + TIME_OUT_SECONDS + "s)", true,
                        executionTime);
            }

            String output = readStream(runProcess.getInputStream());
            String error = readStream(runProcess.getErrorStream());

            return new CodeResponse(output, error, true, executionTime);

        } catch (Exception e) {
            return new CodeResponse("", "Server Error: " + e.getMessage(), false, 0);
        } finally {
            // Cleanup
            deleteDirectory(classPath.toFile());
        }
    }

    private String readStream(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private void deleteDirectory(File file) {
        if (file.isDirectory()) {
            File[] entries = file.listFiles();
            if (entries != null) {
                for (File entry : entries) {
                    deleteDirectory(entry);
                }
            }
        }
        file.delete();
    }
}
