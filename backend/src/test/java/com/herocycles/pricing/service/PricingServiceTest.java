package com.herocycles.pricing.service;

import com.herocycles.pricing.dto.PriceBreakdownDTO;
import com.herocycles.pricing.exception.ResourceNotFoundException;
import com.herocycles.pricing.model.CycleConfiguration;
import com.herocycles.pricing.model.Part;
import com.herocycles.pricing.model.PartCategory;
import com.herocycles.pricing.repository.ConfigurationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private ConfigurationRepository configurationRepository;

    @InjectMocks
    private PricingService pricingService;

    private CycleConfiguration config;

    @BeforeEach
    void setup() {
        Part frame = Part.builder()
                .name("Steel Frame")
                .description("City frame")
                .category(PartCategory.FRAME)
                .price(new BigDecimal("1800.00"))
                .sku("FRM-ST-001")
                .supplier("TI")
                .build();
        Part tyre  = Part.builder()
                .name("Kenda Tyre")
                .description("26\" pair")
                .category(PartCategory.TYRE)
                .price(new BigDecimal("460.00"))
                .sku("TYR-KD-26M")
                .supplier("Kenda")
                .build();
        Part gear  = Part.builder()
                .name("Shimano 7-Speed")
                .description("Gear set")
                .category(PartCategory.GEAR_SET)
                .price(new BigDecimal("650.00"))
                .sku("GRS-SH-007")
                .supplier("Shimano")
                .build();

        config = CycleConfiguration.builder()
                .name("City Commuter")
                .description("Urban bike")
                .cycleType("City")
                .marginPercentage(new BigDecimal("15"))
                .build();

        config.setParts(List.of(frame, tyre, gear));

        // Set IDs via reflection hack (no Lombok setId)
        try {
            var idField = Part.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(frame, 1L);
            idField.set(tyre, 2L);
            idField.set(gear, 3L);

            var cfgIdField = CycleConfiguration.class.getDeclaredField("id");
            cfgIdField.setAccessible(true);
            cfgIdField.set(config, 1L);
        } catch (Exception ignored) {}
    }

    @Test
    void calculatePrice_correctSubtotal() {
        when(configurationRepository.findById(1L)).thenReturn(Optional.of(config));

        PriceBreakdownDTO breakdown = pricingService.calculatePrice(1L);

        // 1800 + 460 + 650 = 2910
        assertEquals(new BigDecimal("2910.00"), breakdown.getPartsSubtotal());
    }

    @Test
    void calculatePrice_correctMargin() {
        when(configurationRepository.findById(1L)).thenReturn(Optional.of(config));

        PriceBreakdownDTO breakdown = pricingService.calculatePrice(1L);

        // 15% of 2910 = 436.50
        assertEquals(new BigDecimal("436.50"), breakdown.getMarginAmount());
    }

    @Test
    void calculatePrice_correctTotal() {
        when(configurationRepository.findById(1L)).thenReturn(Optional.of(config));

        PriceBreakdownDTO breakdown = pricingService.calculatePrice(1L);

        // 2910 + 436.50 = 3346.50
        assertEquals(new BigDecimal("3346.50"), breakdown.getTotalPrice());
    }

    @Test
    void calculatePrice_correctCategorySubtotals() {
        when(configurationRepository.findById(1L)).thenReturn(Optional.of(config));

        PriceBreakdownDTO breakdown = pricingService.calculatePrice(1L);

        assertEquals(new BigDecimal("1800.00"), breakdown.getCategorySubtotals().get("FRAME"));
        assertEquals(new BigDecimal("460.00"),  breakdown.getCategorySubtotals().get("TYRE"));
        assertEquals(new BigDecimal("650.00"),  breakdown.getCategorySubtotals().get("GEAR_SET"));
    }

    @Test
    void calculatePrice_correctPartCount() {
        when(configurationRepository.findById(1L)).thenReturn(Optional.of(config));

        PriceBreakdownDTO breakdown = pricingService.calculatePrice(1L);

        assertEquals(3, breakdown.getPartPrices().size());
    }

    @Test
    void calculatePrice_configNotFound_throws() {
        when(configurationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> pricingService.calculatePrice(99L));
    }

    @Test
    void calculatePrice_zeroMargin() {
        config.setMarginPercentage(BigDecimal.ZERO);
        when(configurationRepository.findById(1L)).thenReturn(Optional.of(config));

        PriceBreakdownDTO breakdown = pricingService.calculatePrice(1L);

        assertEquals(breakdown.getPartsSubtotal(), breakdown.getTotalPrice());
        assertEquals(BigDecimal.ZERO.setScale(2), breakdown.getMarginAmount());
    }
}
