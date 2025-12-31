import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class TestExecution {

    private static final String TEMP_DIR = "test_temp_exec";
    private static final long TIME_OUT_SECONDS = 5;

    public static void main(String[] args) throws IOException {
        System.out.println("Starting TestExecution...");
        Files.createDirectories(Path.of(TEMP_DIR));

        testValidCode();
        testInfiniteLoop();
        testSyntaxError();

        // Cleanup
        // deleteDirectory(new File(TEMP_DIR));
        System.out.println("TestExecution Finished.");
    }

    private static void testValidCode() {
        System.out.println("\n--- Testing Valid Code ---");
        String code = "public class Main { public static void main(String[] args) { System.out.println(\"Hello from Test!\"); } }";
        executeCode(code, null);
    }

    private static void testInfiniteLoop() {
        System.out.println("\n--- Testing Infinite Loop ---");
        String code = "public class Main { public static void main(String[] args) { while(true) {} } }";
        executeCode(code, null);
    }

    private static void testSyntaxError() {
        System.out.println("\n--- Testing Syntax Error ---");
        String code = "public class Main { public static void main(String[] args) { System.out.println(\"Broken\" } }";
        executeCode(code, null);
    }

    public static void executeCode(String code, String input) {
        String uniqueId = UUID.randomUUID().toString();
        String className = "Main";
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
                System.out.println("Compilation Failed (Expected for Syntax Error test):");
                System.out.println(compileError);
                return;
            }

            // 2. Execute
            ProcessBuilder runProcessBuilder = new ProcessBuilder("java", "-cp", ".", className);
            runProcessBuilder.directory(classPath.toFile());
            long startTime = System.currentTimeMillis();
            Process runProcess = runProcessBuilder.start();

            boolean finished = runProcess.waitFor(TIME_OUT_SECONDS, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!finished) {
                runProcess.destroyForcibly();
                System.out.println(
                        "Execution Timed Out (Expected for Infinite Loop test). Time: " + executionTime + "ms");
                return;
            }

            String output = readStream(runProcess.getInputStream());
            String error = readStream(runProcess.getErrorStream());

            System.out.println("Execution Success:");
            System.out.println("Output: " + output);
            if (!error.isEmpty())
                System.out.println("Error: " + error);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String readStream(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }
}
