import { FC } from 'react'
import { Profile } from '../../types'

interface CreativeTemplateProps {
  profile: Profile
  accentColor?: string
}

export const CreativeTemplate: FC<CreativeTemplateProps> = ({ profile, accentColor = '#4FD1C5' }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero with Gradient Background */}
      <div
        className="relative h-96 flex items-end justify-start p-12 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor}40 0%, ${accentColor}10 100%), linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95))`,
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-end gap-6">
            {profile.profileImageUrl && (
              <img
                src={profile.profileImageUrl}
                alt={profile.fullName}
                className="w-40 h-40 rounded-2xl object-cover border-4"
                style={{ borderColor: accentColor }}
              />
            )}
            <div>
              <h1 className="text-6xl font-black mb-2">{profile.fullName}</h1>
              {profile.headline && (
                <p className="text-3xl font-bold mb-2" style={{ color: accentColor }}>
                  {profile.headline}
                </p>
              )}
              {profile.city && (
                <p className="text-slate-300">{profile.city}, {profile.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-20">
        {/* About */}
        {profile.bio && (
          <section className="mb-20">
            <h2
              className="text-5xl font-black mb-8"
              style={{ color: accentColor }}
            >
              About
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
              {profile.bio}
            </p>
          </section>
        )}

        {/* Projects in Masonry Grid */}
        {profile.projects && profile.projects.length > 0 && (
          <section className="mb-20">
            <h2
              className="text-5xl font-black mb-12"
              style={{ color: accentColor }}
            >
              Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
              {profile.projects.filter(p => p.featured).slice(0, 6).map((project, idx) => (
                <div
                  key={idx}
                  className="group rounded-xl overflow-hidden bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer transform hover:scale-105"
                  style={{
                    gridRow: idx % 2 === 0 ? 'span 2' : 'span 1',
                  }}
                >
                  {project.imageUrl && (
                    <div className="relative h-64 md:h-96 overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${accentColor}80 0%, ${accentColor}40 100%)` }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    {project.tech_stack && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech_stack.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                            style={{
                              background: `${accentColor}20`,
                              color: accentColor,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block font-bold text-sm hover:opacity-80"
                        style={{ color: accentColor }}
                      >
                        Visit Live →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Bento Grid */}
        {profile.skills && profile.skills.length > 0 && (
          <section className="mb-20">
            <h2
              className="text-5xl font-black mb-12"
              style={{ color: accentColor }}
            >
              Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.skills.slice(0, 12).map((skill, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl font-bold text-center text-lg hover:scale-105 transition-transform cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}30 0%, ${accentColor}10 100%)`,
                    border: `2px solid ${accentColor}50`,
                    color: accentColor,
                  }}
                >
                  {skill.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience Timeline */}
        {profile.experience && profile.experience.length > 0 && (
          <section className="mb-20">
            <h2
              className="text-5xl font-black mb-12"
              style={{ color: accentColor }}
            >
              Experience
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 hidden md:block"
                style={{ background: accentColor }}
              />

              <div className="space-y-8">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="md:pl-8">
                    {/* Timeline Dot */}
                    <div
                      className="absolute left-0 top-0 w-5 h-5 rounded-full hidden md:block transform -translate-x-2"
                      style={{ background: accentColor }}
                    />

                    <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition-colors">
                      <h3 className="text-2xl font-bold mb-1">{exp.job_title}</h3>
                      <p style={{ color: accentColor }} className="font-semibold mb-2">
                        {exp.company}
                      </p>
                      <p className="text-sm text-slate-400 mb-3">
                        {new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -
                        {exp.is_current_role ? ' Present' : ` ${new Date(exp.end_date!).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                      </p>
                      {exp.description && (
                        <p className="text-slate-300">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <section className="mb-20">
            <h2
              className="text-5xl font-black mb-12"
              style={{ color: accentColor }}
            >
              Education
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}05 100%)`,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  <h3 className="text-xl font-bold mb-1">{edu.degree}</h3>
                  <p style={{ color: accentColor }} className="font-semibold mb-2">
                    {edu.institution}
                  </p>
                  <p className="text-slate-400">
                    {edu.start_year} - {edu.end_year}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
