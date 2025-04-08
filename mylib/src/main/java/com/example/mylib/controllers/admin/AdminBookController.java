package com.example.mylib.controllers.admin;

import com.example.mylib.dto.BookDTO;
import com.example.mylib.exceptions.ResourceNotFoundException;
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
    public ResponseEntity<?> saveBook(@RequestPart BookDTO bookDTO,
                                    @RequestParam(value = "file", required = false) MultipartFile coverImage) {
        try {
            logger.debug("Saving book with ISBN: {}", bookDTO.getIsbn());
            
            // If we have a cover image, set the URL before saving
            if (coverImage != null && !coverImage.isEmpty()) {
                String tempFileName = UUID.randomUUID().toString();
                String fileUrl = bookService.uploadCoverImage(coverImage, tempFileName);
                bookDTO.setCoverUrl(fileUrl);
                logger.debug("Cover image uploaded: {}", fileUrl);
            }
            
            // Save the book with all data including cover URL
            BookDTO createdBookDto = bookService.saveBookDto(bookDTO);
            logger.debug("Book saved with ID: {}", createdBookDto.getId());
            return ResponseEntity.ok(createdBookDto);
            
        } catch (IllegalArgumentException e) {
            // Handle validation errors (like duplicate ISBN)
            logger.debug("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        } catch (Exception e) {
            // Handle other unexpected errors
            logger.error("Error saving book", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while saving the book.");
        }
    }

    @PutMapping("/update/{bookId}")
    public ResponseEntity<?> updateBook(@PathVariable Long bookId,
                                      @RequestPart BookDTO bookDTO,
                                      @RequestParam(value = "file", required = false) MultipartFile coverImage) {
        try {
            logger.debug("Updating book ID: {} with ISBN: {}", bookId, bookDTO.getIsbn());

            if (coverImage != null && !coverImage.isEmpty()) {
                String tempFileName = UUID.randomUUID().toString();
                String fileUrl = bookService.uploadCoverImage(coverImage, tempFileName);
                bookDTO.setCoverUrl(fileUrl);
                logger.debug("New cover image uploaded: {}", fileUrl);
            }

            BookDTO updatedBook = bookService.updateBookById(bookId, bookDTO);
            logger.debug("Book updated successfully");
            return ResponseEntity.ok(updatedBook);

        } catch (IllegalArgumentException e) {
            // Handle validation errors (like duplicate ISBN)
            logger.debug("Validation error while updating book: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        } catch (
                ResourceNotFoundException e) {
            // Handle not found error
            logger.debug("Book not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            // Handle other unexpected errors
            logger.error("Error updating book: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while updating the book.");
        }
    }

    @DeleteMapping("/delete/{bookId}")
    public ResponseEntity<?> deleteBook(@PathVariable Long bookId) {
        try {
            bookService.deleteBookById(bookId);
            return ResponseEntity.ok().body(Map.of("message", "Book deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting book: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting the book: " + e.getMessage());
        }
    }

    // Book Reservation
}
