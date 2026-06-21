package com.herocycles.pricing.repository;

import com.herocycles.pricing.model.CycleConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConfigurationRepository extends JpaRepository<CycleConfiguration, Long> {
    List<CycleConfiguration> findByActive(boolean active);
    List<CycleConfiguration> findByCycleType(String cycleType);
    List<CycleConfiguration> findByNameContainingIgnoreCase(String name);
}
