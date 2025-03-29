package com.example.mylib.services.borrow;

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

    // Get active borrows for a specific user (User & Admin)
    List<BorrowRecord> getActiveBorrows(Long userId); // User & Admin

    // Only Admin can see all borrow records in the library
    public List<BorrowRecordDTO> getAllBorrows(); // Admin

    // Get a specific borrow record (for both User & Admin)
    BorrowRecord getBorrowRecordById(Long borrowRecordId); // User & Admin

    // Get borrow history for a specific book (Admin only)
    List<BorrowRecord> getBookBorrowHistory(Long bookId); // Admin

    // Cancel a borrow request
    void cancelBorrowRequest(Long borrowRequestId);

    // Cancel a return request
    void cancelReturnRequest(Long borrowRecordId);

    // Update a borrow record
    BorrowRecord updateBorrowRecord(Long borrowRecordId, BorrowRecordDTO updateData);
}
