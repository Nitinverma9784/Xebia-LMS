package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.CategoryRequest;
import com.geeknito.LMS_backend.entity.learning.CategoryEntity;

import java.util.List;

public interface CategoryService {
    CategoryEntity create(CategoryRequest request);
    List<CategoryEntity> getAll();
    CategoryEntity getById(Long id);
    CategoryEntity update(Long id, CategoryRequest request);
    void delete(Long id);
}
