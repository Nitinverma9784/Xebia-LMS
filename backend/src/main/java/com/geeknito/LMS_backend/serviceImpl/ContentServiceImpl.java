package com.geeknito.LMS_backend.serviceImpl;

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

    public ContentServiceImpl(ContentRepository contentRepository, SubmoduleRepository submoduleRepository) {
        this.contentRepository = contentRepository;
        this.submoduleRepository = submoduleRepository;
    }

    @Override
    public ContentResponseDTO create(ContentRequestDTO request) {
        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        ContentEntity content = ContentMapper.toEntity(request, submodule);
        ContentEntity savedContent = contentRepository.save(content);
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

        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        ContentMapper.updateEntity(content, request, submodule);
        ContentEntity updatedContent = contentRepository.save(content);
        return ContentMapper.toResponseDTO(updatedContent);
    }

    @Override
    public void delete(Long id) {
        ContentEntity content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        contentRepository.delete(content);
    }
}
