// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Moved from pages/_middleware.js to root middleware.js
//          for Next.js 12.2+ compatibility
// ============================================================
import {getToken} from "next-auth/jwt"
import {NextResponse} from "next/server"
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: accept the LionBot iOS app's signed-JWT bearer in
//          addition to the NextAuth browser cookie when gating
//          /api/dashboard/* and /api/pet/*. Without this the
//          middleware rewrites every iOS request to
//          /api/auth/unauthorized BEFORE the route handler can
//          run the iOS bridge inside utils/adminAuth.ts.
//          See lib/ios/edgeAuth.ts for the Edge-runtime-safe
//          verifier (uses jose only -- no Node `crypto` import).
import {verifyIosBearerEdge, extractBearerEdge} from "./lib/ios/edgeAuth"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Defense-in-depth JWT check for dashboard/pet API routes.
//          Rejects unauthenticated requests before they reach individual handlers.
//          Public pet endpoints (wiki, marketplace browse, crafting) are whitelisted.

const PUBLIC_PET_PREFIXES = [
  "/api/pet/wiki",
  "/api/pet/marketplace/stats",
  "/api/pet/marketplace/history",
  "/api/pet/crafting",
]

function isPublicPetRoute(pathname) {
  if (pathname === "/api/pet/marketplace" || pathname === "/api/pet/marketplace/") return true
  if (pathname.startsWith("/api/pet/marketplace/") && !pathname.includes("/buy") && !pathname.includes("/list") && !pathname.includes("/cancel") && !pathname.includes("/my-listings") && !pathname.includes("/sell")) return true
  return PUBLIC_PET_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

/** @param {import("next/server").NextRequest} req */
export async function middleware(req) {
  const { pathname } = req.nextUrl

  if (pathname === "/middleware-protected") {
    // --- AI-MODIFIED (2026-04-06) ---
    // Purpose: use versioned cookie name matching [...nextauth].js cookies config
    const session = await getToken({
      req,
      secret: process.env.SECRET,
      cookieName: '__Secure-next-auth.session-token.v2',
    })
    // --- END AI-MODIFIED ---
    if (!session) return NextResponse.redirect(new URL("/api/auth/signin", req.url))
  }

  // --- AI-MODIFIED (2026-04-05) ---
  // Purpose: Whitelist the iCal feed endpoint — it uses its own HMAC token auth
  const isIcalFeed = pathname === "/api/dashboard/scheduled-sessions/ical"
  const needsAuth = (pathname.startsWith("/api/dashboard/") && !isIcalFeed) ||
    (pathname.startsWith("/api/pet/") && !isPublicPetRoute(pathname))
  // --- END AI-MODIFIED ---

  if (needsAuth) {
    // --- AI-MODIFIED (2026-04-06) ---
    // Purpose: use versioned cookie name matching [...nextauth].js cookies config
    const token = await getToken({
      req,
      secret: process.env.SECRET,
      cookieName: '__Secure-next-auth.session-token.v2',
    })
    // --- END AI-MODIFIED ---
    if (!token?.discordId) {
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: fall through to the iOS bearer JWT before
      //          rewriting to /api/auth/unauthorized. Without
      //          this, the LionBot iOS app's bearer is rejected
      //          by middleware before the route handler ever
      //          gets a chance to verify it via the bridge in
      //          utils/adminAuth.ts. We only verify the SIGNATURE
      //          here (Edge runtime can't run AES-GCM decrypt of
      //          the embedded Discord token); the route handler
      //          still does the FULL verify via getAuthContext
      //          before touching the DB, so this is defense-in-
      //          depth, not a relaxation of authorization.
      const bearer = extractBearerEdge(req)
      if (bearer) {
        const ios = await verifyIosBearerEdge(bearer)
        if (ios?.discordId) {
          return NextResponse.next()
        }
      }
      // --- END AI-MODIFIED ---
      // --- AI-REPLACED (2026-03-21) ---
      // Reason: Next.js 12 middleware cannot return response bodies
      // What the new code does better: rewrites to a dedicated 401 API endpoint instead
      // --- Original code (commented out for rollback) ---
      // return new NextResponse(
      //   JSON.stringify({ error: "Not authenticated. Please sign in with Discord." }),
      //   { status: 401, headers: { "Content-Type": "application/json" } }
      // )
      // --- End original code ---
      return NextResponse.rewrite(new URL("/api/auth/unauthorized", req.url))
      // --- END AI-REPLACED ---
    }
  }

  return NextResponse.next()
}
// --- END AI-MODIFIED ---
