import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/config";

/**
 * Readiness endpoint for E2E: returns 200 only when the backend is reachable.
 * Used by Playwright webServer so tests start after both frontend and backend are up.
 */
export async function GET() {
  const base = getBackendBaseUrl().replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
  } catch {
    // Backend not ready
  }
  return NextResponse.json({ ok: false }, { status: 503 });
}
