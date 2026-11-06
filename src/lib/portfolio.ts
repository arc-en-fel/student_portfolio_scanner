export const collections = {
  projects: { label: 'Projects', fields: ['title', 'description', 'tech_stack', 'project_url'] },
  education: { label: 'Education', fields: ['institution', 'degree', 'start_year', 'end_year'] },
  certifications: { label: 'Certifications', fields: ['title', 'issuer', 'credential_url'] },
}

export const profileFields = ['full_name', 'headline', 'bio', 'college', 'course', 'location', 'skills', 'github_url', 'linkedin_url', 'website_url', 'resume_url']

export function publicUrl(slug: string): string {
  return `${(import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')}/p/${slug}`
}

export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    return ['https:', 'http:'].includes(u.protocol) ? u.href : null
  } catch {
    return null
  }
}
