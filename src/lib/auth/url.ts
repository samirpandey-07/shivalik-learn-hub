/**
 * Centralized Authentication & Application URL Resolver for Campus Flow
 * Handles localhost development, Netlify deploy previews, and production canonical domain (mycampusflow.live).
 */

export const getURL = (): string => {
  // 1. If running in browser and on localhost / 127.0.0.1, keep exact local port for dev
  if (typeof window !== 'undefined' && window.location.origin) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return window.location.origin;
    }
  }

  // 2. Read configured environment variable if available
  const envUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL;

  // 3. In browser production, default to window.location.origin unless an explicit URL is forced
  let siteUrl = envUrl || (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://mycampusflow.live');

  // Sanitize: ensure protocol and strip trailing slash
  siteUrl = siteUrl.trim();
  siteUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
  siteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

  return siteUrl;
};

/**
 * Returns the exact OAuth callback URL for Supabase redirects
 * e.g. "https://mycampusflow.live/auth/callback" or "http://localhost:8080/auth/callback"
 */
export const getAuthCallbackURL = (): string => {
  return `${getURL()}/auth/callback`;
};

/**
 * Returns the exact password reset URL
 * e.g. "https://mycampusflow.live/reset-password"
 */
export const getResetPasswordURL = (): string => {
  return `${getURL()}/reset-password`;
};
