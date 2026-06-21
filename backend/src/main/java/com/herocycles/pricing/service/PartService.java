package com.herocycles.pricing.service;

import com.herocycles.pricing.dto.PartDTO;
import com.herocycles.pricing.exception.ResourceNotFoundException;
import com.herocycles.pricing.model.Part;
import com.herocycles.pricing.model.PartCategory;
import com.herocycles.pricing.repository.PartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    public List<PartDTO> getAllParts() {
        return partRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PartDTO getPartById(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with id: " + id));
        return toDTO(part);
    }

    public List<PartDTO> getPartsByCategory(PartCategory category) {
        return partRepository.findByCategory(category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PartDTO> searchParts(String name) {
        return partRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PartDTO createPart(PartDTO dto) {
        Part part = toEntity(dto);
        return toDTO(partRepository.save(part));
    }

    public PartDTO updatePart(Long id, PartDTO dto) {
        Part existing = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with id: " + id));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setCategory(dto.getCategory());
        existing.setPrice(dto.getPrice());
        existing.setSku(dto.getSku());
        existing.setSupplier(dto.getSupplier());
        return toDTO(partRepository.save(existing));
    }

    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new ResourceNotFoundException("Part not found with id: " + id);
        }
        partRepository.deleteById(id);
    }

    public PartDTO toDTO(Part part) {
        PartDTO dto = new PartDTO();
        dto.setId(part.getId());
        dto.setName(part.getName());
        dto.setDescription(part.getDescription());
        dto.setCategory(part.getCategory());
        dto.setPrice(part.getPrice());
        dto.setSku(part.getSku());
        dto.setSupplier(part.getSupplier());
        dto.setCreatedAt(part.getCreatedAt());
        dto.setUpdatedAt(part.getUpdatedAt());
        return dto;
    }

    private Part toEntity(PartDTO dto) {
        return Part.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .sku(dto.getSku())
                .supplier(dto.getSupplier())
                .build();
    }
}
