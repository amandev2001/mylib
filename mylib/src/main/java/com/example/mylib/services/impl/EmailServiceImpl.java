package com.example.mylib.services.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.example.mylib.services.mail.MailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements MailService {

    private final JavaMailSender eMailSender;
    private final String domainName;
    private final String APP_NAME;
    private final SpringTemplateEngine templateEngine;

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    public EmailServiceImpl(JavaMailSender eMailSender,
                          SpringTemplateEngine templateEngine,
                          @Value("${spring.mail.properties.mail.smtp.from}") String domainName,
                          @Value("${spring.application.name}") String APP_NAME) {
        this.eMailSender = eMailSender;
        this.templateEngine = templateEngine;
        this.domainName = domainName;
        this.APP_NAME = APP_NAME;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom(domainName);
        eMailSender.send(message);
    }

    @Override
    public void sendEmailWithHtml(String to, String subject, String templateName, Context context) throws MessagingException {
        MimeMessage message = eMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setFrom(domainName);
        
        String htmlContent = templateEngine.process(templateName, context);
        helper.setText(htmlContent, true);
        
        eMailSender.send(message);
    }

    @Override
    public void sendEmailWithAttachment() {
        throw new UnsupportedOperationException("Unimplemented method 'sendEmailWithAttachment'");
    }

    @Override
    public void sendVerificationEmail(String to, String name, String verificationLink) {
        logger.info("Sending verification email to {} with this link {}", to, verificationLink);
        String subject = "Verify Your Email for " + APP_NAME + " Account";

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("verificationLink", verificationLink);
        context.setVariable("appName", APP_NAME);
        context.setVariable("domain", domainName);

        try {
            sendEmailWithHtml(to, subject, "email-verification", context);
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            try {
                // Try plain text template as fallback
                String plainTextContent = templateEngine.process("email-verification.txt", context);
                sendEmail(to, subject, plainTextContent);
            } catch (Exception fallbackError) {
                logger.error("Failed to send plain text email to {}: {}", to, fallbackError.getMessage());
                // If both HTML and text template fail, throw the original error
                throw new RuntimeException("Failed to send verification email", e);
            }
        }
    }
}
