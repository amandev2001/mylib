package com.example.mylib.controllers.book;

import com.example.mylib.dto.ApiResponse;
import com.example.mylib.dto.BorrowRecordDTO;
import com.example.mylib.entities.BorrowRecord;
import com.example.mylib.exceptions.ResourceNotFoundException;
import com.example.mylib.services.borrow.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    //  User requests to borrow a book (Admin must approve)
    @PostMapping("/request/{userId}/{bookId}")
    public ResponseEntity<?> requestBorrow(@PathVariable Long userId, @PathVariable Long bookId) {
        try {
            BorrowRecord borrowRecord = borrowService.requestBorrow(userId, bookId);
            return ResponseEntity.ok("Borrow request submitted. Waiting for admin approval.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    //  Admin approves the borrow request
    @PutMapping("/admin/approve/{borrowRequestId}")
    public ResponseEntity<?> approveBorrowRequest(@PathVariable Long borrowRequestId) {
        try {
            BorrowRecord approvedRecord = borrowService.approveBorrowRequest(borrowRequestId);
            return ResponseEntity.ok(new ApiResponse(true, "Book borrow request approved successfully."));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "An unexpected error occurred. Please try again later."));
        }
    }

    //  User requests to return a book (Admin must approve)
    @PutMapping("/return/request/{borrowRecordId}")
    public ResponseEntity<?> requestReturn(@PathVariable Long borrowRecordId) {
        try {
            borrowService.requestReturn(borrowRecordId);
            return ResponseEntity.ok("Return request submitted. Waiting for admin approval.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    //  Admin approves the book return
    @PutMapping("/admin/return/approve/{borrowRecordId}")
    public ResponseEntity<?> approveReturnRequest(@PathVariable Long borrowRecordId) {
        try {
            borrowService.approveReturnRequest(borrowRecordId);
            return ResponseEntity.ok("Book return approved.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    //  Get borrow history for a specific user (User & Admin)
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<BorrowRecordDTO>> getBorrowHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getBorrowHistory(userId));
    }

    //  Get active borrows for a specific user (User & Admin)
    @GetMapping("/active/{userId}")
    public ResponseEntity<List<BorrowRecordDTO>> getActiveBorrows(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getActiveBorrows(userId));
    }

    //  Get all borrow records (Admin only)
    @GetMapping("/admin/all")
    public ResponseEntity<List<BorrowRecordDTO>> getAllBorrows() {
        return ResponseEntity.ok(borrowService.getAllBorrows());
    }

    //  Get borrow record by ID (User & Admin)
    @GetMapping("/{borrowRecordId}")
    public ResponseEntity<BorrowRecord> getBorrowRecordById(@PathVariable Long borrowRecordId) {
        return ResponseEntity.ok(borrowService.getBorrowRecordById(borrowRecordId));
    }

    // Get borrow history for a specific book (Admin only)
    @GetMapping("/book/{bookId}/history")
    public ResponseEntity<List<BorrowRecordDTO>> getBookBorrowHistory(@PathVariable Long bookId) {
        List<BorrowRecord> borrowRecords = borrowService.getBookBorrowHistory(bookId);
        List<BorrowRecordDTO> dtos = borrowRecords.stream()
            .map(record -> {
                BorrowRecordDTO dto = new BorrowRecordDTO();
                dto.setId(record.getId());
                dto.setUserName(record.getUser().getName());
                dto.setBookId(record.getBook().getId());
                dto.setBookTitle(record.getBook().getTitle());
                dto.setIssueDate(record.getIssueDate());
                dto.setDueDate(record.getDueDate());
                dto.setStatus(record.getStatus());
                return dto;
            })
            .toList();
        return ResponseEntity.ok(dtos);
    }

    // Cancel a borrow request
    @PutMapping("/cancel/request/{borrowRequestId}")
    public ResponseEntity<?> cancelBorrowRequest(@PathVariable Long borrowRequestId) {
        try {
            borrowService.cancelBorrowRequest(borrowRequestId);
            return ResponseEntity.ok("Borrow request cancelled successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Cancel a return request
    @PutMapping("/cancel/return/{borrowRecordId}")
    public ResponseEntity<?> cancelReturnRequest(@PathVariable Long borrowRecordId) {
        try {
            borrowService.cancelReturnRequest(borrowRecordId);
            return ResponseEntity.ok("Return request cancelled successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Update a borrow record (admin only)
    @PutMapping("/admin/update/{borrowRecordId}")
    public ResponseEntity<?> updateBorrowRecord(
            @PathVariable Long borrowRecordId,
            @RequestBody BorrowRecordDTO updateData) {
        try {
            BorrowRecord updatedRecord = borrowService.updateBorrowRecord(borrowRecordId, updateData);
            return ResponseEntity.ok(updatedRecord);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}

