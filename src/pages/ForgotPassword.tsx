import { FC, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthProvider'

const ForgotPassword: FC = () => {
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'info' | 'error'>('info')
  const [busy, setBusy] = useState<boolean>(false)
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setBusy(false)

    if (error) {
      setMessageType('error')
      setMessage(error.message)
      return
    }

    setMessageType('info')
    setMessage('Check your email for a password reset link. It will expire in 24 hours.')
    setEmail('')
  }

  return (
    <section className="max-w-md mx-auto mt-12 panel">
      <h1 className="mini-title">Reset your password</h1>
      <p className="muted mt-2">
        Enter the email address associated with your account, and we'll send you a link to reset
        your password.
      </p>
      <form onSubmit={submit} className="grid gap-4 mt-6">
        <label className="field">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <button disabled={busy} className="btn">
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      {message && (
        <p role="status" className={`flash mt-4 ${messageType === 'error' ? 'text-red-400' : ''}`}>
          {message}
        </p>
      )}
      <p className="muted mt-4 text-sm">
        Remember your password? <Link className="link" to="/login">
          Log in
        </Link>
      </p>
    </section>
  )
}

export default ForgotPassword
