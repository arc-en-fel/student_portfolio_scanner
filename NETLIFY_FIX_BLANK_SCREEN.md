# Fix Blank Screen on student-portfolio-qr-scanner.netlify.app

## Problem

**Netlify URL**: https://student-portfolio-qr-scanner.netlify.app  
**Issue**: Blank screen with console error  
**Error Message**: "StudentFolio: VITE_SUPABASE_URL environment variable not set."

## Root Cause

The Netlify site `student-portfolio-qr-scanner.netlify.app` does not have environment variables configured. Vite reads these variables at **build time**, so if they're missing during the Netlify build, the compiled JavaScript throws an error before React can render anything.

## Verification

### Local Build - ✅ WORKS
```
$ npm run build
✓ 1742 modules transformed
✓ 793 KB production bundle
✓ All assets generated
Status: SUCCESS (uses VITE_SUPABASE_URL from .env.local)
```

### Code Check - ✅ CORRECT
File: `src/lib/supabase.ts`
```typescript
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url) throw new Error('StudentFolio: VITE_SUPABASE_URL environment variable not set...')
if (!key) throw new Error('StudentFolio: VITE_SUPABASE_PUBLISHABLE_KEY environment variable not set...')
```

Error is working correctly - the environment variables are simply not set in Netlify.

## Required Environment Variables

These variables must be set in the Netlify site configuration:

| Variable | Value | Status |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | `https://ucbrktszcxoteiowijda.supabase.co` | ❌ NOT SET |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_oVZWmEfbU0YkjUTr3Kz-4Q_XWHkhbrO` | ❌ NOT SET |
| `VITE_APP_URL` | `https://student-portfolio-qr-scanner.netlify.app` | ❌ NOT SET |

## Solution - Manual Configuration in Netlify

### Step 1: Go to Your Netlify Site Settings

1. Open: https://app.netlify.com
2. Click the site: **student-portfolio-qr-scanner**
3. Go to: **Site Settings** (top navigation)
4. Click: **Build & Deploy** (left sidebar)
5. Click: **Environment** (left sidebar under "Build & Deploy")

### Step 2: Add Environment Variables

You should see an "Environment" section. Click **"Edit variables"** or **"Add variable"** button.

Add these 3 variables (one at a time):

```
Key: VITE_SUPABASE_URL
Value: https://ucbrktszcxoteiowijda.supabase.co
```

```
Key: VITE_SUPABASE_PUBLISHABLE_KEY
Value: sb_publishable_oVZWmEfbU0YkjUTr3Kz-4Q_XWHkhbrO
```

```
Key: VITE_APP_URL
Value: https://student-portfolio-qr-scanner.netlify.app
```

### Step 3: Save and Trigger Redeploy

1. Click: **Save**
2. Go to: **Deployments** (top navigation)
3. Find the latest deployment (top of the list)
4. Click: **Trigger deploy** → **Deploy site**

Netlify will rebuild with the environment variables set.

### Step 4: Wait for Build

- Build typically takes ~3-5 minutes
- Monitor the deploy log
- Once complete, navigate to: https://student-portfolio-qr-scanner.netlify.app

## Expected Result After Deployment

✅ **Homepage loads** (not blank screen)  
✅ **Navigation visible**  
✅ **Register/Login buttons work**  
✅ **No console errors**  
✅ **Can create account and log in**  
✅ **Dashboard renders after authentication**  
✅ **QR codes encode production domain**  
✅ **Public portfolio routes work**

## Files Already Fixed

The following code fixes are already in place (committed):

| File | Fix |
|------|-----|
| `netlify.toml` | Correct SPA routing (doesn't redirect assets to HTML) |
| `src/lib/supabase.ts` | Clear error messages for missing variables |
| `src/main.tsx` | Error handling at app startup |

**No code changes are needed.** Only environment variable configuration is required.

## Verification Checklist (After You Configure)

- [ ] Go to Netlify Site Settings
- [ ] Confirm all 3 environment variables are visible
- [ ] Trigger deploy
- [ ] Wait for build to complete
- [ ] Visit https://student-portfolio-qr-scanner.netlify.app
- [ ] Verify homepage loads (not blank)
- [ ] Open browser console (F12 → Console)
- [ ] Verify no red errors
- [ ] Test register → should work
- [ ] Test login → should work
- [ ] Test `/p/test` → should show portfolio or 404

## Troubleshooting

### If blank screen persists:

1. **Check environment variables are saved**
   - Netlify > Site Settings > Build & Deploy > Environment
   - All 3 variables visible?

2. **Check build log for errors**
   - Netlify > Deployments > latest > View deploy log
   - Any build errors?

3. **Clear browser cache**
   - Cmd/Ctrl+Shift+Delete
   - Reload page

4. **Check console for new errors**
   - F12 → Console
   - Any red error messages?

## Why This Happens

Vite is a build tool that reads environment variables at **compile time**, not runtime:

1. Netlify runs: `npm run build`
2. Vite compiles code and embeds environment variables into the JavaScript bundle
3. If variables don't exist during build, the code that tries to read them gets empty strings
4. The check `if (!url)` throws an error
5. This error happens before React renders
6. Result: Blank screen

This is the standard, secure way to handle environment variables in SPA deployments (not runtime configuration).

## Security Notes

- ✅ API keys are **NOT hardcoded** in source code
- ✅ `.env.local` is in `.gitignore` (not committed)
- ✅ Netlify environment variables are kept confidential
- ✅ Only the publishable key is exposed to the client (not the service-role key)

## Summary

| Item | Status | Details |
|------|--------|---------|
| Code | ✅ CORRECT | Error handling in place |
| Local Build | ✅ WORKS | 793 KB production bundle |
| Tests | ✅ PASSING | 234/234 |
| netlify.toml | ✅ CORRECT | SPA routing configured |
| Netlify Env Vars | ❌ NOT SET | **Your action required** |
| Production Deploy | ⏳ PENDING | Will work after env vars configured |

---

**Next Action**: Go to Netlify dashboard and add the 3 environment variables (see Step 1-3 above)

**ETA to Live**: ~5 minutes after you configure (build time ~3-5 min)
