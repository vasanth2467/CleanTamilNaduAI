import React, { useState } from 'react';
import {
  MapPin, Flame, Layers, Filter, Compass, AlertCircle,
  Eye, CheckCircle2, ChevronRight, ShieldCheck, Info
} from 'lucide-react';
import LeafletMap from '../components/LeafletMap';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

const DISTRICT_COORDS = {
  'All Tamil Nadu': { center: [11.1271, 78.6569], zoom: 7 },
  'Chennai': { center: [13.0827, 80.2707], zoom: 12 },
  'Coimbatore': { center: [11.0168, 76.9558], zoom: 13 },
  'Madurai': { center: [9.9252, 78.1198], zoom: 13 },
  'Tiruchirappalli': { center: [10.8286, 78.6946], zoom: 13 },
  'Salem': { center: [11.6643, 78.1460], zoom: 13 },
  'Tirunelveli': { center: [8.7289, 77.7081], zoom: 13 },
};

export default function HotspotMapPage({
  reports,
  hotspots,
  sensitiveZones,
  onOpenBreakdown,
  onOpenStatusUpdate
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('All Tamil Nadu');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showSensitive, setShowSensitive] = useState(true);

  const [activeReport, setActiveReport] = useState(null);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Map viewport state
  const [mapCenter, setMapCenter] = useState(DISTRICT_COORDS['All Tamil Nadu'].center);
  const [mapZoom, setMapZoom] = useState(DISTRICT_COORDS['All Tamil Nadu'].zoom);

  // Filter reports
  const filteredReports = (reports || []).filter((r) => {
    if (selectedDistrict !== 'All Tamil Nadu' && r.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (priorityFilter !== 'All' && r.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'Active' && (r.status === 'Resolved' || r.status === 'Rejected')) {
      return false;
    }
    if (statusFilter === 'Resolved' && r.status !== 'Resolved') {
      return false;
    }
    return true;
  });

  // Filter hotspots
  const filteredHotspots = (hotspots || []).filter((h) => {
    if (selectedDistrict !== 'All Tamil Nadu' && h.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleDistrictChange = (dName) => {
    setSelectedDistrict(dName);
    const target = DISTRICT_COORDS[dName] || DISTRICT_COORDS['All Tamil Nadu'];
    setMapCenter(target.center);
    setMapZoom(target.zoom);
  };

  const handleHotspotClick = (hs) => {
    setActiveHotspot(hs);
    setActiveReport(null);
    setMapCenter([hs.latitude, hs.longitude]);
    setMapZoom(15);
  };

  const handleReportMarkerSelect = (rep) => {
    setActiveReport(rep);
    setActiveHotspot(null);
    setMapCenter([rep.latitude, rep.longitude]);
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="hero-badge">
            <Flame size={14} color="#dc2626" />
            <span>Interactive Geospatial Hotspot Engine</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            Garbage Hotspot & Cluster Map
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Identify recurring illegal dumping grounds, analyze sensitive ecological proximity, and deploy municipal squads.
          </p>
        </div>

        {/* Sample Data Notice */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem 1rem',
          fontSize: '0.78rem',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          maxWidth: '380px'
        }}>
          <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>
            <strong>Data Disclosure:</strong> Live complaints are augmented with verified Tamil Nadu municipal baseline clusters for civic evaluation.
          </span>
        </div>
      </div>

      {/* Filter and Quick Jump Toolbar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* District Quick Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-subtle)' }}>
            Quick Jump:
          </span>
          {Object.keys(DISTRICT_COORDS).map((d) => (
            <button
              key={d}
              onClick={() => handleDistrictChange(d)}
              className="btn-sm"
              style={{
                borderRadius: '20px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: selectedDistrict === d ? 'var(--primary)' : 'var(--bg-subtle)',
                color: selectedDistrict === d ? '#ffffff' : 'var(--text-main)',
                border: '1px solid',
                borderColor: selectedDistrict === d ? 'var(--primary-dark)' : 'var(--border-color)',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Layer Toggles & Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span>Hotspots ({filteredHotspots.length})</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={showSensitive}
              onChange={(e) => setShowSensitive(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span>Sensitive Zones</span>
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.7rem', fontSize: '0.82rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Main Map & Hotspot Sidebar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 380px) 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left Sidebar: Hotspots & Selected Report Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Active Selection Details Card */}
          {activeReport ? (
            <div style={{
              background: '#ffffff',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-subtle)' }}>
                  {activeReport.id}
                </span>
                <button
                  onClick={() => setActiveReport(null)}
                  style={{ background: 'transparent', fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ height: '140px', borderRadius: '6px', overflow: 'hidden', background: '#000', marginBottom: '0.75rem' }}>
                <img
                  src={activeReport.image_url}
                  alt={activeReport.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {activeReport.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {activeReport.description || 'No description provided.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <StatusBadge status={activeReport.status} />
                <PriorityBadge
                  priority={activeReport.priority}
                  score={activeReport.priority_score}
                  onClick={() => onOpenBreakdown && onOpenBreakdown(activeReport)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onOpenBreakdown && onOpenBreakdown(activeReport)}
                >
                  Score Breakdown
                </button>
                <button
                  className="btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onOpenStatusUpdate && onOpenStatusUpdate(activeReport)}
                >
                  Triage / Assign
                </button>
              </div>
            </div>
          ) : activeHotspot ? (
            <div style={{
              background: '#ffffff',
              border: '2px solid #dc2626',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>
                  🚨 RECURRING HOTSPOT {activeHotspot.id}
                </span>
                <button
                  onClick={() => setActiveHotspot(null)}
                  style={{ background: 'transparent', fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}
                >
                  ✕ Close
                </button>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                {activeHotspot.name}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {activeHotspot.description}
              </p>

              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem', background: '#fef2f2', padding: '0.75rem', borderRadius: '6px' }}>
                <div>📍 <strong>{activeHotspot.area}</strong>, {activeHotspot.district}</div>
                <div style={{ color: '#b91c1c', fontWeight: 700 }}>
                  • {activeHotspot.report_count} Clustered Citizen Complaints
                </div>
                <div>• Cluster Radius: <strong>{activeHotspot.radius_meters}m</strong></div>
                {activeHotspot.sensitive_zone && (
                  <div style={{ color: '#7c3aed', fontSize: '0.78rem' }}>
                    ⚠️ Sensitive Zone: {activeHotspot.sensitive_zone}
                  </div>
                )}
              </div>

              <button
                className="btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', background: '#dc2626' }}
                onClick={() => {
                  // Filter reports list to this district and area
                  setSelectedDistrict(activeHotspot.district);
                }}
              >
                Inspect Clustered Complaints
              </button>
            </div>
          ) : null}

          {/* Hotspots List Column */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Flame size={18} color="#dc2626" />
                Detected Hotspots
              </span>
              <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                {filteredHotspots.length} Zones
              </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
              {filteredHotspots.map((hs) => {
                const isCrit = hs.severity_level === 'Critical';
                return (
                  <div
                    key={hs.id}
                    onClick={() => handleHotspotClick(hs)}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderLeft: `4px solid ${isCrit ? '#dc2626' : '#ea580c'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      background: activeHotspot?.id === hs.id ? '#fef2f2' : '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {hs.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isCrit ? '#dc2626' : '#ea580c' }}>
                        {hs.report_count} reports
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                      📍 {hs.area}, {hs.district}
                    </div>

                    {hs.sensitive_zone && (
                      <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: '0.25rem' }}>
                        🏛️ {hs.sensitive_zone}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Map Canvas */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <LeafletMap
            mode="viewer"
            reports={filteredReports}
            hotspots={filteredHotspots}
            sensitiveZones={sensitiveZones}
            onReportSelect={handleReportMarkerSelect}
            center={mapCenter}
            zoom={mapZoom}
            height="700px"
            showHotspots={showHotspots}
            showSensitive={showSensitive}
          />
        </div>
      </div>
    </div>
  );
}
