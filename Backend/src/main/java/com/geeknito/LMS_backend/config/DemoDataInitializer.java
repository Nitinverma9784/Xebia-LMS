package com.geeknito.LMS_backend.config;

import com.geeknito.LMS_backend.entity.learning.CategoryEntity;
import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import com.geeknito.LMS_backend.repository.CategoryRepository;
import com.geeknito.LMS_backend.repository.CourseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("h2")
public class DemoDataInitializer {

    @Bean
    CommandLineRunner seedDemoCourses(CategoryRepository categoryRepository, CourseRepository courseRepository) {
        return args -> {
            if (courseRepository.count() > 0) {
                return;
            }

            CategoryEntity programming = categoryRepository.save(CategoryEntity.builder()
                    .name("Programming")
                    .icon("💻")
                    .description("Software engineering and development")
                    .color("#4F46E5")
                    .isActive(true)
                    .build());

            courseRepository.save(CourseEntity.builder()
                    .title("Java Programming Masterclass")
                    .slug("java-programming-masterclass")
                    .description("Learn Java from scratch to advanced concepts.")
                    .shortDescription("Become a professional Java developer.")
                    .level("Beginner to Advanced")
                    .language("English")
                    .duration("45 hours")
                    .isActive(true)
                    .isFeatured(true)
                    .isPublished(true)
                    .category(programming)
                    .build());

            courseRepository.save(CourseEntity.builder()
                    .title("Spring Boot Microservices")
                    .slug("spring-boot-microservices")
                    .description("Build cloud-native apps with Spring Cloud.")
                    .shortDescription("Gateway, Eureka, Config, and Security.")
                    .level("Intermediate")
                    .language("English")
                    .duration("30 hours")
                    .isActive(true)
                    .isFeatured(false)
                    .isPublished(true)
                    .category(programming)
                    .build());
        };
    }
}
