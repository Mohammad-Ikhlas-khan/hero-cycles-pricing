package com.herocycles.pricing.repository;

import com.herocycles.pricing.model.Part;
import com.herocycles.pricing.model.PartCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    List<Part> findByCategory(PartCategory category);
    Optional<Part> findBySku(String sku);
    List<Part> findByNameContainingIgnoreCase(String name);
}
