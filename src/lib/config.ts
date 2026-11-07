/**
 * Centralized application configuration
 * Single source of truth for URLs, feature flags, and environment settings
 */

/**
 * Get the canonical application URL for public sharing (QR codes, links)
 * 
 * Priority:
 * 1. VITE_APP_URL environment variable (configured at build time)
 * 2. VITE_LAN_URL in development (for local IP testing on phones)
 * 3. window.location.origin only as fallback for development
 * 
 * NEVER uses localhost in production - this ensures QR codes are shareable
 */
export function getCanonicalAppUrl(): string {
  // Production or explicitly configured URL takes priority
  if (import.meta.env.VITE_APP_URL) {
    const url = import.meta.env.VITE_APP_URL;
    validatePublicUrl(url);
    return url;
  }

  // Development: LAN IP for local phone testing
  if (import.meta.env.DEV && import.meta.env.VITE_LAN_URL) {
    const lanUrl = import.meta.env.VITE_LAN_URL;
    if (!isPrivateAddress(lanUrl)) {
      console.warn(
        '[AppConfig] VITE_LAN_URL is not a private address, may not be accessible on LAN'
      );
    }
    return lanUrl;
  }

  // Development fallback: use current origin (localhost is OK in dev)
  if (import.meta.env.DEV) {
    return window.location.origin;
  }

  // Production: must have VITE_APP_URL configured
  throw new Error(
    'Production environment requires VITE_APP_URL to be configured. ' +
    'QR codes and public portfolio URLs depend on this canonical URL.'
  );
}

/**
 * Validate that a URL is suitable for public sharing
 * Rejects localhost and private addresses
 */
export function validatePublicUrl(url: string): boolean {
  if (!import.meta.env.DEV && isLocalhostOrPrivate(url)) {
    throw new Error(
      `Cannot use localhost or private address for public QR codes: ${url}\n` +
      `In production, VITE_APP_URL must be a public HTTPS URL (e.g., https://studentfolio.vercel.app)`
    );
  }
  return true;
}

/**
 * Check if URL is localhost or private network address
 * Used to prevent QR codes from encoding unusable URLs
 */
export function isLocalhostOrPrivate(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Localhost variants
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    ) {
      return true;
    }

    // Private network ranges (RFC 1918 + link-local + loopback)
    if (
      hostname.startsWith('10.') || // 10.0.0.0/8
      hostname.startsWith('172.') || // 172.16.0.0/12 - check more carefully
      hostname.startsWith('192.168.') || // 192.168.0.0/16
      hostname.startsWith('169.254.') || // 169.254.0.0/16 (link-local)
      hostname === '::' // IPv6 unspecified
    ) {
      return true;
    }

    // Check 172.x range more carefully (172.16.0.0 - 172.31.255.255)
    if (hostname.startsWith('172.')) {
      const secondOctet = parseInt(hostname.split('.')[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if address is a private/local address (for LAN development)
 * Used to validate VITE_LAN_URL
 */
export function isPrivateAddress(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check for private ranges (same as isLocalhostOrPrivate)
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname === '::'
    ) {
      return true;
    }

    // Check 172.x range
    if (hostname.startsWith('172.')) {
      const secondOctet = parseInt(hostname.split('.')[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Build a public portfolio URL for sharing (QR codes, links, etc.)
 * Uses canonical app URL to ensure shareable URLs
 */
export function buildPublicPortfolioUrl(slug: string): string {
  const appUrl = getCanonicalAppUrl();
  return `${appUrl}/p/${slug}`;
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    appUrl: import.meta.env.VITE_APP_URL || '(not configured)',
    lanUrl: import.meta.env.VITE_LAN_URL || '(not configured)',
    canonicalUrl: import.meta.env.DEV
      ? 'will use dev origin or LAN URL'
      : 'must use VITE_APP_URL',
  };
}
