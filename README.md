# Hero Cycles — Pricing Engine

> A full-stack pricing engine for Hero Cycles' sales team. Manage parts, build cycle configurations, and get instant price breakdowns — no more Excel sheets.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Java 17 · Spring Boot 3.2 · Spring Data JPA |
| Database | H2 (in-memory, auto-seeded on startup)  |
| Frontend | React 18 · Axios · react-hot-toast · Lucide |
| Build    | Maven (backend) · npm / react-scripts (frontend) |

---

## Prerequisites

| Tool        | Version  |
|-------------|----------|
| Java JDK    | 17+      |
| Maven       | 3.8+     |
| Node.js     | 18+      |
| npm         | 9+       |

Verify with:

```bash
java -version
mvn -version
node -v
npm -v
```

---

## Quick Start

### 1 — Clone the repo

```bash
git clone https://github.com/Mohammad-Ikhlas-khan/hero-cycles-pricing.git
cd hero-cycles-pricing
```

### 2 — Start the backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.  
On first boot it auto-seeds demo data: 9 parts across 3 categories and 3 ready-made configurations.

> H2 console (dev only): http://localhost:8080/h2-console — JDBC URL: `jdbc:h2:mem:herocycles`

### 3 — Start the frontend (React)

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The UI opens at **http://localhost:3000** and proxies API calls to port 8080.

---

## Running Tests

```bash
cd backend
mvn test
```

Runs 7 unit tests covering the core pricing logic: subtotals, margin calculation, total price, category breakdowns, zero-margin edge case, and 404 error handling.

---

## Project Structure

```
hero-cycles-pricing/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/herocycles/pricing/
│       │   ├── PricingEngineApplication.java
│       │   ├── controller/        # REST endpoints
│       │   │   ├── PartController.java
│       │   │   ├── ConfigurationController.java
│       │   │   └── PricingController.java
│       │   ├── service/           # Business logic
│       │   │   ├── PartService.java
│       │   │   ├── ConfigurationService.java
│       │   │   └── PricingService.java   ← core engine
│       │   ├── repository/        # Spring Data JPA
│       │   ├── model/             # JPA entities
│       │   ├── dto/               # Request/Response shapes
│       │   ├── exception/         # Global error handling
│       │   └── config/            # CORS + DataSeeder
│       └── test/                  # Unit tests
└── frontend/
    └── src/
        ├── App.js
        ├── components/Sidebar.js
        ├── pages/
        │   ├── Dashboard.js
        │   ├── PartsPage.js
        │   ├── ConfigurationsPage.js
        │   └── PricingPage.js
        ├── services/api.js        # Axios API layer
        └── styles/global.css
```

---

## REST API Reference

### Parts

| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| GET    | `/api/parts`                    | List all parts                  |
| GET    | `/api/parts?search=shimano`     | Search parts by name            |
| GET    | `/api/parts?category=TYRE`      | Filter by category              |
| GET    | `/api/parts/{id}`               | Get single part                 |
| POST   | `/api/parts`                    | Create part                     |
| PUT    | `/api/parts/{id}`               | Update part (incl. price)       |
| DELETE | `/api/parts/{id}`               | Delete part                     |
| GET    | `/api/parts/categories`         | List all part categories        |

### Configurations

| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| GET    | `/api/configurations`           | List all configurations         |
| GET    | `/api/configurations?activeOnly=true` | Active configs only       |
| GET    | `/api/configurations/{id}`      | Get single configuration        |
| POST   | `/api/configurations`           | Create configuration            |
| PUT    | `/api/configurations/{id}`      | Update configuration            |
| DELETE | `/api/configurations/{id}`      | Delete configuration            |

### Pricing

| Method | Endpoint                           | Description                           |
|--------|------------------------------------|---------------------------------------|
| GET    | `/api/pricing/configuration/{id}`  | Full price breakdown for a config     |

**Sample pricing response:**

```json
{
  "success": true,
  "data": {
    "configurationId": 1,
    "configurationName": "City Commuter Pro",
    "partPrices": [
      { "partId": 2, "partName": "Steel City Frame", "category": "FRAME", "unitPrice": 1800.00 },
      { "partId": 7, "partName": "Shimano 7-Speed", "category": "GEAR_SET", "unitPrice": 650.00 }
    ],
    "partsSubtotal": 5940.00,
    "marginPercentage": 15,
    "marginAmount": 891.00,
    "totalPrice": 6831.00,
    "categorySubtotals": {
      "FRAME": 1800.00,
      "GEAR_SET": 650.00,
      "TYRE": 460.00
    }
  }
}
```

---

## Part Categories

`FRAME` · `GEAR_SET` · `TYRE` · `BRAKE` · `HANDLEBAR` · `SADDLE` · `PEDAL` · `CHAIN` · `WHEEL` · `SUSPENSION` · `LIGHTING` · `ACCESSORY`

---

## Design Decisions

- **H2 in-memory database**: Zero-config for evaluation. Swap to PostgreSQL/MySQL by updating `application.properties` — the JPA layer is DB-agnostic.
- **BigDecimal for prices**: Never `float` or `double` for money. All arithmetic uses `BigDecimal` with `HALF_UP` rounding.
- **ManyToMany for parts ↔ configs**: A part can appear in multiple configurations; a config can have many parts. The join table is `configuration_parts`.
- **Margin on configuration, not part**: Sales teams apply a single margin % per configuration, not per component — this matches the real-world workflow described in the brief.
- **Stateless REST API**: No session management needed; each request is self-contained.

---

## Known Assumptions

See `ASSIGNMENT.md` for the full list of questions asked and assumptions made.
