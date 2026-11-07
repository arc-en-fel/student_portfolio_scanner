# QR Code Testing Guide

This guide walks through testing QR code functionality end-to-end, covering local development and production deployment.

## Quick Start

### Local Development Testing

#### Setup for Phone Testing on LAN

1. Find your laptop's IP address:

   **Windows (PowerShell)**:
   ```powershell
   ipconfig | findstr /i ipv4
   ```

   Look for an address like `192.168.1.100` or `10.0.0.x`

   **macOS/Linux**:
   ```bash
   ifconfig | grep "inet "
   ```

2. Set up environment variable in `.env.local`:
   ```
   VITE_LAN_URL=http://192.168.1.100:5173
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. On your phone connected to the same WiFi:
   - Open browser
   - Navigate to `http://192.168.1.100:5173`
   - Log in to StudentFolio

#### Generate and Test QR Code

1. In the editor, create a test portfolio and **publish** it
2. Navigate to `/qr` (or click "QR Code" link)
3. You should see:
   - "Published" badge (green)
   - QR code display
   - URL showing `http://192.168.1.100:5173/p/:slug`
   - Download buttons (PNG, SVG)
   - Copy link button

4. On your phone:
   - Open camera or QR scanner app
   - Scan the QR code
   - Should navigate to `http://192.168.1.100:5173/p/:slug`
   - Portfolio displays without login

#### Verify QR Code Permanence

1. In editor, modify portfolio details (e.g., update bio, add projects)
2. Save changes
3. Return to `/qr`
4. **Verify QR code is unchanged**
5. Scan again on phone - should show updated content

### Production Testing (After Vercel Deployment)

#### Prerequisites

- Vercel deployment complete
- `VITE_APP_URL` configured with production domain
- Portfolio published

#### Test Published Portfolio Access

1. Open incognito/private browser tab
2. Navigate to `https://your-domain/p/:slug`
3. Verify:
   - Portfolio loads without login
   - All content displays correctly
   - No authentication redirect

#### Test QR Code Generation

1. Open `https://your-domain/qr` (logged in)
2. Verify:
   - QR code displays
   - URL shows production domain (not localhost)
   - No warning about private URL

3. Download QR code (PNG or SVG)
4. Scan on phone:
   - QR scans successfully
   - Opens production portfolio
   - Mobile layout renders correctly

#### Test Unpublished Portfolio Remains Private

1. Create new unpublished portfolio
2. Try to access `/p/:slug-of-unpublished` in incognito
3. Verify:
   - Returns 404 or "Not found"
   - Does not display unpublished content

## Detailed Testing Scenarios

### Scenario 1: Initial Setup

**Goal**: Verify QR code generation works locally

**Steps**:
1. Start with fresh `.env.local` (VITE_APP_URL=http://localhost:5173)
2. Run `npm run dev`
3. Create and publish test portfolio
4. Navigate to `/qr`
5. See QR code with localhost URL

**Expected Result**:
- QR code displays
- URL is `http://localhost:5173/p/:slug`
- Scanning on same machine works (but not on other phones)

**Verification**: QR code visible, URL correct

---

### Scenario 2: LAN Testing (Phone Access)

**Goal**: Verify QR codes work on phones via LAN IP

**Prerequisites**:
- Phone on same WiFi network as laptop
- `VITE_LAN_URL=http://192.168.1.100:5173` in `.env.local`
- Dev server running

**Steps**:
1. On laptop: Navigate to `/qr`
2. Verify URL is `http://192.168.1.100:5173/p/:slug`
3. On phone: Scan QR code
4. Phone browser should navigate to portfolio

**Expected Result**:
- Phone can open the QR link
- Portfolio displays correctly on mobile
- Navigation and interactivity work

**Verification**: Portfolio opens on phone via QR scan, content displays, no login required

---

### Scenario 3: URL Permanence

**Goal**: Verify QR code URL doesn't change when portfolio is edited

**Steps**:
1. Generate QR code (note the URL)
2. Download as PNG
3. Edit portfolio (change name, add projects, update bio)
4. Publish changes
5. Navigate back to `/qr`
6. Compare QR code URL with downloaded PNG

**Expected Result**:
- QR code URL is identical
- Downloaded PNG still works
- Scanned URL opens updated portfolio

**Verification**: QR code URL unchanged, downloaded PNG still functional

---

### Scenario 4: Production Deployment

**Goal**: Verify QR codes work in production

**Prerequisites**:
- Deployed to Vercel
- Custom domain configured (e.g., `https://studentfolio.example.com`)
- `VITE_APP_URL=https://studentfolio.example.com` in Vercel environment

**Steps**:
1. Log in at production URL
2. Publish test portfolio
3. Navigate to `/qr`
4. Verify:
   - URL is production domain (no warning)
   - No "localhost/private URL" warning
   - QR code displays normally
5. Download QR as PNG
6. On phone:
   - Use offline QR scanner (or disconnect from WiFi)
   - Scan QR code
   - Open link (may require WiFi/data)
7. Verify portfolio opens

**Expected Result**:
- QR code encodes production HTTPS URL
- No private URL warnings
- QR scans work anywhere (not just on LAN)
- Published portfolio accessible without login

**Verification**: QR code functional in production, URLs are HTTPS, no warnings

---

### Scenario 5: Private Portfolios Remain Private

**Goal**: Verify unpublished portfolios are inaccessible via QR links

**Steps**:
1. Create test portfolio with content
2. **Do NOT publish** it
3. Try to manually access `/p/:slug` in incognito/private window
4. Or, generate QR anyway (if you can) and try to scan

**Expected Result**:
- 404 error or "Not found" page
- No portfolio content displayed
- No authentication required, just denied access

**Verification**: Unpublished portfolio blocked, returns error

---

### Scenario 6: URL Validation

**Goal**: Verify production rejects localhost URLs for QR codes

**Steps**:
1. Temporarily set `VITE_APP_URL=http://localhost:5173` in production
2. Rebuild and deploy
3. Try to generate QR code
4. View `/qr` in browser

**Expected Result**:
- Warning or error displayed
- QR code may not generate or shows warning
- Developer console shows error

**Verification**: Localhost rejected in production, warning shown

---

### Scenario 7: Cross-Device Testing

**Goal**: Verify QR codes work across devices

**Steps**:
1. Generate QR code on desktop
2. Test scanning on:
   - iPhone
   - Android phone
   - Tablet
3. For each device:
   - Scan QR
   - Verify portfolio opens
   - Test navigation

**Expected Result**:
- All devices successfully scan QR
- Portfolio displays correctly on each device size
- Responsive design works

**Verification**: QR works on all device types, responsive layout functional

---

## Troubleshooting

### QR Code Shows Localhost URL

**Problem**: QR code encodes `http://localhost:5173`

**Cause**: `VITE_LAN_URL` not set or development server running without it

**Fix**:
1. Add `VITE_LAN_URL=http://YOUR_IP:5173` to `.env.local`
2. Restart dev server: `npm run dev`
3. Regenerate QR code

**Verification**: QR code URL now uses LAN IP

---

### QR Code Shows Private URL Warning in Production

**Problem**: Warning displayed at `/qr` about localhost/private URL

**Cause**: `VITE_APP_URL` not configured correctly in production

**Fix**:
1. In Vercel project settings
2. Go to **Deployments** > **Settings** > **Environment Variables**
3. Set `VITE_APP_URL=https://your-domain.vercel.app`
4. Trigger new deployment: `git push origin main`

**Verification**: No warning displayed after redeploy

---

### Scanned QR Code 404s on Phone

**Problem**: Scanning QR on phone shows 404 or "Not found"

**Cause**: Possible issues:
- Portfolio not published
- Network connectivity issue
- Incorrect URL in QR

**Fix**:
1. Verify portfolio is published (check in editor)
2. Verify phone can reach the URL:
   - On phone, manually enter QR URL in browser
   - Should load without auth
3. Verify QR code URL is correct:
   - On laptop, navigate to URL shown in `/qr`
   - Should load portfolio

**Verification**: Manual navigation works, published status confirmed, then QR should work

---

### QR Code Works Locally But Not After Deployment

**Problem**: QR scans fine in local dev, but fails after deploying to Vercel

**Cause**: URL changed from `http://localhost` to production domain

**Fix**:
1. Verify deployment complete (Vercel shows green checkmark)
2. Verify `VITE_APP_URL` environment variable set in Vercel
3. Check that SPA routing configured (`vercel.json` exists)
4. Clear browser cache on phone
5. Re-scan QR or manually navigate to URL

**Verification**: Deployment complete, env vars set, manual navigation works, then QR works

---

## Testing Checklist

- [ ] Local dev: QR code displays with localhost URL
- [ ] LAN testing: Phone can access portfolio via LAN IP
- [ ] URL permanence: QR code doesn't change after edits
- [ ] Production deployment: Deployed to Vercel
- [ ] Production QR: URL uses production domain (HTTPS)
- [ ] Production mobile: QR scans work on phone in production
- [ ] Unpublished blocked: Unpublished portfolio returns 404
- [ ] Incognito access: Published portfolio accessible without login
- [ ] Multiple devices: QR scans on iPhone, Android, and tablets
- [ ] Cross-domain: Can share QR link via social media/email and it works

## Support

If QR codes are not working:

1. Check `.env.local` or Vercel environment variables
2. Verify `VITE_APP_URL` is set to the correct domain
3. Verify portfolio is published (`is_published = true`)
4. Check browser console (F12 → Console) for errors
5. Review this guide's troubleshooting section
6. Check deployment logs in Vercel dashboard
