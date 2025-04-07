package com.example.mylib.services.borrow;

import com.example.mylib.dto.BorrowRecordDTO;
import com.example.mylib.entities.Book;
import com.example.mylib.entities.BorrowRecord;
import com.example.mylib.enums.BorrowStatus;
import com.example.mylib.entities.Users;
import com.example.mylib.exceptions.ResourceNotFoundException;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.repository.BookRepo;
import com.example.mylib.repository.BorrowRepo;
import com.example.mylib.repository.UserRepo;
import com.example.mylib.services.Reservation.ReservationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BorrowServiceImpl implements BorrowService {

    private final BorrowRepo borrowRepo;
    private final UserRepo userRepo;
    private final BookRepo bookRepo;
    private final ReservationService reservationService;
    private final ModelMapper modelMapper;

    @Override
    public boolean isEligibleToBorrow(Long userId, Long bookId) {
        List<BorrowRecord> existingRecords = borrowRepo.findByUserIdAndBookId(userId, bookId);
        return !existingRecords.stream()
                .anyMatch(record -> record.getStatus() == BorrowStatus.PENDING || 
                                  record.getStatus() == BorrowStatus.BORROWED || 
                                  record.getStatus() == BorrowStatus.RETURN_PENDING);
    }

    @Override
    public BorrowRecord requestBorrow(Long userId, Long bookId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found!"));

        if (book.getQuantity() <= 0) {
            throw new RuntimeException("Book is out of stock. Consider reserving it.");
        }

        if (!isEligibleToBorrow(userId, bookId)) {
            throw new RuntimeException("You already have an active request or borrowed this book. Please return it first.");
        }

        BorrowRecord borrowRecord = new BorrowRecord();
        borrowRecord.setUser(user);
        borrowRecord.setBook(book);
        borrowRecord.setStatus(BorrowStatus.PENDING); // Now pending approval

        return borrowRepo.save(borrowRecord);
    }

    @Override
    @Transactional
    public BorrowRecord approveBorrowRequest(Long borrowRequestId) {
        BorrowRecord borrowRecord = borrowRepo.findById(borrowRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found."));

        if (borrowRecord.getStatus() != BorrowStatus.PENDING) {
            throw new RuntimeException("This request is already processed.");
        }

        // Check if there are any pending reservation-based requests for this book
        List<BorrowRecord> pendingReservationRequests = borrowRepo.findByBookIdAndStatusAndFromReservation(
            borrowRecord.getBook().getId(), 
            BorrowStatus.PENDING, 
            Boolean.TRUE
        );

        // If this is not a reservation-based request and there are pending reservation requests,
        // throw an error
        if (!borrowRecord.isFromReservation() && !pendingReservationRequests.isEmpty()) {
            throw new RuntimeException("Cannot approve direct borrow request while there are pending reservation requests for this book.");
        }

        // Set issue date and due date only when approving the request
        borrowRecord.setIssueDate(LocalDate.now());
        borrowRecord.setDueDate(LocalDate.now().plusDays(AppConstants.BORROW_DAYS_LIMIT));
        
        // Approve borrow request
        borrowRecord.setStatus(BorrowStatus.BORROWED);

        // Reduce book quantity with optimistic locking
        Book book = borrowRecord.getBook();
        if (book.getQuantity() <= 0) {
            throw new RuntimeException("Book is no longer available for borrowing. Please try again or contact the librarian.");
        }
        
        try {
            book.setQuantity(book.getQuantity() - 1);
            bookRepo.save(book);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update book quantity. The book may have been borrowed by someone else. Please try again.");
        }

        return borrowRepo.save(borrowRecord);
    }

    @Override
    public void requestReturn(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowRepo.findById(borrowRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found."));

        if (borrowRecord.getStatus() != BorrowStatus.BORROWED) {
            throw new RuntimeException("This book is not currently borrowed.");
        }

        borrowRecord.setStatus(BorrowStatus.RETURN_PENDING); // Waiting for admin approval
        borrowRepo.save(borrowRecord);
    }

    @Override
    public void approveReturnRequest(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowRepo.findById(borrowRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found."));

        if (borrowRecord.getStatus() != BorrowStatus.RETURN_PENDING) {
            throw new RuntimeException("This book is not marked for return.");
        }

        // Calculate fine if overdue
        if (borrowRecord.getDueDate().isBefore(LocalDate.now())) {
            long overdueDays = ChronoUnit.DAYS.between(borrowRecord.getDueDate(), LocalDate.now());
            double fineAmount = overdueDays * AppConstants.FINE_PER_DAY;
            borrowRecord.setFineAmount(fineAmount);
        }

        // Mark as returned and set return date
        borrowRecord.setStatus(BorrowStatus.RETURNED);
        borrowRecord.setReturnDate(LocalDate.now());
        borrowRepo.save(borrowRecord);

        // Increase book quantity
        Book book = borrowRecord.getBook();
        book.setQuantity(book.getQuantity() + 1);
        bookRepo.save(book);

        // Assign book to next reserved user
        reservationService.assignBookToNextUser(book.getId());
    }

    @Override
    public List<BorrowRecord> getBorrowHistory(Long userId) {
        return borrowRepo.findByUserId(userId);
    }

    @Override
    public List<BorrowRecord> getActiveBorrows(Long userId) {
        return borrowRepo.findByUserIdAndStatus(userId, BorrowStatus.BORROWED);
    }

    @Override
    public List<BorrowRecordDTO> getAllBorrows() {
        List<BorrowRecord> borrowRecords = borrowRepo.findAll();
        return borrowRecords.stream().map(borrowRecord -> {
            BorrowRecordDTO dto = modelMapper.map(borrowRecord, BorrowRecordDTO.class);
            dto.setUserName(borrowRecord.getUser().getName());
            dto.setBookId(borrowRecord.getBook().getId());
            dto.setBookTitle(borrowRecord.getBook().getTitle());
            dto.setReturnDate(borrowRecord.getReturnDate());
            dto.setFineAmount(borrowRecord.getFineAmount());
            return dto;
        }).toList();
    }

    @Override
    public BorrowRecord getBorrowRecordById(Long borrowRecordId) {
        return borrowRepo.findById(borrowRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found."));
    }

    @Override
    public List<BorrowRecord> getBookBorrowHistory(Long bookId) {
        return borrowRepo.findByBookId(bookId);
    }

    @Override
    public void cancelBorrowRequest(Long borrowRequestId) {
        BorrowRecord borrowRecord = borrowRepo.findById(borrowRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found."));

        if (borrowRecord.getStatus() != BorrowStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be cancelled.");
        }

        borrowRepo.delete(borrowRecord);
    }

    @Override
    public void cancelReturnRequest(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowRepo.findById(borrowRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found."));

        if (borrowRecord.getStatus() != BorrowStatus.RETURN_PENDING) {
            throw new RuntimeException("Only pending return requests can be cancelled.");
        }

        borrowRecord.setStatus(BorrowStatus.BORROWED);
        borrowRepo.save(borrowRecord);
    }

    @Override
    public BorrowRecord updateBorrowRecord(Long borrowRecordId, BorrowRecordDTO updateData) {
        BorrowRecord borrowRecord = borrowRepo.findById(borrowRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found."));

        // Only allow updating certain fields
        if (updateData.getIssueDate() != null) {
            borrowRecord.setIssueDate(updateData.getIssueDate());
        }
        if (updateData.getDueDate() != null) {
            borrowRecord.setDueDate(updateData.getDueDate());
        }
        if (updateData.getFineAmount() > 0) {
            borrowRecord.setFineAmount(updateData.getFineAmount());
        }

        return borrowRepo.save(borrowRecord);
    }
}
