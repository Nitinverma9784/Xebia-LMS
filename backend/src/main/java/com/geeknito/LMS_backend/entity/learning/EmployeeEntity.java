package com.geeknito.LMS_backend.entity.learning;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 20)
    private String grade; // e.g. E1, E2, E3, M1

    @Column(length = 50)
    private String region; // e.g. India, US, UK

    @Column(length = 100)
    private String location; // e.g. Delhi, Gurgaon, Bangalore, Pune

    @Column(length = 100)
    private String businessUnit; // e.g. Digital, Cloud, Data

    @Column(length = 100)
    private String department; // e.g. CSE, IT, DevOps

    @Column(length = 100)
    private String practice; // e.g. Java, Python, Cloud, AI

    @Column(length = 100)
    private String project; // e.g. Xebia-LMS, Client-A, Client-B

    @Column(length = 500)
    private String avatar;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
