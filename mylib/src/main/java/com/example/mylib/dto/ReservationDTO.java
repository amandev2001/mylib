package com.example.mylib.dto;

import com.example.mylib.enums.ReservationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationDTO {
    private Long id;
    private Long userId;
    private Long bookId;
    private String bookTitle;
    private String userName;
    private ReservationType status;
    private LocalDateTime createdAt;
}
