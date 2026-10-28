import React, { useState } from 'react';
import { X, CheckCircle, Upload, AlertCircle, UserCheck, ShieldCheck } from 'lucide-react';
import { updateReportStatus } from '../api';

export default function StatusUpdateModal({ report, onClose, onUpdated }) {
  if (!report) return null;

  const [statusVal, setStatusVal] = useState(report.status || 'Pending');
  const [assignedOfficer, setAssignedOfficer] = useState(report.assigned_officer || '');
  const [assignedDepartment, setAssignedDepartment] = useState(report.assigned_department || 'Greater Chennai Corporation - Solid Waste Division');
  const [resolutionNotes, setResolutionNotes] = useState(report.resolution_notes || '');
  const [comment, setComment] = useState('');
  const [resolvedFile, setResolvedFile] = useState(null);
  const [resolvedPreview, setResolvedPreview] = useState(report.resolved_image_url || null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolvedFile(file);
      setResolvedPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      fd.append('status', statusVal);
      if (assignedOfficer) fd.append('assigned_officer', assignedOfficer);
      if (assignedDepartment) fd.append('assigned_department', assignedDepartment);
      if (resolutionNotes) fd.append('resolution_notes', resolutionNotes);
      if (comment) fd.append('comment', comment);
      fd.append('updated_by', 'Municipal Admin / Ward Sanitation Officer');
      if (resolvedFile) {
        fd.append('resolved_image', resolvedFile);
      }

      const updated = await updateReportStatus(report.id, fd);
      if (onUpdated) onUpdated(updated);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update report status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '0.45rem', borderRadius: '8px' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3>Update Cleanup Status & Assignment</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Report: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{report.id}</span> — {report.area}, {report.district}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {errorMsg && (
              <div className="disclaimer-banner" style={{ borderLeftColor: '#dc2626', background: '#fee2e2' }}>
                <AlertCircle size={18} color="#dc2626" />
                <span style={{ color: '#991b1b', fontSize: '0.85rem' }}>{errorMsg}</span>
              </div>
            )}

            {/* Before Photo & Report Context */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: '1rem',
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ height: '100px', borderRadius: '6px', overflow: 'hidden', background: '#000' }}>
                <img
                  src={report.image_url}
                  alt="Garbage report site"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: '0.84rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                  {report.title}
                </div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Waste Type: <strong>{report.waste_type}</strong> | Volume: <strong>{report.estimated_volume}</strong>
                </div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
                  Reported by: {report.citizen_name || 'Anonymous Citizen'} ({report.citizen_phone || 'No phone'})
                </div>
              </div>
            </div>

            <div className="form-grid">
              {/* Status Select */}
              <div className="form-group">
                <label className="form-label">Workflow Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  style={{ fontWeight: 600 }}
                  id="admin-status-select"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Assigned">Assigned to Sanitary Squad</option>
                  <option value="In Progress">In Progress (Cleanup Underway)</option>
                  <option value="Resolved">Resolved (Cleanup Verified)</option>
                  <option value="Rejected">Rejected (Out of Municipal Jurisdiction)</option>
                </select>
              </div>

              {/* Assigned Officer */}
              <div className="form-group">
                <label className="form-label">Assigned Ward Sanitary Officer</label>
                <input
                  type="text"
                  placeholder="e.g. K. Senthilkumar (Zone 9 AE)"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  id="admin-officer-input"
                />
              </div>

              {/* Department */}
              <div className="form-group full">
                <label className="form-label">Responsible Municipal Wing / Corporation</label>
                <input
                  type="text"
                  placeholder="e.g. Greater Chennai Corporation - Solid Waste Management"
                  value={assignedDepartment}
                  onChange={(e) => setAssignedDepartment(e.target.value)}
                />
              </div>

              {/* Resolution Notes */}
              <div className="form-group full">
                <label className="form-label">Action / Resolution Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 2.5 MT waste transported to dump yard. Bleaching powder sprayed."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>

              {/* Status Audit Comment */}
              <div className="form-group full">
                <label className="form-label">Audit Log Comment</label>
                <input
                  type="text"
                  placeholder="Optional log entry reason for municipal record"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>

            {/* Before-and-After Photo Verification Section */}
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              background: statusVal === 'Resolved' ? '#f0fdf4' : 'var(--bg-page)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <ShieldCheck size={18} color="var(--primary)" />
                  Before-and-After Cleanup Verification
                </span>
                {statusVal === 'Resolved' && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                    Photo Verification Recommended
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                {/* Before Photo */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
                    BEFORE (Citizen Report Photo)
                  </div>
                  <div style={{ height: '140px', borderRadius: '6px', overflow: 'hidden', background: '#000', border: '1px solid #cbd5e1' }}>
                    <img
                      src={report.image_url}
                      alt="Before cleanup"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>

                {/* After Photo Upload */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
                    AFTER (Sanitized Site Photo)
                  </div>
                  {resolvedPreview ? (
                    <div style={{ height: '140px', borderRadius: '6px', overflow: 'hidden', background: '#000', border: '2px solid var(--primary)', position: 'relative' }}>
                      <img
                        src={resolvedPreview}
                        alt="After cleanup"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <label
                        htmlFor="after-photo-input"
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Replace
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="after-photo-input"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '140px',
                        border: '2px dashed #94a3b8',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: '#ffffff',
                        textAlign: 'center',
                        padding: '0.5rem'
                      }}
                    >
                      <Upload size={22} color="#64748b" />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginTop: '0.35rem' }}>
                        Upload Cleared Site Photo
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        JPG, PNG, WebP
                      </span>
                    </label>
                  )}
                  <input
                    type="file"
                    id="after-photo-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline btn-sm" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm" disabled={submitting} id="admin-save-status-btn">
              {submitting ? 'Saving...' : 'Update Status & Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
