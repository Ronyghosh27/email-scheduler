
import DashboardStats from '../components/DashboardStats'
import EmailTable from '../components/EmailTable'

function Dashboard({
  isLoadingEmails,
  totalEmails,
  scheduledEmails,
  sentEmails,
  failedEmails,
  emails,
  onEdit,
  onDelete,
  deletingEmailId,
  onOpenEmail,
}) {
  return (
    <>
      <DashboardStats
        isLoadingEmails={isLoadingEmails}
        totalEmails={totalEmails}
        scheduledEmails={scheduledEmails}
        sentEmails={sentEmails}
        failedEmails={failedEmails}
      />

      <EmailTable
        emails={emails}
        isLoadingEmails={isLoadingEmails}
        activePage="dashboard"
        pageTitle="Dashboard"
        onEdit={onEdit}
        onDelete={onDelete}
        deletingEmailId={deletingEmailId}
        onOpenEmail={onOpenEmail}
      />
    </>
  )
}

export default Dashboard
