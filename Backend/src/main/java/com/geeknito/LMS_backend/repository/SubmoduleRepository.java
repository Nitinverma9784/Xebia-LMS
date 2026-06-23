package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmoduleRepository extends JpaRepository<SubmoduleEntity, Long> {
    Optional<SubmoduleEntity> findBySlug(String slug);
}
