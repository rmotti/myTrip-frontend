import { useEffect, useState } from 'react'
import Login from './Login'
import { auth } from '../firebaseConfig'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-700">
          <span className="h-5 w-5 inline-block animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          Carregando...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">MyTrip</h1>
          <button
            onClick={() => signOut(auth)}
            className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-900">Bem-vindo</h2>
        <p className="mt-2 text-slate-700">
          Logado como: <span className="font-medium">{user.email ?? user.displayName ?? 'Usuário'}</span>
        </p>
      </main>
    </div>
  )
}

export default App

