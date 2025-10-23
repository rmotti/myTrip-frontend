import { useTrips } from "../hooks/useTrips";

export default function Home() {
  const { trips, loading } = useTrips();

  return (
    <div className="p-6 bg-[#f0fbff] min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0b3b59]">
          Planejador de Viagens
        </h1>
        <button className="bg-[#0b3b59] text-white rounded-lg px-4 py-2 hover:bg-[#115a84] transition">
          + Nova Viagem
        </button>
      </header>

      {/* Cards do topo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-gray-600 text-sm">Orçamento Total</h2>
          <p className="text-2xl font-semibold text-[#0b3b59]">R$ 23.000,00</p>
          <p className="text-xs text-gray-500">Planejado: R$ 23.000,00</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-gray-600 text-sm">Total Gasto</h2>
          <p className="text-2xl font-semibold text-[#0b3b59]">R$ 10.600,00</p>
          <p className="text-xs text-gray-500">46.1% do planejado</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-gray-600 text-sm">Viagens</h2>
          <p className="text-2xl font-semibold text-[#0b3b59]">
            {trips.length} próximas
          </p>
        </div>
      </div>

      {/* Lista de viagens dinâmicas */}
      <section>
        <h2 className="text-lg font-semibold text-[#0b3b59] mb-3">
          Próximas Viagens
        </h2>

        {loading ? (
          <p className="text-gray-500">Carregando viagens...</p>
        ) : trips.length === 0 ? (
          <p className="text-gray-500">Nenhuma viagem cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md"
              >
                <img
                  src={
                    trip.name.toLowerCase().includes("paris")
                      ? "/img/paris.jpg"
                      : trip.name.toLowerCase().includes("rio")
                      ? "/img/rio.jpg"
                      : "/img/placeholder.jpg"
                  }
                  alt={trip.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#0b3b59]">
                    {trip.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    📅 {trip.start_date} → {trip.end_date}
                  </p>
                  <p className="text-sm text-gray-600">
                    💰 {trip.currency_code} {trip.total_budget?.toFixed(2)}
                  </p>
                  <button className="text-red-600 text-sm mt-3 flex items-center gap-1 hover:underline">
                    🗑 Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gráficos (mock) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2 text-[#0b3b59]">
            Distribuição de Gastos
          </h3>
          <p className="text-gray-500 text-sm">Gráfico mockado por enquanto.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2 text-[#0b3b59]">
            Planejado vs. Realizado
          </h3>
          <p className="text-gray-500 text-sm">Gráfico mockado por enquanto.</p>
        </div>
      </section>
    </div>
  );
}
