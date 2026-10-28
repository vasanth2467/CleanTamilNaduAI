import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "clean_tamil_nadu.db"))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

AI_MODE = os.getenv("AI_MODE", "prototype")  # "prototype" (demo heuristic) or "model" (real weights)
AI_MODEL_PATH = os.getenv("AI_MODEL_PATH", "")

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

# Sensitive municipal zones across major Tamil Nadu cities (hospitals, schools, sacred heritage, coastal/water bodies)
TAMIL_NADU_SENSITIVE_ZONES = [
    {"name": "Rajiv Gandhi Government General Hospital", "district": "Chennai", "lat": 13.0827, "lon": 80.2785, "type": "hospital", "radius_m": 400},
    {"name": "Marina Beach & Promenade Ecology Zone", "district": "Chennai", "lat": 13.0499, "lon": 80.2824, "type": "coastal", "radius_m": 600},
    {"name": "Koyambedu Wholesale Market & Bus Terminus", "district": "Chennai", "lat": 13.0694, "lon": 80.1948, "type": "commercial_hub", "radius_m": 500},
    {"name": "Kapaleeshwarar Temple Heritage Precinct", "district": "Chennai", "lat": 13.0336, "lon": 80.2699, "type": "temple_heritage", "radius_m": 350},
    {"name": "Coimbatore Medical College Hospital", "district": "Coimbatore", "lat": 11.0016, "lon": 76.9673, "type": "hospital", "radius_m": 400},
    {"name": "Gandhipuram Central Bus Stand & Market", "district": "Coimbatore", "lat": 11.0183, "lon": 76.9644, "type": "transit_hub", "radius_m": 450},
    {"name": "Meenakshi Amman Temple Heritage Buffer Zone", "district": "Madurai", "lat": 9.9195, "lon": 78.1193, "type": "temple_heritage", "radius_m": 400},
    {"name": "Government Rajaji Hospital", "district": "Madurai", "lat": 9.9312, "lon": 78.1301, "type": "hospital", "radius_m": 400},
    {"name": "Vaigai River Bank Ecological Corridor", "district": "Madurai", "lat": 9.9248, "lon": 78.1255, "type": "waterbody", "radius_m": 500},
    {"name": "Chathiram Central Bus Stand", "district": "Tiruchirappalli", "lat": 10.8286, "lon": 78.6946, "type": "transit_hub", "radius_m": 450},
    {"name": "Srirangam Ranganathaswamy Precinct", "district": "Tiruchirappalli", "lat": 10.8625, "lon": 78.6901, "type": "temple_heritage", "radius_m": 400},
    {"name": "Cauvery River Intake Ghats", "district": "Tiruchirappalli", "lat": 10.8520, "lon": 78.6975, "type": "waterbody", "radius_m": 500},
    {"name": "Salem New Bus Stand & Commercial Corridor", "district": "Salem", "lat": 11.6643, "lon": 78.1460, "type": "transit_hub", "radius_m": 400},
    {"name": "Tirunelveli Junction & Thamirabarani Basin", "district": "Tirunelveli", "lat": 8.7289, "lon": 77.7081, "type": "waterbody", "radius_m": 500},
]
