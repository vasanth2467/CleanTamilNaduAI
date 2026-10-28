import os
import uuid
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import (
    BASE_DIR, DATABASE_PATH, UPLOAD_DIR,
    AI_MODE, MAX_IMAGE_SIZE_BYTES, ALLOWED_EXTENSIONS,
    CORS_ORIGINS, TAMIL_NADU_SENSITIVE_ZONES
)
from app.database import get_db_connection, init_db
from app.schemas import (
    ReportResponse, HotspotResponse, SystemStats,
    StatusUpdate, AIDetectionResponse
)
from app.ai_detector import ai_detector
from app.priority_engine import PriorityScoringEngine
from app.hotspot_service import HotspotService
from app.seed_data import seed_database

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_database(force_reseed=False)
    yield

app = FastAPI(
    title="CleanTamil Nadu AI API",
    description="Intelligent Garbage Detection and Hotspot Management System for Tamil Nadu Cities",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Also ensure DB tables exist at import time
init_db()

def format_report_dict(row: dict) -> dict:
    d = dict(row)
    if "priority_breakdown" in d and d["priority_breakdown"]:
        try:
            d["priority_breakdown"] = json.loads(d["priority_breakdown"])
        except Exception:
            pass
    if "ai_detected_labels" in d and d["ai_detected_labels"]:
        try:
            d["ai_detected_labels"] = json.loads(d["ai_detected_labels"])
        except Exception:
            pass
    d["is_hotspot_member"] = bool(d.get("is_hotspot_member", 0))
    return d

def validate_uploaded_image(file: UploadFile) -> str:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Only JPEG, PNG, and WebP are accepted."
        )
    return ext

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CleanTamil Nadu AI Core Engine",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ai_mode": AI_MODE,
        "ai_model_name": ai_detector.active_model_name,
        "is_ai_simulated": not ai_detector.model_loaded,
        "database": "SQLite (clean_tamil_nadu.db)",
        "state": "Tamil Nadu, India"
    }

@app.get("/api/stats", response_model=SystemStats)
def get_stats():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as total FROM reports")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as pending FROM reports WHERE status = 'Pending'")
        pending = cursor.fetchone()["pending"]

        cursor.execute("SELECT COUNT(*) as assigned FROM reports WHERE status = 'Assigned'")
        assigned = cursor.fetchone()["assigned"]

        cursor.execute("SELECT COUNT(*) as in_prog FROM reports WHERE status = 'In Progress'")
        in_prog = cursor.fetchone()["in_prog"]

        cursor.execute("SELECT COUNT(*) as resolved FROM reports WHERE status = 'Resolved'")
        resolved = cursor.fetchone()["resolved"]

        cursor.execute("SELECT COUNT(*) as high_pri FROM reports WHERE priority IN ('High', 'Critical') AND status != 'Resolved'")
        high_pri = cursor.fetchone()["high_pri"]

        cursor.execute("SELECT COUNT(*) as hotspots FROM hotspots")
        hotspots = cursor.fetchone()["hotspots"]

        cursor.execute("SELECT COUNT(DISTINCT district) as districts FROM reports")
        districts = cursor.fetchone()["districts"]

        cursor.execute("SELECT * FROM reports ORDER BY created_at DESC LIMIT 6")
        recent = [format_report_dict(r) for r in cursor.fetchall()]

    return {
        "total_reports": total,
        "pending_reports": pending,
        "assigned_reports": assigned,
        "in_progress_reports": in_prog,
        "resolved_reports": resolved,
        "high_priority_count": high_pri,
        "active_hotspots": hotspots,
        "districts_covered": districts,
        "recent_reports": recent
    }

@app.get("/api/reports", response_model=List[ReportResponse])
def get_reports(
    district: Optional[str] = Query(None, description="Filter by district"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search keyword in title, area, or description"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    query = "SELECT * FROM reports WHERE 1=1"
    params = []

    if district and district.lower() != "all":
        query += " AND LOWER(district) = LOWER(?)"
        params.append(district)

    if status_filter and status_filter.lower() != "all":
        query += " AND LOWER(status) = LOWER(?)"
        params.append(status_filter)

    if priority and priority.lower() != "all":
        query += " AND LOWER(priority) = LOWER(?)"
        params.append(priority)

    if search:
        query += " AND (title LIKE ? OR area LIKE ? OR description LIKE ? OR id LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    query += " ORDER BY CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [format_report_dict(r) for r in rows]

@app.get("/api/reports/{report_id}", response_model=ReportResponse)
def get_report_detail(report_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
        
        rep = format_report_dict(row)

        cursor.execute("SELECT * FROM status_logs WHERE report_id = ? ORDER BY timestamp ASC", (report_id,))
        rep["status_history"] = cursor.fetchall()
        return rep

@app.post("/api/ai/analyze-preview", response_model=AIDetectionResponse)
async def analyze_preview(
    file: UploadFile = File(...),
    waste_type_hint: Optional[str] = Form(None)
):
    ext = validate_uploaded_image(file)
    temp_filename = f"preview_{uuid.uuid4().hex[:8]}{ext}"
    temp_path = UPLOAD_DIR / temp_filename

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Check file size
        if temp_path.stat().st_size > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

        result = ai_detector.analyze_image(str(temp_path), waste_type_hint)
        return result
    finally:
        # Clean up temporary preview file
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass

@app.post("/api/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    waste_type: str = Form(...),
    estimated_volume: str = Form("medium_pile"),
    district: str = Form(...),
    area: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    landmark: Optional[str] = Form(None),
    citizen_name: Optional[str] = Form(None),
    citizen_phone: Optional[str] = Form(None),
    image: UploadFile = File(...)
):
    ext = validate_uploaded_image(image)
    
    # Generate unique ID: e.g. TN-G-2026-X7K9
    unique_suffix = uuid.uuid4().hex[:4].upper()
    report_id = f"TN-G-2026-{unique_suffix}"
    
    filename = f"{report_id}_{uuid.uuid4().hex[:6]}{ext}"
    saved_path = UPLOAD_DIR / filename

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    if saved_path.stat().st_size > MAX_IMAGE_SIZE_BYTES:
        saved_path.unlink()
        raise HTTPException(status_code=400, detail="Image size exceeds maximum limit of 10MB.")

    # 1. Run AI detection (with clearly labeled mode)
    ai_result = ai_detector.analyze_image(str(saved_path), waste_type)
    
    # 2. Query nearby reports for cluster scoring
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT latitude, longitude FROM reports WHERE district = ? AND status != 'Resolved'", (district,))
        nearby = cursor.fetchall()

    # 3. Calculate priority score
    now_iso = datetime.now(timezone.utc).isoformat()
    priority_info = PriorityScoringEngine.compute_priority(
        waste_type=waste_type,
        estimated_volume=estimated_volume,
        latitude=latitude,
        longitude=longitude,
        nearby_reports=nearby,
        created_at_iso=now_iso
    )

    image_url = f"/uploads/{filename}"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reports (
                id, title, description, waste_type, estimated_volume,
                district, area, latitude, longitude, landmark,
                status, priority, priority_score, priority_breakdown,
                image_url, image_filename,
                ai_detected_labels, ai_confidence, ai_mode,
                citizen_name, citizen_phone,
                created_at, updated_at
            ) VALUES (
                :id, :title, :description, :waste_type, :estimated_volume,
                :district, :area, :latitude, :longitude, :landmark,
                'Pending', :priority, :priority_score, :priority_breakdown,
                :image_url, :image_filename,
                :ai_detected_labels, :ai_confidence, :ai_mode,
                :citizen_name, :citizen_phone,
                :created_at, :updated_at
            )
        """, {
            "id": report_id,
            "title": title.strip(),
            "description": description.strip() if description else None,
            "waste_type": waste_type.strip(),
            "estimated_volume": estimated_volume.strip(),
            "district": district.strip(),
            "area": area.strip(),
            "latitude": latitude,
            "longitude": longitude,
            "landmark": landmark.strip() if landmark else None,
            "priority": priority_info["priority_level"],
            "priority_score": priority_info["final_score"],
            "priority_breakdown": json.dumps(priority_info),
            "image_url": image_url,
            "image_filename": filename,
            "ai_detected_labels": json.dumps(ai_result["detected_objects"]),
            "ai_confidence": ai_result["confidence_score"],
            "ai_mode": ai_result["ai_mode"],
            "citizen_name": citizen_name.strip() if citizen_name else None,
            "citizen_phone": citizen_phone.strip() if citizen_phone else None,
            "created_at": now_iso,
            "updated_at": now_iso
        })

        # Add initial status log
        cursor.execute("""
            INSERT INTO status_logs (report_id, from_status, to_status, comment, updated_by, timestamp)
            VALUES (?, 'None', 'Pending', 'Citizen report lodged successfully.', ?, ?)
        """, (report_id, citizen_name or "Citizen", now_iso))

        # Fetch newly created record
        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        created_row = cursor.fetchone()

    # Recalculate hotspots in background
    try:
        HotspotService.recalculate_hotspots_from_reports()
    except Exception as e:
        print(f"[Hotspot Update] Warning: {e}")

    return format_report_dict(created_row)

@app.patch("/api/reports/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: str,
    status_val: str = Form(..., alias="status"),
    assigned_officer: Optional[str] = Form(None),
    assigned_department: Optional[str] = Form(None),
    resolution_notes: Optional[str] = Form(None),
    comment: Optional[str] = Form(None),
    updated_by: str = Form("Admin / Ward Sanitation Officer"),
    resolved_image: Optional[UploadFile] = File(None)
):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")

        old_status = existing["status"]
        now_iso = datetime.now(timezone.utc).isoformat()
        resolved_at = None
        resolved_img_url = existing["resolved_image_url"]

        if resolved_image and resolved_image.filename:
            ext = validate_uploaded_image(resolved_image)
            res_filename = f"resolved_{report_id}_{uuid.uuid4().hex[:6]}{ext}"
            res_path = UPLOAD_DIR / res_filename
            with open(res_path, "wb") as buffer:
                shutil.copyfileobj(resolved_image.file, buffer)
            resolved_img_url = f"/uploads/{res_filename}"

        if status_val == "Resolved":
            resolved_at = now_iso

        cursor.execute("""
            UPDATE reports SET
                status = :status,
                assigned_officer = COALESCE(:assigned_officer, assigned_officer),
                assigned_department = COALESCE(:assigned_department, assigned_department),
                resolution_notes = COALESCE(:resolution_notes, resolution_notes),
                resolved_image_url = COALESCE(:resolved_image_url, resolved_image_url),
                resolved_at = COALESCE(:resolved_at, resolved_at),
                updated_at = :updated_at
            WHERE id = :id
        """, {
            "status": status_val,
            "assigned_officer": assigned_officer,
            "assigned_department": assigned_department,
            "resolution_notes": resolution_notes,
            "resolved_image_url": resolved_img_url,
            "resolved_at": resolved_at,
            "updated_at": now_iso,
            "id": report_id
        })

        cursor.execute("""
            INSERT INTO status_logs (report_id, from_status, to_status, comment, updated_by, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            report_id,
            old_status,
            status_val,
            comment or f"Status changed from {old_status} to {status_val}.",
            updated_by,
            now_iso
        ))

        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        updated_row = cursor.fetchone()

    # Recalculate hotspots
    HotspotService.recalculate_hotspots_from_reports()

    return format_report_dict(updated_row)

@app.get("/api/hotspots", response_model=List[HotspotResponse])
def get_hotspots():
    return HotspotService.get_all_hotspots()

@app.get("/api/sensitive-zones")
def get_sensitive_zones():
    return TAMIL_NADU_SENSITIVE_ZONES

@app.post("/api/seed")
def trigger_reseed():
    seed_database(force_reseed=True)
    return {"message": "Database reset and seeded with initial Tamil Nadu civic reports."}
