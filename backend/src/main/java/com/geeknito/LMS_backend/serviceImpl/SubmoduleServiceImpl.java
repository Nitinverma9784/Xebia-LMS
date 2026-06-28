package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.SubmoduleRequestDTO;
import com.geeknito.LMS_backend.dto.SubmoduleResponseDTO;
import com.geeknito.LMS_backend.entity.learning.ModuleEntity;
import com.geeknito.LMS_backend.entity.learning.SubmoduleEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.mapper.SubmoduleMapper;
import com.geeknito.LMS_backend.repository.ModuleRepository;
import com.geeknito.LMS_backend.repository.SubmoduleRepository;
import com.geeknito.LMS_backend.service.SubmoduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
    public SubmoduleResponseDTO create(SubmoduleRequestDTO request) {
        ModuleEntity module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + request.getModuleId()));

        SubmoduleEntity submodule = SubmoduleMapper.toEntity(request, module);
        SubmoduleEntity savedSubmodule = submoduleRepository.save(submodule);
        return SubmoduleMapper.toResponseDTO(savedSubmodule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmoduleResponseDTO> getAll() {
        return submoduleRepository.findAllWithModule().stream()
                .map(SubmoduleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubmoduleResponseDTO getById(Long id) {
        SubmoduleEntity submodule = submoduleRepository.findByIdWithContents(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + id));
        return SubmoduleMapper.toResponseDTOWithContents(submodule);
    }

    @Override
    public SubmoduleResponseDTO update(Long id, SubmoduleRequestDTO request) {
        SubmoduleEntity submodule = submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + id));

        ModuleEntity module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + request.getModuleId()));

        SubmoduleMapper.updateEntity(submodule, request, module);
        SubmoduleEntity updatedSubmodule = submoduleRepository.save(submodule);
        return SubmoduleMapper.toResponseDTO(updatedSubmodule);
    }

    @Override
    public void delete(Long id) {
        SubmoduleEntity submodule = submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + id));
        submoduleRepository.delete(submodule);
    }
}
