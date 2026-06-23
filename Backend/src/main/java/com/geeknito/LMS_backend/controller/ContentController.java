package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.dto.ContentRequest;
import com.geeknito.LMS_backend.entity.learning.ContentEntity;
import com.geeknito.LMS_backend.response.ApiResponse;
import com.geeknito.LMS_backend.service.ContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse> createContent(@Valid @RequestBody ContentRequest request) {
        ContentEntity content = contentService.create(request);
        ApiResponse response = new ApiResponse("Content created successfully", content);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllContents() {
        List<ContentEntity> contents = contentService.getAll();
        ApiResponse response = new ApiResponse("Contents retrieved successfully", contents);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getContentById(@PathVariable Long id) {
        ContentEntity content = contentService.getById(id);
        ApiResponse response = new ApiResponse("Content retrieved successfully", content);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse> updateContent(@PathVariable Long id, @Valid @RequestBody ContentRequest request) {
        ContentEntity content = contentService.update(id, request);
        ApiResponse response = new ApiResponse("Content updated successfully", content);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteContent(@PathVariable Long id) {
        contentService.delete(id);
        ApiResponse response = new ApiResponse("Content deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
