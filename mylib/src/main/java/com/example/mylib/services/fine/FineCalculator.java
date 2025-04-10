package com.example.mylib.services.fine;

import com.example.mylib.entities.BorrowRecord;
import org.springframework.stereotype.Service;

@Service
public interface FineCalculator {
    double calculateFine(BorrowRecord borrowRecord);
}

