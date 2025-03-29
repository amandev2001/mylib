package com.example.mylib.services.Reservation;

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
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

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
    public BorrowRecord requestBorrow(Long userId, Long bookId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found!"));

        if (book.getQuantity() <= 0) {
            throw new RuntimeException("Book is out of stock. Consider reserving it.");
        }

        BorrowRecord borrowRecord = new BorrowRecord();
        borrowRecord.setUser(user);
        borrowRecord.setBook(book);
        borrowRecord.setIssueDate(LocalDate.now());
        borrowRecord.setDueDate(LocalDate.now().plusDays(AppConstants.BORROW_DAYS_LIMIT));
        borrowRecord.setStatus(BorrowStatus.PENDING); // Now pending approval

        return borrowRepo.save(borrowRecord);
    }

    @Override
    public BorrowRecord approveBorrowRequest(Long borrowRequestId) {
        BorrowRecord borrowRecord = borrowRepo.findById(borrowRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found."));

        if (borrowRecord.getStatus() != BorrowStatus.PENDING) {
            throw new RuntimeException("This request is already processed.");
        }

        // Approve borrow request
        borrowRecord.setStatus(BorrowStatus.BORROWED);

        // Reduce book quantity
        Book book = borrowRecord.getBook();
        book.setQuantity(book.getQuantity() - 1);
        bookRepo.save(book);

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

        // Mark as returned
        borrowRecord.setStatus(BorrowStatus.RETURNED);
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
    public List<BorrowRecordDTO> getAllBorrows() {
        List<BorrowRecord> borrowRecords = borrowRepo.findAll();
        return borrowRecords.stream().map(borrowRecord -> modelMapper.map(borrowRecord,BorrowRecordDTO.class)).toList();
    }

    @Override
    public BorrowRecord getBorrowRecordById(Long borrowRecordId) {
        return borrowRepo.findById(borrowRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found."));
    }
}
