import pytest
from app.priority_engine import PriorityScoringEngine, haversine_distance_meters

def test_haversine_calculation():
    # Marina Beach to Kapaleeshwarar Temple (~2.1 km)
    dist = haversine_distance_meters(13.0499, 80.2824, 13.0336, 80.2699)
    assert 1800 < dist < 2400

def test_priority_hazardous_waste():
    result = PriorityScoringEngine.compute_priority(
        waste_type="hazardous",
        estimated_volume="large_dump",
        latitude=13.0827,  # Right at Rajiv Gandhi Hospital
        longitude=80.2785,
        nearby_reports=[]
    )
    assert result["is_prototype_rule"] is True
    assert result["final_score"] >= 60.0
    assert result["priority_level"] in ["High", "Critical"]
    assert "hospital" in result["sensitive_zone_name"].lower()

def test_priority_low_isolated_organic():
    result = PriorityScoringEngine.compute_priority(
        waste_type="organic",
        estimated_volume="small_bag",
        latitude=12.5000, # Far from city center
        longitude=79.5000,
        nearby_reports=[]
    )
    assert result["priority_level"] in ["Low", "Medium"]
    assert result["final_score"] < 60.0
