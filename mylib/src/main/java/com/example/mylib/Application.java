package com.example.mylib;
import com.example.mylib.entities.Users;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

@SpringBootApplication
public class Application implements CommandLineRunner {

    @Autowired
    private UserRepo userRepo;


    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "puadmin4578@gmail.com";
        if (userRepo.findByEmail(adminEmail) == null) {
            Users admin = new Users();
            admin.setEmail(adminEmail);
            admin.setName("Admin");

            //  Create encoder manually or get it from SecurityConfig
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            admin.setPassword(encoder.encode("admin5!4$3"));

            admin.setAbout("Admin for production");
            admin.setRoleList(List.of(AppConstants.ROLE_ADMIN));
            userRepo.save(admin);
        } else {
            System.out.println("Admin user already exists.");
        }
    }
}
