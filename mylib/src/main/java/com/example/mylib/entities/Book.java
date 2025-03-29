package com.example.mylib.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "library_books")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Book {

    @Id
    @Column(name = "book_id", length = 36, updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @Column(length = 500)
    private String title;

    @Column(length = 1000)
    private String author;

    @Column(length = 255)
    private String category;

    private boolean available;

    @Column(length = 500)
    private String publisher;

    private Year edition;

    @Column(length = 100)
    private String language;

    private LocalDate publicationDate;

    @Column(length = 1000)
    private String coverUrl;

    private int quantity;// primitive type for default value 0 and null not allowed.

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer pageCount;

    @Column(length = 100)
    private String price;

    @Column(length = 255)
    private String location;

    @Version
    private Long version;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<BorrowRecord> borrowRecords = new ArrayList<>();

}
