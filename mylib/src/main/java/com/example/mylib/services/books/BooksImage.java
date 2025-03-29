package com.example.mylib.services.books;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface BooksImage {
    public String uploadImage(MultipartFile imageFile, String fileName);
    public String getUrlByPublicId(String publicId);
}
