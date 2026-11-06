import { FC } from 'react'
import { Profile } from '../../types'
import { Github, Linkedin, Twitter, Mail, Globe } from 'lucide-react'

interface ModernTemplateProps {
  profile: Profile
  accentColor?: string
}

export const ModernTemplate: FC<ModernTemplateProps> = ({ profile, accentColor = '#4FD1C5' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      {/* Hero Section */}
      <div
        className="relative py-24 px-4 text-center text-white"
        style={{
          background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}05 100%)`,
        }}
      >
        {profile.profileImageUrl && (
          <img
            src={profile.profileImageUrl}
            alt={profile.fullName}
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4"
            style={{ borderColor: accentColor }}
          />
        )}
        <h1 className="text-5xl font-bold mb-2">{profile.fullName}</h1>
        {profile.headline && (
          <p className="text-2xl mb-4" style={{ color: accentColor }}>
            {profile.headline}
          </p>
        )}
        {profile.city && (
          <p className="text-slate-400 text-lg">{profile.city}, {profile.country}</p>
        )}

        {/* Social Links */}
        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            {profile.socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                {link.platform === 'github' && <Github size={24} />}
                {link.platform === 'linkedin' && <Linkedin size={24} />}
                {link.platform === 'twitter' && <Twitter size={24} />}
                {link.platform === 'personal_website' && <Globe size={24} />}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            {/* Contact */}
            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: accentColor }}>
                Contact
              </h3>
              {profile.professionalEmail && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  <Mail size={16} style={{ color: accentColor }} />
                  <a href={`mailto:${profile.professionalEmail}`} className="hover:text-teal-400">
                    {profile.professionalEmail}
                  </a>
                </div>
              )}
            </div>

            {/* Skills by Category */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4" style={{ color: accentColor }}>
                  Skills
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    profile.skills.reduce((acc, skill) => {
                      if (!acc[skill.category]) acc[skill.category] = []
                      acc[skill.category].push(skill)
                      return acc
                    }, {} as Record<string, typeof profile.skills>)
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: `${accentColor}20`,
                              color: accentColor,
                              border: `1px solid ${accentColor}40`,
                            }}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="md:col-span-2 space-y-12">
            {/* About */}
            {profile.bio && (
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ color: accentColor }}>
                  About
                </h2>
                <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
              </section>
            )}

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ color: accentColor }}>
                  Experience
                </h2>
                <div className="space-y-6">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-slate-700 pl-4 pb-4">
                      <h3 className="text-xl font-bold">{exp.jobTitle}</h3>
                      <p style={{ color: accentColor }} className="font-semibold">
                        {exp.company}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -
                        {exp.isCurrentRole ? ' Present' : ` ${new Date(exp.endDate!).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                      </p>
                      {exp.description && (
                        <p className="text-slate-300 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ color: accentColor }}>
                  Featured Projects
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {profile.projects.filter(p => p.featured).slice(0, 4).map((project, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors"
                    >
                      {project.imageUrl && (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                        <p className="text-slate-400 text-sm mb-3">{project.description}</p>
                        {project.techStack && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.techStack.slice(0, 3).map((tech: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded"
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
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:opacity-80"
                            style={{ color: accentColor }}
                          >
                            View on GitHub →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ color: accentColor }}>
                  Education
                </h2>
                <div className="space-y-4">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-slate-700 pl-4">
                      <h3 className="text-lg font-bold">{edu.degree}</h3>
                      <p style={{ color: accentColor }}>{edu.institution}</p>
                      <p className="text-sm text-slate-400">
                        {edu.startYear} - {edu.endYear}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
