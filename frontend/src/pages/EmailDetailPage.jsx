import { ArrowLeft, CalendarClock, Clock3, Mail, UserRound } from 'lucide-react'

function EmailDetailPage({ email, isLoading, error, onBack, onRetry }) {
  const formatDate = (date) => {
    if (!date) return 'Not available'

    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SENT':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      case 'SCHEDULED':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20'
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20'
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20'
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-600/20'
    }
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading email details...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            Try again
          </button>
        </div>
      ) : email ? (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-6 sm:px-8 sm:py-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(email.status)}`}>
                {formatStatus(email.status)}
              </span>

              {email.status === 'FAILED' && email.failureReason && (
                <span className="max-w-full rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {email.failureReason}
                </span>
              )}
            </div>

            <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {email.subject}
            </h1>

            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500">
                  <UserRound size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sender
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {email.senderEmail || 'Not available'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500">
                  <Mail size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Recipient
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {email.recipient}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 px-4 py-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2 text-slate-600">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="mt-0.5 font-medium">{formatDate(email.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-600">
                <CalendarClock size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Scheduled</p>
                  <p className="mt-0.5 font-medium">{formatDate(email.scheduledTime)}</p>
                </div>
              </div>

              {(email.status === 'SENT' || email.status === 'FAILED') && (
                <div className="flex items-start gap-2 text-slate-600 sm:col-span-2">
                  <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">
                      {email.status === 'SENT' ? 'Sent' : 'Last updated'}
                    </p>
                    <p className="mt-0.5 font-medium">{formatDate(email.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-7 sm:px-8 sm:py-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Message
            </p>
            <div className="min-w-0 whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700">
              {email.message}
            </div>
          </div>

          {email.status === 'FAILED' && (
            <div className="border-t border-rose-100 bg-rose-50/60 px-5 py-5 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                Failure reason
              </p>
              <p className="mt-2 text-sm text-rose-700">
                {email.failureReason || 'No failure reason available.'}
              </p>
            </div>
          )}
        </article>
      ) : null}
    </div>
  )
}

export default EmailDetailPage
