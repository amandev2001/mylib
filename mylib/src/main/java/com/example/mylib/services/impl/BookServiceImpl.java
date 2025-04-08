package com.example.mylib.services.impl;

import com.example.mylib.dto.BookDTO;
import com.example.mylib.entities.Book;
import com.example.mylib.exceptions.ResourceNotFoundException;
import com.example.mylib.repository.BookRepo;
import com.example.mylib.services.books.BookService;
import com.example.mylib.services.Reservation.ReservationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepo bookRepo;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ReservationService reservationService;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final BooksImageServiceImpl imageService;

    @Override
    public String uploadCoverImage(MultipartFile file, String filename) {
        String fileUrl = null;

        if (file != null && !file.isEmpty()) {
            fileUrl = imageService.uploadImage(file, filename);
            logger.info("Image uploaded successfully. URL: {}", fileUrl);
        } else {
            logger.info("No picture uploaded, skipping file upload.");
        }
        return fileUrl;
    }

    @Override
    public Book saveBook(Book book) {
        if (book.getIsbn() != null && !book.getIsbn().trim().isEmpty()) {
            if (bookRepo.existsByIsbn(book.getIsbn())) {
                throw new IllegalArgumentException("A book with ISBN " + book.getIsbn() + " already exists.");
            }
        }
        return bookRepo.save(book);
    }

    @Override
    public BookDTO saveBookDto(BookDTO bookDto) {
        logger.debug("Processing book save request for ISBN: {}", bookDto.getIsbn());

        // Validate ISBN uniqueness
        if (bookDto.getIsbn() != null && !bookDto.getIsbn().trim().isEmpty()) {
            if (bookRepo.existsByIsbn(bookDto.getIsbn())) {
                logger.debug("Duplicate ISBN found: {}", bookDto.getIsbn());
                throw new IllegalArgumentException("A book with ISBN " + bookDto.getIsbn() + " already exists.");
            }
        }

        // Map BookDTO to Book
        Book newBook = modelMapper.map(bookDto, Book.class);

        // Ensure ISBN is explicitly set
        if (bookDto.getIsbn() != null) {
            newBook.setIsbn(bookDto.getIsbn());
            logger.debug("ISBN set on new book entity: {}", newBook.getIsbn());
        }

        // Save to database and map back to BookDTO
        Book savedBook = saveBook(newBook);
        logger.debug("Book saved successfully with ID: {}", savedBook.getId());
        return modelMapper.map(savedBook, BookDTO.class);
    }

    @Override
    public List<BookDTO> saveBookDtos(List<BookDTO> bookDtos) {
        List<Book> newBooks = bookDtos.stream().map(bookDTO -> modelMapper.map(bookDTO, Book.class))
                .toList();
        List<Book> savedBooks = bookRepo.saveAll(newBooks);
        return savedBooks.stream().map(book -> modelMapper.map(book, BookDTO.class)).toList();
    }

    @Override
    public Book getBookById(Long bookId) {
        return bookRepo.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found bookId: " + bookId));
    }

    @Override
    public List<BookDTO> getAllBookDtos() {
        List<Book> books = bookRepo.findAll();
        return books.stream().map(book -> modelMapper.map(book, BookDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public BookDTO getBookDtoById(Long bookId) {
        Book tempBook = bookRepo.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found bookId: " + bookId));
        return modelMapper.map(tempBook, BookDTO.class);
    }

    @Override
    public void deleteBookById(Long bookId) {
        bookRepo.delete(getBookById(bookId));
    }

    @Override
    public BookDTO updateBookById(Long bookId, BookDTO newBookDto) {
        try {
            Book existingBook = getBookById(bookId);

            // Check for ISBN uniqueness if changed
            String newIsbn = newBookDto.getIsbn();
            if (newIsbn != null && !newIsbn.trim().isEmpty() && !newIsbn.equals(existingBook.getIsbn())) {
                if (bookRepo.existsByIsbn(newIsbn.trim())) {
                    throw new IllegalArgumentException(
                            "Cannot update: A different book with ISBN " + newIsbn + " already exists.");
                }
            }

            int oldQuantity = existingBook.getQuantity();
            int newQuantity = newBookDto.getQuantity();

            // Map only non-null fields from DTO to entity
            modelMapper.map(newBookDto, existingBook); // Will skip null fields if config is set

            Book updatedBook = bookRepo.save(existingBook);

            logger.debug("Book '{}' updated. Quantity changed from {} to {}",
                    updatedBook.getTitle(), oldQuantity, newQuantity);

            if (newQuantity > oldQuantity && updatedBook.isAvailable()) {
                logger.debug("Processing reservations due to increased quantity for book '{}'", updatedBook.getTitle());
                try {
                    reservationService.assignBookToNextUser(bookId);
                } catch (Exception e) {
                    logger.error("Failed to process reservations for book '{}': {}", updatedBook.getTitle(),
                            e.getMessage());
                }
            }

            return modelMapper.map(updatedBook, BookDTO.class);
        } catch (Exception e) {
            logger.error("Error updating book with ID {}: {}", bookId, e.getMessage());
            throw new RuntimeException("Failed to update book: " + e.getMessage(), e);
        }
    }

    @Override
    public List<BookDTO> searchBooks(String query) {
        String searchQuery = "%" + query + "%";
        List<Book> books = bookRepo
                .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                        searchQuery, searchQuery, searchQuery);
        return books.stream()
                .map(book -> modelMapper.map(book, BookDTO.class))
                .collect(Collectors.toList());
    }

}
