import React from 'react'

type StatCardProps = {
  title: string
  value: React.ReactNode
  badgeText?: string
  badgeClassName?: string
}

export default function StatCard({ title, value, badgeText, badgeClassName }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="mt-1 flex items-end justify-between">
        <div className="text-3xl font-semibold text-slate-900">{value}</div>
        {badgeText && (
          <span className={`text-xs px-2 py-0.5 rounded ${badgeClassName || 'text-slate-600 bg-slate-50'}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  )
}

