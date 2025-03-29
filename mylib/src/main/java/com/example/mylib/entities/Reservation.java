package com.example.mylib.entities;

import com.example.mylib.enums.ReservationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_reservation")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Reservation {

    @Id
    @Column(name = "reservation_id", length = 36, updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ReservationType status;

    private Integer reservations;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // Timestamp for FIFO or Queue

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
