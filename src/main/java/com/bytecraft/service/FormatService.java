package com.bytecraft.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.stereotype.Service;

@Service
public class FormatService {

    private final ObjectMapper jsonMapper = new ObjectMapper();
    private final XmlMapper xmlMapper = new XmlMapper();

    public String beautifyJson(String json) throws Exception {
        Object jsonObject = jsonMapper.readValue(json, Object.class);
        return jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);
    }

    public String minifyJson(String json) throws Exception {
        Object jsonObject = jsonMapper.readValue(json, Object.class);
        return jsonMapper.writeValueAsString(jsonObject);
    }

    public String beautifyXml(String xml) throws Exception {
        JsonNode node = xmlMapper.readTree(xml);
        return xmlMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
    }

    public String minifyXml(String xml) throws Exception {
        JsonNode node = xmlMapper.readTree(xml);
        return xmlMapper.writeValueAsString(node);
    }

    public String jsonToXml(String json) throws Exception {
        JsonNode node = jsonMapper.readTree(json);
        // Jackson XML mapper needs a root name if the json doesn't have one single root
        // But for simplicity, we write as string. If it fails, user needs to wrap it or
        // we can wrap it.
        // We will write value as string directly.
        return xmlMapper.writerWithDefaultPrettyPrinter().withRootName("root").writeValueAsString(node);
    }

    public String xmlToJson(String xml) throws Exception {
        JsonNode node = xmlMapper.readTree(xml);
        return jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
    }
}
