package com.example.mylib.repository;

import com.example.mylib.entities.BorrowRecord;
import com.example.mylib.enums.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRepo extends JpaRepository<BorrowRecord,Long> {
    List<BorrowRecord> findByUserId(Long userId);

    List<BorrowRecord> findByUserIdAndStatus(Long userId, BorrowStatus borrowStatus);

    List<BorrowRecord> findByUserIdAndBookId(Long userId, Long bookId);

    List<BorrowRecord> findByBookId(Long bookId);

    List<BorrowRecord> findByBookIdAndStatusAndFromReservation(Long bookId, BorrowStatus status, Boolean fromReservation);
}
