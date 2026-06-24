package com.geeknito.LMS_backend.mapper;

import com.geeknito.LMS_backend.dto.CourseResponseDTO;
import com.geeknito.LMS_backend.dto.ModuleRequestDTO;
import com.geeknito.LMS_backend.dto.ModuleResponseDTO;
import com.geeknito.LMS_backend.dto.SubmoduleResponseDTO;
import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import com.geeknito.LMS_backend.entity.learning.ModuleEntity;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ModuleMapper {

    public static ModuleResponseDTO toResponseDTO(ModuleEntity entity) {
        if (entity == null) {
            return null;
        }

        CourseResponseDTO courseDTO = null;
        if (entity.getCourse() != null) {
            courseDTO = CourseResponseDTO.builder()
                    .id(entity.getCourse().getId())
                    .title(entity.getCourse().getTitle())
                    .build();
        }

        return ModuleResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .moduleOrder(entity.getModuleOrder())
                .isActive(entity.getIsActive())
                .course(courseDTO)
                .build();
    }

    public static ModuleResponseDTO toResponseDTOWithSubmodules(ModuleEntity entity) {
        if (entity == null) {
            return null;
        }

        List<SubmoduleResponseDTO> submoduleDTOs = null;
        if (entity.getSubmodules() != null) {
            submoduleDTOs = entity.getSubmodules().stream()
                    .sorted(Comparator.comparing(com.geeknito.LMS_backend.entity.learning.SubmoduleEntity::getSubmoduleOrder))
                    .map(submodule -> SubmoduleResponseDTO.builder()
                            .id(submodule.getId())
                            .title(submodule.getTitle())
                            .submoduleOrder(submodule.getSubmoduleOrder())
                            .build())
                    .collect(Collectors.toList());
        }

        return ModuleResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .submodules(submoduleDTOs)
                .build();
    }

    public static ModuleEntity toEntity(ModuleRequestDTO dto, CourseEntity course) {
        if (dto == null) {
            return null;
        }
        return ModuleEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .moduleOrder(dto.getModuleOrder() != null ? dto.getModuleOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .course(course)
                .build();
    }

    public static void updateEntity(ModuleEntity entity, ModuleRequestDTO dto, CourseEntity course) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        if (dto.getModuleOrder() != null) {
            entity.setModuleOrder(dto.getModuleOrder());
        }
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
        entity.setCourse(course);
    }
}
