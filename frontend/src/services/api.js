/**
 * API service layer — all fetch calls to the backend go through here.
 * The Vite dev proxy forwards /api/* to http://localhost:8000.
 */

const BASE = ''  // Empty: proxy handles it in dev; set to http://localhost:8000 for standalone

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      detail = err?.detail || JSON.stringify(err)
    } catch (_) {}
    throw new Error(detail)
  }
  return res.json()
}

export const api = {
  getHealth: () => request('/api/health'),

  getModules: () => request('/api/modules'),

  getMentalHealthInfo: () => request('/api/mental-health/info'),

  submitQuestionnaire: (answers, consented) =>
    request('/api/mental-health/sessions', {
      method: 'POST',
      body: JSON.stringify({ answers, consented }),
    }),
}
