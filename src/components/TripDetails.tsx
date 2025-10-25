// src/components/TripDetails.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import NewTripForm, { type TripDraft } from './NewTripForm';
import {
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Car,
  ShoppingBag,
  ArrowLeft,
  Pencil,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

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

type TripDetailsProps = {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onClose?: () => void;
};

const COLORS = ['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#06b6d4'];

export default function TripDetails({ trip, onUpdateTrip, onDelete, onClose }: TripDetailsProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [spentValue, setSpentValue] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const totalPlanned = trip.categories.reduce((sum, cat) => sum + cat.planned, 0);
  const totalSpent = trip.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const progress = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
  const remaining = totalPlanned - totalSpent;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleAddExpense = () => {
    if (!editingCategory || !spentValue) {
      toast.error('Preencha o valor do gasto');
      return;
    }
    const value = parseFloat(spentValue);
    if (isNaN(value) || value < 0) {
      toast.error('Digite um valor válido');
      return;
    }
    const updatedCategories = trip.categories.map((cat) =>
      cat.id === editingCategory.id ? { ...cat, spent: cat.spent + value } : cat
    );
    onUpdateTrip({ ...trip, categories: updatedCategories });
    setSpentValue('');
    setEditingCategory(null);
    setIsAddExpenseOpen(false);
    toast.success('Gasto adicionado com sucesso');
  };

  const handleRemoveCategory = (categoryId: string) => {
    const updatedCategories = trip.categories.filter((cat) => cat.id !== categoryId);
    onUpdateTrip({ ...trip, categories: updatedCategories });
    toast.success('Categoria removida');
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      plane: <Plane className="w-5 h-5" />,
      hotel: <Hotel className="w-5 h-5" />,
      utensils: <Utensils className="w-5 h-5" />,
      camera: <Camera className="w-5 h-5" />,
      car: <Car className="w-5 h-5" />,
      'shopping-bag': <ShoppingBag className="w-5 h-5" />,
    };
    return iconMap[iconName] || <ShoppingBag className="w-5 h-5" />;
  };

  const pieChartData = trip.categories
    .filter((cat) => cat.spent > 0)
    .map((cat) => ({ name: cat.name, value: cat.spent }));
  const barChartData = trip.categories.map((cat) => ({
    name: cat.name.length > 10 ? cat.name.substring(0, 10) + '...' : cat.name,
    Planejado: cat.planned,
    Realizado: cat.spent,
  }));

  return (
    <div className="rounded-xl bg-white shadow-lg">
      {/* Header sticky com título e ações */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b rounded-t-xl">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-start gap-3">
            {onClose && (
              <button onClick={onClose} className="mr-1 rounded-md px-2 py-1 hover:bg-gray-100 inline-flex items-center gap-1 text-sm text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            )}
            <div>
              <div className="text-xl sm:text-2xl font-semibold">{trip.name}</div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {trip.destination}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded-md border text-slate-800 border-slate-200 hover:bg-slate-50"
              onClick={() => setIsEditOpen(true)}
            >
              <span className="inline-flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Editar
              </span>
            </button>
            <button
            className="px-3 py-1.5 text-sm rounded-md border text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center"
            onClick={() => {
              if (window.confirm(`Excluir a viagem \"${trip.name}\"? Essa ação não pode ser desfeita.`)) {
                onDelete(trip.id);
              }
            }}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Excluir Viagem
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo em grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Esquerda: imagem + dados principais */}
          <div className="xl:col-span-2 space-y-4">
            <div className="h-56 md:h-72 overflow-hidden rounded-xl border">
              <ImageWithFallback src={trip.imageUrl} alt={trip.destination} className="w-full h-full object-cover" />
            </div>

            <div className="rounded-xl border p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Período</p>
                    <p className="text-sm">{formatDate(trip.startDate)} até {formatDate(trip.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Orçamento Total</p>
                    <p className="text-sm">{formatCurrency(trip.budget)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direita: Resumo Financeiro */}
          <div className="xl:col-span-1">
            <div className="rounded-xl border p-4 bg-white">
              <h3 className="text-base font-medium mb-3">Resumo Financeiro</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Planejado</span>
                <span>{formatCurrency(totalPlanned)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Realizado</span>
                <span>{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Restante</span>
                <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(remaining)}
                </span>
              </div>
              <ProgressBar value={progress} />
              <p className="text-xs text-center text-gray-600 mt-1">{progress.toFixed(1)}% do orçamento utilizado</p>
            </div>
          </div>
        </div>

        {/* Gráficos lado a lado */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-xl border p-4 bg-white">
            <p className="text-sm font-medium mb-3">Distribuição de Gastos</p>
            {pieChartData.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={90} fill="#8884d8" dataKey="value">
                      {pieChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">Nenhum gasto registrado ainda</div>
            )}
          </div>

          <div className="rounded-xl border p-4 bg-white">
            <p className="text-sm font-medium mb-3">Planejado vs. Realizado</p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="Planejado" fill="#3b82f6" />
                  <Bar dataKey="Realizado" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="mt-6 rounded-xl border p-4 bg-white">
          <p className="text-base font-medium mb-3">Categorias de Gastos</p>
          <div className="space-y-3">
            {trip.categories.map((category) => {
              const categoryProgress = category.planned > 0 ? (category.spent / category.planned) * 100 : 0;
              const isOverBudget = category.spent > category.planned;
              return (
                <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded">{getCategoryIcon(category.icon)}</div>
                      <div>
                        <h3 className="text-sm font-medium">{category.name}</h3>
                        <p className="text-xs text-gray-600">{formatCurrency(category.spent)} / {formatCurrency(category.planned)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 flex items-center"
                        onClick={() => { setEditingCategory(category); setIsAddExpenseOpen(true); }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Gasto
                      </button>
                      <button
                        className="px-2.5 py-1.5 text-sm rounded-md hover:bg-red-50 text-red-600 flex items-center"
                        onClick={() => { if (window.confirm(`Remover a categoria \"${category.name}\"?`)) { handleRemoveCategory(category.id); } }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ProgressBar value={categoryProgress} className={isOverBudget ? 'bg-red-200' : ''} />
                  {isOverBudget && (
                    <p className="text-[11px] text-red-600 mt-1">Acima do orçamento em {formatCurrency(category.spent - category.planned)}</p>
                  )}

                  {isAddExpenseOpen && editingCategory?.id === category.id && (
                    <div className="mt-3 p-3 rounded-md border bg-white">
                      <div className="text-sm font-medium mb-2">Adicionar Gasto - {category.name}</div>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`spent-${category.id}`} className="text-xs text-gray-600">Valor (R$)</label>
                        <input
                          id={`spent-${category.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={spentValue}
                          onChange={(e) => setSpentValue(e.target.value)}
                          className="w-32 rounded-md border px-2 py-1 text-sm bg-transparent"
                        />
                        <button className="px-3 py-1.5 text-sm rounded-md border" onClick={() => { setIsAddExpenseOpen(false); setEditingCategory(null); setSpentValue(''); }}>Cancelar</button>
                        <button className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600" onClick={handleAddExpense}>Adicionar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Overlay Editar Viagem */}
      {isEditOpen && (() => {
        const initial: TripDraft = {
          name: trip.name,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget,
          imageUrl: trip.imageUrl,
          categories: trip.categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, planned: c.planned })),
        };
        return (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto"
            onClick={() => setIsEditOpen(false)}
          >
            <div className="my-8 w-full max-w-4xl px-4" onClick={(e) => e.stopPropagation()}>
              <NewTripForm
                title="Editar Viagem"
                submitLabel="Salvar Alterações"
                initial={initial}
                onCancel={() => setIsEditOpen(false)}
                onSubmit={(draft) => {
                  const updated = {
                    ...trip,
                    name: draft.name,
                    destination: draft.destination,
                    startDate: draft.startDate,
                    endDate: draft.endDate,
                    budget: draft.budget,
                    imageUrl: draft.imageUrl || trip.imageUrl,
                    categories: draft.categories.map((d) => {
                      const existing = trip.categories.find((c) => c.id === d.id);
                      return {
                        id: existing?.id || d.id,
                        name: d.name,
                        icon: d.icon,
                        planned: d.planned,
                        spent: existing?.spent ?? 0,
                      };
                    }),
                  } as Trip;
                  onUpdateTrip(updated);
                  setIsEditOpen(false);
                  toast.success('Viagem atualizada');
                }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
