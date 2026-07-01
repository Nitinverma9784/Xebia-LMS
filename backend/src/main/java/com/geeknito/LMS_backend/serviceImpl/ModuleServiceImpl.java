package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.cache.RedisService;
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
    private final RedisService redisService;

    public ModuleServiceImpl(ModuleRepository moduleRepository, CourseRepository courseRepository, RedisService redisService) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
        this.redisService = redisService;
    }

    @Override
    public ModuleResponseDTO create(ModuleRequestDTO request) {
        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        ModuleEntity module = ModuleMapper.toEntity(request, course);
        ModuleEntity savedModule = moduleRepository.save(module);

        // Invalidate cache
        redisService.delete("modules_course_" + request.getCourseId());
        redisService.delete("course_" + request.getCourseId());
        redisService.delete("courses_all");

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
        String cacheKey = "submodules_module_" + id;
        Object cached = redisService.get(cacheKey);
        if (cached instanceof ModuleResponseDTO) {
            return (ModuleResponseDTO) cached;
        }

        ModuleEntity module = moduleRepository.findByIdWithSubmodules(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));
        ModuleResponseDTO result = ModuleMapper.toResponseDTOWithSubmodules(module);

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    public ModuleResponseDTO update(Long id, ModuleRequestDTO request) {
        ModuleEntity module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));

        Long oldCourseId = module.getCourse() != null ? module.getCourse().getId() : null;

        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        ModuleMapper.updateEntity(module, request, course);
        ModuleEntity updatedModule = moduleRepository.save(module);

        // Invalidate cache
        redisService.delete("submodules_module_" + id);
        if (oldCourseId != null) {
            redisService.delete("modules_course_" + oldCourseId);
            redisService.delete("course_" + oldCourseId);
        }
        redisService.delete("modules_course_" + request.getCourseId());
        redisService.delete("course_" + request.getCourseId());
        redisService.delete("courses_all");

        return ModuleMapper.toResponseDTO(updatedModule);
    }

    @Override
    public void delete(Long id) {
        ModuleEntity module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));

        Long courseId = module.getCourse() != null ? module.getCourse().getId() : null;

        moduleRepository.delete(module);

        // Invalidate cache
        redisService.delete("submodules_module_" + id);
        if (courseId != null) {
            redisService.delete("modules_course_" + courseId);
            redisService.delete("course_" + courseId);
        }
        redisService.delete("courses_all");
    }
}
