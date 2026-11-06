import { FC, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { publicUrl } from '../lib/portfolio'
import { useAuth } from '../components/AuthProvider'
import { Zap, Edit3, Eye, Share2, Settings, QrCode } from 'lucide-react'

interface ProfileData {
  id: string
  user_id: string
  full_name: string
  is_published: boolean
  slug: string
}

interface StatCard {
  label: string
  value: number | string
  icon: React.ReactNode
}

const Dashboard: FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [message, setMessage] = useState<string>('')
  const [busy, setBusy] = useState<boolean>(false)
  const [projects, setProjects] = useState<number>(0)
  const [certifications, setCertifications] = useState<number>(0)
  const [completion, setCompletion] = useState<number>(0)

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

    // Fetch project count
    supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('profile_id', user.id)
      .then(({ count }) => setProjects(count || 0))

    // Fetch certification count
    supabase
      .from('achievements')
      .select('id', { count: 'exact' })
      .eq('profile_id', user.id)
      .then(({ count }) => setCertifications(count || 0))

    // Calculate profile completion
    calculateCompletion(user.id)
  }, [user])

  const calculateCompletion = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('fullName, headline, profileImage, bio, city, country')
      .eq('id', userId)
      .single()

    const { count: eduCount } = await supabase
      .from('education')
      .select('id', { count: 'exact' })
      .eq('profile_id', userId)

    const { count: skillCount } = await supabase
      .from('skills')
      .select('id', { count: 'exact' })
      .eq('profile_id', userId)

    // Calculate completion percentage
    let completed = 0
    const total = 10

    if (profile?.fullName) completed++
    if (profile?.headline) completed++
    if (profile?.profileImage) completed++
    if (profile?.bio) completed++
    if (profile?.city) completed++
    if (profile?.country) completed++
    if (projects > 0) completed++
    if (certifications > 0) completed++
    if (eduCount && eduCount > 0) completed++
    if (skillCount && skillCount > 0) completed++

    setCompletion(Math.round((completed / total) * 100))
  }

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

  const stats: StatCard[] = [
    {
      label: 'Projects',
      value: projects,
      icon: <Zap className="w-5 h-5 text-teal-400" />,
    },
    {
      label: 'Certifications',
      value: certifications,
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      label: 'Completion',
      value: `${completion}%`,
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
    },
  ]

  return (
    <div className="max-w-6xl mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="muted mt-1">Welcome, {user?.email}</p>
      </div>

      {message && <p className="flash mt-4">{message}</p>}

      {profile && (
        <>
          {/* Welcome Panel & Profile Completion */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="panel">
              <h2 className="mini-title">{profile.full_name || 'Your Portfolio'}</h2>
              <p className="muted mt-2">
                Status:{' '}
                <span
                  className={`font-semibold ${
                    profile.is_published ? 'text-teal-300' : 'text-amber-300'
                  }`}
                >
                  {profile.is_published ? 'Published' : 'Draft'}
                </span>
              </p>
              <p className="muted mt-1">Build your professional online presence.</p>
              {profile.is_published && (
                <a
                  className="link block mt-4 break-all text-sm"
                  href={publicUrl(profile.slug)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {publicUrl(profile.slug)}
                </a>
              )}
            </div>

            <div className="panel">
              <h3 className="font-semibold text-sm mb-2">Profile Completion</h3>
              <div className="mb-2 h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="muted text-sm">{completion}% Complete</p>
              <p className="muted text-xs mt-2">
                {completion < 100
                  ? 'Complete your profile to unlock publishing'
                  : 'All sections complete!'}
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="panel flex items-start gap-3">
                <div className="p-2 bg-surface rounded-lg">{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="muted text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="mb-8">
            <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <button
                className="panel text-left hover:bg-surface transition-colors p-4 flex items-center gap-3 group"
                onClick={() => navigate('/editor')}
              >
                <Edit3 className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-sm">Edit Portfolio</p>
                  <p className="muted text-xs">Update your information</p>
                </div>
              </button>

              <button
                className="panel text-left hover:bg-surface transition-colors p-4 flex items-center gap-3 group"
                disabled={completion < 100}
                onClick={() => navigate('/qr')}
              >
                <QrCode className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-sm">View QR Code</p>
                  <p className="muted text-xs">Generate & download</p>
                </div>
              </button>

              <button
                className="panel text-left hover:bg-surface transition-colors p-4 flex items-center gap-3 group"
                disabled={busy}
                onClick={toggle}
              >
                <Share2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-sm">
                    {busy ? 'Saving…' : profile.is_published ? 'Unpublish' : 'Publish'}
                  </p>
                  <p className="muted text-xs">
                    {profile.is_published ? 'Make private' : 'Go public'}
                  </p>
                </div>
              </button>

              {profile.is_published && (
                <a
                  href={publicUrl(profile.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="panel text-left hover:bg-surface transition-colors p-4 flex items-center gap-3 group"
                >
                  <Eye className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium text-sm">View Profile</p>
                    <p className="muted text-xs">See your portfolio</p>
                  </div>
                </a>
              )}

              <Link
                to="/settings"
                className="panel text-left hover:bg-surface transition-colors p-4 flex items-center gap-3 group"
              >
                <Settings className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-sm">Settings</p>
                  <p className="muted text-xs">Account & preferences</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
