// src/components/EditTripForm.tsx
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updateTrip } from '../services/trips'
import { getErrorMessage } from '../utils/getErrorMessage'

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

type EditTripFormProps = {
  tripId: number | string
  initial: FormValues
  onUpdated?: () => void
  onCancel: () => void
}

export default function EditTripForm({ tripId, initial, onUpdated, onCancel }: EditTripFormProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const form = useForm<FormValues>({
    resolver: zodResolver(tripSchema),
    mode: 'onChange',
    defaultValues: initial,
  })
  const startDate = form.watch('start_date')

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      currency_code: values.currency_code.toUpperCase(),
    }
    await toast.promise(
      updateTrip(tripId, payload as any),
      {
        loading: 'Atualizando...',
        success: 'Viagem atualizada!'
        ,
        error: (err) => getErrorMessage(err, 'Falha ao atualizar viagem'),
      }
    )
    onUpdated?.()
  })

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-lg p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Editar Viagem</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nome da Viagem *</label>
          <input className="w-full rounded-md border px-3 py-2" placeholder="Ex: Férias em Paris" {...form.register('name')} />
          {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Destino *</label>
          <input className="w-full rounded-md border px-3 py-2" placeholder="Ex: Paris, França" {...form.register('destination')} />
          {form.formState.errors.destination && (<p className="text-sm text-red-500">{form.formState.errors.destination.message}</p>)}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Data de Início *</label>
          <input type="date" className="w-full rounded-md border px-3 py-2" min={today} {...form.register('start_date')} />
          {form.formState.errors.start_date && (<p className="text-sm text-red-500">{form.formState.errors.start_date.message}</p>)}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Data de Término *</label>
          <input type="date" className="w-full rounded-md border px-3 py-2" min={startDate || today} {...form.register('end_date')} />
          {form.formState.errors.end_date && (<p className="text-sm text-red-500">{form.formState.errors.end_date.message}</p>)}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Orçamento Total (R$) *</label>
          <input type="number" step="0.01" min={0} className="w-full rounded-md border px-3 py-2" placeholder="0.00" {...form.register('total_budget')} />
          {form.formState.errors.total_budget && (<p className="text-sm text-red-500">{form.formState.errors.total_budget.message}</p>)}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Moeda (3 letras)</label>
          <input className="w-full rounded-md border px-3 py-2 uppercase" maxLength={3} {...form.register('currency_code')} />
          {form.formState.errors.currency_code && (<p className="text-sm text-red-500">{form.formState.errors.currency_code.message}</p>)}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">URL da Imagem (opcional)</label>
          <input className="w-full rounded-md border px-3 py-2" placeholder="https://..." {...form.register('image_url')} />
          {form.formState.errors.image_url && (<p className="text-sm text-red-500">{form.formState.errors.image_url.message}</p>)}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
        <button onClick={onSubmit} disabled={!form.formState.isValid || form.formState.isSubmitting} className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">Salvar</button>
      </div>
    </div>
  )
}

