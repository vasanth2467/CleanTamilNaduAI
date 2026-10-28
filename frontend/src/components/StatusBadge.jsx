import React from 'react';
import { Clock, UserCheck, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const s = (status || 'Pending').toLowerCase().replace(' ', '-');
  
  let icon = <Clock size={12} />;
  if (s === 'assigned') icon = <UserCheck size={12} />;
  if (s === 'in-progress') icon = <PlayCircle size={12} />;
  if (s === 'resolved') icon = <CheckCircle2 size={12} />;
  if (s === 'rejected') icon = <XCircle size={12} />;

  return (
    <span className={`status-badge ${s}`} id={`status-badge-${s}`}>
      {icon}
      <span>{status || 'Pending'}</span>
    </span>
  );
}
