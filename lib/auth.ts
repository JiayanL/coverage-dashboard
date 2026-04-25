export const AUTH_COOKIE_NAME = "coverage-dashboard-auth"
// Pre-computed SHA-256 of "coverage-dashboard-auth-secret", sliced to 32 chars.
// Using a static value avoids importing Node's crypto module, which is
// unavailable in the Vercel Edge Runtime where the proxy executes.
export const AUTH_TOKEN = "9b6acdb0d149f3e0a3cf9c73a4b9b7d2"
