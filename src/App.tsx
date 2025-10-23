import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import { auth } from '../firebaseConfig'
import { onAuthStateChanged, type User } from 'firebase/auth'

function Protected({ isAuthed, children }: PropsWithChildren<{ isAuthed: boolean }>) {
  return isAuthed ? <>{children}</> : <Navigate to="/login" replace />
}
function GuestOnly({ isAuthed, children }: PropsWithChildren<{ isAuthed: boolean }>) {
  return isAuthed ? <Navigate to="/" replace /> : <>{children}</>
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setChecking(false) })
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

  return (
    <Routes>
      {/* Home protegida (logado) */}
      <Route
        path="/"
        element={
          <Protected isAuthed={!!user}>
            {/* @ts-ignore */}
            <Home user={user!} />
          </Protected>
        }
      />
      {/* Login e Registro só para convidados */}
      <Route
        path="/login"
        element={
          <GuestOnly isAuthed={!!user}>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly isAuthed={!!user}>
            <Register />
          </GuestOnly>
        }
      />
      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}

