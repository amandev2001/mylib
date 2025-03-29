package com.example.mylib.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {

    private static final String dateFormat = "dd/MM/yyyy";
    private static final String dateTimeFormat = "dd/MM/yyyy HH:mm:ss";

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(new LocalDateSerializer(DateTimeFormatter.ofPattern(dateFormat)));
        javaTimeModule.addSerializer(new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(dateTimeFormat)));
        
        objectMapper.registerModule(javaTimeModule);
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return objectMapper;
    }
} 