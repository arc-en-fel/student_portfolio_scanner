import { FC, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import { publicUrl } from '../lib/portfolio'
import { useAuth } from '../components/AuthProvider'

interface ProfileData {
  id: string
  full_name: string
  is_published: boolean
  slug: string
}

const Dashboard: FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [message, setMessage] = useState<string>('')
  const [busy, setBusy] = useState<boolean>(false)

  useEffect(() => {
    if (!user) return

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        setProfile(data)
        if (error) setMessage(error.message)
      })
  }, [user])

  const toggle = async () => {
    if (!profile) return
    setBusy(true)
    setMessage('')

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_published: !profile.is_published })
      .eq('id', user!.id)
      .select()
      .single()

    setBusy(false)

    if (error) {
      setMessage(error.message)
    } else {
      setProfile(data)
    }
  }

  return (
    <div className="max-w-3xl mt-8">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <p className="muted mt-1">Signed in as {user?.email}</p>
      {message && <p className="flash mt-4">{message}</p>}
      {profile && (
        <div className="panel mt-7">
          <h2 className="mini-title">{profile.full_name || 'Your portfolio'}</h2>
          <p className="muted mt-2">
            Status:{' '}
            <strong className={profile.is_published ? 'text-teal-300' : 'text-amber-300'}>
              {profile.is_published ? 'Published' : 'Draft'}
            </strong>
          </p>
          <p className="muted mt-1">Complete your profile before publishing.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/editor" className="btn">
              Edit portfolio
            </Link>
            <button disabled={busy} className="btn-secondary" onClick={toggle}>
              {busy ? 'Saving…' : profile.is_published ? 'Unpublish' : 'Publish portfolio'}
            </button>
            <Link to="/qr" className="btn-secondary">
              View QR
            </Link>
          </div>
          {profile.is_published && (
            <a
              className="link block mt-5 break-all"
              href={publicUrl(profile.slug)}
              target="_blank"
              rel="noreferrer"
            >
              {publicUrl(profile.slug)}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
