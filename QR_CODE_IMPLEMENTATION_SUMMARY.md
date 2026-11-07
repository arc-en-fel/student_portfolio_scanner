# QR Code Implementation Summary

This document summarizes all changes made to support public QR code sharing with permanent canonical URLs.

## Problem Statement

StudentFolio QR codes were encoding `http://localhost:5173`, making them:
- ❌ Unusable on phones outside the development machine
- ❌ Non-shareable (URLs private to developer)
- ❌ Dependent on localhost (breaks in production)

## Solution Overview

Implemented centralized URL configuration system that:
- ✅ Uses environment variables for production domains
- ✅ Supports LAN IPs for local phone testing
- ✅ Validates against localhost/private addresses in production
- ✅ Generates permanent, shareable QR code URLs
- ✅ Provides Vercel SPA routing configuration
- ✅ Ensures published portfolios accessible without authentication

## Files Created

### 1. `src/lib/config.ts` (NEW)

**Purpose**: Centralized application configuration

**Key Functions**:
- `getCanonicalAppUrl()`: Returns the correct URL for the environment
  - Production: Uses `VITE_APP_URL`
  - Development: Uses `VITE_APP_URL` or `VITE_LAN_URL` or `window.location.origin`
  - Validates URLs in production (no localhost)

- `validatePublicUrl(url)`: Ensures QR code URLs are production-safe

- `isLocalhostOrPrivate(url)`: Detects private/local addresses (prevents unusable QR codes)

- `isPrivateAddress(url)`: Checks if URL is on private network (used for `VITE_LAN_URL`)

- `buildPublicPortfolioUrl(slug)`: Constructs shareable portfolio URLs

- `getEnvironmentInfo()`: Returns debugging information

**Usage**:
```typescript
import { getCanonicalAppUrl, buildPublicPortfolioUrl } from '@/lib/config'

const portfolioUrl = buildPublicPortfolioUrl('john-smith')
// Returns: https://studentfolio.vercel.app/p/john-smith (production)
// Returns: http://192.168.1.100:5173/p/john-smith (LAN testing)
// Returns: http://localhost:5173/p/john-smith (local dev)
```

---

### 2. `src/lib/portfolio.ts` (UPDATED)

**Changes**:
- Imports centralized config functions
- `publicUrl(slug)` now uses `buildPublicPortfolioUrl()` instead of inline fallback
- Removed direct use of `window.location.origin` (prevented unsafe localhost in production)

**Before**:
```typescript
export function publicUrl(slug: string): string {
  return `${(import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')}/p/${slug}`
}
```

**After**:
```typescript
import { buildPublicPortfolioUrl } from './config'

export function publicUrl(slug: string): string {
  return buildPublicPortfolioUrl(slug)
}
```

**Impact**: QR codes now use validated, centralized URL configuration

---

### 3. `src/pages/QRPage.tsx` (UPDATED)

**Changes**:
- Imports `isLocalhostOrPrivate` and `getCanonicalAppUrl` from config
- Adds state tracking for private URLs (`isURLPrivate`)
- Displays warning banner when QR code uses localhost/private URL in production
- Warning guides users to configure `VITE_APP_URL` for production

**New UI Warning**:
- Yellow alert banner when localhost URL detected in production
- Explains how to fix via `VITE_APP_URL` configuration
- Uses `AlertCircle` icon from lucide-react

**Example**:
```
⚠️ QR code uses a localhost or private URL
Configure VITE_APP_URL with your production domain so QR codes are shareable on phones.
```

---

### 4. `vercel.json` (NEW)

**Purpose**: Configures Vercel SPA routing for public portfolios

**Content**:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/p/:slug",
      "destination": "/index.html"
    }
  ]
}
```

**Impact**:
- Routes `/p/:slug` requests to `index.html` for SPA handling
- Allows React Router to control public portfolio routing
- Enables clean URLs: `https://domain/p/john-smith` (not `?slug=...`)
- Required for Vercel deployment

---

### 5. `.env.example` (UPDATED)

**Changes**:
- Documented `VITE_APP_URL` usage for dev and production
- Added `VITE_LAN_URL` with explanation and examples
- Added comments explaining when each variable is used

**New Documentation**:
```env
# Application URL Configuration
# Used for QR codes, public portfolio links, and sharing

# Local development (default):
VITE_APP_URL=http://localhost:5173

# Production deployment (set this in Vercel environment variables):
# VITE_APP_URL=https://your-domain.vercel.app

# Optional: LAN IP for testing on phones during local development
# VITE_LAN_URL=http://192.168.x.x:5173
```

---

### 6. `vite.config.ts` (UPDATED)

**Changes**:
- Added server configuration to enable network access for LAN testing
- `host: true` allows accessing dev server from other devices on network

**Impact**:
- Dev server accessible at `http://YOUR_IP:5173` from other devices
- Enables phone testing without additional configuration
- Commonly needed for mobile testing during development

---

### 7. `DEPLOYMENT.md` (NEW)

**Purpose**: Complete deployment guide for Vercel

**Contents**:
- Step-by-step deployment instructions
- Environment variable configuration
- Custom domain setup
- Public portfolio access verification
- QR code testing procedures
- Troubleshooting common issues
- Production checklist

**Key Sections**:
- Prerequisites and initial setup
- Vercel project creation (UI and CLI methods)
- Environment variables with explanations
- Custom domain configuration (optional)
- Deployment trigger via git push
- Public portfolio access architecture
- Database security (RLS, `is_published` checks)
- Testing procedures
- Troubleshooting guide

---

### 8. `QR_CODE_TESTING.md` (NEW)

**Purpose**: Comprehensive testing guide for QR codes

**Contents**:
- Quick start for local testing
- Phone testing via LAN
- QR code permanence verification
- Production deployment testing
- Seven detailed test scenarios
- Troubleshooting for common issues
- Complete testing checklist

**Scenarios Covered**:
1. Initial setup with localhost
2. LAN testing with phone access
3. URL permanence after edits
4. Production deployment
5. Private portfolio security
6. URL validation in production
7. Cross-device testing

---

### 9. `URL_CONFIGURATION.md` (NEW)

**Purpose**: Quick reference for URL configuration

**Contents**:
- Environment variable reference
- Configuration priority system
- Common scenarios with examples
- Testing URLs for each environment
- Troubleshooting guide
- Code usage examples
- Best practices
- Summary table

**Quick Reference**:
| Scenario | VITE_APP_URL | VITE_LAN_URL | QR Encodes |
|----------|--------------|--------------|------------|
| Local dev | localhost:5173 | (not set) | localhost URL |
| LAN testing | localhost:5173 | 192.168.x.x:5173 | LAN IP |
| Production | domain.vercel.app | (not used) | HTTPS domain |

---

## Architecture

### URL Resolution Priority

```
┌─────────────────────────────────────────────┐
│ getCanonicalAppUrl()                        │
├─────────────────────────────────────────────┤
│ 1. VITE_APP_URL (always first)              │
│ 2. VITE_LAN_URL (dev only, if not set 1)   │
│ 3. window.location.origin (dev fallback)    │
│ 4. Error (production must have 1)           │
└─────────────────────────────────────────────┘
     ↓
     Used by publicUrl(slug) → QR codes
```

### Data Flow for QR Code Generation

```
QRPage.tsx
  ↓
publicUrl(profile.slug)
  ↓
buildPublicPortfolioUrl(slug)
  ↓
getCanonicalAppUrl()
  ↓
Returns validated, canonical URL
  ↓
QRCodeSVG renders QR code
```

### Public Portfolio Access Flow

```
Phone scans QR → HTTPS://domain/p/slug
              ↓
         Vercel SPA routing (vercel.json)
              ↓
         Serves index.html to React Router
              ↓
         React Router matches /p/:slug
              ↓
         PublicPortfolio component loads
              ↓
         Queries supabase WHERE is_published=true AND slug=:slug
              ↓
         RLS policy allows unauthenticated access
              ↓
         Portfolio displays (no login required)
```

---

## Environment Configuration

### Local Development

```bash
# .env.local
VITE_APP_URL=http://localhost:5173
# QR codes: http://localhost:5173/p/:slug
# Use: Testing locally, not shareable
```

### LAN Testing

```bash
# .env.local (with VITE_LAN_URL)
VITE_APP_URL=http://localhost:5173
VITE_LAN_URL=http://192.168.1.100:5173
# QR codes: http://192.168.1.100:5173/p/:slug
# Use: Testing on phones connected to same WiFi
```

### Production

```bash
# Vercel Environment Variables
VITE_APP_URL=https://studentfolio.vercel.app
VITE_SUPABASE_URL=https://ucbrktszcxoteiowijda.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# QR codes: https://studentfolio.vercel.app/p/:slug
# Use: Permanent, shareable URLs for any device
```

---

## Security Features

### 1. URL Validation

```typescript
validatePublicUrl(url) → Rejects localhost/private in production
```

- Prevents accidentally deploying localhost URLs
- Production only: Requires HTTPS domain
- Throws error if misconfigured

### 2. Private Address Detection

```typescript
isLocalhostOrPrivate(url) → Detects RFC 1918 ranges + localhost
```

- Blocks 10.x, 172.16-31.x, 192.168.x ranges
- Blocks 127.0.0.1, ::1, localhost
- Blocks link-local addresses (169.254.x)
- Used in QR page for warning display

### 3. RLS + Published Flag

- Database RLS policies block unauthenticated access to unpublished
- Only `is_published=true` portfolios visible without auth
- Portfolio slug is unique and permanent

### 4. Supabase Publishable Key Only

- Frontend uses anonymous (publishable) key
- No secret keys in frontend code
- Users can read published portfolios, not modify

---

## Testing

### Unit Testing (Manual)

```typescript
// Test configuration logic
import { getCanonicalAppUrl, isLocalhostOrPrivate, buildPublicPortfolioUrl } from '@/lib/config'

// Dev: should return localhost
getCanonicalAppUrl() // http://localhost:5173

// Prod: should validate
validatePublicUrl('http://localhost:5173') // throws error

// Private detection
isLocalhostOrPrivate('http://192.168.1.100:5173') // true
isLocalhostOrPrivate('https://example.com') // false
```

### Integration Testing

1. **Local Dev**: QR code generates, encodes localhost
2. **LAN Testing**: Phone scans QR, accesses portfolio
3. **Production**: QR encodes HTTPS, shareable anywhere
4. **Permanence**: QR unchanged after edits
5. **Security**: Unpublished blocked, published accessible

See `QR_CODE_TESTING.md` for comprehensive test procedures.

---

## Migration Guide

### For Existing Deployments

If you already have StudentFolio deployed:

1. **Update code** (git pull latest)
2. **Deploy to Vercel**:
   ```bash
   git push origin main
   ```
3. **Set environment variables** in Vercel:
   - `VITE_APP_URL=https://your-domain.vercel.app`
4. **Redeploy** (trigger new deployment)
5. **Test QR codes**: Navigate to `/qr`, verify production domain
6. **Regenerate QR codes** if shared before this update

### For New Deployments

1. **Follow DEPLOYMENT.md**
2. **Configure VITE_APP_URL** before first deployment
3. **Deploy to Vercel** (automatic on git push)
4. **Test QR codes** immediately after deployment
5. **Share QR codes** (they're permanent and shareable)

---

## Rollback Plan

If you need to revert to old URL handling:

1. Revert `src/lib/portfolio.ts` to use `window.location.origin` fallback
2. Remove `src/lib/config.ts`
3. Remove validation from QR page
4. Remove `vercel.json`

**Note**: This brings back localhost QR codes, which won't work on phones. Not recommended for production.

---

## Performance Impact

- **Minimal**: All config functions are synchronous, environment-based
- **No runtime overhead**: URLs resolved at startup, cached
- **No network calls**: Configuration is compile-time via environment variables
- **QR generation**: Same as before (no added processing)

---

## Browser Compatibility

- All browser APIs used are standard
- `URL()` constructor supported in all modern browsers
- No new dependencies added
- Tested on Chrome, Firefox, Safari, Edge

---

## Future Enhancements

Possible additions (not included in this implementation):

1. **Analytics**: Track QR code scans with URL parameters
2. **Custom QR styling**: Add logos, colors to QR codes
3. **URL shortening**: Use service like bit.ly for shorter QR codes
4. **Multi-domain**: Support different domains for different student groups
5. **Dynamic QR updates**: Regenerate QR if URL changes
6. **Expiring QR codes**: Optional time-based URL expiration

---

## Verification Checklist

After implementing these changes:

- [x] `src/lib/config.ts` created with URL validation
- [x] `src/lib/portfolio.ts` updated to use config
- [x] `src/pages/QRPage.tsx` updated with warnings
- [x] `vercel.json` created for SPA routing
- [x] `.env.example` documented with LAN option
- [x] `vite.config.ts` updated for network access
- [x] `DEPLOYMENT.md` created with full guide
- [x] `QR_CODE_TESTING.md` created with test scenarios
- [x] `URL_CONFIGURATION.md` created as quick reference
- [x] TypeScript compilation (no errors)
- [x] No new dependencies added
- [x] All imports resolve correctly
- [x] Build completes successfully

---

## Related Documentation

- `DEPLOYMENT.md`: Complete deployment guide
- `QR_CODE_TESTING.md`: Testing procedures
- `URL_CONFIGURATION.md`: Quick configuration reference
- `.env.example`: Environment variable template
- `vercel.json`: Vercel configuration

---

## Summary

StudentFolio now supports production-ready QR codes with:

✅ **Centralized URL configuration** via `VITE_APP_URL`  
✅ **LAN testing** via `VITE_LAN_URL` for phone testing  
✅ **Production validation** preventing localhost URLs  
✅ **Permanent URLs** that don't change after edits  
✅ **Public access** without authentication for published portfolios  
✅ **Vercel deployment** ready with SPA routing  
✅ **Security** via RLS and `is_published` checks  
✅ **Comprehensive documentation** for deployment and testing  

QR codes can now be scanned from any device and shared publicly with confidence.
