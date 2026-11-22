
const API_URL = import.meta.env.VITE_API_URL

export const getEmails = async () => {
  const response = await fetch(`${API_URL}/api/emails`, {
    credentials: 'include',
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load emails.')
  }

  return data.emails || []
}

export const getEmailById = async (id) => {
  const response = await fetch(`${API_URL}/api/emails/${encodeURIComponent(id)}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load email details.')
  }

  return data.email
}

export const searchEmails = async (query, signal) => {
  const params = new URLSearchParams({ q: query })
  const response = await fetch(`${API_URL}/api/emails/search?${params}`, {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to search emails.')
  }

  return data.emails || []
}

export const createEmail = async (emailData) => {
  const response = await fetch(`${API_URL}/api/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(emailData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to schedule email.')
  }

  return data
}

export const updateEmail = async (id, emailData) => {
  const response = await fetch(`${API_URL}/api/emails/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(emailData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update email.')
  }

  return data
}

export const deleteEmail = async (id) => {
  const response = await fetch(`${API_URL}/api/emails/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete email.')
  }

  return data
}

export const bulkDeleteSentEmails = async (ids) => {
  const response = await fetch(`${API_URL}/api/emails/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete selected emails.')
  }

  return data
}
