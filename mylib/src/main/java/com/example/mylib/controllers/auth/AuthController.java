package com.example.mylib.controllers.auth;

import com.example.mylib.services.auth.JWTService;
import com.example.mylib.services.User.MyUserDetailsService;
import com.example.mylib.entities.Users;
import com.example.mylib.services.User.UserService;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);


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
            logger.info("Extracted username from token: {}", username);

            Users user = userService.getUserByEmail(username).orElseThrow(() -> new UsernameNotFoundException(username));
            if (user == null) {
                logger.warn("User not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            logger.info("User details retrieved from DB: {}", user);

            // Generate new token with updated user details
            String newToken = jwtService.generateToken(user.getEmail());
            logger.info("Generated new JWT for user: {}", user.getEmail());

            return ResponseEntity.ok(Map.of("token", newToken, "email", user.getEmail()));

        } catch (Exception e) {
            logger.error("Token refresh failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    logger.warn("Authorization header not found");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authorization header not found");
}


    
} 