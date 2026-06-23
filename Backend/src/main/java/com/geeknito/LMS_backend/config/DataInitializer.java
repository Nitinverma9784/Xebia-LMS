package com.geeknito.LMS_backend.config;

import com.geeknito.LMS_backend.entity.auth.Role;
import com.geeknito.LMS_backend.entity.auth.UserEntity;
import com.geeknito.LMS_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            seedUser(userRepository, passwordEncoder, "admin@xebia.com", "Admin", "User", Role.ADMIN);
            seedUser(userRepository, passwordEncoder, "instructor@xebia.com", "Jane", "Instructor", Role.INSTRUCTOR);
            seedUser(userRepository, passwordEncoder, "student@xebia.com", "John", "Student", Role.STUDENT);
        };
    }

    private void seedUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String email,
            String firstName,
            String lastName,
            Role role
    ) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(UserEntity.builder()
                    .email(email)
                    .password(passwordEncoder.encode("Password123!"))
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(role)
                    .enabled(true)
                    .build());
        }
    }
}
