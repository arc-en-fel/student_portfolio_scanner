# StudentFolio — Implementation Plan

Based on approved design 02-design.md, this plan implements the full production-ready StudentFolio application from the current MVP.

---

## Phase 1: Database & Backend Preparation

- [ ] 1. Extend profiles table with new columns for academic info, portfolio settings, privacy, and verification
      Files: supabase/schema.sql (ALTER TABLE profiles section)
      Verify: Run migration in Supabase SQL editor; confirm all columns exist with correct types and constraints

- [ ] 2. Extend projects table with category, image_path, dates, featured flag, and ordering
      Files: supabase/schema.sql (ALTER TABLE projects section)
      Verify: Run migration; confirm columns exist and indexes created

- [ ] 3. Extend education table with department, specialization, CGPA, description, and ordering
      Files: supabase/schema.sql (ALTER TABLE education section)
      Verify: Run migration; confirm columns exist, CGPA constraint enforced

- [ ] 4. Extend certifications table with document_path, dates, credential_id, and ordering
      Files: supabase/schema.sql (ALTER TABLE certifications section)
      Verify: Run migration; confirm columns exist and date validation works

- [ ] 5. Create skills table with category-based structure and RLS policies
      Files: supabase/schema.sql (CREATE TABLE skills section)
      Verify: Run migration; query skills table to confirm it exists with correct schema and RLS enabled

- [ ] 6. Create experiences table for professional work history with RLS policies
      Files: supabase/schema.sql (CREATE TABLE experiences section)
      Verify: Run migration; confirm table exists with all constraints (dates, employment_type)

- [ ] 7. Create achievements table for awards, publications, speaking, community contributions with RLS policies
      Files: supabase/schema.sql (CREATE TABLE achievements section)
      Verify: Run migration; confirm table exists with category validation

- [ ] 8. Create social_links table with platform-specific URLs and unique constraint per platform/profile with RLS policies
      Files: supabase/schema.sql (CREATE TABLE social_links section)
      Verify: Run migration; confirm unique(profile_id, platform) constraint works

- [ ] 9. Create storage buckets (projects, certificates, resumes) with RLS policies for upload/update/delete
      Files: supabase/schema.sql (Storage buckets section)
      Verify: Run migration; confirm buckets exist, MIME type restrictions apply, RLS policies created

- [ ] 10. Implement email verification enforcement trigger to block publishing without verified email
      Files: supabase/schema.sql (Email verification section)
      Verify: Run migration; attempt to publish as unverified user, expect error

---

## Phase 2: TypeScript & Tooling Setup

- [ ] 11. Create tsconfig.json with strict mode enabled and JSX configuration for React 19
      Files: tsconfig.json, tsconfig.node.json
      Verify: Run `npx tsc --noEmit` with no errors

- [ ] 12. Add missing dependencies to package.json: react-hook-form, zod, @hookform/resolvers, @tanstack/react-query, sonner, qrcode, vitest, @testing-library/react, happy-dom
      Files: package.json
      Verify: Run `npm install`; confirm all packages installed and vite build succeeds

- [ ] 13. Create vitest.config.ts with happy-dom environment, React Testing Library setup, and Supabase mocks
      Files: vitest.config.ts, tests/setup.ts
      Verify: Run `npx vitest --run` with no config errors

- [ ] 14. Create global types file with Profile, Project, Education, Certification, Skill, Experience, Achievement, SocialLink interfaces
      Files: src/types/index.ts
      Verify: Import types in a component with no TypeScript errors

- [ ] 15. Create validation schemas using Zod for all form inputs (personal info, education, skills, projects, certifications, experience, achievements, social links, design settings)
      Files: src/lib/validation.ts
      Verify: Run unit tests for each schema with valid/invalid data; all tests pass

---

## Phase 3: TypeScript Migration of Existing Files

- [ ] 16. Migrate AuthProvider from .jsx to .tsx with proper Context types and auth state management
      Files: src/components/AuthProvider.tsx (renamed from .jsx)
      Verify: `npm run build` succeeds; dashboard loads and login/logout work

- [ ] 17. Migrate Layout.tsx and Protected.tsx to TypeScript with proper component and props types
      Files: src/components/Layout.tsx, src/components/Protected.tsx
      Verify: Build succeeds; navigation and protected routes work

- [ ] 18. Migrate existing pages (Home, AuthPage, Dashboard, QRPage, PublicPortfolio) to TypeScript
      Files: src/pages/*.tsx (all renamed from .jsx)
      Verify: `npm run build` succeeds; all pages load without errors

- [ ] 19. Migrate lib files (supabase.ts, portfolio.ts) to TypeScript with proper module exports
      Files: src/lib/supabase.ts, src/lib/portfolio.ts
      Verify: Build succeeds; no type errors

---

## Phase 4: Core Utilities & Hooks

- [ ] 20. Create file storage utilities (upload, validation, signed URLs, public URLs) with error handling and bucket config
      Files: src/lib/file-storage.ts
      Verify: Unit tests pass for file type validation, size checking, and URL generation (mocked Supabase)

- [ ] 21. Create QR code utilities for generating and exporting QR codes as PNG/SVG
      Files: src/lib/qr-code.ts
      Verify: Unit test generates QR data URL; download function creates blob

- [ ] 22. Create custom hooks: useProfile (query + mutation), useProjects, useEducation, useSkills, useExperiences, useAchievements, useSocialLinks
      Files: src/hooks/useProfile.ts (all hooks; can use one file or multiple)
      Verify: Each hook queries correct table with proper error handling; mock tests pass

- [ ] 23. Create useFileUpload hook with upload progress, cancellation, and error recovery
      Files: src/hooks/useFileUpload.ts
      Verify: Unit tests for file validation; integration test for upload lifecycle

- [ ] 24. Create useFormWithAutosave hook for managing form state, debouncing, and auto-saving single fields
      Files: src/hooks/useFormWithAutosave.ts
      Verify: Unit test debouncing works; auto-save triggered on blur with correct timing

---

## Phase 5: UI Components

- [ ] 25. Create base UI components (Button, Input, Textarea, Select, Card, Modal, Toast placeholder) in Tailwind following design system
      Files: src/components/ui/Button.tsx, Input.tsx, Textarea.tsx, Select.tsx, Card.tsx, Modal.tsx, and stubs for Toast integration
      Verify: Storybook or visual check in browser; button variants, input states, select dropdown work

- [ ] 26. Create form components (FormField, FormError, FormLabel) wrapping React Hook Form with Zod
      Files: src/components/form/FormField.tsx, FormError.tsx, FormLabel.tsx
      Verify: Component test showing field renders with error display; blur triggering validation

- [ ] 27. Create Wizard and WizardStep components for multi-step form navigation
      Files: src/components/wizard/Wizard.tsx, WizardStep.tsx
      Verify: Wizard renders correct step; navigation buttons work; step completion tracking displays

- [ ] 28. Integrate Sonner toast notifications and create toast utility function
      Files: src/lib/toast.ts (utility wrapper), src/components/ToastProvider.tsx (wrapper component)
      Verify: Toast appears on success/error; auto-dismisses or manual dismiss works

---

## Phase 6: Multi-Step Portfolio Editor Components

- [ ] 29. Create StepPersonalInfo component (Step 1) with autosave on blur for name, headline, bio, contact info, website
      Files: src/components/wizard/steps/StepPersonalInfo.tsx, matching test file
      Verify: Form fields render; blur triggers autosave; toast shows; errors display on validation failure

- [ ] 30. Create StepEducation component (Step 2) with multi-entry form for institution, degree, dates, CGPA, description
      Files: src/components/wizard/steps/StepEducation.tsx
      Verify: Add/edit/delete buttons work; Save Entry button creates entry; validation prevents invalid dates

- [ ] 31. Create StepSkills component (Step 3) with skill addition, categorization, max 50 limit
      Files: src/components/wizard/steps/StepSkills.tsx
      Verify: Skills display by category; add button toggles form; Save Skill button adds to list; add button disables at 50 skills

- [ ] 32. Create StepProjects component (Step 4) with project form (title, description, tech, category, image, URLs, dates, featured)
      Files: src/components/wizard/steps/StepProjects.tsx
      Verify: Image preview shows after upload; project list displays; featured projects highlighted; date validation works

- [ ] 33. Create StepCertifications component (Step 5) with cert form (title, issuer, dates, credential ID, verification URL, document)
      Files: src/components/wizard/steps/StepCertifications.tsx
      Verify: Date validation (issue_date required, expiration optional); document upload works; entry saved to list

- [ ] 34. Create StepExperience component (Step 6) with job form (title, company, type, location, dates, is_current, description)
      Files: src/components/wizard/steps/StepExperience.tsx
      Verify: is_current checkbox hides end_date; employment_type dropdown works; Save Entry adds to list

- [ ] 35. Create StepAchievements component (Step 7) with achievement form (title, description, date, category: award/publication/speaking/community/other)
      Files: src/components/wizard/steps/StepAchievements.tsx
      Verify: Category dropdown shows all options; achievement date required; Save Entry creates entry

- [ ] 36. Create StepSocialLinks component (Step 8) with social platform selection (GitHub, LinkedIn, Behance, Twitter, Dribbble, Instagram, website, other) and URL validation
      Files: src/components/wizard/steps/StepSocialLinks.tsx
      Verify: Platform dropdown unique per profile (no duplicates); URL validation works; Save Link adds to list

- [ ] 37. Create StepResume component (Step 9) with resume upload (PDF, private/public toggle), privacy explanation, and download link
      Files: src/components/wizard/steps/StepResume.tsx
      Verify: PDF upload works; privacy toggle saves to profiles.resume_privacy; resumeUrl query generates signed or public URL

- [ ] 38. Create StepDesignSettings component (Step 10) with template selection radio buttons, accent color picker, live preview component
      Files: src/components/wizard/steps/StepDesignSettings.tsx
      Verify: Template selection updates preview; color picker shows palette + text input; preview renders live with selected template/color

---

## Phase 7: Portfolio Template Components

- [ ] 39. Create MinimalTemplate component (Minimal Professional): clean text-heavy layout with hero, vertical sections, neutral colors
      Files: src/components/portfolio/templates/MinimalTemplate.tsx, MinimalTemplate.module.css or Tailwind
      Verify: Component renders all sections (about, skills, projects, etc.) when data present; hidden when empty; responsive on mobile

- [ ] 40. Create ModernTemplate component (Modern Developer): card-based layout, grid projects, sidebar skills, dark theme with color accents
      Files: src/components/portfolio/templates/ModernTemplate.tsx
      Verify: Project cards display image + tech stack; sidebar skills organized; experience shown as timeline; responsive grid

- [ ] 41. Create CreativeTemplate component (Creative Portfolio): image-first layout, masonry grid projects, bold typography, bento-grid arrangement
      Files: src/components/portfolio/templates/CreativeTemplate.tsx
      Verify: Hero section displays large; projects in masonry grid; images load correctly; typography scales responsively

- [ ] 42. Create PortfolioRenderer component that selects correct template based on profile.template_name and applies accent color + theme (dark/light) via CSS variables
      Files: src/components/portfolio/PortfolioRenderer.tsx
      Verify: Template switching works; accent color applied; theme toggle switches colors; all templates render in preview

---

## Phase 8: Enhanced Editor & Dashboard

- [ ] 43. Replace flat Editor.jsx with multi-step Wizard component, integrate all Step components, track completed_steps in profiles table
      Files: src/pages/Editor.tsx (rewritten to use Wizard + Steps)
      Verify: User navigates through 10 steps; Next disabled until step valid and saved; completion % updates; sessionStorage recovery tested

- [ ] 44. Update Dashboard.tsx to display profile completion %, recent portfolio status, quick action buttons (Edit, Preview, Publish, View Public, QR, Settings)
      Files: src/pages/Dashboard.tsx
      Verify: Dashboard shows progress bar; Publish button changes is_published; Preview shows side-by-side with template; quick actions navigate correctly

- [ ] 45. Enhance PublicPortfolio.tsx to render correct template based on profile.template_name and accent_color, support light/dark theme toggle
      Files: src/pages/PublicPortfolio.tsx
      Verify: Public profile loads template; theme toggle works; all portfolio data displays; unauthenticated users can view published profiles

---

## Phase 9: Landing Page & Navigation

- [ ] 46. Create Hero component with headline, subheadline, CTA buttons (Create Portfolio, Explore Examples), hero image/illustration
      Files: src/components/landing/Hero.tsx
      Verify: Buttons navigate to register and demo portfolio; headline and subheadline display

- [ ] 47. Create HowItWorks component with 4 vertical steps (sign up, fill form, choose template, publish & share) with icons
      Files: src/components/landing/HowItWorks.tsx
      Verify: 4 steps render with icons; description text displays; responsive layout

- [ ] 48. Create Features component showcasing 5-6 feature cards (multi-section, templates, QR codes, mobile-responsive, private/public, easy updates)
      Files: src/components/landing/Features.tsx
      Verify: Feature cards display with icons and descriptions; responsive grid on mobile/desktop

- [ ] 49. Create TemplateGallery component with 3 side-by-side cards (Minimal Professional, Modern Developer, Creative Portfolio) showing template preview images and "Use Template" CTA
      Files: src/components/landing/TemplateGallery.tsx
      Verify: 3 template cards visible; images load; buttons navigate/highlight selected template

- [ ] 50. Create FAQ component as accordion with 8-10 questions and answers; questions and answers from design doc Section 7.2
      Files: src/components/landing/FAQ.tsx
      Verify: Accordion expand/collapse works; all questions and answers display; responsive on mobile

- [ ] 51. Create Landing Footer with company info, links, social links, and CTA button
      Files: src/components/landing/Footer.tsx
      Verify: Footer renders at bottom; links navigate; CTA button visible

- [ ] 52. Update Home.tsx to use Hero, HowItWorks, Features, TemplateGallery, FAQ, Footer components
      Files: src/pages/Home.tsx
      Verify: Landing page loads; all sections visible and responsive

---

## Phase 10: Authentication & Account Management

- [ ] 53. Enhance AuthPage.tsx with email verification confirmation message (step: sent email, check inbox, verify link)
      Files: src/pages/AuthPage.tsx
      Verify: After registration, user sees "Check your email" message; verification link from Supabase Auth works

- [ ] 54. Create ForgotPassword page with email input → confirmation message; Supabase sends reset email
      Files: src/pages/ForgotPassword.tsx, update router in main.tsx
      Verify: Forget Password link from login routes to page; email input sends request; user receives reset email; reset link works

- [ ] 55. Create Settings page (/settings) with account info (email, created date), change password form, email preferences toggle, account deletion with email confirmation
      Files: src/pages/Settings.tsx, update router
      Verify: Change password form submits and updates auth; delete account requires email confirmation; after deletion, profile inaccessible; logout on delete

- [ ] 56. Create static Privacy Policy page at /privacy with template content (disclaimer + standard sections)
      Files: src/pages/Privacy.tsx, update router
      Verify: Page loads and displays policy text

- [ ] 57. Create static Terms of Service page at /terms with template content
      Files: src/pages/Terms.tsx, update router
      Verify: Page loads and displays terms text

---

## Phase 11: QR Code & Download Features

- [ ] 58. Create QRPage.tsx (/qr route) displaying portfolio QR code with download buttons (PNG, SVG) and publication status
      Files: src/pages/QRPage.tsx (enhanced from current)
      Verify: QR code displays; PNG download works (creates PNG file); SVG download works (creates SVG file); published/draft status shows

- [ ] 59. Create QR code download utility using qrcode package for PNG export and SVG serialization
      Files: src/lib/qr-code.ts (enhanced with export functions)
      Verify: Unit tests for PNG generation; SVG serialization test passes

---

## Phase 12: Error Handling & State Management

- [ ] 60. Create error boundary component to catch and display component errors gracefully
      Files: src/components/ErrorBoundary.tsx
      Verify: Test by throwing error in child component; error displays with retry option

- [ ] 61. Create session expiry handling: detect 401 errors, redirect to login with form data in sessionStorage, restore on re-auth
      Files: src/lib/supabase.ts (add error interceptor), src/hooks/useFormWithAutosave.ts (persist form state)
      Verify: Manually set token to invalid; attempt save; get 401; redirect to login with form preserved; re-login; form restored

---

## Phase 13: Testing Implementation

- [ ] 62. Create unit tests for validation schemas (Zod): test valid/invalid inputs for all form fields
      Files: src/lib/validation.test.ts
      Verify: `npm run test -- validation` passes all tests (50+ test cases)

- [ ] 63. Create unit tests for file utilities: MIME type validation, file size checks, URL validation
      Files: src/lib/file-storage.test.ts
      Verify: `npm run test -- file-storage` passes (20+ test cases)

- [ ] 64. Create unit tests for date/string utilities: date validation, URL parsing, slug generation
      Files: src/utils/date-utils.test.ts, string-utils.test.ts
      Verify: `npm run test -- utils` passes (30+ test cases)

- [ ] 65. Create component tests for UI components (Button, Input, Select) with variants and states
      Files: src/components/ui/Button.test.tsx, Input.test.tsx, Select.test.tsx
      Verify: `npm run test -- components/ui` passes (40+ test cases covering variants, disabled states, onClick)

- [ ] 66. Create form component tests showing React Hook Form integration with Zod validation
      Files: src/components/form/FormField.test.tsx
      Verify: Component renders with initial value; onChange updates state; blur triggers validation; errors display

- [ ] 67. Create integration tests for auth flow: register → email verification → login → logout
      Files: tests/integration/auth.test.tsx
      Verify: Test runs with mocked Supabase; signup creates user; login updates auth context; logout clears session

- [ ] 68. Create integration test for portfolio CRUD: create education entry → save → edit → delete
      Files: tests/integration/portfolio-crud.test.tsx
      Verify: Test queries/mutations work with mocked Supabase; entries saved and updated correctly

- [ ] 69. Create integration test for file upload: validate file → upload → get public URL
      Files: tests/integration/file-upload.test.tsx
      Verify: File validation passes/fails correctly; upload simulated; URL generation works

---

## Phase 14: Build & Verification

- [ ] 70. Verify TypeScript strict mode: run `npx tsc --noEmit` with no errors
      Files: entire src/ directory
      Verify: Zero TypeScript errors; types properly defined throughout

- [ ] 71. Run full test suite: `npm run test` and ensure 70%+ code coverage
      Files: all test files
      Verify: Coverage report shows 70%+ overall; critical paths (auth, upload, validation) at 80%+

- [ ] 72. Build for production: `npm run build` and verify no errors or warnings
      Files: src/, generated dist/
      Verify: Build completes; dist/ contains all assets; no console errors in build output

- [ ] 73. Verify responsive design: test all pages on mobile, tablet, desktop viewport sizes
      Files: src/pages/, src/components/
      Verify: Manual browser testing (or screenshot); all pages readable and functional at 375px, 768px, 1920px widths

- [ ] 74. Verify QR code functionality: generate QR on staging URL, scan on real iOS and Android device, verify resolution
      Files: src/pages/QRPage.tsx, src/lib/qr-code.ts
      Verify: QR scans; link resolves; portfolio renders correctly on both platforms

---

## Phase 15: Documentation & Deployment Prep

- [ ] 75. Update README.md with new features, setup steps for database migrations, and testing instructions
      Files: README.md
      Verify: README covers all new features; setup steps clear; testing command documented

- [ ] 76. Create DEPLOYMENT.md with Vercel setup, Supabase configuration checklist, environment variable documentation, and QR code validation steps
      Files: DEPLOYMENT.md (new file)
      Verify: Deployment checklist complete; all env vars documented; QR validation steps clear

- [ ] 77. Ensure .env.example includes all required variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_APP_URL)
      Files: .env.example
      Verify: All three variables present; comments explain each

---

## Digest

### Database Changes (supabase/schema.sql)
**Profile extensions:**
- Additions: department, specialization, cgpa, academic_description, state, country, professional_email, personal_website, template_name, accent_color, theme_preference, section_visibility, section_order, completed_steps, resume_privacy, date_of_birth
- Constraints: CGPA 0-10, valid email format, valid hex color, valid template/theme enum, valid resume_privacy enum
- Test: Run migration; `SELECT * FROM profiles WHERE id = [user_id]` confirms all columns exist

**Project extensions:**
- Additions: category, image_path, github_url, live_url, start_date, end_date, featured, order
- Constraints: dates valid (end >= start), category enum
- Indexes: projects_profile_featured_idx, projects_order_idx
- Test: Insert project with category; query by featured and order; confirm indexes used

**Education extensions:**
- Additions: department, specialization, cgpa, description, order
- Constraints: CGPA 0-10, order index
- Test: Insert education with CGPA > 10; expect constraint error

**Certifications extensions:**
- Additions: document_path, expiration_date, issue_date, credential_id, order
- Constraints: issue_date required (migrated from created_at), expiration >= issue_date, order index
- Rename: credential_url → credential_verification_url
- Test: Insert cert with missing issue_date; expect error; insert with valid dates; confirm order index

**New tables:**
- Skills: id, profile_id FK, skill_name, category (enum), order, created_at, RLS policies enabled
  Test: Insert skill for user; verify RLS allows owner read/write; anon cannot read unless profile published

- Experiences: id, profile_id FK, job_title, company_name, employment_type, location, start_date, end_date, is_current, description, order, created_at, RLS policies
  Test: Insert with is_current=true and end_date null; confirm trigger allows; insert with is_current=false and end_date before start_date; expect error

- Achievements: id, profile_id FK, title, description, achievement_date, category, order, created_at, RLS policies
  Test: Insert achievement; verify RLS enforces ownership

- Social_links: id, profile_id FK, platform (enum), url, order, created_at, unique(profile_id, platform), RLS policies
  Test: Insert two GitHub links for same profile; expect unique constraint error; insert GitHub and LinkedIn; confirm both saved

**Storage buckets:**
- projects: public, 5MB, image MIME types only, RLS upload to own folder
- certificates: private, 10MB, PDF only, RLS signed URLs
- resumes: private, 10MB, PDF only, RLS signed URLs
- Test: Upload avatar >2MB; expect error; upload valid image; query storage.objects and confirm file stored; attempt upload from different user; expect 403

**Email verification trigger:**
- Block publish if email not verified in auth.users
- Test: Register unverified user, attempt to set is_published=true; expect "Email must be verified" error

### Code Changes
**src/types/index.ts:**
- Exports: Profile (with all extended fields), Project, Education, Certification, Skill, Experience, Achievement, SocialLink, Portfolio interface
- Test: Import all types in component; TypeScript strict mode accepts no `any`

**src/lib/validation.ts:**
- Zod schemas for: PersonalInfoSchema, EducationSchema, SkillSchema, ProjectSchema, CertificationSchema, ExperienceSchema, AchievementSchema, SocialLinkSchema, DesignSettingsSchema
- Test: `npm run test -- validation` passes; invalid data rejected, valid data accepted

**src/lib/file-storage.ts:**
- Functions: uploadFile(file, bucket, userId), getSignedUrl(path, bucket), getPublicUrl(path, bucket), sanitizeFileName(name)
- Error scenarios: file too large, invalid MIME, network timeout
- Test: `npm run test -- file-storage` passes; error messages clear

**src/lib/qr-code.ts:**
- Functions: generateQRData(url), downloadQRPNG(qrElement, slug), downloadQRSVG(qrElement, slug)
- Test: Unit test QR data generation; PNG/SVG downloads create blobs

**src/hooks/useProfile.ts:**
- Hooks: useProfile(userId), useUpdateProfile()
- Test: Mock Supabase; query hook fetches profile; mutation hook updates and invalidates cache

**src/hooks/useFormWithAutosave.ts:**
- Hook: useFormWithAutosave(initialData, saveFn, debounceMs)
- Test: Field blur triggers debounced save after 500ms; multiple blurs collapse to one save

**src/components/ui/Button.tsx:**
- Props: variant (primary/secondary/danger), size (sm/md/lg), disabled, onClick, children, className, type
- Test: `npm run test -- Button` passes; all variants render; disabled state works; onClick fires

**src/components/wizard/Wizard.tsx:**
- Props: children (WizardStep components), currentStep, onNext, onPrev, isStepComplete (fn to check if step valid+saved)
- Test: Component renders current step; navigation buttons call callbacks; completion tracked

**src/pages/Editor.tsx:**
- Structure: Wizard with 10 WizardStep children (one per step component)
- Autosave: Step 1, 9, 10 autosave on blur; steps 2-8 require Save Entry button
- Completion tracking: calls updateProfile({ completed_steps: {...} }) on Next
- Test: Navigate through steps; save entry; completion % increases; session timeout restores form from sessionStorage

**src/pages/Dashboard.tsx:**
- Display: profile completion %, portfolio status (Draft/Published), 6 quick action buttons
- Statistics: project count, cert count, completion %
- Test: Dashboard loads; quick action buttons navigate; publish button toggles is_published

**src/pages/Home.tsx:**
- Structure: Hero → HowItWorks → Features → TemplateGallery → FAQ → Footer
- Test: Landing page loads; all sections render; CTA buttons navigate

**src/pages/Settings.tsx:**
- Sections: Display email/created_at (read-only), Change password form, Delete account with confirmation
- Test: Password form submits; account deletion requires email confirmation; profile gone after delete

**src/pages/QRPage.tsx:**
- Display: QR code, publication status (Draft/Published), download buttons (PNG, SVG)
- Test: QR renders; downloads create files with correct names; status reflects is_published

**src/pages/AuthPage.tsx (enhanced):**
- Step 2 after registration: "Check your email" message + resend link button
- Supabase Auth handles email sending
- Test: Register; see confirmation message; click verification link in email; login succeeds

**src/pages/ForgotPassword.tsx (new):**
- Form: email input, submit button
- Supabase Auth sends reset email
- Test: Submit email; check email for reset link; click link → reset password form; new password works

**src/pages/Privacy.tsx & Terms.tsx (new):**
- Static markdown content; template policy text
- Test: Pages load; text displays

**Test files:**
- tests/setup.ts: Vitest + React Testing Library + Happy DOM configuration, Supabase mocks
- src/lib/validation.test.ts: 50+ test cases for all schemas
- src/lib/file-storage.test.ts: 20+ test cases for MIME, size, URL validation
- src/utils/date-utils.test.ts, string-utils.test.ts: 30+ test cases
- src/components/ui/Button.test.tsx, Input.test.tsx, Select.test.tsx: 40+ test cases
- tests/integration/auth.test.tsx, portfolio-crud.test.tsx, file-upload.test.tsx: 30+ test cases
- Test command: `npm run test` or `npm run test -- [pattern]`
- Coverage: `npm run test -- --coverage`

### Verification
**Build:** `npm run build`
- Expected: No errors, dist/ folder created, Vite output shows bundle size

**TypeScript:** `npx tsc --noEmit`
- Expected: Zero errors in strict mode

**Tests:** `npm run test`
- Expected: 70%+ code coverage; all critical paths (auth, file upload, validation) at 80%+

**Dev server:** `npm run dev`
- Expected: `http://localhost:5173` loads landing page; login/register flows work; editor multi-step navigation works; publish/unpublish toggles

**QR code:** Generate QR on staging deployment, scan on iOS and Android
- Expected: QR scans successfully; URL resolves to published portfolio; portfolio renders correctly on both platforms

---

## Notes

- TypeScript migration prioritizes strict mode; all new code uses TypeScript.
- Autosave debouncing set to 500ms; configurable in useFormWithAutosave.
- File size limits: avatars 2MB, projects 5MB, certificates/resumes 10MB; configurable in UPLOAD_CONFIG.
- All form steps require email verification before publishing; enforced at database level.
- QR code error correction level: 'H' (High); can adjust to 'M' if scanning issues on some devices.
- Session storage for form recovery: keyed as `portfolioEditor:step{N}`; cleared on successful save or logout.
- Three portfolio templates: Minimal Professional (default), Modern Developer, Creative Portfolio; templates are React components that receive profile data.
- RLS policies consistently applied: SELECT visible if owner OR published; INSERT/UPDATE/DELETE owner-only.
- Environment variable VITE_APP_URL must be a public URL for QR codes to work on other devices (localhost QR codes only work on dev machine).
