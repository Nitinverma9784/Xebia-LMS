package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Long>, JpaSpecificationExecutor<EnrollmentEntity> {
}
