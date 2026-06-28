package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.CategoryRequestDTO;
import com.geeknito.LMS_backend.dto.CategoryResponseDTO;
import com.geeknito.LMS_backend.dto.CategoryWiseCourseResponseDTO;

import java.util.List;

public interface CategoryService {
    CategoryResponseDTO create(CategoryRequestDTO request);
    List<CategoryResponseDTO> getAll();
    CategoryResponseDTO getById(Long id);
    CategoryWiseCourseResponseDTO getCategoryCourses(Long categoryId);
    CategoryResponseDTO update(Long id, CategoryRequestDTO request);
    void delete(Long id);
}

