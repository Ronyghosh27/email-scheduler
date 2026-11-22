import { useEffect, useState } from 'react'
import { Eye, EyeOff, Mail, LockKeyhole, ArrowLeft, LoaderCircle } from 'lucide-react'
import {
  forgotPassword,
  loginWithGoogle,
  loginWithPassword,
  registerWithPassword,
  resetPassword,
} from '../services/authService'

function LoginPage() {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetData, setResetData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const resetToken = params.get('resetPassword')

    if (resetToken) {
      setMode('reset')
      setResetData((current) => ({ ...current, token: resetToken }))
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const clearStatus = () => {
    setMessage('')
    setError('')
  }

  const changeMode = (nextMode) => {
    clearStatus()
    setMode(nextMode)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    clearStatus()

    if (!loginData.email.trim() || !loginData.password) {
      setError('Email and password are required.')
      return
    }

    setIsSubmitting(true)
    try {
      await loginWithPassword(loginData)
      window.location.reload()
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    clearStatus()

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!registerData.name.trim()) {
      setError('Full name is required.')
      return
    }
    if (!emailPattern.test(registerData.email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    if (
      registerData.password.length < 8 ||
      registerData.password.length > 128 ||
      !/[A-Za-z]/.test(registerData.password) ||
      !/\d/.test(registerData.password)
    ) {
      setError('Password must be 8-128 characters and include a letter and number.')
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await registerWithPassword(registerData)
      setMessage(data.message)
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (registrationError) {
      setError(registrationError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (event) => {
    event.preventDefault()
    clearStatus()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setError('Enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await forgotPassword(forgotEmail)
      setMessage(data.message)
    } catch (forgotError) {
      setError(forgotError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    clearStatus()

    if (
      resetData.password.length < 8 ||
      resetData.password.length > 128 ||
      !/[A-Za-z]/.test(resetData.password) ||
      !/\d/.test(resetData.password)
    ) {
      setError('Password must be 8-128 characters and include a letter and number.')
      return
    }
    if (resetData.password !== resetData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await resetPassword(resetData)
      setMessage(data.message)
      setResetData({ token: '', password: '', confirmPassword: '' })
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordIcon = (
    <LockKeyhole
      size={18}
      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
    />
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Mail size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            {mode === 'register'
              ? 'Create your account'
              : mode === 'forgot'
                ? 'Forgot password'
                : mode === 'reset'
                  ? 'Reset password'
                    : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'register'
              ? 'Create a separate MailFlow account password.'
              : mode === 'forgot'
                ? 'Enter your registered email address.'
                : mode === 'reset'
                  ? 'Choose a new MailFlow account password.'
                    : 'Sign in to manage and schedule your emails.'}
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {mode === 'login' && (
          <>
            <form onSubmit={handleLogin} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <div className="relative mt-2">
                  <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <div className="relative mt-2">
                  {passwordIcon}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(event) => setLoginData((current) => ({ ...current, rememberMe: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                  />
                  Remember me
                </label>
                <button type="button" onClick={() => changeMode('forgot')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Continue with Google
            </button>

            <p className="mt-7 text-center text-sm text-slate-500">
              New to MailFlow?{' '}
              <button type="button" onClick={() => changeMode('register')} className="font-semibold text-indigo-600 hover:text-indigo-700">
                Create an account
              </button>
            </p>
          </>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            {[
              ['name', 'Full name', 'text', 'Alex Morgan'],
              ['email', 'Email address', 'email', 'you@example.com'],
              ['password', 'Password', 'password', 'At least 8 characters'],
              ['confirmPassword', 'Confirm password', 'password', 'Repeat your password'],
            ].map(([field, label, type, placeholder]) => (
              <label key={field} className="block text-sm font-semibold text-slate-700">
                {label}
                <div className="relative mt-2">
                  {(field === 'password' || field === 'confirmPassword') ? passwordIcon : <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
                  <input
                    type={type === 'password'
                      ? (field === 'password'
                        ? (showPassword ? 'text' : 'password')
                        : (showConfirmPassword ? 'text' : 'password'))
                      : type}
                    value={registerData[field]}
                    onChange={(event) => setRegisterData((current) => ({ ...current, [field]: event.target.value }))}
                    autoComplete={field === 'email' ? 'email' : field === 'password' || field === 'confirmPassword' ? 'new-password' : 'name'}
                    placeholder={placeholder}
                    className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-11 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                  {(field === 'password' || field === 'confirmPassword') && (
                    <button
                      type="button"
                      onClick={() => field === 'password'
                        ? setShowPassword((shown) => !shown)
                        : setShowConfirmPassword((shown) => !shown)}
                      aria-label={(field === 'password' ? showPassword : showConfirmPassword) ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {(field === 'password' ? showPassword : showConfirmPassword) ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </label>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={() => changeMode('login')} className="font-semibold text-indigo-600 hover:text-indigo-700">
                Login
              </button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
            <button type="button" onClick={() => changeMode('login')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600">
              <ArrowLeft size={16} />
              Back to login
            </button>
            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <div className="relative mt-2">
                <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
              Request reset
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            {[
              ['password', 'New password'],
              ['confirmPassword', 'Confirm new password'],
            ].map(([field, label]) => (
              <label key={field} className="block text-sm font-semibold text-slate-700">
                {label}
                <div className="relative mt-2">
                  {passwordIcon}
                  <input
                    type={field === 'password'
                      ? (showPassword ? 'text' : 'password')
                      : (showConfirmPassword ? 'text' : 'password')}
                    value={resetData[field]}
                    onChange={(event) => setResetData((current) => ({ ...current, [field]: event.target.value }))}
                    autoComplete="new-password"
                    placeholder="Enter a new password"
                    className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-11 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => field === 'password'
                      ? setShowPassword((shown) => !shown)
                      : setShowConfirmPassword((shown) => !shown)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {(field === 'password' ? showPassword : showConfirmPassword) ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
              Reset password
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

export default LoginPage
