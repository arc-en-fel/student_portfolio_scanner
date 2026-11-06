import { describe, it, expect } from 'vitest'
import type { Profile, Project, TemplateType } from '@/types'

describe('types', () => {
  it('should import Profile type without errors', () => {
    const profile: Profile = {
      fullName: 'Test Student',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      socialLinks: [],
      resumePrivacy: 'private',
      isDateOfBirthPrivate: true,
      theme: 'auto',
      emailVerified: false,
    }
    expect(profile.fullName).toBe('Test Student')
  })

  it('should import TemplateType enum', () => {
    const template: TemplateType = 'minimal-professional'
    expect(template).toBe('minimal-professional')
  })
})
