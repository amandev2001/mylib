package com.example.mylib.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookRequestDTO{
    private String title;
    private String author;
    private String category;
    private boolean available;
    private String publisher;
    private String language;
    private int quantity;
    private MultipartFile bookCover;

}
