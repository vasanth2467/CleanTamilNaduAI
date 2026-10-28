const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch system health');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchReports(filters = {}) {
  const query = new URLSearchParams();
  if (filters.district && filters.district !== 'All') query.append('district', filters.district);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);
  if (filters.priority && filters.priority !== 'All') query.append('priority', filters.priority);
  if (filters.search) query.append('search', filters.search);
  if (filters.limit) query.append('limit', filters.limit);

  const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReportDetail(id) {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch report ${id}`);
  return res.json();
}

export async function submitCitizenReport(formData) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Report submission failed' }));
    throw new Error(err.detail || 'Report submission failed');
  }
  return res.json();
}

export async function analyzeAIPreview(formData) {
  const res = await fetch(`${API_BASE}/ai/analyze-preview`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'AI Preview analysis failed' }));
    throw new Error(err.detail || 'AI Preview analysis failed');
  }
  return res.json();
}

export async function updateReportStatus(id, formData) {
  const res = await fetch(`${API_BASE}/reports/${id}/status`, {
    method: 'PATCH',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Status update failed' }));
    throw new Error(err.detail || 'Status update failed');
  }
  return res.json();
}

export async function fetchHotspots() {
  const res = await fetch(`${API_BASE}/hotspots`);
  if (!res.ok) throw new Error('Failed to fetch hotspots');
  return res.json();
}

export async function fetchSensitiveZones() {
  const res = await fetch(`${API_BASE}/sensitive-zones`);
  if (!res.ok) throw new Error('Failed to fetch sensitive zones');
  return res.json();
}

export async function triggerReseed() {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reseed database');
  return res.json();
}
