import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.config import TAMIL_NADU_SENSITIVE_ZONES

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class PriorityScoringEngine:
    """
    Configurable Priority Scoring Rule Engine for CleanTamil Nadu AI.
    
    Formula:
    PriorityScore = (WasteSeverity * 0.35) + 
                    (ClusterDensity * 0.25) + 
                    (SensitiveZoneRisk * 0.20) + 
                    (AgingUnresolved * 0.20)
                    
    PROTOTYPE DISCLAIMER:
    This scoring algorithm is an initial municipal prototype rule-set designed
    for transparent demonstration and civic evaluation. It is subject to municipal
    weight recalibration and ward policy customization.
    """

    FORMULA_NAME = "TN-Civic-Prototype-Rule-v1.0"
    IS_PROTOTYPE_RULE = True

    WEIGHTS = {
        "waste_severity": 0.35,
        "hotspot_cluster": 0.25,
        "sensitive_zone": 0.20,
        "aging": 0.20
    }

    WASTE_SEVERITY_SCORES = {
        "hazardous": 100.0,
        "overflowing_bin": 85.0,
        "mixed": 75.0,
        "plastic": 65.0,
        "construction": 55.0,
        "organic": 45.0,
        "other": 50.0
    }

    VOLUME_MULTIPLIERS = {
        "truckload": 1.25,
        "large_dump": 1.15,
        "medium_pile": 1.0,
        "small_bag": 0.75
    }

    @classmethod
    def calculate_sensitive_zone_risk(cls, lat: float, lon: float) -> tuple[float, Optional[str], float]:
        """
        Returns (score, closest_zone_name, min_distance_m)
        """
        min_dist = float("inf")
        closest_zone = None

        for zone in TAMIL_NADU_SENSITIVE_ZONES:
            dist = haversine_distance_meters(lat, lon, zone["lat"], zone["lon"])
            if dist < min_dist:
                min_dist = dist
                closest_zone = zone

        if min_dist <= 250:
            score = 100.0
        elif min_dist <= 500:
            score = 75.0
        elif min_dist <= 1000:
            score = 45.0
        elif min_dist <= 2000:
            score = 25.0
        else:
            score = 10.0

        zone_name = f"{closest_zone['name']} ({closest_zone['type'].replace('_', ' ').title()})" if closest_zone else None
        return score, zone_name, min_dist

    @classmethod
    def calculate_cluster_score(cls, lat: float, lon: float, nearby_reports: List[Dict[str, Any]]) -> float:
        """
        Calculates cluster density score based on nearby active reports within 600m radius.
        """
        count = 0
        for report in nearby_reports:
            r_lat = report.get("latitude")
            r_lon = report.get("longitude")
            if r_lat is not None and r_lon is not None:
                d = haversine_distance_meters(lat, lon, float(r_lat), float(r_lon))
                if d <= 600.0:
                    count += 1

        if count >= 6:
            return 100.0
        elif count >= 4:
            return 80.0
        elif count >= 2:
            return 60.0
        elif count >= 1:
            return 40.0
        return 15.0

    @classmethod
    def calculate_aging_score(cls, created_at_iso: str) -> tuple[float, float]:
        """
        Calculates aging score from hours elapsed since report creation.
        Returns (aging_score, elapsed_hours)
        """
        try:
            created_dt = datetime.fromisoformat(created_at_iso.replace("Z", "+00:00"))
            now_dt = datetime.now(timezone.utc)
            delta = now_dt - created_dt
            hours = max(0.0, delta.total_seconds() / 3600.0)
        except Exception:
            hours = 0.0

        if hours >= 72.0:
            return 100.0, hours
        elif hours >= 48.0:
            return 80.0, hours
        elif hours >= 24.0:
            return 55.0, hours
        elif hours >= 6.0:
            return 35.0, hours
        return 15.0, hours

    @classmethod
    def compute_priority(
        cls,
        waste_type: str,
        estimated_volume: str,
        latitude: float,
        longitude: float,
        nearby_reports: Optional[List[Dict[str, Any]]] = None,
        created_at_iso: Optional[str] = None
    ) -> Dict[str, Any]:
        nearby_reports = nearby_reports or []
        created_at_iso = created_at_iso or datetime.now(timezone.utc).isoformat()

        # 1. Waste severity
        base_severity = cls.WASTE_SEVERITY_SCORES.get(waste_type.lower(), 50.0)
        vol_mult = cls.VOLUME_MULTIPLIERS.get(estimated_volume.lower(), 1.0)
        waste_severity_score = min(100.0, round(base_severity * vol_mult, 1))

        # 2. Hotspot cluster density
        cluster_score = cls.calculate_cluster_score(latitude, longitude, nearby_reports)

        # 3. Sensitive zone risk
        sensitive_score, sensitive_name, dist_m = cls.calculate_sensitive_zone_risk(latitude, longitude)

        # 4. Aging score
        aging_score, hours_elapsed = cls.calculate_aging_score(created_at_iso)

        # Final weighted composite
        final_score = (
            waste_severity_score * cls.WEIGHTS["waste_severity"] +
            cluster_score * cls.WEIGHTS["hotspot_cluster"] +
            sensitive_score * cls.WEIGHTS["sensitive_zone"] +
            aging_score * cls.WEIGHTS["aging"]
        )
        final_score = round(max(0.0, min(100.0, final_score)), 1)

        # Categorize
        if final_score >= 80.0:
            priority_level = "Critical"
        elif final_score >= 60.0:
            priority_level = "High"
        elif final_score >= 35.0:
            priority_level = "Medium"
        else:
            priority_level = "Low"

        return {
            "formula_name": cls.FORMULA_NAME,
            "formula_description": (
                "Weighted sum: 35% Waste Type & Volume, 25% Hotspot Cluster Density (600m), "
                "20% Sensitive Zone Proximity (hospitals/schools/water bodies), 20% Unresolved Hours."
            ),
            "is_prototype_rule": cls.IS_PROTOTYPE_RULE,
            "waste_severity_score": waste_severity_score,
            "waste_severity_weight": cls.WEIGHTS["waste_severity"],
            "hotspot_cluster_score": cluster_score,
            "hotspot_cluster_weight": cls.WEIGHTS["hotspot_cluster"],
            "sensitive_zone_score": sensitive_score,
            "sensitive_zone_weight": cls.WEIGHTS["sensitive_zone"],
            "sensitive_zone_name": sensitive_name,
            "sensitive_zone_distance_m": round(dist_m, 1),
            "aging_hours": round(hours_elapsed, 1),
            "aging_score": aging_score,
            "aging_weight": cls.WEIGHTS["aging"],
            "final_score": final_score,
            "priority_level": priority_level
        }
