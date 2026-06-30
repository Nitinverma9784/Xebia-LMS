package com.geeknito.LMS_backend;

import com.geeknito.LMS_backend.entity.learning.*;
import com.geeknito.LMS_backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.util.List;

@SpringBootApplication
public class LMSBackendApplication {

    public static void main(String[] args) {
        try {
            java.io.File envFile = new java.io.File(".env");
            if (envFile.exists()) {
                java.util.Map<String, String> envVars = new java.util.HashMap<>();
                java.nio.file.Files.lines(envFile.toPath())
                    .map(String::trim)
                    .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                    .forEach(line -> {
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            // Strip outer quotes if present
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            // Set as system property (CLOUDINARY_CLOUD_NAME -> cloudinary.cloud-name etc.)
                            System.setProperty(key, value);
                            envVars.put(key, value);
                        }
                    });
                
                // Also explicitly map Cloudinary env-var keys to Spring property keys
                // so that @Value("${cloudinary.cloud-name}") resolves correctly
                if (envVars.containsKey("CLOUDINARY_CLOUD_NAME")) {
                    System.setProperty("cloudinary.cloud-name", envVars.get("CLOUDINARY_CLOUD_NAME"));
                }
                if (envVars.containsKey("CLOUDINARY_API_KEY")) {
                    System.setProperty("cloudinary.api-key", envVars.get("CLOUDINARY_API_KEY"));
                }
                if (envVars.containsKey("CLOUDINARY_API_SECRET")) {
                    System.setProperty("cloudinary.api-secret", envVars.get("CLOUDINARY_API_SECRET"));
                }
                
                System.out.println("[.env loader] Loaded env keys: " + envVars.keySet());
                System.out.println("[.env loader] cloudinary.cloud-name = " + System.getProperty("cloudinary.cloud-name"));
                System.out.println("[.env loader] cloudinary.api-key = " + System.getProperty("cloudinary.api-key"));
            } else {
                System.out.println("[.env loader] No .env file found, relying on environment variables.");
            }
        } catch (Exception e) {
            System.err.println("Failed to parse local .env file: " + e.getMessage());
        }
        SpringApplication.run(LMSBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseCleanser(
            CategoryRepository categoryRepository,
            CourseRepository courseRepository,
            ModuleRepository moduleRepository,
            SubmoduleRepository submoduleRepository,
            ContentRepository contentRepository) {
        return args -> {
            System.out.println("[DatabaseSeeder] Starting database truncation and seeding...");
            
            // Delete all existing data in order to respect constraints
            contentRepository.deleteAll();
            submoduleRepository.deleteAll();
            moduleRepository.deleteAll();
            courseRepository.deleteAll();
            categoryRepository.deleteAll();
            
            System.out.println("[DatabaseSeeder] Truncated all existing category, course, module, submodule, and content data.");

            // 1. Create Category
            CategoryEntity category = CategoryEntity.builder()
                    .name("Cloud Computing")
                    .description("Learn cloud infrastructure, DevOps, and deployment strategies.")
                    .icon("☁️")
                    .color("#007ACC")
                    .logo("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .isActive(true)
                    .build();
            category = categoryRepository.save(category);
            System.out.println("[DatabaseSeeder] Created category: " + category.getName());

            // 2. Create Course
            CourseEntity course = CourseEntity.builder()
                    .title("AWS Cloud Practitioner & DevOps Essentials")
                    .slug("aws-cloud-practitioner-devops-essentials")
                    .description("Master the AWS Cloud Practitioner syllabus and learn core DevOps deployment pipelines.")
                    .shortDescription("Become cloud-ready with AWS essentials and CI/CD pipelines.")
                    .level("Intermediate")
                    .language("English")
                    .duration("6 weeks")
                    .icon("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .thumbnail("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .bannerImage("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .category(category)
                    .isActive(true)
                    .isPublished(true)
                    .build();
            course = courseRepository.save(course);
            System.out.println("[DatabaseSeeder] Created course: " + course.getTitle());

            // 3. Create Module
            ModuleEntity module = ModuleEntity.builder()
                    .title("AWS Services & Architectures")
                    .description("Deep dive into EC2, S3, RDS, and IAM.")
                    .moduleOrder(1)
                    .course(course)
                    .isActive(true)
                    .build();
            module = moduleRepository.save(module);
            System.out.println("[DatabaseSeeder] Created module: " + module.getTitle());

            // 4. Create Submodule
            SubmoduleEntity submodule = SubmoduleEntity.builder()
                    .title("Amazon Simple Storage Service (S3)")
                    .description("Learn object storage, buckets, and policies.")
                    .submoduleOrder(1)
                    .slug("amazon-s3-essentials")
                    .module(module)
                    .isActive(true)
                    .build();
            submodule = submoduleRepository.save(submodule);
            System.out.println("[DatabaseSeeder] Created submodule: " + submodule.getTitle());

            // 5. Create Contents (PPT, PDF, Video, Notes)
            ContentEntity pptContent = ContentEntity.builder()
                    .type("ppt")
                    .title("S3 Architecture Slides")
                    .text("{\"fileSize\":5420000,\"fileUrl\":\"https://res.cloudinary.com/dnplvm1es/raw/upload/v12345/s3_slides.pptx\",\"slideCount\":24}")
                    .contentOrder(1)
                    .submodule(submodule)
                    .isActive(true)
                    .build();
            contentRepository.save(pptContent);

            ContentEntity pdfContent = ContentEntity.builder()
                    .type("pdf")
                    .title("S3 Cheat Sheet Guide")
                    .text("{\"fileSize\":1240000,\"fileUrl\":\"https://res.cloudinary.com/dnplvm1es/raw/upload/v12345/s3_guide.pdf\",\"pageCount\":8}")
                    .contentOrder(2)
                    .submodule(submodule)
                    .isActive(true)
                    .build();
            contentRepository.save(pdfContent);

            ContentEntity videoContent = ContentEntity.builder()
                    .type("video")
                    .title("S3 Bucket Creation Walkthrough")
                    .text("{\"duration\":\"12:45\",\"fileUrl\":\"https://res.cloudinary.com/dnplvm1es/video/upload/v12345/s3_video.mp4\"}")
                    .videoUrl("https://res.cloudinary.com/dnplvm1es/video/upload/v12345/s3_video.mp4")
                    .contentOrder(3)
                    .submodule(submodule)
                    .isActive(true)
                    .build();
            contentRepository.save(videoContent);

            ContentEntity notesContent = ContentEntity.builder()
                    .type("notes")
                    .title("Summary & Labs Instructions")
                    .text("### S3 Hands-on Lab\n1. Log in to AWS Console.\n2. Create a bucket with a unique name.\n3. Upload a file and verify access.")
                    .contentOrder(4)
                    .submodule(submodule)
                    .isActive(true)
                    .build();
            contentRepository.save(notesContent);

            System.out.println("[DatabaseSeeder] Completed seeding 1 Category, 1 Course, 1 Module, 1 Submodule, and 4 Content items (including PPT, PDF, and Video).");
        };
    }
}
