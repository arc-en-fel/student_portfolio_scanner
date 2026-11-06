import { FC, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { AlertCircle } from 'lucide-react'

const Settings: FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [passwordMessage, setPasswordMessage] = useState<string>('')
  const [passwordMessageType, setPasswordMessageType] = useState<'info' | 'error'>('info')
  const [passwordBusy, setPasswordBusy] = useState<boolean>(false)

  // Account deletion state
  const [deleteEmail, setDeleteEmail] = useState<string>('')
  const [deleteMessage, setDeleteMessage] = useState<string>('')
  const [deleteMessageType, setDeleteMessageType] = useState<'info' | 'error'>('info')
  const [deleteBusy, setDeleteBusy] = useState<boolean>(false)
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false)

  // Account info
  const [createdAt] = useState<string>(
    user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
  )

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordMessageType('error')
      setPasswordMessage('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessageType('error')
      setPasswordMessage('Password must be at least 8 characters')
      return
    }

    setPasswordBusy(true)

    // Supabase requires re-authentication for password change
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPassword,
    })

    if (authError) {
      setPasswordBusy(false)
      setPasswordMessageType('error')
      setPasswordMessage('Current password is incorrect')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setPasswordBusy(false)

    if (updateError) {
      setPasswordMessageType('error')
      setPasswordMessage(updateError.message)
      return
    }

    setPasswordMessageType('info')
    setPasswordMessage('Password changed successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const deleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDeleteMessage('')

    if (deleteEmail !== user?.email) {
      setDeleteMessageType('error')
      setDeleteMessage('Email does not match. Please try again.')
      return
    }

    setDeleteBusy(true)

    // Delete user profile data first
    await supabase.from('profiles').delete().eq('id', user!.id)

    // Delete authentication user
    const { error } = await supabase.auth.admin.deleteUser(user!.id)

    setDeleteBusy(false)

    if (error) {
      setDeleteMessageType('error')
      setDeleteMessage(error.message)
      return
    }

    setDeleteMessageType('info')
    setDeleteMessage('Account deleted successfully. Redirecting...')

    // Log out and redirect
    setTimeout(() => {
      logout()
      navigate('/')
    }, 1500)
  }

  return (
    <div className="max-w-3xl mt-8">
      <h1 className="text-3xl font-bold">Account Settings</h1>
      <p className="muted mt-1">Manage your account and preferences</p>

      {/* Account Information */}
      <section className="panel mt-8">
        <h2 className="mini-title">Account Information</h2>
        <div className="grid gap-4 mt-4">
          <div>
            <p className="text-sm muted">Email Address</p>
            <p className="font-mono text-sm mt-1">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm muted">Account Created</p>
            <p className="text-sm mt-1">{createdAt}</p>
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="panel mt-8">
        <h2 className="mini-title">Change Password</h2>
        <form onSubmit={changePassword} className="grid gap-4 mt-4">
          <label className="field">
            Current Password
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label className="field">
            New Password
            <input
              required
              minLength={8}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            Confirm New Password
            <input
              required
              minLength={8}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <button disabled={passwordBusy} className="btn">
            {passwordBusy ? 'Updating…' : 'Update Password'}
          </button>
        </form>
        {passwordMessage && (
          <p
            role="status"
            className={`flash mt-4 ${passwordMessageType === 'error' ? 'text-red-400' : 'text-green-400'}`}
          >
            {passwordMessage}
          </p>
        )}
      </section>

      {/* Danger Zone - Delete Account */}
      <section className="panel mt-8 border border-red-900 bg-red-950/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="mini-title text-red-300">Danger Zone</h2>
            <p className="muted mt-2">
              Deleting your account is permanent and cannot be undone. All your portfolio data will
              be deleted.
            </p>

            {!confirmingDelete ? (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="btn mt-4 bg-red-900 hover:bg-red-800 text-red-100"
              >
                Delete Account
              </button>
            ) : (
              <form onSubmit={deleteAccount} className="grid gap-4 mt-4">
                <div className="bg-surface/50 p-3 rounded-lg border border-red-800">
                  <p className="text-sm muted">
                    To confirm deletion, type your email address exactly as it appears below:
                  </p>
                  <p className="font-mono text-sm mt-2">{user?.email}</p>
                </div>
                <label className="field">
                  <input
                    required
                    type="email"
                    placeholder="Confirm your email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingDelete(false)
                      setDeleteEmail('')
                      setDeleteMessage('')
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteBusy || deleteEmail !== user?.email}
                    className="btn flex-1 bg-red-900 hover:bg-red-800 text-red-100 disabled:opacity-50"
                  >
                    {deleteBusy ? 'Deleting…' : 'Delete Account'}
                  </button>
                </div>
              </form>
            )}

            {deleteMessage && (
              <p
                role="status"
                className={`flash mt-4 ${deleteMessageType === 'error' ? 'text-red-400' : 'text-green-400'}`}
              >
                {deleteMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Settings
