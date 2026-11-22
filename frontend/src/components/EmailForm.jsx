
import { Send, Save } from 'lucide-react'

function EmailForm({
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  submitMessage,
  submitSuccess,
  isEditing,
}) {
  return (
    <section className="mt-10 max-w-3xl">

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Edit scheduled email' : 'Compose email'}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? 'Update your scheduled email details.'
            : 'Write your email and choose when it should be sent.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Recipient email
          </label>

          <input
            type="email"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="example@gmail.com"
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Subject
          </label>

          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter email subject"
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Message
          </label>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your email..."
            rows={6}
            required
            className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Schedule date and time
          </label>

          <input
            type="datetime-local"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        {submitMessage && (
          <div
            role="alert"
            className={`rounded-xl p-3 text-sm ${
              submitSuccess
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {submitMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEditing ? <Save size={17} /> : <Send size={17} />}

          {isSubmitting
            ? 'Please wait...'
            : isEditing
              ? 'Update email'
              : 'Schedule email'}
        </button>

      </form>
    </section>
  )
}

export default EmailForm
