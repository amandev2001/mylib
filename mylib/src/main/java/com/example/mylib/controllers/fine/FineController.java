package com.example.mylib.controllers.fine;

import com.example.mylib.services.fine.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fine")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllFines(){
        try{
            return ResponseEntity.ok(fineService.getAllFines());
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
        }
    }

}
