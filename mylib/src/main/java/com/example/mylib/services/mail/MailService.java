package com.example.mylib.services.mail;

import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;

@Service
public interface MailService {
    void sendEmail(String to, String subject, String body);

    void sendEmailWithHtml(String to, String subject, String templateName, Context context) throws MessagingException;

    void sendEmailWithAttachment();

    void sendVerificationEmail(String to, String name, String verificationLink);
}
