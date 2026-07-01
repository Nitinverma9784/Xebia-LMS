package com.geeknito.LMS_backend;

import com.geeknito.LMS_backend.entity.learning.*;
import com.geeknito.LMS_backend.entity.dashboard.*;
import com.geeknito.LMS_backend.repository.*;
import com.geeknito.LMS_backend.repository.dashboard.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.time.LocalDateTime;
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
            ContentRepository contentRepository,
            EmployeeRepository employeeRepository,
            TrainingSessionRepository trainingSessionRepository,
            EnrollmentRepository enrollmentRepository,
            CertificationRepository certificationRepository,
            FeedbackRepository feedbackRepository,
            AIActivityRepository aiActivityRepository,
            ProjectLearningRepository projectLearningRepository) {
        return args -> {
            System.out.println("[DatabaseSeeder] Starting database truncation and seeding...");
            
            // Delete all existing data in order to respect constraints
            projectLearningRepository.deleteAll();
            aiActivityRepository.deleteAll();
            feedbackRepository.deleteAll();
            certificationRepository.deleteAll();
            enrollmentRepository.deleteAll();
            trainingSessionRepository.deleteAll();
            employeeRepository.deleteAll();

            contentRepository.deleteAll();
            submoduleRepository.deleteAll();
            moduleRepository.deleteAll();
            courseRepository.deleteAll();
            categoryRepository.deleteAll();
            
            System.out.println("[DatabaseSeeder] Truncated all existing category, course, module, submodule, content, and dashboard data.");

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

            System.out.println("[DatabaseSeeder] Completed seeding 1 Category, 1 Course, 1 Module, 1 Submodule, and 4 Content items.");

            // Seeding Dashboard Data
            System.out.println("[DatabaseSeeder] Seeding mock Dashboard data...");

            // Employees
            EmployeeEntity emp1 = EmployeeEntity.builder()
                    .employeeCode("EMP001")
                    .name("Amit Sharma")
                    .email("amit.sharma@xebia.com")
                    .region("North")
                    .location("Gurugram")
                    .businessUnit("Cloud & Infra")
                    .department("Engineering")
                    .project("AWS Modernization")
                    .practice("DevOps")
                    .employeeGrade("Consultant")
                    .joiningDate(LocalDateTime.now().minusYears(2))
                    .active(true)
                    .build();

            EmployeeEntity emp2 = EmployeeEntity.builder()
                    .employeeCode("EMP002")
                    .name("Priya Patel")
                    .email("priya.patel@xebia.com")
                    .region("West")
                    .location("Mumbai")
                    .businessUnit("Data & AI")
                    .department("Analytics")
                    .project("AI Platform Development")
                    .practice("Data Science")
                    .employeeGrade("Senior Consultant")
                    .joiningDate(LocalDateTime.now().minusYears(1))
                    .active(true)
                    .build();

            EmployeeEntity emp3 = EmployeeEntity.builder()
                    .employeeCode("EMP003")
                    .name("Rohan Das")
                    .email("rohan.das@xebia.com")
                    .region("South")
                    .location("Bengaluru")
                    .businessUnit("Software Engineering")
                    .department("Engineering")
                    .project("Retail E-Commerce")
                    .practice("Backend")
                    .employeeGrade("Associate Consultant")
                    .joiningDate(LocalDateTime.now().minusMonths(6))
                    .active(true)
                    .build();

            emp1 = employeeRepository.save(emp1);
            emp2 = employeeRepository.save(emp2);
            emp3 = employeeRepository.save(emp3);

            // Training Sessions
            TrainingSessionEntity session1 = TrainingSessionEntity.builder()
                    .sessionName("AWS Certified Cloud Practitioner Bootcamp")
                    .trainer("John Doe")
                    .learningPillar("Cloud")
                    .durationHours(16)
                    .sessionDate(LocalDateTime.now().minusDays(10))
                    .course(course)
                    .build();

            TrainingSessionEntity session2 = TrainingSessionEntity.builder()
                    .sessionName("Generative AI & LLMs in Production")
                    .trainer("Alice Smith")
                    .learningPillar("AI")
                    .durationHours(24)
                    .sessionDate(LocalDateTime.now().minusDays(5))
                    .build();

            session1 = trainingSessionRepository.save(session1);
            session2 = trainingSessionRepository.save(session2);

            // Enrollments
            EnrollmentEntity enrollment1 = EnrollmentEntity.builder()
                    .employee(emp1)
                    .trainingSession(session1)
                    .status("COMPLETED")
                    .enrolledDate(LocalDateTime.now().minusDays(15))
                    .completedDate(LocalDateTime.now().minusDays(10))
                    .build();

            EnrollmentEntity enrollment2 = EnrollmentEntity.builder()
                    .employee(emp2)
                    .trainingSession(session1)
                    .status("ATTENDED")
                    .enrolledDate(LocalDateTime.now().minusDays(15))
                    .build();

            EnrollmentEntity enrollment3 = EnrollmentEntity.builder()
                    .employee(emp2)
                    .trainingSession(session2)
                    .status("COMPLETED")
                    .enrolledDate(LocalDateTime.now().minusDays(8))
                    .completedDate(LocalDateTime.now().minusDays(5))
                    .build();

            EnrollmentEntity enrollment4 = EnrollmentEntity.builder()
                    .employee(emp3)
                    .trainingSession(session1)
                    .status("REGISTERED")
                    .enrolledDate(LocalDateTime.now().minusDays(2))
                    .build();

            enrollmentRepository.save(enrollment1);
            enrollmentRepository.save(enrollment2);
            enrollmentRepository.save(enrollment3);
            enrollmentRepository.save(enrollment4);

            // Certifications
            CertificationEntity cert1 = CertificationEntity.builder()
                    .employee(emp1)
                    .certificationName("AWS Certified Cloud Practitioner")
                    .technology("AWS")
                    .status("APPROVED")
                    .completionDate(LocalDateTime.now().minusDays(9))
                    .build();

            CertificationEntity cert2 = CertificationEntity.builder()
                    .employee(emp2)
                    .certificationName("Databricks Certified Lakehouse Associate")
                    .technology("Databricks")
                    .status("ENROLLED")
                    .build();

            certificationRepository.save(cert1);
            certificationRepository.save(cert2);

            // Feedback
            FeedbackEntity feedback1 = FeedbackEntity.builder()
                    .employee(emp1)
                    .trainingSession(session1)
                    .rating(5.0)
                    .trainerRating(4.8)
                    .recommended(true)
                    .build();

            FeedbackEntity feedback2 = FeedbackEntity.builder()
                    .employee(emp2)
                    .trainingSession(session2)
                    .rating(4.5)
                    .trainerRating(4.7)
                    .recommended(true)
                    .build();

            feedbackRepository.save(feedback1);
            feedbackRepository.save(feedback2);

            // AI Activity
            AIActivityEntity ai1 = AIActivityEntity.builder()
                    .employee(emp1)
                    .aiTrainingCompleted(true)
                    .aiCertified(true)
                    .aiLearningHours(10)
                    .copilotUser(true)
                    .kiroUser(false)
                    .claudeUser(true)
                    .aiPowerUser(false)
                    .aiMentor(false)
                    .aiAmbassador(false)
                    .build();

            AIActivityEntity ai2 = AIActivityEntity.builder()
                    .employee(emp2)
                    .aiTrainingCompleted(true)
                    .aiCertified(false)
                    .aiLearningHours(35)
                    .copilotUser(true)
                    .kiroUser(true)
                    .claudeUser(true)
                    .aiPowerUser(true)
                    .aiMentor(true)
                    .aiAmbassador(false)
                    .build();

            aiActivityRepository.save(ai1);
            aiActivityRepository.save(ai2);

            // Project Learning
            ProjectLearningEntity pl1 = ProjectLearningEntity.builder()
                    .projectName("AWS Modernization")
                    .employee(emp1)
                    .learningHours(16)
                    .certifications(1)
                    .aiReadinessScore(70.0)
                    .trainingCoverage(80.0)
                    .build();

            ProjectLearningEntity pl2 = ProjectLearningEntity.builder()
                    .projectName("AI Platform Development")
                    .employee(emp2)
                    .learningHours(24)
                    .certifications(0)
                    .aiReadinessScore(95.0)
                    .trainingCoverage(100.0)
                    .build();

            projectLearningRepository.save(pl1);
            projectLearningRepository.save(pl2);

            System.out.println("[DatabaseSeeder] Seeded dashboard mock records successfully.");
        };
    }
}
