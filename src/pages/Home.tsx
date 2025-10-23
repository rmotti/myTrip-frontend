import { useTrips } from "../hooks/useTrips";


export default function Home() {
  const { trips, loading} = useTrips();

  return (
    <div className="p-6 bg-[#f0fbff] min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0b3b59]">
          MyTrip - Suas Viagens Organizadas
        </h1>
        <button className="bg-[#0b3b59] text-white rounded-lg px-4 py-2 hover:bg-[#115a84] transition">
          + Nova Viagem
        </button>
      </header>


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
                {/* <img
                  src={
                    trip.name.toLowerCase().includes("paris")
                      ? "/img/paris.jpg"
                      : trip.name.toLowerCase().includes("rio")
                      ? "/img/rio.jpg"
                      : "/img/placeholder.jpg"
                  }
                  alt={trip.name}
                  className="h-48 w-full object-cover"
                />*/}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#0b3b59]">
                    {trip.name}
                  </h3>
                  <p className="text-md text-gray-600">
                    📅 {trip.start_date} → {trip.end_date}
                  </p>
                  <p className="text-md text-gray-600">
                    Meta 💰 → {trip.total_budget?.toFixed(2)}
                  </p>
                  <button className="text-red-600 text-md mt-3 flex items-center gap-1 hover:underline">
                    🗑 Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
