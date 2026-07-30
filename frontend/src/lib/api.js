const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
  return res.json();
}

export async function fetchClaims(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') query.append('status', filters.status);
  if (filters.risk_level && filters.risk_level !== 'ALL') query.append('risk_level', filters.risk_level);
  if (filters.search) query.append('search', filters.search);

  const res = await fetch(`${API_BASE}/claims?${query.toString()}`, { cache: 'no-store' });
  return res.json();
}

export async function fetchClaimById(id) {
  const res = await fetch(`${API_BASE}/claims/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function uploadClaimDocument(file) {
  const formData = new FormData();
  formData.append('document', file);

  const res = await fetch(`${API_BASE}/claims/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function submitReviewDecision(id, decision, notes) {
  const res = await fetch(`${API_BASE}/claims/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, notes }),
  });
  return res.json();
}

export async function triggerReAnalysis(id) {
  const res = await fetch(`${API_BASE}/claims/${id}/analyze`, {
    method: 'POST',
  });
  return res.json();
}

export async function generatePdfReport(id) {
  const res = await fetch(`${API_BASE}/claims/${id}/report`, {
    method: 'POST',
  });
  return res.json();
}

export function getReportDownloadUrl(id) {
  return `${API_BASE}/claims/${id}/report/download`;
}

export async function fetchSavedBills() {
  const res = await fetch(`${API_BASE}/bills`, { cache: 'no-store' });
  return res.json();
}

export function getSavedBillDownloadUrl(filename) {
  return `${API_BASE}/bills/download/${filename}`;
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset-db`, { method: 'POST' });
  return res.json();
}
