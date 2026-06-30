package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Simple request model
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    // Simple refresh model
    public static class RefreshRequest {
        private String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Email and password are required", null));
        }

        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword();

        // Simple validation check (accept admin@xebia.com / admin123)
        if ("admin@xebia.com".equals(email) && "admin123".equals(password)) {
            Map<String, Object> responseData = createAuthResponse(email, "Sarah Chen");
            return ResponseEntity.ok(new ApiResponse("Login successful", responseData));
        } else if ("instructor@xebia.com".equals(email) && "instructor123".equals(password)) {
            Map<String, Object> responseData = createAuthResponse(email, "Priya Sharma");
            return ResponseEntity.ok(new ApiResponse("Login successful", responseData));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse("Invalid email or password", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refresh(@RequestBody RefreshRequest request) {
        if (request.getRefreshToken() == null || !request.getRefreshToken().startsWith("mock-refresh-")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("Invalid refresh token", null));
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", "mock-jwt-access-token-" + System.currentTimeMillis());
        responseData.put("refreshToken", request.getRefreshToken());
        responseData.put("expiresIn", 3600); // 1 hour

        return ResponseEntity.ok(new ApiResponse("Token refreshed successfully", responseData));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("Missing or invalid authorization header", null));
        }

        Map<String, Object> user = new HashMap<>();
        user.put("email", "admin@xebia.com");
        user.put("fullName", "Sarah Chen");
        user.put("role", "Admin");
        user.put("avatar", "https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Chen");

        return ResponseEntity.ok(new ApiResponse("Profile retrieved successfully", user));
    }

    private Map<String, Object> createAuthResponse(String email, String name) {
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", "mock-jwt-access-token-" + System.currentTimeMillis());
        responseData.put("refreshToken", "mock-refresh-token-" + System.currentTimeMillis());
        responseData.put("expiresIn", 3600); // 1 hour

        Map<String, Object> user = new HashMap<>();
        user.put("email", email);
        user.put("fullName", name);
        user.put("role", "Admin");
        user.put("avatar", "https://api.dicebear.com/7.x/initials/svg?seed=" + name.replace(" ", "%20"));

        responseData.put("user", user);
        return responseData;
    }
}
