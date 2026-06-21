package com.herocycles.pricing.config;

import com.herocycles.pricing.model.CycleConfiguration;
import com.herocycles.pricing.model.Part;
import com.herocycles.pricing.model.PartCategory;
import com.herocycles.pricing.repository.ConfigurationRepository;
import com.herocycles.pricing.repository.PartRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PartRepository partRepository;
    private final ConfigurationRepository configurationRepository;

    public DataSeeder(PartRepository partRepository, ConfigurationRepository configurationRepository) {
        this.partRepository = partRepository;
        this.configurationRepository = configurationRepository;
    }

    @Override
    public void run(String... args) {
        if (partRepository.count() > 0) return;

        // --- FRAMES ---
        Part aluminumFrame = partRepository.save(
                Part.builder()
                        .name("Aluminum Road Frame")
                        .description("LightWeight 6061 aluminum, 700c")
                        .category(PartCategory.FRAME)
                        .price(new BigDecimal("3500.00"))
                        .sku("FRM-AL-001")
                        .supplier("Shimano India")
                        .build());

        Part steelFrame = partRepository.save(
                Part.builder()
                        .name("Steel City Frame")
                        .description("Durable Hi-Ten steel, 26\"")
                        .category(PartCategory.FRAME)
                        .price(new BigDecimal("1800.00"))
                        .sku("FRM-ST-001")
                        .supplier("TI Cycles")
                        .build()
        );

        Part carbonFrame = partRepository.save(
                Part.builder()
                        .name("Carbon MTB Frame")
                        .description("Full carbon fibre, 27.5\"")
                        .category(PartCategory.FRAME)
                        .price(new BigDecimal("8500.00"))
                        .sku("FRM-CF-001")
                        .supplier("Merida Supply")
                        .build()
        );

        //Gears
        Part shimano21 = partRepository.save(
                Part.builder()
                        .name("Shimano 21-Speed Gear Set")
                        .description("3x7 drivetrain with trigger shifters")
                        .category(PartCategory.GEAR_SET)
                        .price(new BigDecimal("1200.00"))
                        .sku("GRS-SH-021")
                        .supplier("Shimano India")
                        .build()
        );

        Part shimano7 = partRepository.save(
                Part.builder()
                        .name("Shimano 7-Speed Gear Set")
                        .description("Single chainring 7-speed cassette")
                        .category(PartCategory.GEAR_SET)
                        .price(new BigDecimal("650.00"))
                        .sku("GRS-SH-007")
                        .supplier("Shimano India")
                        .build()
        );

        Part singleSpd = partRepository.save(
                Part.builder()
                        .name("Single Speed Drive")
                        .description("Fixed gear / freewheel combo")
                        .category(PartCategory.GEAR_SET)
                        .price(new BigDecimal("350.00"))
                        .sku("GRS-SS-001")
                        .supplier("Local Vendor")
                        .build()
        );

        //Tyres
        Part kenda26 = partRepository.save(
                Part.builder()
                        .name("Kenda 26\" MTB Tyre")
                        .description("2.1\" knobby tread, pair")
                        .category(PartCategory.TYRE)
                        .price(new BigDecimal("460.00"))
                        .sku("TYR-KD-26M")
                        .supplier("Kenda India")
                        .build()
        );

        Part schwalbe700 = partRepository.save(
                Part.builder()
                        .name("Schwalbe 700c Road Tyre")
                        .description("28mm slick, folding bead, pair")
                        .category(PartCategory.TYRE)
                        .price(new BigDecimal("890.00"))
                        .sku("TYR-SW-700")
                        .supplier("Schwalbe India")
                        .build()
        );

        Part mrf27 = partRepository.save(
                Part.builder()
                        .name("MRF 27.5\" Trail Tyre")
                        .description("2.25\" semi-knobby, pair")
                        .category(PartCategory.TYRE)
                        .price(new BigDecimal("620.00"))
                        .sku("TYR-MF-27T")
                        .supplier("MRF Tyres")
                        .build()
        );

        //Configurations
        CycleConfiguration cityCommuter = CycleConfiguration.builder()
                .name("City Commuter Pro")
                .description("Perfect for daily urban commuting — reliable, low-maintenance")
                .cycleType("City")
                .marginPercentage(new BigDecimal("15"))
                .parts(List.of(
                        steelFrame,
                        shimano7,
                        kenda26))
                .build();

        configurationRepository.save(cityCommuter);


        CycleConfiguration roadRacer = CycleConfiguration.builder()
                .name("Road Racer Elite")
                .description("Lightweight performance road build for speed enthusiasts")
                .cycleType("Road")
                .marginPercentage(new BigDecimal("20"))
                .parts(List.of(
                        aluminumFrame,
                        shimano21,
                        schwalbe700))
                .build();

        configurationRepository.save(roadRacer);


        CycleConfiguration mtbTrail = CycleConfiguration.builder()
                .name("MTB Trail Crusher")
                .description("Full mountain spec for trails and off-road adventures")
                .cycleType("Mountain")
                .marginPercentage(new BigDecimal("18"))
                .parts(List.of(
                        carbonFrame,
                        shimano21,
                        mrf27))
                .build();

        configurationRepository.save(mtbTrail);
        System.out.println("✅ Hero Cycles seed data loaded: " + partRepository.count() + " parts, " + configurationRepository.count() + " configurations.");
    }
}
