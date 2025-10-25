// src/components/TripCard.tsx
import { useState } from 'react';

// Tipos locais (compatíveis com o que Home.tsx envia)
type Category = {
  id: string;
  name: string;
  icon: string;
  planned: number;
  spent: number;
};

type Trip = {
  id: string;
  name: string;
  destination: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  budget: number;
  categories: Category[];
};

import { MapPin, Calendar, DollarSign, Trash2 } from 'lucide-react';

// Removido shadcn/ui e Radix wrappers (não existem no projeto)




type TripCardProps = {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onOpenDetails?: (tripId: string) => void; // opcional
};



// Barra de progresso simples com Tailwind
function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full h-2.5 bg-gray-200 rounded ${className || ''}`}>
      <div
        className="h-full bg-blue-600 rounded"
        style={{ width: `${pct}%` }}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      />
    </div>
  );
}

// Imagem com fallback simples
function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const fallback =
    'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?q=80&w=1200&auto=format&fit=crop';
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={error ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

export function TripCard({ trip,onDelete, onOpenDetails }: TripCardProps) {


  const totalPlanned = trip.categories.reduce((sum, cat) => sum + cat.planned, 0);
  const totalSpent = trip.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const progress = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
  const remaining = totalPlanned - totalSpent;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

 



  // Neste card compacto não mostramos ícones de categorias nem gráficos

  const openDetails = () => onOpenDetails?.(trip.id);

  return (
    <div
      className="overflow-hidden shadow-lg hover:shadow-xl transition rounded-xl bg-white border border-gray-200 cursor-pointer"
      onClick={openDetails}
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : -1}
    >
      {/* Imagem topo */}
      <div className="h-48 overflow-hidden">
        <ImageWithFallback
          src={trip.imageUrl}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="pb-2 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl">{trip.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination}
            </div>
          </div>

          <div className="flex gap-2">
            {onOpenDetails && (
              <button
                className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90"
                onClick={(e) => { e.stopPropagation(); openDetails(); }}
              >
                Abrir
              </button>
            )}

            <button
              className="px-3 py-1.5 text-sm rounded-md border text-red-600 border-red-200 hover:bg-red-50 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Excluir a viagem "${trip.name}"? Essa ação não pode ser desfeita.`)) {
                  onDelete(trip.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Período + Orçamento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Período</p>
              <p className="text-sm">
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-300" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Orçamento</p>
              <p className="text-sm">{formatCurrency(trip.budget)}</p>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="rounded-lg border dark:border-gray-800 p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Planejado</span>
            <span>{formatCurrency(totalPlanned)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Realizado</span>
            <span>{formatCurrency(totalSpent)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Restante</span>
            <span className={remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {formatCurrency(remaining)}
            </span>
          </div>
          <ProgressBar value={progress} />
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
            {progress.toFixed(1)}% do orçamento utilizado
          </p>
        </div>
      </div>
    </div>
  );
}
