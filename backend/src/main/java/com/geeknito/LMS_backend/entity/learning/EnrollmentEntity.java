package com.geeknito.LMS_backend.entity.learning;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private EmployeeEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseEntity course;

    @Column(nullable = false)
    @Builder.Default
    private Integer progress = 0; // 0 to 100

    @Column(nullable = false)
    @Builder.Default
    private Double learningHours = 0.0;

    @Column(nullable = false)
    private LocalDateTime enrollmentDate;

    @Column(length = 50)
    private String status; // ENROLLED, COMPLETED, IN_PROGRESS

    private Integer feedbackRating; // 1 to 5

    private Integer recommendationScore; // 1 to 10

    @Builder.Default
    private Boolean isFlagship = false;
}
