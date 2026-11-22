
import { useEffect, useState } from 'react'
import {
  Mail,
  CheckCircle,
  Link2,
  AlertCircle,
  Unlink,
} from 'lucide-react'

import {
  connectGmail,
  getGmailStatus,
  disconnectGmail,
} from '../services/authService'

function SettingsPage({ callbackMessage }) {
  const [gmailStatus, setGmailStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadGmailStatus = async () => {
    try {
      setError('')
      const data = await getGmailStatus()
      setGmailStatus(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGmailStatus()
  }, [])

  const handleDisconnectGmail = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to disconnect your Gmail account?'
    )

    if (!confirmed) return

    try {
      setIsDisconnecting(true)
      setError('')
      setMessage('')

      const data = await disconnectGmail()

      setGmailStatus({
        isConnected: false,
        gmailEmail: null,
        connectedAt: null,
      })

      setMessage(data.message)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Account Settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and email integrations.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <Mail size={24} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Gmail Integration
            </h3>

            <p className="text-sm text-slate-500">
              Connect Gmail to send scheduled emails.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">

          {isLoading && (
            <p className="text-sm text-slate-500">
              Checking Gmail connection...
            </p>
          )}

          {!isLoading && error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {!isLoading && !error && gmailStatus?.isConnected && (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <CheckCircle size={18} />
                Gmail connected
              </div>

              <p className="mt-2 text-sm text-slate-600">
                {gmailStatus.gmailEmail}
              </p>
            </>
          )}

          {!isLoading && !error && !gmailStatus?.isConnected && (
            <p className="text-sm text-slate-600">
              Gmail is not connected yet.
            </p>
          )}

        </div>
{callbackMessage && (
  <p className="mt-4 text-sm font-medium text-emerald-600">
    {callbackMessage}
  </p>
)}
        {message && (
          <p className="mt-4 text-sm font-medium text-emerald-600">
            {message}
          </p>
        )}

        {!isLoading && !error && !gmailStatus?.isConnected && (
          <button
            onClick={connectGmail}
            className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Link2 size={18} />
            Connect Gmail
          </button>
        )}

        {!isLoading && !error && gmailStatus?.isConnected && (
          <button
            onClick={handleDisconnectGmail}
            disabled={isDisconnecting}
            className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Unlink size={18} />
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect Gmail'}
          </button>
        )}

      </div>

    </div>
  )
}

export default SettingsPage
