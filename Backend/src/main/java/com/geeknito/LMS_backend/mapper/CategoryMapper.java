package com.geeknito.LMS_backend.mapper;

import com.geeknito.LMS_backend.dto.CategoryResponseDTO;
import com.geeknito.LMS_backend.dto.CategoryRequestDTO;
import com.geeknito.LMS_backend.dto.CategoryWiseCourseResponseDTO;
import com.geeknito.LMS_backend.dto.CourseResponseDTO;
import com.geeknito.LMS_backend.entity.learning.CategoryEntity;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryResponseDTO toResponseDTO(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        return CategoryResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .description(entity.getDescription())
                .color(entity.getColor())
                .isActive(entity.getIsActive())
                .build();
    }

    public static CategoryResponseDTO toResponseDTOWithCourses(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        
        List<CourseResponseDTO> courseDTOs = null;
        if (entity.getCourses() != null) {
            courseDTOs = entity.getCourses().stream()
                    .sorted(Comparator.comparing(com.geeknito.LMS_backend.entity.learning.CourseEntity::getId))
                    .map(course -> CourseResponseDTO.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .slug(course.getSlug())
                            .level(course.getLevel())
                            .duration(course.getDuration())
                            .thumbnail(course.getThumbnail())
                            .isActive(course.getIsActive())
                            .build())
                    .collect(Collectors.toList());
        }

        return CategoryResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .courses(courseDTOs)
                .build();
    }

    public static CategoryWiseCourseResponseDTO toCategoryWiseCourseResponseDTO(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        
        CategoryResponseDTO categoryInfo = CategoryResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();

        List<CourseResponseDTO> courseDTOs = null;
        if (entity.getCourses() != null) {
            courseDTOs = entity.getCourses().stream()
                    .sorted(Comparator.comparing(com.geeknito.LMS_backend.entity.learning.CourseEntity::getId))
                    .map(course -> CourseResponseDTO.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .slug(course.getSlug())
                            .level(course.getLevel())
                            .duration(course.getDuration())
                            .thumbnail(course.getThumbnail())
                            .isActive(course.getIsActive())
                            .build())
                    .collect(Collectors.toList());
        }

        return CategoryWiseCourseResponseDTO.builder()
                .category(categoryInfo)
                .courses(courseDTOs)
                .build();
    }

    public static CategoryEntity toEntity(CategoryRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return CategoryEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .description(dto.getDescription())
                .color(dto.getColor())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }

    public static void updateEntity(CategoryEntity entity, CategoryRequestDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setName(dto.getName());
        entity.setIcon(dto.getIcon());
        entity.setDescription(dto.getDescription());
        entity.setColor(dto.getColor());
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
    }
}
