package com.bytecraft.controller;

import com.bytecraft.model.FormatRequest;
import com.bytecraft.model.FormatResponse;
import com.bytecraft.service.FormatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/format")
@CrossOrigin(origins = "*")
public class FormatController {

    private final FormatService formatService;

    public FormatController(FormatService formatService) {
        this.formatService = formatService;
    }

    @PostMapping("/json/beautify")
    public FormatResponse beautifyJson(@RequestBody FormatRequest request) {
        try {
            return new FormatResponse(formatService.beautifyJson(request.getContent()), null);
        } catch (Exception e) {
            return new FormatResponse(null, "Invalid JSON: " + e.getMessage());
        }
    }

    @PostMapping("/json/minify")
    public FormatResponse minifyJson(@RequestBody FormatRequest request) {
        try {
            return new FormatResponse(formatService.minifyJson(request.getContent()), null);
        } catch (Exception e) {
            return new FormatResponse(null, "Invalid JSON: " + e.getMessage());
        }
    }

    @PostMapping("/xml/beautify")
    public FormatResponse beautifyXml(@RequestBody FormatRequest request) {
        try {
            return new FormatResponse(formatService.beautifyXml(request.getContent()), null);
        } catch (Exception e) {
            return new FormatResponse(null, "Invalid XML: " + e.getMessage());
        }
    }

    @PostMapping("/xml/minify")
    public FormatResponse minifyXml(@RequestBody FormatRequest request) {
        try {
            return new FormatResponse(formatService.minifyXml(request.getContent()), null);
        } catch (Exception e) {
            return new FormatResponse(null, "Invalid XML: " + e.getMessage());
        }
    }

    @PostMapping("/convert/json-to-xml")
    public FormatResponse jsonToXml(@RequestBody FormatRequest request) {
        try {
            return new FormatResponse(formatService.jsonToXml(request.getContent()), null);
        } catch (Exception e) {
            return new FormatResponse(null, "Conversion Error: " + e.getMessage());
        }
    }

    @PostMapping("/convert/xml-to-json")
    public FormatResponse xmlToJson(@RequestBody FormatRequest request) {
        try {
            return new FormatResponse(formatService.xmlToJson(request.getContent()), null);
        } catch (Exception e) {
            return new FormatResponse(null, "Conversion Error: " + e.getMessage());
        }
    }
}
