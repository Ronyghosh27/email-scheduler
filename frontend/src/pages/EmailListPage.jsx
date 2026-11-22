
import EmailTable from '../components/EmailTable'

function EmailListPage({
  emails,
  isLoadingEmails,
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
  return (
    <EmailTable
      emails={emails}
      isLoadingEmails={isLoadingEmails}
      activePage="list"
      pageTitle={pageTitle}
      onEdit={onEdit}
      onDelete={onDelete}
      deletingEmailId={deletingEmailId}
      selectable={selectable}
      selectedEmailIds={selectedEmailIds}
      onToggleEmail={onToggleEmail}
      onToggleAll={onToggleAll}
      onBulkDelete={onBulkDelete}
      isBulkDeleting={isBulkDeleting}
      onOpenEmail={onOpenEmail}
    />
  )
}

export default EmailListPage
