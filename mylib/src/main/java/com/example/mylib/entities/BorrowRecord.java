package com.example.mylib.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "borrow_records")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BorrowRecord {

    @Id
    @Column(name = "borrow_record_id", length = 36, updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user; // Reference to the User who borrowed the book

    @ManyToOne
    @JoinColumn(name = "book_id",nullable = false)
    private Book book;  // Reference to the Book that was borrowed

    private LocalDate issueDate;

    private LocalDate dueDate;

    private double fineAmount;

}
