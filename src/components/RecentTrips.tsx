
export type Trip = { title: string; date: string; cost: string }

type RecentTripsProps = {
  trips?: Trip[]
  onViewAll?: () => void
}

const defaultTrips: Trip[] = [
  { title: 'São Paulo → Rio de Janeiro', date: '12–15 Mar', cost: 'R$ 780' },
  { title: 'Lisboa → Porto', date: '22–24 Fev', cost: '€ 210' },
  { title: 'Curitiba → Florianópolis', date: '02–04 Fev', cost: 'R$ 430' },
]

export default function RecentTrips({ trips = defaultTrips, onViewAll }: RecentTripsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-900 font-semibold">Viagens recentes</h3>
        <button onClick={onViewAll} className="text-sm text-sky-700 hover:text-sky-800">Ver todas</button>
      </div>
      <ul className="divide-y divide-slate-100">
        {trips.map((t, i) => (
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
  )
}

