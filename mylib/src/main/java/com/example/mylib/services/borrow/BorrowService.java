package com.example.mylib.services.Reservation;

import com.example.mylib.dto.BorrowRecordDTO;
import com.example.mylib.entities.BorrowRecord;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface BorrowService {

    // User can request a book, but admin must approve before borrowing
    BorrowRecord requestBorrow(Long userId, Long bookId); // User

    // Admin approves the borrow request
    BorrowRecord approveBorrowRequest(Long borrowRequestId); // Admin

    // User requests to return the book, but admin must approve the return
    void requestReturn(Long borrowRecordId); // User

    // Admin approves the book return
    void approveReturnRequest(Long borrowRecordId); // Admin

    // Both User and Admin can see borrow history of a specific user
    List<BorrowRecord> getBorrowHistory(Long userId); // User & Admin

    // Only Admin can see all borrow records in the library
    public List<BorrowRecordDTO> getAllBorrows(); // Admin

    // Get a specific borrow record (for both User & Admin)
    BorrowRecord getBorrowRecordById(Long borrowRecordId); // User & Admin
}
