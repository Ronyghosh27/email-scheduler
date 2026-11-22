
import { useEffect, useRef } from 'react'
import { LoaderCircle, Plus, RefreshCw, Search, X } from 'lucide-react'

function Header({
  pageTitle,
  isLoadingEmails,
  loadEmails,
  setActivePage,
  searchQuery,
  setSearchQuery,
  clearSearch,
  searchOpen,
  setSearchOpen,
  isSearching,
  searchError,
  searchResults,
  onOpenSearchResult,
}) {
  const searchContainerRef = useRef(null)

  useEffect(() => {
    const closeSearch = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', closeSearch)
    return () => document.removeEventListener('mousedown', closeSearch)
  }, [setSearchOpen])

  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getStatusStyle = (status) => {
    if (status === 'SENT') return 'bg-emerald-50 text-emerald-700'
    if (status === 'SCHEDULED') return 'bg-amber-50 text-amber-700'
    if (status === 'FAILED') return 'bg-rose-50 text-rose-700'
    return 'bg-blue-50 text-blue-700'
  }

  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">
          Workspace / Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="relative flex w-full flex-wrap items-center gap-3 md:w-auto">
        <div
          ref={searchContainerRef}
          className="relative order-3 w-full md:order-none md:w-[300px] lg:w-[360px]"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setSearchOpen(true)
            }}
            placeholder="Search emails..."
            aria-label="Search emails"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              title="Clear search"
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}

          {searchOpen && (
            <div className="absolute left-0 right-0 z-40 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
                  <LoaderCircle size={17} className="animate-spin text-indigo-500" />
                  Searching emails...
                </div>
              ) : searchError ? (
                <div className="rounded-xl bg-rose-50 px-4 py-5 text-center text-sm text-rose-700">
                  {searchError}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">No matching emails found</p>
                  <p className="mt-1 text-xs text-slate-400">Try another subject, recipient, message, or status.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((email) => (
                    <button
                      type="button"
                      key={email.id}
                      onClick={() => onOpenSearchResult(email)}
                      className="w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                          {email.subject}
                        </p>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${getStatusStyle(email.status)}`}>
                          {email.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        To: {email.recipient}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {email.message}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {email.status === 'SCHEDULED'
                          ? `Scheduled ${formatDate(email.scheduledTime)}`
                          : formatDate(email.updatedAt || email.createdAt)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={loadEmails}
          disabled={isLoadingEmails}
          title="Refresh emails"
          aria-label={isLoadingEmails ? 'Refreshing emails' : 'Refresh emails'}
          className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={19}
            className={isLoadingEmails ? 'animate-spin' : ''}
          />
        </button>

        {/* <button
          title="Notifications"
          className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-100"
        >
          <Bell size={19} />
        </button> */}

        <button
          onClick={() => setActivePage('compose')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
        >
          <Plus size={18} />
          Compose email
        </button>
      </div>
    </header>
  )
}

export default Header
