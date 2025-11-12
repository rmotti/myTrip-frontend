// src/components/TripDetails.tsx
import { useState, type JSX, useMemo } from 'react';
import { toast } from 'sonner';
import EditTripForm from './EditTripForm';
import { useBudget } from '@/hooks/useBudget';
import { getErrorMessage } from '@/utils/getErrorMessage';

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

function SaveDashboardButton({ onClose }: { onClose?: () => void }) {
  const [saving, setSaving] = useState(false)
  const waitDone = () =>
    new Promise<void>((resolve) => {
      const handler = () => {
        window.removeEventListener('dashboard:refresh:done', handler)
        resolve()
      }
      window.addEventListener('dashboard:refresh:done', handler, { once: true })
      setTimeout(() => {
        try { window.removeEventListener('dashboard:refresh:done', handler) } catch {}
        resolve()
      }, 6000)
    })

  return (
    <button
      className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90 inline-flex items-center gap-2 disabled:opacity-50"
      disabled={saving}
      onClick={async () => {
        setSaving(true)
        try {
          window.dispatchEvent(new CustomEvent('dashboard:refresh'))
          onClose?.()
          await waitDone()
        } finally {
          setSaving(false)
        }
      }}
    >
      {saving && (
        <span className="inline-block h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
      )}
      Salvar
    </button>
  )
}

type Category = {
  id: number;
  name: string;
  icon: string;
  planned: number;
  spent: number;
  hasTarget: boolean;
};

type Trip = {
  id: string;
  name: string;
  destination: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  budget: number;
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
  onDelete: (tripId: string) => void;
  onClose?: () => void;
  onUpdateTrip?: (tripId: string, payload: any) => Promise<void> | void;
};

export default function TripDetails({ trip, onDelete, onClose , onUpdateTrip }: TripDetailsProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [spentValue, setSpentValue] = useState('');
  const [spentTitle, setSpentTitle] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<number | null>(null);
  const [targetValue, setTargetValue] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
  const [newCategoryPlanned, setNewCategoryPlanned] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [newCategoryIsOther, setNewCategoryIsOther] = useState(false);
  const [newCategoryOtherName, setNewCategoryOtherName] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [, setEditItemDate] = useState('');
  const [editItemAmount, setEditItemAmount] = useState('');

  const tripIdNum = useMemo(() => Number(trip.id), [trip.id])
  const budget = useBudget(tripIdNum)

  const displayCatName = (c: any): string => {
    const n = c?.name ?? c?.title ?? c?.label ?? c?.display_name ?? c?.slug ?? c?.code
    return n ? String(n) : `Categoria ${c?.id ?? ''}`
  }
  const otherSeed = useMemo(() => {
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    const keys = ['outro', 'outros', 'other', 'misc', 'diversos', 'variados', 'uncategorized']
    return budget.raw.categories.find((c) => keys.includes(norm(displayCatName(c))))
  }, [budget.raw.categories])

  const totalPlanned = budget.categories.reduce((sum, cat) => sum + cat.planned, 0);
  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const progress = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
  const remaining = totalPlanned - totalSpent;
  const visibleCategories = budget.categories.filter(c => c.hasTarget || c.spent > 0);


  // The original placeholder code was correct and doesn't need changes:
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleAddExpense = async () => {
    if (!editingCategory || !spentValue) {
      toast.error('Preencha o valor do gasto');
      return;
    }
    const value = parseFloat(spentValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Digite um valor vÃ¡lido');
      return;
    }
    try {
      await toast.promise(
        budget.addExpense(editingCategory.id, value, { title: (spentTitle || editingCategory.name) }),
        {
          loading: 'Adicionando gasto...',
          success: 'Gasto adicionado com sucesso',
          error: (e) => getErrorMessage(e, 'Falha ao adicionar gasto'),
        }
      )
      setSpentValue('');
      setSpentTitle('');
      setEditingCategory(null);
      setIsAddExpenseOpen(false);
    } catch {/* handled by toast */}
  };

  const handleRemoveCategory = async (categoryId: number) => {
    try {
      await toast.promise(
        budget.removeCategoryTarget(categoryId),
        {
          loading: 'Removendo categoria...',
          success: 'Categoria removida',
          error: (e) => getErrorMessage(e, 'Falha ao remover categoria'),
        }
      )
    } catch {/* handled by toast */}
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

  return (
    <div className="rounded-xl bg-white shadow-lg">
      {/* Header sticky com título e ações */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b rounded-t-xl">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-start gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="mr-1 rounded-md px-2 py-1 hover:bg-gray-100 inline-flex items-center gap-1 text-sm text-gray-700"
              >
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
            <SaveDashboardButton onClose={onClose} />
            <button
              className="px-3 py-1.5 text-sm rounded-md border text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center"
              onClick={() => {
                if (window.confirm(`Excluir a viagem "${trip.name}"? Essa ação não pode ser desfeita.`)) {
                  onDelete(trip.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Excluir Viagem
            </button>
          </div>
        </div>
      </div>

      {/* ConteÃºdo em grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Esquerda: imagem + dados principais */}
          <div className="xl:col-span-2 space-y-4">
            <div className="h-56 md:h-72 overflow-hidden rounded-xl border">
              <ImageWithFallback
                src={trip.imageUrl}
                alt={trip.destination}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="rounded-xl border p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Período</p>
                    <p className="text-sm">
                      {formatDate(trip.startDate)} até {formatDate(trip.endDate)}
                    </p>
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
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-1.5 text-sm rounded-md border text-slate-800 border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="w-4 h-4" /> Editar
                </button>
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
              <p className="text-xs text-center text-gray-600 mt-1">
                {progress.toFixed(1)}% do orçamento utilizado
              </p>
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="mt-6 rounded-xl border p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-medium">Categorias de Gastos</p>
            {visibleCategories.length > 0 && (
              <button
                className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90"
                onClick={() => setIsAddCategoryOpen(true)}
              >
                Adicionar categoria
              </button>
            )}
          </div>
          <div className="space-y-3">
            {budget.loading && (
              <div className="text-sm text-gray-500">Carregando categorias e gastos...</div>
            )}
            {!budget.loading && visibleCategories.length === 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Nenhuma categoria definida</div>
                <button
                  className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90"
                  onClick={() => setIsAddCategoryOpen(true)}
                >
                  Adicionar categoria
                </button>
              </div>
            )}
            {!budget.loading && visibleCategories.map((category) => {
              const categoryProgress =
                category.planned > 0 ? (category.spent / category.planned) * 100 : 0;
              const isOverBudget = category.spent > category.planned;
              return (
                <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{category.name}</h3>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(category.spent)} / {formatCurrency(category.planned)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                        onClick={() => setExpandedCategoryId((v) => (v === category.id ? null : category.id))}
                      >
                        {expandedCategoryId === category.id ? 'Ocultar Gastos' : 'Ver Gastos'}
                      </button>
                      <button
                        className={`px-2.5 py-1.5 text-sm rounded-md border border-gray-300 flex items-center ${category.hasTarget ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                        disabled={!category.hasTarget}
                        onClick={() => {
                          if (!category.hasTarget) return;
                          setEditingCategory(category);
                          setIsAddExpenseOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Gasto
                      </button>
                      <button
                        className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setEditingTargetId(category.id);
                          setTargetValue(category.planned ? String(category.planned) : '');
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        {category.planned > 0 ? 'Editar Meta' : 'Definir Meta'}
                      </button>
                      <button
                        className="px-2.5 py-1.5 text-sm rounded-md hover:bg-red-50 text-red-600 flex items-center"
                        onClick={() => {
                          if (window.confirm(`Remover a categoria "${category.name}"?`)) {
                            handleRemoveCategory(category.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ProgressBar
                    value={categoryProgress}
                    className={isOverBudget ? 'bg-red-200' : ''}
                  />
                  {isOverBudget && (
                    <p className="text-[11px] text-red-600 mt-1">
                      Acima do orçamento em {formatCurrency(category.spent - category.planned)}
                    </p>
                  )}

                  {isAddExpenseOpen && editingCategory?.id === category.id && (
                    <div className="mt-3 p-3 rounded-md border bg-white">
                      <div className="text-sm font-medium mb-2">
                        Adicionar Gasto - {category.name}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-xs text-gray-600" htmlFor={`title-${category.id}`}>Título</label>
                        <input
                          id={`title-${category.id}`}
                          type="text"
                          placeholder={category.name}
                          value={spentTitle}
                          onChange={(e) => setSpentTitle(e.target.value)}
                          className="flex-1 min-w-[180px] rounded-md border px-2 py-1 text-sm bg-transparent"
                        />
                        <label
                          htmlFor={`spent-${category.id}`}
                          className="text-xs text-gray-600"
                        >
                          Valor (R$)
                        </label>
                        <input
                          id={`spent-${category.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={spentValue}
                          onChange={(e) => setSpentValue(e.target.value)}
                          className="w-32 rounded-md border px-2 py-1 text-sm bg-transparent"
                        />
                        <button
                          className="px-3 py-1.5 text-sm rounded-md border"
                          onClick={() => {
                            setIsAddExpenseOpen(false);
                            setEditingCategory(null);
                            setSpentValue('');
                            setSpentTitle('');
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600"
                          onClick={handleAddExpense}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  )}

                  {expandedCategoryId === category.id && (
                    <div className="mt-3 rounded-md border bg-white">
                      <div className="p-2 text-xs text-gray-600">Gastos da categoria</div>
                      <ul className="divide-y">
                        {budget.raw.items
                          .filter((it) => it.category_id === category.id && it.title !== '__target__')
                          .map((it) => (
                            <li key={it.id} className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm truncate">{it.title || 'Gasto'}</div>
                                  <div className="text-xs text-gray-500">{it.date || '-'}</div>
                                </div>
                                <div className="text-sm font-medium">{formatCurrency(it.actual_amount ?? 0)}</div>
                                <div className="flex items-center gap-2">
                                  <button className="px-2 py-1 text-xs rounded-md border hover:bg-gray-50" onClick={() => {
                                    setEditingItemId(it.id);
                                    setEditItemTitle(it.title || '');
                                    setEditItemDate(it.date || new Date().toISOString().slice(0,10));
                                    setEditItemAmount(String(it.actual_amount ?? 0));
                                  }}>Editar</button>
                                  <button className="px-2 py-1 text-xs rounded-md text-red-600 hover:bg-red-50" onClick={async () => {
                                    try {
                                      await toast.promise(budget.removeExpense(it.id), {
                                        loading: 'Removendo gasto...',
                                        success: 'Gasto removido',
                                        error: (e) => getErrorMessage(e, 'Falha ao remover gasto'),
                                      })
                                    } catch {}
                                  }}>Excluir</button>
                                </div>
                              </div>

                              {editingItemId === it.id && (
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <input className="rounded-md border px-2 py-1 text-sm md:col-span-2" placeholder="Título" value={editItemTitle} onChange={(e) => setEditItemTitle(e.target.value)} />
                                  <input type="number" step="0.01" className="rounded-md border px-2 py-1 text-sm" placeholder="0.00" value={editItemAmount} onChange={(e) => setEditItemAmount(e.target.value)} />
                                  <div className="md:col-span-3 flex justify-end gap-2">
                                    <button className="px-3 py-1.5 text-sm rounded-md border" onClick={() => { setEditingItemId(null); }}>Cancelar</button>
                                    <button className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600" onClick={async () => {
                                      const amt = parseFloat(editItemAmount)
                                      if (isNaN(amt) || amt < 0) { toast.error('Digite um valor vÃ¡lido'); return }
                                      try {
                                        await toast.promise(budget.updateExpense(it.id, { title: editItemTitle || undefined, actual_amount: amt }), {
                                          loading: 'Salvando...',
                                          success: 'Gasto atualizado',
                                          error: (e) => getErrorMessage(e, 'Falha ao atualizar gasto'),
                                        })
                                        setEditingItemId(null)
                                      } catch {}
                                    }}>Salvar</button>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        {budget.raw.items.filter((it) => it.category_id === category.id && it.title !== '__target__').length === 0 && (
                          <li className="p-3 text-sm text-gray-500">Nenhum gasto ainda</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {editingTargetId === category.id && (
                    <div className="mt-3 p-3 rounded-md border bg-white">
                      <div className="text-sm font-medium mb-2">
                        {category.planned > 0 ? 'Editar Meta' : 'Definir Meta'} - {category.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`target-${category.id}`}
                          className="text-xs text-gray-600"
                        >
                          Valor planejado (R$)
                        </label>
                        <input
                          id={`target-${category.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          className="w-32 rounded-md border px-2 py-1 text-sm bg-transparent"
                        />
                        <button
                          className="px-3 py-1.5 text-sm rounded-md border"
                          onClick={() => {
                            setEditingTargetId(null);
                            setTargetValue('');
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm rounded-md text-white bg-gradient-to-r from-blue-600 to-teal-600"
                          onClick={async () => {
                            const value = parseFloat(targetValue)
                            if (isNaN(value) || value < 0) {
                              toast.error('Digite um valor vÃ¡lido')
                              return
                            }
                            try {
                              await toast.promise(
                                budget.setCategoryTarget(category.id, value),
                                {
                                  loading: 'Salvando meta...',
                                  success: 'Meta salva com sucesso',
                                  error: (e) => getErrorMessage(e, 'Falha ao salvar meta'),
                                }
                              )
                              setEditingTargetId(null)
                              setTargetValue('')
                            } catch { /* handled by toast */ }
                          }}
                        >
                          Salvar
                        </button>
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
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto"
          onClick={() => setIsEditOpen(false)}
        >
          <div className="my-8 w-full max-w-4xl px-4" onClick={(e) => e.stopPropagation()}>
            <EditTripForm
              tripId={trip.id}
              initial={{
                name: trip.name,
                destination: trip.destination,
                start_date: trip.startDate,
                end_date: trip.endDate,
                currency_code: 'BRL',
                total_budget: trip.budget,
                image_url: trip.imageUrl ?? '',
              }}
              onSubmit={(values) => {
                const payload = {
                  name: values.name,
                  destination: values.destination,
                  start_date: values.start_date,
                  end_date: values.end_date,
                  currency_code: values.currency_code.toUpperCase(),
                  total_budget: values.total_budget,
                }
                return Promise.resolve(
                  (typeof onUpdateTrip === 'function')
                    ? onUpdateTrip(String(trip.id), payload)
                    : undefined
                )
              }}
              onUpdated={() => {
                setIsEditOpen(false)
                toast.success('Viagem atualizada')
              }}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal: adicionar primeira categoria */}
      {isAddCategoryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto"
          onClick={() => setIsAddCategoryOpen(false)}
        >
          <div className="my-8 w-full max-w-xl px-4" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-xl bg-white border border-gray-200 shadow-lg p-4 sm:p-6">
              <h3 className="text-base font-semibold mb-2">Selecionar Categoria</h3>
              <p className="text-sm text-gray-600 mb-4">Escolha uma categoria predefinida e defina a meta planejada.</p>

              <div className="mb-2">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Buscar categoria..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
              <div className="max-h-64 overflow-auto rounded-md border">
                {budget.raw.categories
                  .filter(c => !budget.raw.targets.some(t => t.category_id === c.id))
                  .filter(c => !categorySearch || (displayCatName(c).toLowerCase().includes(categorySearch.toLowerCase())))
                  .map(c => (
                    <label key={c.id} className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="new-category"
                        checked={!newCategoryIsOther && newCategoryId === c.id}
                        onChange={() => { setNewCategoryId(c.id); setNewCategoryIsOther(false) }}
                      />
                      <span className="text-sm">{displayCatName(c)}</span>
                    </label>
                  ))}
                <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="new-category"
                    checked={newCategoryIsOther}
                    onChange={() => { setNewCategoryIsOther(true); setNewCategoryId(null) }}
                  />
                  <span className="text-sm">Outro</span>
                </label>
              </div>

              {newCategoryIsOther && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">Nome da nova categoria</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Ex: Presentes"
                    value={newCategoryOtherName}
                    onChange={(e) => setNewCategoryOtherName(e.target.value)}
                  />
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <label htmlFor="new-cat-planned" className="text-xs text-gray-600">Meta planejada (R$)</label>
                <input
                  id="new-cat-planned"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newCategoryPlanned}
                  onChange={(e) => setNewCategoryPlanned(e.target.value)}
                  className="w-40 rounded-md border px-2 py-1 text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setIsAddCategoryOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(!newCategoryIsOther && !newCategoryId) || !newCategoryPlanned || (newCategoryIsOther && !otherSeed)}
                  onClick={async () => {
                    const value = parseFloat(newCategoryPlanned)
                    if (isNaN(value) || value < 0) {
                      toast.error('Digite um valor vÃ¡lido')
                      return
                    }
                    try {
                      let categoryId = newCategoryId
                      if (newCategoryIsOther) categoryId = otherSeed?.id ?? null
                      if (!categoryId) return
                      await toast.promise(
                        budget.setCategoryTarget(categoryId, value),
                        {
                          loading: 'Salvando meta...',
                          success: 'Meta salva',
                          error: (e) => getErrorMessage(e, 'Falha ao salvar meta'),
                        }
                      )
                      setIsAddCategoryOpen(false)
                      setNewCategoryId(null)
                      setNewCategoryPlanned('')
                      setNewCategoryIsOther(false)
                      setNewCategoryOtherName('')
                    } catch {/* handled by toast */}
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
