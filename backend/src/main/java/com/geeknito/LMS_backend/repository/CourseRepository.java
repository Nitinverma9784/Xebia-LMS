package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    Optional<CourseEntity> findBySlug(String slug);

    @Query("SELECT c FROM CourseEntity c LEFT JOIN FETCH c.modules WHERE c.id = :id")
    Optional<CourseEntity> findByIdWithModules(@Param("id") Long id);

    @Query("SELECT c FROM CourseEntity c JOIN FETCH c.category")
    List<CourseEntity> findAllWithCategory();
}

