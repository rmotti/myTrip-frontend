import { useState } from 'react'
import type { FormEvent } from 'react'
import { auth, googleProvider } from '../firebaseConfig'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'

type Mode = 'signin' | 'signup'

const mapFirebaseError = (code?: string) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/missing-password':
      return 'Informe a senha.'
    case 'auth/weak-password':
      return 'Senha muito fraca (mín. 6 caracteres).'
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.'
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Credenciais inválidas.'
    case 'auth/wrong-password':
      return 'Senha incorreta.'
    case 'auth/popup-closed-by-user':
      return 'Popup fechado antes de concluir.'
    case 'auth/network-request-failed':
      return 'Falha de rede. Tente novamente.'
    default:
      return 'Ocorreu um erro. Tente novamente.'
  }
}

export default function Login() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const isValid = email.trim().length > 3 && password.length >= 6

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null); setInfo(null); setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
        setInfo('Conta criada com sucesso! Você já está autenticado.')
      }
    } catch (err) {
      const code = (err as any)?.code as string | undefined
      setError(mapFirebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null); setInfo(null); setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as any)?.code as string | undefined
      setError(mapFirebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email.trim()) return setError('Informe o e-mail para recuperar a senha.')
    setError(null); setInfo(null); setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setInfo('E-mail de recuperação enviado.')
    } catch (err) {
      const code = (err as any)?.code as string | undefined
      setError(mapFirebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            <h1 className="text-white text-2xl font-semibold tracking-tight">MyTrip</h1>
            <p className="text-white/80 text-sm mt-1">
              Planeje suas viagens com facilidade
            </p>
          </div>

          {/* Tabs */}
          <div className="px-2 mx-4 bg-white/10 rounded-xl flex p-1 gap-1">
            <button
              className={`w-1/2 rounded-lg py-2 text-sm font-medium transition
                ${mode === 'signin'
                  ? 'bg-white text-slate-900'
                  : 'text-white hover:bg-white/10'}`}
              onClick={() => setMode('signin')}
              aria-pressed={mode === 'signin'}
            >
              Entrar
            </button>
            <button
              className={`w-1/2 rounded-lg py-2 text-sm font-medium transition
                ${mode === 'signup'
                  ? 'bg-white text-slate-900'
                  : 'text-white hover:bg-white/10'}`}
              onClick={() => setMode('signup')}
              aria-pressed={mode === 'signup'}
            >
              Criar conta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-2 space-y-4">
            <div>
              <label className="text-white/90 text-sm mb-1 block">E-mail</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/90 focus:bg-white px-4 py-3 outline-none ring-2 ring-transparent focus:ring-white/60 transition text-slate-900 placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="text-white/90 text-sm mb-1 block">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'signin' ? 'Sua senha' : 'Mínimo 6 caracteres'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/90 focus:bg-white px-4 py-3 pr-12 outline-none ring-2 ring-transparent focus:ring-white/60 transition text-slate-900 placeholder:text-slate-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-lg text-slate-700 hover:bg-slate-100/70 transition"
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPass ? (
                    /* Eye-off */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6M9.88 4.26A10.94 10.94 0 0121 12a11 11 0 01-4.2 4.49M6.1 6.1A10.94 10.94 0 003 12a11 11 0 006.4 5.94" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-white/70">
                {mode === 'signin'
                  ? 'Use seu e-mail e senha para entrar.'
                  : 'Criaremos sua conta automaticamente.'}
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-white hover:text-white/90 underline underline-offset-2"
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !isValid}
              className={`w-full rounded-xl py-3 font-semibold transition
                ${loading || !isValid
                  ? 'bg-white/30 text-white/70 cursor-not-allowed'
                  : 'bg-white text-slate-900 hover:bg-slate-100'}`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 inline-block animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  {mode === 'signin' ? 'Entrando…' : 'Criando conta…'}
                </span>
              ) : (
                mode === 'signin' ? 'Entrar' : 'Criar conta'
              )}
            </button>

            <div className="relative py-1">
              <div className="border-t border-white/20" />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-transparent px-2 text-xs text-white/80">
                ou
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full rounded-xl py-3 font-semibold bg-white/90 hover:bg-white transition text-slate-900 inline-flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
                <path fill="#FFC107" d="M43.6 20.5H42v-.1H24v7.2h11.3C33.6 31 29.3 34 24 34c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.1-5.1C33.7 5 29.1 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C13.8 15.4 18.5 12 24 12c3 0 5.7 1.1 7.8 2.9l5.1-5.1C33.7 5 29.1 3 24 3 16.5 3 9.9 7.1 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 43c5.2 0 9.9-2 13.3-5.2l-6.1-5c-2 1.4-4.5 2.2-7.2 2.2-5.3 0-9.7-3.6-11.3-8.5l-6.1 4.7C9.2 38.6 16 43 24 43z"/>
                <path fill="#1976D2" d="M43.6 20.5H42v-.1H24v7.2h11.3c-1.3 3.8-5.1 6.4-9.3 6.4-5.3 0-9.7-3.6-11.3-8.5l-6.1 4.7C9.2 38.6 16 43 24 43c11.1 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"/>
              </svg>
              Entrar com Google
            </button>

            {error && (
              <p className="text-red-300 text-sm mt-2">{error}</p>
            )}
            {info && (
              <p className="text-emerald-200 text-sm mt-1">{info}</p>
            )}
          </form>
        </div>

        <p className="text-center text-white/80 text-xs mt-4">
          Ao continuar, você concorda com nossos <span className="underline">Termos</span> e <span className="underline">Privacidade</span>.
        </p>
      </div>
    </div>
  )
}
