package com.example.mylib.services.users;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface UserImage {
    public String uploadImage(MultipartFile imageFile, String fileName);
    public String getUrlByPublicId(String publicId);
} 