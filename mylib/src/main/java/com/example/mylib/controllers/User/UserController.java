package com.example.mylib.controllers;

import com.example.mylib.dto.UserDTO;
import com.example.mylib.dto.UserLoginDTO;
import com.example.mylib.dto.UserRegistrationDto;
import com.example.mylib.entities.Users;
import com.example.mylib.services.auth.JWTService;
import com.example.mylib.services.impl.UserServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TestController {

    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    @GetMapping("/")
    public String greet() {
        return "hello";
    }


    @PostMapping("/register")
    public void userRegister(@RequestBody UserRegistrationDto registrationDto) {
        userService.saveUserDto(registrationDto);
    }


    @PostMapping("/login")
    public String userLogin(@RequestBody UserLoginDTO userLoginDTO) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLoginDTO.getEmail(), userLoginDTO.getPassword())
            );

            if (authentication.isAuthenticated()) {
                return jwtService.generateToken(userLoginDTO.getEmail());
            } else {
                return "Authentication failed";
            }
        } catch (
                Exception e) {
            e.printStackTrace();
            return "Error during authentication: " + e.getMessage();
        }
    }



}


