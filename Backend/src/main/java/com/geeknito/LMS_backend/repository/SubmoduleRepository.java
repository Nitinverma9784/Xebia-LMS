package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmoduleRepository extends JpaRepository<SubmoduleEntity, Long> {
    Optional<SubmoduleEntity> findBySlug(String slug);

    @Query("SELECT s FROM SubmoduleEntity s LEFT JOIN FETCH s.contents WHERE s.id = :id")
    Optional<SubmoduleEntity> findByIdWithContents(@Param("id") Long id);

    @Query("SELECT s FROM SubmoduleEntity s JOIN FETCH s.module")
    List<SubmoduleEntity> findAllWithModule();
}

