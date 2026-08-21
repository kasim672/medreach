/**
 * Shared backend API client. This file is IDENTICAL across the Bootstrap,
 * Tailwind, and Skeleton variants — enforcing "the CSS framework is the only
 * independent variable" (MedReach_Corrected_Plan.md §6).
 *
 * Security note: all requests use credentials:'include' so the backend's
 * httpOnly JWT cookie is sent; the token is never read by JS (XSS-token-theft
 * mitigation). No sensitive data is placed in localStorage.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  listHospitals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/hospitals${qs ? `?${qs}` : ''}`);
  },
  getHospital: (id) => request(`/api/hospitals/${id}`),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  updateHospitalStatus: (id, payload) =>
    request(`/api/hospitals/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
};
