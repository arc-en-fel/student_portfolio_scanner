# StudentFolio — React + Supabase Public Student Portfolios

Working MVP source code for public student registration, editing portfolios, projects, education, certifications, profile photo upload, publishing/unpublishing, and downloading permanent QR codes.

## Prerequisites
- Node.js current LTS and npm
- Supabase project with email authentication enabled

## Setup
1. Create a Supabase project at https://supabase.com/dashboard.
2. Open **SQL Editor**, paste `supabase/schema.sql` and execute it **once on a new project**. Avoid running twice: it creates tables/policies/triggers.
3. Supabase **Authentication → URL Configuration**: add `http://localhost:5173/dashboard` as an allowed redirect and set the Site URL to `http://localhost:5173` during development. Enable email/password and email confirmation; configure SMTP for production.
4. Copy `.env.example` to `.env.local`; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's Connect dialog. Never use the service_role/secret key in the frontend.
5. `npm install`
6. `npm run dev`
7. Open `http://localhost:5173` and register. Verify email, log in, edit profile, save project/education/certification entries, publish, and open `/qr`.

## Deploy to Vercel
- Push to a Git repo and import in Vercel.
- Add the two Supabase environment variables plus `VITE_APP_URL=https://your-domain.vercel.app`.
- Deploy; for SPA deep links, `vercel.json` rewrites requests to index.html.
- Set Supabase Auth Site URL to the production domain and allow `https://your-domain.vercel.app/dashboard` in redirect URLs.
- Build locally with `npm run build`.

## Security & product limitations
- Database Row Level Security keeps private/draft profiles from anonymous viewing.
- The public `avatars` bucket can serve photos regardless of a profile's publication status, if someone knows the file URL. Upload only photos intended for public visibility. Use a separate private bucket and signed URLs if you need confidential files.
- Resume uploads aren't included; users can link to an externally hosted public resume.
- There is no personal data email shown on the public profile by default.
- Public visibility is opt-in with Publish.
- Student identity isn't verified beyond account email ownership; include anti-abuse/rate limits and moderation before launching widely.
- QR codes use a stable UUID-based slug; changing a profile does not invalidate it.
- `VITE_APP_URL` must be a **public** deployed URL for QR codes to work on other phones (localhost will only work on the developer machine).
- React SPA pages don't include social-media/SEO crawler metadata per portfolio; add SSR/prerendering later if needed.
- Auth email sender limits and free-tier Supabase/Vercel usage limits apply.
- A registration that hasn't confirmed its email won't allow authenticated profile editing.

## Suggested test
1. Register student A and student B with different emails.
2. A creates a draft; anonymous browser visit `/p/<slug>` should fail.
3. A publishes; anonymous visit and QR scan should succeed.
4. B cannot update A's profile or projects using direct Supabase client calls.
5. A edits content; the same QR points to updated content.
6. A unpublishes; public view should disappear.
