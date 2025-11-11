// src/services/budget.ts
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
        msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
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

// Tipos de categorias de orçamento
export type BudgetCategory = {
  id: number
  name: string
  icon?: string | null
}

// Tipos de itens (por viagem)
export type TripItem = {
  id: number
  trip_id: number
  category_id: number
  title?: string | null
  planned_amount?: number | null
  actual_amount?: number | null
  date?: string | null // YYYY-MM-DD
}

export type TripItemCreate = Partial<{
  category_id: number
  title: string
  planned_amount: number
  actual_amount: number
  date: string | null // YYYY-MM-DD | null
}>

export type TripItemUpdate = Partial<{
  category_id: number
  title: string
  planned_amount: number
  actual_amount: number
  date: string | null
}>

export type ListItemsParams = {
  skip?: number
  limit?: number // 1-500
  date_from?: string // YYYY-MM-DD
  date_until?: string // YYYY-MM-DD
  category_id?: number
}

// Tipos de metas por categoria (por viagem)
export type CategoryTarget = {
  trip_id: number
  category_id: number
  planned_amount: number
}

/* -------- Categorias de Orçamento -------- */
export async function listBudgetCategories(signal?: AbortSignal): Promise<BudgetCategory[]> {
  const res = await authFetch('/budget-categories', { signal })
  return res.json()
}

export async function createBudgetCategory(payload: { name: string; icon?: string | null }): Promise<BudgetCategory> {
  const res = await authFetch('/budget-categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.json()
}

/* -------- Itens (por viagem) -------- */
export async function listTripItems(
  tripId: number,
  params?: ListItemsParams,
  signal?: AbortSignal
): Promise<TripItem[]> {
  const res = await authFetch(`/trips/${tripId}/items${toQuery(params)}` as string, { signal })
  return res.json()
}

export async function getTripItem(tripId: number, itemId: number): Promise<TripItem> {
  const res = await authFetch(`/trips/${tripId}/items/${itemId}`)
  return res.json()
}

function serializeTripItemPayload<T extends TripItemCreate | TripItemUpdate>(payload: T): any {
  const out: Record<string, any> = { ...payload }
  if (typeof out.planned_amount === 'number' && Number.isFinite(out.planned_amount)) {
    out.planned_amount = out.planned_amount.toFixed(2)
  }
  if (typeof out.actual_amount === 'number' && Number.isFinite(out.actual_amount)) {
    out.actual_amount = out.actual_amount.toFixed(2)
  }
  return out
}

export async function createTripItem(tripId: number, payload: TripItemCreate): Promise<TripItem> {
  const res = await authFetch(`/trips/${tripId}/items`, {
    method: 'POST',
    body: JSON.stringify(serializeTripItemPayload(payload)),
  })
  return res.json()
}

export async function updateTripItem(tripId: number, itemId: number, payload: TripItemUpdate): Promise<TripItem> {
  const res = await authFetch(`/trips/${tripId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(serializeTripItemPayload(payload)),
  })
  return res.json()
}

export async function deleteTripItem(tripId: number, itemId: number): Promise<void> {
  await authFetch(`/trips/${tripId}/items/${itemId}`, { method: 'DELETE' })
}

/* -------- Metas (targets) por categoria -------- */
export async function listTargets(tripId: number, signal?: AbortSignal): Promise<CategoryTarget[]> {
  const res = await authFetch(`/trips/${tripId}/targets`, { signal })
  return res.json()
}

export async function getTarget(tripId: number, categoryId: number): Promise<CategoryTarget> {
  const res = await authFetch(`/trips/${tripId}/targets/${categoryId}`)
  return res.json()
}

export async function upsertTarget(tripId: number, payload: { category_id: number; planned_amount: number }): Promise<CategoryTarget> {
  const res = await authFetch(`/trips/${tripId}/targets`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function deleteTarget(tripId: number, categoryId: number): Promise<void> {
  await authFetch(`/trips/${tripId}/targets/${categoryId}`, { method: 'DELETE' })
}
