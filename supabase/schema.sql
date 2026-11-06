-- Run once in Supabase SQL Editor, on a new project.
-- Each account receives one profile; the slug is stable and cannot be edited.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique,
  full_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  college text not null default '',
  course text not null default '',
  location text not null default '',
  skills text not null default '',
  github_url text not null default '',
  linkedin_url text not null default '',
  website_url text not null default '',
  resume_url text not null default '',
  avatar_path text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- FEAT-001 Step 1: Academic fields
  department text not null default '',
  specialization text not null default '',
  cgpa numeric,
  academic_description text not null default '',
  -- FEAT-001 Step 1: Location fields
  state text not null default '',
  country text not null default '',
  -- FEAT-001 Step 1: Contact fields
  professional_email text not null default '',
  personal_website text not null default '',
  -- FEAT-001 Step 1: Portfolio settings
  template_name text not null default 'modern',
  accent_color text not null default '#4FD1C5',
  theme_preference text not null default 'dark',
  section_visibility jsonb not null default '{"education":true,"projects":true,"skills":true,"experiences":true,"achievements":true,"certifications":true,"socialLinks":true}'::jsonb,
  section_order jsonb not null default '["education","projects","skills","experiences","achievements","certifications","socialLinks"]'::jsonb,
  completed_steps jsonb not null default '[]'::jsonb,
  resume_privacy text not null default 'private',
  date_of_birth date,
  -- FEAT-001 Step 1: Constraints
  constraint valid_cgpa check (cgpa is null or (cgpa >= 0 and cgpa <= 10)),
  constraint valid_email_format check (professional_email = '' or professional_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  constraint valid_accent_color check (accent_color ~* '^#[0-9A-Fa-f]{6}$'),
  constraint valid_template_name check (template_name in ('modern', 'minimal', 'creative', 'professional')),
  constraint valid_theme_preference check (theme_preference in ('dark', 'light', 'auto')),
  constraint valid_resume_privacy check (resume_privacy in ('private', 'authenticated', 'public'))
);

-- FEAT-001 Step 2: Extended projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  tech_stack text not null default '',
  project_url text not null default '',
  -- FEAT-001 Step 2: New columns
  category text not null default 'other',
  image_path text not null default '',
  github_url text not null default '',
  live_url text not null default '',
  start_date date,
  end_date date,
  featured boolean not null default false,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  -- FEAT-001 Step 2: Constraints
  constraint valid_project_category check (category in ('web', 'mobile', 'desktop', 'ml', 'data', 'game', 'other')),
  constraint valid_project_dates check (start_date is null or end_date is null or start_date <= end_date)
);
-- FEAT-001 Step 3: Extended education table
create table public.education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null default '',
  degree text not null default '',
  start_year int,
  end_year int,
  -- FEAT-001 Step 3: New columns
  department text not null default '',
  specialization text not null default '',
  cgpa numeric,
  description text not null default '',
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  -- FEAT-001 Step 3: Constraints
  constraint valid_education_years check (start_year is null or end_year is null or start_year <= end_year),
  constraint valid_education_cgpa check (cgpa is null or (cgpa >= 0 and cgpa <= 10))
);
-- FEAT-001 Step 4: Extended certifications table
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  issuer text not null default '',
  -- FEAT-001 Step 4: Migrated and new columns
  credential_verification_url text not null default '',
  credential_url text not null default '',
  -- FEAT-001 Step 4: New columns
  document_path text not null default '',
  expiration_date date,
  issue_date date,
  credential_id text not null default '',
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  -- FEAT-001 Step 4: Constraints
  constraint valid_certification_dates check (issue_date is null or expiration_date is null or issue_date <= expiration_date)
);

create index projects_profile_idx on public.projects(profile_id);
create index projects_featured_idx on public.projects(profile_id, featured);
create index projects_order_idx on public.projects("order");
create index education_profile_idx on public.education(profile_id);
create index education_order_idx on public.education("order");
create index certifications_profile_idx on public.certifications(profile_id);
create index certifications_order_idx on public.certifications("order");

-- FEAT-001 Step 5: Skills table
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_name text not null,
  category text not null default 'technical',
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  constraint skill_name_not_empty check (skill_name != ''),
  constraint valid_skill_category check (category in ('programming', 'framework', 'tool', 'database', 'technical', 'soft'))
);
create index skills_profile_idx on public.skills(profile_id);
create index skills_order_idx on public.skills("order");

-- FEAT-001 Step 6: Experiences table
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  job_title text not null,
  company_name text not null,
  employment_type text not null default 'fulltime',
  location text not null default '',
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text not null default '',
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  constraint valid_employment_type check (employment_type in ('fulltime', 'parttime', 'contract', 'internship', 'freelance')),
  constraint valid_experience_dates check (end_date is null or start_date <= end_date)
);
create index experiences_profile_idx on public.experiences(profile_id);
create index experiences_order_idx on public.experiences("order");

-- FEAT-001 Step 7: Achievements table
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  achievement_date date not null,
  category text not null default 'other',
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  constraint title_not_empty check (title != ''),
  constraint valid_achievement_category check (category in ('award', 'publication', 'speaking', 'community', 'other'))
);
create index achievements_profile_idx on public.achievements(profile_id);
create index achievements_order_idx on public.achievements("order");

-- FEAT-001 Step 8: Social links table
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  url text not null,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  constraint valid_platform check (platform in ('github', 'linkedin', 'behance', 'twitter', 'dribbble', 'instagram', 'website', 'other')),
  constraint valid_url_format check (url ~* '^https?://'),
  constraint unique_platform_per_profile unique(profile_id, platform)
);
create index social_links_profile_idx on public.social_links(profile_id);
create index social_links_order_idx on public.social_links("order");

-- SECURITY DEFINER runs as its creator, allowing Auth to create an initial profile.
create function public.create_student_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, slug) values(new.id, 'student-' || new.id::text);
  return new;
end;
$$;
create trigger on_student_signup after insert on auth.users
for each row execute function public.create_student_profile();

-- Forbid changing student ID/slug so existing QR codes remain valid.
create function public.protect_profile_identity() returns trigger
language plpgsql set search_path = '' as $$
begin
 if new.id is distinct from old.id or new.slug is distinct from old.slug then
   raise exception 'Profile identity and slug are immutable';
 end if;
 new.created_at := old.created_at;
 new.updated_at := now();
 return new;
end;
$$;
create trigger profile_identity_guard before update on public.profiles
for each row execute function public.protect_profile_identity();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.education enable row level security;
alter table public.certifications enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.achievements enable row level security;
alter table public.social_links enable row level security;

-- FEAT-001 Step 10: Email verification enforcement trigger
create function public.enforce_email_verification_on_publish() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  email_verified boolean;
begin
  if new.is_published and not old.is_published then
    select email_confirmed_at is not null into email_verified
    from auth.users where id = new.id;
    
    if not email_verified then
      raise exception 'Email must be verified before publishing portfolio';
    end if;
  end if;
  return new;
end;
$$;
create trigger enforce_email_verification before update on public.profiles
for each row execute function public.enforce_email_verification_on_publish();

create policy "Profile visible to owner or when published" on public.profiles
for select to anon, authenticated using (is_published or (select auth.uid()) = id);
create policy "Profile editable only by owner" on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Public can read child rows only if the parent is published; owner can always read.
create policy "Projects visible when parent public or owner" on public.projects
for select to anon, authenticated using (
  (select auth.uid()) = profile_id or exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published
  )
);
create policy "Education visible when parent public or owner" on public.education
for select to anon, authenticated using (
  (select auth.uid()) = profile_id or exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published
  )
);
create policy "Certifications visible when parent public or owner" on public.certifications
for select to anon, authenticated using (
  (select auth.uid()) = profile_id or exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published
  )
);

create policy "Owners insert projects" on public.projects
for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Owners update projects" on public.projects
for update to authenticated using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
create policy "Owners delete projects" on public.projects
for delete to authenticated using ((select auth.uid()) = profile_id);

create policy "Owners insert education" on public.education
for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Owners update education" on public.education
for update to authenticated using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
create policy "Owners delete education" on public.education
for delete to authenticated using ((select auth.uid()) = profile_id);

create policy "Owners insert certifications" on public.certifications
for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Owners update certifications" on public.certifications
for update to authenticated using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
create policy "Owners delete certifications" on public.certifications
for delete to authenticated using ((select auth.uid()) = profile_id);

-- FEAT-001 Step 5: Skills table RLS policies
create policy "Skills visible to owner or when published" on public.skills
for select to anon, authenticated using (
  (select auth.uid()) = profile_id or exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published
  )
);
create policy "Owners insert skills" on public.skills
for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Owners update skills" on public.skills
for update to authenticated using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
create policy "Owners delete skills" on public.skills
for delete to authenticated using ((select auth.uid()) = profile_id);

-- FEAT-001 Step 6: Experiences table RLS policies
create policy "Experiences visible to owner or when published" on public.experiences
for select to anon, authenticated using (
  (select auth.uid()) = profile_id or exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published
  )
);
create policy "Owners insert experiences" on public.experiences
for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Owners update experiences" on public.experiences
for update to authenticated using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
create policy "Owners delete experiences" on public.experiences
for delete to authenticated using ((select auth.uid()) = profile_id);

-- FEAT-001 Step 7: Achievements table RLS policies
create policy "Achievements visible to owner or when published" on public.achievements
for select to anon, authenticated using (
  (select auth.uid()) = profile_id or exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published
  )
);
create policy "Owners insert achievements" on public.achievements
for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Owners update achievements" on public.achievements
for update to authenticated using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
create policy "Owners delete achievements" on public.achievements
for delete to authenticated using ((select auth.uid()) = profile_id);

-- FEAT-001 Step 8: Social links table RLS policies
create policy "Social links visible to owner or when published" on public.social_links
for select to anon, authenticated using (
  (select auth.uid()) = profile_id or exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published
  )
);
create policy "Owners insert social links" on public.social_links
for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Owners update social links" on public.social_links
for update to authenticated using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
create policy "Owners delete social links" on public.social_links
for delete to authenticated using ((select auth.uid()) = profile_id);

-- Only publishable profile photos belong in this bucket.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "Students upload only to own avatar folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students update only own avatar files" on storage.objects
for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students delete only own avatar files" on storage.objects
for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- FEAT-001 Step 9: Storage buckets with RLS policies
-- Projects bucket (public, for project images)
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('projects','projects',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "Students upload projects to own folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'projects' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students update own project files" on storage.objects
for update to authenticated using (bucket_id = 'projects' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'projects' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students delete own project files" on storage.objects
for delete to authenticated using (bucket_id = 'projects' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Public read projects" on storage.objects
for select to anon, authenticated using (bucket_id = 'projects');

-- Certificates bucket (private, PDF only)
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('certificates','certificates',false,10485760,array['application/pdf'])
on conflict(id) do nothing;
create policy "Students upload certificates to own folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students update own certificate files" on storage.objects
for update to authenticated using (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students delete own certificate files" on storage.objects
for delete to authenticated using (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Resumes bucket (private, PDF only)
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('resumes','resumes',false,10485760,array['application/pdf'])
on conflict(id) do nothing;
create policy "Students upload resumes to own folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students update own resume files" on storage.objects
for update to authenticated using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Students delete own resume files" on storage.objects
for delete to authenticated using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
