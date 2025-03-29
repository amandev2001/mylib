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
    Logger logger = LoggerFactory.getLogger(this.getClass());
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
        return bookRepo.save(book);
    }

    @Override
    public BookDTO saveBookDto(BookDTO bookDto) {
        // Map BookDTO to Book
        Book newBook = modelMapper.map(bookDto, Book.class);

        // Save to database and map back to BookDTO
        Book savedBook = saveBook(newBook);
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
        return bookRepo.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book not found bookId: " + bookId));
    }

    @Override
    public List<BookDTO> getAllBookDtos() {
        List<Book> books = bookRepo.findAll();
        return books.stream().map(book -> modelMapper.map(book, BookDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public BookDTO getBookDtoById(Long bookId) {
        Book tempBook = bookRepo.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book not found bookId: " + bookId));
        return modelMapper.map(tempBook, BookDTO.class);
    }

    @Override
    public void deleteBookById(Long bookId) {
        bookRepo.delete(getBookById(bookId));
    }

    @Override
    public BookDTO updateBookById(Long bookId, BookDTO newBookDto) {
        try {
            // Get the existing book
            Book existingBook = getBookById(bookId);
            
            // Store old quantity for comparison
            int oldQuantity = existingBook.getQuantity();
            logger.info("Updating book '{}' (ID: {}). Old quantity: {}, New quantity: {}", 
                existingBook.getTitle(), bookId, oldQuantity, newBookDto.getQuantity());
            
            // Update only the fields that are present in the DTO
            if (newBookDto.getTitle() != null) existingBook.setTitle(newBookDto.getTitle());
            if (newBookDto.getAuthor() != null) existingBook.setAuthor(newBookDto.getAuthor());
            if (newBookDto.getCategory() != null) existingBook.setCategory(newBookDto.getCategory());
            existingBook.setAvailable(newBookDto.isAvailable());
            if (newBookDto.getPublisher() != null) existingBook.setPublisher(newBookDto.getPublisher());
            if (newBookDto.getLanguage() != null) existingBook.setLanguage(newBookDto.getLanguage());
            existingBook.setQuantity(newBookDto.getQuantity());
            if (newBookDto.getCoverUrl() != null) existingBook.setCoverUrl(newBookDto.getCoverUrl());
            
            // Handle edition and publication date
            if (newBookDto.getEdition() != null) {
                existingBook.setEdition(newBookDto.getEdition());
            }
            if (newBookDto.getPublicationDate() != null) {
                existingBook.setPublicationDate(newBookDto.getPublicationDate());
            }
            if (newBookDto.getPageCount() != null) {
                existingBook.setPageCount(newBookDto.getPageCount());
            }

            // Save the updated book
            Book updatedBook = saveBook(existingBook);
            logger.info("Book '{}' updated successfully. New quantity: {}", 
                updatedBook.getTitle(), updatedBook.getQuantity());

            // If there are books available, try to assign to next users
            if (updatedBook.getQuantity() > 0) {
                logger.info("Book '{}' has {} copies available. Attempting to assign to next users.", 
                    updatedBook.getTitle(), updatedBook.getQuantity());
                try {
                    reservationService.assignBookToNextUser(bookId);
                    logger.info("Successfully processed reservations for book '{}'", updatedBook.getTitle());
                } catch (Exception e) {
                    logger.error("Failed to process reservations for book '{}'. Error: {}", 
                        updatedBook.getTitle(), e.getMessage(), e);
                }
            } else {
                logger.info("No books available for '{}'. Skipping reservation processing.", 
                    updatedBook.getTitle());
            }

            return modelMapper.map(updatedBook, BookDTO.class);
        } catch (Exception e) {
            logger.error("Error updating book: ", e);
            throw new RuntimeException("Failed to update book: " + e.getMessage());
        }
    }

    @Override
    public List<BookDTO> searchBooks(String query) {
        String searchQuery = "%" + query + "%";
        List<Book> books = bookRepo.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                searchQuery, searchQuery, searchQuery);
        return books.stream()
                .map(book -> modelMapper.map(book, BookDTO.class))
                .collect(Collectors.toList());
    }


}

