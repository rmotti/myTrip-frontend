import { useState } from 'react'
import { auth, googleProvider } from '../firebaseConfig'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null); setInfo(null); setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Falha ao entrar'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError(null); setInfo(null); setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password)
      setInfo('Conta criada com sucesso! Você já está autenticado.')
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Falha ao registrar'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null); setInfo(null); setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Falha no Google Sign-In'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email.trim()) return setError('Informe o e-mail para recuperar a senha')
    setError(null); setInfo(null); setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setInfo('E-mail de recuperação enviado.')
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Falha ao enviar recuperação'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '4rem auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2 style={{ marginBottom: 16 }}>Entrar</h2>

      <form onSubmit={handleSignIn} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />

        <button type="submit" disabled={loading} style={{ padding: 10, borderRadius: 8, cursor: 'pointer' }}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        <button onClick={handleRegister} disabled={loading} style={{ padding: 10, borderRadius: 8, cursor: 'pointer' }}>
          Criar conta
        </button>

        <button onClick={handleGoogle} disabled={loading} style={{ padding: 10, borderRadius: 8, cursor: 'pointer' }}>
          Entrar com Google
        </button>

        <button onClick={handleReset} disabled={loading} style={{ padding: 10, borderRadius: 8, cursor: 'pointer' }}>
          Esqueci minha senha
        </button>
      </div>

      {error && <p style={{ color: 'crimson', marginTop: 12, fontSize: 14 }}>{error}</p>}
      {info && <p style={{ color: 'seagreen', marginTop: 8, fontSize: 14 }}>{info}</p>}
    </div>
  )
}

export default Login
