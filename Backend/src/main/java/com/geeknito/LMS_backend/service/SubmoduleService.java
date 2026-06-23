package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.SubmoduleRequest;
import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;

import java.util.List;

public interface SubmoduleService {
    SubmoduleEntity create(SubmoduleRequest request);
    List<SubmoduleEntity> getAll();
    SubmoduleEntity getById(Long id);
    SubmoduleEntity update(Long id, SubmoduleRequest request);
    void delete(Long id);
}
