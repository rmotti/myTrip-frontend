// src/components/AppHeader.tsx
import { useState, type ReactNode } from 'react'
import { Bell, ChevronLeft, MoreVertical, Search, User } from 'lucide-react'

type NavLink = { label: string; onClick?: () => void; href?: string; active?: boolean }
type Action = { label: string; onClick: () => void; icon?: ReactNode; variant?: 'primary' | 'outline' | 'ghost' }

type AppHeaderProps = {
  appName?: string
  navLinks?: NavLink[]
  title: string
  subtitle?: string
  onBack?: () => void
  primaryAction?: Action
  toolbarActions?: Action[]
  showSearch?: boolean
  userName?: string
  onSignOut?: () => void
  onSwitchAccount?: () => void
  onSearch?: (query: string) => void
  searchPlaceholder?: string
}

function cls(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export default function AppHeader({
  appName = 'MyTrip',
  navLinks = [],
  title,
  subtitle,
  onBack,
  primaryAction,
  toolbarActions = [],
  showSearch = true,
  userName,
  onSignOut,
  onSwitchAccount,
  onSearch,
  searchPlaceholder = 'Buscar viagens, destinos...'
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <header
      className="text-white w-full"
      style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
      }}
    >
      {/* Top bar (full width) */}
      <div className="w-full px-4">
        <div className="h-14 flex items-center gap-4">
          {/* Left: brand + nav */}
          <div className="flex items-center gap-6 overflow-x-auto min-w-max">
            <div className="flex items-center gap-2 min-w-max">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-white/10">✈️</span>
              <span className="font-semibold">{appName}</span>
            </div>
            {navLinks.length > 0 && (
              <nav className="flex items-center gap-4 text-sm">
                {navLinks.map((l) => (
                  <button
                    key={l.label}
                    className={cls(
                      'px-0.5 py-1 rounded text-slate-200 hover:text-white',
                      l.active && 'text-white font-medium'
                    )}
                    onClick={l.onClick}
                  >
                    {l.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Center: search in-line */}
          {showSearch && (
            <div className="flex-1 flex justify-center">
              <form
                className="w-full max-w-2xl"
                onSubmit={(e) => { e.preventDefault(); onSearch?.(query) }}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => onSearch?.(query)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-600 hover:text-slate-700 hover:bg-white/70"
                    aria-label="Buscar"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full h-11 rounded-full bg-white/90 text-slate-900 pl-10 pr-4 shadow-sm placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right: user/menu */}
          <div className="flex items-center gap-2 relative min-w-max">
            <div className="w-px h-6 bg-white/20 hidden sm:block" />
            <button
              className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/25"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <User className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-64 rounded-lg border border-white/15 bg-[#1e40af]/95 shadow-lg p-2">
                <div className="px-2 py-2">
                  <div className="text-xs text-slate-300">Logado como</div>
                  <div className="text-sm font-medium text-white truncate">{userName || 'Usuário'}</div>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10"
                  onClick={() => { setMenuOpen(false); onSignOut?.() }}
                >
                  Sair
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10"
                  onClick={() => { setMenuOpen(false); onSwitchAccount?.() }}
                >
                  Entrar com outra conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search moved into the top bar */}

      {/* Subheader with title and actions (full width) */}
      <div
        className="border-t border-white/10 w-full"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
        }}
      >
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {onBack && (
                <button className="p-1.5 rounded hover:bg-white/10" onClick={onBack} title="Voltar">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="truncate text-lg font-semibold">{title}</h1>
                </div>
                {subtitle && (
                  <div className="text-xs text-slate-200 mt-0.5 truncate">{subtitle}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded hover:bg-white/10">
                <MoreVertical className="w-5 h-5" />
              </button>
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className={cls(
                    'rounded px-3 py-1.5 text-sm font-medium',
                    primaryAction.variant === 'outline' && 'border border-white/30 text-white hover:bg-white/10',
                    (!primaryAction.variant || primaryAction.variant === 'primary') && 'bg-slate-100 text-slate-900 hover:bg-white'
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {primaryAction.icon}
                    {primaryAction.label}
                  </span>
                </button>
              )}
            </div>
          </div>
          {toolbarActions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {toolbarActions.map((a) => (
                <button
                  key={a.label}
                  onClick={a.onClick}
                  className={cls(
                    'rounded px-2.5 py-1.5',
                    a.variant === 'ghost' && 'text-slate-200 hover:bg-white/10',
                    a.variant === 'outline' && 'text-slate-200 border border-white/20 hover:bg-white/10',
                    (!a.variant || a.variant === 'primary') && 'bg-white text-slate-900 hover:bg-slate-100'
                  )}
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
