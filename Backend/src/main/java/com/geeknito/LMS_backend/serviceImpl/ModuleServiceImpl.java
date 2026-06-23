package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.ModuleRequest;
import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import com.geeknito.LMS_backend.entity.learning.ModuleEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.repository.CourseRepository;
import com.geeknito.LMS_backend.repository.ModuleRepository;
import com.geeknito.LMS_backend.service.ModuleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    public ModuleEntity create(ModuleRequest request) {
        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        ModuleEntity module = ModuleEntity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .moduleOrder(request.getModuleOrder() != null ? request.getModuleOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .course(course)
                .build();
        return moduleRepository.save(module);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleEntity> getAll() {
        return moduleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleEntity getById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));
    }

    @Override
    public ModuleEntity update(Long id, ModuleRequest request) {
        ModuleEntity module = getById(id);
        
        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        if (request.getModuleOrder() != null) {
            module.setModuleOrder(request.getModuleOrder());
        }
        if (request.getIsActive() != null) {
            module.setIsActive(request.getIsActive());
        }
        module.setCourse(course);
        
        return moduleRepository.save(module);
    }

    @Override
    public void delete(Long id) {
        ModuleEntity module = getById(id);
        moduleRepository.delete(module);
    }
}
