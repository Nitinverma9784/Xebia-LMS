package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.AuthResponse;
import com.geeknito.LMS_backend.dto.LoginRequest;
import com.geeknito.LMS_backend.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse me(String email);
}
