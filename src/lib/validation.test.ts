import { describe, it, expect } from 'vitest'
import {
  PersonalInfoSchema,
  EducationSchema,
  SkillSchema,
  ProjectSchema,
  CertificationSchema,
  ExperienceSchema,
  AchievementSchema,
  SocialLinkSchema,
  DesignSettingsSchema,
  ProfileSchema,
} from './validation'
import { SkillCategory, EmploymentType, AchievementCategory, SocialPlatform, TemplateType, ResumePrivacy } from '@/types'

describe('Validation Schemas', () => {
  describe('PersonalInfoSchema', () => {
    it('should validate valid personal info', () => {
      const data = {
        fullName: 'John Doe',
        headline: 'Software Engineer',
        bio: 'Passionate developer',
        city: 'New York',
        state: 'NY',
        country: 'USA',
      }
      const result = PersonalInfoSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject fullName too short', () => {
      const data = { fullName: 'J' }
      const result = PersonalInfoSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      const data = {
        fullName: 'John Doe',
        professionalEmail: 'invalid-email',
      }
      const result = PersonalInfoSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept optional fields', () => {
      const data = { fullName: 'John Doe' }
      const result = PersonalInfoSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL for website', () => {
      const data = {
        fullName: 'John Doe',
        personalWebsite: 'not-a-url',
      }
      const result = PersonalInfoSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept valid URL for website', () => {
      const data = {
        fullName: 'John Doe',
        personalWebsite: 'https://example.com',
      }
      const result = PersonalInfoSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('EducationSchema', () => {
    it('should validate complete education record', () => {
      const data = {
        institution: 'MIT',
        degree: 'Bachelor',
        department: 'Computer Science',
        startYear: 2018,
        endYear: 2022,
        cgpa: 3.8,
      }
      const result = EducationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject end year before start year', () => {
      const data = {
        institution: 'MIT',
        degree: 'Bachelor',
        startYear: 2022,
        endYear: 2018,
      }
      const result = EducationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject year outside range', () => {
      const data = {
        institution: 'MIT',
        degree: 'Bachelor',
        startYear: 1800,
        endYear: 2022,
      }
      const result = EducationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept equal start and end year', () => {
      const data = {
        institution: 'MIT',
        degree: 'Bachelor',
        startYear: 2022,
        endYear: 2022,
      }
      const result = EducationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('SkillSchema', () => {
    it('should validate skill with valid category', () => {
      const data = {
        name: 'Python',
        category: SkillCategory.PROGRAMMING_LANGUAGES,
        proficiency: 'advanced',
      }
      const result = SkillSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject skill without name', () => {
      const data = {
        name: '',
        category: SkillCategory.PROGRAMMING_LANGUAGES,
      }
      const result = SkillSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept all proficiency levels', () => {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert']
      for (const level of levels) {
        const data = {
          name: 'Python',
          category: SkillCategory.PROGRAMMING_LANGUAGES,
          proficiency: level as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        }
        const result = SkillSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('ProjectSchema', () => {
    it('should validate complete project', () => {
      const data = {
        title: 'My App',
        description: 'A web application built with React',
        techStack: ['React', 'TypeScript', 'PostgreSQL'],
        githubUrl: 'https://github.com/user/project',
        featured: true,
      }
      const result = ProjectSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject project without description', () => {
      const data = {
        title: 'My App',
        description: 'short',
        techStack: ['React'],
      }
      const result = ProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty tech stack', () => {
      const data = {
        title: 'My App',
        description: 'A web application built with React',
        techStack: [],
      }
      const result = ProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid GitHub URL', () => {
      const data = {
        title: 'My App',
        description: 'A web application built with React',
        techStack: ['React'],
        githubUrl: 'not-a-url',
      }
      const result = ProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject end date before start date', () => {
      const data = {
        title: 'My App',
        description: 'A web application built with React',
        techStack: ['React'],
        startDate: '2023-06-01',
        endDate: '2023-01-01',
      }
      const result = ProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('CertificationSchema', () => {
    it('should validate complete certification', () => {
      const data = {
        title: 'AWS Solutions Architect',
        issuer: 'Amazon',
        issueDate: '2023-01-15',
        credentialUrl: 'https://aws.amazon.com/certification',
      }
      const result = CertificationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const data = {
        title: 'AWS Solutions Architect',
        issuer: 'Amazon',
        issueDate: '01/15/2023',
      }
      const result = CertificationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept optional expiration date', () => {
      const data = {
        title: 'AWS Solutions Architect',
        issuer: 'Amazon',
        issueDate: '2023-01-15',
        expirationDate: null,
      }
      const result = CertificationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('ExperienceSchema', () => {
    it('should validate complete experience', () => {
      const data = {
        jobTitle: 'Senior Developer',
        company: 'Tech Corp',
        employmentType: EmploymentType.FULL_TIME,
        startDate: '2021-01-01',
        endDate: '2023-12-31',
        isCurrentRole: false,
      }
      const result = ExperienceSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept current role without end date', () => {
      const data = {
        jobTitle: 'Senior Developer',
        company: 'Tech Corp',
        employmentType: EmploymentType.FULL_TIME,
        startDate: '2021-01-01',
        isCurrentRole: true,
      }
      const result = ExperienceSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject end date before start date', () => {
      const data = {
        jobTitle: 'Senior Developer',
        company: 'Tech Corp',
        employmentType: EmploymentType.FULL_TIME,
        startDate: '2023-01-01',
        endDate: '2021-01-01',
        isCurrentRole: false,
      }
      const result = ExperienceSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate all employment types', () => {
      const types = [
        EmploymentType.FULL_TIME,
        EmploymentType.PART_TIME,
        EmploymentType.CONTRACT,
        EmploymentType.FREELANCE,
        EmploymentType.INTERNSHIP,
      ]
      for (const type of types) {
        const data = {
          jobTitle: 'Developer',
          company: 'Corp',
          employmentType: type,
          startDate: '2021-01-01',
          isCurrentRole: true,
        }
        const result = ExperienceSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('AchievementSchema', () => {
    it('should validate achievement', () => {
      const data = {
        title: 'First Prize',
        category: AchievementCategory.COMPETITION,
        date: '2023-06-15',
        organizationName: 'Tech Fest',
      }
      const result = AchievementSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate all categories', () => {
      const categories = [
        AchievementCategory.AWARD,
        AchievementCategory.PUBLICATION,
        AchievementCategory.SPEAKING,
        AchievementCategory.HACKATHON,
        AchievementCategory.COMPETITION,
        AchievementCategory.OTHER,
      ]
      for (const category of categories) {
        const data = {
          title: 'Achievement',
          category,
          date: '2023-06-15',
        }
        const result = AchievementSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('SocialLinkSchema', () => {
    it('should validate social link', () => {
      const data = {
        platform: SocialPlatform.GITHUB,
        url: 'https://github.com/user',
      }
      const result = SocialLinkSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL', () => {
      const data = {
        platform: SocialPlatform.GITHUB,
        url: 'not-a-url',
      }
      const result = SocialLinkSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate all platforms', () => {
      const platforms = [
        SocialPlatform.GITHUB,
        SocialPlatform.LINKEDIN,
        SocialPlatform.TWITTER,
        SocialPlatform.PORTFOLIO,
        SocialPlatform.INSTAGRAM,
        SocialPlatform.YOUTUBE,
        SocialPlatform.PERSONAL_WEBSITE,
      ]
      for (const platform of platforms) {
        const data = {
          platform,
          url: 'https://example.com',
        }
        const result = SocialLinkSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('DesignSettingsSchema', () => {
    it('should validate design settings', () => {
      const data = {
        template: TemplateType.MINIMAL_PROFESSIONAL,
        primaryColor: '#4FD1C5',
        accentColor: '#EF4444',
      }
      const result = DesignSettingsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid hex color', () => {
      const data = {
        template: TemplateType.MINIMAL_PROFESSIONAL,
        primaryColor: 'not-a-color',
      }
      const result = DesignSettingsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate all templates', () => {
      const templates = [
        TemplateType.MINIMAL_PROFESSIONAL,
        TemplateType.MODERN_DEVELOPER,
        TemplateType.CREATIVE_PORTFOLIO,
      ]
      for (const template of templates) {
        const data = { template }
        const result = DesignSettingsSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('ProfileSchema', () => {
    it('should validate complete profile', () => {
      const data = {
        fullName: 'John Doe',
        headline: 'Software Engineer',
        bio: 'Passionate developer',
        email: 'john@example.com',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        achievements: [],
        socialLinks: [],
      }
      const result = ProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate profile with nested arrays', () => {
      const data = {
        fullName: 'John Doe',
        skills: [
          {
            name: 'Python',
            category: SkillCategory.PROGRAMMING_LANGUAGES,
          },
        ],
        education: [
          {
            institution: 'MIT',
            degree: 'Bachelor',
            startYear: 2018,
            endYear: 2022,
          },
        ],
        experience: [],
        projects: [],
        certifications: [],
        achievements: [],
        socialLinks: [],
      }
      const result = ProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})
