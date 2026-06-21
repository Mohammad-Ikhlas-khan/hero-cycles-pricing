package com.herocycles.pricing.service;

import com.herocycles.pricing.dto.PriceBreakdownDTO;
import com.herocycles.pricing.exception.ResourceNotFoundException;
import com.herocycles.pricing.model.CycleConfiguration;
import com.herocycles.pricing.model.Part;
import com.herocycles.pricing.repository.ConfigurationRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PricingService {

    private final ConfigurationRepository configurationRepository;

    public PricingService(ConfigurationRepository configurationRepository) {
        this.configurationRepository = configurationRepository;
    }

    public PriceBreakdownDTO calculatePrice(Long configurationId) {
        CycleConfiguration config = configurationRepository.findById(configurationId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration not found with id: " + configurationId));

        return buildBreakdown(config);
    }

    private PriceBreakdownDTO buildBreakdown(CycleConfiguration config) {
        PriceBreakdownDTO breakdown = new PriceBreakdownDTO();
        breakdown.setConfigurationId(config.getId());
        breakdown.setConfigurationName(config.getName());

        List<Part> parts = config.getParts();

        // Build per-part price entries
        List<PriceBreakdownDTO.PartPriceDTO> partPrices = parts.stream()
                .map(p -> new PriceBreakdownDTO.PartPriceDTO(
                        p.getId(),
                        p.getName(),
                        p.getCategory().name(),
                        p.getPrice()))
                .collect(Collectors.toList());
        breakdown.setPartPrices(partPrices);

        // Sum all parts
        BigDecimal subtotal = parts.stream()
                .map(Part::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        breakdown.setPartsSubtotal(subtotal);

        // Category subtotals
        Map<String, BigDecimal> categorySubtotals = new LinkedHashMap<>();
        parts.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Part::getPrice, BigDecimal::add)))
                .forEach(categorySubtotals::put);
        breakdown.setCategorySubtotals(categorySubtotals);

        // Margin
        BigDecimal marginPct = config.getMarginPercentage() != null
                ? config.getMarginPercentage() : BigDecimal.ZERO;
        breakdown.setMarginPercentage(marginPct);

        BigDecimal marginAmount = subtotal.multiply(marginPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        breakdown.setMarginAmount(marginAmount);

        breakdown.setTotalPrice(subtotal.add(marginAmount).setScale(2, RoundingMode.HALF_UP));

        return breakdown;
    }
}
