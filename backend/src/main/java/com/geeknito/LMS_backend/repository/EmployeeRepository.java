package com.geeknito.LMS_backend.repository;

import com.geeknito.LMS_backend.entity.learning.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long> {
}
