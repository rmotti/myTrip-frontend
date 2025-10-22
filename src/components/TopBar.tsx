import React from 'react'

type TopBarProps = {
  appName?: string
  userLabel?: string
  onSignOut?: () => void
}

export default function TopBar({ appName = 'MyTrip', userLabel, onSignOut }: TopBarProps) {
  return (
    <header className="bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">✈️</span>
          <h1 className="text-lg font-semibold text-slate-900">{appName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {userLabel && (
            <span className="hidden sm:block text-sm text-slate-600">{userLabel}</span>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Sair
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

