from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ReportCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    waste_type: str = Field(..., description="plastic, organic, hazardous, construction, overflowing_bin, mixed")
    estimated_volume: str = Field("medium_pile", description="small_bag, medium_pile, large_dump, truckload")
    district: str = Field(..., min_length=2, max_length=100)
    area: str = Field(..., min_length=2, max_length=150)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    landmark: Optional[str] = Field(None, max_length=150)
    citizen_name: Optional[str] = Field(None, max_length=100)
    citizen_phone: Optional[str] = Field(None, max_length=20)

class StatusUpdate(BaseModel):
    status: str = Field(..., description="Pending, Assigned, In Progress, Resolved, Rejected")
    assigned_officer: Optional[str] = None
    assigned_department: Optional[str] = None
    resolution_notes: Optional[str] = None
    comment: Optional[str] = None
    updated_by: str = "Admin / Ward Sanitation Officer"

class AIDetectionBox(BaseModel):
    label: str
    confidence: float
    box_2d: List[float] = Field(default_factory=list, description="[ymin, xmin, ymax, xmax] normalized 0-100")
    severity: str

class AIDetectionResponse(BaseModel):
    is_simulated: bool
    ai_mode: str
    model_name: str
    confidence_score: float
    detected_objects: List[AIDetectionBox]
    waste_category: str
    severity_assessment: str
    disclaimer: str

class PriorityBreakdown(BaseModel):
    formula_name: str
    formula_description: str
    is_prototype_rule: bool
    waste_severity_score: float
    waste_severity_weight: float
    hotspot_cluster_score: float
    hotspot_cluster_weight: float
    sensitive_zone_score: float
    sensitive_zone_weight: float
    sensitive_zone_name: Optional[str]
    aging_hours: float
    aging_score: float
    aging_weight: float
    final_score: float
    priority_level: str

class StatusLogResponse(BaseModel):
    id: int
    report_id: str
    from_status: str
    to_status: str
    comment: Optional[str]
    updated_by: Optional[str]
    timestamp: str

class ReportResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    waste_type: str
    estimated_volume: str
    district: str
    area: str
    latitude: float
    longitude: float
    landmark: Optional[str]
    status: str
    priority: str
    priority_score: float
    priority_breakdown: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    image_filename: Optional[str] = None
    resolved_image_url: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[str] = None
    assigned_officer: Optional[str] = None
    assigned_department: Optional[str] = None
    ai_detected_labels: Optional[List[Dict[str, Any]]] = None
    ai_confidence: float = 0.0
    ai_mode: str = "prototype"
    is_hotspot_member: bool = False
    hotspot_id: Optional[str] = None
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    created_at: str
    updated_at: str
    status_history: Optional[List[StatusLogResponse]] = None

class HotspotResponse(BaseModel):
    id: str
    name: str
    district: str
    area: str
    latitude: float
    longitude: float
    radius_meters: float
    report_count: int
    severity_level: str
    sensitive_zone: Optional[str]
    description: Optional[str]
    last_reported_at: str

class SystemStats(BaseModel):
    total_reports: int
    pending_reports: int
    assigned_reports: int
    in_progress_reports: int
    resolved_reports: int
    high_priority_count: int
    active_hotspots: int
    districts_covered: int
    recent_reports: List[ReportResponse]
