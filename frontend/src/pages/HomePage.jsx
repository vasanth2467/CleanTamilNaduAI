import React from 'react';
import {
  Sparkles, PlusCircle, MapPin, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, ShieldCheck, Flame, Trash2, Layers, Cpu
} from 'lucide-react';
import ReportCard from '../components/ReportCard';
import { StatusDonutChart, DistrictBarChart } from '../components/Charts';

export default function HomePage({
  stats,
  reports,
  hotspots,
  setActivePage,
  onOpenBreakdown,
  onOpenStatusUpdate,
  onViewOnMap
}) {
  const pendingCount = stats?.pending_reports || 0;
  const resolvedCount = stats?.resolved_reports || 0;
  const hotspotCount = stats?.active_hotspots || (hotspots ? hotspots.length : 0);
  const totalCount = stats?.total_reports || (reports ? reports.length : 0);

  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-text-col">
            <div className="hero-badge">
              <Sparkles size={14} color="var(--primary)" />
              <span>Smart Civic Sanitation AI • Swachh Tamil Nadu</span>
            </div>
            <h1 className="hero-title">
              Intelligent Garbage Detection & <span>Hotspot Management</span>
            </h1>
            <p className="hero-desc">
              Empowering citizens across Chennai, Coimbatore, Madurai, and all 38 districts of Tamil Nadu
              to report street refuse, detect illegal dumps, and enable municipal squads to resolve chronic hotspots.
            </p>
            <div className="hero-actions">
              <button
                id="hero-report-btn"
                className="btn-primary"
                onClick={() => setActivePage('report')}
              >
                <PlusCircle size={18} />
                Report Garbage Now
              </button>
              <button
                id="hero-map-btn"
                className="btn-outline"
                onClick={() => setActivePage('map')}
              >
                <MapPin size={18} />
                Explore Hotspot Map
              </button>
              <button
                id="hero-admin-btn"
                className="btn-outline"
                onClick={() => setActivePage('admin')}
              >
                Admin Triage
              </button>
            </div>
          </div>

          {/* Real-time Civic Metrics Panel */}
          <div className="hero-stats-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Civic Triage Health</span>
              </div>
              <span style={{ fontSize: '0.78rem', background: 'var(--primary-bg)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                {resolutionRate}% Resolved
              </span>
            </div>

            <div className="hero-stats-grid">
              {/* Stat 1: Total */}
              <div className="stat-box total">
                <div className="stat-box-header">
                  <span className="stat-box-title">Total Lodged</span>
                  <Trash2 size={16} color="var(--primary)" />
                </div>
                <div className="stat-box-num">{totalCount}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  Across {stats?.districts_covered || 6} districts
                </span>
              </div>

              {/* Stat 2: Pending */}
              <div className="stat-box pending">
                <div className="stat-box-header">
                  <span className="stat-box-title">Pending Action</span>
                  <Clock size={16} color="var(--status-pending)" />
                </div>
                <div className="stat-box-num">{pendingCount}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  Awaiting squad allocation
                </span>
              </div>

              {/* Stat 3: Hotspots */}
              <div className="stat-box hotspots">
                <div className="stat-box-header">
                  <span className="stat-box-title">Active Hotspots</span>
                  <Flame size={16} color="var(--pri-critical)" />
                </div>
                <div className="stat-box-num">{hotspotCount}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  Recurring dump zones
                </span>
              </div>

              {/* Stat 4: Resolved */}
              <div className="stat-box resolved">
                <div className="stat-box-header">
                  <span className="stat-box-title">Cleared Sites</span>
                  <CheckCircle2 size={16} color="var(--status-resolved)" />
                </div>
                <div className="stat-box-num">{resolvedCount}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  Verified before & after
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Analytics Bar */}
      <section className="section-wrapper" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Layers size={18} color="var(--primary)" />
              Complaint Lifecycle Status
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '1.25rem' }}>
              Real-time progression from citizen report to sanitary squad clearance.
            </p>
            <StatusDonutChart stats={stats} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <MapPin size={18} color="var(--accent-gold)" />
              District Distribution
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '1.25rem' }}>
              Civic waste complaint volume across Tamil Nadu urban corporations.
            </p>
            <DistrictBarChart reports={reports} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                <Cpu size={18} color="#7c3aed" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>AI Detection Workflow</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '1rem' }}>
                Citizen uploaded photos pass through automated visual inspection for plastic waste, overflow, and hazardous debris.
              </p>
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.8rem',
                color: '#92400e',
                lineHeight: 1.45
              }}>
                <strong>Prototype Notice:</strong> Currently operating with heuristic computer-vision bounding boxes and transparency labels. Real trained neural network weights can be mounted without modifying UI schemas.
              </div>
            </div>

            <button
              className="btn-primary btn-sm"
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              onClick={() => setActivePage('report')}
            >
              Test AI Photo Detection on a Report &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Recurring Hotspot Spotlight */}
      <section className="section-wrapper">
        <div className="section-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <Flame size={16} />
              Hotspot Spotlight
            </div>
            <h2 className="section-header-title">Chronic Waste Hotspots in Tamil Nadu</h2>
            <p className="section-header-sub">
              Locations where multiple citizens have lodged recurring dumping complaints.
            </p>
          </div>
          <button
            className="btn-outline btn-sm"
            onClick={() => setActivePage('map')}
          >
            Open Interactive Hotspot Map &rarr;
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {(hotspots || []).slice(0, 4).map((hs) => {
            const isCrit = hs.severity_level === 'Critical';
            return (
              <div
                key={hs.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderTop: `4px solid ${isCrit ? '#dc2626' : '#ea580c'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-subtle)' }}>
                    {hs.id}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: isCrit ? '#fee2e2' : '#ffedd5',
                    color: isCrit ? '#dc2626' : '#ea580c'
                  }}>
                    {hs.severity_level} Severity
                  </span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{hs.name}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem', flex: 1 }}>
                  {hs.description}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
                  <div>📍 <strong>{hs.area}</strong>, {hs.district}</div>
                  <div style={{ color: '#b91c1c', fontWeight: 700, marginTop: '2px' }}>
                    🚨 {hs.report_count} clustered citizen complaints
                  </div>
                  {hs.sensitive_zone && (
                    <div style={{ color: '#7c3aed', fontSize: '0.75rem', marginTop: '2px' }}>
                      ⚠️ Proximity: {hs.sensitive_zone}
                    </div>
                  )}
                </div>

                <button
                  className="btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setActivePage('map');
                    if (onViewOnMap) onViewOnMap(hs);
                  }}
                >
                  Locate Hotspot on Map
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Citizen Reports Section */}
      <section className="section-wrapper" style={{ paddingTop: '1rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-header-title">Recent Citizen Garbage Reports</h2>
            <p className="section-header-sub">
              Live updates received from residents and municipal monitors across Tamil Nadu.
            </p>
          </div>
          <button
            className="btn-primary btn-sm"
            onClick={() => setActivePage('report')}
          >
            <PlusCircle size={15} />
            File a Report
          </button>
        </div>

        <div className="cards-grid">
          {(reports || []).slice(0, 6).map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onOpenBreakdown={onOpenBreakdown}
              onOpenStatusUpdate={onOpenStatusUpdate}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
