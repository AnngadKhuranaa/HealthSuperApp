/**
 * Cardiovascular Screening API calls.
 * Follows the same pattern as the existing mental health API calls in api.js.
 */

const BASE = ''

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

export const cardioApi = {
  getInfo: () => request('/api/cardiovascular/info'),

  screen: (data) =>
    request('/api/cardiovascular/screen', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadWearable: (file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch('/api/cardiovascular/wearable/upload', {
      method: 'POST',
      body: form,
    }).then(async res => {
      if (!res.ok) {
        let detail = `HTTP ${res.status}`
        try {
          const err = await res.json()
          detail = err?.detail || JSON.stringify(err)
        } catch (_) {}
        throw new Error(detail)
      }
      return res.json()
    })
  },
}

/** Demo wearable data — clearly labelled as sample data */
export const DEMO_WEARABLE = {
  avg_hr: 68.4,
  min_hr: 52.0,
  max_hr: 118.0,
  avg_steps: 7842,
  avg_sleep_hours: 6.8,
  source: 'demo',
}
