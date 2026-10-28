import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CleanTamil Nadu AI" in data["service"]
    assert data["is_ai_simulated"] is True  # In demo mode, strictly simulated!

def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_reports" in data
    assert data["total_reports"] >= 10
    assert "pending_reports" in data
    assert "resolved_reports" in data

def test_get_reports_filtering():
    response = client.get("/api/reports?district=Chennai")
    assert response.status_code == 200
    reports = response.json()
    assert len(reports) > 0
    for r in reports:
        assert r["district"].lower() == "chennai"

def test_get_hotspots():
    response = client.get("/api/hotspots")
    assert response.status_code == 200
    hotspots = response.json()
    assert isinstance(hotspots, list)
