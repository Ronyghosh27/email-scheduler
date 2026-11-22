
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  CalendarClock,
  Send,
  Mail,
  Settings,
  CircleHelp,
  ChevronDown,
  LogOut,
} from 'lucide-react'

function Sidebar({ activePage, setActivePage, user, onLogout }) {
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    const closeAccountMenu = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', closeAccountMenu)
    return () => document.removeEventListener('mousedown', closeAccountMenu)
  }, [])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scheduled', label: 'Scheduled', icon: CalendarClock },
    { id: 'sent', label: 'Sent emails', icon: Send },
    { id: 'failed', label: 'Failed emails', icon: Mail },
  ]

  const accountInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.trim()?.charAt(0)?.toUpperCase() ||
    'U'

  return (
    <aside className="flex w-full flex-col bg-slate-950 px-4 py-5 text-white md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto md:px-5 md:py-6">

      <div className="mb-6 flex items-center gap-3 md:mb-9">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/20 shadow-[0_8px_24px_rgba(99,102,241,0.16)]">
          <Mail size={21} className="text-indigo-300" strokeWidth={2} />
        </div>

        <span className="text-xl font-bold tracking-tight text-slate-50">
          MailFlow
        </span>
      </div>

      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Workspace
      </p>

      <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-1 md:gap-1.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id)
                setAccountOpen(false)
              }}
              className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ease-out md:px-3.5 md:py-3 ${
                isActive
                  ? 'border border-indigo-400/10 bg-indigo-500/15 text-indigo-200 shadow-[0_8px_20px_rgba(15,23,42,0.12)]'
                  : 'border border-transparent text-slate-400 hover:border-slate-800/80 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-indigo-400" />
              )}
              <Icon
                size={19}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={`shrink-0 transition-colors ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-5 space-y-1.5 border-t border-slate-800/80 pt-4 md:mt-auto md:pt-5">
        <button
          type="button"
          onClick={() => {
            setActivePage('help')
            setAccountOpen(false)
          }}
          className={`relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
            activePage === 'help'
              ? 'border border-indigo-400/10 bg-indigo-500/15 text-indigo-200'
              : 'border border-transparent text-slate-400 hover:border-slate-800/80 hover:bg-slate-800/70 hover:text-slate-100'
          }`}
          aria-current={activePage === 'help' ? 'page' : undefined}
        >
          {activePage === 'help' && (
            <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-indigo-400" />
          )}
          <CircleHelp
            size={19}
            strokeWidth={activePage === 'help' ? 2.2 : 1.8}
            className={`shrink-0 ${activePage === 'help' ? 'text-indigo-300' : 'text-slate-500'}`}
          />
          <span>Help center</span>
        </button>

        <button
          onClick={() => {
            setActivePage('settings')
            setAccountOpen(false)
          }}
          className={`relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
            activePage === 'settings'
              ? 'border border-indigo-400/10 bg-indigo-500/15 text-indigo-200'
              : 'border border-transparent text-slate-400 hover:border-slate-800/80 hover:bg-slate-800/70 hover:text-slate-100'
          }`}
          aria-current={activePage === 'settings' ? 'page' : undefined}
        >
          {activePage === 'settings' && (
            <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-indigo-400" />
          )}
          <Settings
            size={19}
            strokeWidth={activePage === 'settings' ? 2.2 : 1.8}
            className={`shrink-0 ${activePage === 'settings' ? 'text-indigo-300' : 'text-slate-500'}`}
          />
          <span>Settings</span>
        </button>

        <div
          ref={accountRef}
          className="relative mt-3 border-t border-slate-800/80 pt-3 md:mt-4 md:pt-4"
        >
          <button
            onClick={() => setAccountOpen((open) => !open)}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-all duration-200 hover:border-slate-800/80 hover:bg-slate-800/70"
            aria-expanded={accountOpen}
            aria-haspopup="menu"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-300/20 bg-gradient-to-br from-indigo-400 to-indigo-600 text-sm font-bold text-white shadow-[0_6px_18px_rgba(99,102,241,0.22)]">
              {accountInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-100">
                {user?.name || 'My account'}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {user?.email || 'Email unavailable'}
              </p>
            </div>

            <ChevronDown
              size={17}
              strokeWidth={2}
              className={`shrink-0 text-slate-500 transition-transform duration-200 ${
                accountOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {accountOpen && (
            <div
              role="menu"
              className="mt-2 rounded-xl border border-slate-800/90 bg-slate-900 p-1.5 shadow-2xl md:absolute md:bottom-full md:left-0 md:right-0 md:mb-2 md:mt-0"
            >
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={18} strokeWidth={1.9} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
