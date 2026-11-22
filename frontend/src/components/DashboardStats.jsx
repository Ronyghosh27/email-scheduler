
import StatCard from './StatCard'

function DashboardStats({
  isLoadingEmails,
  totalEmails,
  scheduledEmails,
  sentEmails,
  failedEmails,
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Overview</h2>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your emails.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total emails"
          value={isLoadingEmails ? '—' : totalEmails}
          description="All email activity"
        />

        <StatCard
          title="Scheduled"
          value={isLoadingEmails ? '—' : scheduledEmails}
          description="Waiting to be sent"
          valueColor="text-amber-500"
        />

        <StatCard
          title="Sent emails"
          value={isLoadingEmails ? '—' : sentEmails}
          description="Successfully processed"
          valueColor="text-emerald-600"
        />

        <StatCard
          title="Failed emails"
          value={isLoadingEmails ? '—' : failedEmails}
          description="Need your attention"
          valueColor="text-rose-500"
        />

      </div>
    </section>
  )
}

export default DashboardStats
