package com.example.mylib.controllers.admin.health;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthRepo extends JpaRepository<Health, Long> {

}
