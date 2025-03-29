package com.example.mylib.repository;

import com.example.mylib.entities.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepo extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
        String title, String author, String category);
}
