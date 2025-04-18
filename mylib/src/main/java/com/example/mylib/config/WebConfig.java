package com.example.mylib.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed.origins}")
    private String corsAllowedOrigins;

    private final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        String[] allowedOriginsArray = Arrays.stream(corsAllowedOrigins.split(","))
                                             .map(String::trim)
                                             .toArray(String[]::new);

        logger.info("Configuring CORS with allowed origins: {}", Arrays.toString(allowedOriginsArray));

        registry.addMapping("/**")
                .allowedOrigins(allowedOriginsArray)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("Authorization", "Content-Type", "X-Requested-With",
                                "Accept", "Origin", "Access-Control-Request-Method",
                                "Access-Control-Request-Headers")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);

        logger.info("CORS configuration completed");
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
