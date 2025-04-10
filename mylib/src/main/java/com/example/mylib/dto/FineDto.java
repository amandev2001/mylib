package com.example.mylib.dto;


import com.example.mylib.enums.BorrowStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FineDto {
    private Long borrowRecordId;
    private Long bookId;
    private Long userId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private double fineAmount;
    private BorrowStatus status;
    private boolean paid;
}
