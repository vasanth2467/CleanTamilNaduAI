import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from app.config import UPLOAD_DIR
from app.database import get_db_connection, init_db
from app.priority_engine import PriorityScoringEngine
from app.hotspot_service import HotspotService

def generate_sample_image(filename: str, title: str, category: str, bg_color: str, is_resolved: bool = False):
    img_path = UPLOAD_DIR / filename
    if img_path.exists():
        return f"/uploads/{filename}"

    # Create 640x480 realistic placeholder simulation banner
    img = Image.new("RGB", (640, 480), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Decorative header
    header_color = (20, 83, 45) if is_resolved else (153, 27, 27)
    draw.rectangle([0, 0, 640, 60], fill=header_color)
    draw.text((20, 20), "CleanTamil Nadu AI Civic Verification Photo", fill=(255, 255, 255))

    # Center graphic representation
    border_color = (34, 197, 94) if is_resolved else (239, 68, 68)
    draw.rectangle([40, 90, 600, 390], outline=border_color, width=3)
    
    # Status badge
    status_text = "CLEANUP VERIFIED: SANITIZED SITE" if is_resolved else f"ACTIVE REPORT: {category.upper()}"
    badge_bg = (22, 101, 52) if is_resolved else (185, 28, 28)
    draw.rectangle([50, 105, 590, 145], fill=badge_bg)
    draw.text((65, 118), status_text, fill=(255, 255, 255))

    # Content text
    draw.text((65, 170), f"Location: {title}", fill=(30, 41, 59))
    draw.text((65, 205), f"Category: {category}", fill=(51, 65, 85))
    draw.text((65, 240), f"Audit Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", fill=(71, 85, 105))
    draw.text((65, 275), "Geo-Coordinate Tagged | GCC / TN-Municipal Ward", fill=(71, 85, 105))
    
    if not is_resolved:
        # Simulated bounding box
        draw.rectangle([120, 305, 360, 375], outline=(220, 38, 38), width=2)
        draw.text((125, 310), "[AI Prototype Box: Refuse Detected]", fill=(185, 28, 28))
    else:
        # Verified checkmark text
        draw.text((65, 320), "Status: Waste Cleared | Disinfected by Sanitary Squad", fill=(21, 128, 61))

    # Footer
    draw.rectangle([0, 440, 640, 480], fill=(241, 245, 249))
    draw.text((20, 452), "CleanTamil Nadu AI — Intelligent Waste & Hotspot Platform", fill=(100, 116, 139))

    img.save(img_path, format="JPEG", quality=85)
    return f"/uploads/{filename}"

SAMPLE_REPORTS = [
    {
        "id": "TN-G-2026-CHN01",
        "title": "Overflowing Public Waste Bins near Marina Loop Road",
        "description": "Massive overflow of plastic food wrappers, tender coconut shells, and beverage cups spilling onto pedestrian walkway towards the beach.",
        "waste_type": "overflowing_bin",
        "estimated_volume": "large_dump",
        "district": "Chennai",
        "area": "Marina Beach Promenade",
        "latitude": 13.0489,
        "longitude": 80.2818,
        "landmark": "Near Light House Service Road",
        "status": "In Progress",
        "assigned_officer": "K. Senthilkumar (Zone 9 AE)",
        "assigned_department": "Greater Chennai Corporation - Solid Waste Management",
        "citizen_name": "R. Anand Kumar",
        "citizen_phone": "+91 98401 23456",
        "days_ago": 1.5,
        "image_file": "marina_overflow_01.jpg",
        "img_bg": "#fef2f2"
    },
    {
        "id": "TN-G-2026-CHN01B",
        "title": "Fish Stall Plastic & Ice Box Waste on Marina Loop Road",
        "description": "Thermocol boxes, broken plastic crates, and rotting packaging accumulating 150m south of Lighthouse.",
        "waste_type": "plastic",
        "estimated_volume": "large_dump",
        "district": "Chennai",
        "area": "Marina Beach Promenade",
        "latitude": 13.0478,
        "longitude": 80.2812,
        "landmark": "Pattinapakkam Fish Stall Stretch",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "M. Dinesh",
        "citizen_phone": "+91 98401 99881",
        "days_ago": 0.8,
        "image_file": "marina_fish_waste_01b.jpg",
        "img_bg": "#fffbeb"
    },
    {
        "id": "TN-G-2026-CHN03",
        "title": "Illegal Commercial Debris Dumping behind Koyambedu Market",
        "description": "Truckload of rotten vegetable crates, packaging thermocol, and rotten organic dump generating foul stench near gate 4.",
        "waste_type": "organic",
        "estimated_volume": "truckload",
        "district": "Chennai",
        "area": "Koyambedu Wholesale Market",
        "latitude": 13.0699,
        "longitude": 80.1935,
        "landmark": "Behind Vegetable Wholesale Block Gate 4",
        "status": "Assigned",
        "assigned_officer": "M. Murugesan (Zone 10 Health Inspector)",
        "assigned_department": "Koyambedu Market Management Committee Sanitation Wing",
        "citizen_name": "A. Velu",
        "citizen_phone": "+91 98403 45678",
        "days_ago": 2.2,
        "image_file": "koyambedu_dump_03.jpg",
        "img_bg": "#fef2f2"
    },
    {
        "id": "TN-G-2026-CHN03B",
        "title": "Perishable Fruit Debris & Polythene Spills at Koyambedu Gate 2",
        "description": "Commercial fruit wastes and plastic wrapping discarded on main perimeter road.",
        "waste_type": "organic",
        "estimated_volume": "large_dump",
        "district": "Chennai",
        "area": "Koyambedu Wholesale Market",
        "latitude": 13.0688,
        "longitude": 80.1942,
        "landmark": "Near Gate 2 Truck Loading Dock",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "S. Kannan",
        "citizen_phone": "+91 98403 77661",
        "days_ago": 1.0,
        "image_file": "koyambedu_gate2_03b.jpg",
        "img_bg": "#fff1f2"
    },
    {
        "id": "TN-G-2026-CHN04",
        "title": "Medical & Hazardous Pharmacy Waste in Alwarpet Lane",
        "description": "Discarded syringes, saline bottles, and blister packs dumped in an open corner plot.",
        "waste_type": "hazardous",
        "estimated_volume": "small_bag",
        "district": "Chennai",
        "area": "Alwarpet",
        "latitude": 13.0360,
        "longitude": 80.2520,
        "landmark": "Near Eldams Road Junction",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "Dr. V. Ramanathan",
        "citizen_phone": "+91 98405 11223",
        "days_ago": 0.2,
        "image_file": "alwarpet_hazard_04.jpg",
        "img_bg": "#fff1f2"
    },
    {
        "id": "TN-G-2026-CHN05",
        "title": "Construction Rubble Cleared at T. Nagar Venkatnarayana Rd",
        "description": "Demolition concrete slabs and broken tiles encroaching on the pedestrian footpath.",
        "waste_type": "construction",
        "estimated_volume": "large_dump",
        "district": "Chennai",
        "area": "T. Nagar",
        "latitude": 13.0392,
        "longitude": 80.2335,
        "landmark": "Corner of Burkit Road & Venkatnarayana Road",
        "status": "Resolved",
        "assigned_officer": "P. Balamurugan (Zone 10 Junior Engineer)",
        "assigned_department": "GCC Mechanical Engineering - Debris Removal Unit",
        "citizen_name": "K. Venkatesh",
        "citizen_phone": "+91 98406 99887",
        "days_ago": 4.0,
        "image_file": "tnagar_before_05.jpg",
        "resolved_file": "tnagar_after_05.jpg",
        "resolution_notes": "GCC Debris Removal Loader deployed on 26-Oct. 4.2 metric tonnes of debris transported to Kodungaiyur recycling plant. Footpath washed and reopened.",
        "img_bg": "#f8fafc"
    },
    {
        "id": "TN-G-2026-CBE01",
        "title": "Severe Refuse Overflow behind Gandhipuram Bus Stand",
        "description": "Heaps of plastic water packets, disposable food plates, and cardboard waste clogging stormwater drain behind bay 3.",
        "waste_type": "overflowing_bin",
        "estimated_volume": "large_dump",
        "district": "Coimbatore",
        "area": "Gandhipuram",
        "latitude": 11.0189,
        "longitude": 76.9652,
        "landmark": "Behind Mofussil Bus Bay 3",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "C. Suresh",
        "citizen_phone": "+91 94431 12345",
        "days_ago": 1.8,
        "image_file": "cbe_gandhipuram_01.jpg",
        "img_bg": "#fef2f2"
    },
    {
        "id": "TN-G-2026-CBE01B",
        "title": "Cross Cut Road Beverage & Food Wrapper Overflow",
        "description": "Commercial food stalls and shopping street refuse accumulated within 180m of Gandhipuram bus bay.",
        "waste_type": "plastic",
        "estimated_volume": "medium_pile",
        "district": "Coimbatore",
        "area": "Gandhipuram",
        "latitude": 11.0182,
        "longitude": 76.9645,
        "landmark": "Cross Cut Road Signal Corner",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "R. Vignesh",
        "citizen_phone": "+91 94431 88776",
        "days_ago": 0.9,
        "image_file": "cbe_crosscut_01b.jpg",
        "img_bg": "#fffbeb"
    },
    {
        "id": "TN-G-2026-CBE02",
        "title": "Textile Scrap & Plastic Packaging in RS Puram",
        "description": "Garment trim waste and plastic packaging discarded on vacant plot opposite shopping complex.",
        "waste_type": "mixed",
        "estimated_volume": "medium_pile",
        "district": "Coimbatore",
        "area": "R.S. Puram",
        "latitude": 11.0082,
        "longitude": 76.9498,
        "landmark": "Near DB Road roundabout",
        "status": "Assigned",
        "assigned_officer": "R. Manikandan (Central Zone Inspector)",
        "assigned_department": "Coimbatore Corporation Central Ward Squad",
        "citizen_name": "G. Priya",
        "citizen_phone": "+91 94432 55667",
        "days_ago": 1.1,
        "image_file": "cbe_rspuram_02.jpg",
        "img_bg": "#fffbeb"
    },
    {
        "id": "TN-G-2026-MDU01",
        "title": "Vegetable & Floral Waste Dumping in Simmakkal",
        "description": "Rotten plantain leaves, floral garlands, and wet vegetable refuse accumulated on riverbank approach.",
        "waste_type": "organic",
        "estimated_volume": "large_dump",
        "district": "Madurai",
        "area": "Simmakkal",
        "latitude": 9.9275,
        "longitude": 78.1215,
        "landmark": "North Veli Street Corner",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "T. Muthuraman",
        "citizen_phone": "+91 94861 33445",
        "days_ago": 2.5,
        "image_file": "mdu_simmakkal_01.jpg",
        "img_bg": "#fef2f2"
    },
    {
        "id": "TN-G-2026-MDU01B",
        "title": "Vaigai Bank Floral Refuse Accumulation at Simmakkal Ghat",
        "description": "Pooja waste and plastic cups dumped along the Vaigai river approach steps 120m from North Veli.",
        "waste_type": "organic",
        "estimated_volume": "medium_pile",
        "district": "Madurai",
        "area": "Simmakkal",
        "latitude": 9.9268,
        "longitude": 78.1210,
        "landmark": "Vaigai Riverbank Ghat Steps",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "K. Arumugam",
        "citizen_phone": "+91 94861 44556",
        "days_ago": 1.4,
        "image_file": "mdu_vaigai_01b.jpg",
        "img_bg": "#fef2f2"
    },
    {
        "id": "TN-G-2026-MDU02",
        "title": "Mattuthavani Bus Stand Concourse Sanitized",
        "description": "Plastic bottles and food packaging cleaned and compactor deployed.",
        "waste_type": "plastic",
        "estimated_volume": "medium_pile",
        "district": "Madurai",
        "area": "Mattuthavani",
        "latitude": 9.9535,
        "longitude": 78.1582,
        "landmark": "Integrated Bus Terminus Bay 5",
        "status": "Resolved",
        "assigned_officer": "S. Alagarsamy (East Zone Officer)",
        "assigned_department": "Madurai City Corporation Sanitation Team",
        "citizen_name": "N. Karthik",
        "citizen_phone": "+91 94862 88990",
        "days_ago": 3.8,
        "image_file": "mdu_before_02.jpg",
        "resolved_file": "mdu_after_02.jpg",
        "resolution_notes": "Madurai Corporation compactors cleared 1.8 tons of waste. Anti-bacterial bleaching powder spread across area.",
        "img_bg": "#f8fafc"
    },
    {
        "id": "TN-G-2026-TRI01",
        "title": "Plastic Carry Bags Dump near Chathiram Bus Stand",
        "description": "Drain blockage caused by accumulated plastic shopping bags and polystyrene cups.",
        "waste_type": "plastic",
        "estimated_volume": "large_dump",
        "district": "Tiruchirappalli",
        "area": "Chathiram",
        "latitude": 10.8295,
        "longitude": 78.6940,
        "landmark": "Near College Road entrance",
        "status": "In Progress",
        "assigned_officer": "J. Rajendran (Ariyamangalam Zone AE)",
        "assigned_department": "Tiruchirappalli Corporation Clean Squad",
        "citizen_name": "M. Selvam",
        "citizen_phone": "+91 94441 77665",
        "days_ago": 1.2,
        "image_file": "tri_chathiram_01.jpg",
        "img_bg": "#fffbeb"
    },
    {
        "id": "TN-G-2026-SLM01",
        "title": "Open Waste Dump behind Salem New Bus Stand",
        "description": "Unattended pile of tea cups, biscuit cartons, and municipal trash spilling into open ditch.",
        "waste_type": "mixed",
        "estimated_volume": "medium_pile",
        "district": "Salem",
        "area": "Meyyanur",
        "latitude": 11.6655,
        "longitude": 78.1472,
        "landmark": "Opposite Bus Stand South Gate",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "V. Dhanapal",
        "citizen_phone": "+91 94421 99887",
        "days_ago": 2.0,
        "image_file": "slm_busstand_01.jpg",
        "img_bg": "#fef2f2"
    },
    {
        "id": "TN-G-2026-TNV01",
        "title": "Discarded Plastics on Thamirabarani River Bank",
        "description": "Dumping of plastic bottles and celebration waste near holy bathing ghat.",
        "waste_type": "plastic",
        "estimated_volume": "large_dump",
        "district": "Tirunelveli",
        "area": "Tirunelveli Town",
        "latitude": 8.7295,
        "longitude": 77.7092,
        "landmark": "Near Kurukkuthurai Murugan Temple Bathing Ghat",
        "status": "Pending",
        "assigned_officer": None,
        "assigned_department": None,
        "citizen_name": "P. Sankaran",
        "citizen_phone": "+91 94450 12345",
        "days_ago": 1.6,
        "image_file": "tnv_river_01.jpg",
        "img_bg": "#fef2f2"
    }
]

def seed_database(force_reseed: bool = False):
    init_db()

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM reports")
        count = cursor.fetchone()["count"]

        if count > 0 and not force_reseed:
            print(f"[Seed] Database already has {count} reports. Skipping seed.")
            return

        if force_reseed:
            cursor.execute("DELETE FROM status_logs")
            cursor.execute("DELETE FROM hotspots")
            cursor.execute("DELETE FROM reports")

        now = datetime.now(timezone.utc)

        for rep in SAMPLE_REPORTS:
            created_dt = now - timedelta(days=rep["days_ago"])
            created_iso = created_dt.isoformat()
            updated_iso = (created_dt + timedelta(hours=6)).isoformat()
            
            # Generate sample image files in uploads/
            img_url = generate_sample_image(
                rep["image_file"],
                rep["title"],
                rep["waste_type"],
                rep.get("img_bg", "#ffffff"),
                is_resolved=False
            )

            resolved_img_url = None
            resolved_at = None
            if rep["status"] == "Resolved" and "resolved_file" in rep:
                resolved_img_url = generate_sample_image(
                    rep["resolved_file"],
                    rep["title"],
                    rep["waste_type"],
                    "#f0fdf4",
                    is_resolved=True
                )
                resolved_at = (created_dt + timedelta(days=1.5)).isoformat()

            # Priority calculation using prototype engine
            breakdown = PriorityScoringEngine.compute_priority(
                waste_type=rep["waste_type"],
                estimated_volume=rep["estimated_volume"],
                latitude=rep["latitude"],
                longitude=rep["longitude"],
                nearby_reports=[],
                created_at_iso=created_iso
            )

            # Simulated AI detection results
            ai_labels = [
                {
                    "label": f"{rep['waste_type'].replace('_', ' ').title()} Accumulation",
                    "confidence": 0.88,
                    "box_2d": [18.0, 15.0, 78.0, 85.0],
                    "severity": breakdown["priority_level"]
                }
            ]

            cursor.execute("""
                INSERT INTO reports (
                    id, title, description, waste_type, estimated_volume,
                    district, area, latitude, longitude, landmark,
                    status, priority, priority_score, priority_breakdown,
                    image_url, image_filename, resolved_image_url, resolution_notes, resolved_at,
                    assigned_officer, assigned_department,
                    ai_detected_labels, ai_confidence, ai_mode,
                    is_hotspot_member, hotspot_id,
                    citizen_name, citizen_phone,
                    created_at, updated_at
                ) VALUES (
                    :id, :title, :description, :waste_type, :estimated_volume,
                    :district, :area, :latitude, :longitude, :landmark,
                    :status, :priority, :priority_score, :priority_breakdown,
                    :image_url, :image_filename, :resolved_image_url, :resolution_notes, :resolved_at,
                    :assigned_officer, :assigned_department,
                    :ai_detected_labels, :ai_confidence, :ai_mode,
                    :is_hotspot_member, :hotspot_id,
                    :citizen_name, :citizen_phone,
                    :created_at, :updated_at
                )
            """, {
                "id": rep["id"],
                "title": rep["title"],
                "description": rep["description"],
                "waste_type": rep["waste_type"],
                "estimated_volume": rep["estimated_volume"],
                "district": rep["district"],
                "area": rep["area"],
                "latitude": rep["latitude"],
                "longitude": rep["longitude"],
                "landmark": rep.get("landmark"),
                "status": rep["status"],
                "priority": breakdown["priority_level"],
                "priority_score": breakdown["final_score"],
                "priority_breakdown": json.dumps(breakdown),
                "image_url": img_url,
                "image_filename": rep["image_file"],
                "resolved_image_url": resolved_img_url,
                "resolution_notes": rep.get("resolution_notes"),
                "resolved_at": resolved_at,
                "assigned_officer": rep.get("assigned_officer"),
                "assigned_department": rep.get("assigned_department"),
                "ai_detected_labels": json.dumps(ai_labels),
                "ai_confidence": 0.88,
                "ai_mode": "demo_prototype",
                "is_hotspot_member": 0,
                "hotspot_id": None,
                "citizen_name": rep.get("citizen_name"),
                "citizen_phone": rep.get("citizen_phone"),
                "created_at": created_iso,
                "updated_at": updated_iso
            })

            # Add initial creation log
            cursor.execute("""
                INSERT INTO status_logs (report_id, from_status, to_status, comment, updated_by, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                rep["id"],
                "None",
                "Pending",
                "Report lodged via CleanTamil Nadu AI citizen portal.",
                rep.get("citizen_name", "Citizen"),
                created_iso
            ))

            if rep["status"] != "Pending":
                cursor.execute("""
                    INSERT INTO status_logs (report_id, from_status, to_status, comment, updated_by, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    rep["id"],
                    "Pending",
                    rep["status"],
                    f"Status updated to {rep['status']}: {rep.get('resolution_notes') or 'Sanitation squad mobilized.'}",
                    rep.get("assigned_officer") or "Municipal Authority",
                    updated_iso
                ))

    # Recalculate hotspots dynamically
    HotspotService.recalculate_hotspots_from_reports()
    print("[Seed] Successfully seeded CleanTamil Nadu AI with initial reports and hotspots.")

if __name__ == "__main__":
    seed_database(force_reseed=True)
