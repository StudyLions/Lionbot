// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Moved from pages/_middleware.js to root middleware.js
//          for Next.js 12.2+ compatibility
// ============================================================
import {getToken} from "next-auth/jwt"
import {NextResponse} from "next/server"

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
    const session = await getToken({
      req,
      secret: process.env.SECRET,
      secureCookie:
        process.env.NEXTAUTH_URL?.startsWith("https://") ??
        !!process.env.VERCEL_URL,
    })
    if (!session) return NextResponse.redirect(new URL("/api/auth/signin", req.url))
  }

  const needsAuth = pathname.startsWith("/api/dashboard/") ||
    (pathname.startsWith("/api/pet/") && !isPublicPetRoute(pathname))

  if (needsAuth) {
    const token = await getToken({
      req,
      secret: process.env.SECRET,
      secureCookie:
        process.env.NEXTAUTH_URL?.startsWith("https://") ??
        !!process.env.VERCEL_URL,
    })
    if (!token?.discordId) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated. Please sign in with Discord." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }
  }

  return NextResponse.next()
}
// --- END AI-MODIFIED ---
