package com.example.mylib.controllers.admin.health;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Health {
    @Id
    private Long id;
    private String status;
    private String message;
}
