package com.example.mylib.controllers.bookReservation;

import com.example.mylib.dto.ReservationDTO;
import com.example.mylib.services.Reservation.ReservationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservation")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final ModelMapper modelMapper;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReservations(@PathVariable Long userId){
        try{
            return ResponseEntity.ok(reservationService.getUsersReservations(userId));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Not able to find reservations.");
        }
    }

    @PutMapping("/user/{reservationId}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long reservationId){
        try{
            reservationService.cancelReservation(reservationId);
            return ResponseEntity.ok("Reservation CANCELED");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Reservation not deleted.");
        }
    }

    @PostMapping("/user/{userId}/{bookId}")
    public ResponseEntity<?> reserveBook(@PathVariable Long bookId, @PathVariable Long userId ){
        try{
            reservationService.createReservation(userId,bookId);
            return ResponseEntity.status(HttpStatus.CREATED).body("Reservation request created.");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Can't able to create Reservation request.");
        }
    }
}
