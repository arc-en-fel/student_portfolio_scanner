import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import { AuthProvider } from './components/AuthProvider'
import Layout from './components/Layout'
import Protected from './components/Protected'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import QRPage from './pages/QRPage'
import PublicPortfolio from './pages/PublicPortfolio'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/editor" element={<Protected><Editor /></Protected>} />
            <Route path="/qr" element={<Protected><QRPage /></Protected>} />
            <Route path="/p/:slug" element={<PublicPortfolio />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
