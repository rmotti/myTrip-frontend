import { signOut, type User } from 'firebase/auth'
import { auth } from '../../firebaseConfig'

export default function Home({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">✈️</span>
            <h1 className="text-lg font-semibold text-slate-900">MyTrip</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-600">
              {user.email ?? user.displayName ?? 'Usuário'}
            </span>
            <button
              onClick={() => signOut(auth)}
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Seu Dashboard</h2>
          <p className="mt-1 text-slate-600">Resumo rápido das suas viagens</p>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-slate-500 text-sm">Viagens</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-3xl font-semibold text-slate-900">12</div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+2 este mês</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-slate-500 text-sm">Destinos</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-3xl font-semibold text-slate-900">8</div>
              <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded">3 favoritos</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-slate-500 text-sm">Gastos (mês)</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-3xl font-semibold text-slate-900">R$ 2.450</div>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">-5% vs. mês anterior</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-slate-500 text-sm">Dias viajando</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-3xl font-semibold text-slate-900">31</div>
              <span className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded">em 2025</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent trips */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 font-semibold">Viagens recentes</h3>
              <button className="text-sm text-sky-700 hover:text-sky-800">Ver todas</button>
            </div>
            <ul className="divide-y divide-slate-100">
              {[
                { title: 'São Paulo → Rio de Janeiro', date: '12–15 Mar', cost: 'R$ 780' },
                { title: 'Lisboa → Porto', date: '22–24 Fev', cost: '€ 210' },
                { title: 'Curitiba → Florianópolis', date: '02–04 Fev', cost: 'R$ 430' },
              ].map((t, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-500">{t.date}</div>
                  </div>
                  <div className="text-sm font-medium text-slate-800">{t.cost}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-slate-900 font-semibold mb-3">Ações rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Nova viagem</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Adicionar gasto</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Ver mapa</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Exportar</button>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
              Dica: conecte seu calendário para ver viagens futuras aqui.
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
