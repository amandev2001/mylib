package com.example.mylib.controllers.admin;

import com.example.mylib.dto.BookDTO;
import com.example.mylib.services.books.BookService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/book")
@RequiredArgsConstructor
public class AdminBookController {

    @Autowired
    private BookService bookService;


    Logger logger = LoggerFactory.getLogger(this.getClass());


    @PostMapping("/add")
    public ResponseEntity<BookDTO> saveBook(@RequestPart BookDTO bookDTO,
                                            @RequestParam(value = "file", required = false) MultipartFile coverImage) {
        try {
            logger.info("Attempting to save book: {}", bookDTO);
            
            // If we have a cover image, set the URL before saving
            if (coverImage != null && !coverImage.isEmpty()) {
                // Generate a temporary ID for the file name
                String tempFileName = UUID.randomUUID().toString();
                String fileUrl = bookService.uploadCoverImage(coverImage, tempFileName);
                bookDTO.setCoverUrl(fileUrl);
                logger.info("Cover image uploaded successfully. URL: {}", fileUrl);
            }
            
            // Save the book with all data including cover URL
            BookDTO createdBookDto = bookService.saveBookDto(bookDTO);
            logger.info("Book saved successfully with ID: {}", createdBookDto.getId());

            return ResponseEntity.ok(createdBookDto);
        } catch (Exception e) {
            logger.error("Error saving book: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    //    @PostMapping("/add-multiple")
//    public ResponseEntity<?> addMultipleBooks(@RequestBody List<BookDTO> bookDTOS) {
//        try {
//            List<BookDTO> savedBooks = bookService.saveBookDtos(bookDTOS);
//            if (savedBooks == null || savedBooks.isEmpty()) {
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Book could not be added please try again.");
//            }
//            return ResponseEntity.status(HttpStatus.OK).body(savedBooks);
//        } catch (
//                Exception e) {
//            return ResponseEntity
//                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("An error occur during adding books. " + e.getMessage());
//        }
//    }
    @PutMapping("/update/{bookId}")
    public ResponseEntity<?> updateBook(
            @PathVariable Long bookId,
            @RequestPart BookDTO bookDTO,
            @RequestParam(value = "file", required = false) MultipartFile coverImage) {
        try {
            // Update the book
            BookDTO updatedBook = bookService.updateBookById(bookId, bookDTO);

            // Upload new cover image if present
            if (coverImage != null && !coverImage.isEmpty()) {
                String fileUrl = bookService.uploadCoverImage(coverImage, String.valueOf(bookId));
                updatedBook.setCoverUrl(fileUrl);
                updatedBook = bookService.updateBookById(bookId, updatedBook);
            }

            if (updatedBook == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Book could not be updated please try again.");
            }
            return ResponseEntity.status(HttpStatus.OK).body(updatedBook);
        } catch (Exception e) {
            logger.error("Error updating book: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the book: " + e.getMessage());
        }
    }

    // Book Reservation
}
