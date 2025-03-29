package com.example.mylib.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String email;
    private String name;
    private List<String> roles;
    private Long userId;
} 