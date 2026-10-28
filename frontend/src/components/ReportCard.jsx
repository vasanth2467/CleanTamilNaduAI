import React from 'react';
import { MapPin, Calendar, Trash2, ShieldAlert, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

export default function ReportCard({
  report,
  onOpenBreakdown,
  onOpenStatusUpdate,
  onViewOnMap
}) {
  const pScore = report.priority_score;
  const isResolved = report.status === 'Resolved';

  return (
    <div className="report-card" id={`report-card-${report.id}`}>
      {/* Media & Badge Header */}
      <div className="report-card-media">
        <img
          src={isResolved && report.resolved_image_url ? report.resolved_image_url : report.image_url}
          alt={report.title}
          className="report-card-img"
          loading="lazy"
        />

        <div className="report-card-badges">
          <StatusBadge status={report.status} />
          {report.is_hotspot_member ? (
            <span style={{
              background: '#dc2626',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              🚨 Hotspot
            </span>
          ) : null}
        </div>

        <div className="report-card-pri-badge">
          <PriorityBadge
            priority={report.priority}
            score={pScore}
            onClick={() => onOpenBreakdown && onOpenBreakdown(report)}
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="report-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span className="report-card-id">{report.id}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {new Date(report.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <h3 className="report-card-title">{report.title}</h3>
        <p className="report-card-desc">{report.description || 'No additional details provided.'}</p>

        {/* Metadata items */}
        <div className="report-meta-list">
          <div className="report-meta-item">
            <MapPin size={14} color="var(--primary)" />
            <span><strong>{report.area}</strong>, {report.district} {report.landmark ? `(${report.landmark})` : ''}</span>
          </div>
          <div className="report-meta-item">
            <Trash2 size={14} color="#64748b" />
            <span style={{ textTransform: 'capitalize' }}>
              Waste: <strong>{report.waste_type.replace('_', ' ')}</strong> ({report.estimated_volume.replace('_', ' ')})
            </span>
          </div>
          {report.assigned_officer && (
            <div className="report-meta-item" style={{ color: '#1d4ed8' }}>
              <CheckCircle2 size={14} color="#2563eb" />
              <span>Officer: <strong>{report.assigned_officer}</strong></span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="report-card-footer">
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => onOpenBreakdown && onOpenBreakdown(report)}
            title="Inspect priority calculation formula"
          >
            Score Details
          </button>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {onViewOnMap && (
              <button
                type="button"
                className="btn-outline btn-sm"
                onClick={() => onViewOnMap(report)}
                title="Locate on Leaflet map"
              >
                Map
              </button>
            )}
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => onOpenStatusUpdate && onOpenStatusUpdate(report)}
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
