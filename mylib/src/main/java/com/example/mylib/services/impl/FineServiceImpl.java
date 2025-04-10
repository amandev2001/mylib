package com.example.mylib.services.impl;

import com.example.mylib.dto.BorrowRecordDTO;
import com.example.mylib.dto.FineDto;
import com.example.mylib.entities.BorrowRecord;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.services.borrow.BorrowService;
import com.example.mylib.services.fine.FineCalculator;
import com.example.mylib.services.fine.FineService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.ui.ModelMap;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FineServiceImpl implements FineService {


    private final BorrowService borrowService;
    private final FineCalculator fineCalculator;
    private final ModelMapper modelMapper;

    @Override
    public double calculateFine(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowService.getBorrowRecordById(borrowRecordId);
        return fineCalculator.calculateFine(borrowRecord);

    }

    @Override
    public double getTotalFineForUser(Long userId) {
        List<BorrowRecordDTO> borrowRecordDTOS = borrowService.getBorrowHistory(userId);
        return borrowRecordDTOS
                .stream()
                .filter(record -> record.getFineAmount() > 0)
                .mapToDouble(BorrowRecordDTO::getFineAmount)
                .sum();
    }

    @Override
    public void payAllFineByUser(Long userId) {

    }

    @Override
    public void payFine(Long borrowRecordId) {

    }

    @Override
    public boolean isFinePaid(Long borrowRecordId) {
        return false;
    }

    @Override
    public boolean isAllFinePaidForUser(Long userId) {
        return false;
    }

    @Override
    public List<FineDto> getAllFineByUser(Long userId) {
        return List.of();
    }

    @Override
    public List<FineDto> getAllFines() {
        List<BorrowRecordDTO> borrowRecordDTOS = borrowService.getAllBorrows();
        return borrowRecordDTOS
                .stream()
                .filter(r -> r.getFineAmount() > 0)
                .map(this::convertToFineDto)
                .collect(Collectors.toList());
    }

    private FineDto convertToFineDto(BorrowRecordDTO borrowRecordDTO) {
        FineDto fineDto = new FineDto();
        fineDto.setUserId(borrowRecordDTO.getUserId());
        fineDto.setBookId(borrowRecordDTO.getBookId());
        fineDto.setFineAmount(borrowRecordDTO.getFineAmount());
        fineDto.setStatus(borrowRecordDTO.getStatus());
        fineDto.setBorrowRecordId(borrowRecordDTO.getId());
        fineDto.setIssueDate(borrowRecordDTO.getIssueDate());
        fineDto.setDueDate(borrowRecordDTO.getDueDate());
        fineDto.setReturnDate(borrowRecordDTO.getReturnDate());
        fineDto.setPaid(borrowRecordDTO.isFinePaid());
        return fineDto;
    }
}

