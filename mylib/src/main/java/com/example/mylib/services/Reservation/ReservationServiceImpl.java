package com.example.mylib.services.Reservation;

import com.example.mylib.dto.ReservationDTO;
import com.example.mylib.entities.Book;
import com.example.mylib.entities.Reservation;
import com.example.mylib.enums.ReservationType;
import com.example.mylib.entities.Users;
import com.example.mylib.exceptions.ResourceNotFoundException;
import com.example.mylib.exceptions.DuplicateReservationException;
import com.example.mylib.repository.BookRepo;
import com.example.mylib.repository.BorrowRepo;
import com.example.mylib.repository.ReservationRepo;
import com.example.mylib.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.entities.BorrowRecord;
import com.example.mylib.enums.BorrowStatus;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepo reservationRepo;
    private final BorrowRepo borrowRepo;
    private final BookRepo bookRepo;
    private final UserRepo userRepo;

    private final ModelMapper modelMapper;

    private static final Logger logger = LoggerFactory.getLogger(ReservationServiceImpl.class);

    @Override
    @Transactional
    public Reservation createReservation(Long userId, Long bookId) {
        try {
            Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book Not Found!"));
            Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // check if book is available
            if (book.getQuantity() > 0) {
                throw new RuntimeException("Book is available no need to reserve!");
            }

            // Check for active reservations only
            Optional<Reservation> existingReservation = reservationRepo.findByUserAndBookAndStatus(user, book, ReservationType.PENDING);
            if(existingReservation.isPresent()){
                throw new DuplicateReservationException("User has already reserved this book.");
            }

            Reservation reservation = new Reservation();
            reservation.setUser(user);
            reservation.setBook(book);
            reservation.setStatus(ReservationType.PENDING);
            reservation.setCreatedAt(LocalDateTime.now());
            return reservationRepo.save(reservation);
        } catch (ResourceNotFoundException | DuplicateReservationException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create reservation: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void assignBookToNextUser(Long bookId) {
        try {
            // Get the book and verify it exists
            Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
            logger.info("Attempting to assign book '{}' (ID: {}) to next users. Current quantity: {}", 
                book.getTitle(), bookId, book.getQuantity());

            // Keep processing reservations while there are books available
            while (book.getQuantity() > 0) {
                // Get the next pending reservation
                List<Reservation> reservations = reservationRepo.findNextReservation(bookId);
                if (reservations.isEmpty()) {
                    logger.info("No more pending reservations found for book '{}'", book.getTitle());
                    break; // No more pending reservations
                }
                logger.info("Found {} pending reservations for book '{}'", reservations.size(), book.getTitle());

                Reservation nextReservation = reservations.get(0);
                Users nextUser = nextReservation.getUser();
                logger.info("Next user in queue: {} (ID: {})", nextUser.getEmail(), nextUser.getId());

                // Create a new borrow record for the next user
                BorrowRecord borrowRecord = new BorrowRecord();
                borrowRecord.setUser(nextUser);
                borrowRecord.setBook(book);
                borrowRecord.setStatus(BorrowStatus.PENDING);
                borrowRecord.setIssueDate(LocalDate.now());
                borrowRecord.setDueDate(LocalDate.now().plusDays(AppConstants.BORROW_DAYS_LIMIT));
                borrowRecord.setFromReservation(true);
                borrowRecord.setReservationCreatedAt(nextReservation.getCreatedAt());
                borrowRepo.save(borrowRecord);
                logger.info("Created borrow record for user {} with due date {} (from reservation created at {})", 
                    nextUser.getEmail(), borrowRecord.getDueDate(), nextReservation.getCreatedAt());

                // Update reservation status
                nextReservation.setStatus(ReservationType.CONFIRMED);
                reservationRepo.save(nextReservation);
                logger.info("Updated reservation status to CONFIRMED for user {}", nextUser.getEmail());

                // Update book quantity
                book.setQuantity(book.getQuantity() - 1);
                bookRepo.save(book);
                logger.info("Updated book quantity to {}", book.getQuantity());

                // Log the assignment
                logger.info("Successfully assigned book '{}' to user: {}", book.getTitle(), nextUser.getEmail());
            }

            logger.info("Finished processing reservations for book '{}'. Final quantity: {}", 
                book.getTitle(), book.getQuantity());
        } catch (ResourceNotFoundException e) {
            logger.error("Book not found with ID: {}", bookId);
            throw e;
        } catch (Exception e) {
            logger.error("Failed to assign book to next user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to assign book to next user: " + e.getMessage());
        }
    }

    @Override
    public List<ReservationDTO> getUsersReservations(Long userId) {
        return reservationRepo
                .findByUserId(userId)
                .stream()
                .map(reservation -> {
                    ReservationDTO dto = modelMapper.map(reservation, ReservationDTO.class);
                    dto.setUserId(reservation.getUser().getId());
                    dto.setBookId(reservation.getBook().getId());
                    dto.setBookTitle(reservation.getBook().getTitle());
                    dto.setUserName(reservation.getUser().getName());
                    return dto;
                })
                .toList();
    }

    @Override
    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepo.findById(reservationId).orElseThrow(() -> new ResourceNotFoundException("Reservation not found."));
        reservation.setStatus(ReservationType.CANCELED);
        reservationRepo.save(reservation);
    }

    @Override
    public List<ReservationDTO> getAllReservations() {
        return reservationRepo.findAll().stream()
                .map(reservation -> {
                    ReservationDTO dto = modelMapper.map(reservation, ReservationDTO.class);
                    dto.setUserId(reservation.getUser().getId());
                    dto.setBookId(reservation.getBook().getId());
                    dto.setBookTitle(reservation.getBook().getTitle());
                    dto.setUserName(reservation.getUser().getName());
                    return dto;
                })
                .toList();
    }

    @Override
    public void completeReservation(Long reservationId) {
        try {
            // Find the reservation
            Reservation reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

            // Verify the reservation is in CONFIRMED state
            if (reservation.getStatus() != ReservationType.CONFIRMED) {
                throw new RuntimeException("Only confirmed reservations can be completed. Current status: " + reservation.getStatus());
            }

            // Update reservation status to COMPLETED
            reservation.setStatus(ReservationType.COMPLETED);
            reservationRepo.save(reservation);

            logger.info("Completed reservation {} for user {} and book {}", 
                reservationId, 
                reservation.getUser().getEmail(), 
                reservation.getBook().getTitle());
        } catch (ResourceNotFoundException e) {
            logger.error("Failed to complete reservation {}: {}", reservationId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Failed to complete reservation {}: {}", reservationId, e.getMessage());
            throw new RuntimeException("Failed to complete reservation: " + e.getMessage());
        }
    }
}
