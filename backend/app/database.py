import sqlite3
import json
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator
from app.config import DATABASE_PATH

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = dict_factory
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Reports table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            waste_type TEXT NOT NULL,
            estimated_volume TEXT NOT NULL,
            district TEXT NOT NULL,
            area TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            landmark TEXT,
            status TEXT NOT NULL DEFAULT 'Pending',
            priority TEXT NOT NULL DEFAULT 'Medium',
            priority_score REAL NOT NULL DEFAULT 50.0,
            priority_breakdown TEXT,
            image_url TEXT,
            image_filename TEXT,
            resolved_image_url TEXT,
            resolution_notes TEXT,
            resolved_at TEXT,
            assigned_officer TEXT,
            assigned_department TEXT,
            ai_detected_labels TEXT,
            ai_confidence REAL DEFAULT 0.0,
            ai_mode TEXT DEFAULT 'prototype',
            is_hotspot_member INTEGER DEFAULT 0,
            hotspot_id TEXT,
            citizen_name TEXT,
            citizen_phone TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)

        # Hotspots table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hotspots (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            district TEXT NOT NULL,
            area TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            radius_meters REAL NOT NULL DEFAULT 350.0,
            report_count INTEGER NOT NULL DEFAULT 1,
            severity_level TEXT NOT NULL DEFAULT 'Medium',
            sensitive_zone TEXT,
            description TEXT,
            last_reported_at TEXT NOT NULL
        );
        """)

        # Status logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS status_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id TEXT NOT NULL,
            from_status TEXT NOT NULL,
            to_status TEXT NOT NULL,
            comment TEXT,
            updated_by TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
        );
        """)

        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_district ON reports(district);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_hotspots_district ON hotspots(district);")
