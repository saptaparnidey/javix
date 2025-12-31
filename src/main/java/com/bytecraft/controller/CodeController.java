package com.bytecraft.controller;

import com.bytecraft.model.CodeRequest;
import com.bytecraft.model.CodeResponse;
import com.bytecraft.service.CodeExecutionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow all origins for simplicity in this project
public class CodeController {

    private final CodeExecutionService codeExecutionService;

    public CodeController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @PostMapping("/run")
    public CodeResponse runCode(@RequestBody CodeRequest request) {
        return codeExecutionService.executeCode(request.getCode(), request.getInput());
    }
}
