package com.geeknito.LMS_backend.service;

import com.geeknito.LMS_backend.dto.ContentRequest;
import com.geeknito.LMS_backend.entity.learning.ContentEntity;

import java.util.List;

public interface ContentService {
    ContentEntity create(ContentRequest request);
    List<ContentEntity> getAll();
    ContentEntity getById(Long id);
    ContentEntity update(Long id, ContentRequest request);
    void delete(Long id);
}
