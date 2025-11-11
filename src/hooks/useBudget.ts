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
    // Preferimos consolidar pelo item de target ('__target__') para evitar duplicidade
    const hasTargetItem = new Set<number>()
    for (const it of items) {
      if (it.title === '__target__') hasTargetItem.add(it.category_id)
    }
    for (const it of items) {
      if (hasTargetItem.size > 0 && hasTargetItem.has(it.category_id) && it.title !== '__target__') continue
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
    // Regra: gasto deve "conversar" com a meta (mesmo registro).
    // Procuramos o item de target (título especial) e somamos no actual_amount.
    const TARGET_TITLE = '__target__'
    const existing = items.find((i) => i.category_id === categoryId && (i.title === TARGET_TITLE))

    if (existing) {
      const prevAmount = Number(existing.actual_amount ?? 0)
      const nextAmount = prevAmount + value

      // Otimismo de UI
      const snapshot = items
      setItems((p) => p.map((it) => (it.id === existing.id ? { ...it, actual_amount: nextAmount } as TripItem : it)))
      try {
        const updated = await updateTripItem(id as number, existing.id, { actual_amount: nextAmount })
        setItems((p) => p.map((it) => (it.id === existing.id ? updated : it)))
        return updated
      } catch (e) {
        // Reverte em caso de falha
        setItems(snapshot)
        throw e
      }
    }

    // Se não houver target ainda, criamos um item target com planned 0 e actual = value
    const payload = {
      category_id: categoryId,
      title: TARGET_TITLE,
      planned_amount: 0,
      actual_amount: value,
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
    // Também garantimos a presença de um item "__target__" correspondente
    try {
      const TARGET_TITLE = '__target__'
      const hasItem = items.some((i) => i.category_id === categoryId && i.title === TARGET_TITLE)
      if (!hasItem) {
        const created = await createTripItem(id as number, {
          category_id: categoryId,
          title: TARGET_TITLE,
          planned_amount,
          actual_amount: 0,
          date: null as any,
        })
        setItems((prev) => [created, ...prev])
      } else {
        // Mantém o planned_amount sincronizado no item existente
        const existing = items.find((i) => i.category_id === categoryId && i.title === TARGET_TITLE)!
        const updated = await updateTripItem(id as number, existing.id, { planned_amount })
        setItems((p) => p.map((it) => (it.id === existing.id ? updated : it)))
      }
    } catch {/* se falhar, o /targets já cobre o valor planejado para os resumos */}
    try { window.dispatchEvent(new CustomEvent('dashboard:refresh')) } catch {}
    return res
  }

  async function removeCategoryTarget(categoryId: number) {
    // Apaga a meta no backend
    await deleteTarget(id as number, categoryId)
    setTargets((prev) => prev.filter((t) => t.category_id !== categoryId))

    // Apaga também quaisquer itens da categoria (incluindo o '__target__') no backend
    const toDelete = items.filter((i) => i.category_id === categoryId)
    for (const it of toDelete) {
      try { await deleteTripItem(id as number, it.id) } catch { /* ignore por robustez */ }
    }
    // Atualiza estado local
    setItems((prev) => prev.filter((i) => i.category_id !== categoryId))

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
