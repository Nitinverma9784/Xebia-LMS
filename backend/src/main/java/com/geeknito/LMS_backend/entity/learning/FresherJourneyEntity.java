package com.geeknito.LMS_backend.entity.learning;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fresher_journeys")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FresherJourneyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private EmployeeEntity employee;

    private LocalDateTime hiredDate;
    private LocalDateTime trainingEnrollmentDate;
    private LocalDateTime trainingCompletionDate;
    private LocalDateTime certificationCompletionDate;
    private LocalDateTime projectAllocationDate;
    private LocalDateTime billableDeploymentDate;

    @Column(length = 50)
    private String status; // Hired, Training, Certified, Allocated, Deployed
}
