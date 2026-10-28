from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from app.database import get_db_connection
from app.priority_engine import haversine_distance_meters, PriorityScoringEngine
from app.config import TAMIL_NADU_SENSITIVE_ZONES

class HotspotService:
    CLUSTER_RADIUS_METERS = 500.0
    MIN_REPORTS_FOR_HOTSPOT = 2

    @classmethod
    def recalculate_hotspots_from_reports(cls):
        """
        Scans all unresolved / active reports and dynamically clusters them
        into recurring hotspots.
        """
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, title, district, area, latitude, longitude, status, priority, priority_score, created_at
                FROM reports
                WHERE status != 'Resolved' AND status != 'Rejected'
                ORDER BY created_at DESC
            """)
            reports = cursor.fetchall()

            # Group reports by district first for efficiency
            district_groups: Dict[str, List[Dict[str, Any]]] = {}
            for r in reports:
                district_groups.setdefault(r["district"], []).append(r)

            detected_hotspots = []

            for district, d_reports in district_groups.items():
                visited = set()
                for i, rep1 in enumerate(d_reports):
                    if rep1["id"] in visited:
                        continue

                    cluster = [rep1]
                    visited.add(rep1["id"])

                    for j, rep2 in enumerate(d_reports):
                        if rep2["id"] in visited:
                            continue
                        dist = haversine_distance_meters(
                            rep1["latitude"], rep1["longitude"],
                            rep2["latitude"], rep2["longitude"]
                        )
                        if dist <= cls.CLUSTER_RADIUS_METERS:
                            cluster.append(rep2)
                            visited.add(rep2["id"])

                    if len(cluster) >= cls.MIN_REPORTS_FOR_HOTSPOT:
                        # Compute centroid
                        avg_lat = sum(c["latitude"] for c in cluster) / len(cluster)
                        avg_lon = sum(c["longitude"] for c in cluster) / len(cluster)
                        
                        # Identify nearest sensitive zone
                        _, sens_name, _ = PriorityScoringEngine.calculate_sensitive_zone_risk(avg_lat, avg_lon)

                        # Determine severity
                        avg_priority_score = sum(c["priority_score"] for c in cluster) / len(cluster)
                        if avg_priority_score >= 70 or len(cluster) >= 4:
                            severity = "Critical"
                        elif avg_priority_score >= 50 or len(cluster) >= 3:
                            severity = "High"
                        else:
                            severity = "Medium"

                        hotspot_id = f"HS-{district[:3].upper()}-{cluster[0]['id'][-4:]}"
                        hotspot_name = f"{cluster[0]['area']} Waste Cluster Zone"
                        desc = f"Identified recurring dumping location with {len(cluster)} active civic reports."

                        detected_hotspots.append({
                            "id": hotspot_id,
                            "name": hotspot_name,
                            "district": district,
                            "area": cluster[0]["area"],
                            "latitude": round(avg_lat, 6),
                            "longitude": round(avg_lon, 6),
                            "radius_meters": cls.CLUSTER_RADIUS_METERS,
                            "report_count": len(cluster),
                            "severity_level": severity,
                            "sensitive_zone": sens_name,
                            "description": desc,
                            "last_reported_at": cluster[0]["created_at"],
                            "report_ids": [c["id"] for c in cluster]
                        })

            # Sync detected hotspots to DB
            for hs in detected_hotspots:
                cursor.execute("""
                    INSERT INTO hotspots (id, name, district, area, latitude, longitude, radius_meters, report_count, severity_level, sensitive_zone, description, last_reported_at)
                    VALUES (:id, :name, :district, :area, :latitude, :longitude, :radius_meters, :report_count, :severity_level, :sensitive_zone, :description, :last_reported_at)
                    ON CONFLICT(id) DO UPDATE SET
                        report_count = excluded.report_count,
                        severity_level = excluded.severity_level,
                        sensitive_zone = excluded.sensitive_zone,
                        last_reported_at = excluded.last_reported_at
                """, hs)

                # Link reports to hotspot
                for rid in hs["report_ids"]:
                    cursor.execute("""
                        UPDATE reports
                        SET is_hotspot_member = 1, hotspot_id = ?
                        WHERE id = ?
                    """, (hs["id"], rid))

    @classmethod
    def get_all_hotspots(cls) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM hotspots ORDER BY report_count DESC, severity_level DESC")
            return cursor.fetchall()
