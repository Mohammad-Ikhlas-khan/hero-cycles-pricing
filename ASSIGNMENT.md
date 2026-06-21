# Hero Cycles Pricing Engine — Assignment Submission

## Part 1 — Problem Breakdown

### Questions I asked while solving this

1. **Who are the end users?** Salesperson on a laptop/desktop — not a mobile-first audience. This shaped the sidebar navigation layout over a hamburger-menu mobile UI.

2. **What does "instantly get the total price, broken down by component" mean exactly?** I interpreted this as: given a saved cycle *configuration* (a named set of parts), the system shows a line-by-line price per component, a category subtotal, a margin amount, and a grand total — all recalculated live whenever any part's price is updated.

3. **How is margin applied?** Is it per part, per category, or per configuration? I assumed *per configuration* (one margin % on the whole build cost), since that's how sales teams typically mark up a product.

4. **Can a single part belong to multiple configurations?** Yes. A Shimano gear set might appear in both the City Commuter and Road Racer builds. Modelled as a ManyToMany relationship.

5. **When a part price changes, does every configuration that uses it update automatically?** Yes — because configurations store *references* to parts (by ID), not a snapshot of the price. Re-querying the pricing endpoint always reflects the latest price. This directly solves the manager's "part costs change every few months" problem.

6. **Do we need user authentication / roles?** Out of scope for this fresher assignment; assumed a single internal tool accessed by the sales team.

7. **Do we need audit history of price changes?** Not required explicitly, but each `Part` and `CycleConfiguration` stores `createdAt` and `updatedAt` timestamps for basic traceability.

8. **Is a cycle allowed to have zero parts?** Technically yes (the DB allows it), but the UI should guide the user to select at least one. Validation is a future improvement.

9. **Can the same part appear twice in one configuration (e.g. two tyres billed separately)?** Current model doesn't support quantity > 1 per part in a config. A "quantity" field on the join table would be the fix — noted as a known limitation.

10. **What happens if a part is deleted and it's used in a config?** JPA cascading is not set to delete configs when a part is removed. This needs a constraint or soft-delete in production.

---

### Assumptions Made

| # | Assumption | Reasoning |
|---|------------|-----------|
| 1 | H2 in-memory database is acceptable for this submission | Zero setup for evaluators; swap to Postgres with one `application.properties` change |
| 2 | Margin is applied at the configuration level, not per-part | Matches typical sales workflow described in the brief |
| 3 | All prices are in INR (₹) | Hero Cycles is an Indian company |
| 4 | No authentication is needed | Single-team internal tool, out of scope for fresher assignment |
| 5 | A "configuration" is a named, reusable set of parts | Matches the "thousands of cycle configurations" phrasing |
| 6 | Price changes are reflected immediately (no versioning) | Simplest interpretation; price history is a future feature |
| 7 | No quantity multiplier per part in a configuration | ManyToMany join table without a quantity column — noted as limitation |
| 8 | Seed data auto-loads on every startup | Convenient for evaluation |

---

## Part 2 — Pseudocode

### Core Pricing Engine

```
FUNCTION calculatePrice(configurationId):
    config = findConfigurationById(configurationId)
    IF config NOT FOUND:
        THROW ResourceNotFoundException

    partsList = config.getParts()          // fetches current prices from DB

    // Per-part line items
    partPrices = []
    FOR each part IN partsList:
        partPrices.ADD({ id, name, category, price: part.price })

    // Subtotal
    partsSubtotal = SUM(part.price FOR part IN partsList)

    // Category breakdown
    categorySubtotals = GROUP_BY(partsList, part.category)
                        MAP TO SUM(price) PER GROUP

    // Margin
    marginAmount = partsSubtotal × (config.marginPercentage / 100)
                   rounded to 2 decimal places (HALF_UP)

    // Total
    totalPrice = partsSubtotal + marginAmount

    RETURN {
        configurationId, configurationName,
        partPrices,
        partsSubtotal, marginPercentage, marginAmount, totalPrice,
        categorySubtotals
    }
```

### Part CRUD (Update Price)

```
FUNCTION updatePart(partId, newData):
    part = findPartById(partId)
    IF NOT FOUND: THROW 404

    part.name        = newData.name
    part.price       = newData.price      // ← this is the key operation
    part.category    = newData.category
    part.description = newData.description
    part.updatedAt   = NOW()

    SAVE(part)
    RETURN toDTO(part)

    // All configurations that include this part will reflect
    // the new price on next pricing query — no further action needed
```

### Configuration Builder

```
FUNCTION createConfiguration(dto):
    config = new CycleConfiguration(dto.name, dto.cycleType, dto.margin)

    parts = fetchAllById(dto.partIds)     // validate part IDs exist
    config.setParts(parts)

    SAVE(config)
    RETURN toDTO(config)
```

---

## Part 3 — Design Sensibility & UI

### Design Philosophy

- **Dark sidebar + white content area**: mirrors professional tools like Salesforce and Shopify Admin that sales teams already use — reduces learning curve.
- **Rajdhani display font**: a geometric sans-serif with an engineering/industrial personality — appropriate for a bicycle manufacturer, avoids the generic sans defaults.
- **Red (#D4241A) as the primary action colour**: drawn from Hero Cycles' brand language (their logo and products use red prominently).
- **Amber accent for margin/pricing highlights**: separates "cost" (charcoal) from "markup" (amber) visually in the breakdown panel — a deliberate encoding of information through colour.
- **₹ denomination throughout**: every price is formatted with `toLocaleString('en-IN')` for proper Indian number formatting (e.g. ₹1,80,000 not ₹180,000).
- **Card-based configuration view**: lets salespersons scan multiple configs at a glance with their live pricing summary — no need to click into each one.

### UI Screens

1. **Dashboard** — Quick stats (total parts, active configs, total catalogue value) + shortcut buttons to the three main workflows.
2. **Parts Catalogue** — Searchable, filterable table. Inline edit modal. Price update is just a form field — instantly visible to all configs.
3. **Configurations** — Card grid with live price previews. Modal form with searchable part multi-selector and subtotal preview while selecting.
4. **Pricing Engine** — Single dropdown selects a configuration. Instant breakdown rendered: component list grouped by category, then a summary panel with subtotal + margin + total.

---

## Prompts Used

I used Claude (Anthropic) and GitHub Copilot during this project. Below are the key prompts:


### Unit Tests
> *"Write JUnit 5 + Mockito tests for a PricingService.calculatePrice() method. Cover: correct subtotal, correct margin (15% of parts cost), correct total, category subtotals map, 404 when config not found, and zero margin edge case."*

### Frontend Design
> *"Design a React UI for a cycle pricing engine used by a sales team at Hero Cycles India. Use a dark sidebar navigation, cards for cycle configurations, and a detailed pricing breakdown page. The brand colour is red (#D4241A). Use Inter for body text and Rajdhani for display headings. Show me global CSS variables and the component structure."*

### Seed Data
> *"Generate realistic seed data for a Hero Cycles parts catalogue. Include real-world parts: aluminum/steel/carbon frames, Shimano gear sets, Kenda/Schwalbe/MRF tyres, V-brakes and disc brakes, handlebars, saddles, chains, and wheels. Give each a realistic INR price based on Indian market rates circa 2024."*

---

## Future Improvements (if given more time)

- **PostgreSQL** instead of H2 for data persistence across restarts
- **Price history / audit log**: track when each part's price changed and by how much
- **Quantity support**: allow adding the same part multiple times (e.g. 2 tyres counted separately)
- **PDF quote generation**: export a configured cycle's price breakdown as a PDF for customers
- **User authentication**: role-based access (admin vs. salesperson — admin can change prices, salesperson can only view)
- **Bulk price update**: upload a CSV of updated part prices (mirrors the existing Excel workflow for easy migration)
- **Comparison view**: side-by-side pricing of two configurations
