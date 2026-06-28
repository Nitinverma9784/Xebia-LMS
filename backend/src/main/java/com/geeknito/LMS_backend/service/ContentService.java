package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.ContentRequestDTO;
import com.geeknito.LMS_backend.dto.ContentResponseDTO;

import java.util.List;

public interface ContentService {
    ContentResponseDTO create(ContentRequestDTO request);
    List<ContentResponseDTO> getAll();
    ContentResponseDTO getById(Long id);
    ContentResponseDTO update(Long id, ContentRequestDTO request);
    void delete(Long id);
}

