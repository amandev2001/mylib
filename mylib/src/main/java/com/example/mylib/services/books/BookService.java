package com.example.mylib.services.books;

import com.example.mylib.dto.BookDTO;
import com.example.mylib.entities.Book;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public interface BookService {
//    Add, update, delete, search books

    String uploadCoverImage(MultipartFile file, String filename);

    Book saveBook(Book book);

    BookDTO saveBookDto(BookDTO bookDto);

    List<BookDTO> saveBookDtos(List<BookDTO> bookDtos);

    Book getBookById(Long bookId);

    List<BookDTO> getAllBookDtos();

    BookDTO getBookDtoById(Long bookId);

    void deleteBookById(Long bookId);

    BookDTO updateBookById(Long bookId, BookDTO newBookDto);

    List<BookDTO> searchBooks(String query);
}
