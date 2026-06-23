package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    Optional<CourseEntity> findBySlug(String slug);
}
