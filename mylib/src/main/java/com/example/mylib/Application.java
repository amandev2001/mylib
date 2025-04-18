package com.example.mylib;
import com.example.mylib.entities.Users;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

@SpringBootApplication
public class Application implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(Application.class);

    @Autowired
    private UserRepo userRepo;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Starting application initialization...");
            String adminEmail = "puadmin4578@gmail.com";
            
            logger.info("Checking for admin user: {}", adminEmail);
            Users existingAdmin = userRepo.findByEmail(adminEmail);
            
            if (existingAdmin == null) {
                logger.info("Admin user not found. Creating new admin user...");
                Users admin = new Users();
                admin.setEmail(adminEmail);
                admin.setName("Admin");

                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                String encodedPassword = encoder.encode("admin5!4$3");
                admin.setPassword(encodedPassword);
                logger.debug("Password encoded successfully");

                admin.setAbout("Admin for production");
                admin.setRoleList(List.of(AppConstants.ROLE_ADMIN));
                
                Users savedAdmin = userRepo.save(admin);
                logger.info("Admin user created successfully with ID: {}", savedAdmin.getId());
            } else {
                logger.info("Admin user already exists with ID: {}", existingAdmin.getId());
            }
        } catch (Exception e) {
            logger.error("Error during application initialization", e);
            // Don't throw the exception - let the application continue to start
        }
    }
}
