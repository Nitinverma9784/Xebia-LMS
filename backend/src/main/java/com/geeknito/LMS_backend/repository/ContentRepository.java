package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.ContentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<ContentEntity, Long> {

    @Query("SELECT c FROM ContentEntity c JOIN FETCH c.submodule")
    List<ContentEntity> findAllWithSubmodule();
}

