package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.ModuleRequestDTO;
import com.geeknito.LMS_backend.dto.ModuleResponseDTO;
import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import com.geeknito.LMS_backend.entity.learning.ModuleEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.mapper.ModuleMapper;
import com.geeknito.LMS_backend.repository.CourseRepository;
import com.geeknito.LMS_backend.repository.ModuleRepository;
import com.geeknito.LMS_backend.service.ModuleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    public ModuleServiceImpl(ModuleRepository moduleRepository, CourseRepository courseRepository) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public ModuleResponseDTO create(ModuleRequestDTO request) {
        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        ModuleEntity module = ModuleMapper.toEntity(request, course);
        ModuleEntity savedModule = moduleRepository.save(module);
        return ModuleMapper.toResponseDTO(savedModule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponseDTO> getAll() {
        return moduleRepository.findAllWithCourse().stream()
                .map(ModuleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleResponseDTO getById(Long id) {
        ModuleEntity module = moduleRepository.findByIdWithSubmodules(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));
        return ModuleMapper.toResponseDTOWithSubmodules(module);
    }

    @Override
    public ModuleResponseDTO update(Long id, ModuleRequestDTO request) {
        ModuleEntity module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));

        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        ModuleMapper.updateEntity(module, request, course);
        ModuleEntity updatedModule = moduleRepository.save(module);
        return ModuleMapper.toResponseDTO(updatedModule);
    }

    @Override
    public void delete(Long id) {
        ModuleEntity module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));
        moduleRepository.delete(module);
    }
}
