// src/services/trips.ts
import { getAuth } from 'firebase/auth'

const API_URL: string = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function joinUrl(base: string, path: string) {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function toQuery(params?: Record<string, any>): string {
  if (!params) return ''
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    q.append(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

async function getAuthToken(): Promise<string> {
  const user = getAuth().currentUser
  if (!user) throw new Error('Usuário não autenticado')
  return user.getIdToken()
}

async function authFetch(path: string, init: RequestInit = {}) {
  const token = await getAuthToken()
  const headers = new Headers(init.headers || {})
  const hasBody = Boolean(init.body)
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(joinUrl(API_URL, path), { ...init, headers })

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const data = await res.clone().json()
      if (data?.detail) {
        msg =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)
      }
    } catch {
      try {
        const text = await res.text()
        if (text) msg = text
      } catch {
        /* ignore */
      }
    }
    throw new Error(msg)
  }
  return res
}

/** Tipos do backend (TripOut / TripCreate / TripUpdate) */
export type ApiTrip = {
  id: number
  user_id: number
  name: string
  destination?: string | null
  start_date: string // "YYYY-MM-DD"
  end_date: string   // "YYYY-MM-DD"
  currency_code: string
  total_budget: number
  // se houver mais campos no TripOut, acrescente aqui
}

export type TripCreate = {
  name: string
  destination: string
  start_date: string
  end_date: string
  currency_code: string
  total_budget: number
}

/** TripUpdate do seu router aceita parciais (PUT com campos opcionais) */
export type TripUpdate = Partial<{
  name: string
  destination: string
  start_date: string
  end_date: string
  currency_code: string
  total_budget: number
}>

/** Filtros do GET /trips */
export type ListTripsParams = {
  skip?: number            // default 0
  limit?: number           // default 50 (máx 200)
  start_from?: string      // "YYYY-MM-DD"
  end_until?: string       // "YYYY-MM-DD"
}

/* ---------------- Calls ---------------- */

export async function listTrips(params?: ListTripsParams, signal?: AbortSignal): Promise<ApiTrip[]> {
  const res = await authFetch(`/trips${toQuery(params)}`, { signal })
  return res.json()
}

export async function getTrip(tripId: number): Promise<ApiTrip> {
  const res = await authFetch(`/trips/${tripId}`)
  return res.json()
}

export async function createTrip(payload: TripCreate): Promise<ApiTrip> {
  const res = await authFetch('/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.json()
}

/** Usa PUT como no router (TripUpdate parcial) */
export async function updateTrip(tripId: number, payload: TripUpdate): Promise<ApiTrip> {
  const res = await authFetch(`/trips/${tripId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function deleteTrip(tripId: number): Promise<void> {
  await authFetch(`/trips/${tripId}`, { method: 'DELETE' }) // 204 No Content
}
