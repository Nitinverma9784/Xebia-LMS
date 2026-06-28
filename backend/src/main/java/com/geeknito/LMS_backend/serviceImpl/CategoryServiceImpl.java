package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.CategoryRequestDTO;
import com.geeknito.LMS_backend.dto.CategoryResponseDTO;
import com.geeknito.LMS_backend.dto.CategoryWiseCourseResponseDTO;
import com.geeknito.LMS_backend.entity.learning.CategoryEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.mapper.CategoryMapper;
import com.geeknito.LMS_backend.repository.CategoryRepository;
import com.geeknito.LMS_backend.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryResponseDTO create(CategoryRequestDTO request) {
        CategoryEntity category = CategoryMapper.toEntity(request);
        CategoryEntity savedCategory = categoryRepository.save(category);
        return CategoryMapper.toResponseDTO(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAll() {
        return categoryRepository.findAll().stream()
                .map(CategoryMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getById(Long id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryMapper.toResponseDTO(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryWiseCourseResponseDTO getCategoryCourses(Long categoryId) {
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        if (category.getCourses() != null) {
            category.getCourses().size();
        }
        return CategoryMapper.toCategoryWiseCourseResponseDTO(category);
    }

    @Override
    public CategoryResponseDTO update(Long id, CategoryRequestDTO request) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        CategoryMapper.updateEntity(category, request);
        CategoryEntity updatedCategory = categoryRepository.save(category);
        return CategoryMapper.toResponseDTO(updatedCategory);
    }

    @Override
    public void delete(Long id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}
