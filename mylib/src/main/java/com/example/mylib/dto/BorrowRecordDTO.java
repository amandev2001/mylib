package com.example.mylib.dto;

import com.example.mylib.enums.BorrowStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BorrowRecordDTO {
    private Long id;
    private String userName;
    private Long bookId;
    private String bookTitle;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private double fineAmount;
    private BorrowStatus status;
}
