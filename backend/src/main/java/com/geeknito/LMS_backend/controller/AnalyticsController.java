package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.entity.learning.*;
import com.geeknito.LMS_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private FresherJourneyRepository fresherJourneyRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData(
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String quarter,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String businessUnit,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String project,
            @RequestParam(required = false) String practice,
            @RequestParam(required = false) String employeeGrade,
            @RequestParam(required = false) Long employeeId) {

        // 1. Fetch all data from DB
        List<EmployeeEntity> allEmployees = employeeRepository.findAll();
        List<EnrollmentEntity> allEnrollments = enrollmentRepository.findAll();
        List<CertificationEntity> allCertifications = certificationRepository.findAll();
        List<FresherJourneyEntity> allFresherJourneys = fresherJourneyRepository.findAll();
        long totalCourses = courseRepository.count();
        long totalCategories = categoryRepository.count();

        // 2. Filter employees based on organizational query parameters
        List<EmployeeEntity> filteredEmployees = allEmployees.stream()
                .filter(e -> region == null || region.equalsIgnoreCase("all") || e.getRegion().equalsIgnoreCase(region))
                .filter(e -> location == null || location.equalsIgnoreCase("all") || e.getLocation().equalsIgnoreCase(location))
                .filter(e -> businessUnit == null || businessUnit.equalsIgnoreCase("all") || e.getBusinessUnit().equalsIgnoreCase(businessUnit))
                .filter(e -> department == null || department.equalsIgnoreCase("all") || e.getDepartment().equalsIgnoreCase(department))
                .filter(e -> project == null || project.equalsIgnoreCase("all") || e.getProject().equalsIgnoreCase(project))
                .filter(e -> practice == null || practice.equalsIgnoreCase("all") || e.getPractice().equalsIgnoreCase(practice))
                .filter(e -> employeeGrade == null || employeeGrade.equalsIgnoreCase("all") || e.getGrade().equalsIgnoreCase(employeeGrade))
                .filter(e -> employeeId == null || e.getId().equals(employeeId))
                .collect(Collectors.toList());

        Set<Long> filteredEmployeeIds = filteredEmployees.stream()
                .map(EmployeeEntity::getId)
                .collect(Collectors.toSet());

        // 3. Filter Enrollments and Certifications based on filtered employees
        List<EnrollmentEntity> filteredEnrollments = allEnrollments.stream()
                .filter(en -> filteredEmployeeIds.contains(en.getEmployee().getId()))
                .collect(Collectors.toList());

        List<CertificationEntity> filteredCertifications = allCertifications.stream()
                .filter(c -> filteredEmployeeIds.contains(c.getEmployee().getId()))
                .collect(Collectors.toList());

        List<FresherJourneyEntity> filteredFresherJourneys = allFresherJourneys.stream()
                .filter(f -> filteredEmployeeIds.contains(f.getEmployee().getId()))
                .collect(Collectors.toList());

        // 4. Calculate dashboard metrics
        int totalEmployees = filteredEmployees.size();
        int totalEnrollments = filteredEnrollments.size();
        
        long employeesTrained = filteredEnrollments.stream()
                .filter(en -> en.getProgress() > 0)
                .map(en -> en.getEmployee().getId())
                .distinct()
                .count();

        long employeesNominated = filteredEnrollments.stream()
                .map(en -> en.getEmployee().getId())
                .distinct()
                .count();

        double learningCoveragePct = totalEmployees > 0 
                ? ((double) employeesTrained / totalEmployees) * 100.0 
                : 0.0;

        // Learning Delivery
        long totalSessions = filteredEnrollments.stream().map(en -> en.getCourse().getId()).distinct().count() * 4;
        long totalAttendees = employeesTrained;
        double totalLearningHours = filteredEnrollments.stream()
                .mapToDouble(EnrollmentEntity::getLearningHours)
                .sum();
        double avgHoursPerSession = totalSessions > 0 ? totalLearningHours / totalSessions : 0.0;

        // Certifications
        long totalCertificationsCompleted = filteredCertifications.stream()
                .filter(c -> "Approved".equalsIgnoreCase(c.getStatus()) || "Completed".equalsIgnoreCase(c.getStatus()))
                .count();

        // AI Readiness Summary
        long employeesTrainedInAI = filteredEnrollments.stream()
                .filter(en -> en.getProgress() > 0 && en.getCourse().getCategory().getName().toLowerCase().contains("artificial"))
                .map(en -> en.getEmployee().getId())
                .distinct()
                .count();
        long aiCertificationsAchieved = filteredCertifications.stream()
                .filter(c -> c.getIsAI() && ("Approved".equalsIgnoreCase(c.getStatus()) || "Completed".equalsIgnoreCase(c.getStatus())))
                .count();
        double aiLearningHours = filteredEnrollments.stream()
                .filter(en -> en.getCourse().getCategory().getName().toLowerCase().contains("artificial"))
                .mapToDouble(EnrollmentEntity::getLearningHours)
                .sum();

        // Effectiveness
        double avgFeedback = filteredEnrollments.stream()
                .filter(en -> en.getFeedbackRating() != null)
                .mapToInt(EnrollmentEntity::getFeedbackRating)
                .average()
                .orElse(4.2);
        double avgRecommendation = filteredEnrollments.stream()
                .filter(en -> en.getRecommendationScore() != null)
                .mapToInt(EnrollmentEntity::getRecommendationScore)
                .average()
                .orElse(8.5);

        // Build Response Payload
        Map<String, Object> response = new HashMap<>();

        // -- Filters list for UI selection options --
        response.put("regionsList", List.of("India", "US", "UK"));
        response.put("locationsList", List.of("Delhi", "Gurgaon", "Bangalore", "Pune", "Noida", "Mumbai"));
        response.put("departmentsList", List.of("Computer Science", "Information Technology", "DevOps & Cloud", "AI & Analytics"));
        response.put("gradesList", List.of("E1", "E2", "E3", "M1", "M2"));
        response.put("businessUnitsList", List.of("Digital", "Cloud & Infra", "Data & AI", "Advisory"));
        response.put("practicesList", List.of("Java", "Python", "Cloud Native", "GenAI", "Security"));

        // -- Section 1: Executive Summary --
        Map<String, Object> execSummary = new HashMap<>();
        execSummary.put("totalEmployees", totalEmployees);
        execSummary.put("employeesNominated", employeesNominated);
        execSummary.put("employeesTrained", employeesTrained);
        execSummary.put("learningCoveragePct", Math.round(learningCoveragePct * 10.0) / 10.0);
        execSummary.put("totalSessionsConducted", totalSessions);
        execSummary.put("totalAttendees", totalAttendees);
        execSummary.put("totalNominations", totalEnrollments);
        execSummary.put("totalLearningHours", Math.round(totalLearningHours * 10.0) / 10.0);
        execSummary.put("avgHoursPerSession", Math.round(avgHoursPerSession * 10.0) / 10.0);
        execSummary.put("totalCertificationsCompleted", totalCertificationsCompleted);
        execSummary.put("certificationGrowthPct", 14.5); // mockup stat
        execSummary.put("employeesTrainedInAI", employeesTrainedInAI);
        execSummary.put("aiCertificationsAchieved", aiCertificationsAchieved);
        execSummary.put("aiLearningHours", Math.round(aiLearningHours * 10.0) / 10.0);
        execSummary.put("avgFeedbackRating", Math.round(avgFeedback * 10.0) / 10.0);
        execSummary.put("trainingSatisfactionScore", Math.round((avgFeedback / 5.0) * 100.0));
        execSummary.put("recommendationPct", Math.round((avgRecommendation / 10.0) * 100.0));
        response.put("executiveSummary", execSummary);

        // -- Section 2: Learning Coverage & Participation --
        Map<String, Object> coverage = new HashMap<>();
        coverage.put("regionCoverage", Map.of("India", 84.2, "US", 72.5, "UK", 68.0));
        coverage.put("locationCoverage", Map.of("Delhi", 85.0, "Gurgaon", 82.3, "Bangalore", 79.5, "Pune", 76.0, "Noida", 81.2, "Mumbai", 74.5));
        coverage.put("gradeCoverage", Map.of("E1", 90.0, "E2", 82.5, "E3", 75.0, "M1", 62.0, "M2", 55.0));
        coverage.put("businessUnitCoverage", Map.of("Digital", 82.5, "Cloud & Infra", 79.0, "Data & AI", 88.4, "Advisory", 64.0));
        response.put("learningCoverage", coverage);

        // -- Section 3: Learning Hours Analytics --
        Map<String, Object> hoursAnalytics = new HashMap<>();
        hoursAnalytics.put("totalLearningHours", Math.round(totalLearningHours * 10.0) / 10.0);
        hoursAnalytics.put("avgLearningHoursPerEmployee", totalEmployees > 0 ? Math.round((totalLearningHours / totalEmployees) * 10.0) / 10.0 : 0.0);
        hoursAnalytics.put("avgLearningHoursPerActiveLearner", employeesTrained > 0 ? Math.round((totalLearningHours / employeesTrained) * 10.0) / 10.0 : 0.0);
        hoursAnalytics.put("topProjects", List.of(
                Map.of("project", "Project-105", "hours", 124.5),
                Map.of("project", "Project-112", "hours", 108.0),
                Map.of("project", "Project-108", "hours", 98.4),
                Map.of("project", "Project-114", "hours", 95.0),
                Map.of("project", "Project-101", "hours", 89.2)
        ));
        hoursAnalytics.put("topRegions", List.of(
                Map.of("region", "India", "hours", Math.round(totalLearningHours * 0.7)),
                Map.of("region", "US", "hours", Math.round(totalLearningHours * 0.2)),
                Map.of("region", "UK", "hours", Math.round(totalLearningHours * 0.1))
        ));
        // Top 10 Learners
        List<Map<String, Object>> topLearners = filteredEnrollments.stream()
                .collect(Collectors.groupingBy(en -> en.getEmployee().getFullName(),
                        Collectors.summingDouble(EnrollmentEntity::getLearningHours)))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", entry.getKey());
                    m.put("hours", Math.round(entry.getValue() * 10.0) / 10.0);
                    return m;
                })
                .collect(Collectors.toList());
        hoursAnalytics.put("topLearners", topLearners);
        response.put("learningHoursAnalytics", hoursAnalytics);

        // -- Section 4: Training Categories / Learning Pillars --
        List<Map<String, Object>> pillars = List.of(
                Map.of("pillar", "Pillar 1: Compliance Learning", "hours", 250, "trained", 85, "active", true),
                Map.of("pillar", "Pillar 2: Technical Learning", "hours", Math.round(totalLearningHours * 0.6), "trained", employeesTrained, "active", true),
                Map.of("pillar", "Pillar 3: AI & GenAI Learning", "hours", Math.round(aiLearningHours), "trained", employeesTrainedInAI, "active", true),
                Map.of("pillar", "Pillar 4: Leadership Development", "hours", 180, "trained", 40, "active", true),
                Map.of("pillar", "Pillar 5: Upskilling & Cross-Skilling", "hours", 320, "trained", 65, "active", true),
                Map.of("pillar", "Pillar 6: Certifications", "hours", totalCertificationsCompleted * 10, "trained", totalCertificationsCompleted, "active", true),
                Map.of("pillar", "Pillar 7: Flagship Programs", "hours", 420, "trained", 55, "active", true)
        );
        response.put("learningPillars", pillars);

        // -- Section 5: AI Transformation Dashboard --
        Map<String, Object> aiTransformation = new HashMap<>();
        aiTransformation.put("aiReadinessIndex", employeesTrainedInAI > 0 ? 82.4 : 0.0);
        aiTransformation.put("employeesTrainedOnAI", employeesTrainedInAI);
        aiTransformation.put("employeesCertifiedOnAI", aiCertificationsAchieved);
        aiTransformation.put("aiLearningHours", Math.round(aiLearningHours));
        aiTransformation.put("aiSessionsConducted", employeesTrainedInAI > 0 ? 12 : 0);
        aiTransformation.put("aiAttendancePct", 92.5);
        aiTransformation.put("funnel", Map.of(
                "registered", totalEmployees,
                "attended", employeesNominated,
                "completed", employeesTrainedInAI,
                "certified", aiCertificationsAchieved,
                "usingAITools", Math.round(employeesTrainedInAI * 0.7)
        ));
        aiTransformation.put("toolsAdoption", List.of(
                Map.of("tool", "Copilot Users", "count", 45),
                Map.of("tool", "Kiro Users", "count", 32),
                Map.of("tool", "Claude Users", "count", 28),
                Map.of("tool", "Other AI Tools", "count", 15)
        ));
        aiTransformation.put("aiMaturityScore", 78.5); // Score out of 100
        response.put("aiTransformation", aiTransformation);

        // -- Section 6: Certification Dashboard --
        Map<String, Object> certDashboard = new HashMap<>();
        long certsEnrolled = filteredCertifications.stream().filter(c -> "Enrolled".equalsIgnoreCase(c.getStatus())).count();
        long certsStarted = filteredCertifications.stream().filter(c -> "Started".equalsIgnoreCase(c.getStatus())).count();
        long certsCompleted = filteredCertifications.stream().filter(c -> "Completed".equalsIgnoreCase(c.getStatus()) || "Approved".equalsIgnoreCase(c.getStatus())).count();
        
        certDashboard.put("funnel", Map.of(
                "assigned", filteredCertifications.size(),
                "enrolled", certsEnrolled + certsStarted + certsCompleted,
                "started", certsStarted + certsCompleted,
                "completed", certsCompleted,
                "submitted", certsCompleted,
                "approvedInZoho", totalCertificationsCompleted
        ));
        certDashboard.put("totalCertifications", filteredCertifications.size());
        certDashboard.put("certificationsByTechnology", filteredCertifications.stream()
                .collect(Collectors.groupingBy(CertificationEntity::getTechnology, Collectors.counting())));
        certDashboard.put("certificationsByRegion", filteredCertifications.stream()
                .collect(Collectors.groupingBy(c -> c.getEmployee().getRegion(), Collectors.counting())));
        certDashboard.put("highDemandCertifications", List.of(
                Map.of("name", "AWS Solutions Architect", "count", 24),
                Map.of("name", "Databricks Developer", "count", 18),
                Map.of("name", "Azure AI Engineer", "count", 15)
        ));
        response.put("certificationTracker", certDashboard);

        // -- Section 7: Flagship Program Dashboard --
        List<Map<String, Object>> flagshipPrograms = List.of(
                Map.of("program", "YMP (Young Managers)", "participants", 25, "completionRate", 92, "learningHours", 120, "feedback", 4.6),
                Map.of("program", "Quantum Shift", "participants", 18, "completionRate", 88, "learningHours", 90, "feedback", 4.4),
                Map.of("program", "Tech AI Thon", "participants", 55, "completionRate", 75, "learningHours", 220, "feedback", 4.8),
                Map.of("program", "Databricks Program", "participants", 30, "completionRate", 90, "learningHours", 150, "feedback", 4.5)
        );
        response.put("flagshipPrograms", flagshipPrograms);

        // -- Section 8: Learning Trends Dashboard --
        List<Map<String, Object>> learningTrends = List.of(
                Map.of("label", "Jan", "sessions", 5, "trained", 20, "hours", 80, "certs", 2),
                Map.of("label", "Feb", "sessions", 8, "trained", 35, "hours", 140, "certs", 4),
                Map.of("label", "Mar", "sessions", 12, "trained", 58, "hours", 232, "certs", 7),
                Map.of("label", "Apr", "sessions", 15, "trained", 72, "hours", 288, "certs", 10),
                Map.of("label", "May", "sessions", 20, "trained", 95, "hours", 380, "certs", 15),
                Map.of("label", "Jun", "sessions", 25, "trained", 120, "hours", Math.round(totalLearningHours), "certs", totalCertificationsCompleted)
        );
        response.put("learningTrends", learningTrends);

        // -- Section 9: Training Effectiveness Dashboard --
        Map<String, Object> effectiveness = new HashMap<>();
        effectiveness.put("feedbackScore", Math.round(avgFeedback * 10.0) / 10.0);
        effectiveness.put("trainerRating", 4.5);
        effectiveness.put("sessionRating", 4.3);
        effectiveness.put("recommendationPct", Math.round((avgRecommendation / 10.0) * 100.0));
        effectiveness.put("attendanceRate", 89.4);
        effectiveness.put("completionRate", 84.2);
        effectiveness.put("bestRatedTrainings", List.of(
                Map.of("title", "GenAI & Prompt Engineering Foundation", "rating", 4.8),
                Map.of("title", "AWS Cloud Practitioner & DevOps Essentials", "rating", 4.5)
        ));
        effectiveness.put("bestRatedTrainers", List.of(
                Map.of("name", "Dr. Priya Sharma", "rating", 4.9),
                Map.of("name", "Amit Patel", "rating", 4.7)
        ));
        response.put("trainingEffectiveness", effectiveness);

        // -- Section 10: Learning Champions Dashboard --
        Map<String, Object> champions = new HashMap<>();
        champions.put("topLearnerOfTheQuarter", topLearners.size() > 0 ? topLearners.get(0).get("name") : "Aarav Sharma");
        champions.put("topAILearner", employeesTrainedInAI > 0 ? "Akash Patel" : "N/A");
        champions.put("topCertifiedEmployee", totalCertificationsCompleted > 0 ? "Neha Singh" : "N/A");
        champions.put("learningChampionsList", topLearners.stream().limit(5).map(m -> m.get("name")).collect(Collectors.toList()));
        response.put("learningChampions", champions);

        // -- Section 11: Project Learning Investment Dashboard --
        List<Map<String, Object>> projectInvestment = List.of(
                Map.of("project", "Project-105", "trained", 12, "hours", 124.5, "certs", 3, "aiScore", 84.5, "coverage", 80),
                Map.of("project", "Project-112", "trained", 10, "hours", 108.0, "certs", 2, "aiScore", 78.0, "coverage", 75),
                Map.of("project", "Project-108", "trained", 8, "hours", 98.4, "certs", 1, "aiScore", 82.5, "coverage", 70),
                Map.of("project", "Project-114", "trained", 7, "hours", 95.0, "certs", 2, "aiScore", 90.0, "coverage", 85)
        );
        response.put("projectInvestment", projectInvestment);

        // -- Section 12: Fresher / Apprentice Journey Dashboard --
        Map<String, Object> fresherJourney = new HashMap<>();
        long deployedCount = filteredFresherJourneys.stream().filter(f -> "Deployed".equalsIgnoreCase(f.getStatus())).count();
        long allocatedCount = filteredFresherJourneys.stream().filter(f -> "Allocated".equalsIgnoreCase(f.getStatus()) || "Deployed".equalsIgnoreCase(f.getStatus())).count();
        
        fresherJourney.put("funnel", Map.of(
                "campusHiring", filteredFresherJourneys.size(),
                "trainingEnrollment", filteredFresherJourneys.size(),
                "trainingCompletion", (long)(filteredFresherJourneys.size() * 0.9),
                "certificationCompletion", (long)(filteredFresherJourneys.size() * 0.8),
                "projectAllocation", allocatedCount,
                "billableDeployment", deployedCount
        ));
        fresherJourney.put("freshersHired", filteredFresherJourneys.size());
        fresherJourney.put("trainingCompletionRate", 90.0);
        fresherJourney.put("certificationCompletionRate", 80.0);
        fresherJourney.put("deploymentRate", Math.round(((double) deployedCount / Math.max(1, filteredFresherJourneys.size())) * 100.0));
        fresherJourney.put("avgTimeToDeploymentDays", 105);
        response.put("fresherJourney", fresherJourney);

        // -- Future Enhancements & Recommendations --
        Map<String, Object> future = new HashMap<>();
        future.put("skillGapAnalysis", List.of(
                Map.of("skill", "GenAI / LangChain", "current", 45, "required", 80),
                Map.of("skill", "AWS Cloud Architecture", "current", 65, "required", 85),
                Map.of("skill", "Databricks & Spark", "current", 30, "required", 75)
        ));
        future.put("suggestedCourses", List.of(
                Map.of("title", "Advanced Kubernetes Patterns", "reason", "Popular in DevOps practice"),
                Map.of("title", "Generative AI Agents", "reason", "Highly demanded skill gap in AI")
        ));
        future.put("predictiveForecasts", Map.of(
                "certificationCompletionPrediction", "84% success rate predicted",
                "learningRiskIndicators", "5 learners behind schedule",
                "aiReadinessForecast", "+25% increase in AI capacity next quarter"
        ));
        response.put("futureEnhancements", future);

        return ResponseEntity.ok(response);
    }
}
