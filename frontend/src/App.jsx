
import { useEffect, useState } from 'react'

import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Dashboard from './pages/Dashboard'
import EmailListPage from './pages/EmailListPage'
import ComposePage from './pages/ComposePage'
import SettingsPage from './pages/SettingsPage'
import EmailDetailPage from './pages/EmailDetailPage'
import DeleteConfirmationModal from './components/DeleteConfirmationModal'
import HelpCenterPage from './pages/HelpCenterPage'
import HelpArticlePage from './pages/HelpArticlePage'
import HelpCategoryPage from './pages/HelpCategoryPage'

import {
  getEmails,
  createEmail,
  updateEmail,
  deleteEmail,
  bulkDeleteSentEmails,
  getEmailById,
  searchEmails,
} from './services/emailService'

import {
  getCurrentUser,
  logoutUser,
} from './services/authService'

import LoginPage from './pages/LoginPage'

function App() {
  const [user, setUser] = useState(null)
const [isCheckingAuth, setIsCheckingAuth] = useState(true)
const [authError, setAuthError] = useState('')
  const [activePage, setActivePage] = useState('dashboard')
  const [gmailCallbackMessage, setGmailCallbackMessage] = useState('')
  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const gmailStatus = params.get('gmail')

  if (gmailStatus === 'connected') {
    setActivePage('settings')
    setGmailCallbackMessage('Gmail connected successfully!')
    window.history.replaceState({}, '', '/')
  }

  if (gmailStatus === 'error') {
    setActivePage('settings')
    setGmailCallbackMessage('Gmail connection failed. Please try again.')
    window.history.replaceState({}, '', '/')
  }
}, [])

  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    message: '',
    scheduledTime: '',
  })

  const [emails, setEmails] = useState([])
  const [isLoadingEmails, setIsLoadingEmails] = useState(true)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [editingEmailId, setEditingEmailId] = useState(null)
  const [deletingEmailId, setDeletingEmailId] = useState(null)
  const [selectedEmailIds, setSelectedEmailIds] = useState([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [selectedEmailId, setSelectedEmailId] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [isLoadingEmailDetail, setIsLoadingEmailDetail] = useState(false)
  const [emailDetailError, setEmailDetailError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [selectedHelpArticleId, setSelectedHelpArticleId] = useState(null)
  const [selectedHelpCategoryId, setSelectedHelpCategoryId] = useState(null)

  const loadEmails = async (showSuccess = false) => {
    setIsLoadingEmails(true)
    setEmailError('')
    if (showSuccess) setEmailSuccess('')

    try {
      const emailData = await getEmails()
      setEmails(emailData)
      if (showSuccess) setEmailSuccess('Emails refreshed successfully.')
    } catch (error) {
      setEmailError(error.message || 'Unable to connect to server.')
    } finally {
      setIsLoadingEmails(false)
    }
  }

  const refreshEmails = () => loadEmails(true)

  useEffect(() => {
    const query = searchQuery.trim()

    if (!query) {
      setSearchResults([])
      setSearchError('')
      setIsSearching(false)
      setSearchOpen(false)
      return
    }

    setSearchOpen(true)
    setIsSearching(true)
    setSearchError('')

    const abortController = new AbortController()
    const debounceTimer = window.setTimeout(async () => {
      try {
        const emails = await searchEmails(query, abortController.signal)
        setSearchResults(emails)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSearchResults([])
          setSearchError(error.message || 'Unable to search emails.')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, 300)

    return () => {
      window.clearTimeout(debounceTimer)
      abortController.abort()
    }
  }, [searchQuery])

  const openEmailDetail = async (email) => {
    if (!email?.id) return

    setSelectedEmailId(email.id)
    setSelectedEmail(null)
    setEmailDetailError('')
    setIsLoadingEmailDetail(true)

    try {
      const emailDetail = await getEmailById(email.id)
      setSelectedEmail(emailDetail)
    } catch (error) {
      setEmailDetailError(error.message || 'Email details are unavailable.')
    } finally {
      setIsLoadingEmailDetail(false)
    }
  }

  const retryEmailDetail = () => {
    if (selectedEmailId) {
      openEmailDetail({ id: selectedEmailId })
    }
  }

  const closeEmailDetail = () => {
    setSelectedEmailId(null)
    setSelectedEmail(null)
    setEmailDetailError('')
    setIsLoadingEmailDetail(false)
    if (searchQuery.trim()) {
      setSearchOpen(true)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError('')
    setIsSearching(false)
    setSearchOpen(false)
  }

  const openSearchResult = (email) => {
    setSearchOpen(false)
    openEmailDetail(email)
  }

  const openHelpCategory = (categoryId) => {
    setSelectedHelpArticleId(null)
    setSelectedHelpCategoryId(categoryId)
  }

  const openHelpArticle = (articleId) => {
    setSelectedHelpArticleId(articleId)
  }

  const backFromHelpArticle = () => {
    setSelectedHelpArticleId(null)
  }

  const backToHelpHome = () => {
    setSelectedHelpArticleId(null)
    setSelectedHelpCategoryId(null)
  }

  const handleActivePageChange = (page) => {
    closeEmailDetail()
    setSelectedHelpArticleId(null)
    setSelectedHelpCategoryId(null)
    setActivePage(page)
  }

  useEffect(() => {
  let isMounted = true

  const checkAuthentication = async () => {
    try {
      const data = await getCurrentUser()

      if (!isMounted) return

      if (data.isAuthenticated) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      if (isMounted) {
        setAuthError(error.message)
      }
    } finally {
      if (isMounted) {
        setIsCheckingAuth(false)
      }
    }
  }

  checkAuthentication()

  return () => {
    isMounted = false
  }
}, [])

useEffect(() => {
  if (user) {
    loadEmails()
  } else if (!isCheckingAuth) {
    setIsLoadingEmails(false)
  }
}, [user, isCheckingAuth])

useEffect(() => {
  if (activePage !== 'sent') {
    setSelectedEmailIds([])
    return
  }

  const sentIds = new Set(
    emails
      .filter((email) => email.status === 'SENT')
      .map((email) => email.id)
  )

  setSelectedEmailIds((currentIds) =>
    currentIds.filter((id) => sentIds.has(id))
  )
}, [activePage, emails])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setSubmitMessage('')
  }

  const handleEdit = (email) => {
    const scheduledDate = new Date(email.scheduledTime)

    const localScheduledTime = new Date(
      scheduledDate.getTime() -
      scheduledDate.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 16)

    setFormData({
      recipient: email.recipient,
      subject: email.subject,
      message: email.message,
      scheduledTime: localScheduledTime,
    })

    setEditingEmailId(email.id)
    setSubmitMessage('')
    setSubmitSuccess(false)
    setActivePage('compose')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitMessage('')
    setSubmitSuccess(false)
    setIsSubmitting(true)

    try {
      const scheduledDate = new Date(formData.scheduledTime)

      if (
        Number.isNaN(scheduledDate.getTime()) ||
        scheduledDate <= new Date()
      ) {
        throw new Error('Please select a valid future date and time.')
      }

      const emailData = {
        ...formData,
        scheduledTime: scheduledDate.toISOString(),
      }

      if (editingEmailId) {
        await updateEmail(editingEmailId, emailData)

        setSubmitMessage('Email updated successfully!')
      } else {
        await createEmail(emailData)

        setSubmitMessage('Email scheduled successfully!')

        setFormData({
          recipient: '',
          subject: '',
          message: '',
          scheduledTime: '',
        })
      }

      setSubmitSuccess(true)

      await loadEmails()
    } catch (error) {
      setSubmitSuccess(false)
      setSubmitMessage(error.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (email) => {
    if (!email || !['SCHEDULED', 'SENT'].includes(email.status)) return
    setDeleteModal({
      type: 'individual',
      email,
      count: 1,
    })
  }

  const executeIndividualDelete = async (email) => {
    if (!email || deletingEmailId) return

    setDeletingEmailId(email.id)
    setEmailError('')
    setEmailSuccess('')

    try {
      await deleteEmail(email.id)
      setEmails((currentEmails) =>
        currentEmails.filter((currentEmail) => currentEmail.id !== email.id)
      )
      setDeleteModal(null)
      setEmailSuccess(
        email.status === 'SCHEDULED'
          ? 'Scheduled email cancelled successfully.'
          : 'Email deleted from MailFlow successfully.'
      )
    } catch (error) {
      setEmailError(
        error.message ||
        (email.status === 'SCHEDULED'
          ? 'Failed to cancel email.'
          : 'Failed to delete email.')
      )
    } finally {
      setDeletingEmailId(null)
    }
  }

  const handleToggleEmail = (emailId) => {
    setSelectedEmailIds((currentIds) => {
      if (currentIds.includes(emailId)) {
        return currentIds.filter((id) => id !== emailId)
      }

      const email = emails.find((item) => item.id === emailId)
      if (!email || email.status !== 'SENT') return currentIds

      return [...currentIds, emailId]
    })
  }

  const handleToggleAll = () => {
    const sentIds = emails
      .filter((email) => email.status === 'SENT')
      .map((email) => email.id)

    setSelectedEmailIds((currentIds) => {
      const allSelected =
        sentIds.length > 0 &&
        sentIds.every((id) => currentIds.includes(id))

      return allSelected ? [] : sentIds
    })
  }

  const handleBulkDelete = () => {
    if (isBulkDeleting || selectedEmailIds.length === 0) return

    const sentSelectedIds = emails
      .filter(
        (email) =>
          email.status === 'SENT' &&
          selectedEmailIds.includes(email.id)
      )
      .map((email) => email.id)

    if (sentSelectedIds.length !== selectedEmailIds.length) {
      setEmailError('Only sent emails can be deleted with this feature.')
      setSelectedEmailIds([])
      return
    }

    setDeleteModal({
      type: 'bulk',
      ids: sentSelectedIds,
      count: sentSelectedIds.length,
    })
  }

  const executeBulkDelete = async (ids) => {
    if (isBulkDeleting || !ids?.length) return

    const count = ids.length
    setIsBulkDeleting(true)
    setEmailError('')
    setEmailSuccess('')

    try {
      const result = await bulkDeleteSentEmails(ids)

      setEmails((currentEmails) =>
        currentEmails.filter(
          (email) => !ids.includes(email.id)
        )
      )
      setSelectedEmailIds([])
      setDeleteModal(null)
      setEmailSuccess(
        result.message ||
        `${count} sent email${count === 1 ? '' : 's'} deleted successfully.`
      )
    } catch (error) {
      setEmailError(
        error.message || 'Failed to delete selected emails.'
      )
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const cancelDeleteModal = () => {
    if (deletingEmailId || isBulkDeleting) return
    setDeleteModal(null)
  }

  const confirmDeleteModal = () => {
    if (!deleteModal) return

    if (deleteModal.type === 'bulk') {
      executeBulkDelete(deleteModal.ids)
      return
    }

    executeIndividualDelete(deleteModal.email)
  }

  const handleBackFromCompose = () => {
    setActivePage(editingEmailId ? 'scheduled' : 'dashboard')
    setEditingEmailId(null)
    setSubmitMessage('')
  }

  const totalEmails = emails.length

  const scheduledEmails = emails.filter(
    (email) => email.status === 'SCHEDULED'
  ).length

  const sentEmails = emails.filter(
    (email) => email.status === 'SENT'
  ).length

  const failedEmails = emails.filter(
    (email) => email.status === 'FAILED'
  ).length

  const recentEmails = [...emails].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  const filteredEmails = recentEmails.filter((email) => {
    if (activePage === 'scheduled') {
      return email.status === 'SCHEDULED'
    }

    if (activePage === 'sent') {
      return email.status === 'SENT'
    }

    if (activePage === 'failed') {
      return email.status === 'FAILED'
    }

    return true
  })

  const pageTitles = {
  dashboard: 'Dashboard',
  scheduled: 'Scheduled emails',
  sent: 'Sent emails',
  failed: 'Failed emails',
  settings: 'Settings',
  help: 'Help Center',
}

  if (isCheckingAuth) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-slate-500">
        Checking your login...
      </p>
    </div>
  )
}

if (authError) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <p className="text-sm text-red-600">
        {authError}
      </p>

      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  )
}

if (!user) {
  return <LoginPage />
}

return (
  <div className="min-h-screen bg-slate-50 text-slate-900 md:flex md:h-screen md:overflow-hidden">

      <Sidebar
  activePage={activePage}
  setActivePage={handleActivePageChange}
  user={user}
  onLogout={logoutUser}
/>

      <main className="min-w-0 flex-1 p-6 md:ml-64 md:h-screen md:overflow-y-auto md:p-10">

        {selectedEmailId ? (
          <EmailDetailPage
            email={selectedEmail}
            isLoading={isLoadingEmailDetail}
            error={emailDetailError}
            onBack={closeEmailDetail}
            onRetry={retryEmailDetail}
          />
        ) : activePage !== 'compose' && (
          <>
            {activePage !== 'help' && (
              <Header
  pageTitle={pageTitles[activePage]}
  isLoadingEmails={isLoadingEmails}
  loadEmails={refreshEmails}
  setActivePage={setActivePage}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  clearSearch={clearSearch}
  searchOpen={searchOpen}
  setSearchOpen={setSearchOpen}
  isSearching={isSearching}
  searchError={searchError}
  searchResults={searchResults}
  onOpenSearchResult={openSearchResult}
/>
            )}

            {emailError && (
              <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                {emailError}

                <button
                  onClick={refreshEmails}
                  className="font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {emailSuccess && (
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {emailSuccess}
              </div>
            )}

            {activePage === 'help' && (
              selectedHelpArticleId ? (
                <HelpArticlePage
                  key={selectedHelpArticleId}
                  articleId={selectedHelpArticleId}
                  categoryId={selectedHelpCategoryId}
                  onBack={selectedHelpCategoryId ? backFromHelpArticle : backToHelpHome}
                  onOpenArticle={openHelpArticle}
                  onNavigate={handleActivePageChange}
                />
              ) : selectedHelpCategoryId ? (
                <HelpCategoryPage
                  key={selectedHelpCategoryId}
                  categoryId={selectedHelpCategoryId}
                  onBack={backToHelpHome}
                  onOpenArticle={openHelpArticle}
                  onNavigate={handleActivePageChange}
                />
              ) : (
                <HelpCenterPage
                  onOpenArticle={(articleId) => {
                    setSelectedHelpCategoryId(null)
                    openHelpArticle(articleId)
                  }}
                  onOpenCategory={openHelpCategory}
                  onNavigate={handleActivePageChange}
                />
              )
            )}

            {activePage === 'dashboard' && (
              <Dashboard
                isLoadingEmails={isLoadingEmails}
                totalEmails={totalEmails}
                scheduledEmails={scheduledEmails}
                sentEmails={sentEmails}
                failedEmails={failedEmails}
                emails={filteredEmails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deletingEmailId={deletingEmailId}
                onOpenEmail={openEmailDetail}
              />
            )}

            {['scheduled', 'sent', 'failed'].includes(activePage) && (
              <EmailListPage
                emails={filteredEmails}
                isLoadingEmails={isLoadingEmails}
                pageTitle={pageTitles[activePage]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deletingEmailId={deletingEmailId}
                selectable={activePage === 'sent'}
                selectedEmailIds={activePage === 'sent' ? selectedEmailIds : []}
                onToggleEmail={handleToggleEmail}
                onToggleAll={handleToggleAll}
                onBulkDelete={handleBulkDelete}
                isBulkDeleting={isBulkDeleting}
                onOpenEmail={openEmailDetail}
              />
            )}
          </>
        )}

        {activePage === 'compose' && !selectedEmailId && (
          <>
            <button
              onClick={handleBackFromCompose}
              className="mb-6 text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              ← Back
            </button>

            <ComposePage
  formData={formData}
  handleChange={handleChange}
  handleSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  submitMessage={submitMessage}
  submitSuccess={submitSuccess}
  isEditing={Boolean(editingEmailId)}
/>
          </>
        )}
        {activePage === 'settings' && !selectedEmailId && (
          <SettingsPage callbackMessage={gmailCallbackMessage} />
        )}
      </main>

      <DeleteConfirmationModal
        open={Boolean(deleteModal)}
        count={deleteModal?.count || 1}
        isBulk={deleteModal?.type === 'bulk'}
        isScheduled={
          deleteModal?.type === 'individual' &&
          deleteModal.email?.status === 'SCHEDULED'
        }
        isDeleting={
          deleteModal?.type === 'bulk'
            ? isBulkDeleting
            : Boolean(deletingEmailId)
        }
        onCancel={cancelDeleteModal}
        onConfirm={confirmDeleteModal}
      />
    </div>
  )
}

export default App
