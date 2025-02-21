package com.example.mylib.entities;

import com.example.mylib.payload.AppConstants;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Users {

    @Id
    @Column(name = "user_id", length = 36, updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @Column(name = "user_email")
    private String email;

    @Column(name = "user_name")
    private String name;

    private String password;

    private String about;

    private String profilePic = "static/images/default.png";

    private String PhoneNumber;

    private boolean enabled = false;

    private String emailToken;
    private boolean emailVerified=false;
    private boolean phoneVerified=false;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> roleList = new ArrayList<>();

    @Enumerated(value = EnumType.STRING)
    private Providers provider = Providers.SELF;

    private String providerId;

    @OneToMany(mappedBy = "user" , cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<BorrowRecord> borrowRecords = new ArrayList<>();


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reservation> reservations = new ArrayList<>();

    public boolean canReserve() {
        return reservations.size() < AppConstants.MAX_BOOK_RESERVATION;
    }
}

/*
@OneToMany(mappedBy = "user") → A single user can have multiple borrow records.
cascade = CascadeType.ALL → If a user is deleted, their borrow records are also deleted.
orphanRemoval = true → If a borrow record is removed from the list, it is also deleted from the database.
*/