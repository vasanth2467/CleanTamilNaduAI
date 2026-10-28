import React from 'react';
import { AlertTriangle, AlertOctagon, Info, Flame } from 'lucide-react';

export default function PriorityBadge({ priority, score, onClick }) {
  const p = (priority || 'Medium').toLowerCase();

  let icon = <Info size={12} />;
  if (p === 'critical') icon = <Flame size={12} />;
  if (p === 'high') icon = <AlertOctagon size={12} />;
  if (p === 'medium') icon = <AlertTriangle size={12} />;

  return (
    <button
      type="button"
      className={`priority-badge ${p}`}
      onClick={onClick}
      title={onClick ? "Click to view transparent priority scoring breakdown" : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {icon}
      <span>{priority || 'Medium'}</span>
      {score !== undefined && score !== null && (
        <span style={{ opacity: 0.85, fontWeight: 800, fontSize: '0.72rem', marginLeft: '2px' }}>
          ({Math.round(score)})
        </span>
      )}
    </button>
  );
}
