package com.geeknito.LMS_backend.entity.learning;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private EmployeeEntity employee;

    @Column(nullable = false, length = 150)
    private String name; // e.g. AWS Solutions Architect

    @Column(length = 50)
    private String technology; // e.g. AWS, Databricks, GCP

    @Column(length = 50)
    private String status; // Assigned, Enrolled, Started, Completed, Submitted, Approved

    private LocalDateTime completionDate;

    @Builder.Default
    private Boolean isAI = false; // Is AI/GenAI certification
}
