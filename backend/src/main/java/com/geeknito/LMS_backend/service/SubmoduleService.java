package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.SubmoduleRequestDTO;
import com.geeknito.LMS_backend.dto.SubmoduleResponseDTO;

import java.util.List;

public interface SubmoduleService {
    SubmoduleResponseDTO create(SubmoduleRequestDTO request);
    List<SubmoduleResponseDTO> getAll();
    SubmoduleResponseDTO getById(Long id);
    SubmoduleResponseDTO update(Long id, SubmoduleRequestDTO request);
    void delete(Long id);
}

