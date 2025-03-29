package com.example.mylib.entities.auth;

import com.example.mylib.entities.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Data
//@AllArgsConstructor
@NoArgsConstructor
public class UserPrincipal implements UserDetails {

    private Users user;
    public UserPrincipal(Users user){
        this.user = user;
    }


//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return user.getRoleList().stream()
//                .map(role -> new SimpleGrantedAuthority("ROLE_" + role)) // Ensure correct format
//                .collect(Collectors.toList());
//    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Map each role in the roleList to a SimpleGrantedAuthority with ROLE_ prefix
        return user.getRoleList().stream()
                .map(role -> new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        boolean isEnabled = user.isEnabled();
        System.out.println("UserPrincipal.isEnabled() returning: " + isEnabled + " for user: " + user.getEmail());
        return isEnabled;
    }
}
