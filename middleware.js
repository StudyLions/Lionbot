// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Moved from pages/_middleware.js to root middleware.js
//          for Next.js 12.2+ compatibility
// ============================================================
import {getToken} from "next-auth/jwt"
import {NextResponse} from "next/server"

/** @param {import("next/server").NextRequest} req */
export async function middleware(req) {
  if (req.nextUrl.pathname === "/middleware-protected") {
    const session = await getToken({
      req,
      secret: process.env.SECRET,
      secureCookie:
        process.env.NEXTAUTH_URL?.startsWith("https://") ??
        !!process.env.VERCEL_URL,
    })
    if (!session) return NextResponse.redirect(new URL("/api/auth/signin", req.url))
  }
}
