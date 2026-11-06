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
      setMessage(error.message)
      return
    }

    if (mode === 'register' && !data.session) {
      setMessage('Check your inbox and confirm your email before signing in.')
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
        <p role="status" className="flash mt-4">
          {message}
        </p>
      )}
      <p className="muted mt-4">
        {mode === 'register' ? (
          <>
            Already registered? <Link className="link" to="/login">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here? <Link className="link" to="/register">
              Register
            </Link>
          </>
        )}
      </p>
    </section>
  )
}

export default AuthPage
