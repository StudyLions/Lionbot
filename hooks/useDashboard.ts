// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: SWR-based data fetching for dashboard pages
// ============================================================
// --- AI-MODIFIED (2026-05-01) ---
// Purpose: Detect 401 SESSION_EXPIRED responses and transparently
// redirect the user to Discord sign-in instead of surfacing a
// confusing "Internal Server Error" message. Shared between every
// dashboard SWR call (fetcher) and every dashboard mutation
// (dashboardMutate), so a user whose Discord OAuth token has been
// revoked or has expired always lands on the sign-in flow rather
// than a red error toast.
import { signIn } from "next-auth/react"
// --- END AI-MODIFIED ---
import useSWR, { SWRConfiguration, mutate as globalMutate } from "swr"

// --- AI-MODIFIED (2026-05-01) ---
// Purpose: Module-level guard so multiple concurrent SWR fetches that
// all hit a 401 don't each fire a redirect. We trigger signIn() at
// most once per page load; subsequent 401s just throw the error and
// let the page render its normal error state (which never appears
// because the redirect is in flight).
let sessionExpiredRedirectInFlight = false

function handleSessionExpired() {
  if (typeof window === "undefined") return
  if (sessionExpiredRedirectInFlight) return
  sessionExpiredRedirectInFlight = true
  // Preserve the page the user was on so they come back here after
  // signing in again. We use signIn("discord") to skip the NextAuth
  // landing page and go straight to Discord OAuth.
  const callbackUrl = window.location.href
  signIn("discord", { callbackUrl }).catch(() => {
    sessionExpiredRedirectInFlight = false
  })
}
// --- END AI-MODIFIED ---

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Auto-redirect to Discord sign-in on session expiry.
    if (res.status === 401 && body?.code === "SESSION_EXPIRED") {
      handleSessionExpired()
    }
    // --- END AI-MODIFIED ---
    const err = new Error(body.error || `Request failed (${res.status})`)
    ;(err as any).status = res.status
    ;(err as any).code = body?.code
    throw err
  }
  return res.json()
}

export function useDashboard<T = any>(
  key: string | null,
  config?: SWRConfiguration
) {
  const result = useSWR<T>(key, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
    ...config,
  })
  return {
    ...result,
    isLoading: !result.data && !result.error,
  }
}

// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 -- accept PUT in addition to POST/PATCH/DELETE so
// the store config update endpoint (PUT /api/pet/marketplace/store/me) can
// reuse the same helper (and same error handling) as every other dashboard
// mutation. PUT is the right verb for full-resource replace, which is what
// the store config endpoint actually does.
export async function dashboardMutate(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any
) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Same SESSION_EXPIRED handling as the SWR fetcher so a
    // mutation that hits a 401 also kicks the user back through Discord
    // sign-in instead of showing a red toast they can't act on.
    if (res.status === 401 && body?.code === "SESSION_EXPIRED") {
      handleSessionExpired()
    }
    // --- END AI-MODIFIED ---
    const err = new Error(body.error || "Request failed")
    ;(err as any).status = res.status
    ;(err as any).code = body?.code
    ;(err as any).body = body
    throw err
  }
  const text = await res.text()
  return text ? JSON.parse(text) : {}
}
// --- END AI-MODIFIED ---

export function invalidate(key: string) {
  globalMutate(key)
}

export function invalidatePrefix(prefix: string) {
  globalMutate(
    (key) => typeof key === "string" && key.startsWith(prefix),
    undefined,
    { revalidate: true }
  )
}
