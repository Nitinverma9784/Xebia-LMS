package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.CourseRequestDTO;
import com.geeknito.LMS_backend.dto.CourseResponseDTO;

import java.util.List;

public interface CourseService {
    CourseResponseDTO create(CourseRequestDTO request);
    List<CourseResponseDTO> getAll();
    CourseResponseDTO getById(Long id);
    CourseResponseDTO update(Long id, CourseRequestDTO request);
    void delete(Long id);
}
