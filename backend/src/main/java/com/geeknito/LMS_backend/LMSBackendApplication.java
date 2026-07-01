package com.geeknito.LMS_backend;

import com.geeknito.LMS_backend.entity.learning.*;
import com.geeknito.LMS_backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.util.List;
import java.time.LocalDateTime;

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
            EnrollmentRepository enrollmentRepository,
            CertificationRepository certificationRepository,
            FresherJourneyRepository fresherJourneyRepository) {
        return args -> {
            System.out.println("[DatabaseSeeder] Starting database truncation and seeding...");
            
            // Delete all existing data in order to respect constraints
            fresherJourneyRepository.deleteAll();
            certificationRepository.deleteAll();
            enrollmentRepository.deleteAll();
            employeeRepository.deleteAll();
            
            contentRepository.deleteAll();
            submoduleRepository.deleteAll();
            moduleRepository.deleteAll();
            courseRepository.deleteAll();
            categoryRepository.deleteAll();
            
            System.out.println("[DatabaseSeeder] Truncated all existing category, course, module, submodule, content, and analytics data.");

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
            
            CategoryEntity catAI = CategoryEntity.builder()
                    .name("Artificial Intelligence")
                    .description("Explore machine learning, deep learning, prompt engineering, and GenAI.")
                    .icon("🧠")
                    .color("#84117C")
                    .logo("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .isActive(true)
                    .build();
            catAI = categoryRepository.save(catAI);

            // 2. Create Courses
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

            CourseEntity courseAI = CourseEntity.builder()
                    .title("GenAI & Prompt Engineering Foundation")
                    .slug("genai-prompt-engineering-foundation")
                    .description("Learn prompt patterns, LLM parameters, and build applications using langchain.")
                    .shortDescription("Unlock the potential of LLMs with prompt engineering patterns.")
                    .level("Beginner")
                    .language("English")
                    .duration("4 weeks")
                    .icon("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .thumbnail("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .bannerImage("https://res.cloudinary.com/dnplvm1es/image/upload/v1782790814/azfbgudo19nkppy35gck.png")
                    .category(catAI)
                    .isActive(true)
                    .isPublished(true)
                    .build();
            courseAI = courseRepository.save(courseAI);

            // 3. Create Module
            ModuleEntity module = ModuleEntity.builder()
                    .title("AWS Services & Architectures")
                    .description("Deep dive into EC2, S3, RDS, and IAM.")
                    .moduleOrder(1)
                    .course(course)
                    .isActive(true)
                    .build();
            module = moduleRepository.save(module);

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

            // 5. Create Contents
            ContentEntity notesContent = ContentEntity.builder()
                    .type("notes")
                    .title("Summary & Labs Instructions")
                    .text("### S3 Hands-on Lab\n1. Log in to AWS Console.\n2. Create a bucket.\n3. Upload file.")
                    .contentOrder(1)
                    .submodule(submodule)
                    .isActive(true)
                    .build();
            contentRepository.save(notesContent);

            // 6. Generate and Seed Analytics Data (120 employees, enrollments, certifications, fresher journeys)
            System.out.println("[DatabaseSeeder] Seeding 120 employees and custom analytics datasets...");
            String[] firstNames = {"Aarav", "Aditya", "Arjun", "Amit", "Aniket", "Akash", "Deepak", "Dev", "Gaurav", "Hari", "Ishaan", "Karan", "Kabir", "Neha", "Pooja", "Priya", "Riya", "Shreya", "Sneha", "Swati", "Neha", "Rahul", "Rohan", "Siddharth", "Vivek", "Sameer", "Tanvi"};
            String[] lastNames = {"Sharma", "Kumar", "Singh", "Gupta", "Patel", "Verma", "Rao", "Reddy", "Mishra", "Joshi", "Das", "Bose", "Mehta", "Trivedi"};
            String[] regions = {"India", "US", "UK"};
            String[] locations = {"Delhi", "Gurgaon", "Bangalore", "Pune", "Noida", "Mumbai"};
            String[] businessUnits = {"Digital", "Cloud & Infra", "Data & AI", "Advisory"};
            String[] departments = {"Computer Science", "Information Technology", "DevOps & Cloud", "AI & Analytics"};
            String[] practices = {"Java", "Python", "Cloud Native", "GenAI", "Security"};
            String[] grades = {"E1", "E2", "E3", "M1", "M2"};
            String[] certificationNames = {"AWS Certified Solutions Architect", "Databricks Certified Lakehouse Developer", "Azure AI Engineer", "Google Cloud Associate Cloud Engineer", "Professional Scrum Master (PSM I)", "Copilot Specialist", "Kiro AI Fundamentals"};
            String[] certStatuses = {"Assigned", "Enrolled", "Started", "Completed", "Submitted", "Approved"};

            java.util.Random rand = new java.util.Random(42); // stable random seed
            java.util.List<EmployeeEntity> employees = new java.util.ArrayList<>();

            for (int i = 0; i < 120; i++) {
                String first = firstNames[rand.nextInt(firstNames.length)];
                String last = lastNames[rand.nextInt(lastNames.length)];
                String fullName = first + " " + last;
                String email = first.toLowerCase() + "." + last.toLowerCase() + i + "@xebialms.edu.in";
                
                EmployeeEntity emp = EmployeeEntity.builder()
                        .fullName(fullName)
                        .email(email)
                        .grade(grades[rand.nextInt(grades.length)])
                        .region(regions[rand.nextInt(regions.length)])
                        .location(locations[rand.nextInt(locations.length)])
                        .businessUnit(businessUnits[rand.nextInt(businessUnits.length)])
                        .department(departments[rand.nextInt(departments.length)])
                        .practice(practices[rand.nextInt(practices.length)])
                        .project("Project-" + (rand.nextInt(15) + 101))
                        .avatar("https://api.dicebear.com/7.x/initials/svg?seed=" + first + "%20" + last)
                        .build();
                emp = employeeRepository.save(emp);
                employees.add(emp);
            }

            // Seed enrollments
            for (EmployeeEntity emp : employees) {
                // Enrollment 1: AWS Course
                boolean enroll1 = rand.nextBoolean() || rand.nextBoolean(); // ~75% chance
                if (enroll1) {
                    int progress = rand.nextInt(101);
                    double hours = 5.0 + rand.nextDouble() * 35.0;
                    EnrollmentEntity en = EnrollmentEntity.builder()
                            .employee(emp)
                            .course(course)
                            .progress(progress)
                            .learningHours(Math.round(hours * 10.0) / 10.0)
                            .enrollmentDate(LocalDateTime.now().minusDays(rand.nextInt(200) + 10))
                            .status(progress == 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "ENROLLED")
                            .feedbackRating(rand.nextInt(3) + 3) // 3 to 5 stars
                            .recommendationScore(rand.nextInt(4) + 7) // 7 to 10
                            .isFlagship(rand.nextBoolean())
                            .build();
                    enrollmentRepository.save(en);
                }

                // Enrollment 2: AI Course
                boolean enroll2 = rand.nextBoolean(); // ~50% chance
                if (enroll2) {
                    int progress = rand.nextInt(101);
                    double hours = 2.0 + rand.nextDouble() * 20.0;
                    EnrollmentEntity en = EnrollmentEntity.builder()
                            .employee(emp)
                            .course(courseAI)
                            .progress(progress)
                            .learningHours(Math.round(hours * 10.0) / 10.0)
                            .enrollmentDate(LocalDateTime.now().minusDays(rand.nextInt(150) + 5))
                            .status(progress == 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "ENROLLED")
                            .feedbackRating(rand.nextInt(2) + 4) // 4 to 5 stars
                            .recommendationScore(rand.nextInt(3) + 8) // 8 to 10
                            .isFlagship(rand.nextBoolean())
                            .build();
                    enrollmentRepository.save(en);
                }

                // Seed certifications
                int certsCount = rand.nextInt(3); // 0, 1 or 2 certifications
                for (int c = 0; c < certsCount; c++) {
                    String certName = certificationNames[rand.nextInt(certificationNames.length)];
                    String status = certStatuses[rand.nextInt(certStatuses.length)];
                    boolean isAI = certName.contains("AI") || certName.contains("Kiro") || certName.contains("Copilot") || rand.nextBoolean();
                    
                    CertificationEntity cert = CertificationEntity.builder()
                            .employee(emp)
                            .name(certName)
                            .technology(certName.split(" ")[0])
                            .status(status)
                            .isAI(isAI)
                            .completionDate(status.equals("Approved") || status.equals("Completed") 
                                    ? LocalDateTime.now().minusDays(rand.nextInt(120)) 
                                    : null)
                            .build();
                    certificationRepository.save(cert);
                }
            }

            // Seed fresher journeys (30 freshers)
            for (int k = 0; k < 30; k++) {
                EmployeeEntity emp = employees.get(k);
                emp.setGrade("E1"); // ensure grade is fresher
                employeeRepository.save(emp);

                LocalDateTime hire = LocalDateTime.now().minusDays(rand.nextInt(180) + 120);
                FresherJourneyEntity journey = FresherJourneyEntity.builder()
                        .employee(emp)
                        .hiredDate(hire)
                        .trainingEnrollmentDate(hire.plusDays(7))
                        .trainingCompletionDate(hire.plusDays(60))
                        .certificationCompletionDate(hire.plusDays(75))
                        .projectAllocationDate(hire.plusDays(90))
                        .billableDeploymentDate(rand.nextBoolean() ? hire.plusDays(105) : null)
                        .status(rand.nextBoolean() ? "Deployed" : "Allocated")
                        .build();
                fresherJourneyRepository.save(journey);
            }

            System.out.println("[DatabaseSeeder] Completed seeding 2 Categories, 2 Courses, 1 Module, 1 Submodule, 1 Content item, 120 Employees, Enrollments, Certifications, and 30 Fresher Journeys.");
        };
    }
}
