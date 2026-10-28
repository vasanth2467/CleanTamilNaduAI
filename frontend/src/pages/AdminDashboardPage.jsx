import React, { useState } from 'react';
import {
  LayoutDashboard, Search, Filter, ArrowUpDown, UserCheck, CheckCircle2,
  AlertCircle, ShieldCheck, Clock, Trash2, MapPin, Eye, RefreshCw, FileText
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { StatusDonutChart, DistrictBarChart, WasteTypeBarChart } from '../components/Charts';

const DISTRICT_LIST = [
  'All',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
];

export default function AdminDashboardPage({
  reports,
  stats,
  onOpenBreakdown,
  onOpenStatusUpdate,
  onRefresh
}) {
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'newest', 'oldest'
  const [activeTab, setActiveTab] = useState('table'); // 'table', 'verification_gallery', 'analytics'

  // Filter logic
  let filtered = (reports || []).filter((r) => {
    if (districtFilter !== 'All' && r.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (priorityFilter !== 'All' && r.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchArea = (r.area || '').toLowerCase().includes(q);
      const matchOfficer = (r.assigned_officer || '').toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchArea && !matchOfficer) return false;
    }
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sortBy === 'priority') {
      return (b.priority_score || 0) - (a.priority_score || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return 0;
  });

  const resolvedReports = (reports || []).filter((r) => r.status === 'Resolved');

  return (
    <div className="section-wrapper" style={{ paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="hero-badge">
            <LayoutDashboard size={14} color="var(--primary)" />
            <span>Municipal Sanitary Command Center</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            Garbage Complaints & Cleanup Triage
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Greater Chennai Corporation (GCC) & Tamil Nadu Municipal Corporations Admin Dashboard.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={onRefresh}
            className="btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            id="admin-refresh-btn"
          >
            <RefreshCw size={14} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Metrics Counter Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="stat-box total">
          <span className="stat-box-title">Total Lodged</span>
          <span className="stat-box-num">{stats?.total_reports || reports?.length || 0}</span>
        </div>
        <div className="stat-box pending">
          <span className="stat-box-title">Pending Review</span>
          <span className="stat-box-num">{stats?.pending_reports || 0}</span>
        </div>
        <div className="stat-box" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <span className="stat-box-title" style={{ color: '#1e40af' }}>Assigned</span>
          <span className="stat-box-num" style={{ color: '#2563eb' }}>{stats?.assigned_reports || 0}</span>
        </div>
        <div className="stat-box" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
          <span className="stat-box-title" style={{ color: '#6d28d9' }}>In Progress</span>
          <span className="stat-box-num" style={{ color: '#7c3aed' }}>{stats?.in_progress_reports || 0}</span>
        </div>
        <div className="stat-box resolved">
          <span className="stat-box-title">Resolved Cleaned</span>
          <span className="stat-box-num">{stats?.resolved_reports || 0}</span>
        </div>
        <div className="stat-box hotspots">
          <span className="stat-box-title">High / Critical</span>
          <span className="stat-box-num">{stats?.high_priority_count || 0}</span>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('table')}
          style={{
            padding: '0.65rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'transparent',
            borderBottom: activeTab === 'table' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'table' ? 'var(--primary-dark)' : 'var(--text-muted)'
          }}
          id="tab-btn-table"
        >
          All Complaints Queue ({filtered.length})
        </button>

        <button
          onClick={() => setActiveTab('verification_gallery')}
          style={{
            padding: '0.65rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'transparent',
            borderBottom: activeTab === 'verification_gallery' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'verification_gallery' ? 'var(--primary-dark)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          id="tab-btn-verification"
        >
          <ShieldCheck size={16} color="var(--primary)" />
          Before & After Verification Gallery ({resolvedReports.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.65rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'transparent',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'analytics' ? 'var(--primary-dark)' : 'var(--text-muted)'
          }}
          id="tab-btn-analytics"
        >
          Civic Analytics & Charts
        </button>
      </div>

      {/* TAB 1: Main Complaints Table */}
      {activeTab === 'table' && (
        <div>
          {/* Filter and Search Controls */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search ID, title, area, officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="admin-search-input"
              />
            </div>

            {/* District */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              id="admin-filter-district"
            >
              {DISTRICT_LIST.map((d) => (
                <option key={d} value={d}>District: {d}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              id="admin-filter-status"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              id="admin-filter-priority"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              id="admin-sort-select"
            >
              <option value="priority">Sort: Highest Priority Score</option>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="civic-table" id="admin-reports-table">
              <thead>
                <tr>
                  <th>Report ID & Photo</th>
                  <th>Location & District</th>
                  <th>Waste Category</th>
                  <th>Priority Score</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-subtle)' }}>
                      No garbage complaints match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((rep) => {
                    const isResolved = rep.status === 'Resolved';
                    return (
                      <tr key={rep.id} id={`admin-row-${rep.id}`}>
                        {/* ID & Photo Thumbnail */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                              <img
                                src={isResolved && rep.resolved_image_url ? rep.resolved_image_url : rep.image_url}
                                alt="Report site"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem', color: 'var(--primary-dark)' }}>
                                {rep.id}
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {rep.title}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td>
                          <div style={{ fontWeight: 600 }}>{rep.area}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                            {rep.district} {rep.landmark ? `• ${rep.landmark}` : ''}
                          </div>
                        </td>

                        {/* Waste */}
                        <td>
                          <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.84rem' }}>
                            {rep.waste_type.replace('_', ' ')}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            {rep.estimated_volume.replace('_', ' ')}
                          </div>
                        </td>

                        {/* Priority */}
                        <td>
                          <PriorityBadge
                            priority={rep.priority}
                            score={rep.priority_score}
                            onClick={() => onOpenBreakdown && onOpenBreakdown(rep)}
                          />
                        </td>

                        {/* Status */}
                        <td>
                          <StatusBadge status={rep.status} />
                        </td>

                        {/* Assignee */}
                        <td>
                          {rep.assigned_officer ? (
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e40af' }}>
                                {rep.assigned_officer}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                                {rep.assigned_department}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              className="btn-outline btn-sm"
                              onClick={() => onOpenBreakdown && onOpenBreakdown(rep)}
                              title="Formula calculation breakdown"
                            >
                              Formula
                            </button>

                            <button
                              type="button"
                              className="btn-primary btn-sm"
                              onClick={() => onOpenStatusUpdate && onOpenStatusUpdate(rep)}
                              id={`admin-manage-btn-${rep.id}`}
                            >
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Before & After Verification Gallery */}
      {activeTab === 'verification_gallery' && (
        <div>
          <div className="disclaimer-banner info" style={{ marginBottom: '1.5rem' }}>
            <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0 }} />
            <div>
              <div className="disclaimer-title" style={{ color: '#1e40af' }}>
                Municipal Solid Waste Clearance Audit Trail
              </div>
              <div className="disclaimer-desc" style={{ color: '#1e3a8a' }}>
                All complaints flagged as "Resolved" are verified with photographic proof comparing the initial citizen report with the post-cleanup sanitized site.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
            {resolvedReports.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-subtle)' }}>
                No complaints have been resolved yet.
              </div>
            ) : (
              resolvedReports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-dark)' }}>
                        {rep.id}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0 0 0' }}>{rep.title}</h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>📍 {rep.area}, {rep.district}</div>
                    </div>
                    <StatusBadge status={rep.status} />
                  </div>

                  {/* Before and After Side-by-Side Images */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0f172a', position: 'relative' }}>
                    <div style={{ position: 'relative', height: '180px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                      <img src={rep.image_url} alt="Before cleanup" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(220, 38, 38, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                        BEFORE
                      </div>
                    </div>

                    <div style={{ position: 'relative', height: '180px' }}>
                      <img
                        src={rep.resolved_image_url || rep.image_url}
                        alt="After cleanup"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(22, 163, 74, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                        AFTER (CLEANED)
                      </div>
                    </div>
                  </div>

                  {/* Notes & Assignee */}
                  <div style={{ padding: '1rem', background: '#f8fafc', fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      <strong>Resolution Notes:</strong> {rep.resolution_notes || 'Site cleared and sanitized by municipal squad.'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-subtle)', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                      <span>Verified Officer: <strong>{rep.assigned_officer || 'Ward Officer'}</strong></span>
                      <span>Resolved: {rep.resolved_at ? new Date(rep.resolved_at).toLocaleDateString('en-IN') : 'Recently'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Analytics & Visual Charts */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Status Distribution</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '1.25rem' }}>Complaints breakdown by current workflow state.</p>
            <StatusDonutChart stats={stats} />
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Tamil Nadu District Breakdown</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '1.25rem' }}>Volume of reported street dumping by city.</p>
            <DistrictBarChart reports={reports} />
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Waste Type Classification</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '1.25rem' }}>Breakdown of reported waste categories.</p>
            <WasteTypeBarChart reports={reports} />
          </div>
        </div>
      )}
    </div>
  );
}
