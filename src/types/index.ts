// Enums
export enum TemplateType {
  MINIMAL_PROFESSIONAL = 'minimal-professional',
  MODERN_DEVELOPER = 'modern-developer',
  CREATIVE_PORTFOLIO = 'creative-portfolio',
}

export enum SkillCategory {
  PROGRAMMING_LANGUAGES = 'Programming Languages',
  FRAMEWORKS = 'Frameworks',
  TOOLS = 'Tools',
  DATABASES = 'Databases',
  TECHNICAL_SKILLS = 'Technical Skills',
  SOFT_SKILLS = 'Soft Skills',
}

export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

export enum AchievementCategory {
  AWARD = 'award',
  PUBLICATION = 'publication',
  SPEAKING = 'speaking',
  HACKATHON = 'hackathon',
  COMPETITION = 'competition',
  OTHER = 'other',
}

export enum SocialPlatform {
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  PORTFOLIO = 'portfolio',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  PERSONAL_WEBSITE = 'personal_website',
}

export enum ThemePreference {
  DARK = 'dark',
  LIGHT = 'light',
  AUTO = 'auto',
}

export enum ResumePrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  LINK_ONLY = 'link_only',
}

// Interfaces
export interface SocialLink {
  id?: string
  platform: SocialPlatform
  url: string
  displayName?: string
}

export interface Skill {
  id?: string
  name: string
  category: SkillCategory
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface Education {
  id?: string
  institution: string
  degree: string
  department?: string
  specialization?: string
  startYear: number
  endYear: number
  cgpa?: number
  description?: string
}

export interface Experience {
  id?: string
  jobTitle: string
  company: string
  employmentType: EmploymentType
  location?: string
  startDate: string
  endDate?: string | null
  isCurrentRole: boolean
  description?: string
}

export interface Project {
  id?: string
  title: string
  description: string
  techStack: string[]
  category?: string
  image?: string
  imageUrl?: string
  githubUrl?: string
  liveUrl?: string
  startDate?: string
  endDate?: string
  featured: boolean
  order?: number
}

export interface Certification {
  id?: string
  title: string
  issuer: string
  issueDate: string
  expirationDate?: string | null
  credentialId?: string
  credentialUrl?: string
  documentUrl?: string
}

export interface Achievement {
  id?: string
  title: string
  category: AchievementCategory
  date: string
  description?: string
  organizationName?: string
  url?: string
}

export interface Profile {
  id?: string
  userId?: string
  fullName: string
  email?: string
  headline?: string
  bio?: string
  profileImage?: string
  profileImageUrl?: string
  dateOfBirth?: string | null
  isDateOfBirthPrivate: boolean
  city?: string
  state?: string
  country?: string
  professionalEmail?: string
  personalWebsite?: string
  resume?: string
  resumeUrl?: string
  resumePrivacy: ResumePrivacy
  college?: string
  course?: string
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  projects: Project[]
  certifications: Certification[]
  achievements: Achievement[]
  socialLinks: SocialLink[]
  theme: ThemePreference
  emailVerified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Portfolio {
  profile: Profile
  template: TemplateType
  isPublished: boolean
  publicSlug?: string
  publicUrl?: string
  qrCodeUrl?: string
  viewCount?: number
  updatedAt?: string
}

// Type for API responses
export interface ApiResponse<T> {
  data?: T | null
  error?: Error | null
  status: number
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  emailConfirmedAt?: string
  userMetadata?: Record<string, unknown>
}

export interface AuthSession {
  user: AuthUser | null
  accessToken?: string
  refreshToken?: string
}
