// src/components/NewTripForm.tsx
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plane, Hotel, Utensils, Camera, Car, ShoppingBag, Plus } from 'lucide-react'
import type { JSX } from 'react'
import { createTrip } from '../services/trips'
import { getErrorMessage } from '../utils/getErrorMessage'


export type CategoryDraft = { id: string; name: string; icon: string; planned: number };

export const tripSchema = z
  .object({
    name: z.string().min(1, 'Informe o nome da viagem'),
    destination: z.string().min(1, 'Informe o destino'),
    start_date: z.string().min(1, 'Informe a data de início'),
    end_date: z.string().min(1, 'Informe a data de término'),
    currency_code: z
      .string()
      .min(3, 'Moeda deve ter 3 letras')
      .max(3, 'Moeda deve ter 3 letras'),
    total_budget: z
      .coerce
      .number({ invalid_type_error: 'Informe o orçamento' })
      .positive('O orçamento deve ser positivo'),
    image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return end >= start
    },
    {
      path: ['end_date'],
      message: 'A data de volta não pode ser anterior à de ida.',
    }
  )

export type FormValues = z.infer<typeof tripSchema>

type NewTripFormProps = {
  onCreated?: () => void
  onCancel: () => void
  title?: string
  submitLabel?: string
  initial?: Partial<FormValues>
  // compat: permite que um pai trate o submit; se fornecido, o formulário não chamará o serviço diretamente
  onSubmit?: (values: FormValues) => Promise<unknown> | unknown
}

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

export default function NewTripForm({ onCreated, onCancel, title, submitLabel, initial, onSubmit: onSubmitProp }: NewTripFormProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const form = useForm<FormValues>({
    resolver: zodResolver(tripSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      destination: '',
      start_date: today,
      end_date: today,
      currency_code: 'BRL',
      total_budget: 0,
      image_url: '',
      ...(initial || {}),
    },
  })
  const startDate = form.watch('start_date')

  // categorias opcionais (UI semelhante, mas fora da validação principal)
  const categories: CategoryDraft[] = []
  const addPreset = (_c: { key: string; label: string; icon: string }) => {}
  const addCategory = () => {}
  const removeCategory = (_id: string) => {}

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      destination: values.destination,
      start_date: values.start_date,
      end_date: values.end_date,
      currency_code: values.currency_code.toUpperCase(),
      total_budget: values.total_budget,
      image_url: values.image_url,
    }
    if (onSubmitProp) {
      // Delega para o pai, mas envolve com toast.promise para UX consistente
      await toast.promise(Promise.resolve(onSubmitProp(values)), {
        loading: 'Criando viagem...',
        success: 'Viagem criada!',
        error: (err) => getErrorMessage(err, 'Falha ao criar viagem'),
      })
    } else {
      await toast.promise(createTrip(payload as any), {
        loading: 'Criando viagem...',
        success: 'Viagem criada!',
        error: (err) => getErrorMessage(err, 'Falha ao criar viagem'),
      })
    }
    try { window.dispatchEvent(new CustomEvent('trips:refresh')) } catch {}
    onCreated?.()
  })


  return (
  <div className="rounded-xl bg-white border border-gray-200 shadow-lg p-4 sm:p-6">
    <h2 className="text-lg font-semibold mb-4">{title || 'Informações Básicas'}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Nome da Viagem *</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Ex: Férias em Paris"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Destino *</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Ex: Paris, França"
          {...form.register('destination')}
        />
        {form.formState.errors.destination && (
          <p className="text-sm text-red-500">{form.formState.errors.destination.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Data de Início *</label>
        <input
          type="date"
          className="w-full rounded-md border px-3 py-2"
          min={today}
          {...form.register('start_date')}
        />
        {form.formState.errors.start_date && (
          <p className="text-sm text-red-500">{form.formState.errors.start_date.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Data de Término *</label>
        <input
          type="date"
          className="w-full rounded-md border px-3 py-2"
          min={startDate || today}
          {...form.register('end_date')}
        />
        {form.formState.errors.end_date && (
          <p className="text-sm text-red-500">{form.formState.errors.end_date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Orçamento Total (R$) *</label>
        <input
          type="number"
          step="0.01"
          min={0}
          className="w-full rounded-md border px-3 py-2"
          placeholder="0.00"
          {...form.register('total_budget')}
        />
        {form.formState.errors.total_budget && (
          <p className="text-sm text-red-500">{form.formState.errors.total_budget.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">URL da Imagem (opcional)</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="https://..."
          {...form.register('image_url')}
        />
        {form.formState.errors.image_url && (
          <p className="text-sm text-red-500">{form.formState.errors.image_url.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Moeda (3 letras)</label>
        <input
          className="w-full rounded-md border px-3 py-2 uppercase"
          maxLength={3}
          {...form.register('currency_code')}
        />
        {form.formState.errors.currency_code && (
          <p className="text-sm text-red-500">{form.formState.errors.currency_code.message}</p>
        )}
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
          className="flex-1 rounded-md border px-3 py-2"
          placeholder="Nome da categoria"
          disabled
        />
        <input
          className="w-40 rounded-md border px-3 py-2"
          placeholder="Valor planejado"
          type="number"
          step="0.01"
          disabled
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
              <div className="text-sm text-gray-600">
                {c.planned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <button className="text-red-600 hover:underline text-sm" onClick={() => removeCategory(c.id)}>remover</button>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        onClick={onSubmit}
        disabled={!form.formState.isValid || form.formState.isSubmitting}
        className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitLabel || 'Criar Viagem'}
      </button>
    </div>
  </div>
);

}
