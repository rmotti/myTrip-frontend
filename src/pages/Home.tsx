import { signOut, type User } from 'firebase/auth'
import { auth } from '../../firebaseConfig'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import RecentTrips from '../components/RecentTrips'
import QuickActions from '../components/QuickActions'

export default function Home({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar*/}
      <TopBar
        appName="MyTrip"
        userLabel={user.email ?? user.displayName ?? 'Usuário'}
        onSignOut={() => signOut(auth)}
      />

      {/* Dashboard */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-slate-600">Resumo rápido das suas viagens</p>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Viagens" value={12} badgeText="+2 este mês" badgeClassName="text-emerald-600 bg-emerald-50" />
          <StatCard title="Destinos" value={8} badgeText="3 favoritos" badgeClassName="text-sky-600 bg-sky-50" />
          <StatCard title="Gastos (mês)" value={"R$ 2.450"} badgeText="-5% vs. mês anterior" badgeClassName="text-amber-700 bg-amber-50" />
          <StatCard title="Dias viajando" value={31} badgeText="em 2025" />
        </section>

        {/* Content */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent trips */}
          <div className="lg:col-span-2">
            <RecentTrips />
          </div>

          {/* Quick actions */}
          <QuickActions />
        </section>
      </main>
    </div>
  )
}
