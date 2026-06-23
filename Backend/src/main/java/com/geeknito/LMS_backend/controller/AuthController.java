package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.dto.AuthResponse;
import com.geeknito.LMS_backend.dto.LoginRequest;
import com.geeknito.LMS_backend.dto.RegisterRequest;
import com.geeknito.LMS_backend.response.ApiResponse;
import com.geeknito.LMS_backend.security.SecurityUser;
import com.geeknito.LMS_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(new ApiResponse("Login successful", auth));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse auth = authService.register(request);
        return new ResponseEntity<>(new ApiResponse("Registration successful", auth), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me(@AuthenticationPrincipal SecurityUser user) {
        AuthResponse auth = authService.me(user.getUsername());
        return ResponseEntity.ok(new ApiResponse("User retrieved successfully", auth));
    }
}
