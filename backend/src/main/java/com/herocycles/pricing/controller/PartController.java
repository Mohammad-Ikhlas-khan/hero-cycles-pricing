package com.herocycles.pricing.controller;

import com.herocycles.pricing.dto.ApiResponse;
import com.herocycles.pricing.dto.PartDTO;
import com.herocycles.pricing.model.PartCategory;
import com.herocycles.pricing.service.PartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PartDTO>>> getAllParts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<PartDTO> parts;
        if (search != null && !search.isBlank()) {
            parts = partService.searchParts(search);
        } else if (category != null && !category.isBlank()) {
            parts = partService.getPartsByCategory(PartCategory.valueOf(category.toUpperCase()));
        } else {
            parts = partService.getAllParts();
        }
        return ResponseEntity.ok(ApiResponse.success(parts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PartDTO>> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(partService.getPartById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PartDTO>> createPart(@Valid @RequestBody PartDTO dto) {
        PartDTO created = partService.createPart(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Part created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PartDTO>> updatePart(@PathVariable Long id, @Valid @RequestBody PartDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Part updated successfully", partService.updatePart(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePart(@PathVariable Long id) {
        partService.deletePart(id);
        return ResponseEntity.ok(ApiResponse.success("Part deleted successfully", null));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<PartCategory[]>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(PartCategory.values()));
    }
}
