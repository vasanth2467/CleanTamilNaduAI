import React from 'react';

export function StatusDonutChart({ stats }) {
  const pending = stats?.pending_reports || 0;
  const assigned = stats?.assigned_reports || 0;
  const inProg = stats?.in_progress_reports || 0;
  const resolved = stats?.resolved_reports || 0;
  const total = pending + assigned + inProg + resolved;

  if (total === 0) {
    return <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>No data available</div>;
  }

  const data = [
    { label: 'Resolved', count: resolved, color: '#16a34a' },
    { label: 'Pending', count: pending, color: '#d97706' },
    { label: 'In Progress', count: inProg, color: '#7c3aed' },
    { label: 'Assigned', count: assigned, color: '#2563eb' },
  ];

  let cumulativeAngle = 0;
  const radius = 58;
  const center = 75;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: '150px', height: '150px' }}>
        <svg width="150" height="150" viewBox="0 0 150 150">
          {data.map((item, idx) => {
            const fraction = item.count / total;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle * circumference;
            cumulativeAngle += fraction;

            if (fraction === 0) return null;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${center} ${center})`}
              />
            );
          })}
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
            Reports
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: '140px' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-muted)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
              {item.label}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {item.count} ({Math.round((item.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DistrictBarChart({ reports }) {
  const counts = {};
  (reports || []).forEach((r) => {
    const d = r.district || 'Other';
    counts[d] = (counts[d] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...sorted.map((s) => s[1]), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {sorted.map(([district, count]) => {
        const pct = Math.round((count / max) * 100);
        return (
          <div key={district} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{district}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{count} reports</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WasteTypeBarChart({ reports }) {
  const counts = {};
  (reports || []).forEach((r) => {
    const w = (r.waste_type || 'other').replace('_', ' ');
    counts[w] = (counts[w] || 0) + 1;
  });

  const colors = {
    'plastic': '#0284c7',
    'overflowing bin': '#dc2626',
    'organic': '#16a34a',
    'mixed': '#ea580c',
    'hazardous': '#7c3aed',
    'construction': '#64748b'
  };

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...sorted.map((s) => s[1]), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {sorted.map(([wType, count]) => {
        const pct = Math.round((count / max) * 100);
        const col = colors[wType.toLowerCase()] || '#15803d';
        return (
          <div key={wType} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)' }}>{wType}</span>
              <span style={{ fontWeight: 700, color: col }}>{count}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: '4px' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
