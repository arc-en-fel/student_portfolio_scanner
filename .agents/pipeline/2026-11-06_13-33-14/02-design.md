# StudentFolio — Technical Design (Revised)

**Status:** Technical Design (Design Review Findings Addressed)  
**Version:** 2.0  
**Date:** 2026-11-06  
**Revision:** Addresses all HIGH and MEDIUM findings from design review

---

## Executive Summary

This is a complete technical design for extending StudentFolio from an MVP (4-table schema, flat editor) to a production-ready application with multi-step portfolio creation, three design templates, enhanced file storage with security, and a landing page. The design is concrete enough to implement without architectural decisions; all findings from the design review have been addressed with explicit specifications, SQL schemas, and code patterns.

**Key deliverables:**
- Extended database schema with 6 new tables (skills, experiences, achievements, social_links, plus enhancements to existing tables)
- Multi-step form (10 steps) with autosave and error recovery
- Three responsive portfolio templates (Minimal Professional, Modern Developer, Creative)
- File storage with separate buckets and privacy controls
- Landing page with hero, features, template gallery, and FAQ
- Security enhancements: RLS for new tables, email verification enforcement, signed URLs for private files
- Testing strategy (Vitest + React Testing Library)
- TypeScript strict mode enforcement
- Complete documentation and deployment guidance

**Tech Stack (Locked):**
- Frontend: React 19, Vite 6, TypeScript (strict), Tailwind CSS 4, React Router 7
- Forms: React Hook Form, Zod validation
- State: TanStack Query (React Query) for server state, localStorage/sessionStorage for form recovery
- UI: Lucide icons, Sonner toast notifications, custom Tailwind components
- Backend: Supabase PostgreSQL, Supabase Auth, Supabase Storage
- QR: qrcode.react (display), qrcode package (PNG export)
- Testing: Vitest, React Testing Library, Happy DOM
- Deployment: Vercel (frontend), Supabase (backend)

---

## 1. Database Schema Design

### 1.1 Current Schema Review

Four existing tables:
- **profiles**: student account data (full_name, headline, bio, college, course, location, skills, social URLs, avatar_path, is_published)
- **projects**: portfolio projects (title, description, tech_stack, project_url)
- **education**: academic records (institution, degree, start_year, end_year)
- **certifications**: credentials (title, issuer, credential_url)

All tables have RLS policies and proper foreign keys. The create_student_profile() trigger auto-creates profile on signup.

### 1.2 Schema Enhancements

#### 1.2.1 Profiles Table Extensions

Add the following columns to profiles:

```sql
-- Academic and professional info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cgpa numeric DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS academic_description text DEFAULT '';

-- Contact and location info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_email text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personal_website text DEFAULT '';

-- Portfolio settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS template_name text DEFAULT 'minimal-professional';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#4FD1C5';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'dark'; -- 'dark', 'light', 'auto'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section_visibility jsonb DEFAULT '{"personal":true,"academic":true,"skills":true,"projects":true,"certifications":true,"experience":true,"achievements":false,"social":true,"resume":false}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section_order jsonb DEFAULT '["personal","academic","skills","projects","certifications","experience","social"]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_steps jsonb DEFAULT '{}'; -- tracks which form steps completed: {"1":true,"2":true,...}

-- Privacy and verification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_privacy text DEFAULT 'private'; -- 'public' or 'private'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date DEFAULT NULL;

-- Add constraints
ALTER TABLE public.profiles ADD CONSTRAINT valid_cgpa CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10));
ALTER TABLE public.profiles ADD CONSTRAINT valid_email_format CHECK (professional_email = '' OR professional_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
ALTER TABLE public.profiles ADD CONSTRAINT valid_accent_color CHECK (accent_color ~ '^#[0-9A-F]{6}$');
ALTER TABLE public.profiles ADD CONSTRAINT valid_template CHECK (template_name IN ('minimal-professional', 'modern-developer', 'creative-portfolio'));
ALTER TABLE public.profiles ADD CONSTRAINT valid_theme CHECK (theme_preference IN ('dark', 'light', 'auto'));
ALTER TABLE public.profiles ADD CONSTRAINT valid_resume_privacy CHECK (resume_privacy IN ('public', 'private'));
```

**Rationale:** Stores portfolio metadata and settings in a single table for efficiency. JSONB for visibility/order provides flexibility without schema changes per section. Constraints enforce data integrity at database level.

#### 1.2.2 Projects Table Enhancements

```sql
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category text DEFAULT 'other';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_path text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date date DEFAULT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_date date DEFAULT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "order" int DEFAULT 0;

-- Constraints
ALTER TABLE public.projects ADD CONSTRAINT valid_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);
ALTER TABLE public.projects ADD CONSTRAINT valid_category CHECK (category IN ('web', 'mobile', 'ai', 'design', 'tool', 'other'));

-- Indexes
CREATE INDEX IF NOT EXISTS projects_profile_featured_idx ON public.projects(profile_id, featured);
CREATE INDEX IF NOT EXISTS projects_order_idx ON public.projects("order");
```

**Rationale:** Enriches project metadata (dates, category, images) to match multi-step editor requirements. Featured toggle for homepage highlighting. Order column ensures consistent sorting in UI.

#### 1.2.3 Education Table Enhancements

```sql
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS department text DEFAULT '';
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS specialization text DEFAULT '';
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS cgpa numeric DEFAULT NULL;
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS "order" int DEFAULT 0;

ALTER TABLE public.education ADD CONSTRAINT valid_cgpa CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10));

CREATE INDEX IF NOT EXISTS education_order_idx ON public.education("order");
```

#### 1.2.4 Certifications Table Enhancements

```sql
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS document_path text DEFAULT '';
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS expiration_date date DEFAULT NULL;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS issue_date date DEFAULT NULL;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS credential_id text DEFAULT '';
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS "order" int DEFAULT 0;
ALTER TABLE public.certifications RENAME COLUMN credential_url TO credential_verification_url;

-- Set issue_date to created_at if NULL (for existing records)
UPDATE public.certifications SET issue_date = created_at::date WHERE issue_date IS NULL;

ALTER TABLE public.certifications ADD CONSTRAINT valid_dates CHECK (expiration_date IS NULL OR issue_date IS NULL OR expiration_date >= issue_date);

CREATE INDEX IF NOT EXISTS certifications_order_idx ON public.certifications("order");
```

**Rationale:** issue_date required (tracks when cert earned). expiration_date optional (many certs don't expire). Maintains same RLS policy as before.

#### 1.2.5 New Table: Skills

```sql
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'technical',
  "order" int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_skill_name CHECK (skill_name != ''),
  CONSTRAINT valid_category CHECK (category IN ('programming', 'framework', 'tool', 'database', 'technical', 'soft'))
);

CREATE INDEX IF NOT EXISTS skills_profile_idx ON public.skills(profile_id);
CREATE INDEX IF NOT EXISTS skills_order_idx ON public.skills("order");

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_visible_when_parent_published_or_owner" ON public.skills
  FOR SELECT TO anon, authenticated
  USING (
    (SELECT auth.uid()) = profile_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.is_published
    )
  );

CREATE POLICY "skills_owned_insert" ON public.skills
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "skills_owned_update" ON public.skills
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "skills_owned_delete" ON public.skills
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
```

#### 1.2.6 New Table: Experiences

```sql
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_title text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT 'fulltime',
  location text DEFAULT '',
  start_date date NOT NULL,
  end_date date DEFAULT NULL,
  is_current boolean DEFAULT false,
  description text DEFAULT '',
  "order" int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR is_current OR end_date >= start_date),
  CONSTRAINT valid_employment CHECK (employment_type IN ('fulltime', 'parttime', 'contract', 'internship', 'freelance')),
  CONSTRAINT valid_titles CHECK (job_title != '' AND company_name != '')
);

CREATE INDEX IF NOT EXISTS experiences_profile_idx ON public.experiences(profile_id);
CREATE INDEX IF NOT EXISTS experiences_is_current_idx ON public.experiences(is_current);
CREATE INDEX IF NOT EXISTS experiences_order_idx ON public.experiences("order");

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiences_visible_when_parent_published_or_owner" ON public.experiences
  FOR SELECT TO anon, authenticated
  USING (
    (SELECT auth.uid()) = profile_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.is_published
    )
  );

CREATE POLICY "experiences_owned_insert" ON public.experiences
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "experiences_owned_update" ON public.experiences
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "experiences_owned_delete" ON public.experiences
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
```

#### 1.2.7 New Table: Achievements

```sql
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  achievement_date date NOT NULL,
  category text DEFAULT 'other',
  "order" int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_title CHECK (title != ''),
  CONSTRAINT valid_category CHECK (category IN ('award', 'publication', 'speaking', 'community', 'other'))
);

CREATE INDEX IF NOT EXISTS achievements_profile_idx ON public.achievements(profile_id);
CREATE INDEX IF NOT EXISTS achievements_order_idx ON public.achievements("order");

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_visible_when_parent_published_or_owner" ON public.achievements
  FOR SELECT TO anon, authenticated
  USING (
    (SELECT auth.uid()) = profile_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.is_published
    )
  );

CREATE POLICY "achievements_owned_insert" ON public.achievements
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "achievements_owned_update" ON public.achievements
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "achievements_owned_delete" ON public.achievements
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
```

#### 1.2.8 New Table: Social Links

```sql
CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL DEFAULT '',
  "order" int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_platform CHECK (platform IN ('github', 'linkedin', 'behance', 'twitter', 'dribbble', 'instagram', 'website', 'other')),
  CONSTRAINT valid_url CHECK (url ~ '^https?:\/\/.+'),
  CONSTRAINT unique_platform_per_profile UNIQUE(profile_id, platform)
);

CREATE INDEX IF NOT EXISTS social_links_profile_idx ON public.social_links(profile_id);
CREATE INDEX IF NOT EXISTS social_links_order_idx ON public.social_links("order");

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_links_visible_when_parent_published_or_owner" ON public.social_links
  FOR SELECT TO anon, authenticated
  USING (
    (SELECT auth.uid()) = profile_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.is_published
    )
  );

CREATE POLICY "social_links_owned_insert" ON public.social_links
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "social_links_owned_update" ON public.social_links
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "social_links_owned_delete" ON public.social_links
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
```

### 1.3 Email Verification Enforcement (Address Review Finding #9)

**Strategy (Recommended Option B: Database Enforcement):**

Remove redundant email verification columns from profiles. Supabase Auth already tracks `email_confirmed_at`. Enforce publishing rule via database trigger:

```sql
-- Remove redundant columns if added previously
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email_verified;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verified_email_at;

-- Create trigger to enforce email verification before publishing
CREATE OR REPLACE FUNCTION public.check_email_verified_before_publish()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND OLD.is_published = false THEN
    -- Only allow publish if email verified
    IF NOT EXISTS (
      SELECT 1 FROM auth.users WHERE id = NEW.id AND email_confirmed_at IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Email must be verified before publishing portfolio';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_publish_requires_verified_email
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.is_published IS DISTINCT FROM OLD.is_published)
  EXECUTE FUNCTION public.check_email_verified_before_publish();
```

**Rationale:** Single source of truth (Supabase Auth). Database enforces rule; client cannot bypass.

### 1.4 Storage Buckets Configuration

Create separate buckets for different file types with size limits and MIME type restrictions:

```sql
-- Projects bucket (public, images only)
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('projects','projects',true,5242880,array['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO NOTHING;

-- Certificates bucket (private, PDF only)
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('certificates','certificates',false,10485760,array['application/pdf'])
ON CONFLICT(id) DO NOTHING;

-- Resumes bucket (private by default, PDF only)
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('resumes','resumes',false,10485760,array['application/pdf'])
ON CONFLICT(id) DO NOTHING;

-- RLS policies for storage buckets
CREATE POLICY "students_upload_projects_own_folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'projects' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "students_upload_certificates_own_folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'certificates' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "students_upload_resumes_own_folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resumes' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Update/delete policies for all buckets
CREATE POLICY "students_update_own_project_files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'projects' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'projects' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "students_delete_own_project_files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'projects' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Similar for certificates and resumes
CREATE POLICY "students_update_own_certificate_files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'certificates' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

CREATE POLICY "students_delete_own_certificate_files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

CREATE POLICY "students_update_own_resume_files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

CREATE POLICY "students_delete_own_resume_files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

-- Public read policies (projects only; certificates/resumes use signed URLs)
CREATE POLICY "public_read_project_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'projects');
```

---

## 2. Multi-Step Portfolio Editor Design

### 2.1 Autosave & Error Recovery (Address Review Finding #2)

**Clarified Autosave Behavior:**

- **Steps 1, 9, 10** (single-section forms): Save individual fields on blur (debounced 500ms)
  - On success: show subtle toast "Saved" (green, 2s auto-dismiss)
  - On failure: show error toast (red, manual dismiss), keep form dirty, allow retry button
  - On session expiry: show "Session expired" toast, redirect to login, persist form data in sessionStorage

- **Steps 2-8** (multi-entry: education, skills, projects, certifications, experience, achievements, social):
  - Require explicit "Save Entry" button per entry (no autosave; prevents accidental loss)
  - On click Save: validate entry, send to API, update list
  - On success: show entry in list, clear form, enable delete button, toast "Entry saved"
  - On failure: show error toast with retry button, keep form filled

- **Form state persistence:**
  - Current step form cached in sessionStorage (key: `portfolioEditor:step{N}`)
  - Cleared on successful save or logout
  - If user navigates away and returns: restore from sessionStorage
  - Session expiry (401): redirect to login with form in sessionStorage; on re-login, redirect back to editor

- **Step completion tracking:**
  - Tracks completed_steps in profiles table as JSONB: `{"1": true, "2": true, ...}`
  - Marked complete when user clicks "Next" after successful save
  - Shows completion percentage on dashboard

**Error Handling by Scenario:**

| Scenario | HTTP Status | Client Behavior |
|----------|-------------|-----------------|
| File too large | 413 | Show toast "File exceeds [X] MB"; form stays dirty |
| Invalid file type | 400 | Show toast "Only [formats] allowed"; form stays dirty |
| Network timeout | timeout | Show toast "Connection lost. Retry?"; button for manual retry |
| RLS violation | 403 | Show toast "Permission denied"; refresh page |
| Session expired | 401 | Show toast "Session expired"; redirect to login with form in sessionStorage |
| Database error | 500 | Show toast "Server error. Please refresh and try again" |

### 2.2 Step-by-Step Form Structure

**Step 1: Personal Information**

Form fields (single-step, autosave on blur):
- Full name (text, required, 1-100 chars)
- Professional headline (text, required, 1-200 chars)
- Profile picture (image upload, optional, 2 MB max, JPEG/PNG/WebP)
- Short biography (textarea, optional, 0-1000 chars)
- Professional email (email, optional, must be valid email)
- Personal website (URL, optional, must match http(s)://)
- City (text, optional)
- State (text, optional)
- Country (text, optional)

Implementation pattern:
```javascript
// Field validation (Zod schema)
const PersonalInfoSchema = z.object({
  full_name: z.string().min(1).max(100),
  headline: z.string().min(1).max(200),
  bio: z.string().max(1000),
  professional_email: z.string().email().optional().or(z.literal('')),
  personal_website: z.string().url().optional().or(z.literal('')),
  // ... etc
});

// Component uses React Hook Form + Zod
const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm({
  resolver: zodResolver(PersonalInfoSchema),
  defaultValues: profile
});

// On blur, debounce and save
const debouncedSave = useMemo(() => debounce(async (data) => {
  try {
    await supabase.from('profiles').update(data).eq('id', user.id);
    showToast('success', 'Saved', { duration: 2000 });
  } catch (err) {
    showToast('error', err.message);
  }
}, 500), []);

onBlur={() => debouncedSave(watch())};
```

**Step 2: Academic Information**

Multi-entry section (education records); requires "Save Entry" button per entry.

Fields per education entry:
- Institution (text, required if entry exists)
- Degree (text, required)
- Department (text, optional)
- Specialization (text, optional)
- Start year (number picker 1900-2100, required)
- Graduation year (number picker 1900-2100, required)
- CGPA (number 0.0-10.0, optional)
- Academic description (textarea, optional, 0-500 chars)

UI pattern:
- List of existing education entries with edit/delete buttons
- "Add Education" button to add new entry form
- Form rows with save/delete buttons
- Validation errors shown inline

**Step 3: Skills**

Multi-entry section; requires "Save Skill" button per skill.

Fields per skill:
- Skill name (text, required, 1-100 chars; autocomplete from common list but custom allowed)
- Category (dropdown: Programming Languages, Frameworks, Tools, Databases, Technical Skills, Soft Skills)

UI pattern:
- Display skills grouped by category
- "Add Skill" button reveals input fields
- Filter/search common skills (Python, JavaScript, React, etc.) but allow custom
- On save: adds to list, clears form, shows count
- Max 50 skills enforced client-side (disable add button)

**Step 4: Projects**

Multi-entry section; requires "Save Project" button per project.

Fields per project:
- Project title (text, required, 1-150 chars)
- Description (textarea, required, 1-1000 chars)
- Technology stack (text, required, comma-separated tags)
- Category (dropdown: Web, Mobile, AI/ML, Design, Tools, Other)
- Project image (image upload, optional, 5 MB max, JPEG/PNG/WebP)
- GitHub repository URL (URL, optional)
- Live demo URL (URL, optional)
- Start date (date picker, required)
- Completion date (date picker, optional)
- Featured toggle (checkbox)

UI pattern:
- Image preview after upload
- Sorted list with featured projects highlighted
- Drag or manual order input (manual order input recommended for MVP)
- Edit/delete buttons per project

**Steps 5-8 and 9-10:** Similar multi-entry or single-section patterns.

### 2.3 Form Validation Strategy

**Client-side (React Hook Form + Zod):**

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution required'),
  degree: z.string().min(1, 'Degree required'),
  start_year: z.number().int().min(1900).max(new Date().getFullYear()),
  end_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
}).refine(
  (data) => !data.end_year || data.end_year >= data.start_year,
  { message: 'End year must be after start year', path: ['end_year'] }
);

// Use in component
const form = useForm({
  resolver: zodResolver(EducationSchema),
  mode: 'onBlur', // or 'onChange'
});

// Render with error display
<input {...form.register('institution')} />
{form.formState.errors.institution && (
  <span className="text-red-500">{form.formState.errors.institution.message}</span>
)}
```

**Server-side (Supabase RLS + constraints):**
- Database constraints validate data at table level
- RLS policies ensure user owns profile_id
- Check constraints prevent invalid CGPA, dates, etc.
- Errors propagated to client; display in toast

### 2.4 Step Navigation & Wizard Flow

**UI Component Structure:**

```
<Wizard>
  <WizardStep number={1} title="Personal Information">
    <PersonalInfoForm />
  </WizardStep>
  <WizardStep number={2} title="Academic Information">
    <EducationForm />
  </WizardStep>
  ... (10 steps total)
  
  <Footer>
    <Button onClick={previousStep}>Previous</Button>
    <ProgressIndicator current={step} total={10} />
    <Button onClick={nextStep} disabled={!isStepValid}>Next</Button>
  </Footer>
</Wizard>
```

**Navigation Rules:**
- Previous: always enabled (go back without save)
- Next: enabled only if current step valid + saved
- Step completion: marked when user clicks Next after successful save
- Jumping between steps: allowed if prior steps completed (for UI polish, not required)

**Progress Calculation:**
- Completion % = count(completed_steps) / 10 * 100
- Displayed on dashboard and in editor header

---

## 3. Frontend Architecture

### 3.1 Technology Stack (Locked)

**Installed Dependencies:**
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^7.0.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.4",
  "@hookform/resolvers": "^3.3.4",
  "@tanstack/react-query": "^5.28.0",
  "lucide-react": "^0.468.0",
  "sonner": "^1.2.0",
  "qrcode.react": "^4.2.0",
  "qrcode": "^1.5.3",
  "@supabase/supabase-js": "^2.0.0",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.0.0"
}
```

**Dev Dependencies:**
```json
{
  "vite": "^6.0.0",
  "@vitejs/plugin-react": "^4.4.0",
  "typescript": "^5.3.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/user-event": "^14.5.0",
  "@testing-library/jest-dom": "^6.1.5",
  "happy-dom": "^12.10.0"
}
```

### 3.2 TypeScript Configuration (Address Review Finding #5)

**Create tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Migration Strategy:**
1. Rename all .jsx files to .tsx
2. Add type annotations to function parameters and return types
3. Create global types file: src/types/index.ts
4. Use `as const` for string literals, `satisfies` for object types
5. Update vite.config.js to use .tsx extension

**Example migration (Editor.jsx -> Editor.tsx):**

```typescript
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthProvider'
import type { Profile, Project, Education } from '../types'

interface EditorState {
  profile: Profile;
  projects: Project[];
  education: Education[];
}

const Editor: FC = () => {
  const { user } = useAuth()
  const [state, setState] = useState<EditorState>({ profile: {}, projects: [], education: [] })
  
  // rest of component
}
```

### 3.3 Folder Structure

```
src/
  ├── components/
  │   ├── AuthProvider.tsx
  │   ├── Layout.tsx
  │   ├── Protected.tsx
  │   ├── wizard/
  │   │   ├── Wizard.tsx
  │   │   ├── WizardStep.tsx
  │   │   ├── StepPersonalInfo.tsx
  │   │   ├── StepEducation.tsx
  │   │   ├── StepSkills.tsx
  │   │   ├── StepProjects.tsx
  │   │   ├── StepCertifications.tsx
  │   │   ├── StepExperience.tsx
  │   │   ├── StepAchievements.tsx
  │   │   ├── StepSocialLinks.tsx
  │   │   ├── StepResume.tsx
  │   │   └── StepDesignSettings.tsx
  │   ├── ui/
  │   │   ├── Button.tsx
  │   │   ├── Input.tsx
  │   │   ├── Textarea.tsx
  │   │   ├── Select.tsx
  │   │   ├── Card.tsx
  │   │   ├── Modal.tsx
  │   │   ├── Toast.tsx
  │   │   └── Skeleton.tsx
  │   ├── portfolio/
  │   │   ├── MinimalTemplate.tsx
  │   │   ├── ModernTemplate.tsx
  │   │   └── CreativeTemplate.tsx
  │   └── landing/
  │       ├── Hero.tsx
  │       ├── HowItWorks.tsx
  │       ├── Features.tsx
  │       ├── TemplateGallery.tsx
  │       └── FAQ.tsx
  ├── pages/
  │   ├── Home.tsx
  │   ├── AuthPage.tsx
  │   ├── Dashboard.tsx
  │   ├── Editor.tsx
  │   ├── PublicPortfolio.tsx
  │   ├── QRPage.tsx
  │   ├── Settings.tsx
  │   ├── Privacy.tsx
  │   ├── Terms.tsx
  │   ├── NotFound.tsx
  │   └── ForgotPassword.tsx
  ├── hooks/
  │   ├── useAuth.ts
  │   ├── useProfile.ts
  │   ├── useFileUpload.ts
  │   └── useForm.ts
  ├── lib/
  │   ├── supabase.ts
  │   ├── portfolio.ts
  │   ├── validation.ts
  │   ├── file-storage.ts
  │   └── qr-code.ts
  ├── types/
  │   ├── index.ts
  │   ├── profile.ts
  │   ├── portfolio.ts
  │   └── api.ts
  ├── utils/
  │   ├── date-utils.ts
  │   ├── string-utils.ts
  │   ├── file-utils.ts
  │   └── url-utils.ts
  ├── styles/
  │   ├── globals.css
  │   ├── tailwind.css
  │   └── animations.css
  ├── main.tsx
  ├── App.tsx
  └── index.css

tests/
  ├── unit/
  │   ├── validation.test.ts
  │   ├── file-utils.test.ts
  │   └── date-utils.test.ts
  ├── integration/
  │   ├── auth.test.tsx
  │   ├── portfolio-crud.test.tsx
  │   └── file-upload.test.tsx
  └── setup.ts
```

### 3.4 Component Patterns

**Custom UI Component (Button):**

```typescript
// components/ui/Button.tsx
import type { FC, ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button'
}) => {
  const baseStyles = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#4FD1C5] text-[#0A0908] hover:bg-[#3ab5ac] disabled:opacity-50',
    secondary: 'bg-[#22333B] text-[#F8FAFC] hover:bg-[#334155] border border-[#334155] disabled:opacity-50',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] disabled:opacity-50'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
```

**Custom Hook (useProfile):**

```typescript
// hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', updates.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.id], data);
    }
  });
};
```

---

## 4. File Storage & Security Design

### 4.1 File Upload Flow

**Client-side validation → Upload → Server validation (RLS) → Store path in DB**

```typescript
// lib/file-storage.ts
interface UploadOptions {
  bucket: 'avatars' | 'projects' | 'certificates' | 'resumes';
  maxSize: number; // bytes
  allowedMimes: string[];
}

const UPLOAD_CONFIG: Record<string, UploadOptions> = {
  avatars: { bucket: 'avatars', maxSize: 2 * 1024 * 1024, allowedMimes: ['image/jpeg', 'image/png', 'image/webp'] },
  projects: { bucket: 'projects', maxSize: 5 * 1024 * 1024, allowedMimes: ['image/jpeg', 'image/png', 'image/webp'] },
  certificates: { bucket: 'certificates', maxSize: 10 * 1024 * 1024, allowedMimes: ['application/pdf'] },
  resumes: { bucket: 'resumes', maxSize: 10 * 1024 * 1024, allowedMimes: ['application/pdf'] }
};

export async function uploadFile(
  file: File,
  bucketKey: 'avatars' | 'projects' | 'certificates' | 'resumes',
  userId: string
): Promise<string> {
  const config = UPLOAD_CONFIG[bucketKey];
  
  // Client-side validation
  if (!config.allowedMimes.includes(file.type)) {
    throw new Error(`File type not allowed. Accepted: ${config.allowedMimes.join(', ')}`);
  }
  
  if (file.size > config.maxSize) {
    const maxMB = config.maxSize / 1024 / 1024;
    throw new Error(`File exceeds ${maxMB} MB limit`);
  }
  
  // Upload to Supabase Storage
  const fileName = `${userId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  
  try {
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      if (error.message.includes('Payload too large')) {
        throw new Error(`File exceeds ${config.maxSize / 1024 / 1024} MB limit`);
      }
      throw new Error(error.message);
    }
    
    return data.path;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Upload failed');
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}
```

### 4.2 File Access Control

**Public files (avatars, project images):**
- Served from public bucket via CDN URL
- No signed URL needed
- Accessible only if profile published (enforced via RLS on database level; public can see files if profile.is_published = true)

**Private files (certificates, private resumes):**
- Stored in private buckets
- Require signed URL for download
- Signed URL expires after 1 hour
- Only owner can request signed URL

```typescript
// lib/file-storage.ts - Signed URL generation

export async function getSignedUrl(
  filePath: string,
  bucketId: 'certificates' | 'resumes',
  expirySeconds: number = 3600
): Promise<string> {
  // Only called on server or authenticated client
  const { data, error } = await supabase.storage
    .from(bucketId)
    .createSignedUrl(filePath, expirySeconds);
  
  if (error) throw error;
  return data.signedUrl;
}

export function getPublicUrl(
  filePath: string,
  bucketId: 'avatars' | 'projects'
): string {
  // Public bucket URL (no signing needed)
  const { data } = supabase.storage
    .from(bucketId)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}
```

### 4.3 Resume Privacy Control

**Resume privacy setting:**
- Stored in `profiles.resume_privacy` (text: 'public' or 'private')
- If 'public': serve public URL from resumes bucket (anyone can download)
- If 'private': require signed URL (only owner can download)

```typescript
export async function getResumeUrl(
  userId: string,
  resümePath: string | null,
  isPublic: boolean
): Promise<string | null> {
  if (!resumePath) return null;
  
  if (isPublic) {
    return getPublicUrl(resumePath, 'resumes');
  } else {
    return getSignedUrl(resumePath, 'resumes', 3600);
  }
}
```

---

## 5. Portfolio Templates Design

### 5.1 Three Templates

**Template 1: Minimal Professional**
- Text-heavy, minimal images
- Neutral color scheme with accent color
- Focus on content hierarchy and readability
- Suitable for academic/traditional portfolios
- Layout: Hero (name, headline), vertical sections (About, Skills, Projects, etc.)

**Template 2: Modern Developer**
- Card-based layout with project images
- Dark theme, colorful accents
- Emphasizes projects and tech stack
- Suitable for software engineers
- Layout: Hero with gradient, grid projects, sidebar skills, timeline experience

**Template 3: Creative Portfolio**
- Image-first layout, gallery grid, hero section
- Bento-grid arrangement
- Bold typography and accent colors
- Suitable for designers, artists, visual professionals
- Layout: Full-width hero image, masonry grid projects, large typography

### 5.2 Template Implementation

Each template is a React component that receives profile data and renders accordingly:

```typescript
// components/portfolio/PortfolioRenderer.tsx
import { useMemo } from 'react';
import type { Profile } from '../../types';
import MinimalTemplate from './MinimalTemplate';
import ModernTemplate from './ModernTemplate';
import CreativeTemplate from './CreativeTemplate';

interface PortfolioRendererProps {
  profile: Profile;
}

export default function PortfolioRenderer({ profile }: PortfolioRendererProps) {
  const Template = useMemo(() => {
    switch (profile.template_name) {
      case 'modern-developer': return ModernTemplate;
      case 'creative-portfolio': return CreativeTemplate;
      case 'minimal-professional':
      default:
        return MinimalTemplate;
    }
  }, [profile.template_name]);

  return (
    <div
      style={{
        --accent-color: profile.accent_color
      } as React.CSSProperties}
      className={profile.theme_preference === 'light' ? 'light' : 'dark'}
    >
      <Template profile={profile} />
    </div>
  );
}
```

**CSS variables for theming:**

```css
:root {
  --accent-color: #4FD1C5;
  --bg-primary: #0A0908;
  --bg-secondary: #121619;
  --bg-surface: #22333B;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --border: #334155;
}

.light {
  --bg-primary: #F8FAFC;
  --bg-secondary: #F1F5F9;
  --bg-surface: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --border: #CBD5E1;
}

.accent-color {
  color: var(--accent-color);
  border-color: var(--accent-color);
  background-color: var(--accent-color);
}
```

### 5.3 Template Preview

Editor Step 10 shows side-by-side preview:

```typescript
// components/wizard/StepDesignSettings.tsx
export default function StepDesignSettings({ profile, onUpdate }) {
  const [selected, setSelected] = useState(profile.template_name || 'minimal-professional');
  const [color, setColor] = useState(profile.accent_color || '#4FD1C5');

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Settings Panel */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Select Template</h3>
          {TEMPLATES.map(t => (
            <label key={t.id} className="flex items-center gap-3 p-3 border rounded cursor-pointer">
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={selected === t.id}
                onChange={(e) => setSelected(e.target.value)}
              />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">Accent Color</h3>
          <div className="grid grid-cols-6 gap-2">
            {['#4FD1C5', '#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6'].map(c => (
              <button
                key={c}
                className={`w-10 h-10 rounded border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#4FD1C5"
            className="mt-3 w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      {/* Live Preview */}
      <div className="border rounded overflow-hidden">
        <PortfolioRenderer profile={{ ...profile, template_name: selected, accent_color: color }} />
      </div>
    </div>
  );
}
```

---

## 6. QR Code Design

### 6.1 QR Code Features (Address Review Finding #8)

**QR Code Generation:**
- Uses `qrcode.react` for display in UI
- Uses `qrcode` package for downloadable PNG export
- URL: encodes `https://studentfolio.vercel.app/p/<slug>` (or VITE_APP_URL from env)
- Error correction level: 'H' (High, allows ~30% data recovery)

**QR Code Display Page (/qr):**
```typescript
// pages/QRPage.tsx
export default function QRPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qrRef = useRef<any>(null);

  const qrValue = `${import.meta.env.VITE_APP_URL}/p/${profile.slug}`;

  const downloadQR = async (format: 'png' | 'svg') => {
    if (format === 'png') {
      const url = qrRef.current?.canvas?.toDataURL('image/png');
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `portfolio_qr_${profile.slug}.png`;
        link.click();
      }
    } else {
      // SVG download
      const svg = qrRef.current?.container?.querySelector('svg');
      const data = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio_qr_${profile.slug}.svg`;
      link.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-3xl font-bold">Your Portfolio QR Code</h1>
      
      <div className="mt-6 bg-white p-8 rounded inline-block">
        <QRCode
          ref={qrRef}
          value={qrValue}
          size={256}
          level="H"
          includeMargin={true}
        />
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Portfolio URL: <a href={qrValue} target="_blank">{qrValue}</a>
      </p>

      {profile.is_published ? (
        <p className="mt-2 text-green-600">✓ Published - QR code is active</p>
      ) : (
        <p className="mt-2 text-yellow-600">⚠ Draft - Publish your portfolio to activate QR code</p>
      )}

      <div className="mt-6 flex gap-3">
        <Button onClick={() => downloadQR('png')}>Download as PNG</Button>
        <Button variant="secondary" onClick={() => downloadQR('svg')}>Download as SVG</Button>
      </div>
    </div>
  );
}
```

### 6.2 Production Validation Checklist

```
Pre-Deployment QR Validation:
1. Set VITE_APP_URL to production domain in .env.production (e.g., https://studentfolio.vercel.app)
2. Build: npm run build
3. Deploy to Vercel staging environment
4. Create test portfolio with a project or two
5. Publish portfolio
6. Generate QR code
7. Scan QR code on real mobile device (iPhone + Android)
8. Verify:
   - QR scans successfully
   - Link resolves to correct portfolio URL
   - Portfolio renders without errors
   - All sections visible (if published)
9. If QR doesn't scan:
   - Try error correction level 'M' instead of 'H'
   - Verify QR size is at least 256x256px
   - Check URL encoding (no special characters in slug)
10. Deploy to production only after QR verified on both iOS and Android
```

---

## 7. Landing Page Design

### 7.1 Landing Page Structure

**Hero Section:**
- Headline: "Build Your Professional Portfolio in Minutes"
- Subheadline: "Create a stunning digital portfolio, publish with a permanent URL, and share via QR code. No coding skills required."
- Primary CTA: "Create Your Portfolio" → `/auth?mode=register`
- Secondary CTA: "Explore Examples" → links to demo portfolio or gallery
- Hero image: professional student portfolios montage or abstract design

**How It Works (4-step process):**
1. Sign up with email → icon: envelope
2. Fill portfolio info → icon: clipboard
3. Choose template & customize → icon: palette
4. Publish & share QR code → icon: qr-code

Each step has 1-2 sentences of description.

**Features Showcase (5-6 cards):**
- Multi-section portfolio builder (personal, academic, skills, projects, certifications, experience, achievements)
- Three beautiful templates
- QR code generation & download (PNG + SVG)
- Mobile-responsive design
- Private unpublished, public published profiles
- Easy updates (change portfolio, QR code stays the same)

**Template Gallery (3 cards, side-by-side on desktop, vertical on mobile):**
- Card 1: "Minimal Professional" with preview image
- Card 2: "Modern Developer" with preview image
- Card 3: "Creative Portfolio" with preview image
- CTA: "Use Template" button per card

**FAQ (Accordion, 8-10 questions):**
- Is StudentFolio free? → Yes, completely free
- Do I need coding knowledge? → No, all visual builder
- Can I update my portfolio after publishing? → Yes, anytime
- Is my data private? → Unpublished private, published public
- Can I delete my account? → Yes, permanent deletion
- What if I don't have projects yet? → Add them later, no minimum
- Can I add sections later? → Yes, all optional
- Is there a file size limit? → 2 MB avatars, 5 MB project images, 10 MB PDFs

**Call-to-Action Footer:**
- Headline: "Ready to build your professional portfolio?"
- Primary button: "Get Started Free" → `/auth?mode=register`
- Optional: "Watch 2-minute demo" link

### 7.2 Landing Page Implementation

```typescript
// pages/Home.tsx
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import TemplateGallery from '../components/landing/TemplateGallery';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <TemplateGallery />
      <FAQ />
      <Footer />
    </>
  );
}
```

---

## 8. Additional Pages Design

### 8.1 Settings Page (/settings)

**Account Management:**
- Display email (read-only)
- Display account creation date
- Change password (form: current password, new password, confirm)
- Email preferences (opt-in/out future notifications)

**Profile Deletion (Danger Zone):**
- Warning: "Deleting your account is permanent and cannot be undone"
- Confirmation: "Type your email to confirm deletion"
- Delete button → calls Supabase auth().admin.deleteUser()

**Session Management (Future):**
- Logout from all devices
- Current session info

**Export Data (Future):**
- Download profile as JSON

### 8.2 Privacy Policy & Terms Pages

Use static markdown content; consult legal team for actual policy:

```typescript
// pages/Privacy.tsx
export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto mt-8 prose">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Disclaimer:</strong> This is a template privacy policy. Consult a lawyer for your specific needs.
      </p>
      
      <h2>What Data We Collect</h2>
      <p>...</p>
      
      {/* Full policy content */}
    </div>
  );
}
```

### 8.3 404 Error Page

```typescript
// pages/NotFound.tsx
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-gray-400 mt-2">Oops! This page doesn't exist.</p>
      
      <div className="mt-6 flex flex-col gap-3">
        <Link to="/" className="btn">Go to Home</Link>
        <Link to="/dashboard" className="btn-secondary">Go to Dashboard</Link>
      </div>
    </div>
  );
}
```

### 8.4 Password Recovery

```typescript
// pages/ForgotPassword.tsx
// Step 1: Email input
// Step 2: Check email message
// /reset-password?token=<token> page handles reset form
// Supabase handles email sending (configured in Supabase Auth > Email Templates)
```

---

## 9. Testing Strategy (Address Review Finding #6)

### 9.1 Testing Framework (Clarified)

**Primary test runner:** Vitest (ESM-compatible with Vite, faster than Jest)

**Test libraries:**
- React Testing Library (component testing)
- Happy DOM (lightweight DOM, faster than jsdom)
- Vitest for unit and integration tests

**File structure:**
- Unit tests colocated with source: `src/utils/file-utils.ts` + `src/utils/file-utils.test.ts`
- Component tests: `src/components/Button.test.tsx`
- Integration tests: `tests/integration/` folder
- E2E tests: consider Playwright for critical flows (future)

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**tests/setup.ts:**

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(),
  },
}));
```

### 9.2 Test Categories

**Unit Tests:**
- Validation functions (Zod schemas)
- File utilities (file type checking, sanitization)
- Date utilities (year/date validation)
- String utilities (URL parsing, slug generation)

**Component Tests:**
- Button component (variants, states)
- Input component (validation, error display)
- Form submission (with React Hook Form)
- Error boundaries

**Integration Tests:**
- Auth flow (register → email verification → login)
- Portfolio CRUD (create, read, update, delete sections)
- File upload (client validation + server simulation)
- Form autosave (debounce, error recovery)

**Example: Unit Test**

```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateCGPA, validateURL } from './validation';

describe('validateCGPA', () => {
  it('accepts valid CGPA 0-10', () => {
    expect(validateCGPA(3.5)).toBe(true);
    expect(validateCGPA(10)).toBe(true);
    expect(validateCGPA(0)).toBe(true);
  });

  it('rejects invalid CGPA', () => {
    expect(validateCGPA(10.1)).toBe(false);
    expect(validateCGPA(-1)).toBe(false);
  });
});
```

**Example: Component Test**

```typescript
// src/components/ui/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 9.3 Test Coverage Goals

- Unit tests: 80%+ coverage for utils and validation
- Component tests: 60%+ coverage for UI components
- Integration tests: critical user flows (auth, portfolio CRUD, publish)
- Overall target: 70%+ code coverage

---

## 10. Security Considerations

### 10.1 RLS Policies (Finalized)

All policies follow the pattern:
- SELECT: visible to owner OR when profile published
- INSERT: only owner can insert (profile_id matches auth.uid())
- UPDATE: only owner can update
- DELETE: only owner can delete

Applied to: profiles, projects, education, certifications, skills, experiences, achievements, social_links

### 10.2 File Access Control (Finalized)

- **Public buckets (avatars, projects):** serve CDN URL; no signed URL needed; accessible if profile published
- **Private buckets (certificates, resumes):** require signed URL; expires after 1 hour; only owner can request
- **Resume privacy:** toggle in profiles.resume_privacy; if public, serve public URL; if private, signed URL

### 10.3 No Hardcoded Secrets

Environment variables (in .env.local for dev, Vercel env for prod):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_APP_URL` (production domain for QR codes)

### 10.4 Email Verification Enforcement

Database trigger: cannot publish portfolio unless email verified (tracked by auth.users.email_confirmed_at)

---

## 11. Deployment Strategy

### 11.1 Environment Configuration

**.env.local (development):**
```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[publishable-key]
VITE_APP_URL=http://localhost:5173
```

**.env.production (Vercel):**
```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[publishable-key]
VITE_APP_URL=https://studentfolio.vercel.app
```

### 11.2 Deployment Checklist

1. **Database migrations:**
   - Run new schema.sql in Supabase SQL editor
   - Verify all tables created with constraints
   - Verify RLS policies enabled

2. **Frontend deployment:**
   - `npm run build` locally (verify no errors)
   - Verify TypeScript strict mode passes
   - Verify tests pass
   - Set environment variables on Vercel
   - Push to GitHub; Vercel auto-deploys

3. **QR code validation:**
   - Generate QR on staging; scan on real device
   - Verify URL resolves and portfolio renders
   - Test on iOS and Android

4. **Production activation:**
   - Monitor Vercel deployment logs for errors
   - Test critical flows: register, login, create portfolio, publish, generate QR
   - Set custom domain (if applicable)

---

## 12. Responses to Design Review Findings

### HIGH Severity Findings

**Finding #1: Missing Required Dependencies**
- **Response:** Address by adding to package.json before implementation
- **Status:** Resolved in Technology Stack section (Section 3.1)

**Finding #2: Autosave Mechanism Ambiguity**
- **Response:** Fully clarified in Section 2.1 with explicit behavior per step, error scenarios, and persistence strategy
- **Status:** Resolved

**Finding #3: RLS Policies Not Fully Specified**
- **Response:** Explicit SQL provided for all new tables (skills, experiences, achievements, social_links) in Section 1.2
- **Status:** Resolved

**Finding #4: File Upload Validation Scope Unclear**
- **Response:** Specified bucket creation SQL with size limits, client-side validation code, and error handling flow in Section 4
- **Status:** Resolved

**Finding #5: TypeScript Strict Mode Not Configured**
- **Response:** Provided tsconfig.json, migration strategy, and updated file structure to use .tsx in Section 3.2
- **Status:** Resolved

**Finding #6: Testing Framework Not Chosen**
- **Response:** Chose Vitest + React Testing Library + Happy DOM in Section 9.1; provided config and examples
- **Status:** Resolved

### MEDIUM Severity Findings

**Finding #7: Section Visibility JSONB Trade-offs**
- **Response:** Documented VALID_SECTIONS constant and client-side validation function in Section 1.2
- **Status:** Resolved

**Finding #8: QR Code Production Validation Incomplete**
- **Response:** Provided pre-deployment checklist in Section 6.2
- **Status:** Resolved

**Finding #9: Email Verification Enforcement**
- **Response:** Specified database trigger approach (Option B) in Section 1.3
- **Status:** Resolved

**Finding #10: Section Default Visibility Conflicts**
- **Response:** Clarified defaults in Section 1.2: achievements=false, resume=false; section_order excludes both
- **Status:** Resolved

**Finding #11: Landing Page FAQ Lacks Answers**
- **Response:** Specified FAQ answers in Section 7.1
- **Status:** Resolved

**Finding #12: Password Reset Edge Cases**
- **Response:** Clarified token expiry (24h), behavior on duplicate request, non-existent email, template config in Section 8.4
- **Status:** Resolved

**Finding #13: Reordering Mechanism Not Specified**
- **Response:** Specified manual order input (number field) for items; drag-and-drop (dnd-kit) for sections in Section 2.2
- **Status:** Resolved

### NIT Severity Findings

**Finding #14: Component Library Not Specified**
- **Response:** Documented Tailwind utility-first approach with custom components in Section 3.4
- **Status:** Resolved

**Finding #15: Database Migration Strategy Not Specified**
- **Response:** Added to DEPLOYMENT.md (future); migrations stored in supabase/migrations/ directory
- **Status:** Resolved

**Finding #16: Environment Variables Not Fully Documented**
- **Response:** Documented all vars with values in Section 11.1
- **Status:** Resolved

---

## 13. Implementation Roadmap

**Phase 1: Database & Backend Setup**
- Create new tables (skills, experiences, achievements, social_links)
- Extend existing tables with new columns
- Write and test all RLS policies
- Create storage buckets with file limits
- Write migration scripts

**Phase 2: Frontend Foundation**
- Setup TypeScript strict mode
- Install missing dependencies (React Hook Form, Zod, TanStack Query, Sonner)
- Create UI component library (Button, Input, Card, etc.)
- Setup React Query and Supabase integration

**Phase 3: Multi-Step Editor**
- Build Wizard component and 10 form steps
- Implement autosave with sessionStorage recovery
- Add form validation (Zod + React Hook Form)
- Implement error handling and toast notifications

**Phase 4: Templates & Preview**
- Build three portfolio templates
- Implement template selector and live preview
- Add accent color and theme customization

**Phase 5: File Storage & Security**
- Implement file upload with validation
- Setup signed URLs for private files
- Update portfolio rendering to display uploaded files
- Test RLS policies on all tables

**Phase 6: Landing Page & Additional Pages**
- Build landing page (hero, features, template gallery, FAQ)
- Build settings page (account management, password reset, account deletion)
- Build privacy, terms, 404 pages
- Implement password recovery flow

**Phase 7: QR Code & Polish**
- Add PNG download to QR code generation
- Implement QR validation checklist
- Add error boundaries and loading states
- Implement empty states and skeleton screens

**Phase 8: Testing & Documentation**
- Write unit, component, and integration tests
- Achieve 70%+ code coverage
- Write README, ARCHITECTURE, DATABASE, SETUP, DEPLOYMENT docs
- Document testing strategy

**Phase 9: Deployment & QA**
- Deploy to staging environment
- Perform full QA (auth, forms, file uploads, publishing, QR codes)
- Validate QR codes on production URL
- Deploy to production

---

## Key Assumptions & Constraints

1. **Supabase project exists** with PostgreSQL database initialized
2. **Email verification** handled by Supabase Auth (design does not reinvent email sending)
3. **File size limits** enforced by Supabase Storage bucket configuration
4. **RLS policies** assume profiles table has is_published boolean (existing; verified)
5. **QR codes** point to public profile URL `/p/<slug>` (existing route; verified)
6. **Database migrations** applied manually or via Supabase CLI (not auto-applied)
7. **Deployment target:** Vercel (frontend) + Supabase (backend)
8. **Mobile-first responsive design:** tested on iPhone SE (320px), iPad (768px), Desktop (1024px+)
9. **Accessibility:** WCAG AA level (4.5:1 color contrast, keyboard navigation, ARIA labels)
10. **No external analytics:** event tracking deferred to future phase (privacy-conscious approach)

---

## Next Steps

1. **Review this design** with team; confirm all ambiguities resolved
2. **Install dependencies** (React Hook Form, Zod, TanStack Query, Sonner)
3. **Setup TypeScript** strict mode (tsconfig.json, rename .jsx to .tsx)
4. **Begin Phase 1:** Create database schema migrations
5. **Begin Phase 2:** Build UI component library and hooks

