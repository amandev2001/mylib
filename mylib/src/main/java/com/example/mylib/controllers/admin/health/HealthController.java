package com.example.mylib.controllers.admin.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/")
public class HealthController {

    private final HealthRepo healthRepo;

    public HealthController(HealthRepo healthRepo) {
        this.healthRepo = healthRepo;
    }

    @RequestMapping("/health")
    public ResponseEntity<Health> getHealth() {
        Health health = healthRepo.findById(1L).orElse(new Health(1L, "UP", "Service is running"));
        return ResponseEntity.ok(health);
    }


    // PostConstruct is a special annotation in Spring (and Java EE) used to mark a method that should run once automatically after the bean is fully initialized, i.e., after all dependencies are injected
    @PostConstruct
    public void initHealthRecord() {
        if(healthRepo.findById(1L).isEmpty()){
            Health health = new Health(1L, "UP", "Service is running");
            healthRepo.save(health);
        }
    }
}
