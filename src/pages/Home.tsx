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
import { toast } from "sonner";
import { useMemo } from 'react'
import { useTripsBudget } from '@/hooks/useTripsBudget'

// TIPOS do backend (exemplo; ajuste se jÃ¡ tiver types prontos)
type ApiTrip = {
  id: string;
  name: string;
  destination?: string | null;
  image_url?: string | null;
  start_date: string;     // ex: "2025-02-10"
  end_date: string;       // ex: "2025-02-20"
  total_budget?: number | null;
};

// --- NOVO: tipo do hook (mesma estrutura, mas id number) ------------------ //
type HookTrip = Omit<ApiTrip, "id"> & { id: number };

// --- NOVO: normalizador do retorno do hook para ApiTrip ------------------- //
function toApiTripFromHook(t: HookTrip): ApiTrip {
  return {
    ...t,
    id: String(t.id),
  };
}

// TIPOS esperados pelo TripCard
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
    categories: [],
  };
}

export default function Home() {
  const { trips, loading, updateTrip, deleteTrip, refetch } = useTrips();
  const navigate = useNavigate();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  // normaliza a lista vinda do hook (id number -> string)
  const apiTrips: ApiTrip[] = (trips as unknown as HookTrip[]).map(toApiTripFromHook);
  const tripIds = useMemo(() => (trips || []).map((t: any) => Number(t.id)).filter((n: number) => Number.isFinite(n)), [trips])
  const budgets = useTripsBudget(tripIds)

  // Ouvir pedidos de refresh vindos do overlay (TripDetails)
  // para atualizar os cards do dashboard e sinalizar conclusÃ£o.
  // NÃ£o cria dependÃªncias para evitar re-registro em cada render.
  if (typeof window !== 'undefined' && !(window as any).__budgetRefreshListener) {
    (window as any).__budgetRefreshListener = true
    window.addEventListener('dashboard:refresh', async () => {
      try {
        await budgets.refetch()
      } finally {
        window.dispatchEvent(new CustomEvent('dashboard:refresh:done'))
      }
    })
  }

  // Ouve eventos de refresh de trips (ediÃ§Ã£o/criaÃ§Ã£o)
  if (typeof window !== 'undefined' && !(window as any).__tripsRefreshListener) {
    (window as any).__tripsRefreshListener = true
    window.addEventListener('trips:refresh', async () => {
      try {
        await (refetch?.() ?? Promise.resolve())
      } catch {
        /* ignore */
      }
    })
  }

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
        ) : apiTrips.length === 0 ? (
          <p className="text-gray-500">Nenhuma viagem cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {apiTrips
              .map(mapToTripCard)
              .filter((trip) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;

                const byText =
                  trip.name.toLowerCase().includes(q) ||
                  trip.destination.toLowerCase().includes(q);

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

                const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(trip.budget)
                  .toLowerCase();
                const digitsQ = q.replace(/\D/g, '');
                const budgetDigits = String(Math.round(trip.budget)).toLowerCase();
                const byBudget = currency.includes(q) || (!!digitsQ && budgetDigits.includes(digitsQ));

                return byText || byDate || byBudget;
              })
              .map((trip) => {
                const cat = budgets.byTrip[Number(trip.id)]
                const withCats = cat ? { ...trip, categories: cat.map((c) => ({ id: String(c.id), name: c.name, icon: c.icon, planned: c.planned, spent: c.spent })) } : trip
                return (
                <TripCard
                  key={trip.id}
                  trip={withCats}
                  onUpdateTrip={async (frontTrip) => {
                    try {
                      await updateTrip(Number(frontTrip.id), {
                        name: frontTrip.name,
                        start_date: frontTrip.startDate,
                        end_date: frontTrip.endDate,
                        total_budget: frontTrip.budget,
                        // currency_code: 'BRL', // inclua se quiser permitir troca de moeda
                      } as any);
                      toast.success("Viagem atualizada");
                    } catch (e) {
                      console.error(e);
                      toast.error("Falha ao atualizar viagem");
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      await deleteTrip(Number(id));
                      toast.success("Viagem excluÃ­da");
                      setSelectedTripId(null);
                    } catch (e) {
                      console.error(e);
                      toast.error("Falha ao excluir viagem");
                    }
                  }}
                  onOpenDetails={(id) => setSelectedTripId(id)}
                />
                )
              })}
          </div>
        )}
      </section>

      {/* Overlay Trip Details */}
      {selectedTripId && (() => {
        const api = apiTrips.find(t => t.id === selectedTripId);
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
                onDelete={async (id) => {
                  try {
                    await deleteTrip(Number(id));
                    toast.success("Viagem excluÃ­da");
                    setSelectedTripId(null);
                  } catch (e) {
                    console.error(e);
                    toast.error("Falha ao excluir viagem");
                  }
                }}
                onUpdateTrip={async (id, payload) => {
                  try {
                    await updateTrip(Number(id), payload as any)
                  } catch (e) {
                    console.error(e)
                    throw e
                  }
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
            <NewTripForm onCancel={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
