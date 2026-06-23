package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.ContentRequest;
import com.geeknito.LMS_backend.entity.learning.ContentEntity;
import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.repository.ContentRepository;
import com.geeknito.LMS_backend.repository.SubmoduleRepository;
import com.geeknito.LMS_backend.service.ContentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final SubmoduleRepository submoduleRepository;

    public ContentServiceImpl(ContentRepository contentRepository, SubmoduleRepository submoduleRepository) {
        this.contentRepository = contentRepository;
        this.submoduleRepository = submoduleRepository;
    }

    @Override
    public ContentEntity create(ContentRequest request) {
        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        ContentEntity content = ContentEntity.builder()
                .type(request.getType())
                .text(request.getText())
                .code(request.getCode())
                .language(request.getLanguage())
                .videoUrl(request.getVideoUrl())
                .imageUrl(request.getImageUrl())
                .alt(request.getAlt())
                .caption(request.getCaption())
                .title(request.getTitle())
                .headingLevel(request.getHeadingLevel())
                .contentOrder(request.getContentOrder() != null ? request.getContentOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .submodule(submodule)
                .build();
        return contentRepository.save(content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContentEntity> getAll() {
        return contentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public ContentEntity getById(Long id) {
        return contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
    }

    @Override
    public ContentEntity update(Long id, ContentRequest request) {
        ContentEntity content = getById(id);
        
        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        content.setType(request.getType());
        content.setText(request.getText());
        content.setCode(request.getCode());
        content.setLanguage(request.getLanguage());
        content.setVideoUrl(request.getVideoUrl());
        content.setImageUrl(request.getImageUrl());
        content.setAlt(request.getAlt());
        content.setCaption(request.getCaption());
        content.setTitle(request.getTitle());
        content.setHeadingLevel(request.getHeadingLevel());
        
        if (request.getContentOrder() != null) {
            content.setContentOrder(request.getContentOrder());
        }
        if (request.getIsActive() != null) {
            content.setIsActive(request.getIsActive());
        }
        content.setSubmodule(submodule);
        
        return contentRepository.save(content);
    }

    @Override
    public void delete(Long id) {
        ContentEntity content = getById(id);
        contentRepository.delete(content);
    }
}
