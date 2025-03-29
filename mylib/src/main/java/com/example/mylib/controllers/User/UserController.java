package com.example.mylib.controllers.User;

import com.example.mylib.dto.UserLoginDTO;
import com.example.mylib.dto.UserRegistrationDto;
import com.example.mylib.dto.LoginResponseDTO;
import com.example.mylib.dto.UserDTO;
import com.example.mylib.services.auth.JWTService;
import com.example.mylib.services.impl.UserServiceImpl;
import com.example.mylib.entities.Users;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

//    @GetMapping("/")
//    public String greet() {
//        return "hello";
//    }

    @PostMapping("/register")
    public ResponseEntity<?> userRegister(@RequestBody UserRegistrationDto registrationDto) {
        try {
            logger.info("Starting registration process for email: {}", registrationDto.getEmail());
            
            // Validate input
            if (registrationDto.getEmail() == null || registrationDto.getEmail().isEmpty()) {
                logger.warn("Registration failed: Email is empty");
                return ResponseEntity.badRequest().body("Email cannot be empty");
            }
            
            // Check if user already exists
            if (userService.getUserByEmail(registrationDto.getEmail()).isPresent()) {
                logger.warn("Registration failed: Email {} already exists", registrationDto.getEmail());
                return ResponseEntity.badRequest().body("Email already registered");
            }

            logger.info("Saving user with email: {}", registrationDto.getEmail());
            Users savedUser = userService.saveUserDto(registrationDto);
            logger.info("Successfully registered user with email: {}", savedUser.getEmail());
            
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            logger.error("Registration failed for email: " + registrationDto.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> userLogin(@RequestBody UserLoginDTO userLoginDTO) {
        try {
            logger.info("Login attempt for email: {}", userLoginDTO.getEmail());
            logger.debug("Password length: {}", userLoginDTO.getPassword() != null ? userLoginDTO.getPassword().length() : 0);
            
            // Check if user exists first
            Users user = userService.getUserByEmail(userLoginDTO.getEmail())
                    .orElse(null);
                    
            if (user == null) {
                logger.warn("Login failed: User not found with email: {}", userLoginDTO.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: User not found");
            }

            // Check if account is enabled
            if (!user.isEnabled()) {
                logger.warn("Login failed: Account is disabled for email: {}", userLoginDTO.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                        "error", "Account is disabled",
                        "message", "Please enable your account or contact an administrator"
                    ));
            }
            
            logger.info("User found in database. Attempting authentication...");
            logger.debug("Raw password from request: {}", userLoginDTO.getPassword());
            logger.debug("Stored password hash: {}", user.getPassword());
            
            // Test password match directly before authentication
            boolean passwordMatches = passwordEncoder.matches(userLoginDTO.getPassword(), user.getPassword());
            logger.debug("Direct password match test before authentication: {}", passwordMatches);
            
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLoginDTO.getEmail(), userLoginDTO.getPassword())
            );

            if (authentication.isAuthenticated()) {
                logger.info("Authentication successful for user: {}", userLoginDTO.getEmail());
                
                String token = jwtService.generateToken(userLoginDTO.getEmail());
                LoginResponseDTO response = new LoginResponseDTO(
                        token,
                        user.getEmail(),
                        user.getName(),
                        user.getRoleList(),
                        user.getId()
                );
                return ResponseEntity.ok(response);
            }
            logger.warn("Authentication failed despite no exception");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed");
        } catch (BadCredentialsException e) {
            logger.error("Bad credentials for user: {}", userLoginDTO.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "error", "Login failed",
                    "message", "Invalid email or password"
                ));
        } catch (Exception e) {
            logger.error("Login failed for user: {}", userLoginDTO.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Login failed",
                    "message", e.getMessage()
                ));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            List<Users> users = userService.getAllUsers();
            List<UserDTO> userDTOs = users.stream()
                    .map(user -> {
                        UserDTO dto = new UserDTO();
                        dto.setId(user.getId());
                        dto.setEmail(user.getEmail());
                        dto.setName(user.getName());
                        dto.setPhoneNumber(user.getPhoneNumber());
                        dto.setRoleList(user.getRoleList());
                        dto.setProfilePic(user.getProfilePic());
                        dto.setEnabled(user.isEnabled());
                        return dto;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            logger.error("Failed to fetch users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRoles(
            @PathVariable Long userId,
            @RequestBody Map<String, List<String>> payload) {
        try {
            List<String> roles = payload.get("roles");
            Users updatedUser = userService.updateUserRoles(userId, roles);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User roles updated successfully"
            ));
        } catch (Exception e) {
            logger.error("Failed to update user roles for user ID: " + userId, e);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "success", false,
                        "message", "Failed to update user roles: " + e.getMessage()
                    ));
        }
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> updateUserDetails(@PathVariable Long userId, @RequestBody Users userData) {
        try {
            logger.info("Updating user details for userId: {}", userId);
            
            // Check if user exists
            Users existingUser = userService.getUserById(userId.toString())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            // Update fields
            existingUser.setName(userData.getName());
            existingUser.setEmail(userData.getEmail());
            existingUser.setPhoneNumber(userData.getPhoneNumber());
            existingUser.setAbout(userData.getAbout());
            existingUser.setEnabled(userData.isEnabled());
            existingUser.setRoleList(userData.getRoleList());
            
            // Save profile image if provided in the userData
            if (userData.getProfilePic() != null && !userData.getProfilePic().equals(existingUser.getProfilePic())) {
                existingUser.setProfilePic(userData.getProfilePic());
            }
            
            // Save the updated user
            Users updatedUser = userService.saveUser(existingUser);
            
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Failed to update user details for ID: " + userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update user: " + e.getMessage());
        }
    }

    @GetMapping("/test-password")
    public ResponseEntity<?> testPasswordEncoding(@RequestParam String rawPassword) {
        logger.info("Testing password encoding for raw password: {}", rawPassword);
        
        // Encode the password
        String encoded = passwordEncoder.encode(rawPassword);
        logger.info("Encoded password: {}", encoded);
        
        // Test matches
        boolean matches = passwordEncoder.matches(rawPassword, encoded);
        logger.info("Password matches: {}", matches);
        
        return ResponseEntity.ok(Map.of(
            "encoded", encoded,
            "matches", matches,
            "rawLength", rawPassword.length(),
            "encodedLength", encoded.length()
        ));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String rawPassword = request.get("password");
        
        if (email == null || rawPassword == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }
        
        logger.info("Verifying password for email: {}", email);
        logger.debug("Raw password length: {}", rawPassword.length());
        
        // Find user
        Optional<Users> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Users user = userOpt.get();
        String storedHash = user.getPassword();
        logger.debug("Stored hash: {}", storedHash);
        
        // Test direct match
        boolean matches = passwordEncoder.matches(rawPassword, storedHash);
        logger.debug("Password verification result for {}: matches={}", email, matches);
        
        // Return detailed response for debugging
        return ResponseEntity.ok(Map.of(
            "email", email,
            "matches", matches,
            "storedHashLength", storedHash.length(),
            "rawPasswordLength", rawPassword.length()
        ));
    }

    @PutMapping("/{userId}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableUser(@PathVariable Long userId) {
        try {
            logger.info("Enabling user with ID: {}", userId);
            
            // Check if user exists
            Users user = userService.getUserById(userId.toString())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            // Enable the user
            user.setEnabled(true);
            Users updatedUser = userService.saveUser(user);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User account enabled successfully",
                "user", updatedUser
            ));
        } catch (Exception e) {
            logger.error("Failed to enable user with ID: " + userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Failed to enable user: " + e.getMessage()
                ));
        }
    }

    @PostMapping("/enable/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableUser(@PathVariable String email) {
        try {
            logger.info("Attempting to enable user with email: {}", email);
            Optional<Users> userOptional = userService.getUserByEmail(email);
            
            if (userOptional.isEmpty()) {
                logger.warn("User not found with email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "success", false,
                        "message", "User not found"
                    ));
            }
            
            Users user = userOptional.get();
            if (user.isEnabled()) {
                logger.info("User is already enabled with email: {}", email);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User account is already enabled"
                ));
            }
            
            user.setEnabled(true);
            Users updatedUser = userService.saveUser(user);
            
            logger.info("Successfully enabled user with email: {}", email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User account enabled successfully",
                "user", Map.of(
                    "id", updatedUser.getId(),
                    "email", updatedUser.getEmail(),
                    "name", updatedUser.getName(),
                    "enabled", updatedUser.isEnabled()
                )
            ));
        } catch (Exception e) {
            logger.error("Failed to enable user with email: " + email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Failed to enable user: " + e.getMessage()
                ));
        }
    }

    @PostMapping("/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            
            if (email == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Email and new password are required");
            }
            
            Optional<Users> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Users user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.saveUser(user);
            
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            logger.error("Failed to reset password", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to reset password: " + e.getMessage());
        }
    }

    @PostMapping("/admin/reset-password")
    public ResponseEntity<?> adminResetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            
            logger.info("Admin attempting to reset password for email: {}", email);
            logger.debug("New password length: {}", newPassword.length());
            
            // Find user
            Users user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            
            // Update password using userService
            user.setPassword(newPassword); // userService will encode the password
            Users savedUser = userService.saveUser(user);
            
            logger.info("Password reset successful for user: {}", email);
            
            return ResponseEntity.ok(Map.of(
                "message", "Password reset successful",
                "email", email
            ));
        } catch (Exception e) {
            logger.error("Failed to reset password", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}


