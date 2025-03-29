package com.example.mylib.services.User;

import com.example.mylib.entities.Users;
import com.example.mylib.entities.auth.UserPrincipal;
import com.example.mylib.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {


    private final UserRepo userRepo;

    @Autowired
    public MyUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Loading user by username: " + username);
        Users user = userRepo.findByEmail(username);
        if(user != null) {
            System.out.println("User found: " + user.getEmail());
            System.out.println("Roles: " + user.getRoleList());
            System.out.println("Password hash: " + user.getPassword());
            System.out.println("Password hash length: " + (user.getPassword() != null ? user.getPassword().length() : 0));
            System.out.println("Enabled status: " + user.isEnabled());
            
            // Create UserPrincipal
            UserPrincipal principal = new UserPrincipal(user);
            System.out.println("Created UserPrincipal with authorities: " + principal.getAuthorities());
            System.out.println("UserPrincipal password: " + principal.getPassword());
            return principal;
        } else {
            System.out.println("User not found with email: " + username);
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
    }
}
