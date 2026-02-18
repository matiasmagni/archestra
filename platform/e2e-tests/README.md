# E2E tests

Playwright tests for the Archestra platform.

## How to run

**Recommended (reliable):**

1. **Start the app** with DB available:
   ```bash
   # From platform root
   pnpm db:migrate   # if needed
   pnpm dev
   ```
2. **In another terminal**, run E2E:
   ```bash
   pnpm test:e2e
   ```
   Playwright will reuse the running server (`reuseExistingServer: true`).

**Alternative:** Run only `pnpm test:e2e`. Playwright will start `pnpm dev` and wait for the frontend. The first test waits for the backend (up to 2 min). If PostgreSQL is not running or the backend fails to start, sign-in will return 500 and the run will fail with a clear message.

## Prerequisites

- **PostgreSQL** running; DB migrated (`pnpm db:migrate`) and seeded (backend seeds default admin on first start).
- Default admin: `admin@example.com` (see `e2e-tests/consts.ts` and `@shared` defaults).

## Commands

- `pnpm test:e2e` – run all E2E tests
- `pnpm test:e2e:ui` – run with Playwright UI
- `pnpm test:e2e:report` – open last HTML report
