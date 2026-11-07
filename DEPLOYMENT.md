# StudentFolio Deployment Guide

This guide covers deploying StudentFolio to production on Vercel, configuring public portfolio access, and testing QR code functionality.

## Overview

StudentFolio is a Next.js/Vite portfolio builder with the following architecture:

- **Frontend**: Vite (React SPA) deployed to Vercel
- **Backend**: Supabase PostgreSQL database
- **Public Portfolios**: Accessible at `/p/:slug` without authentication
- **Protected Features**: Editor, dashboard, and QR code generation require login
- **QR Codes**: Encode the canonical application URL configured via `VITE_APP_URL`

## Prerequisites

- Vercel account (free tier sufficient)
- Git repository with StudentFolio code
- Supabase project with existing database schema (no changes needed)
- Domain name (optional, but recommended for production QR codes)

## Deployment Steps

### 1. Prepare Your Code

Ensure all code is committed and pushed to your repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Create Vercel Project

#### Option A: Connect via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **Import Git Repository**
3. Find and select your StudentFolio repository
4. Click **Import**

#### Option B: Use Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to connect your repository.

### 3. Configure Environment Variables

In Vercel project settings, add the following environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase settings |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Use publishable key only (no secrets) |
| `VITE_APP_URL` | `https://your-domain.vercel.app` | Or your custom domain |

**Important**: Never commit `.env.local` to git. Use Vercel environment variables instead.

#### Getting Supabase Credentials

1. Log in to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **Settings → API**
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Publishable (anonymous) Key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Configure Custom Domain (Optional but Recommended)

For production:

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Once verified, update `VITE_APP_URL` to use your domain

This ensures:
- QR codes encode your domain instead of `vercel.app`
- Professional appearance for shared portfolios
- Better SEO and branding

### 5. Deploy

Deployments trigger automatically on every `git push` to `main`:

```bash
git push origin main
```

View deployment progress in the Vercel dashboard.

## Environment Variables Reference

### Required for Production

- **VITE_SUPABASE_URL**: Your Supabase project URL
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Supabase anonymous (publishable) key
- **VITE_APP_URL**: Canonical URL for QR codes and public portfolio links

### Optional for Development

- **VITE_LAN_URL**: Local IP address for testing on LAN (e.g., `http://192.168.1.100:5173`)
  - Only used in development
  - Allows testing QR codes and published portfolios on phones on your local network
  - Example: Set to your laptop's IP while running `npm run dev`

## Public Portfolio Access

### How It Works

1. Students publish their portfolio from the editor
2. A `is_published` flag is set to `true` in the database
3. Portfolio becomes accessible at `https://your-domain/p/:slug` without login
4. The `/p/:slug` route handles SPA fallback via `vercel.json`

### Database Security

- **Row-Level Security (RLS)**: Only published portfolios (`is_published = true`) are visible to unauthenticated users
- **Unpublished portfolios**: Remain completely private (require authentication to access)
- **Student data**: Protected in the database; only published field, name, and portfolio content visible

### Testing Public Access

1. Navigate to a published portfolio:
   ```
   https://your-domain/p/john-smith
   ```

2. Test in incognito/private mode to verify no authentication required

3. Verify unpublished portfolios are blocked:
   - Unpublished portfolio returns 404 or "Not found"

## QR Code Configuration

### How QR Codes Work

1. QR codes are generated from the canonical `VITE_APP_URL`
2. SVG/PNG downloads encode the full portfolio URL
3. QR code URLs remain unchanged when students update their portfolio details
4. Portfolio slug is permanent and unique per student

### Testing QR Codes

#### Local Development

For development testing on phones:

1. Find your laptop's local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig | findstr /i ipv4
   ```

2. Set `VITE_LAN_URL` in `.env.local`:
   ```
   VITE_LAN_URL=http://192.168.1.100:5173
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. On your phone, connect to the same WiFi
5. Open `http://192.168.1.100:5173/editor`
6. Publish a test portfolio
7. Generate and scan the QR code on your phone

#### Production Testing

1. Deploy to Vercel (follow deployment steps above)
2. Generate QR code from `https://your-domain/qr`
3. Scan on phone to verify it opens the portfolio
4. Test in incognito mode on phone

## SPA Routing

The `vercel.json` file configures Vercel to rewrite `/p/:slug` requests to `index.html`, allowing the React Router to handle the route client-side:

```json
{
  "rewrites": [
    {
      "source": "/p/:slug",
      "destination": "/index.html"
    }
  ]
}
```

This enables:
- Clean URLs for published portfolios (`/p/john-smith` instead of `/p/index.html?slug=john-smith`)
- Shareable, SEO-friendly portfolio links
- QR codes with human-readable URLs

## Troubleshooting

### QR Codes Encode `localhost`

**Cause**: `VITE_APP_URL` not configured in production

**Fix**: 
1. Set `VITE_APP_URL` environment variable in Vercel
2. Redeploy: `git push origin main`
3. Regenerate QR codes

### Public Portfolio Returns 404

**Cause**: 
- Portfolio not published (`is_published = false`)
- Incorrect slug

**Fix**:
1. Verify portfolio is published in editor
2. Check slug in database or editor
3. Verify SPA routing: `/p/:slug` should load without error

### Published Portfolio Requires Login

**Cause**: RLS policy preventing unauthenticated access

**Fix**:
1. Check Supabase RLS policies on `profiles` table
2. Verify `is_published` is true for the profile
3. Contact support if policies were accidentally modified

### Deployment Fails

**Common causes**:
- Missing environment variables (check Vercel Settings → Environment Variables)
- Invalid Supabase credentials
- Git push failed

**Fix**:
1. Check Vercel deployment logs (Deployments tab)
2. Verify all `VITE_*` environment variables are set
3. Retry deployment with `git push origin main`

## Production Checklist

- [ ] Repository pushed to GitHub/GitLab
- [ ] Vercel project created and connected
- [ ] Environment variables configured (`VITE_SUPABASE_*`, `VITE_APP_URL`)
- [ ] Deployment successful (green checkmark in Vercel)
- [ ] Public portfolio accessible without login
- [ ] Unpublished portfolio returns error/404
- [ ] QR code generates and encodes production domain
- [ ] QR code scans successfully on phone
- [ ] QR code remains valid after editing portfolio
- [ ] Custom domain configured (optional)
- [ ] Domain used in `VITE_APP_URL` matches deployed domain

## Support

For issues:

1. Check deployment logs in Vercel dashboard
2. Verify Supabase connectivity
3. Check browser console for errors (F12 → Console)
4. Review this guide's troubleshooting section
