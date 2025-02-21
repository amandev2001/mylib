package com.example.mylib.entities;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "book_reservation")
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

    @Enumerated(value = EnumType.STRING)
    private ReservationType status;

    private Integer reservations;
}
