package com.example.mylib.controllers.auth;

import com.example.mylib.services.auth.JWTService;
import com.example.mylib.services.User.MyUserDetailsService;
import com.example.mylib.entities.Users;
import com.example.mylib.services.User.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Users user) {
        try {
            Users registeredUser = userService.saveUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtService.extractUsername(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                if (jwtService.validateToken(token, userDetails)) {
                    String newToken = jwtService.generateToken(username);
                    return ResponseEntity.ok(Map.of("token", newToken));
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authorization header not found");
    }

    // ... existing code ...
} 