package com.herocycles.pricing.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class PriceBreakdownDTO {
    private Long configurationId;
    private String configurationName;
    private List<PartPriceDTO> partPrices;
    private BigDecimal partsSubtotal;
    private BigDecimal marginPercentage;
    private BigDecimal marginAmount;
    private BigDecimal totalPrice;
    private Map<String, BigDecimal> categorySubtotals;

    public static class PartPriceDTO {
        private Long partId;
        private String partName;
        private String category;
        private BigDecimal unitPrice;

        public PartPriceDTO() {}

        public PartPriceDTO(Long partId, String partName, String category, BigDecimal unitPrice) {
            this.partId = partId;
            this.partName = partName;
            this.category = category;
            this.unitPrice = unitPrice;
        }

        public Long getPartId() { return partId; }
        public void setPartId(Long partId) { this.partId = partId; }

        public String getPartName() { return partName; }
        public void setPartName(String partName) { this.partName = partName; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    }

    // Getters and Setters
    public Long getConfigurationId() { return configurationId; }
    public void setConfigurationId(Long configurationId) { this.configurationId = configurationId; }

    public String getConfigurationName() { return configurationName; }
    public void setConfigurationName(String configurationName) { this.configurationName = configurationName; }

    public List<PartPriceDTO> getPartPrices() { return partPrices; }
    public void setPartPrices(List<PartPriceDTO> partPrices) { this.partPrices = partPrices; }

    public BigDecimal getPartsSubtotal() { return partsSubtotal; }
    public void setPartsSubtotal(BigDecimal partsSubtotal) { this.partsSubtotal = partsSubtotal; }

    public BigDecimal getMarginPercentage() { return marginPercentage; }
    public void setMarginPercentage(BigDecimal marginPercentage) { this.marginPercentage = marginPercentage; }

    public BigDecimal getMarginAmount() { return marginAmount; }
    public void setMarginAmount(BigDecimal marginAmount) { this.marginAmount = marginAmount; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public Map<String, BigDecimal> getCategorySubtotals() { return categorySubtotals; }
    public void setCategorySubtotals(Map<String, BigDecimal> categorySubtotals) { this.categorySubtotals = categorySubtotals; }
}
