package com.example.mylib.services;

import com.example.mylib.entities.Users;
import com.example.mylib.entities.auth.UserPrincipal;
import com.example.mylib.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
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
        Users user = userRepo.findByEmail(username);
        if(user != null  ) {
            System.out.println(user);
            System.out.println("User: " + user.getEmail());
            System.out.println("Roles: " + user.getRoleList());
            return new UserPrincipal(user);
        }
        else{
            throw new UsernameNotFoundException("User Not Found Exception of email: "+ username);
        }
    }
}
