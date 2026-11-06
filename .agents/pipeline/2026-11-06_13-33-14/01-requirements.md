# StudentFolio — Complete Application Requirements

**Status:** Requirements Document
**Version:** 1.0
**Date:** 2026-11-06
**Scope:** Full-stack completion of StudentFolio application from MVP to production-ready state

---

## Summary

StudentFolio is a web application enabling students to independently register, create comprehensive digital portfolios, manage academic and professional information, publish portfolios publicly with unique permanent URLs, and generate QR codes for easy sharing. The application combines Supabase backend, PostgreSQL database, React frontend, and TypeScript for type safety.

**Current State:** MVP with basic 4-table schema, authentication, flat portfolio editor, and QR code generation.

**Desired State:** Production-ready application with extended database schema, multi-step form editor, three design templates, comprehensive file storage with security controls, landing page, additional pages (settings, privacy, terms, 404), responsive mobile UI, error handling, and automated tests.

This document specifies the gaps to close to reach full compliance with the master build specification. The application must be fully functional, not a prototype; every button, form, and feature must work end-to-end.

---

## Functional Requirements

### 1. Database Schema Extensions

#### 1.1 Add Missing Tables and Fields

The current schema has 4 tables (profiles, projects, education, certifications). Extend to support:

- **profiles table enhancements:**
  - Add: `degree`, `department`, `specialization`, `cgpa` (optional), `academic_description`, `date_of_birth` (private), `state`, `country`, `professional_email`, `personal_website`, `section_visibility` (JSON), `section_order` (JSON), `template_name`, `accent_color`, `theme_preference` (dark/light), `verified_email_at`, `email_verified` (boolean)
  - Verify: existing fields `full_name`, `headline`, `bio`, `college`, `course`, `location`, `skills`, social URLs, `avatar_path`, `is_published`, timestamps

- **New table: skills**
  - `id` (uuid, primary key)
  - `profile_id` (uuid, FK to profiles)
  - `skill_name` (text, required)
  - `category` (text: programming, framework, tool, database, technical, soft)
  - `order` (int, for sequencing)
  - `created_at` (timestamptz)
  - Indexes: profile_id, category
  - RLS: owner can CRUD; public can read if profile published

- **New table: experiences**
  - `id` (uuid, primary key)
  - `profile_id` (uuid, FK to profiles)
  - `job_title` (text, required)
  - `company_name` (text, required)
  - `employment_type` (enum: fulltime, parttime, contract, internship, freelance)
  - `location` (text, optional)
  - `start_date` (date, required)
  - `end_date` (date, optional)
  - `is_current` (boolean, default false)
  - `description` (text, optional)
  - `order` (int)
  - `created_at` (timestamptz)
  - Constraints: validate end_date >= start_date or is_current=true
  - RLS: owner can CRUD; public can read if profile published

- **Enhance projects table:**
  - Add: `category` (text: web, mobile, ai, design, tool, other), `image_path` (text), `github_url`, `live_url`, `start_date` (date), `end_date` (date), `featured` (boolean), `order` (int)
  - Existing: `id`, `profile_id`, `title`, `description`, `tech_stack`, `created_at`
  - Constraints: validate end_date >= start_date if both present
  - Indexes: profile_id, featured

- **Enhance education table:**
  - Add: `department` (text), `specialization` (text), `cgpa` (numeric), `description` (text), `order` (int)
  - Existing: `id`, `profile_id`, `institution`, `degree`, `start_year`, `end_year`
  - Constraints: existing validation for years

- **Enhance certifications table:**
  - Add: `document_path` (text, optional), `expiration_date` (date, optional), `issue_date` (date, required), `credential_id` (text, optional), `order` (int)
  - Rename `credential_url` to `credential_verification_url`
  - Existing: `id`, `profile_id`, `title`, `issuer`, `created_at`
  - Constraints: validate expiration_date >= issue_date if both present

- **New table: achievements**
  - `id` (uuid, primary key)
  - `profile_id` (uuid, FK to profiles)
  - `title` (text, required)
  - `description` (text, optional)
  - `achievement_date` (date, required)
  - `category` (text: award, publication, speaking, community, other)
  - `order` (int)
  - `created_at` (timestamptz)
  - RLS: owner can CRUD; public can read if profile published

- **New table: social_links**
  - `id` (uuid, primary key)
  - `profile_id` (uuid, FK to profiles)
  - `platform` (text: github, linkedin, behance, twitter, dribbble, instagram, website, other)
  - `url` (text, required, must be valid URL)
  - `order` (int)
  - `created_at` (timestamptz)
  - RLS: owner can CRUD; public can read if profile published

#### 1.2 Indexes and Performance

- Add indexes on foreign keys: profile_id for all child tables
- Add indexes on boolean/status columns: is_published, is_current
- Add index on order columns for efficient sorting

#### 1.3 Data Integrity

- All foreign keys use ON DELETE CASCADE
- All timestamps default to now() and are immutable on insert
- Profiles slug remains immutable (existing constraint)
- CGPA values validated as numeric 0.0-10.0 if provided
- Dates validated: no future dates except optional expiration_date
- URLs validated as valid URIs
- Enum values enforced at database level or application level with clear validation

### 2. Portfolio Editor — Multi-Step Form

Transform flat editor into 10-step wizard with autosave or explicit save per step.

#### 2.1 Step 1: Personal Information

**Fields:**
- Full name (text, required, 1-100 chars)
- Professional headline (text, required, 1-200 chars, e.g., "Full Stack Developer")
- Profile picture (image upload, optional, replace existing avatar storage)
- Short biography (textarea, optional, 0-1000 chars)
- Professional email (email, optional, for public display)
- Personal website (URL, optional, valid URI)
- City (text, optional)
- State (text, optional)
- Country (text, optional)

**Behavior:**
- Profile picture upload to avatars bucket with signed URL; replace if exists
- Validate file: JPEG, PNG, WebP only; max 2 MB
- Display preview of uploaded image
- All fields autosave on blur or explicit save button
- Show which fields are public vs. private
- Indicate completion status

#### 2.2 Step 2: Academic Information

**Fields:**
- College/University (text, required if provided)
- Degree (text, required if provided)
- Department (text, optional)
- Specialization (text, optional)
- Start year (year picker or number, required if provided)
- Graduation year (year picker or number, required if provided)
- CGPA (numeric, optional, 0.0-10.0)
- Academic description (textarea, optional, 0-500 chars)
- Add multiple education records

**Behavior:**
- Allow add, edit, delete education entries
- Reorder education entries via drag or manual order input
- Validate: graduation_year >= start_year
- No future graduation years
- Autosave each entry
- Show validation errors inline
- Display list of added education entries with edit/delete buttons

#### 2.3 Step 3: Skills

**Fields:**
- Skill name (autocomplete or freetext, required)
- Category dropdown (Programming Languages, Frameworks, Tools, Databases, Technical, Soft Skills)
- Add, edit, delete skills
- Reorder skills

**Behavior:**
- Support unlimited skills (reasonable app limit: 50 skills max)
- Provide common skill suggestions (Python, JavaScript, React, etc.) but allow custom
- Display skills by category on editor and public portfolio
- Show count of added skills
- Autosave on add/remove
- No percentages or proficiency levels required

#### 2.4 Step 4: Projects

**Fields per project:**
- Project title (text, required, 1-150 chars)
- Description (textarea, required, 1-1000 chars)
- Technology stack (text, required, comma-separated or tags)
- Category (dropdown: Web, Mobile, AI/ML, Design, Tools, Other)
- Project image (image upload, optional)
- GitHub repository URL (URL, optional, must contain "github.com")
- Live demonstration URL (URL, optional)
- Start date (date picker, required)
- Completion date (date picker, optional)
- Featured toggle (checkbox, default false)
- Order (sequence for display)

**Behavior:**
- Add, edit, delete projects
- Reorder projects; only featured projects shown prominently
- Upload image to projects bucket with signed URL; replace if exists
- Validate image: JPEG, PNG, WebP; max 5 MB
- Display preview of project image
- Show all projects in a sortable list
- Validate: completion_date >= start_date if both present
- Validate URLs are valid URIs
- Autosave each project
- Display project count and completion percentage

#### 2.5 Step 5: Certifications

**Fields per certification:**
- Certificate title (text, required, 1-150 chars)
- Issuing organization (text, required, 1-150 chars)
- Issue date (date picker, required)
- Expiration date (date picker, optional)
- Credential ID (text, optional, 1-100 chars)
- Credential verification URL (URL, optional, must be valid URI)
- Certificate document (file upload, optional, PDF only)
- Order

**Behavior:**
- Add, edit, delete certifications
- Reorder certifications
- Upload certificate document to certificates bucket; replace if exists
- Validate document: PDF only; max 10 MB
- Show expiration status (valid, expired, no expiration)
- Validate: expiration_date >= issue_date if both present
- Autosave each certification
- Display certificate count

#### 2.6 Step 6: Experience

**Fields per experience:**
- Job title (text, required, 1-150 chars)
- Company name (text, required, 1-150 chars)
- Employment type (dropdown: Full-time, Part-time, Contract, Internship, Freelance)
- Location (text, optional)
- Start date (date picker, required)
- End date (date picker, optional)
- Currently working here (checkbox, excludes end_date)
- Description (textarea, optional, 0-1000 chars)
- Order

**Behavior:**
- Add, edit, delete experience entries
- Reorder experiences; most recent first by default
- Validate: end_date >= start_date or is_current = true
- If is_current checked, hide and clear end_date
- Show experience count
- Autosave each entry
- Display list with edit/delete buttons

#### 2.7 Step 7: Achievements

**Fields per achievement:**
- Achievement title (text, required, 1-150 chars)
- Description (textarea, optional, 0-500 chars)
- Achievement date (date picker, required)
- Category (dropdown: Award, Publication, Speaking, Community, Other)
- Order

**Behavior:**
- Add, edit, delete achievements
- Reorder achievements
- Validate: achievement_date not in future
- Autosave each achievement
- Show achievement count

#### 2.8 Step 8: Social Links

**Supported platforms:**
- GitHub, LinkedIn, Behance, Twitter/X, Dribbble, Instagram, Personal website

**Fields per link:**
- Platform selector (dropdown, required)
- URL (text input, required, must match platform)
- Order

**Behavior:**
- Add, edit, delete social links
- Reorder links
- Validate URLs: must contain correct domain for platform (github.com, linkedin.com, etc.)
- Display platform icons next to links
- Autosave each link
- Show count of added links
- Prevent duplicate platforms
- Support "Other" for custom URL with custom label

#### 2.9 Step 9: Resume & Documents

**Fields:**
- Resume PDF (file upload, optional, PDF only, max 10 MB)
- Privacy control: Private (owner only), or Public (anyone)
- Option to link external resume URL instead of uploading

**Behavior:**
- Upload resume to resumes bucket; replace if exists
- Validate: PDF only; max 10 MB
- Store privacy preference in profiles table
- Display upload status and current file name if exists
- Provide signed URL if private; public URL if public
- Allow download of resume from dashboard

#### 2.10 Step 10: Design Settings

**Fields:**
- Template selector (visual cards for three templates)
- Accent color picker (recommended set of 6-8 colors, custom color input optional)
- Theme preference (dark, light, auto)
- Section visibility (toggles for each section: personal, academic, skills, projects, certifications, experience, achievements, social)
- Section order (drag-to-reorder sections)

**Behavior:**
- Save template, color, theme to profiles table
- Preview portfolio with selected template in real-time if possible
- Display before/after comparison of templates
- Show which sections are visible when profile is published
- Validate color is valid hex
- Autosave on change

#### 2.11 Form Navigation

**Behavior:**
- Step buttons: Previous, Next, Save & Continue
- Validate current step before allowing Next
- Show step progress indicator (e.g., "Step 3 of 10")
- Allow jumping between steps if allowed by state
- Autosave mechanism: save on blur, explicit save button, or per-step save
- Prevent data loss: warn before leaving unsaved changes
- Show completion percentage on dashboard

### 3. File Storage with Security

#### 3.1 Storage Buckets

Create separate buckets with distinct access policies:

- **avatars** (existing, public): Profile pictures, 2 MB max, JPEG/PNG/WebP
- **projects** (new, public): Project images, 5 MB max, JPEG/PNG/WebP
- **certificates** (new, private): Certificate documents, 10 MB max, PDF only
- **resumes** (new, conditional): Resume PDFs, 10 MB max, PDF only; privacy controlled by profile setting
- **portfolio_assets** (future): Any portfolio-related assets, 20 MB max, restricted MIME types

#### 3.2 File Upload Security

**Validation (client + server):**
- File type: check MIME type and file extension; reject mismatches
- File size: enforce max size per bucket
- File name: sanitize; use UUID + original extension to prevent collisions
- Scan for malware: flag as future work if needed

**Upload process:**
- Client uploads to bucket with authenticated session
- Server (RLS) validates: user owns profile; file path matches user ID folder
- Return error immediately if validation fails
- Store file path in relevant table (avatar_path, image_path, document_path, etc.)

#### 3.3 File Download Security

**Public files (avatars, projects):**
- Serve from public bucket URL with cache headers
- No signed URL needed

**Private files (certificates, private resumes):**
- Generate signed URL (Supabase function or client SDK)
- URL expires after 1 hour or on download
- Only owner or permitted users can access

**Resume privacy:**
- If resume_privacy = "public": serve public URL from resumes bucket
- If resume_privacy = "private": generate signed URL only for profile owner

#### 3.4 RLS Policies for Storage

- Students upload only to own user folder: `avatars/<user_id>/<filename>`
- Students can view own files and files in published profiles' public buckets
- Students cannot delete or modify other users' files
- Anonymous can view public bucket files only if profile is published

### 4. Portfolio Templates

#### 4.1 Three Templates

**Template 1: Minimal Professional**
- Clean, text-heavy, minimal images
- Neutral color scheme
- Focus on content hierarchy
- Suitable for academic/traditional portfolios

**Template 2: Modern Developer**
- Card-based layout, project images, code snippets
- Dark theme, colorful accents
- Emphasizes projects and tech stack
- Suitable for software engineers

**Template 3: Creative Portfolio**
- Image-first layout, gallery grid, hero section
- Bento-grid arrangement
- Bold typography and colors
- Suitable for designers, artists, visual professionals

#### 4.2 Template Features

- **Live preview:** Show portfolio in selected template before publishing
- **Accent color customization:** Allow selecting from preset palette (6-8 colors) or custom hex input
- **Theme toggle:** Dark, light, or auto (system preference)
- **Section visibility control:** Hide/show each section independently (e.g., hide achievements, show projects)
- **Section reordering:** Drag or number-based reordering of sections
- **Responsive:** All templates mobile-first, tablet, desktop

#### 4.3 Template Implementation

- Template name stored in profiles.template_name
- Template components render different layouts based on stored preference
- CSS/Tailwind variables for accent color override
- Mobile breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop), 1280px (wide)

### 5. QR Code Features

#### 5.1 Generation

- **Existing:** SVG download using qrcode.react
- **New:** PNG download (use qrcode library or canvas export)
- **URL:** Point to stable `https://studentfolio.app/p/<slug>` (or production domain)
- **Validation:** QR code must work on production URL (not localhost)

#### 5.2 QR Display

- Show QR code on dedicated `/qr` page (logged-in student only)
- Display portfolio URL underneath QR
- Show current publish status: "Published" (clickable, scannable) or "Draft" (warning, not scannable publicly)
- Display generated date or last updated date

#### 5.3 Downloads

- "Download as PNG" button: exports QR to PNG at 500x500px min, 300 DPI
- "Download as SVG" button: existing functionality
- Include optional filename field: "portfolio_qr.png" or "portfolio_qr.svg"

#### 5.4 Production Validation

- Set `VITE_APP_URL` to production URL (e.g., https://studentfolio.vercel.app)
- QR must encode the production URL and work on mobile browsers
- Test: scan QR on non-developer device and reach public portfolio

### 6. Landing Page

#### 6.1 Sections

**Hero:**
- Main headline: "Your Professional Portfolio in Minutes"
- Subheadline: short value proposition
- Primary CTA: "Create Your Portfolio" (links to register)
- Secondary CTA: "Explore Examples" (links to demo portfolios if available)
- Hero image or video background

**How It Works:**
- 4-step process with icons:
  1. Sign up with your email
  2. Fill in your information and upload projects
  3. Choose a template and customize
  4. Publish and share your QR code
- Each step has a brief description and icon

**Features Showcase:**
- 5-6 feature cards:
  - Multi-section portfolio (personal, academic, skills, projects, etc.)
  - Beautiful templates (show 3 templates)
  - QR code generation and download
  - Mobile-responsive
  - Private and public controls
  - Easy to update
- Icons for each feature

**Template Gallery:**
- Three cards showing each template
- Brief description and CTA: "Preview" or "Use Template"
- Use live component preview if possible

**FAQ:**
- 6-10 common questions:
  - Is StudentFolio free?
  - Do I need coding knowledge?
  - Can I change my portfolio after publishing?
  - Is my data private?
  - Can I delete my account?
  - What if I don't have projects yet?
  - Can I add more sections later?
  - Is there a limit to portfolio size?
  - Can anyone find my portfolio?
  - What happens if I unpublish?
- Accordion or expandable format
- Clear, concise answers

**Call to Action:**
- Bottom section: "Ready to build your portfolio?"
- Large button: "Get Started Free"
- Optional: "or Watch 2-Minute Demo"

#### 6.2 Design

- Mobile-first responsive
- Use established color palette from design system
- Smooth scroll, subtle animations
- Clear typography hierarchy
- Accessible: WCAG AA, keyboard navigation

### 7. Additional Pages

#### 7.1 Settings Page (`/settings`)

**Account Management:**
- Display email
- Display account creation date
- Change password (form with current password, new password, confirm)
- Email preferences (notifications opt-in/out if applicable)

**Profile Deletion:**
- Danger zone section
- Confirmation dialog before deletion
- Warning: "This cannot be undone. All your portfolios and documents will be deleted."
- Delete button with confirmation
- Redirect to home after successful deletion

**Session Management:**
- Logout from all devices option (future feature)
- Current session info: last login, device, browser

**Download Data:**
- Export profile data as JSON (future feature)

#### 7.2 Privacy Policy Page (`/privacy`)

- Legal disclaimer: "This is a template; consult a lawyer for your specific needs"
- Standard sections:
  - What data we collect
  - How we use data
  - Data retention
  - Third-party services (Supabase, Vercel)
  - User rights
  - Contact information
- No fake or placeholder content; use real legal language or link to template

#### 7.3 Terms of Service Page (`/terms`)

- Legal disclaimer (same as privacy)
- Standard sections:
  - Acceptable use
  - Intellectual property
  - Limitations of liability
  - Termination
  - Governing law
  - Contact information
- Markdown or semantic HTML

#### 7.4 404 Error Page

- Friendly message: "Oops! This page doesn't exist."
- Suggest common links: Home, Dashboard, Create Portfolio, View QR
- Return to Home button
- Illustration or icon

#### 7.5 Password Recovery Page (`/forgot-password`)

**Flow:**
1. Enter email address
2. Submit
3. Show: "Check your email for a password reset link"
4. Link in email takes user to `/reset-password?token=<token>`
5. Enter new password, confirm
6. Submit resets password via Supabase
7. Redirect to login with success message

### 8. UI/UX Enhancements

#### 8.1 Responsive Design

- Mobile-first approach: 320px, 768px, 1024px breakpoints
- Flexbox and grid layouts
- Touch-friendly buttons: 44px minimum height
- Readable font sizes: 16px minimum on mobile
- Proper spacing and padding for touch
- Test on iPhone SE, iPad, Desktop

#### 8.2 Loading & Skeleton States

- Show skeleton screens while fetching profile, projects, certifications
- Loading indicators on form submission
- Disable buttons during submission
- Show estimated load time if > 2 seconds

#### 8.3 Empty States

- "No projects yet" with icon and CTA to add project
- "No certifications" with prompt to add
- "No experience entries" with call-to-action
- Similar for each section

#### 8.4 Error Boundaries

- Catch React errors globally
- Show user-friendly error message: "Something went wrong. Please refresh or contact support."
- Log errors to console/monitoring service
- Provide recover/reload button

#### 8.5 Form Validation

**Client-side (React Hook Form + Zod):**
- Real-time validation on blur
- Error messages below fields
- Visual indicators (red border, icon)
- Disable submit until valid

**Server-side (Supabase RLS):**
- Enforce NOT NULL, unique, check constraints
- Return detailed error messages to client

**Validation rules per field type:**
- Email: valid RFC 5322 format
- URL: valid URI scheme (http/https)
- Numbers: numeric type, range (e.g., 0-10 for CGPA)
- Dates: valid ISO 8601, not future (except expiration)
- Text: max length, required vs. optional
- File: correct MIME type, max size

#### 8.6 Confirmation Dialogs

- Before unpublishing portfolio: "This will make your portfolio private. Are you sure?"
- Before deleting account: "Your account and all data will be permanently deleted. Type your email to confirm."
- Before deleting project, certification, etc.: "Are you sure? This cannot be undone."

#### 8.7 Toast Notifications (Sonner)

- Success: "Portfolio published!" (green, auto-dismiss 3s)
- Error: "Failed to upload image: file too large" (red, manual dismiss)
- Info: "Saving..." (neutral, auto-dismiss when done)
- Warning: "Email not verified yet" (yellow, auto-dismiss 5s)

#### 8.8 Accessibility

- ARIA labels on buttons, form fields
- Semantic HTML: <button>, <form>, <nav>, etc.
- Keyboard navigation: Tab, Enter, Escape
- Focus indicators visible
- Color contrast: WCAG AA (4.5:1 text, 3:1 graphics)
- Alt text on images
- Form error messages associated with fields

### 9. Security Enhancements

#### 9.1 RLS Policy Review & Completeness

**Profiles table:**
- ✓ Existing: visible to owner or when published
- ✓ Existing: editable only by owner
- Ensure: timestamps immutable, slug immutable

**All child tables (projects, education, certifications, skills, experiences, achievements, social_links):**
- ✓ Existing (for projects/education/certifications): visible when profile public or owner
- ✓ Existing: CRUD only by owner
- New: apply same policies to skills, experiences, achievements, social_links

**Storage buckets:**
- ✓ Existing (avatars): upload only own folder, anonymous read if profile published
- New (projects, certificates, resumes): upload only own folder, read only if profile published (or private for resumes)

#### 9.2 File Access Control

**Public files:**
- Served via public bucket CDN URL
- No signed URL needed
- Accessible to anyone, but only rendered if profile published

**Private files (certificates, private resumes):**
- Generate signed URL (1-hour expiry)
- Only owner can request signed URL
- Server validates ownership before generating URL

**Resume privacy toggle:**
- Store resume_privacy (public/private) in profiles table
- If public: serve public bucket URL
- If private: generate signed URL only for owner

#### 9.3 No Hardcoded Secrets

- All secrets in .env.local / .env.production
- Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_APP_URL
- Never commit .env files
- Verify .gitignore covers .env files

#### 9.4 Data Privacy

- Student registration info (email, password) never shown on public profile
- Date of birth, state, country marked private by default (not shown on public unless explicitly shared)
- Professional email shown only if student explicitly enables it
- Resume privacy toggle per resume

### 10. Testing

#### 10.1 Test Structure

- Unit tests: utility functions, validators, data transformers
- Integration tests: auth flow, portfolio CRUD, file uploads
- Component tests: form submission, validation, error states
- E2E tests: full user workflow from register to publish to QR scan (if possible)

#### 10.2 Test Framework

- Jest for unit and component tests
- Testing Library for component rendering and interaction
- Vitest as test runner (faster, ESM compatible)
- Mock Supabase for unit tests; real Supabase for integration tests

#### 10.3 Test Coverage

**Authentication:**
- Register with valid/invalid email
- Email verification flow
- Login with correct/incorrect credentials
- Logout clears session
- Protected routes redirect to login
- Password reset flow

**Portfolio Management:**
- Create profile with multi-step form
- Edit each step
- Save and verify data persisted
- Reorder items (projects, skills, education)
- Upload and replace files
- Validate form errors shown inline

**File Storage:**
- Upload avatar (valid/invalid files)
- Upload project image
- Upload certificate PDF
- Upload resume PDF
- Verify file size limits enforced
- Verify file type validation
- Verify file stored in correct folder
- Verify signed URLs for private files

**Publishing:**
- Publish portfolio changes is_published to true
- Public profile viewable via /p/<slug>
- Unpublish hides profile from public
- QR code works on published profile
- QR code hidden/disabled on draft

**Templates:**
- Select template saves to profile
- Template changes reflect on portfolio
- All three templates render without errors
- Mobile preview responsive

**QR Code:**
- Generate QR code for published portfolio
- Download as PNG
- Download as SVG
- QR encodes correct URL
- QR scannable on real device (manual test)

**RLS Policies:**
- Anonymous cannot edit own profile (no auth)
- User A cannot edit User B's profile
- Anonymous can read published profile
- Anonymous cannot read draft profile
- Child rows visible only if parent published or owner

#### 10.4 Test Data & Fixtures

- Test user: student1@example.com / password123
- Test portfolios: minimal, complete, with all sections
- Mock files: valid 1MB image, 5MB image, valid PDF, invalid files
- Mock dates: past, present, future to test validation

### 11. Documentation

#### 11.1 README.md (existing, update)

- Project overview
- Tech stack
- Prerequisites
- Setup instructions (environment variables, Supabase setup, npm install)
- Running locally
- Running tests
- Building for production
- Deployment steps
- Known limitations
- Support and contact

#### 11.2 ARCHITECTURE.md

- High-level system design
- Frontend structure: pages, components, hooks
- Backend: Supabase, PostgreSQL
- Database schema diagram
- Data flow: auth, CRUD, file uploads
- Security model: RLS, signed URLs
- Deployment architecture: Vercel + Supabase

#### 11.3 DATABASE.md

- Current schema with all tables
- Table relationships and foreign keys
- RLS policies for each table
- Indexes and performance notes
- Constraints and validations
- Seed data (if applicable)

#### 11.4 SETUP.md

- Detailed step-by-step setup
- Create Supabase project
- Run migrations
- Configure authentication
- Configure environment variables
- Local development
- Troubleshooting common issues

#### 11.5 DEPLOYMENT.md

- Deploy to Vercel
- Deploy Supabase migrations
- Set environment variables on Vercel
- Configure custom domain
- Monitor production
- Rollback procedures

#### 11.6 TESTING.md

- How to run tests
- Writing unit tests
- Writing component tests
- Writing integration tests
- Test coverage targets (aim for 80%+)
- Debugging failing tests

#### 11.7 PROGRESS.md

- Checklist of all deliverables
- Completion status per section
- Known issues and workarounds
- Performance benchmarks (page load, build size)
- Future roadmap (SSR, analytics, moderation, etc.)

---

## Non-Functional Requirements

### Performance

- Page load time: < 3 seconds (CLS, FCP, LCP < 2.5s)
- Form submission: < 1 second response time (file uploads excluding)
- File upload: show progress bar; max 30 seconds for 10 MB
- Build size: < 500 KB (gzipped)
- Database queries: < 100 ms per query
- RLS policy evaluation: < 50 ms
- Lighthouse score: 90+ (performance, accessibility, best practices)

### Scalability

- Support 10,000+ students
- Support unlimited portfolios per student
- Support 1000+ projects across all students
- Optimistic updates for form fields
- Pagination for large lists (projects, certifications > 50 items)

### Reliability

- 99.5% uptime (Supabase SLA)
- Error recovery: user can retry failed operations
- Session management: handle token expiry gracefully
- Database failover: use Supabase replicas for read scaling

### Maintainability

- TypeScript strict mode: no any types (except in absolutely necessary cases)
- Code organization: feature-based folder structure
- Reusable components: no code duplication
- Environment configuration: 12-factor app principles
- Git history: clear commit messages, semantic versioning

### Browser & Device Support

- Desktop browsers: Chrome, Firefox, Safari (latest 2 versions)
- Mobile browsers: iOS Safari 14+, Chrome Android 90+
- Screen sizes: 320px (iPhone SE) to 1920px (desktop)
- Touch and keyboard navigation support

### Security Standards

- HTTPS only in production
- No sensitive data in localStorage (use httpOnly cookies if needed)
- CORS headers configured
- CSP (Content Security Policy) headers set
- XSS, SQL injection, CSRF mitigated by framework and RLS
- Regular security audits of dependencies

---

## Acceptance Criteria

### Core Functionality (Must-Have)

1. **Registration & Authentication**
   - [ ] Student can register with email and password
   - [ ] Email verification is required before publishing
   - [ ] Student can login with verified email
   - [ ] Student can logout and session clears
   - [ ] Student can reset password via email link
   - [ ] Protected routes redirect to login if not authenticated

2. **Multi-Step Portfolio Editor**
   - [ ] All 10 steps render without errors
   - [ ] Step 1: Personal information saves and displays on public profile
   - [ ] Step 2: Academic information saves and displays; CGPA optional
   - [ ] Step 3: Skills add, edit, delete, reorder; displayed by category
   - [ ] Step 4: Projects add, edit, delete, reorder; images upload; featured toggle works
   - [ ] Step 5: Certifications add, edit, delete, reorder; expiration status shown
   - [ ] Step 6: Experience add, edit, delete, reorder; "current position" toggle excludes end_date
   - [ ] Step 7: Achievements add, edit, delete, reorder
   - [ ] Step 8: Social links add, edit, delete, reorder; platforms validated; no duplicates
   - [ ] Step 9: Resume upload (PDF only, max 10 MB); privacy toggle works
   - [ ] Step 10: Template selection, accent color, theme, section visibility all save
   - [ ] Form navigation: Previous/Next buttons work; validation prevents invalid steps
   - [ ] Autosave works: changes persist if user navigates away
   - [ ] Progress indicator shows current step and total steps

3. **Dashboard & Portfolio Status**
   - [ ] Dashboard displays student name, profile image, portfolio status
   - [ ] Dashboard shows portfolio completion percentage
   - [ ] Quick actions visible: Edit, Preview, Publish/Unpublish, View Public, View QR
   - [ ] Publish button changes is_published to true; portfolio becomes viewable
   - [ ] Unpublish button changes is_published to false; portfolio becomes private
   - [ ] Statistics show accurate data (project count, certification count, etc.)

4. **File Storage & Security**
   - [ ] Avatar upload to avatars bucket; validated (JPEG/PNG/WebP, 2 MB max)
   - [ ] Project images upload to projects bucket; validated (5 MB max)
   - [ ] Certificates upload to certificates bucket; validated (PDF, 10 MB max)
   - [ ] Resumes upload to resumes bucket; validated (PDF, 10 MB max)
   - [ ] File paths include user ID; students cannot access other users' files
   - [ ] Private files generate signed URLs; signed URLs expire after 1 hour
   - [ ] Public files served via public bucket CDN URL
   - [ ] Resume privacy toggle: public resumes served as URL, private resumes use signed URL
   - [ ] No MIME type mismatches accepted (e.g., JPG file with .png extension rejected)

5. **Templates & Design Settings**
   - [ ] Three templates render correctly: Minimal Professional, Modern Developer, Creative Portfolio
   - [ ] Template selector on step 10 saves selection to profile
   - [ ] Template changes on public profile reflect immediately after save
   - [ ] Accent color picker allows selecting from preset palette; custom color input works
   - [ ] Theme toggle (dark/light) changes appearance
   - [ ] Section visibility toggles hide/show sections on public profile
   - [ ] Section reordering changes section order on public profile
   - [ ] Mobile preview shows responsive layout

6. **Public Portfolio & QR Code**
   - [ ] Published portfolio visible at /p/<slug> to anonymous users
   - [ ] Draft portfolio not visible at /p/<slug> to anonymous users (403 or redirect)
   - [ ] Public portfolio displays all visible sections in selected template
   - [ ] QR code generates and displays on /qr page
   - [ ] QR code PNG download works; file is valid PNG at 500x500px min
   - [ ] QR code SVG download works; file is valid SVG
   - [ ] QR code encodes portfolio URL: https://<production-domain>/p/<slug>
   - [ ] QR code is scannable on mobile device and reaches correct portfolio
   - [ ] /qr page shows "Published" if portfolio is_published=true, "Draft" if false
   - [ ] QR page locked to portfolio owner only

7. **Landing Page**
   - [ ] Landing page displays all sections: hero, how it works, features, templates, FAQ
   - [ ] Hero CTA "Create Your Portfolio" links to register page
   - [ ] How it works shows 4-step process with descriptions
   - [ ] Features section displays 5-6 key features with icons
   - [ ] Template gallery shows 3 templates with descriptions
   - [ ] FAQ section has 6+ questions with clear answers
   - [ ] All CTAs function: links navigate, buttons submit forms
   - [ ] Landing page is mobile-responsive

8. **Additional Pages**
   - [ ] Settings page (`/settings`) displays account info and logout option
   - [ ] Settings page has "Change Password" form with validation
   - [ ] Settings page has "Delete Account" button with confirmation dialog
   - [ ] Delete account dialog requires email confirmation and deletes all user data
   - [ ] Privacy policy page (`/privacy`) displays and is readable
   - [ ] Terms of service page (`/terms`) displays and is readable
   - [ ] 404 page displays when accessing non-existent route
   - [ ] Forgot password page (`/forgot-password`) accepts email, sends reset link
   - [ ] Password reset page (`/reset-password?token=X`) validates token and resets password

9. **UI/UX Polish**
   - [ ] All pages responsive on mobile (320px), tablet (768px), desktop (1024px+)
   - [ ] Loading skeletons display while fetching data
   - [ ] Empty states display when no items (e.g., "No projects yet")
   - [ ] Error boundaries catch React errors; show friendly message
   - [ ] Form validation shows inline error messages; disables submit until valid
   - [ ] Confirmation dialogs appear before destructive actions (delete, unpublish, etc.)
   - [ ] Toast notifications (Sonner) display for success/error/info messages
   - [ ] Buttons disabled during submission; show loading state
   - [ ] Keyboard navigation works: Tab, Enter, Escape
   - [ ] WCAG AA contrast ratio met (4.5:1 text, 3:1 graphics)

10. **Security & Data Privacy**
    - [ ] RLS policies prevent users from editing/deleting other users' data
    - [ ] Anonymous users cannot view draft profiles
    - [ ] Private files accessible only to owner via signed URL
    - [ ] No hardcoded secrets in code or environment variables
    - [ ] .env files not committed to git
    - [ ] Student registration email not displayed on public profile by default
    - [ ] Date of birth, state, country private by default (not public)
    - [ ] Professional email shown on public profile only if explicitly enabled

11. **Testing & Quality**
    - [ ] All unit tests pass: npm run test
    - [ ] All integration tests pass: npm run test:integration
    - [ ] TypeScript strict mode passes: npm run type-check (no errors)
    - [ ] Build succeeds: npm run build (no errors)
    - [ ] Production build runs: npm run preview
    - [ ] No console errors or warnings in development
    - [ ] No console errors or warnings in production build

12. **Documentation**
    - [ ] README.md covers setup, running, deployment, known limitations
    - [ ] ARCHITECTURE.md describes system design and data flow
    - [ ] DATABASE.md documents schema, relationships, RLS policies
    - [ ] SETUP.md provides step-by-step setup instructions
    - [ ] DEPLOYMENT.md covers Vercel and Supabase deployment
    - [ ] TESTING.md explains how to run and write tests
    - [ ] PROGRESS.md tracks completion status and known issues

### Edge Cases (Should Test)

- [ ] User A published; User B cannot access User A's private resume
- [ ] Student publishes, then unpublishes; QR code still valid but shows private portfolio (403)
- [ ] File upload fails (network error, timeout); user sees error and can retry
- [ ] Session expires during form submission; user redirected to login
- [ ] Simultaneous edits: User A and User B edit same profile; last write wins (no conflict resolution)
- [ ] Delete portfolio: cascades to all child records (projects, certifications, etc.)
- [ ] Mobile upload: large file on slow 3G; progress bar shown
- [ ] Form validation: email already in use; password too weak; year range invalid
- [ ] QR code on expired domain; reinstating domain reactivates QR

---

## Out of Scope

The following are explicitly out of scope for this phase and documented as future work:

1. **Advanced Analytics**
   - Portfolio view counts, visitor geography, referral sources
   - Engagement metrics, A/B testing
   - Rationale: requires privacy-conscious event collection, would add complexity

2. **Server-Side Rendering (SSR) / Static Generation**
   - Pre-render portfolios for SEO (Open Graph tags, meta descriptions)
   - Static HTML generation per portfolio
   - Rationale: adds deployment complexity; SPA sufficient for MVP

3. **Email Notifications**
   - Notify student when profile viewed, when comment left, etc.
   - Rationale: no commenting/interaction features in Phase 1

4. **Advanced Search & Discovery**
   - Search portfolios by skill, industry, location
   - Featured portfolios homepage
   - Rationale: requires moderation and index design

5. **Media Editing & CDN**
   - Image cropping, resizing, filters in UI
   - Cloudinary or similar CDN for image optimization
   - Rationale: add later if needed; current Supabase Storage sufficient

6. **Portfolio Collaboration**
   - Multiple users editing same portfolio
   - Comments, suggestions, feedback
   - Rationale: scope limited to solo student portfolios

7. **Advanced Theme Customization**
   - Custom CSS per student
   - WYSIWYG editor for sections
   - Rationale: fixed templates sufficient; avoid customization complexity

8. **Two-Factor Authentication (2FA)**
   - Authenticator app, SMS codes
   - Rationale: email-based password reset sufficient for MVP

9. **Social Features**
   - User profiles, following, messaging
   - Portfolio liking, sharing to social media
   - Rationale: out of scope; focus on portfolio content

10. **Moderation & Safety**
    - Admin dashboard for reported profiles
    - Content filtering, spam detection
    - Rationale: implement before wide public launch

11. **Internationalization (i18n)**
    - Multiple languages, localization
    - Rationale: English-only for MVP

12. **Progressive Web App (PWA)**
    - Offline support, install as app
    - Push notifications
    - Rationale: future phase

---

## Key Assumptions & Notes

1. **Supabase as Backend:** All backend functionality uses Supabase; no custom Node.js server.

2. **Email Verification:** Email verification is enforced by Supabase Auth; students must verify email before publishing (configured at registration).

3. **No Student Profile Verification:** Students self-report their background; no ID verification or institutional verification in Phase 1.

4. **File Storage:** All files stored in Supabase Storage; no external CDN (future optimization).

5. **QR Code Stability:** QR codes use UUID-based slug; slug is immutable and permanent across edits.

6. **Single Portfolio per Student:** One portfolio per registered email; no multiple portfolios (future feature).

7. **Pagination:** Lists of 50+ items paginated (projects, certifications); smaller lists show all.

8. **Autosave Mechanism:** Form changes autosave on blur or explicit save button; no draft recovery if browser closed without save.

9. **Time Zone:** All dates and times stored in UTC; no time zone selection.

10. **Soft Deletes:** User deletion is hard delete (cascade); no recovery after account deletion (future: soft delete with recovery period).

11. **Template Switching:** Changing template mid-edit saves immediately; no preview without saving.

12. **Production URL:** `VITE_APP_URL` must be set to production domain for QR codes to work on external devices.

---

## Success Definition

The application is complete when:

1. All 12 acceptance criteria categories have checkmarks
2. A new student can register, verify email, complete all 10 form steps, publish, and download QR
3. QR code scanned on mobile device successfully reaches the published portfolio
4. All three templates render correctly with different accent colors
5. TypeScript strict mode passes with no errors
6. All tests pass (unit, integration)
7. Production build succeeds and runs without errors
8. Documentation is complete and accurate
9. No hardcoded secrets or fake data in codebase
10. Security review confirms RLS policies, file access, and data privacy are correct

---

## Document Metadata

**Document Status:** Draft - Requirements Phase
**Next Step:** Design Review + Architecture Document
**Estimated Implementation Time:** 6-8 weeks (dependent on team size and working hours)
**Revision History:** 
- v1.0 (2026-11-06): Initial requirements document created
