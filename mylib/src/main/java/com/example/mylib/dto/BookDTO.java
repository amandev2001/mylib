package com.example.mylib.dto;

import com.example.mylib.entities.BorrowRecord;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.Year;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookDTO {

    private Long id;
    private String title;
    private String author;
    private String category;
    private boolean available;
    private String publisher;
    private String isbn;
    private Year edition;
    private String language;
    private LocalDate publicationDate;
    private int quantity;
    private String coverUrl;
    private Integer pageCount;
    private String price;
    private String location;
}
