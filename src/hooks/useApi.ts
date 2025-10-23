// Centraliza URL da API e utilitário de fetch autenticado

const API_URL_RAW: string = import.meta.env.VITE_API_URL || ''
const API_URL: string = API_URL_RAW.replace(/\/$/, '')

type CallBackend = (path: string, token?: string, init?: RequestInit) => Promise<any>

export function useApi() {
  const callBackend: CallBackend = async (path, token, init) => {
    const url = `${API_URL}${path}`
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`${res.status} ${res.statusText}: ${errText}`)
    }

    return res.json()
  }

  return { API_URL, callBackend }
}

export type { CallBackend }

