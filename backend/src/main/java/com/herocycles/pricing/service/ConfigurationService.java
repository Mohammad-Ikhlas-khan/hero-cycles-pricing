package com.herocycles.pricing.service;

import com.herocycles.pricing.dto.ConfigurationDTO;
import com.herocycles.pricing.exception.ResourceNotFoundException;
import com.herocycles.pricing.model.CycleConfiguration;
import com.herocycles.pricing.model.Part;
import com.herocycles.pricing.repository.ConfigurationRepository;
import com.herocycles.pricing.repository.PartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConfigurationService {

    private final ConfigurationRepository configurationRepository;
    private final PartRepository partRepository;
    private final PartService partService;

    public ConfigurationService(ConfigurationRepository configurationRepository,
                                PartRepository partRepository,
                                PartService partService) {
        this.configurationRepository = configurationRepository;
        this.partRepository = partRepository;
        this.partService = partService;
    }

    public List<ConfigurationDTO> getAllConfigurations() {
        return configurationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ConfigurationDTO> getActiveConfigurations() {
        return configurationRepository.findByActive(true).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ConfigurationDTO getConfigurationById(Long id) {
        CycleConfiguration config = configurationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration not found with id: " + id));
        return toDTO(config);
    }

    public ConfigurationDTO createConfiguration(ConfigurationDTO dto) {
        CycleConfiguration config = CycleConfiguration.builder()
                        .name(dto.getName())
                        .description(dto.getDescription())
                        .cycleType(dto.getCycleType())
                        .marginPercentage(dto.getMarginPercentage())
                        .build();
        if (dto.getPartIds() != null && !dto.getPartIds().isEmpty()) {
            List<Part> parts = partRepository.findAllById(dto.getPartIds());
            config.setParts(parts);
        }
        return toDTO(configurationRepository.save(config));
    }

    public ConfigurationDTO updateConfiguration(Long id, ConfigurationDTO dto) {
        CycleConfiguration existing = configurationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration not found with id: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setCycleType(dto.getCycleType());
        existing.setMarginPercentage(dto.getMarginPercentage());
        existing.setActive(dto.isActive());

        if (dto.getPartIds() != null) {
            List<Part> parts = partRepository.findAllById(dto.getPartIds());
            existing.setParts(parts);
        }

        return toDTO(configurationRepository.save(existing));
    }

    public void deleteConfiguration(Long id) {
        if (!configurationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Configuration not found with id: " + id);
        }
        configurationRepository.deleteById(id);
    }

    private ConfigurationDTO toDTO(CycleConfiguration config) {
        ConfigurationDTO dto = new ConfigurationDTO();
        dto.setId(config.getId());
        dto.setName(config.getName());
        dto.setDescription(config.getDescription());
        dto.setCycleType(config.getCycleType());
        dto.setMarginPercentage(config.getMarginPercentage());
        dto.setActive(config.isActive());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());
        dto.setParts(config.getParts().stream().map(partService::toDTO).collect(Collectors.toList()));
        dto.setPartIds(config.getParts().stream().map(Part::getId).collect(Collectors.toList()));
        return dto;
    }
}
