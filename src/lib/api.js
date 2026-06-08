// API client for MOVE backend (proxied via Vite to avoid CORS)
const API_BASE = import.meta.env.VITE_API_BASE || ''

const TOKEN_KEY = 'move_access_token'
const STUDIO_KEY = 'move_studio'
const USER_KEY = 'move_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function getStoredUser() {
  const v = localStorage.getItem(USER_KEY)
  return v ? JSON.parse(v) : null
}
export function getStoredStudio() {
  const v = localStorage.getItem(STUDIO_KEY)
  return v ? JSON.parse(v) : null
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(STUDIO_KEY)
}
export function setSession({ access_token, user, studio }) {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  if (studio) localStorage.setItem(STUDIO_KEY, JSON.stringify(studio))
}

async function request(path, { method = 'GET', body, params, auth = true } = {}) {
  let url = API_BASE + path
  if (params) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v)
    })
    const q = qs.toString()
    if (q) url += '?' + q
  }
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 401) {
    clearSession()
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      // soft redirect
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    let detail = ''
    const text = await res.text().catch(() => '')
    try {
      const j = JSON.parse(text)
      detail = j.detail || j.message || text
    } catch {
      detail = text
    }
    const err = new Error(detail || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

// ============ Auth ============
export const auth = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  me: () => request('/api/auth/me')
}

// ============ Studio ============
export const studioApi = {
  get: () => request('/api/studio'),
  update: (patch) => request('/api/studio', { method: 'PATCH', body: patch })
}

// ============ Clients ============
export const clientsApi = {
  list: (params) => request('/api/clients', { params }),
  get: (id) => request(`/api/clients/${id}`),
  create: (data) => request('/api/clients', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/clients/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => request(`/api/clients/${id}`, { method: 'DELETE' }),
  notes: (id) => request(`/api/clients/${id}/notes`),
  addNote: (id, body) =>
    request(`/api/clients/${id}/notes`, { method: 'POST', body: { body } }),
  subscriptions: (id) => request(`/api/clients/${id}/subscriptions`),
  bookings: (id) => request(`/api/clients/${id}/bookings`)
}

// ============ Trainers ============
export const trainersApi = {
  list: () => request('/api/trainers'),
  get: (id) => request(`/api/trainers/${id}`),
  create: (data) => request('/api/trainers', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/trainers/${id}`, { method: 'PATCH', body: data })
}

// ============ Machines / Suits ============
export const resourcesApi = {
  listMachines: () => request('/api/machines'),
  createMachine: (data) => request('/api/machines', { method: 'POST', body: data }),
  updateMachine: (id, data) => request(`/api/machines/${id}`, { method: 'PATCH', body: data }),
  listSuits: (size) => request('/api/suits', { params: { size } }),
  createSuit: (data) => request('/api/suits', { method: 'POST', body: data }),
  updateSuit: (id, data) => request(`/api/suits/${id}`, { method: 'PATCH', body: data })
}

// ============ Packages ============
export const packagesApi = {
  list: () => request('/api/packages'),
  create: (data) => request('/api/packages', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/packages/${id}`, { method: 'PATCH', body: data }),
  listSubscriptions: (params) => request('/api/subscriptions', { params }),
  createSubscription: (data) => request('/api/subscriptions', { method: 'POST', body: data }),
  freezeSubscription: (id) => request(`/api/subscriptions/${id}/freeze`, { method: 'POST' })
}

// ============ Bookings ============
export const bookingsApi = {
  list: (params) => request('/api/bookings', { params }),
  availability: (date) => request('/api/bookings/availability', { params: { date } }),
  create: (data) => request('/api/bookings', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/bookings/${id}`, { method: 'PATCH', body: data }),
  cancel: (id) => request(`/api/bookings/${id}`, { method: 'DELETE' })
}

// ============ Reports ============
export const reportsApi = {
  dashboard: () => request('/api/reports/dashboard'),
  overview: (range) => request('/api/reports/overview', { params: { range } })
}

// ============ Invoices ============
export const invoicesApi = {
  list: () => request('/api/invoices'),
  get: (id) => request(`/api/invoices/${id}`),
  create: (data) => request('/api/invoices', { method: 'POST', body: data })
}
