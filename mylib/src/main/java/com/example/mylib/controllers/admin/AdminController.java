package com.example.mylib.controllers.admin;

import com.example.mylib.dto.UserDTO;
import com.example.mylib.services.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserServiceImpl userService;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        try {
            List<UserDTO> users = userService.getAllUsersDTO();
            return ResponseEntity.ok(users);  // Return 200 OK with the list of users
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during fetch: " + e.getMessage()); // 500 Internal Server Error
        }
    }

    @PostMapping("/users/{userId}/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = userService.uploadProfileImage(file, userId);
            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error uploading profile image: " + e.getMessage());
        }
    }
}
