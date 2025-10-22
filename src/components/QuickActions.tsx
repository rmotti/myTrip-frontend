import React from 'react'

type QuickActionsProps = {
  onAction?: (key: 'new' | 'expense' | 'map' | 'export') => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-slate-900 font-semibold mb-3">Ações rápidas</h3>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onAction?.('new')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Nova viagem</button>
        <button onClick={() => onAction?.('expense')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Adicionar gasto</button>
        <button onClick={() => onAction?.('map')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Ver mapa</button>
        <button onClick={() => onAction?.('export')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-slate-800">Exportar</button>
      </div>
      <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
        Dica: conecte seu calendário para ver viagens futuras aqui.
      </div>
    </div>
  )
}

