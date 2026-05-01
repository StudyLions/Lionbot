// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: SWR-based data fetching for dashboard pages
// ============================================================
import useSWR, { SWRConfiguration, mutate as globalMutate } from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || `Request failed (${res.status})`)
    ;(err as any).status = res.status
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
    const err = new Error(body.error || "Request failed")
    ;(err as any).status = res.status
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
