import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'

const API_URL: string = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export interface Trip {
  id: number
  name: string
  start_date: string
  end_date: string
  currency_code: string
  total_budget: number
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function fetchTrips() {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) return

        const token = await user.getIdToken()
        const res = await fetch(`${API_URL}/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Erro ao carregar viagens')
        const data = await res.json()
        if (active) setTrips(data)
      } catch (err) {
        console.error('Erro ao buscar viagens:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchTrips()
    return () => {
      active = false
    }
  }, [])

  return { trips, loading }
}

