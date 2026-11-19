import { JWTPayload } from '@/types/auth';

/**
 * Safely decodes a JWT token without verifying cryptographic signature.
 * (Signature is verified server-side by the API Gateway and backend services)
 */
export function parseJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (err) {
    console.error('Failed to parse JWT:', err);
    return null;
  }
}

/**
 * Checks if a JWT token has expired.
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  // payload.exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 <= Date.now();
}
