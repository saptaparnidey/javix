package com.bytecraft.model;

public class CodeRequest {
    private String code;
    private String input; // Optional stdin input

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }
}
