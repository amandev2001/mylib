package com.example.mylib.controllers;

import com.example.mylib.dto.UserDTO;
import com.example.mylib.services.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {


    @Autowired
    private UserServiceImpl userService;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestHeader("Authorization") String token) {
        try {
            // You can use the JWT service to validate the token before fetching users
            System.out.println("JWT Token: "+token);
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized: No token provided");
            }

            String jwtToken = token.substring(7); // Extract the token


            List<UserDTO> users = userService.getAllUsersDTO();
            return ResponseEntity.ok(users);  // Return 200 OK with the list of users
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during fetch: " + e.getMessage()); // 500 Internal Server Error
        }
    }



}
