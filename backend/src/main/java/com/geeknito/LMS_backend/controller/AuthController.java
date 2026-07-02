package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.response.ApiResponse;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    // In-memory OTP storage with details
    private static final Map<String, OtpDetails> otpStore = new ConcurrentHashMap<>();

    public static class OtpDetails {
        private final String code;
        private final LocalDateTime expiryTime;
        private int attempts;

        public OtpDetails(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
            this.attempts = 0;
        }

        public String getCode() { return code; }
        public LocalDateTime getExpiryTime() { return expiryTime; }
        public int getAttempts() { return attempts; }
        public void incrementAttempts() { this.attempts++; }
    }

    // Requests models
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RefreshRequest {
        private String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class SendOtpRequest {
        private String email;
        private String fullName;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public static class VerifyOtpRequest {
        private String email;
        private String code;
        private String fullName;
        private boolean isGoogleLogin;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public boolean isGoogleLogin() { return isGoogleLogin; }
        public void setGoogleLogin(boolean googleLogin) { isGoogleLogin = googleLogin; }
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
            Map<String, Object> responseData = createAuthResponse(email, "Sarah Chen", "Admin");
            return ResponseEntity.ok(new ApiResponse("Login successful", responseData));
        } else if ("instructor@xebia.com".equals(email) && "instructor123".equals(password)) {
            Map<String, Object> responseData = createAuthResponse(email, "Priya Sharma", "Instructor");
            return ResponseEntity.ok(new ApiResponse("Login successful", responseData));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse("Invalid email or password", null));
    }

    // ── OTP ENDPOINTS ──

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@RequestBody SendOtpRequest request) {
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            return ResponseEntity.badRequest().body(new ApiResponse("Valid email address is required", null));
        }

        String email = request.getEmail().trim().toLowerCase();
        String name = request.getFullName() != null ? request.getFullName().trim() : "Student";

        // Generate unique random 6-digit OTP
        String otpCode = String.format("%06d", 100000 + new Random().nextInt(900000));

        // Store OTP in database/memory with 5-minute expiry
        otpStore.put(email, new OtpDetails(otpCode, LocalDateTime.now().plusMinutes(5)));

        // Send Email
        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(email);
                helper.setSubject("Verify Your Xebia LMS Login");

                String htmlContent = buildOtpEmailHtml(name, otpCode);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                System.out.println("OTP email successfully sent to " + email);
            } else {
                logOtpFallback(email, name, otpCode, null);
            }
        } catch (Exception e) {
            logOtpFallback(email, name, otpCode, e);
        }

        return ResponseEntity.ok(new ApiResponse("Verification OTP code sent successfully to " + email, null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        if (request.getEmail() == null || request.getCode() == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Email and verification code are required", null));
        }

        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();
        String name = request.getFullName() != null ? request.getFullName().trim() : "Student User";

        OtpDetails details = otpStore.get(email);
        if (details == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("OTP not requested or has expired. Please try again.", null));
        }

        // Check expiry
        if (details.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpStore.remove(email);
            return ResponseEntity.badRequest().body(new ApiResponse("OTP code expired. Please request a new code.", null));
        }

        // Increment attempts
        details.incrementAttempts();
        if (details.getAttempts() > 3) {
            otpStore.remove(email);
            return ResponseEntity.badRequest().body(new ApiResponse("Maximum verification attempts exceeded. Please login again.", null));
        }

        // Check code match
        if (details.getCode().equals(code)) {
            otpStore.remove(email); // verified, clean up

            // Return active session
            Map<String, Object> responseData = createAuthResponse(email, name, "Student");
            return ResponseEntity.ok(new ApiResponse("OTP verified successfully", responseData));
        }

        int remaining = 3 - details.getAttempts();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse("Invalid verification code. You have " + remaining + " attempts remaining.", null));
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

    private Map<String, Object> createAuthResponse(String email, String name, String role) {
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", "mock-jwt-access-token-" + System.currentTimeMillis());
        responseData.put("refreshToken", "mock-refresh-token-" + System.currentTimeMillis());
        responseData.put("expiresIn", 3600); // 1 hour

        Map<String, Object> user = new HashMap<>();
        user.put("email", email);
        user.put("fullName", name);
        user.put("role", role);
        user.put("avatar", "https://api.dicebear.com/7.x/initials/svg?seed=" + name.replace(" ", "%20"));

        responseData.put("user", user);
        return responseData;
    }

    private String buildOtpEmailHtml(String name, String otp) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">" +
                "  <div style=\"background-color: #6C1D5F; padding: 24px; text-align: center;\">" +
                "    <h2 style=\"color: white; margin: 0; font-size: 20px;\">Xebia LMS Verification</h2>" +
                "  </div>" +
                "  <div style=\"padding: 32px; background-color: #ffffff;\">" +
                "    <p style=\"font-size: 16px; font-weight: bold; color: #1a202c; margin: 0 0 16px;\">Hello " + name + ",</p>" +
                "    <p style=\"font-size: 14px; color: #4a5568; line-height: 1.6; margin: 0 0 24px;\">" +
                "      Please enter the following 6-digit one-time code to complete your login request:" +
                "    </p>" +
                "    <div style=\"background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #6C1D5F; margin-bottom: 24px;\">" +
                "      " + otp + "" +
                "    </div>" +
                "    <p style=\"font-size: 12px; color: #e53e3e; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 10px; margin: 0 0 24px;\">" +
                "      ⚠️ This code will expire in <strong>5 minutes</strong>. Do not share it with anyone." +
                "    </p>" +
                "    <p style=\"font-size: 12px; color: #a0aec0; border-t: 1px solid #edf2f7; padding-top: 16px; margin: 0; font-style: italic;\">" +
                "      If you did not request this login request, you can safely ignore this security notice." +
                "    </p>" +
                "  </div>" +
                "</div>";
    }

    private void logOtpFallback(String email, String name, String code, Exception e) {
        System.out.println("\n==============================================");
        System.out.println("====== [SIMULATED SECURITY OTP SERVICE] ======");
        System.out.println("To: " + email);
        System.out.println("Subject: Verify Your Xebia LMS Login");
        System.out.println("Greeting: Hello " + name);
        System.out.println("OTP CODE: " + code);
        if (e != null) {
            System.out.println("SMTP Exception: " + e.getMessage());
        } else {
            System.out.println("SMTP Mail Sender not configured.");
        }
        System.out.println("==============================================");
    }
}
