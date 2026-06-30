package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.CourseRequestDTO;
import com.geeknito.LMS_backend.dto.CourseResponseDTO;
import com.geeknito.LMS_backend.entity.learning.CategoryEntity;
import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.mapper.CourseMapper;
import com.geeknito.LMS_backend.repository.CategoryRepository;
import com.geeknito.LMS_backend.repository.CourseRepository;
import com.geeknito.LMS_backend.service.CourseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    public CourseServiceImpl(CourseRepository courseRepository, CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CourseResponseDTO create(CourseRequestDTO request) {
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        CourseEntity course = CourseMapper.toEntity(request, category);
        CourseEntity savedCourse = courseRepository.save(course);
        return CourseMapper.toResponseDTO(savedCourse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAll() {
        return courseRepository.findAll().stream()
                .map(course -> {
                    // Initialize lazy associations inside the read-only transaction
                    if (course.getCategory() != null) {
                        course.getCategory().getName();
                    }
                    return CourseMapper.toResponseDTO(course);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponseDTO getById(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        if (course.getModules() != null) {
            course.getModules().forEach(module -> {
                if (module.getSubmodules() != null) {
                    module.getSubmodules().forEach(submodule -> {
                        if (submodule.getContents() != null) {
                            submodule.getContents().size();
                        }
                    });
                }
            });
        }
        return CourseMapper.toResponseDTOWithModules(course);
    }

    @Override
    public CourseResponseDTO update(Long id, CourseRequestDTO request) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        CourseMapper.updateEntity(course, request, category);
        CourseEntity updatedCourse = courseRepository.save(course);
        return CourseMapper.toResponseDTO(updatedCourse);
    }

    @Override
    public void delete(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        courseRepository.delete(course);
    }
}
