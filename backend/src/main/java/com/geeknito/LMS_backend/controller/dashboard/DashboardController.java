package com.geeknito.LMS_backend.controller.dashboard;

import com.geeknito.LMS_backend.dto.dashboard.*;
import com.geeknito.LMS_backend.response.ApiResponse;
import com.geeknito.LMS_backend.service.dashboard.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/executive-summary")
    public ResponseEntity<ApiResponse> getExecutiveSummary(DashboardFilterRequestDTO filter) {
        ExecutiveSummaryDTO data = dashboardService.getExecutiveSummary(filter);
        ApiResponse response = new ApiResponse("Executive summary retrieved successfully", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/learning-coverage")
    public ResponseEntity<ApiResponse> getLearningCoverage(DashboardFilterRequestDTO filter) {
        LearningCoverageDTO data = dashboardService.getLearningCoverage(filter);
        ApiResponse response = new ApiResponse("Learning coverage retrieved successfully", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/learning-hours")
    public ResponseEntity<ApiResponse> getLearningHours(DashboardFilterRequestDTO filter) {
        LearningHoursDTO data = dashboardService.getLearningHours(filter);
        ApiResponse response = new ApiResponse("Learning hours retrieved successfully", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ai-readiness")
    public ResponseEntity<ApiResponse> getAIReadiness(DashboardFilterRequestDTO filter) {
        AIReadinessDTO data = dashboardService.getAIReadiness(filter);
        ApiResponse response = new ApiResponse("AI readiness retrieved successfully", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/certification")
    public ResponseEntity<ApiResponse> getCertification(DashboardFilterRequestDTO filter) {
        CertificationFunnelDTO data = dashboardService.getCertificationFunnel(filter);
        ApiResponse response = new ApiResponse("Certification funnel retrieved successfully", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse> getTrends(DashboardFilterRequestDTO filter) {
        DashboardTrendsDTO data = dashboardService.getTrends(filter);
        ApiResponse response = new ApiResponse("Learning trends retrieved successfully", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/effectiveness")
    public ResponseEntity<ApiResponse> getEffectiveness(DashboardFilterRequestDTO filter) {
        EffectivenessDTO data = dashboardService.getEffectiveness(filter);
        ApiResponse response = new ApiResponse("Training effectiveness retrieved successfully", data);
        return ResponseEntity.ok(response);
    }
}
