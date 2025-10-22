import { signOut, type User } from 'firebase/auth'
import { auth } from '../../firebaseConfig'

export default function Home({ user }: { user: User }) {
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
          Logado como:{' '}
          <span className="font-medium">{user.email ?? user.displayName ?? 'Usuário'}</span>
        </p>
      </main>
    </div>
  )
}

