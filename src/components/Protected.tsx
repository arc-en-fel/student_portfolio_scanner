import { FC, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthProvider'

interface ProtectedProps {
  children: ReactNode
}

const Protected: FC<ProtectedProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) return <p className="muted">Checking session…</p>
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />

  return <>{children}</>
}

export default Protected
