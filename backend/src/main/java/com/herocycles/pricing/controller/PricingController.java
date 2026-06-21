package com.herocycles.pricing.controller;

import com.herocycles.pricing.dto.ApiResponse;
import com.herocycles.pricing.dto.PriceBreakdownDTO;
import com.herocycles.pricing.service.PricingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    private final PricingService pricingService;

    public PricingController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    @GetMapping("/configuration/{id}")
    public ResponseEntity<ApiResponse<PriceBreakdownDTO>> getPriceBreakdown(@PathVariable Long id) {
        PriceBreakdownDTO breakdown = pricingService.calculatePrice(id);
        return ResponseEntity.ok(ApiResponse.success(breakdown));
    }
}
