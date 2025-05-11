package com.example.mylib.services.mail;

import com.example.mylib.services.impl.EmailServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Component
public class EmailHelper {

    @Value("${spring.application.host}")
    private String baseUrl;

    private static final Logger logger = LoggerFactory.getLogger(EmailHelper.class);

    public String getLinkForAuthentication(String emailToken, String userId) {
        return baseUrl + "/api/users/verify?userId=" + userId + "&token=" + emailToken;
    }

    public String getPasswordResetLink(String resetToken, String userId) {
        return baseUrl + "/api/users/reset-password?userId=" + userId + "&token=" + resetToken;
    }
}

