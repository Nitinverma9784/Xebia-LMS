package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.dto.CategoryRequest;
import com.geeknito.LMS_backend.dto.CategoryResponse;
import com.geeknito.LMS_backend.entity.learning.CategoryEntity;
import com.geeknito.LMS_backend.response.ApiResponse;
import com.geeknito.LMS_backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryEntity category = categoryService.create(request);
        ApiResponse response = new ApiResponse("Category created successfully", category);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

  @GetMapping
public ResponseEntity<ApiResponse> getAllCategories() {

    List<CategoryResponse> categories = categoryService.getAll();

    ApiResponse response =
            new ApiResponse(
                    "Categories retrieved successfully",
                    categories
            );

    return ResponseEntity.ok(response);
}

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getCategoryById(@PathVariable Long id) {
        CategoryEntity category = categoryService.getById(id);
        ApiResponse response = new ApiResponse("Category retrieved successfully", category);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        CategoryEntity category = categoryService.update(id, request);
        ApiResponse response = new ApiResponse("Category updated successfully", category);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        ApiResponse response = new ApiResponse("Category deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
