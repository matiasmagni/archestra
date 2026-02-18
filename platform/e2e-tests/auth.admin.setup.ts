import { expect, test as setup } from "@playwright/test";
import { SecretsManagerType } from "@shared";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  adminAuthFile,
  UI_BASE_URL,
} from "./consts";
import { loginViaApi } from "./utils";

/** Poll frontend readiness (which checks backend /health) so we don't hit 500 on first login. */
async function waitForAppReady(
  page: {
    request: { get: (url: string) => Promise<{ status: () => number }> };
  },
  timeoutMs: number,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const pollMs = 3000;
  while (Date.now() < deadline) {
    try {
      const res = await page.request.get(`${UI_BASE_URL}/api/e2e-ready`);
      if (res.status() === 200) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
}

// Setup admin authentication - must run first before other users
setup("authenticate as admin", async ({ page }) => {
  // Wait for backend to be up (frontend is already up from webServer)
  await waitForAppReady(page, 120_000);

  // Sign in admin via API; retry so auth has time to settle
  const maxAttempts = 6;
  const delayMs = 5000;
  let signedIn = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    signedIn = await loginViaApi(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    if (signedIn) break;
    if (attempt < maxAttempts) {
      await page.waitForTimeout(delayMs);
    }
  }
  expect(
    signedIn,
    "Admin sign-in failed (sign-in returned 500 = backend not ready or DB missing). Start the app first: run 'pnpm dev' in one terminal (with PostgreSQL up and pnpm db:migrate), then run 'pnpm test:e2e' in another. Ensure default admin is seeded (admin@example.com) and ARCHESTRA_AUTH_* env (if set) match e2e-tests/consts.",
  ).toBe(true);

  // Navigate to trigger cookie storage (domcontentloaded for cold Next.js)
  await page.goto(`${UI_BASE_URL}/chat`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForLoadState("domcontentloaded");

  // Mark onboarding as complete and set restrictive policy via API
  // Setting globalToolPolicy to "restrictive" prevents the permissive policy overlay from blocking UI interactions
  await page.request.patch(`${UI_BASE_URL}/api/organization`, {
    data: { onboardingComplete: true, globalToolPolicy: "restrictive" },
  });

  // Initialize secrets manager to DB mode for all shards
  // This is required because sharded test runs are independent, and most tests rely on DB mode.
  // The credentials-with-vault.ee.spec.ts test will override this to test Vault integration,
  // then switch back to DB mode. Other shards that don't run that test will already be in DB mode.
  await page.request.post(
    `${UI_BASE_URL}/api/secrets/initialize-secrets-manager`,
    {
      data: { type: SecretsManagerType.DB },
    },
  );

  // Reload page to dismiss onboarding dialog (on fresh env it renders before API call)
  await page.reload({ waitUntil: "domcontentloaded" });

  // Verify we're authenticated
  await expect(page.getByRole("link", { name: /Tool Policies/i })).toBeVisible({
    timeout: 30000,
  });

  // Save admin auth state
  await page.context().storageState({ path: adminAuthFile });
});
