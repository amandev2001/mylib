package com.example.mylib.services.impl;

import com.example.mylib.dto.UserDTO;
import com.example.mylib.dto.UserRegistrationDto;
import com.example.mylib.entities.Users;
import com.example.mylib.payload.AppConstants;
import com.example.mylib.repository.UserRepo;
import com.example.mylib.services.User.MyUserDetailsService;
import com.example.mylib.services.User.UserService;
import com.example.mylib.services.mail.EmailHelper;
import com.example.mylib.services.mail.MailService;
import com.example.mylib.services.users.UserImage;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    @Autowired
    private EmailHelper emailHelper;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserImage userImage;

    @Autowired
    private MailService mailService;

    private final BCryptPasswordEncoder encoder;

    @Autowired
    public UserServiceImpl(BCryptPasswordEncoder encoder) {
        this.encoder = encoder;
    }

    @Override
    public String uploadProfileImage(MultipartFile file, Long userId) {
        String fileName = null;
        String fileUrl = null;

        if (file != null && !file.isEmpty()) {
            fileName = "user_" + userId;
            fileUrl = userImage.uploadImage(file, fileName);
        } else {
            logger.info("No picture uploaded, skipping file upload.");
        }
        return fileUrl;
    }

    @Override
    public Users saveUser(Users user) {
        // Only encode the password if it's not already encoded
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(encoder.encode(user.getPassword()));
        }

        if (user.getRoleList() == null)
            user.setRoleList(List.of(AppConstants.ROLE_STUDENT));
        return userRepo.save(user);
    }

    @Override
    public Users saveOauthUser(Users user) {
        return null;
    }

    @Override
    public Users saveUserDto(UserRegistrationDto userRegistrationDto) {
        String emailToken = UUID.randomUUID().toString();
        String subject = "Verification Email";

        Users user = new Users();
        user.setName(userRegistrationDto.getName());
        user.setEmail(userRegistrationDto.getEmail());
        user.setPassword(userRegistrationDto.getPassword()); // This will be encoded in saveUser
        user.setPhoneNumber(userRegistrationDto.getPhoneNumber());
        user.setRoleList(userRegistrationDto.getRoleList());
        user.setEnabled(false);
        user.setEmailToken(emailToken);

        // ✅ Save the user first to get the generated ID
        Users savedUser = saveUser(user);

        // ✅ Now getId() will not be null
        String verifyLink = emailHelper.getLinkForAuthentication(emailToken, savedUser.getId().toString());
        mailService.sendVerificationEmail(savedUser.getEmail(), subject, verifyLink);

        logger.info("Creating new user with email: {}, enabled: {}", savedUser.getEmail(), savedUser.isEnabled());

        return savedUser;
    }

    @Override
    public Optional<Users> getUserById(String userId) {
        try {
            Long id = Long.parseLong(userId);
            return userRepo.findById(id);
        } catch (NumberFormatException e) {
            logger.error("Invalid user ID format: " + userId, e);
            return Optional.empty();
        }
    }

    @Override
    public Optional<Users> getUserByEmail(String email) {
        return Optional.ofNullable(userRepo.findByEmail(email));
    }

    @Override
    public void deleteUserById(String id) {

    }

    @Override
    public boolean isUserPresent(String id) {
        return false;
    }

    @Override
    public Optional<Users> updateUser(Users user) {
        return Optional.empty();
    }

    @Override
    public boolean isUserPresentByEmail(String email) {
        return false;
    }

    @Override
    public List<UserDTO> getAllUsersDTO() {
        List<Users> users = userRepo.findAll();

        return users.stream()
                .map(user -> {
                    UserDTO dto = modelMapper.map(user, UserDTO.class);
                    dto.setEnabled(user.isEnabled());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Users> getUserByEmailToken(String emailToken) {
        return Optional.empty();
    }

    @Override
    public List<Users> getAllUsers() {
        return userRepo.findAll();
    }

    @Override
    public Users updateUserRoles(Long userId, List<String> roles) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setRoleList(roles);
        return userRepo.save(user);
    }

    @Override
    public void updateSecurityContext(Users updatedUser) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            UserDetails updatedUserDetails = myUserDetailsService.loadUserByUsername(updatedUser.getEmail());
            UsernamePasswordAuthenticationToken newAuth = new UsernamePasswordAuthenticationToken(
                    updatedUserDetails, authentication.getCredentials(), updatedUserDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(newAuth);
            logger.info("SecurityContext updated for user: {}", updatedUser.getEmail());
        }
    }

    @Override
    public void resendEmailVerificationLink(Long userId) {
        Users user = getUserById(userId.toString())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with this userId: " + userId));
        if (user.getEmailToken() == null) {
            System.out.println("Email token is null");
            user.setEmailToken(UUID.randomUUID().toString());
            userRepo.save(user);
        }
        logger.info("Sending via userService");
        String verifyLink = emailHelper.getLinkForAuthentication(user.getEmailToken(), user.getId().toString());
        mailService.sendVerificationEmail(user.getEmail(), user.getName(), verifyLink);
    }

    @Override
    public boolean verifyEmailToken(Long userId, String token) {
        Users user = userRepo.findByIdAndEmailToken(userId, token);
        logger.info(String.valueOf(userId), token);
        if (user != null) {
            user.setEmailVerified(true);
            user.setEmailToken(null);
            userRepo.save(user);
            return user.isEmailVerified();
        } else {
            logger.info(" This user is null");
        }
        return false;
    }
}
