import { FC } from 'react'
import { Profile } from '../../types'

interface MinimalTemplateProps {
  profile: Profile
  accentColor?: string
}

export const MinimalTemplate: FC<MinimalTemplateProps> = ({ profile, accentColor = '#4FD1C5' }) => {
  return (
    <div style={{ '--accent-color': accentColor } as React.CSSProperties}
      className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="mb-16 text-center">
          {profile.profileImageUrl && (
            <img
              src={profile.profileImageUrl}
              alt={profile.fullName}
              className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4"
              style={{ borderColor: accentColor }}
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{profile.fullName}</h1>
          {profile.headline && (
            <p className="text-xl mb-4" style={{ color: accentColor }}>
              {profile.headline}
            </p>
          )}
          {profile.city && profile.country && (
            <p className="text-slate-600">{profile.city}, {profile.country}</p>
          )}
        </div>

        {/* About */}
        {profile.bio && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
              About
            </h2>
            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
          </section>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
              Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.skills.map((skill, idx) => (
                <div key={idx} className="p-3 bg-slate-100 rounded-lg">
                  <p className="font-semibold text-sm">{skill.name}</p>
                  <p className="text-xs text-slate-600">{skill.category}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {profile.experience && profile.experience.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
              Experience
            </h2>
            <div className="space-y-6">
              {profile.experience.map((exp, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-lg">{exp.job_title}</h3>
                  <p style={{ color: accentColor }}>{exp.company}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -
                    {exp.is_current_role ? ' Present' : ` ${new Date(exp.end_date!).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                  </p>
                  {exp.description && <p className="mt-2 text-slate-700">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
              Education
            </h2>
            <div className="space-y-4">
              {profile.education.map((edu, idx) => (
                <div key={idx}>
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p style={{ color: accentColor }}>{edu.institution}</p>
                  <p className="text-sm text-slate-600">{edu.start_year} - {edu.end_year}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {profile.projects && profile.projects.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
              Projects
            </h2>
            <div className="space-y-6">
              {profile.projects.filter(p => p.featured).slice(0, 5).map((project, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-lg">{project.title}</h3>
                  <p className="text-slate-700">{project.description}</p>
                  {project.tech_stack && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.tech_stack.map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-slate-200 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" style={{ borderColor: accentColor }}>
              Certifications
            </h2>
            <ul className="space-y-2">
              {profile.certifications.map((cert, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-3" style={{ color: accentColor }}>✓</span>
                  <div>
                    <p className="font-semibold">{cert.title}</p>
                    <p className="text-sm text-slate-600">{cert.issuer}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
