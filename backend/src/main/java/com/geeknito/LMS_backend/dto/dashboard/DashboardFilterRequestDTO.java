package com.geeknito.LMS_backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardFilterRequestDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer year;
    private String quarter;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private String region;
    private String location;
    private String department;
    private String project;
    private String grade;
    private Long employeeId;

    public String getCacheKeySuffix() {
        StringBuilder sb = new StringBuilder();
        if (year != null) sb.append("_yr").append(year);
        if (quarter != null) sb.append("_qt").append(quarter);
        if (startDate != null) sb.append("_sd").append(startDate);
        if (endDate != null) sb.append("_ed").append(endDate);
        if (region != null) sb.append("_re").append(region.replaceAll("\\s+", ""));
        if (location != null) sb.append("_lo").append(location.replaceAll("\\s+", ""));
        if (department != null) sb.append("_de").append(department.replaceAll("\\s+", ""));
        if (project != null) sb.append("_pr").append(project.replaceAll("\\s+", ""));
        if (grade != null) sb.append("_gr").append(grade.replaceAll("\\s+", ""));
        if (employeeId != null) sb.append("_em").append(employeeId);
        return sb.length() == 0 ? "_default" : sb.toString();
    }
}
