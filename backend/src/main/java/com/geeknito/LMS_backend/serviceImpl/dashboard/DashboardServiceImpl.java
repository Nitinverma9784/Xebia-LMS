package com.geeknito.LMS_backend.serviceImpl.dashboard;

import com.geeknito.LMS_backend.cache.RedisService;
import com.geeknito.LMS_backend.dto.dashboard.*;
import com.geeknito.LMS_backend.entity.dashboard.*;
import com.geeknito.LMS_backend.repository.dashboard.*;
import com.geeknito.LMS_backend.service.dashboard.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificationRepository certificationRepository;
    private final FeedbackRepository feedbackRepository;
    private final AIActivityRepository aiActivityRepository;
    private final ProjectLearningRepository projectLearningRepository;
    private final RedisService redisService;

    // Cache TTL of 30 minutes
    private static final long CACHE_TTL_MINUTES = 30L;

    public DashboardServiceImpl(EmployeeRepository employeeRepository,
                                TrainingSessionRepository trainingSessionRepository,
                                EnrollmentRepository enrollmentRepository,
                                CertificationRepository certificationRepository,
                                FeedbackRepository feedbackRepository,
                                AIActivityRepository aiActivityRepository,
                                ProjectLearningRepository projectLearningRepository,
                                RedisService redisService) {
        this.employeeRepository = employeeRepository;
        this.trainingSessionRepository = trainingSessionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.certificationRepository = certificationRepository;
        this.feedbackRepository = feedbackRepository;
        this.aiActivityRepository = aiActivityRepository;
        this.projectLearningRepository = projectLearningRepository;
        this.redisService = redisService;
    }

    private LocalDateTime[] getFilterDateRange(DashboardFilterRequestDTO filter) {
        java.time.LocalDate start = filter.getStartDate();
        java.time.LocalDate end = filter.getEndDate();

        if (filter.getYear() != null) {
            int y = filter.getYear();
            if ("Q1".equalsIgnoreCase(filter.getQuarter())) {
                start = java.time.LocalDate.of(y, 1, 1);
                end = java.time.LocalDate.of(y, 3, 31);
            } else if ("Q2".equalsIgnoreCase(filter.getQuarter())) {
                start = java.time.LocalDate.of(y, 4, 1);
                end = java.time.LocalDate.of(y, 6, 30);
            } else if ("Q3".equalsIgnoreCase(filter.getQuarter())) {
                start = java.time.LocalDate.of(y, 7, 1);
                end = java.time.LocalDate.of(y, 9, 30);
            } else if ("Q4".equalsIgnoreCase(filter.getQuarter())) {
                start = java.time.LocalDate.of(y, 10, 1);
                end = java.time.LocalDate.of(y, 12, 31);
            } else {
                start = java.time.LocalDate.of(y, 1, 1);
                end = java.time.LocalDate.of(y, 12, 31);
            }
        }

        LocalDateTime startDateTime = start != null ? start.atStartOfDay() : null;
        LocalDateTime endDateTime = end != null ? end.atTime(23, 59, 59) : null;
        return new LocalDateTime[]{startDateTime, endDateTime};
    }

    @Override
    public ExecutiveSummaryDTO getExecutiveSummary(DashboardFilterRequestDTO filter) {
        String cacheKey = "dashboard_executive" + filter.getCacheKeySuffix();
        Object cached = redisService.get(cacheKey);
        if (cached instanceof ExecutiveSummaryDTO) {
            return (ExecutiveSummaryDTO) cached;
        }

        LocalDateTime[] dates = getFilterDateRange(filter);
        LocalDateTime start = dates[0];
        LocalDateTime end = dates[1];

        long totalEmployees = employeeRepository.countActiveEmployees(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId()
        );

        long employeesNominated = enrollmentRepository.countNominatedEmployees(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        long employeesTrained = enrollmentRepository.countTrainedEmployees(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        double learningCoverage = totalEmployees > 0 ? ((double) employeesTrained / totalEmployees) * 100.0 : 0.0;

        // Fetch distinct training sessions count from filtered enrollments
        List<EnrollmentEntity> enrollments = enrollmentRepository.findFilteredEnrollments(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );
        long totalSessions = enrollments.stream()
                .map(en -> en.getTrainingSession().getId())
                .distinct()
                .count();

        long totalLearningHours = enrollmentRepository.sumLearningHours(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        long certificationsCompleted = certificationRepository.countCompletedCertifications(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        long aiEmployees = aiActivityRepository.countAITrainedOrCertified(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId()
        );

        long aiLearningHours = aiActivityRepository.sumAILearningHours(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId()
        );

        double feedbackRating = feedbackRepository.getAverageFeedbackRating(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        ExecutiveSummaryDTO dto = ExecutiveSummaryDTO.builder()
                .totalEmployees(totalEmployees)
                .employeesNominated(employeesNominated)
                .employeesTrained(employeesTrained)
                .learningCoverage(Math.round(learningCoverage * 100.0) / 100.0)
                .totalSessions(totalSessions)
                .totalLearningHours(totalLearningHours)
                .certificationsCompleted(certificationsCompleted)
                .aiEmployees(aiEmployees)
                .aiLearningHours(aiLearningHours)
                .feedbackRating(Math.round(feedbackRating * 100.0) / 100.0)
                .build();

        redisService.set(cacheKey, dto, CACHE_TTL_MINUTES);
        return dto;
    }

    @Override
    public LearningCoverageDTO getLearningCoverage(DashboardFilterRequestDTO filter) {
        String cacheKey = "dashboard_learning_coverage" + filter.getCacheKeySuffix(); // Wait, the key in instruction was dashboard_trends etc, let's keep name matching or dashboard_learning_coverage
        // Wait, the prompt lists dashboard cache keys:
        // dashboard_executive, dashboard_learning_hours, dashboard_ai, dashboard_certification, dashboard_trends, dashboard_effectiveness
        // Let's map learning-coverage to dashboard_executive or dashboard_learning_hours? No, let's use:
        // dashboard_learning_coverage as base key, or let's use dashboard_executive for learning coverage since they represent coverage? No, let's use dashboard_learning_coverage. Let's make sure it uses a key starting with dashboard_!
        Object cached = redisService.get(cacheKey);
        if (cached instanceof LearningCoverageDTO) {
            return (LearningCoverageDTO) cached;
        }

        LocalDateTime[] dates = getFilterDateRange(filter);
        LocalDateTime start = dates[0];
        LocalDateTime end = dates[1];

        // Fetch all active employees
        List<EmployeeEntity> employees = employeeRepository.findAll().stream()
                .filter(EmployeeEntity::getActive)
                .filter(e -> filter.getRegion() == null || e.getRegion().equalsIgnoreCase(filter.getRegion()))
                .filter(e -> filter.getLocation() == null || e.getLocation().equalsIgnoreCase(filter.getLocation()))
                .filter(e -> filter.getDepartment() == null || e.getDepartment().equalsIgnoreCase(filter.getDepartment()))
                .filter(e -> filter.getProject() == null || e.getProject().equalsIgnoreCase(filter.getProject()))
                .filter(e -> filter.getGrade() == null || e.getEmployeeGrade().equalsIgnoreCase(filter.getGrade()))
                .filter(e -> filter.getEmployeeId() == null || e.getId().equals(filter.getEmployeeId()))
                .collect(Collectors.toList());

        // Fetch all completed enrollments
        List<EnrollmentEntity> completedEnrollments = enrollmentRepository.findFilteredEnrollments(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        ).stream().filter(en -> "COMPLETED".equalsIgnoreCase(en.getStatus())).collect(Collectors.toList());

        // Set of trained employee IDs
        Set<Long> trainedEmpIds = completedEnrollments.stream()
                .map(en -> en.getEmployee().getId())
                .collect(Collectors.toSet());

        // 1. Region Wise Coverage
        Map<String, List<EmployeeEntity>> empByRegion = employees.stream()
                .filter(e -> e.getRegion() != null)
                .collect(Collectors.groupingBy(EmployeeEntity::getRegion));

        List<LearningCoverageDTO.CoverageItem> regionCoverage = new ArrayList<>();
        empByRegion.forEach((region, list) -> {
            long total = list.size();
            long trained = list.stream().filter(e -> trainedEmpIds.contains(e.getId())).count();
            double pct = total > 0 ? ((double) trained / total) * 100.0 : 0.0;
            regionCoverage.add(new LearningCoverageDTO.CoverageItem(region, Math.round(pct * 100.0) / 100.0));
        });

        // 2. Location Wise Coverage
        Map<String, List<EmployeeEntity>> empByLoc = employees.stream()
                .filter(e -> e.getLocation() != null)
                .collect(Collectors.groupingBy(EmployeeEntity::getLocation));

        List<LearningCoverageDTO.CoverageItem> locCoverage = new ArrayList<>();
        empByLoc.forEach((loc, list) -> {
            long total = list.size();
            long trained = list.stream().filter(e -> trainedEmpIds.contains(e.getId())).count();
            double pct = total > 0 ? ((double) trained / total) * 100.0 : 0.0;
            locCoverage.add(new LearningCoverageDTO.CoverageItem(loc, Math.round(pct * 100.0) / 100.0));
        });

        // 3. Project Participation
        Map<String, List<EmployeeEntity>> empByProj = employees.stream()
                .filter(e -> e.getProject() != null)
                .collect(Collectors.groupingBy(EmployeeEntity::getProject));

        List<LearningCoverageDTO.CoverageItem> projCoverage = new ArrayList<>();
        empByProj.forEach((proj, list) -> {
            long total = list.size();
            long trained = list.stream().filter(e -> trainedEmpIds.contains(e.getId())).count();
            double pct = total > 0 ? ((double) trained / total) * 100.0 : 0.0;
            projCoverage.add(new LearningCoverageDTO.CoverageItem(proj, Math.round(pct * 100.0) / 100.0));
        });

        // 4. Business Unit Coverage
        Map<String, List<EmployeeEntity>> empByBu = employees.stream()
                .filter(e -> e.getBusinessUnit() != null)
                .collect(Collectors.groupingBy(EmployeeEntity::getBusinessUnit));

        List<LearningCoverageDTO.CoverageItem> buCoverage = new ArrayList<>();
        empByBu.forEach((bu, list) -> {
            long total = list.size();
            long trained = list.stream().filter(e -> trainedEmpIds.contains(e.getId())).count();
            double pct = total > 0 ? ((double) trained / total) * 100.0 : 0.0;
            buCoverage.add(new LearningCoverageDTO.CoverageItem(bu, Math.round(pct * 100.0) / 100.0));
        });

        LearningCoverageDTO dto = LearningCoverageDTO.builder()
                .regionWiseCoverage(regionCoverage)
                .locationWiseCoverage(locCoverage)
                .projectParticipation(projCoverage)
                .businessUnitCoverage(buCoverage)
                .build();

        redisService.set(cacheKey, dto, CACHE_TTL_MINUTES);
        return dto;
    }

    @Override
    public LearningHoursDTO getLearningHours(DashboardFilterRequestDTO filter) {
        String cacheKey = "dashboard_learning_hours" + filter.getCacheKeySuffix();
        Object cached = redisService.get(cacheKey);
        if (cached instanceof LearningHoursDTO) {
            return (LearningHoursDTO) cached;
        }

        LocalDateTime[] dates = getFilterDateRange(filter);
        LocalDateTime start = dates[0];
        LocalDateTime end = dates[1];

        long totalEmployees = employeeRepository.countActiveEmployees(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId()
        );

        long totalHours = enrollmentRepository.sumLearningHours(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        double averageHours = totalEmployees > 0 ? (double) totalHours / totalEmployees : 0.0;

        List<EnrollmentEntity> enrollments = enrollmentRepository.findFilteredEnrollments(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        ).stream().filter(en -> "COMPLETED".equalsIgnoreCase(en.getStatus())).collect(Collectors.toList());

        // Top Learners
        Map<EmployeeEntity, Double> hoursByEmp = new HashMap<>();
        enrollments.forEach(en -> {
            EmployeeEntity emp = en.getEmployee();
            int hours = en.getTrainingSession().getDurationHours() != null ? en.getTrainingSession().getDurationHours() : 0;
            hoursByEmp.put(emp, hoursByEmp.getOrDefault(emp, 0.0) + hours);
        });

        List<LearningHoursDTO.LearnerItem> topLearners = hoursByEmp.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(10)
                .map(entry -> LearningHoursDTO.LearnerItem.builder()
                        .employeeCode(entry.getKey().getEmployeeCode())
                        .name(entry.getKey().getName())
                        .hours(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        // Top Projects
        Map<String, Double> hoursByProj = new HashMap<>();
        enrollments.forEach(en -> {
            String proj = en.getEmployee().getProject();
            if (proj != null) {
                int hours = en.getTrainingSession().getDurationHours() != null ? en.getTrainingSession().getDurationHours() : 0;
                hoursByProj.put(proj, hoursByProj.getOrDefault(proj, 0.0) + hours);
            }
        });

        List<LearningHoursDTO.ProjectItem> topProjects = hoursByProj.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(10)
                .map(entry -> LearningHoursDTO.ProjectItem.builder()
                        .projectName(entry.getKey())
                        .hours(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        LearningHoursDTO dto = LearningHoursDTO.builder()
                .totalHours(totalHours)
                .averageHoursPerEmployee(Math.round(averageHours * 100.0) / 100.0)
                .topLearners(topLearners)
                .topProjects(topProjects)
                .build();

        redisService.set(cacheKey, dto, CACHE_TTL_MINUTES);
        return dto;
    }

    @Override
    public AIReadinessDTO getAIReadiness(DashboardFilterRequestDTO filter) {
        String cacheKey = "dashboard_ai" + filter.getCacheKeySuffix();
        Object cached = redisService.get(cacheKey);
        if (cached instanceof AIReadinessDTO) {
            return (AIReadinessDTO) cached;
        }

        List<AIActivityEntity> aiList = aiActivityRepository.findFilteredAIActivity(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId()
        );

        long aiTrained = aiList.stream().filter(ai -> Boolean.TRUE.equals(ai.getAiTrainingCompleted())).count();
        long aiCertified = aiList.stream().filter(ai -> Boolean.TRUE.equals(ai.getAiCertified())).count();
        long aiHours = aiList.stream().mapToLong(ai -> ai.getAiLearningHours() != null ? ai.getAiLearningHours() : 0).sum();
        long copilot = aiList.stream().filter(ai -> Boolean.TRUE.equals(ai.getCopilotUser())).count();
        long kiro = aiList.stream().filter(ai -> Boolean.TRUE.equals(ai.getKiroUser())).count();
        long claude = aiList.stream().filter(ai -> Boolean.TRUE.equals(ai.getClaudeUser())).count();

        // Calculate AI Maturity Score
        double totalScore = 0.0;
        for (AIActivityEntity ai : aiList) {
            double score = 0.0;
            if (Boolean.TRUE.equals(ai.getAiTrainingCompleted())) score += 20.0;
            if (Boolean.TRUE.equals(ai.getAiCertified())) score += 30.0;
            if (Boolean.TRUE.equals(ai.getCopilotUser())) score += 10.0;
            if (Boolean.TRUE.equals(ai.getKiroUser())) score += 10.0;
            if (Boolean.TRUE.equals(ai.getClaudeUser())) score += 10.0;
            if (Boolean.TRUE.equals(ai.getAiPowerUser())) score += 10.0;
            if (Boolean.TRUE.equals(ai.getAiMentor())) score += 10.0;
            totalScore += score;
        }
        double avgMaturity = aiList.isEmpty() ? 0.0 : totalScore / aiList.size();

        AIReadinessDTO dto = AIReadinessDTO.builder()
                .aiTrainedEmployees(aiTrained)
                .aiCertifiedEmployees(aiCertified)
                .aiLearningHours(aiHours)
                .copilotUsers(copilot)
                .kiroUsers(kiro)
                .claudeUsers(claude)
                .aiMaturityScore(Math.round(avgMaturity * 100.0) / 100.0)
                .build();

        redisService.set(cacheKey, dto, CACHE_TTL_MINUTES);
        return dto;
    }

    @Override
    public CertificationFunnelDTO getCertificationFunnel(DashboardFilterRequestDTO filter) {
        String cacheKey = "dashboard_certification" + filter.getCacheKeySuffix();
        Object cached = redisService.get(cacheKey);
        if (cached instanceof CertificationFunnelDTO) {
            return (CertificationFunnelDTO) cached;
        }

        LocalDateTime[] dates = getFilterDateRange(filter);
        LocalDateTime start = dates[0];
        LocalDateTime end = dates[1];

        List<CertificationEntity> certs = certificationRepository.findFilteredCertifications(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        long assigned = certs.stream().filter(c -> "ASSIGNED".equalsIgnoreCase(c.getStatus())).count();
        long enrolled = certs.stream().filter(c -> "ENROLLED".equalsIgnoreCase(c.getStatus())).count();
        long started = certs.stream().filter(c -> "STARTED".equalsIgnoreCase(c.getStatus())).count();
        long completed = certs.stream().filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus())).count();
        long submitted = certs.stream().filter(c -> "SUBMITTED".equalsIgnoreCase(c.getStatus())).count();
        long approved = certs.stream().filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus())).count();

        // Technology-wise counts
        Map<String, Long> techCounts = certs.stream()
                .filter(c -> c.getTechnology() != null)
                .collect(Collectors.groupingBy(CertificationEntity::getTechnology, Collectors.counting()));

        List<CertificationFunnelDTO.TechCountItem> techList = techCounts.entrySet().stream()
                .map(entry -> new CertificationFunnelDTO.TechCountItem(entry.getKey(), entry.getValue()))
                .sorted((t1, t2) -> Long.compare(t2.getCount(), t1.getCount()))
                .collect(Collectors.toList());

        CertificationFunnelDTO dto = CertificationFunnelDTO.builder()
                .assigned(assigned)
                .enrolled(enrolled)
                .started(started)
                .completed(completed)
                .submitted(submitted)
                .approved(approved)
                .technologyWise(techList)
                .build();

        redisService.set(cacheKey, dto, CACHE_TTL_MINUTES);
        return dto;
    }

    @Override
    public DashboardTrendsDTO getTrends(DashboardFilterRequestDTO filter) {
        String cacheKey = "dashboard_trends" + filter.getCacheKeySuffix();
        Object cached = redisService.get(cacheKey);
        if (cached instanceof DashboardTrendsDTO) {
            return (DashboardTrendsDTO) cached;
        }

        LocalDateTime[] dates = getFilterDateRange(filter);
        LocalDateTime start = dates[0];
        LocalDateTime end = dates[1];

        // Fetch completed enrollments
        List<EnrollmentEntity> enrollments = enrollmentRepository.findFilteredEnrollments(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        ).stream()
                .filter(en -> "COMPLETED".equalsIgnoreCase(en.getStatus()) && en.getCompletedDate() != null)
                .collect(Collectors.toList());

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        DateTimeFormatter yearFormatter = DateTimeFormatter.ofPattern("yyyy");

        // Monthly Grouping
        Map<String, Long> monthlyMap = enrollments.stream()
                .collect(Collectors.groupingBy(
                        en -> en.getCompletedDate().format(monthFormatter),
                        TreeMap::new,
                        Collectors.counting()
                ));

        List<DashboardTrendsDTO.TrendItem> monthlyTrends = monthlyMap.entrySet().stream()
                .map(entry -> new DashboardTrendsDTO.TrendItem(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // Quarterly Grouping
        Map<String, Long> quarterlyMap = enrollments.stream()
                .collect(Collectors.groupingBy(
                        en -> {
                            int month = en.getCompletedDate().getMonthValue();
                            int year = en.getCompletedDate().getYear();
                            String quarter = "Q" + ((month - 1) / 3 + 1);
                            return year + "-" + quarter;
                        },
                        TreeMap::new,
                        Collectors.counting()
                ));

        List<DashboardTrendsDTO.TrendItem> quarterlyTrends = quarterlyMap.entrySet().stream()
                .map(entry -> new DashboardTrendsDTO.TrendItem(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // Yearly Grouping
        Map<String, Long> yearlyMap = enrollments.stream()
                .collect(Collectors.groupingBy(
                        en -> en.getCompletedDate().format(yearFormatter),
                        TreeMap::new,
                        Collectors.counting()
                ));

        List<DashboardTrendsDTO.TrendItem> yearlyTrends = yearlyMap.entrySet().stream()
                .map(entry -> new DashboardTrendsDTO.TrendItem(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        DashboardTrendsDTO dto = DashboardTrendsDTO.builder()
                .monthly(monthlyTrends)
                .quarterly(quarterlyTrends)
                .yearly(yearlyTrends)
                .build();

        redisService.set(cacheKey, dto, CACHE_TTL_MINUTES);
        return dto;
    }

    @Override
    public EffectivenessDTO getEffectiveness(DashboardFilterRequestDTO filter) {
        String cacheKey = "dashboard_effectiveness" + filter.getCacheKeySuffix();
        Object cached = redisService.get(cacheKey);
        if (cached instanceof EffectivenessDTO) {
            return (EffectivenessDTO) cached;
        }

        LocalDateTime[] dates = getFilterDateRange(filter);
        LocalDateTime start = dates[0];
        LocalDateTime end = dates[1];

        double avgFeedback = feedbackRepository.getAverageFeedbackRating(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        double avgTrainer = feedbackRepository.getAverageTrainerRating(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        // Completion percentage from all enrollments
        List<EnrollmentEntity> enrollments = enrollmentRepository.findFilteredEnrollments(
                filter.getRegion(), filter.getLocation(), filter.getDepartment(),
                filter.getProject(), filter.getGrade(), filter.getEmployeeId(),
                start, end
        );

        long total = enrollments.size();
        long completed = enrollments.stream()
                .filter(en -> "COMPLETED".equalsIgnoreCase(en.getStatus()))
                .count();

        double completionPct = total > 0 ? ((double) completed / total) * 100.0 : 0.0;

        EffectivenessDTO dto = EffectivenessDTO.builder()
                .feedbackScore(Math.round(avgFeedback * 100.0) / 100.0)
                .trainerRating(Math.round(avgTrainer * 100.0) / 100.0)
                .completionPercentage(Math.round(completionPct * 100.0) / 100.0)
                .build();

        redisService.set(cacheKey, dto, CACHE_TTL_MINUTES);
        return dto;
    }
}
