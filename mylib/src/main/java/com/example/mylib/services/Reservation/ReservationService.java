package com.example.mylib.services.Reservation;

import com.example.mylib.dto.ReservationDTO;
import com.example.mylib.entities.Reservation;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ReservationService {
    Reservation createReservation(Long userId, Long bookId);

    void assignBookToNextUser(Long bookId);

    List<ReservationDTO> getUsersReservations(Long userId);

    void cancelReservation(Long reservationId);

    List<ReservationDTO> getAllReservations();

    void completeReservation(Long reservationId);
}
