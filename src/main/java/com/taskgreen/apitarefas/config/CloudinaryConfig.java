package com.taskgreen.apitarefas.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "taskgreen-api");
        config.put("api_key", "814592222596384");
        config.put("api_secret", "aqON4s9AkAx_OlWU6MDU5SNx2DY"); // ← Substitua aqui também!

        return new Cloudinary(config);
    }
}