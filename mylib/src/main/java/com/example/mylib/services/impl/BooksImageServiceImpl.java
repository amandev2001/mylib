package com.example.mylib.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.services.books.BooksImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class BooksImageImpl implements BooksImage {


    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile imageFile, String fileName) {
        try{
            byte[] data = imageFile.getBytes();
            var response = cloudinary.uploader().upload(data, ObjectUtils.asMap("public_id", fileName));
            return response.get("url").toString();
        } catch (
                IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String getUrlByPublicId(String publicId) {
        return cloudinary.url().transformation(
            new Transformation<>()
                    .height(AppConstants.CONTACT_IMAGE_HEIGHT)
                    .width(AppConstants.CONTACT_IMAGE_WIDTH)
                    .crop(AppConstants.CONTACT_IMAGE_CROP))
                .generate(publicId);
    }
}
