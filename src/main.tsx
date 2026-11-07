import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import { AuthProvider } from './components/AuthProvider'
import Layout from './components/Layout'
import Protected from './components/Protected'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import QRPage from './pages/QRPage'
import PublicPortfolio from './pages/PublicPortfolio'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/editor" element={<Protected><Editor /></Protected>} />
              <Route path="/qr" element={<Protected><QRPage /></Protected>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/p/:slug" element={<PublicPortfolio />} />
              <Route path="*" element={<p>Page not found.</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  const msg = 'Root element not found. Check index.html markup.'
  console.error(msg)
  document.body.innerHTML = `<div style="color:red;font-family:monospace;padding:20px">${msg}</div>`
} else {
  try {
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    rootElement.innerHTML = `<div style="color:red;font-family:monospace;padding:20px">Failed to initialize StudentFolio. Check console for details.</div>`
  }
}
