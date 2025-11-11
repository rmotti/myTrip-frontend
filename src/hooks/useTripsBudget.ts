// src/hooks/useTripsBudget.ts
import { useEffect, useMemo, useState } from 'react'
import {
  listBudgetCategories,
  listTargets,
  listTripItems,
  type BudgetCategory,
  type CategoryTarget,
  type TripItem,
} from '@/services/budget'

export type TripCategorySummary = {
  id: number
  name: string
  icon: string
  planned: number
  spent: number
}

type ByTrip = Record<number, TripCategorySummary[]>

export function useTripsBudget(tripIds: number[]) {
  const [byTrip, setByTrip] = useState<ByTrip>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ids = useMemo(() => Array.from(new Set(tripIds.filter((n) => Number.isFinite(n)))), [tripIds])

  async function fetchAll() {
    if (ids.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const categories = await listBudgetCategories()
      const results = await Promise.all(
        ids.map(async (tripId) => {
          const [targets, items] = await Promise.all([
            listTargets(tripId),
            listTripItems(tripId, { limit: 500 }),
          ])
          return [tripId, buildSummary(categories, targets, items)] as const
        })
      )
      const map: ByTrip = {}
      for (const [tripId, arr] of results) map[tripId] = arr
      setByTrip(map)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')])

  return { byTrip, loading, error, refetch: fetchAll }
}

function buildSummary(cats: BudgetCategory[], targets: CategoryTarget[], items: TripItem[]): TripCategorySummary[] {
  const plannedBy = new Map<number, number>()
  for (const t of targets) plannedBy.set(t.category_id, t.planned_amount)
  const spentBy = new Map<number, number>()
  // Consolidar preferencialmente pelos itens '__target__'
  const hasTargetItem = new Set<number>()
  for (const it of items) if (it.title === '__target__') hasTargetItem.add(it.category_id)
  for (const it of items) {
    if (hasTargetItem.size > 0 && hasTargetItem.has(it.category_id) && it.title !== '__target__') continue
    spentBy.set(it.category_id, (spentBy.get(it.category_id) ?? 0) + (it.actual_amount ?? 0))
  }

  const nameOf = (c: any): string => {
    const n = c?.name ?? c?.title ?? c?.label ?? c?.display_name ?? c?.slug ?? c?.code
    return n ? String(n) : `Categoria ${c?.id ?? ''}`
  }

  return cats
    .map((c) => ({
      id: c.id,
      name: nameOf(c),
      icon: c.icon || 'shopping-bag',
      planned: plannedBy.get(c.id) ?? 0,
      spent: spentBy.get(c.id) ?? 0,
    }))
    .filter((c) => c.planned > 0 || c.spent > 0)
}

