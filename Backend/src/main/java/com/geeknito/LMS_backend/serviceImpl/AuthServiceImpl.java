package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.AuthResponse;
import com.geeknito.LMS_backend.dto.LoginRequest;
import com.geeknito.LMS_backend.dto.RegisterRequest;
import com.geeknito.LMS_backend.entity.auth.Role;
import com.geeknito.LMS_backend.entity.auth.UserEntity;
import com.geeknito.LMS_backend.repository.UserRepository;
import com.geeknito.LMS_backend.security.JwtService;
import com.geeknito.LMS_backend.security.SecurityUser;
import com.geeknito.LMS_backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return buildAuthResponse(securityUser.getUser(), jwtService.generateToken(securityUser));
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;

        UserEntity user = UserEntity.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(role)
                .enabled(true)
                .build();

        UserEntity saved = userRepository.save(user);
        SecurityUser securityUser = new SecurityUser(saved);
        return buildAuthResponse(saved, jwtService.generateToken(securityUser));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse me(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return buildAuthResponse(user, null);
    }

    private AuthResponse buildAuthResponse(UserEntity user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }
}
