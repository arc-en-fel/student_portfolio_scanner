# StudentFolio Deployment Guide

This guide covers deploying StudentFolio to production using Vercel and Supabase.

## Pre-Deployment Checklist

- [ ] All tests pass: `npm run pr-check`
- [ ] TypeScript strict mode: `npm run build` with no errors
- [ ] Code coverage 70%+: `npm run test:coverage`
- [ ] QR code tested on real devices (iOS + Android)
- [ ] Email verification working
- [ ] Password reset flow working
- [ ] Account deletion working
- [ ] Portfolio publish/unpublish working
- [ ] All page routes accessible and functional
- [ ] Error boundaries catching errors
- [ ] No console errors or warnings in development

## Vercel Deployment

### Step 1: Prepare Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: StudentFolio initial deployment"

# Push to your repository (GitHub, GitLab, or Bitbucket)
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Paste your repository URL
4. Select "Create a Team" or use your personal account
5. Name your project `studentfolio`

### Step 3: Configure Environment Variables

In the Vercel import dialog, add these environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
VITE_APP_URL=https://studentfolio.vercel.app
```

Replace:
- `your-project` with your Supabase project name
- `your_anon_public_key` with your anon public key from Supabase
- `studentfolio.vercel.app` with your actual Vercel domain

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (~2 minutes)
3. Once successful, you'll get a production URL

### Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain (e.g., `portfolio.example.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `VITE_APP_URL` environment variable to match your domain

## Supabase Production Setup

### Step 1: Create Production Project

If you're using a development Supabase project, create a separate production project:

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Set project name to `studentfolio-prod`
4. Select your organization/region
5. Create a strong database password

### Step 2: Run Schema Migrations

1. In Supabase SQL Editor, paste the contents of `supabase/schema.sql`
2. Execute the entire script
3. Verify tables are created without errors:

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema='public';

-- Should include: profiles, education, skills, projects, certifications, experiences, achievements, social_links
```

### Step 3: Configure Authentication

#### Email/Password Authentication

1. Go to **Authentication → Providers**
2. Enable "Email"
3. Configure settings:
   - Allow email confirmations: **ON**
   - Auto-confirm email: **OFF** (for production)
   - Confirm email: **Enable**

#### SMTP Email Provider

1. Go to **Authentication → Email Templates**
2. Configure SMTP in **Settings → Email**:
   - Select "SMTP"
   - Enter your email provider details:
     - **SMTP Host**: (e.g., smtp.gmail.com)
     - **SMTP Port**: 587 (TLS)
     - **SMTP User**: your-email@example.com
     - **SMTP Password**: your-app-password (not your regular password)
   - **From Name**: StudentFolio
   - **From Email**: noreply@studentfolio.com
   - **Reply To**: support@studentfolio.com

**Email Provider Options:**
- Gmail: Use App Passwords (2FA must be enabled)
- SendGrid: Use API key
- Mailgun: Use SMTP credentials
- AWS SES: Use SMTP credentials

#### URL Configuration

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**:
   ```
   https://studentfolio.vercel.app
   ```
   (or your custom domain)

3. Add **Redirect URLs**:
   ```
   https://studentfolio.vercel.app/dashboard
   https://studentfolio.vercel.app/editor
   https://studentfolio.vercel.app/qr
   ```

4. Add **Additional Redirect URLs** for OAuth providers (if using later)

### Step 4: Storage Configuration

1. Go to **Storage → Buckets**
2. Verify these buckets exist (created by schema.sql):
   - `avatars` (2MB limit)
   - `projects` (5MB limit)
   - `certificates` (10MB limit)
   - `resumes` (10MB limit)

3. For each bucket, set **Policies**:
   - Public read for published portfolios
   - Private write for authenticated users only

### Step 5: Security Configuration

#### Row Level Security (RLS)

Verify RLS is enabled on all tables:

```sql
-- Check RLS status
SELECT * FROM pg_tables WHERE schemaname = 'public';

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify policy
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

All tables should have RLS policies created by `schema.sql`.

#### API Keys

1. Go to **Settings → API**
2. Copy your project URL and anon key (for frontend)
3. **Never** expose the service_role key in frontend code
4. Rotate keys periodically

#### Database Backups

1. Go to **Database → Backups**
2. Enable automatic daily backups
3. Set backup retention to 30 days

## Environment Variables

Create `.env.production` for production deployment:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key

# Application
VITE_APP_URL=https://studentfolio.vercel.app
NODE_ENV=production
```

**Important**: Never commit `.env.production` to git. Use Vercel's environment variables UI instead.

## QR Code Validation

### Desktop Testing

1. Build: `npm run build`
2. Deploy to staging/production
3. Register and create a portfolio
4. Publish portfolio
5. Generate QR code
6. Copy QR code download URL

### Mobile Testing

**iOS:**
1. Open Camera app
2. Point at QR code
3. Tap notification to open link
4. Verify portfolio loads

**Android:**
1. Use Google Lens (hold home button) or dedicated QR scanner
2. Tap link to open portfolio
3. Verify portfolio renders correctly

### QR Code Troubleshooting

| Issue | Solution |
|-------|----------|
| QR code won't scan | Verify `VITE_APP_URL` is public domain, not localhost |
| Link opens to 404 | Verify portfolio is published, slug is correct |
| Portfolio loads blank | Check browser console for errors, verify RLS policies |
| Slow loading on mobile | Reduce image sizes, enable CDN caching in Supabase |

## Performance Optimization

### Caching

**Vercel:**
- Static files are cached by default
- Use `vercel.json` for caching headers:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "max-age=0, s-maxage=3600, stale-while-revalidate" }
      ]
    }
  ]
}
```

**Supabase Storage:**
- Enable CDN for image buckets in **Storage → Settings**
- Images cached globally for faster downloads

### Database Performance

1. Create indexes for frequently queried columns:
   ```sql
   CREATE INDEX idx_profiles_user_id ON profiles(user_id);
   CREATE INDEX idx_profiles_slug ON profiles(slug);
   CREATE INDEX idx_profiles_published ON profiles(is_published);
   ```

2. Monitor slow queries in **Database → Logs**

3. Use connection pooling if using Supabase with external apps

## Monitoring & Logging

### Vercel Analytics

1. Go to Vercel dashboard
2. Select your project
3. Go to **Analytics**
4. Monitor:
   - Page load times
   - Core Web Vitals
   - Request latency
   - Deployment status

### Supabase Logs

1. Go to **Database → Logs** to view:
   - Query performance
   - Authentication events
   - Error messages

2. Go to **Auth → Logs** to view:
   - User signups/logins
   - Failed authentication
   - Password resets

### Error Tracking (Optional)

Consider adding Sentry or similar:

1. Sign up at https://sentry.io
2. Create a project for StudentFolio
3. Add Sentry to your app:
   ```bash
   npm install @sentry/react
   ```

4. Initialize in `src/main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react"
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
   })
   ```

## Rollback Plan

If deployment has issues:

### Quick Rollback (Vercel)

1. Go to Vercel dashboard
2. Select project → **Deployments**
3. Find the last known good deployment
4. Click **...** → **Promote to Production**

### Database Rollback (Supabase)

1. Go to **Database → Backups**
2. Select the backup before the issue
3. Click **Restore**
4. Verify data integrity after restore

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor error logs
- Check database performance
- Verify backups completed

**Monthly:**
- Review analytics and user feedback
- Update dependencies: `npm update`
- Run security audit: `npm audit`

**Quarterly:**
- Full regression testing
- Performance optimization review
- Security audit

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest

# Run tests after update
npm run test

# Rebuild and deploy
npm run build
```

## Troubleshooting Deployment

### Build Failures

**Error: "Cannot find module"**
- Run `npm install`
- Verify all files are committed to git
- Check `tsconfig.json` path mappings

**Error: "VITE_* is not defined"**
- Verify environment variables are set in Vercel
- Rebuild after adding env vars (sometimes requires redeployment)
- Check `.env.example` for correct variable names

### Runtime Errors

**"QR code undefined"**
- Verify `qrcode.react` and `qrcode` npm packages are installed
- Clear node_modules: `rm -rf node_modules && npm install`

**"Supabase connection failed"**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Check Supabase project status in dashboard
- Verify network connectivity

**"Row Level Security policy denied"**
- Check RLS policies in Supabase SQL Editor
- Verify user ID matches profile ownership
- Test policies with sample queries in SQL Editor

### Email Not Sending

**Problem: Verification emails not arriving**
- Check spam/junk folder
- Verify SMTP configuration in Supabase
- Check email provider rate limits
- Test with different email address

**Solution:**
1. Go to Supabase **Auth → Logs**
2. Check for email send errors
3. Verify SMTP credentials
4. Test manually: `curl -X POST https://api.supabase.co/auth/v1/signup`

## Production Checklist

Before going live:

### Functionality
- [ ] Registration and email verification work
- [ ] Login/logout work
- [ ] Portfolio creation and editing work
- [ ] File uploads work for all bucket types
- [ ] Portfolio publishing works
- [ ] QR code generation and downloads work
- [ ] Password reset works
- [ ] Account deletion works
- [ ] Settings page functional
- [ ] Error pages display correctly
- [ ] Mobile responsive on iOS and Android

### Performance
- [ ] Page load time < 3 seconds
- [ ] Core Web Vitals passing
- [ ] Database queries optimized
- [ ] Images optimized and cached

### Security
- [ ] HTTPS enabled
- [ ] RLS policies enforced
- [ ] No hardcoded secrets
- [ ] API keys rotated
- [ ] Database backups working
- [ ] Rate limiting configured (if needed)

### Monitoring
- [ ] Error logging enabled
- [ ] Analytics configured
- [ ] Alerts set up
- [ ] Backup restoration tested

### Documentation
- [ ] README.md updated
- [ ] DEPLOYMENT.md up to date
- [ ] Runbooks for common issues
- [ ] Contact/support channels defined

## Support & Contact

For issues:
1. Check logs in Vercel and Supabase dashboards
2. Review troubleshooting section above
3. Check GitHub issues
4. Contact support at your-email@example.com

For security issues:
- Report privately via your organization's security contact
- Do not post publicly
- Include detailed reproduction steps
