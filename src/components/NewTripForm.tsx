// src/components/NewTripForm.tsx
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createTrip } from '../services/trips'
// categorias foram removidas do formulário de criação
import { getErrorMessage } from '../utils/getErrorMessage'


// Removido: definição de categoria para o formulário de criação

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

// Removidos presets de categorias na criação

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
  // Currency select helper
  const initialCurrency = (initial?.currency_code || 'BRL').toUpperCase()
  const known = new Set(['BRL', 'USD', 'EUR'])
  const [currencySelect, setCurrencySelect] = useState<'BRL' | 'USD' | 'EUR' | 'OTHER'>(
    known.has(initialCurrency) ? (initialCurrency as 'BRL' | 'USD' | 'EUR') : 'BRL'
  )
  useEffect(() => {
    if (currencySelect !== 'OTHER') {
      form.setValue('currency_code', currencySelect, { shouldValidate: true })
    }
  }, [currencySelect])
  const startDate = form.watch('start_date')
  // Sincroniza automaticamente a data de término quando a de início mudar
  useEffect(() => {
    if (!startDate) return
    const end = form.getValues('end_date')
    if (!end || end < startDate) {
      form.setValue('end_date', startDate, { shouldValidate: true, shouldDirty: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate])

  // categorias removidas do formulário de criação

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
        <label className="block text-sm text-gray-600 mb-1">Moeda</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select
            className="w-full rounded-md border px-3 py-2"
            value={currencySelect}
            onChange={(e) => setCurrencySelect(e.target.value as any)}
          >
            <option value="BRL">Real (BRL)</option>
            <option value="USD">Dólar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="OTHER">Outro</option>
          </select>
          {currencySelect === 'OTHER' && (
            <input
              className="w-full rounded-md border px-3 py-2 uppercase"
              placeholder="Código (ex: GBP)"
              maxLength={3}
              {...form.register('currency_code')}
            />
          )}
        </div>
        {form.formState.errors.currency_code && (
          <p className="text-sm text-red-500">{form.formState.errors.currency_code.message}</p>
        )}
      </div>
    </div>

    {/* Campo de categorias removido do formulário de criação */}

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
