// src/components/NewTripForm.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { Plane, Hotel, Utensils, Camera, Car, ShoppingBag, Plus } from 'lucide-react';

export type CategoryDraft = { id: string; name: string; icon: string; planned: number };

export type TripDraft = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  imageUrl?: string;
  categories: CategoryDraft[];
};

type NewTripFormProps = {
  onCreate?: (trip: TripDraft) => void; // compat
  onSubmit?: (trip: TripDraft) => void; // preferido
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
  initial?: TripDraft;
};

const PRESET_CATEGORIES: Array<{ key: string; label: string; icon: string }> = [
  { key: 'plane', label: 'Passagens', icon: 'plane' },
  { key: 'hotel', label: 'Hospedagem', icon: 'hotel' },
  { key: 'utensils', label: 'Alimentação', icon: 'utensils' },
  { key: 'camera', label: 'Passeios', icon: 'camera' },
  { key: 'car', label: 'Transporte', icon: 'car' },
  { key: 'shopping-bag', label: 'Compras', icon: 'shopping-bag' },
];

function PresetIcon({ name }: { name: string }) {
  const map: Record<string, JSX.Element> = {
    plane: <Plane className="w-4 h-4" />,
    hotel: <Hotel className="w-4 h-4" />,
    utensils: <Utensils className="w-4 h-4" />,
    camera: <Camera className="w-4 h-4" />,
    car: <Car className="w-4 h-4" />,
    'shopping-bag': <ShoppingBag className="w-4 h-4" />,
  };
  return map[name] ?? <ShoppingBag className="w-4 h-4" />;
}

export default function NewTripForm({ onCreate, onSubmit, onCancel, title, submitLabel, initial }: NewTripFormProps) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');

  const [categories, setCategories] = useState<CategoryDraft[]>([]);
  const [catName, setCatName] = useState('');
  const [catPlanned, setCatPlanned] = useState('');

  // Carregar dados iniciais quando fornecido (modo edição)
  if (initial && name === '' && destination === '' && startDate === '' && endDate === '' && budget === '' && categories.length === 0) {
    setName(initial.name);
    setDestination(initial.destination);
    setStartDate(initial.startDate);
    setEndDate(initial.endDate);
    setBudget(String(initial.budget ?? ''));
    setImageUrl(initial.imageUrl || '');
    setCategories(initial.categories || []);
  }

  const addPreset = (c: { key: string; label: string; icon: string }) => {
    if (categories.some((x) => x.name === c.label)) return;
    setCategories((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: c.label, icon: c.icon, planned: 0 },
    ]);
  };

  const addCategory = () => {
    if (!catName.trim()) return toast.error('Informe o nome da categoria');
    const planned = parseFloat(catPlanned || '0');
    if (isNaN(planned) || planned < 0) return toast.error('Valor planejado inválido');
    setCategories((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: catName.trim(), icon: 'shopping-bag', planned },
    ]);
    setCatName('');
    setCatPlanned('');
  };

  const removeCategory = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));

  const handleSubmit = () => {
    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      return toast.error('Preencha os campos obrigatórios');
    }
    const b = parseFloat(budget || '0');
    if (isNaN(b) || b <= 0) return toast.error('Defina um orçamento válido');
    const payload: TripDraft = {
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      budget: b,
      imageUrl: imageUrl.trim() || undefined,
      categories,
    };
    if (onSubmit) onSubmit(payload);
    else if (onCreate) onCreate(payload);
  };

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-lg p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">{title || 'Informações Básicas'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nome da Viagem *</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Ex: Férias em Paris"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Destino *</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Ex: Paris, França"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Data de Início *</label>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Data de Término *</label>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Orçamento Total (R$) *</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="0.00"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">URL da Imagem (opcional)</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <h3 className="text-base font-medium mb-3">Categorias de Gastos</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => addPreset(c)}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <PresetIcon name={c.icon} /> {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-2"
            placeholder="Nome da categoria"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
          />
          <input
            className="w-40 rounded-lg border px-3 py-2"
            placeholder="Valor planejado"
            type="number"
            step="0.01"
            value={catPlanned}
            onChange={(e) => setCatPlanned(e.target.value)}
          />
          <button
            onClick={addCategory}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 hover:bg-slate-800"
            title="Adicionar categoria"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {categories.length > 0 && (
          <div className="mt-3 space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 border px-3 py-2">
                <div className="text-sm text-gray-800">{c.name}</div>
                <div className="text-sm text-gray-600">{c.planned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <button className="text-red-600 hover:underline text-sm" onClick={() => removeCategory(c.id)}>remover</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
        >
          {submitLabel || 'Criar Viagem'}
        </button>
      </div>
    </div>
  );
}
