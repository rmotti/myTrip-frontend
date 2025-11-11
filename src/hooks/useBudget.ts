// src/hooks/useBudget.ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  listBudgetCategories,
  createBudgetCategory,
  listTripItems,
  createTripItem,
  deleteTripItem,
  updateTripItem,
  listTargets,
  upsertTarget,
  deleteTarget,
  type BudgetCategory,
  type CategoryTarget,
  type TripItem,
} from '@/services/budget'

export type UiCategory = {
  id: number
  name: string
  icon: string
  planned: number
  spent: number
  hasTarget: boolean
}

export function useBudget(tripId: number | string) {
  const id = useMemo(() => (typeof tripId === 'string' ? Number(tripId) : tripId), [tripId])

  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [targets, setTargets] = useState<CategoryTarget[]>([])
  const [items, setItems] = useState<TripItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastItemsParams, setLastItemsParams] = useState<{
    skip?: number
    limit?: number
    date_from?: string
    date_until?: string
    category_id?: number
  } | undefined>(undefined)

  const refetch = useCallback(async () => {
    if (!Number.isFinite(id)) return
    setLoading(true)
    setError(null)
    try {
      const [cats, tgs, it] = await Promise.all([
        listBudgetCategories(),
        listTargets(id as number),
        listTripItems(id as number, lastItemsParams ?? { limit: 500 }),
      ])
      setCategories(cats)
      setTargets(tgs)
      setItems(it)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar orçamento')
    } finally {
      setLoading(false)
    }
  }, [id, lastItemsParams])

  useEffect(() => {
    refetch()
  }, [refetch])

  const uiCategories: UiCategory[] = useMemo(() => {
    const catName = (c: any): string => {
      const n = c?.name ?? c?.title ?? c?.label ?? c?.display_name ?? c?.slug ?? c?.code
      return n ? String(n) : `Categoria ${c?.id ?? ''}`
    }
    const spentByCat = new Map<number, number>()
    for (const it of items) {
      spentByCat.set(it.category_id, (spentByCat.get(it.category_id) ?? 0) + (it.actual_amount ?? 0))
    }

    const plannedByCat = new Map<number, number>()
    for (const t of targets) {
      plannedByCat.set(t.category_id, t.planned_amount)
    }

    return categories.map((c) => ({
      id: c.id,
      name: catName(c as any),
      icon: c.icon || 'shopping-bag',
      planned: plannedByCat.get(c.id) ?? 0,
      spent: spentByCat.get(c.id) ?? 0,
      hasTarget: plannedByCat.has(c.id),
    }))
  }, [categories, items, targets])

  // Ações
  async function addExpense(categoryId: number, value: number, opts?: { title?: string; date?: string }) {
    const payload = {
      category_id: categoryId,
      title: opts?.title ?? 'Gasto',
      actual_amount: value,
      // Backend exige None (null) para "date" no create (422 none_required)
      // Envie null aqui; se for necessário editar a data, use update.
      date: null as any,
    }
    const created = await createTripItem(id as number, payload)
    setItems((prev) => [created, ...prev])
    return created
  }

  async function removeExpense(itemId: number) {
    await deleteTripItem(id as number, itemId)
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  async function updateExpense(itemId: number, payload: { title?: string; actual_amount?: number; date?: string; category_id?: number }) {
    const prev = items
    const idx = prev.findIndex((i) => i.id === itemId)
    if (idx >= 0) {
      const optimistic = { ...prev[idx], ...payload }
      setItems((p) => p.map((it) => (it.id === itemId ? (optimistic as TripItem) : it)))
    }
    try {
      const updated = await updateTripItem(id as number, itemId, payload)
      setItems((p) => p.map((it) => (it.id === itemId ? updated : it)))
      return updated
    } catch (e) {
      setItems(prev)
      throw e
    }
  }

  async function refetchItems(params?: { skip?: number; limit?: number; date_from?: string; date_until?: string; category_id?: number }) {
    setLastItemsParams(params)
    const it = await listTripItems(id as number, params)
    setItems(it)
    return it
  }

  async function setCategoryTarget(categoryId: number, planned_amount: number) {
    const res = await upsertTarget(id as number, { category_id: categoryId, planned_amount })
    setTargets((prev) => {
      const has = prev.some((t) => t.category_id === categoryId)
      return has ? prev.map((t) => (t.category_id === categoryId ? res : t)) : [res, ...prev]
    })
    try { window.dispatchEvent(new CustomEvent('dashboard:refresh')) } catch {}
    return res
  }

  async function removeCategoryTarget(categoryId: number) {
    await deleteTarget(id as number, categoryId)
    setTargets((prev) => prev.filter((t) => t.category_id !== categoryId))
    try { window.dispatchEvent(new CustomEvent('dashboard:refresh')) } catch {}
  }

  async function createCategory(name: string, icon?: string | null) {
    const created = await createBudgetCategory({ name, icon })
    setCategories((prev) => [...prev, created])
    return created
  }

  return {
    loading,
    error,
    refetch,
    categories: uiCategories,
    raw: { categories, targets, items },
    addExpense,
    removeExpense,
    updateExpense,
    refetchItems,
    setCategoryTarget,
    removeCategoryTarget,
    createCategory,
  }
}
