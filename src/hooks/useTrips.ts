// src/hooks/useTrips.ts
import { useEffect, useState } from 'react'
import {
  listTrips,
  createTrip as apiCreateTrip,
  updateTrip as apiUpdateTrip,
  deleteTrip as apiDeleteTrip,
  type ApiTrip,
  type TripCreate,
  type TripUpdate,
} from '@/services/trips'

// o Trip local pode espelhar o ApiTrip do backend
export type Trip = ApiTrip

// Responsabilidade do hook:
// - controlar estado local (trips, loading, error)
// - orquestrar chamadas do service
// - refletir mudanças no estado (otimista)
// - expor helpers (create/update/delete/refetch)
export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listTrips()
      setTrips(data)
    } catch (err: any) {
      console.error('Erro ao buscar viagens:', err)
      setError(err?.message ?? 'Erro ao carregar viagens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ---- CRUD helpers ----
  async function createTrip(payload: TripCreate) {
    const created = await apiCreateTrip(payload)
    setTrips((prev) => [created, ...prev])
    return created
  }

  async function updateTrip(id: number, payload: TripUpdate) {
    const updated = await apiUpdateTrip(id, payload)
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    )
    return updated
  }

  async function deleteTrip(id: number) {
    // otimista: remove local antes da resposta
    const prev = trips
    setTrips((p) => p.filter((t) => t.id !== id))
    try {
      await apiDeleteTrip(id)
    } catch (err) {
      // rollback se der erro
      console.error('Erro ao excluir viagem:', err)
      setTrips(prev)
      throw err
    }
  }

  // expõe também refetch pra reuso em telas ou refresh manual
  return { trips, loading, error, refetch: load, createTrip, updateTrip, deleteTrip }
}
