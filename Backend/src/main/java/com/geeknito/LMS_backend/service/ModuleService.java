package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.ModuleRequestDTO;
import com.geeknito.LMS_backend.dto.ModuleResponseDTO;

import java.util.List;

public interface ModuleService {
    ModuleResponseDTO create(ModuleRequestDTO request);
    List<ModuleResponseDTO> getAll();
    ModuleResponseDTO getById(Long id);
    ModuleResponseDTO update(Long id, ModuleRequestDTO request);
    void delete(Long id);
}

