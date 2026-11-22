import { Mail, Pencil, Trash2 } from 'lucide-react'

function EmailTable({
  emails,
  isLoadingEmails,
  activePage,
  pageTitle,
  onEdit,
  onDelete,
  deletingEmailId,
  selectable = false,
  selectedEmailIds = [],
  onToggleEmail,
  onToggleAll,
  onBulkDelete,
  isBulkDeleting = false,
  onOpenEmail,
}) {
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
    switch (status) {
      case 'SENT':
        return 'bg-emerald-50 text-emerald-700'
      case 'SCHEDULED':
        return 'bg-amber-50 text-amber-700'
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700'
      case 'FAILED':
        return 'bg-rose-50 text-rose-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'

    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  const selectableEmails = selectable
    ? emails.filter((email) => email.status === 'SENT')
    : []
  const allSelectableEmailsSelected =
    selectableEmails.length > 0 &&
    selectableEmails.every((email) => selectedEmailIds.includes(email.id))

  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            {activePage === 'dashboard' ? 'Recent emails' : pageTitle}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your emails retrieved from the database.
          </p>
        </div>

        {selectable && selectedEmailIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              {selectedEmailIds.length} selected
            </span>
            <button
              type="button"
              onClick={onBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} />
              {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        )}

        {selectable && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 md:hidden">
            <input
              type="checkbox"
              checked={allSelectableEmailsSelected}
              onChange={onToggleAll}
              disabled={selectableEmails.length === 0 || isBulkDeleting}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-indigo-600 disabled:cursor-not-allowed"
            />
            Select all
          </label>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className={`hidden gap-4 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid ${
          selectable ? 'grid-cols-12' : 'grid-cols-12'
        }`}>
          {selectable && (
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={allSelectableEmailsSelected}
                onChange={onToggleAll}
                disabled={selectableEmails.length === 0 || isBulkDeleting}
                aria-label="Select all sent emails"
                className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-indigo-600 disabled:cursor-not-allowed"
              />
            </div>
          )}
          <div className={selectable ? 'col-span-3' : 'col-span-3'}>Recipient</div>
          <div className="col-span-2">Subject</div>
          <div className="col-span-3">Scheduled time</div>
          <div className="col-span-2">Status</div>
          <div className={selectable ? 'col-span-1' : 'col-span-2'}>Actions</div>
        </div>

        {isLoadingEmails ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading your emails...
          </div>
        ) : emails.length === 0 ? (
          <div className="p-10 text-center">
            <Mail size={32} className="mx-auto mb-3 text-slate-300" />

            <p className="font-medium text-slate-700">
              No emails found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your email activity will appear here.
            </p>
          </div>
        ) : (
          emails.map((email) => {
            const isSelected = selectable && selectedEmailIds.includes(email.id)
            const canSelect = selectable && email.status === 'SENT'

            return (
              <div
                key={email.id}
                role={onOpenEmail ? 'button' : undefined}
                tabIndex={onOpenEmail ? 0 : undefined}
                onClick={() => onOpenEmail?.(email)}
                onKeyDown={(event) => {
                  if (onOpenEmail && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault()
                    onOpenEmail(email)
                  }
                }}
                className={`grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-5 last:border-0 transition-colors md:grid-cols-12 md:items-center md:gap-4 ${
                  isSelected
                    ? 'cursor-pointer bg-indigo-50/80'
                    : 'cursor-pointer bg-white hover:bg-slate-50/70'
                }`}
              >
                {canSelect && (
                  <div
                    className="md:col-span-1"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleEmail(email.id)}
                      disabled={isBulkDeleting}
                      aria-label={`Select sent email to ${email.recipient}`}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-indigo-600 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {selectable && !canSelect && (
                  <div className="hidden md:col-span-1 md:block" />
                )}

                <div className="min-w-0 md:col-span-3">
                  <p className="mb-1 text-xs text-slate-400 md:hidden">
                    Recipient
                  </p>
                  <p className="truncate text-sm font-medium text-slate-800">
                    {email.recipient}
                  </p>
                </div>

                <div className="min-w-0 md:col-span-2">
                  <p className="mb-1 text-xs text-slate-400 md:hidden">
                    Subject
                  </p>
                  <p className="truncate text-sm text-slate-600">
                    {email.subject}
                  </p>
                </div>

                <div className="md:col-span-3">
                  <p className="mb-1 text-xs text-slate-400 md:hidden">
                    Scheduled time
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(email.scheduledTime)}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1 text-xs text-slate-400 md:hidden">
                    Status
                  </p>

                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(email.status)}`}>
                    {formatStatus(email.status)}
                  </span>

                  {email.status === 'FAILED' && (
                    <p className="mt-2 break-words text-xs text-rose-600">
                      Reason: {email.failureReason || 'No failure reason available.'}
                    </p>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 ${selectable ? 'md:col-span-1' : 'md:col-span-2'}`}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {email.status === 'SCHEDULED' && (
                    <>
                      <button
                        onClick={() => onEdit(email)}
                        title="Edit scheduled email"
                        className="rounded-lg border border-slate-200 p-2 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(email)}
                        disabled={deletingEmailId === email.id}
                        title="Cancel scheduled email"
                        className="rounded-lg border border-slate-200 p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>

                      {deletingEmailId === email.id && (
                        <span className="text-xs text-slate-400">Cancelling...</span>
                      )}
                    </>
                  )}

                  {email.status === 'SENT' && (
                    <>
                      <button
                        onClick={() => onDelete(email)}
                        disabled={deletingEmailId === email.id || isBulkDeleting}
                        title="Delete sent email"
                        aria-label={`Delete sent email to ${email.recipient}`}
                        className="rounded-lg border border-slate-200 p-2 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>

                      {deletingEmailId === email.id && (
                        <span className="text-xs text-slate-400">Deleting...</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

export default EmailTable
