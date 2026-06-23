package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.ModuleRequest;
import com.geeknito.LMS_backend.entity.learning.ModuleEntity;

import java.util.List;

public interface ModuleService {
    ModuleEntity create(ModuleRequest request);
    List<ModuleEntity> getAll();
    ModuleEntity getById(Long id);
    ModuleEntity update(Long id, ModuleRequest request);
    void delete(Long id);
}
