/**
 * Set E2E base URLs before any other module reads them.
 * Uses 127.0.0.1 to avoid IPv6 (::1) connection refused when the app binds to 127.0.0.1.
 */
if (!process.env.E2E_UI_BASE_URL) {
  process.env.E2E_UI_BASE_URL = "http://127.0.0.1:3000";
}
if (!process.env.E2E_API_BASE_URL) {
  process.env.E2E_API_BASE_URL = "http://127.0.0.1:9000";
}
