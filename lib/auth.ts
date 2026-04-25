export const AUTH_COOKIE_NAME = "coverage-dashboard-auth"

const COOKIE_SALT = "coverage-dashboard-cookie-v1"

/**
 * Derive the cookie token from the configured password.
 *
 * The cookie value is `sha256(password || salt)` rendered as hex. Anyone who
 * can read this source still cannot forge the cookie without knowing
 * `DASHBOARD_PASSWORD`, which is only stored in environment configuration.
 *
 * We use the Web Crypto API so this works in both the Node.js runtime (route
 * handlers) and the Edge runtime (proxy/middleware).
 */
export async function deriveAuthToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}::${COOKIE_SALT}`)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
