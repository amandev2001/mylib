package com.example.mylib.dto;


import com.example.mylib.entities.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private List<String> roleList;
    private String profilePic;
    private boolean enabled;
    // Getters & Setters
}
