package com.example.mylib.services.User;

import com.example.mylib.dto.UserDTO;
import com.example.mylib.dto.UserRegistrationDto;
import com.example.mylib.entities.Users;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public interface UserService {

    Users saveUser(Users user);

    Users saveOauthUser(Users user);

    Users saveUserDto(UserRegistrationDto userRegistrationDto);

    Optional<Users> getUserById(String id);

    Optional<Users> getUserByEmail(String email);

    void deleteUserById(String id);

    boolean isUserPresent(String id);

    Optional<Users> updateUser(Users user);

    boolean isUserPresentByEmail(String email);

    List<UserDTO> getAllUsersDTO();

    Optional<Users> getUserByEmailToken(String emailToken);

    String uploadProfileImage(MultipartFile file, Long userId);

    List<Users> getAllUsers();

    Users updateUserRoles(Long userId, List<String> roles);
}
