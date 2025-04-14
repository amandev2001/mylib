package com.example.mylib.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.mylib.services.mail.MailService;

@Service
public class EmailServiceImpl implements MailService {

    private final JavaMailSender eMailSender;
    private final String domainName;
    private final String APP_NAME;

    public EmailServiceImpl(JavaMailSender eMailSender,
                            @Value("${spring.mail.properties.mail.smtp.from}") String domainName,
                            @Value("${spring.application.name}") String APP_NAME) {
        this.eMailSender = eMailSender;
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
    public void sendEmailWithHtml() {
        throw new UnsupportedOperationException("Unimplemented method 'sendEmailWithHtml'");
    }

    @Override
    public void sendEmailWithAttachment() {
        throw new UnsupportedOperationException("Unimplemented method 'sendEmailWithAttachment'");
    }

    @Override
    public void sendVerificationEmail(String to, String name, String verificationLink) {
        String subject = "Verify Your Email for " + APP_NAME + " Account";

        String body = "Dear " + name + ",\n\n" +
                "Thank you for registering with " + APP_NAME + "! We're excited to have you join our community.\n\n" +
                "To complete your registration and activate your account, please verify your email address by clicking the link below:\n\n" +
                verificationLink + "\n\n" +
                "This link will expire in 24 hours for security reasons.\n\n" +
                "Once verified, you'll have access to:\n" +
                "• Browse our extensive collection of books and resources\n" +
                "• Reserve materials online\n" +
                "• Access digital content\n" +
                "• Participate in library events and programs\n\n" +
                "If you did not create an account with " + APP_NAME + ", please disregard this email.\n\n" +
                "If you have any questions or need assistance, please contact our support team at support@" + domainName
                + " or call us.\n\n" +
                "Happy reading!\n\n" +
                "Best regards,\n" +
                "The " + APP_NAME + " Team";

        sendEmail(to, subject, body);
    }
}
