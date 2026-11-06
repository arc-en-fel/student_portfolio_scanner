import { FC } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

const Layout: FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      <header className="border-b border-slate-800">
        <nav className="shell flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-xl font-extrabold text-teal-300">
            StudentFolio
          </Link>
          <div className="flex flex-wrap items-center gap-5 text-sm">
            {user ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/editor">Editor</NavLink>
                <NavLink to="/qr">QR Code</NavLink>
                <button onClick={signOut} className="btn-secondary">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register" className="btn">
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="shell">
        <Outlet />
      </main>
      <footer className="shell mt-16 text-sm muted">
        StudentFolio · Publish what you choose to share publicly.
      </footer>
    </>
  )
}

export default Layout
