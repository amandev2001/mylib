package com.example.mylib.controllers.admin.health;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/")
public class HealthController {

    @RequestMapping("/health")
    public String healthCheck() {
        return "OK";
    }
}
