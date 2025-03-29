package com.example.mylib.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        // Apply custom message only for "/users"
        if (request.getRequestURI().equals("/users")) {
            response.getWriter().write("Access Denied: Only admins can access /users");
        } else {
            response.getWriter().write("Access Denied");
        }
    }
}
