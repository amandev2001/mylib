package com.example.mylib.entities;

import com.example.mylib.enums.BorrowStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_records")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BorrowRecord {

    @Id
    @Column(name = "borrow_record_id", length = 36, updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private Users user;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private double fineAmount;

    @Enumerated(EnumType.STRING)
    private BorrowStatus status;

    @Column(name = "is_from_reservation")
    private Boolean fromReservation = false;

    @Column(name = "reservation_created_at")
    private LocalDateTime reservationCreatedAt;

    // Custom getter/setter for isFromReservation to match the field name
    public boolean isFromReservation() {
        return fromReservation != null && fromReservation;
    }

    public void setFromReservation(boolean fromReservation) {
        this.fromReservation = fromReservation;
    }
}
