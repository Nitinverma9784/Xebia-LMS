package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.CategoryResponse;
import com.geeknito.LMS_backend.dto.CategoryRequest;
import com.geeknito.LMS_backend.entity.learning.CategoryEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.repository.CategoryRepository;
import com.geeknito.LMS_backend.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryEntity create(CategoryRequest request) {
        CategoryEntity category = CategoryEntity.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .description(request.getDescription())
                .color(request.getColor())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
     public List<CategoryResponse> getAll() {

        return categoryRepository.findAll()
            .stream()
            .map(category -> new CategoryResponse(
                    category.getName(),
                    category.getIcon(),
                    category.getDescription(),
                    category.getColor(),
                    category.getIsActive()
            ))
            .toList();
}
    @Override
    @Transactional(readOnly = true)
    public CategoryEntity getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Override
    public CategoryEntity update(Long id, CategoryRequest request) {
        CategoryEntity category = getById(id);
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        category.setColor(request.getColor());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        return categoryRepository.save(category);
    }

    @Override
    public void delete(Long id) {
        CategoryEntity category = getById(id);
        categoryRepository.delete(category);
    }
}
