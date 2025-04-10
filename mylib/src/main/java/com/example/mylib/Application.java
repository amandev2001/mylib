package com.example.mylib;

import com.example.mylib.entities.Users;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

@SpringBootApplication
public class Application implements CommandLineRunner {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "puadmin4578@gmail.com";
        if(userRepo.findByEmail(adminEmail) == null){
            Users admin = new Users();
            admin.setEmail(adminEmail);
            admin.setName("Admin");
            admin.setPassword("admin5!4$3");
            admin.setAbout("Admin for production");
            admin.setRoleList(List.of(AppConstants.ROLE_ADMIN));
            userRepo.save(admin);
        } else {
            System.out.println("Admin user already exists.");
        }
    }
}
