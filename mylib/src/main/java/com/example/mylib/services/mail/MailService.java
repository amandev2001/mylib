package com.example.mylib.services.mail;

import org.springframework.stereotype.Service;


@Service
public interface MailService {

    void sendEmail(String to, String subject, String body);

    void sendEmailWithHtml();

    void sendEmailWithAttachment();

    void sendVerificationEmail(String to, String name, String verificationLink);
}
