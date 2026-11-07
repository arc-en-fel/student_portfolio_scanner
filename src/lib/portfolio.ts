import { buildPublicPortfolioUrl, validatePublicUrl } from './config'

export const collections = {
  projects: { label: 'Projects', fields: ['title', 'description', 'tech_stack', 'project_url'] },
  education: { label: 'Education', fields: ['institution', 'degree', 'start_year', 'end_year'] },
  certifications: { label: 'Certifications', fields: ['title', 'issuer', 'credential_url'] },
}

export const profileFields = ['full_name', 'headline', 'bio', 'college', 'course', 'location', 'skills', 'github_url', 'linkedin_url', 'website_url', 'resume_url']

/**
 * Get the public portfolio URL for sharing (QR codes, links, etc.)
 * Uses centralized configuration to ensure URLs are canonical and shareable
 */
export function publicUrl(slug: string): string {
  return buildPublicPortfolioUrl(slug)
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
