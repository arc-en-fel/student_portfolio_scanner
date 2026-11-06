import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { safeExternalUrl } from '../lib/portfolio'

interface ExternalProps {
  url: string | null | undefined
  children: React.ReactNode
}

function External({ url, children }: ExternalProps) {
  const safe = safeExternalUrl(url)
  return safe ? (
    <a className="link break-all" href={safe} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : null
}

interface ProfileData {
  id: string
  full_name?: string
  headline?: string
  course?: string
  college?: string
  location?: string
  bio?: string
  github_url?: string
  linkedin_url?: string
  website_url?: string
  resume_url?: string
  skills?: string
  avatar_path?: string
}

interface GroupsData {
  projects: any[]
  education: any[]
  certifications: any[]
}

const PublicPortfolio: FC = () => {
  const { slug } = useParams()
  const [p, setP] = useState<ProfileData | null>(null)
  const [groups, setGroups] = useState<GroupsData | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let active = true

    ;(async () => {
      setError('')
      setP(null)
      setGroups(null)

      const { data, error: e } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (!active) return

      if (e || !data) {
        setError('This portfolio is not published or does not exist.')
        return
      }

      setP(data)

      const [projects, education, certifications] = await Promise.all(
        ['projects', 'education', 'certifications'].map((t) =>
          supabase
            .from(t)
            .select('*')
            .eq('profile_id', data.id)
            .order('created_at', { ascending: true })
        )
      )

      if (!active) return

      if ([projects, education, certifications].some((x) => x.error)) {
        setError('Some portfolio sections could not be loaded.')
      }

      setGroups({
        projects: projects.data || [],
        education: education.data || [],
        certifications: certifications.data || [],
      })
    })().catch(() => {
      if (active) setError('Could not load the portfolio.')
    })

    return () => {
      active = false
    }
  }, [slug])

  const avatarUrl = p?.avatar_path
    ? supabase.storage.from('avatars').getPublicUrl(p.avatar_path).data.publicUrl
    : null

  return (
    <article className="max-w-4xl mx-auto mt-10">
      {error && <p className="flash">{error}</p>}
      {p && (
        <>
          <div className="panel">
            <div className="flex gap-5 flex-wrap items-center">
              {avatarUrl && (
                <img src={avatarUrl} alt="Profile" className="w-28 h-28 object-cover rounded-full" />
              )}
              <div>
                <h1 className="text-4xl font-bold">{p.full_name || 'Student portfolio'}</h1>
                <p className="text-teal-300 mt-2">{p.headline}</p>
                <p className="muted">
                  {[p.course, p.college, p.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            {p.bio && <p className="mt-6 whitespace-pre-line">{p.bio}</p>}
            <div className="flex flex-wrap gap-4 mt-5">
              <External url={p.github_url}>GitHub</External>
              <External url={p.linkedin_url}>LinkedIn</External>
              <External url={p.website_url}>Website</External>
              <External url={p.resume_url}>Resume</External>
            </div>
            {p.skills && (
              <div className="mt-6">
                <h2 className="font-semibold">Skills</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  {p.skills
                    .split(',')
                    .filter(Boolean)
                    .map((s, i) => (
                      <span key={i} className="border border-teal-700 rounded-full px-3 py-1 text-sm">
                        {s.trim()}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {groups && (
            <>
              {groups.projects.length > 0 && (
                <section className="panel mt-5">
                  <h2 className="mini-title mb-4">Projects</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {groups.projects.map((x) => (
                      <div key={x.id} className="border border-slate-700 rounded-xl p-4">
                        <h3 className="font-bold text-lg">{x.title}</h3>
                        <p className="muted mt-2 whitespace-pre-line">{x.description}</p>
                        <p className="text-sm text-teal-300 mt-2">{x.tech_stack}</p>
                        <div className="mt-3">
                          <External url={x.project_url}>See project</External>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {groups.education.length > 0 && (
                <section className="panel mt-5">
                  <h2 className="mini-title mb-4">Education</h2>
                  {groups.education.map((x) => (
                    <p key={x.id} className="py-2">
                      <strong>{x.degree}</strong> — {x.institution}{' '}
                      <span className="muted">
                        {x.start_year || ''} {x.end_year ? `– ${x.end_year}` : ''}
                      </span>
                    </p>
                  ))}
                </section>
              )}

              {groups.certifications.length > 0 && (
                <section className="panel mt-5">
                  <h2 className="mini-title mb-4">Certifications</h2>
                  {groups.certifications.map((x) => (
                    <p key={x.id} className="py-2">
                      <strong>{x.title}</strong> — {x.issuer}{' '}
                      <External url={x.credential_url}>View credential</External>
                    </p>
                  ))}
                </section>
              )}
            </>
          )}
        </>
      )}
    </article>
  )
}

export default PublicPortfolio
