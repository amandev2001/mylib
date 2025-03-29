package com.example.mylib.repository;

import com.example.mylib.entities.Book;
import com.example.mylib.entities.Reservation;
import com.example.mylib.entities.Users;
import com.example.mylib.enums.ReservationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepo extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<Reservation> findNextReservation(@Param("bookId") Long bookId);

    List<Reservation> findByUserId(Long userId);

    Optional<Reservation> findByUserAndBook(Users user, Book book);

    Optional<Reservation> findByUserAndBookAndStatus(Users user, Book book, ReservationType status);
}
