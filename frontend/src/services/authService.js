
const API_URL = import.meta.env.VITE_API_URL

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to check authentication status.')
  }

  return response.json()
}

export const logoutUser = () => {
  window.location.href = `${API_URL}/auth/logout`
}

export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/google`
}

export const registerWithPassword = async ({ name, email, password, confirmPassword }) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, confirmPassword }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create account.')
  }

  return data
}

export const loginWithPassword = async ({ email, password, rememberMe }) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, rememberMe }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to sign in.')
  }

  return data
}

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to process password reset.')
  }

  return data
}

export const resetPassword = async ({ token, password, confirmPassword }) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ token, password, confirmPassword }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reset password.')
  }

  return data
}


export const connectGmail = () => {
  window.location.href = `${API_URL}/auth/gmail/connect`
}
export const getGmailStatus = async () => {
  const response = await fetch(`${API_URL}/auth/gmail/status`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to check Gmail connection status.')
  }

  return response.json()
}
export const disconnectGmail = async () => {
  const response = await fetch(`${API_URL}/auth/gmail/disconnect`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to disconnect Gmail.')
  }

  return data
}