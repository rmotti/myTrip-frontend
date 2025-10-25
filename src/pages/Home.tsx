// src/pages/Home.tsx
import { useTrips } from "../hooks/useTrips";
import { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { TripCard } from "../components/TripCard";
import TripDetails from "../components/TripDetails";
import NewTripForm from "../components/NewTripForm";
import AppHeader from "../components/AppHeader";
import { Plus } from "lucide-react";

// TIPOS do backend (exemplo; ajuste se já tiver types prontos)
type ApiTrip = {
  id: string;
  name: string;
  destination?: string | null;
  image_url?: string | null;
  start_date: string;     // ex: "2025-02-10"
  end_date: string;       // ex: "2025-02-20"
  total_budget?: number | null;
  // se houver categorias/gastos no backend, adicione aqui
};

// TIPOS esperados pelo TripCard (ajuste o import do type se existir em outro lugar)
type TripCardType = {
  id: string;
  name: string;
  destination: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  budget: number;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    planned: number;
    spent: number;
  }>;
};

// Mapper: ApiTrip -> TripCardType
function mapToTripCard(t: ApiTrip): TripCardType {
  return {
    id: t.id,
    name: t.name,
    destination: t.destination ?? "Destino não informado",
    imageUrl:
      t.image_url ??
      "https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?q=80&w=1200",
    startDate: t.start_date,
    endDate: t.end_date,
    budget: t.total_budget ?? 0,
    // Se não houver categorias no backend ainda, passamos vazio.
    // Quando você tiver as categorias, popule aqui (planned/spent por categoria).
    categories: [],
  };
}

export default function Home() {
  const { trips, loading /*, updateTrip, deleteTrip*/ } = useTrips();
  const navigate = useNavigate();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <div className="p-6 bg-[#f0fbff] min-h-screen">
      <div className="-mx-6 -mt-6 mb-6">
        <AppHeader
          appName="MyTrip"
          title="Minhas Viagens"
          subtitle="Organize seus roteiros e gastos"
          primaryAction={{ label: "Nova Viagem", onClick: () => setIsCreateOpen(true), icon: <Plus className="w-4 h-4" /> }}
          userName={(getAuth().currentUser?.displayName || getAuth().currentUser?.email) ?? undefined}
          onSignOut={handleLogout}
          onSwitchAccount={async () => {
            try {
              await getAuth().signOut();
            } finally {
              navigate('/login');
            }
          }}
          onSearch={(q) => setSearch(q)}
          searchPlaceholder="Buscar por nome ou destino"
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-[#0b3b59] mb-3">
          Próximas Viagens
        </h2>

        {loading ? (
          <p className="text-gray-500">Carregando viagens...</p>
        ) : trips.length === 0 ? (
          <p className="text-gray-500">Nenhuma viagem cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trips
              .map((t: ApiTrip) => mapToTripCard(t))
              .filter((trip) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;

                // Nome e destino
                const byText =
                  trip.name.toLowerCase().includes(q) ||
                  trip.destination.toLowerCase().includes(q);

                // Datas (várias representações)
                const startRaw = trip.startDate.toLowerCase();
                const endRaw = trip.endDate.toLowerCase();
                const startBR = new Date(trip.startDate).toLocaleDateString('pt-BR');
                const endBR = new Date(trip.endDate).toLocaleDateString('pt-BR');
                const startLong = new Date(trip.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toLowerCase();
                const endLong = new Date(trip.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toLowerCase();
                const byDate =
                  startRaw.includes(q) ||
                  endRaw.includes(q) ||
                  startBR.includes(q) ||
                  endBR.includes(q) ||
                  startLong.includes(q) ||
                  endLong.includes(q);

                // Orçamento (numérico e moeda)
                const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(trip.budget)
                  .toLowerCase();
                const digitsQ = q.replace(/\D/g, '');
                const budgetDigits = String(Math.round(trip.budget)).toLowerCase();
                const byBudget = currency.includes(q) || (!!digitsQ && budgetDigits.includes(digitsQ));

                return byText || byDate || byBudget;
              })
              .map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onUpdateTrip={(updated) => {
                    console.log("Atualizar (implementar no hook):", updated);
                  }}
                  onDelete={(id) => {
                    console.log("Excluir (implementar no hook):", id);
                  }}
                  onOpenDetails={(id) => setSelectedTripId(id)}
                />
              ))}
          </div>
        )}
      </section>
      {/* Overlay Trip Details */}
      {selectedTripId && (() => {
        const api = trips.find((t: ApiTrip) => t.id === selectedTripId);
        if (!api) return null;
        const selected = mapToTripCard(api);
        return (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto"
            onClick={() => setSelectedTripId(null)}
          >
            <div className="my-8 w-full max-w-6xl px-4" onClick={(e) => e.stopPropagation()}>
              <TripDetails
                trip={selected}
                onUpdateTrip={(updated) => {
                  console.log("Atualizar (implementar no hook):", updated);
                }}
                onDelete={(id) => {
                  console.log("Excluir (implementar no hook):", id);
                  setSelectedTripId(null);
                }}
                onClose={() => setSelectedTripId(null)}
              />
            </div>
          </div>
        );
      })()}
      {/* Overlay Criar Viagem */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto"
          onClick={() => setIsCreateOpen(false)}
        >
          <div className="my-8 w-full max-w-4xl px-4" onClick={(e) => e.stopPropagation()}>
            <NewTripForm
              onCancel={() => setIsCreateOpen(false)}
              onCreate={(draft) => {
                console.log("Criar Viagem (implementar POST):", draft);
                setIsCreateOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
