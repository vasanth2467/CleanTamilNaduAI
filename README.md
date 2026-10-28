# CleanTamil Nadu AI — Intelligent Garbage Detection and Hotspot Management System
**தூய்மை தமிழ்நாடு • Smart Civic Solid Waste Triage & Hotspot Mitigation**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%200.162-green.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue.svg)](https://vitejs.dev)
[![Maps](https://img.shields.io/badge/Maps-Leaflet%20%2B%20OSM-brightgreen.svg)](https://leafletjs.com)
[![AI Mode](https://img.shields.io/badge/AI%20Status-Prototype%20Mode%20(Transparent)-amber.svg)](#ai-garbage-detection-architecture)

---

## 🏛️ Executive Summary

Urban centers across Tamil Nadu—including **Greater Chennai Corporation (GCC)**, **Coimbatore (CCMC)**, **Madurai (MMC)**, **Tiruchirappalli**, **Salem**, and **Tirunelveli**—face challenges with chronic garbage accumulation, commercial dump overflow, and delayed municipal turnaround times.

**CleanTamil Nadu AI** provides an end-to-end civic platform uniting citizens and municipal administrators:
1. **Citizen Reporting Portal**: Mobile-responsive photo upload, instant AI detection preview, and interactive GPS pin-drop.
2. **Transparent AI Waste Detection**: Inspects uploaded refuse for plastic accumulation, commercial spills, and hazardous debris. Clearly labeled in **Prototype / Demo Mode** to uphold civic transparency.
3. **Automated Priority Scoring Engine**: Ranks complaints using waste severity, hotspot cluster proximity (600m), sensitive municipal zone risk (hospitals, schools, sacred heritage, river corridors), and unresolved aging hours.
4. **Geospatial Hotspot Map**: Real-time Leaflet & OpenStreetMap interface grouping complaints into chronic dumping hotspots with polygon buffer zones.
5. **Municipal Admin Command Center**: Enables ward sanitary inspectors and assistant engineers to filter complaints, assign sanitary squads, transition workflow states, and upload **Before-and-After Photo Verification**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Vanilla CSS Design System, Lucide Icons |
| **Backend** | Python 3.11 / 3.12, FastAPI, Uvicorn (ASGI) |
| **Database** | SQLite 3 (Lightweight, robust, zero-configuration) |
| **Maps & GIS** | Leaflet 1.9 + OpenStreetMap Tile Services |
| **AI & Vision** | Python Pillow, CV Heuristic Pipeline with real model weights integration hook |
| **Testing** | Pytest, HTTPX TestClient |

---

## 📐 Priority Scoring Rule Engine (Formula v1.0)

> **Civic Prototype Notice:** The scoring rule is an initial municipal prototype heuristic created for transparent civic evaluation.

$$\text{Priority Score} = (\text{Waste Severity} \times 0.35) + (\text{Hotspot Cluster} \times 0.25) + (\text{Sensitive Risk} \times 0.20) + (\text{Aging Hours} \times 0.20)$$

### Weight Factors:
- **35% Waste Type & Volume:** Hazardous waste (100) > Overflowing Bin (85) > Mixed Dump (75) > Plastic (65) > Construction (55) > Organic (45), scaled by truckload/bag volume.
- **25% Hotspot Cluster Density:** Number of active unresolved complaints within 600m radius.
- **20% Sensitive Zone Proximity:** Distance to hospitals (e.g., Rajiv Gandhi Hospital, Rajaji Hospital), schools, river basins (Vaigai, Cauvery, Thamirabarani), and heritage zones (Kapaleeshwarar, Meenakshi Amman).
- **20% Unresolved Aging:** Automatic escalation after 24h, 48h, and 72h.

### Classification Thresholds:
- **Score $\ge$ 80.0:** Critical
- **Score $\ge$ 60.0:** High
- **Score $\ge$ 35.0:** Medium
- **Score $<$ 35.0:** Low

---

## 🤖 AI Garbage Detection Architecture

In strict adherence to ethical civic guidelines:
- **Clear Mode Labeling:** If trained weights (e.g. YOLOv8/ResNet) are not loaded at `AI_MODEL_PATH`, the system runs a computer-vision heuristic fallback clearly flagged as `is_simulated = True` and `ai_mode = "demo_prototype"`.
- **Zero Hallucination:** Simulated predictions are never presented as real neural network inferences. A visible amber badge alerts both citizens and administrators.
- **Drop-in Extensibility:** Administrators can drop custom weights (`best.pt` or `best.onnx`) into `backend/app/weights/` and update `AI_MODEL_PATH` in `.env` for production inference.

---

## 🚀 Windows Setup Instructions

### 1. Prerequisites
- **Python 3.11 or 3.12** installed
- **Node.js (v18+) & npm** installed
- **PowerShell** or Command Prompt

### 2. Backend Setup & Launch
Open a PowerShell terminal in the repository root:

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run automated tests
python -m pytest

# Start FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will launch at **http://127.0.0.1:8000** with interactive Swagger documentation at **http://127.0.0.1:8000/docs**.

### 3. Frontend Setup & Launch
Open a second PowerShell terminal:

```powershell
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The React frontend will be accessible at **http://localhost:5173**.

---

## 🧪 Testing

Run backend tests:
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -v
```

All 7 test cases validate:
- System health and AI mode reporting
- Statistics calculations
- District-based complaint filtering
- Hotspot dynamic aggregation
- Haversine geospatial proximity math
- Priority composite scoring rules

---

## 🗂️ Project Directory Structure

```
CleanIndia/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # Environment settings & TN sensitive zones
│   │   ├── database.py           # SQLite connection & schema initializers
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   ├── priority_engine.py    # Configurable priority scoring formula
│   │   ├── ai_detector.py        # Object detection pipeline with demo mode
│   │   ├── hotspot_service.py    # Haversine spatial clustering algorithm
│   │   ├── seed_data.py          # Sample reports across Tamil Nadu cities
│   │   └── main.py               # FastAPI routers, upload handling, CORS
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_api.py           # API integration tests
│   │   └── test_priority.py      # Formula unit tests
│   ├── uploads/                  # Safe storage for citizen & verified photos
│   ├── .env                      # Environment variables
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation & Tamil Nadu branding
│   │   │   ├── Footer.jsx        # Civic disclaimers & reset seed trigger
│   │   │   ├── LeafletMap.jsx    # Interactive Leaflet + OpenStreetMap
│   │   │   ├── StatusBadge.jsx   # Status indicator chips
│   │   │   ├── PriorityBadge.jsx # Priority chips with score tooltips
│   │   │   ├── ReportCard.jsx    # Responsive card component
│   │   │   ├── Charts.jsx        # Status, District, and Waste SVG charts
│   │   │   ├── PriorityBreakdownModal.jsx # Itemized formula breakdown
│   │   │   └── StatusUpdateModal.jsx      # Before/After verification modal
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Hero, stats, recent complaints
│   │   │   ├── CitizenReportPage.jsx # Upload, AI preview, GPS pin-drop
│   │   │   ├── HotspotMapPage.jsx    # Geospatial map with cluster radius
│   │   │   └── AdminDashboardPage.jsx# Triage, search, filter, and audit trail
│   │   ├── api.js                # Fetch wrapper for FastAPI endpoints
│   │   ├── index.css             # Emerald & white design system
│   │   ├── App.jsx               # Main state controller
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js            # Proxy configuration to backend
│   └── index.html
└── README.md
```

---

## 🔒 Security & Data Integrity
- File uploads are validated by MIME type and file extension (`.jpg`, `.jpeg`, `.png`, `.webp`).
- Upload size is restricted to 10MB maximum.
- All secrets and runtime configurations are handled via `.env`.
- Database access and data validation are strictly handled server-side.
