package com.bytecraft.service;

import com.bazaarvoice.jolt.Chainr;
import com.bazaarvoice.jolt.JsonUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JoltService {

    public String transform(String inputJson, String specJson) throws Exception {
        Object inputObject = JsonUtils.jsonToObject(inputJson);
        List<Object> chainrSpecJSON = JsonUtils.jsonToList(specJson);
        Chainr chainr = Chainr.fromSpec(chainrSpecJSON);

        Object transformedOutput = chainr.transform(inputObject);
        return JsonUtils.toPrettyJsonString(transformedOutput);
    }
}
