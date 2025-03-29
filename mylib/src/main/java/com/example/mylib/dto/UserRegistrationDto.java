package com.example.mylib.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegistrationDto {
    private String name;

    private String email;

    private String password;

    private String phoneNumber;

    private List<String> roleList = new ArrayList<>();
}
