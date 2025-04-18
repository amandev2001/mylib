package com.example.mylib.repository;

import com.example.mylib.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<Users,Long> {


    Users findByEmail(String email);

    Users findByIdAndEmailToken(Long userId, String token);
}
