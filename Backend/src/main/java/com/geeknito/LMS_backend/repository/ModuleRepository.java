package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.ModuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, Long> {

    @Query("SELECT m FROM ModuleEntity m LEFT JOIN FETCH m.submodules WHERE m.id = :id")
    Optional<ModuleEntity> findByIdWithSubmodules(@Param("id") Long id);

    @Query("SELECT m FROM ModuleEntity m JOIN FETCH m.course")
    List<ModuleEntity> findAllWithCourse();
}

