package com.example.mylib.controllers.book;

import com.example.mylib.dto.BookDTO;
import com.example.mylib.services.books.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/book")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping("/{bookId}")
    public ResponseEntity<BookDTO> getBook(@PathVariable Long bookId) {
        System.out.println(bookId);
        BookDTO bookDTO = bookService.getBookDtoById(bookId);
        return ResponseEntity.ok(bookDTO);
    }

    @GetMapping("/all-books")
    public ResponseEntity<?> getAllBooks() {
        try {
            List<BookDTO> bookDtos = bookService.getAllBookDtos();
            return ResponseEntity.status(HttpStatus.OK).body(bookDtos);
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Cannot fetch books");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(@RequestParam String query) {
        try {
            List<BookDTO> bookDtos = bookService.searchBooks(query);
            return ResponseEntity.ok(bookDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error searching books: " + e.getMessage());
        }
    }

    // search books


}
