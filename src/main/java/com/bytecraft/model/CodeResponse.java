package com.bytecraft.model;

public class CodeResponse {
    private String output;
    private String error;
    private boolean compiled;
    private long executionTime;

    public CodeResponse(String output, String error, boolean compiled, long executionTime) {
        this.output = output;
        this.error = error;
        this.compiled = compiled;
        this.executionTime = executionTime;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public boolean isCompiled() {
        return compiled;
    }

    public void setCompiled(boolean compiled) {
        this.compiled = compiled;
    }

    public long getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(long executionTime) {
        this.executionTime = executionTime;
    }
}
