import { FC, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthProvider'

interface AuthPageProps {
  mode: 'login' | 'register'
}

const AuthPage: FC<AuthPageProps> = ({ mode }) => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'info' | 'error'>('info')
  const [busy, setBusy] = useState<boolean>(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setMessage('')

    const result = mode === 'register'
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    const { data, error } = result
    setBusy(false)

    if (error) {
      setMessageType('error')
      setMessage(error.message)
      return
    }

    if (mode === 'register' && !data.session) {
      setMessageType('info')
      setMessage('Check your email to verify your account. Then you can log in.')
      setEmail('')
      setPassword('')
      return
    }

    navigate('/dashboard')
  }

  return (
    <section className="max-w-md mx-auto mt-12 panel">
      <h1 className="mini-title">
        {mode === 'register' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="muted mt-2">
        {mode === 'register'
          ? 'Start building your public portfolio.'
          : 'Log in to manage your portfolio.'}
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
        <label className="field">
          Password
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />
        </label>
        <button disabled={busy} className="btn">
          {busy ? 'Please wait…' : mode === 'register' ? 'Register' : 'Log in'}
        </button>
      </form>
      {message && (
        <p role="status" className={`flash mt-4 ${messageType === 'error' ? 'text-red-400' : ''}`}>
          {message}
        </p>
      )}
      <div className="muted mt-4 text-sm space-y-2">
        {mode === 'register' ? (
          <>
            <p>
              Already registered? <Link className="link" to="/login">
                Log in
              </Link>
            </p>
          </>
        ) : (
          <>
            <p>
              New here? <Link className="link" to="/register">
                Register
              </Link>
            </p>
            <p>
              Forgot password? <Link className="link" to="/forgot-password">
                Reset it
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  )
}

export default AuthPage
