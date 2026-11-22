import { useEffect } from 'react'
import { LoaderCircle, Trash2, X } from 'lucide-react'

function DeleteConfirmationModal({
  open,
  count = 1,
  isBulk = count > 1,
  isScheduled = false,
  isDeleting = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, isDeleting, onCancel])

  if (!open) return null

  const description = isScheduled
    ? 'Are you sure you want to cancel this scheduled email? This action cannot be undone.'
    : isBulk
      ? `Are you sure you want to delete ${count} selected email${count === 1 ? '' : 's'} from MailFlow? ${count === 1 ? 'It' : 'They'} will remain in your Gmail Sent folder.`
      : 'Are you sure you want to delete this sent email from MailFlow? It will remain in your Gmail Sent folder.'

  const confirmLabel = isScheduled
    ? 'Cancel Email'
    : isBulk
      ? `Delete ${count} Email${count === 1 ? '' : 's'}`
      : 'Delete Email'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-email-title"
        aria-describedby="delete-email-description"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <Trash2 size={20} strokeWidth={2} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close delete confirmation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-5">
          <h2
            id="delete-email-title"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Delete email?
          </h2>
          <p
            id="delete-email-description"
            className="mt-2 text-sm leading-6 text-slate-500"
          >
            {description}
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              {isDeleting ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
