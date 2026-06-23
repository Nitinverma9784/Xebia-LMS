package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.CourseRequest;
import com.geeknito.LMS_backend.entity.learning.CourseEntity;

import java.util.List;

public interface CourseService {
    CourseEntity create(CourseRequest request);
    List<CourseEntity> getAll();
    CourseEntity getById(Long id);
    CourseEntity update(Long id, CourseRequest request);
    void delete(Long id);
}
