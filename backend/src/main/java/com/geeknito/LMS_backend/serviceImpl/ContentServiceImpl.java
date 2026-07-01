package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.cache.RedisService;
import com.geeknito.LMS_backend.dto.ContentRequestDTO;
import com.geeknito.LMS_backend.dto.ContentResponseDTO;
import com.geeknito.LMS_backend.entity.learning.ContentEntity;
import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.mapper.ContentMapper;
import com.geeknito.LMS_backend.repository.ContentRepository;
import com.geeknito.LMS_backend.repository.SubmoduleRepository;
import com.geeknito.LMS_backend.service.ContentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final SubmoduleRepository submoduleRepository;
    private final RedisService redisService;

    public ContentServiceImpl(ContentRepository contentRepository, SubmoduleRepository submoduleRepository, RedisService redisService) {
        this.contentRepository = contentRepository;
        this.submoduleRepository = submoduleRepository;
        this.redisService = redisService;
    }

    @Override
    public ContentResponseDTO create(ContentRequestDTO request) {
        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        ContentEntity content = ContentMapper.toEntity(request, submodule);
        ContentEntity savedContent = contentRepository.save(content);

        // Invalidate cache
        redisService.delete("contents_submodule_" + request.getSubmoduleId());
        Long courseId = (submodule.getModule() != null && submodule.getModule().getCourse() != null) ? submodule.getModule().getCourse().getId() : null;
        if (courseId != null) {
            redisService.delete("course_" + courseId);
        }
        redisService.delete("courses_all");

        return ContentMapper.toResponseDTO(savedContent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContentResponseDTO> getAll() {
        return contentRepository.findAllWithSubmodule().stream()
                .map(ContentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ContentResponseDTO getById(Long id) {
        ContentEntity content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        return ContentMapper.toResponseDTO(content);
    }

    @Override
    public ContentResponseDTO update(Long id, ContentRequestDTO request) {
        ContentEntity content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));

        Long oldSubmoduleId = content.getSubmodule() != null ? content.getSubmodule().getId() : null;
        Long oldCourseId = (content.getSubmodule() != null && content.getSubmodule().getModule() != null && content.getSubmodule().getModule().getCourse() != null) 
                ? content.getSubmodule().getModule().getCourse().getId() : null;

        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        ContentMapper.updateEntity(content, request, submodule);
        ContentEntity updatedContent = contentRepository.save(content);

        // Invalidate cache
        if (oldSubmoduleId != null) {
            redisService.delete("contents_submodule_" + oldSubmoduleId);
        }
        redisService.delete("contents_submodule_" + request.getSubmoduleId());

        if (oldCourseId != null) {
            redisService.delete("course_" + oldCourseId);
        }
        Long newCourseId = (submodule.getModule() != null && submodule.getModule().getCourse() != null) ? submodule.getModule().getCourse().getId() : null;
        if (newCourseId != null) {
            redisService.delete("course_" + newCourseId);
        }
        redisService.delete("courses_all");

        return ContentMapper.toResponseDTO(updatedContent);
    }

    @Override
    public void delete(Long id) {
        ContentEntity content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));

        Long submoduleId = content.getSubmodule() != null ? content.getSubmodule().getId() : null;
        Long courseId = (content.getSubmodule() != null && content.getSubmodule().getModule() != null && content.getSubmodule().getModule().getCourse() != null) 
                ? content.getSubmodule().getModule().getCourse().getId() : null;

        contentRepository.delete(content);

        // Invalidate cache
        if (submoduleId != null) {
            redisService.delete("contents_submodule_" + submoduleId);
        }
        if (courseId != null) {
            redisService.delete("course_" + courseId);
        }
        redisService.delete("courses_all");
    }
}
