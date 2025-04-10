package com.example.mylib.services.impl;

import com.example.mylib.entities.BorrowRecord;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.services.fine.FineCalculator;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;

@Service
public class FineCalculatorImpl implements FineCalculator {
    @Override
    public double calculateFine(BorrowRecord borrowRecord) {
        if (borrowRecord.getDueDate().isBefore(borrowRecord.getReturnDate())) {
            long overdueDays = ChronoUnit.DAYS.between(
                    borrowRecord.getDueDate(),
                    borrowRecord.getReturnDate()
            );
            return overdueDays * AppConstants.FINE_PER_DAY;
        }
        return 0.0;
    }
}