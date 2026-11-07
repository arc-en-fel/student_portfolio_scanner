# URL Configuration Reference

Quick reference for configuring application URLs across development and production environments.

## Environment Variables

### VITE_APP_URL

**What it does**: Sets the canonical URL for public portfolios, QR codes, and shared links.

**Usage**:
```env
# Local development (default)
VITE_APP_URL=http://localhost:5173

# LAN/IP address (optional, for phone testing)
VITE_APP_URL=http://192.168.1.100:5173

# Production deployment
VITE_APP_URL=https://studentfolio.vercel.app
# or with custom domain:
VITE_APP_URL=https://portfolios.example.com
```

**Important**: This URL is encoded into QR codes and used for shared portfolio links. Must be:
- ✅ Public HTTPS in production
- ✅ Accessible without authentication
- ✅ Stable and permanent
- ❌ Never localhost in production
- ❌ Never changed without updating QR codes

### VITE_LAN_URL

**What it does**: (Development only) Allows testing on phones via local network IP.

**Usage**:
```env
# Only set this for LAN testing
VITE_LAN_URL=http://192.168.1.100:5173
```

**When to use**:
- Testing on phone connected to same WiFi
- Verifying QR codes work across devices
- Checking mobile layout before deployment

**When NOT to use**:
- Production (ignored in prod)
- If not on local network
- Leave blank if not needed

**Priority**: Only used if `VITE_APP_URL` is NOT set (in development)

### VITE_SUPABASE_URL

**What it does**: Supabase backend API endpoint.

**Production value**: `https://ucbrktszcxoteiowijda.supabase.co`

### VITE_SUPABASE_PUBLISHABLE_KEY

**What it does**: Anonymous (public) API key for frontend.

**Important**: Never use the secret key; always use the publishable key for frontend.

**Production value**: `sb_publishable_oVZWmEfbU0YkjUTr3Kz-4Q_XWHkhbrO`

## Configuration Priority

### Local Development

```
1. VITE_APP_URL (if set)
   ↓
2. VITE_LAN_URL (if set and VITE_APP_URL not set)
   ↓
3. window.location.origin (http://localhost:5173)
```

### Production

```
1. VITE_APP_URL (REQUIRED - must be configured)
   ↓
2. Error if not set
```

## Common Scenarios

### Scenario A: Local Development (Default)

**Goal**: Develop on localhost

**Setup**:
```env
VITE_APP_URL=http://localhost:5173
# VITE_LAN_URL not needed
```

**Result**:
- QR codes encode `http://localhost:5173/p/:slug`
- Only testable on dev machine
- Phone cannot scan (private network)

---

### Scenario B: LAN Testing (Phone Testing)

**Goal**: Test QR codes on phone while developing

**Setup**:
```env
VITE_APP_URL=http://localhost:5173
VITE_LAN_URL=http://192.168.1.100:5173
```

**Result**:
- QR codes encode `http://192.168.1.100:5173/p/:slug`
- Phone on same WiFi can scan and access portfolio
- Great for testing mobile layout

**How to find your IP**:
```bash
# Windows PowerShell
ipconfig | findstr /i ipv4

# macOS/Linux
ifconfig | grep "inet "
```

Look for address like `192.168.1.x` or `10.0.0.x` (not 127.0.0.1)

---

### Scenario C: Production on Vercel

**Goal**: Deploy to production with shareable QR codes

**Setup in Vercel**:
1. Go to project settings
2. Environment Variables
3. Add:
   - `VITE_APP_URL=https://studentfolio.vercel.app`
   - `VITE_SUPABASE_URL=https://ucbrktszcxoteiowijda.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`

**Result**:
- QR codes encode `https://studentfolio.vercel.app/p/:slug`
- Shareable on any device with internet
- SPA routing handles `/p/:slug` requests

---

### Scenario D: Production with Custom Domain

**Goal**: Deploy to Vercel with branded domain

**Setup in Vercel**:
1. Add custom domain (DNS configuration)
2. Environment Variables:
   - `VITE_APP_URL=https://portfolios.example.com`

**Result**:
- QR codes encode `https://portfolios.example.com/p/:slug`
- Professional appearance
- Portable if changing hosts later

---

## Testing URLs

### Local Development

```
App URL:          http://localhost:5173
Editor:           http://localhost:5173/editor
Public portfolio: http://localhost:5173/p/john-smith
QR code page:     http://localhost:5173/qr (logged in)
```

### LAN Testing

```
App URL:          http://192.168.1.100:5173
Editor:           http://192.168.1.100:5173/editor
Public portfolio: http://192.168.1.100:5173/p/john-smith
QR code page:     http://192.168.1.100:5173/qr (logged in)
```

On phone (same WiFi):
```
Portfolio URL: http://192.168.1.100:5173/p/john-smith (scanned from QR)
```

### Production (Vercel)

```
App URL:          https://studentfolio.vercel.app
Editor:           https://studentfolio.vercel.app/editor
Public portfolio: https://studentfolio.vercel.app/p/john-smith
QR code page:     https://studentfolio.vercel.app/qr (logged in)
```

On any device:
```
Portfolio URL: https://studentfolio.vercel.app/p/john-smith (scanned from QR)
```

---

## Troubleshooting

### Problem: QR Code Shows Localhost URL in Production

**Cause**: `VITE_APP_URL` not configured in Vercel environment

**Fix**:
1. Go to Vercel project → Settings → Environment Variables
2. Add `VITE_APP_URL=https://your-domain.vercel.app`
3. Redeploy: `git push origin main`

---

### Problem: Phone Can't Scan QR Code on Local Network

**Cause**: `VITE_LAN_URL` not set correctly

**Fix**:
1. Find your laptop's IP: `ipconfig | findstr /i ipv4`
2. Set `VITE_LAN_URL=http://192.168.1.100:5173` (use your IP)
3. Restart dev server: `npm run dev`
4. Regenerate QR code

---

### Problem: QR Code URL Changes After Deployment

**This should not happen**. Portfolio slugs are permanent.

**If it does**:
1. Check `VITE_APP_URL` - verify it didn't change
2. Check portfolio slug is unchanged
3. Verify RLS policies allow public access to published portfolios

---

## Code Usage

### Getting the Canonical URL Programmatically

```typescript
import { getCanonicalAppUrl, buildPublicPortfolioUrl } from '@/lib/config'

// Get app URL
const appUrl = getCanonicalAppUrl() 
// Returns: https://studentfolio.vercel.app (prod) or http://localhost:5173 (dev)

// Build portfolio URL
const portfolioUrl = buildPublicPortfolioUrl('john-smith')
// Returns: https://studentfolio.vercel.app/p/john-smith
```

### Using in QR Code Generation

```typescript
import { publicUrl } from '@/lib/portfolio'

const qrUrl = publicUrl(profile.slug)
// Automatically uses correct URL from config
```

---

## Best Practices

1. **Never hardcode URLs** - Always use `VITE_APP_URL`
2. **Use HTTPS in production** - Never use HTTP for production
3. **Keep QR URLs stable** - Don't change `VITE_APP_URL` frequently
4. **Test before sharing** - Scan QR codes to verify they work
5. **Document your domain** - Write down production URL in deployment docs
6. **Check environment variables** - Verify all `VITE_*` are set in Vercel

---

## Summary

| Scenario | VITE_APP_URL | VITE_LAN_URL | QR Encodes |
|----------|--------------|--------------|------------|
| Local dev | `http://localhost:5173` | (not set) | localhost URL |
| LAN testing | `http://localhost:5173` | `http://192.168.1.100:5173` | LAN IP |
| Production | `https://studentfolio.vercel.app` | (not used) | HTTPS domain |
| Custom domain | `https://portfolios.example.com` | (not used) | HTTPS domain |

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
