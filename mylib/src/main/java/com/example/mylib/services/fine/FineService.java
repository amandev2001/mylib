package com.example.mylib.services.fine;

import com.example.mylib.dto.FineDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface FineService {

    double calculateFine(Long borrowRecordId);

    double getTotalFineForUser(Long userId);

    void payAllFineByUser(Long userId);

    void payFine(Long borrowRecordId);

    boolean isFinePaid(Long borrowRecordId);

    boolean isAllFinePaidForUser(Long userId);

    List<FineDto> getAllFineByUser(Long userId);

    List<FineDto> getAllFines();
}
