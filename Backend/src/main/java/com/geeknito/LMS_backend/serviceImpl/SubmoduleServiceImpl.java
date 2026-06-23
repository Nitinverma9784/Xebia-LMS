package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.SubmoduleRequest;
import com.geeknito.LMS_backend.entity.learning.ModuleEntity;
import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.repository.ModuleRepository;
import com.geeknito.LMS_backend.repository.SubmoduleRepository;
import com.geeknito.LMS_backend.service.SubmoduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SubmoduleServiceImpl implements SubmoduleService {

    private final SubmoduleRepository submoduleRepository;
    private final ModuleRepository moduleRepository;

    public SubmoduleServiceImpl(SubmoduleRepository submoduleRepository, ModuleRepository moduleRepository) {
        this.submoduleRepository = submoduleRepository;
        this.moduleRepository = moduleRepository;
    }

    @Override
    public SubmoduleEntity create(SubmoduleRequest request) {
        ModuleEntity module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + request.getModuleId()));

        SubmoduleEntity submodule = SubmoduleEntity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .canonicalUrl(request.getCanonicalUrl())
                .ogTitle(request.getOgTitle())
                .ogDescription(request.getOgDescription())
                .ogImage(request.getOgImage())
                .submoduleOrder(request.getSubmoduleOrder() != null ? request.getSubmoduleOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .module(module)
                .slug(request.getSlug())
                .build();
        return submoduleRepository.save(submodule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmoduleEntity> getAll() {
        return submoduleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public SubmoduleEntity getById(Long id) {
        return submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + id));
    }

    @Override
    public SubmoduleEntity update(Long id, SubmoduleRequest request) {
        SubmoduleEntity submodule = getById(id);
        
        ModuleEntity module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + request.getModuleId()));

        submodule.setTitle(request.getTitle());
        submodule.setDescription(request.getDescription());
        submodule.setMetaTitle(request.getMetaTitle());
        submodule.setMetaDescription(request.getMetaDescription());
        submodule.setCanonicalUrl(request.getCanonicalUrl());
        submodule.setOgTitle(request.getOgTitle());
        submodule.setOgDescription(request.getOgDescription());
        submodule.setOgImage(request.getOgImage());
        
        if (request.getSubmoduleOrder() != null) {
            submodule.setSubmoduleOrder(request.getSubmoduleOrder());
        }
        if (request.getIsActive() != null) {
            submodule.setIsActive(request.getIsActive());
        }
        submodule.setModule(module);
        submodule.setSlug(request.getSlug());
        
        return submoduleRepository.save(submodule);
    }

    @Override
    public void delete(Long id) {
        SubmoduleEntity submodule = getById(id);
        submoduleRepository.delete(submodule);
    }
}
