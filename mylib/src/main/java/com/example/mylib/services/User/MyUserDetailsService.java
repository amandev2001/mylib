package com.example.mylib.services.User;

import com.example.mylib.entities.Users;
import com.example.mylib.entities.auth.UserPrincipal;
import com.example.mylib.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MyUserDetailsService implements UserDetailsService {
    
    private final Logger logger = LoggerFactory.getLogger(MyUserDetailsService.class);
    
    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("Attempting to load user: {}", username);
        Users user = userRepo.findByEmail(username);
        
        if(user != null) {
            logger.debug("User found: {}", username);
            return new UserPrincipal(user);
        } else {
            logger.debug("User not found: {}", username);
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
    }
}
