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
    return <p style={{ padding: 24 }}>Carregando…</p>
  }

  if (!user) {
    return <Login />
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h2>Bem-vindo</h2>
      <p style={{ marginTop: 8 }}>
        Logado como: <strong>{user.email ?? user.displayName ?? 'Usuário'}</strong>
      </p>
      <button
        style={{ marginTop: 16, padding: 10, borderRadius: 8, cursor: 'pointer' }}
        onClick={() => signOut(auth)}
      >
        Sair
      </button>
    </div>
  )
}

export default App
