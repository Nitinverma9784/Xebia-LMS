package com.geeknito.LMS_backend.service.dashboard;

import com.geeknito.LMS_backend.dto.dashboard.*;

public interface DashboardService {

    ExecutiveSummaryDTO getExecutiveSummary(DashboardFilterRequestDTO filter);

    LearningCoverageDTO getLearningCoverage(DashboardFilterRequestDTO filter);

    LearningHoursDTO getLearningHours(DashboardFilterRequestDTO filter);

    AIReadinessDTO getAIReadiness(DashboardFilterRequestDTO filter);

    CertificationFunnelDTO getCertificationFunnel(DashboardFilterRequestDTO filter);

    DashboardTrendsDTO getTrends(DashboardFilterRequestDTO filter);

    EffectivenessDTO getEffectiveness(DashboardFilterRequestDTO filter);
}
