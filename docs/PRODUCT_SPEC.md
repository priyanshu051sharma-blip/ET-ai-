AirSense AI — Product Specification

Version: 1.0
Last updated: 2026-07-14

1. Executive Summary

AirSense AI (a.k.a. AirSense) is an urban air quality intelligence platform that gathers telemetry from distributed sensor stations, analyzes real-time and historical pollution indicators, and presents actionable insights to city operators and citizens through an interactive dashboard. The product focuses on visibility, prioritization, and recommended interventions for air pollution events.

Goals:
- Provide a single-pane view of city air quality, hotspots, and trends.
- Surface highest-priority zones requiring action (e.g., high AQI, exceedances).
- Make the dataset and insights exportable for reporting and decision-making.

Why we build it:
- Help city authorities and environmental teams identify pollution sources and prioritize interventions.
- Inform residents and sensitive groups about current risk and recommended actions.
- Enable rapid prototyping and evaluation of AI models for forecasting and source attribution.

Audience:
- City air quality managers
- Environmental NGOs and researchers
- Citizens interested in local air quality
- Hackathon/judging panel and product evaluators

2. Key Features

- Live city map with sensor markers and popups
- All Zone Rankings: ranked list of zones by AQI (with pollutant breakdown)
- KPI cards (Live AQI, PM2.5, PM10, Traffic Index, Wind Speed, Critical Zones)
- Source attribution panel (AI-assisted causal analysis)
- Forecasting / AI predictions for AQI trends
- Health advisory generation per zone
- Exportable JSON/CSV of zone/sensor data

3. Data Sources & Schema

Primary dataset: `ecosphere_data.json` — a time-series of telemetry records. Each record contains fields:

- timestamp (ISO8601)
- location (string) — human-friendly location name
- latitude, longitude (float)
- sector_type (string) — e.g., Residential, Traffic Hub, Industrial
- AQI (int), PM25 (float), PM10 (float), NO2, SO2, CO (pollutant readings)
- wind_speed, air_temperature, humidity
- traffic_index (numeric %)
- sensor_status (ONLINE|OFFLINE)

Aggregated view: `city-overview` returns:

- zones: Array of zone objects (latest telemetry per zone)
- city_avg_aqi, city_score, critical_zones, worst_zones, total_zones

Sample zone object:

```
{
  "name": "City Center",
  "latitude": 12.975,
  "longitude": 77.59,
  "sector_type": "Traffic Hub",
  "aqi": 87,
  "pm25": 29.5,
  "pm10": 62,
  "no2": 55.6,
  "sensor_status":"ONLINE"
}
```

4. Backend Architecture

Stack: Python FastAPI app (backend/main.py) serving analytic endpoints and reading `ecosphere_data.json` on startup.

Important endpoints (frontend uses these):

- `GET /api/air/city-overview` — returns aggregated zone list and city summary
- `GET /api/readings/latest?location=...` — returns latest readings for a location
- `GET /api/air/health-advisory?location=...` — returns advisory text per location
- `GET /api/ai/source-analysis?location=...` — AI source attribution
- `GET /api/air/multi-city` — multiple city summaries
- `POST /api/chat` — send message to AI assistant

Implementation notes:

- The backend caches `ALL_DATA` loaded from `ecosphere_data.json` at start.
- Many endpoints return safe empty fallbacks on error to keep the frontend resilient.

Known behaviors:

- If `ALL_DATA` is empty, several endpoints raise a `503` or return empty arrays. Ensure `ecosphere_data.json` exists in project root.

5. Frontend Architecture

Stack: React + Vite, framer-motion for animation, Recharts and Leaflet for charts and maps.

Key folders:

- `frontend/src/components/` — React components (AirDashboard, HotspotCards, AirGisMap, etc.)
- `frontend/src/styles/index.css` — global CSS variables and theme
- `frontend/src/data/airApi.js` — axios wrappers used by components

Important components:

- `AirDashboard.jsx` — main page, orchestrates fetches and renders KPI row, GIS map, and hotspot cards.
- `HotspotCards.jsx` — All Zone Rankings; shows ranked zone rows, supports table/compact view, export.
- `AirGisMap.jsx` / `GisMap.jsx` — Leaflet map integration with custom popup HTML.

Theme & variables:

- Global CSS variables define color tokens: `--color-primary`, `--color-primary-strong`, `--color-teal`, `--color-text-primary`, `--color-text-secondary`.
- Many components use inline styles; prefer migrating to CSS variables for consistent theming.

Known frontend issues (diagnosed during work):

- Zone rows initially rendered with text not visible due to stacking/contrast; fixed by normalizing data keys (`name` vs `location`) and setting visible defaults.
- Leaflet console error: `Cannot read properties of undefined (reading '_leaflet_pos')` — appears when map container or tiles have timing issues; initialize Leaflet container carefully and destroy on unmount.

6. UX & Interaction Flows

Primary flows:

1. Open Air Dashboard → auto-fetch city overview and latest readings → KPI row and map populate.
2. Click a map marker → popup shows zone details; selecting a zone updates KPIs and highlights row.
3. In All Zone Rankings → use Sort pills (AQI, PM2.5, NO₂) or toggle Table View to see compact list.
4. Click a zone row → expand to view pollutants and action prompts; optionally export JSON for reporting.

Accessibility and clarity:

- Table view is the recommended default for quick scanning and exports.
- Use color + icons but avoid relying on color alone for critical states.

7. Setup & Local Development

Prereqs: Node.js, Python 3.10+, pip, virtualenv

Backend (from project root):

```
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```
cd frontend
npm install
npm run dev
```

Run the app: open `http://localhost:5173` (Vite) and ensure backend is reachable at `VITE_API_URL` (defaults to `http://127.0.0.1:8000`).

8. Testing & Validation

- Basic manual tests: verify `GET /api/air/city-overview` returns zones; check KPI values against sample data.
- Unit tests: not included by default; recommend adding Jest/unit tests for React components and pytest for backend endpoints.

9. Deployment & Production Notes

- Containerize backend with a small `Dockerfile` using Python slim image; run behind Uvicorn/Gunicorn in production.
- Frontend can be built with `npm run build` and served via CDN or static host.
- Set `VITE_API_URL` in production environment to point to the backend domain.

10. Observability & Logging

- Backend prints startup logs for loaded records count; add structured logging (JSON) for production.
- Consider integrating Sentry for errors and Prometheus for metrics.

11. Security & Privacy

- No PII is stored; sensor telemetry is location-aggregated public data in this project.
- If adding user accounts or restricted data, integrate OAuth2 and HTTPS-only cookie sessions.

12. Roadmap & Next Steps

Short-term:

- Make Table View default (done) and refine export formats (CSV/XLSX).
- Add unit/integration tests for hotspot rendering and API fallbacks.
- Fix Leaflet initialization warnings and ensure map tiles load reliably.

Medium-term:

- Add alerts and webhook integrations for critical zones.
- Add scheduled batch jobs to compute multi-day trends and model retraining pipelines.

Long-term:

- Multi-city dashboard and role-based access control
- Integration with enforcement workflows (assign remediation tasks)

13. Contribution

- Follow coding conventions in the repo. Create branches per feature and open pull requests with clear descriptions.
- Update this document when adding new endpoints, components, or data fields.

14. Contact & Ownership

- Project lead: (your team/contact here)
- Repo: local workspace `ET-ai-` (root folder)

---
If you'd like, I can:

- Generate a CSV export button and attach it to the UI.
- Produce a PDF of this spec.
- Add sequence diagrams or a mermaid architecture diagram into this file.
