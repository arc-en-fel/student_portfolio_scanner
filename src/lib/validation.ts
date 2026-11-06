import { z } from 'zod'
import { SkillCategory, EmploymentType, AchievementCategory, SocialPlatform, TemplateType, ResumePrivacy } from '@/types'

// Helper schemas
const yearSchema = z.number().int().min(1900, 'Year must be 1900 or later').max(2100, 'Year must be 2100 or earlier')
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

// Personal Information Schema
export const PersonalInfoSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  headline: z.string().max(150, 'Headline must be less than 150 characters').optional().or(z.literal('')),
  profileImage: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Biography must be less than 500 characters').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')).refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: 'Date must be in YYYY-MM-DD format',
  }),
  isDateOfBirthPrivate: z.boolean().default(true),
  city: z.string().max(50, 'City must be less than 50 characters').optional().or(z.literal('')),
  state: z.string().max(50, 'State must be less than 50 characters').optional().or(z.literal('')),
  country: z.string().max(50, 'Country must be less than 50 characters').optional().or(z.literal('')),
  professionalEmail: z.string().optional().or(z.literal('')).refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Must be a valid email address',
  }),
  personalWebsite: z.string().optional().or(z.literal('')).refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Must start with http:// or https://',
  }),
})

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>

// Education Schema
export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(2, 'Institution must be at least 2 characters').max(100, 'Institution must be less than 100 characters'),
  degree: z.string().min(1, 'Degree is required').max(100, 'Degree must be less than 100 characters'),
  department: z.string().max(100, 'Department must be less than 100 characters').optional().or(z.literal('')),
  specialization: z.string().max(100, 'Specialization must be less than 100 characters').optional().or(z.literal('')),
  startYear: yearSchema,
  endYear: yearSchema,
  cgpa: z.number().min(0, 'CGPA must be 0 or higher').max(10, 'CGPA must be 10 or lower').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
}).refine((data) => data.endYear >= data.startYear, {
  message: 'End year must be equal to or after start year',
  path: ['endYear'],
})

export type Education = z.infer<typeof EducationSchema>

// Skill Schema
export const SkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Skill name is required').max(50, 'Skill name must be less than 50 characters'),
  category: z.nativeEnum(SkillCategory),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
})

export type Skill = z.infer<typeof SkillSchema>

// Project Schema
export const ProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Project title must be at least 2 characters').max(100, 'Project title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  techStack: z.array(z.string()).min(1, 'At least one technology is required').max(20, 'Maximum 20 technologies allowed'),
  category: z.string().max(50, 'Category must be less than 50 characters').optional().or(z.literal('')),
  image: z.string().optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  githubUrl: z.string().optional().or(z.literal('')).refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Must start with http:// or https://',
  }),
  liveUrl: z.string().optional().or(z.literal('')).refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Must start with http:// or https://',
  }),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  featured: z.boolean().default(false),
  order: z.number().int().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'End date must be equal to or after start date',
    path: ['endDate'],
  }
)

export type Project = z.infer<typeof ProjectSchema>

// Certification Schema
export const CertificationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Certificate title must be at least 2 characters').max(150, 'Certificate title must be less than 150 characters'),
  issuer: z.string().min(2, 'Issuer must be at least 2 characters').max(100, 'Issuer must be less than 100 characters'),
  issueDate: dateStringSchema,
  expirationDate: dateStringSchema.optional().nullable(),
  credentialId: z.string().max(100, 'Credential ID must be less than 100 characters').optional().or(z.literal('')),
  credentialUrl: z.string().optional().or(z.literal('')).refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Must start with http:// or https://',
  }),
  documentUrl: z.string().optional().or(z.literal('')),
})

export type Certification = z.infer<typeof CertificationSchema>

// Experience Schema
export const ExperienceSchema = z.object({
  id: z.string().optional(),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters').max(100, 'Job title must be less than 100 characters'),
  company: z.string().min(2, 'Company must be at least 2 characters').max(100, 'Company must be less than 100 characters'),
  employmentType: z.nativeEnum(EmploymentType),
  location: z.string().max(100, 'Location must be less than 100 characters').optional().or(z.literal('')),
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional().nullable(),
  isCurrentRole: z.boolean().default(false),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (!data.isCurrentRole && data.endDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'End date must be equal to or after start date',
    path: ['endDate'],
  }
)

export type Experience = z.infer<typeof ExperienceSchema>

// Achievement Schema
export const AchievementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Achievement title must be at least 2 characters').max(150, 'Achievement title must be less than 150 characters'),
  category: z.nativeEnum(AchievementCategory),
  date: dateStringSchema,
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  organizationName: z.string().max(100, 'Organization name must be less than 100 characters').optional().or(z.literal('')),
  url: z.string().optional().or(z.literal('')).refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Must start with http:// or https://',
  }),
})

export type Achievement = z.infer<typeof AchievementSchema>

// Social Link Schema
export const SocialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().min(5, 'URL must be at least 5 characters').refine((val) => /^https?:\/\/.+/.test(val), {
    message: 'Must start with http:// or https://',
  }),
  displayName: z.string().max(100, 'Display name must be less than 100 characters').optional().or(z.literal('')),
})

export type SocialLink = z.infer<typeof SocialLinkSchema>

// Design Settings Schema
export const DesignSettingsSchema = z.object({
  template: z.nativeEnum(TemplateType),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color (e.g., #4FD1C5)').optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color (e.g., #EF4444)').optional(),
})

export type DesignSettings = z.infer<typeof DesignSettingsSchema>

// Combined Profile Schema
export const ProfileSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().optional(),
  headline: z.string().max(150, 'Headline must be less than 150 characters').optional().or(z.literal('')),
  bio: z.string().max(500, 'Biography must be less than 500 characters').optional().or(z.literal('')),
  profileImage: z.string().optional().or(z.literal('')),
  profileImageUrl: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().nullable().or(z.literal('')),
  isDateOfBirthPrivate: z.boolean().default(true),
  city: z.string().max(50, 'City must be less than 50 characters').optional().or(z.literal('')),
  state: z.string().max(50, 'State must be less than 50 characters').optional().or(z.literal('')),
  country: z.string().max(50, 'Country must be less than 50 characters').optional().or(z.literal('')),
  professionalEmail: z.string().optional().or(z.literal('')),
  personalWebsite: z.string().optional().or(z.literal('')),
  resume: z.string().optional().or(z.literal('')),
  resumeUrl: z.string().optional().or(z.literal('')),
  resumePrivacy: z.nativeEnum(ResumePrivacy).default(ResumePrivacy.PRIVATE),
  college: z.string().optional().or(z.literal('')),
  course: z.string().optional().or(z.literal('')),
  skills: z.array(SkillSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),
  socialLinks: z.array(SocialLinkSchema).default([]),
})

export type Profile = z.infer<typeof ProfileSchema>
