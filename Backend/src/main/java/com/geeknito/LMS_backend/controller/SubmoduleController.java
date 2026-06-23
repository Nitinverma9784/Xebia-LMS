package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.dto.SubmoduleRequest;
import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;
import com.geeknito.LMS_backend.response.ApiResponse;
import com.geeknito.LMS_backend.service.SubmoduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submodules")
public class SubmoduleController {

    private final SubmoduleService submoduleService;

    public SubmoduleController(SubmoduleService submoduleService) {
        this.submoduleService = submoduleService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createSubmodule(@Valid @RequestBody SubmoduleRequest request) {
        SubmoduleEntity submodule = submoduleService.create(request);
        ApiResponse response = new ApiResponse("Submodule created successfully", submodule);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllSubmodules() {
        List<SubmoduleEntity> submodules = submoduleService.getAll();
        ApiResponse response = new ApiResponse("Submodules retrieved successfully", submodules);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getSubmoduleById(@PathVariable Long id) {
        SubmoduleEntity submodule = submoduleService.getById(id);
        ApiResponse response = new ApiResponse("Submodule retrieved successfully", submodule);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateSubmodule(@PathVariable Long id, @Valid @RequestBody SubmoduleRequest request) {
        SubmoduleEntity submodule = submoduleService.update(id, request);
        ApiResponse response = new ApiResponse("Submodule updated successfully", submodule);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteSubmodule(@PathVariable Long id) {
        submoduleService.delete(id);
        ApiResponse response = new ApiResponse("Submodule deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
