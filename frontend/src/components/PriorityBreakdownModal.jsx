import React from 'react';
import { X, Calculator, AlertCircle, MapPin, Clock, Trash2, Layers } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function PriorityBreakdownModal({ report, onClose }) {
  if (!report) return null;

  const pb = report.priority_breakdown || {};
  const wasteScore = pb.waste_severity_score || 50;
  const clusterScore = pb.hotspot_cluster_score || 20;
  const sensitiveScore = pb.sensitive_zone_score || 25;
  const agingScore = pb.aging_score || 15;
  const finalScore = report.priority_score || pb.final_score || 50;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '0.45rem', borderRadius: '8px' }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3>Priority Score Calculation Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Report ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{report.id}</span>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Prototype Rule Notice Banner */}
          <div className="disclaimer-banner" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div className="disclaimer-title">Initial Prototype Rule Notice (TN-Civic-Formula v1.0)</div>
              <div className="disclaimer-desc">
                This priority rating is computed using a prototype weighted heuristic for transparent municipal triage.
                It is strictly marked as a prototype rule and can be recalibrated according to ward sanitation policies.
              </div>
            </div>
          </div>

          {/* Top Score Banner */}
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Composite Priority Rating
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1 }}>
                  {Math.round(finalScore)}
                </span>
                <span style={{ color: 'var(--text-subtle)', fontSize: '1rem', fontWeight: 600 }}>/ 100</span>
              </div>
            </div>
            <div>
              <PriorityBadge priority={report.priority} score={finalScore} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem', textAlign: 'right' }}>
                Classification: {report.priority} Priority
              </div>
            </div>
          </div>

          {/* Component Factors */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            Weighted Factor Breakdown
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Factor 1: Waste Severity */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={15} color="var(--primary)" />
                  Waste Severity & Volume
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Weight: 35% | Score: {wasteScore}/100
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Type: <strong>{report.waste_type}</strong> | Volume: <strong>{report.estimated_volume}</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${wasteScore}%`, height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>

            {/* Factor 2: Hotspot Cluster Density */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={15} color="#2563eb" />
                  Hotspot & Cluster Proximity (600m radius)
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1d4ed8' }}>
                  Weight: 25% | Score: {clusterScore}/100
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Evaluates nearby active civic reports in {report.district} to spot chronic accumulation.
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${clusterScore}%`, height: '100%', background: '#2563eb' }} />
              </div>
            </div>

            {/* Factor 3: Sensitive Location Risk */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} color="#dc2626" />
                  Sensitive Zone Proximity Risk
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b91c1c' }}>
                  Weight: 20% | Score: {sensitiveScore}/100
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Nearest Zone: <strong>{pb.sensitive_zone_name || 'Hospital / Water body / School / Heritage site'}</strong>
                {pb.sensitive_zone_distance_m && ` (~${Math.round(pb.sensitive_zone_distance_m)}m away)`}
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${sensitiveScore}%`, height: '100%', background: '#dc2626' }} />
              </div>
            </div>

            {/* Factor 4: Aging / Unresolved Time */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={15} color="#ea580c" />
                  Unresolved Aging Escalation
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c2410c' }}>
                  Weight: 20% | Score: {agingScore}/100
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Hours Elapsed: <strong>{pb.aging_hours || 0} hrs</strong> (Automatic priority boost after 24h & 72h)
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${agingScore}%`, height: '100%', background: '#ea580c' }} />
              </div>
            </div>
          </div>

          {/* Formula summary */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem',
            background: 'var(--bg-page)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)'
          }}>
            Score = ({wasteScore} × 0.35) + ({clusterScore} × 0.25) + ({sensitiveScore} × 0.20) + ({agingScore} × 0.20) = {finalScore}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary btn-sm" onClick={onClose}>
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
