package com.herocycles.pricing.controller;

import com.herocycles.pricing.dto.ApiResponse;
import com.herocycles.pricing.dto.ConfigurationDTO;
import com.herocycles.pricing.service.ConfigurationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configurations")
public class ConfigurationController {

    private final ConfigurationService configurationService;

    public ConfigurationController(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConfigurationDTO>>> getAllConfigurations(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<ConfigurationDTO> configs = activeOnly
                ? configurationService.getActiveConfigurations()
                : configurationService.getAllConfigurations();
        return ResponseEntity.ok(ApiResponse.success(configs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConfigurationDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(configurationService.getConfigurationById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConfigurationDTO>> create(@Valid @RequestBody ConfigurationDTO dto) {
        ConfigurationDTO created = configurationService.createConfiguration(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Configuration created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConfigurationDTO>> update(@PathVariable Long id, @Valid @RequestBody ConfigurationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Configuration updated", configurationService.updateConfiguration(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        configurationService.deleteConfiguration(id);
        return ResponseEntity.ok(ApiResponse.success("Configuration deleted", null));
    }
}
