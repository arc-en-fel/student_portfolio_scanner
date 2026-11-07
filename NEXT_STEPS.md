# Next Steps: QR Code & Vercel Deployment

This document outlines the exact steps to take next for deploying StudentFolio with working QR codes.

## Immediate (Today)

### Step 1: Commit These Changes

```bash
cd d:\studentfolio-starter
git add .
git commit -m "feat: centralized URL configuration and QR code support for production

- Add src/lib/config.ts with canonical URL resolution and validation
- Update src/lib/portfolio.ts to use centralized config
- Update src/pages/QRPage.tsx with localhost warnings for production
- Add vercel.json for SPA routing on /p/:slug
- Update vite.config.ts for LAN network access
- Document URL configuration, deployment, and testing procedures"
git push origin main
```

### Step 2: Test Locally

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173/editor`

3. Create a test portfolio and publish it

4. Navigate to `http://localhost:5173/qr`

5. Verify:
   - ✅ QR code displays
   - ✅ URL shows `http://localhost:5173/p/:slug`
   - ✅ Download buttons work (PNG, SVG)

---

## Short-term (This Week)

### Step 3: Set Up Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up (free tier sufficient)
3. Connect GitHub account
4. Authorize StudentFolio repository access

### Step 4: Create Vercel Project

#### Option A: Via Vercel Dashboard (Easiest)

1. Log into [vercel.com](https://vercel.com)
2. Click **Add New...** → **Project**
3. Select your StudentFolio repository
4. Click **Import**
5. Leave settings as default (framework: Vite auto-detected)
6. Click **Deploy**

**Wait for deployment to complete (~3-5 minutes)**

#### Option B: Via Vercel CLI

```bash
npm install -g vercel
cd d:\studentfolio-starter
vercel
```

Follow prompts to connect repository.

### Step 5: Configure Environment Variables

1. In Vercel, go to your project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ucbrktszcxoteiowijda.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_oVZWmEfbU0YkjUTr3Kz-4Q_XWHkhbrO` |
| `VITE_APP_URL` | `https://your-project-name.vercel.app` |

**Note**: Replace `your-project-name` with your actual Vercel project name (shown on dashboard)

4. Click **Save**
5. Trigger new deployment: Click **Deployments** → **Redeploy** on latest commit

**Wait for redeploy to complete**

---

## Testing (This Week)

### Step 6: Test Public Portfolio Access

1. Once deployment completes:
   - Open `https://your-project-name.vercel.app`
   - You should see StudentFolio loading

2. Log in with your credentials

3. Navigate to `/qr`

4. Verify:
   - ✅ No warning about private URL
   - ✅ QR code displays
   - ✅ URL shows `https://your-project-name.vercel.app/p/:slug`
   - ✅ Download PNG/SVG buttons work

### Step 7: Test QR Code on Phone

1. On your phone (connected to any network):
   - Open camera or QR scanner app
   - Scan QR code from `/qr` page

2. Verify:
   - ✅ Link opens in browser
   - ✅ Portfolio displays (no login required)
   - ✅ Content is readable on mobile

3. Optional: Test unpublished portfolio remains private:
   - In incognito browser, try `https://your-project-name.vercel.app/p/unpublished-slug`
   - Should return 404 or "Not found"

### Step 8: Test QR Permanence

1. On your laptop: Get QR code from `/qr` and take screenshot

2. Update portfolio details (bio, projects, etc.)

3. Save and publish changes

4. Go back to `/qr`

5. Verify:
   - ✅ QR code URL is identical to before
   - ✅ Scanned URL opens updated portfolio

---

## Optional: Custom Domain (Adds Branding)

### Step 9: Set Up Custom Domain (Optional)

If you have a domain (e.g., `studentfolios.example.com`):

1. In Vercel, go to project **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for domain verification (~5-30 minutes)
5. Update `VITE_APP_URL` in Vercel environment variables:
   ```
   VITE_APP_URL=https://portfolios.example.com
   ```
6. Redeploy

**Benefits**:
- Professional appearance: `portfolios.example.com/p/john-smith`
- QR codes use your domain instead of `vercel.app`
- Portable to different host later if needed

---

## Ongoing

### Step 10: Share QR Codes

Now your QR codes are production-ready:

1. Students can generate QR codes from `/qr` page
2. QR codes are scannable from any device
3. URLs are permanent (don't change after edits)
4. URLs are shareable (work for anyone, not just on LAN)

Students can:
- ✅ Download QR as PNG/SVG
- ✅ Print QR codes
- ✅ Email QR codes
- ✅ Share on social media
- ✅ Put on business cards
- ✅ Include in resume

---

## Troubleshooting

### "Deployment failed" in Vercel

**Cause**: Environment variables missing or build error

**Fix**:
1. Check Vercel deployment logs (Deployments tab → click failed deployment)
2. Verify all `VITE_*` environment variables are set
3. Check that build command is `npm run build` (should be auto-detected)
4. Retry: Click **Deployments** → **Redeploy** on the commit

### QR Code Shows Localhost URL

**Cause**: `VITE_APP_URL` not configured correctly in Vercel

**Fix**:
1. Go to Vercel project **Settings** → **Environment Variables**
2. Verify `VITE_APP_URL` is set to your actual deployed domain
3. Redeploy: Deployments → Redeploy
4. Wait 2-3 minutes for new deployment
5. Regenerate QR code in `/qr`

### Phone Can't Access Portfolio via QR

**Cause**: Several possible reasons

**Fix**:
1. Verify portfolio is published (check in editor)
2. Test manually: On phone, visit `https://your-project-name.vercel.app/p/slug`
3. If manual URL works but QR doesn't: Try clearing phone cache and re-scan
4. If manual URL doesn't work: Check Vercel deployment status, environment variables

### 404 on `/p/:slug`

**Cause**: SPA routing not configured or vercel.json issue

**Fix**:
1. Check `vercel.json` exists in repository root
2. Check it has `/p/:slug` rewrite rule
3. Verify file is committed and pushed to git
4. Redeploy from Vercel dashboard

---

## Verification Checklist

Before sharing QR codes with students:

### Local Testing
- [ ] Dev server runs (`npm run dev`)
- [ ] QR code generates at `http://localhost:5173/qr`
- [ ] QR URL is `http://localhost:5173/p/:slug`

### Vercel Deployment
- [ ] Vercel project created
- [ ] Environment variables set (VITE_*)
- [ ] Deployment shows green checkmark
- [ ] App loads at `https://your-project-name.vercel.app`

### Production Testing
- [ ] Log in to production app
- [ ] Generate QR code at `/qr`
- [ ] QR URL is production domain (not localhost)
- [ ] No warning about private URL
- [ ] Download PNG/SVG works
- [ ] QR scans successfully on phone
- [ ] Portfolio opens without login
- [ ] Portfolio content displays correctly
- [ ] Mobile layout is readable

### Security
- [ ] Published portfolio accessible without login
- [ ] Unpublished portfolio returns 404 or error
- [ ] Try in incognito/private mode to verify

---

## Success Criteria

You'll know it's working when:

1. ✅ QR code encodes production HTTPS URL (not localhost)
2. ✅ QR code scans on any phone
3. ✅ Portfolio opens without authentication
4. ✅ Portfolio displays correctly on mobile
5. ✅ QR code URL doesn't change after edits
6. ✅ Unpublished portfolios remain private
7. ✅ No console errors or warnings about URLs
8. ✅ Deployment logs show successful builds

---

## Next: Student Communication

Once deployment is verified, you can tell students:

> "Your portfolio is now live! Here's how to share it:
> 
> 1. Go to the **QR Code** section in your editor
> 2. Generate your personal QR code
> 3. Download as PNG or SVG
> 4. Print it, share digitally, or put it on your resume
> 
> The link stays the same even after you update your portfolio, so it's safe to print!"

---

## Support Resources

- `DEPLOYMENT.md` - Full deployment guide
- `QR_CODE_TESTING.md` - Comprehensive testing procedures
- `URL_CONFIGURATION.md` - URL configuration reference
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)

---

## Timeline

| When | What | Time |
|------|------|------|
| Now | Commit code, test locally | 30 min |
| This week | Set up Vercel | 15 min |
| This week | Configure environment | 5 min |
| This week | Test on phone | 15 min |
| This week | Share with students | 5 min |

**Total time to production: ~1.5 hours**

---

## You're Ready!

All code is in place. You now need to:

1. Push to main branch
2. Create Vercel project
3. Set environment variables
4. Test on phone
5. Share with students

**Deployment is straightforward and reversible.** If anything goes wrong, you can revert the git commit or rollback on Vercel.

Good luck! 🚀
