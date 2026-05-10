// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Permission-based wrapper component
// ============================================================
// --- AI-MODIFIED (2026-05-10) ---
// Purpose: Import signIn to handle session.error === "RefreshTokenError"
import { useSession, signIn } from "next-auth/react"
// --- END AI-MODIFIED ---
import { ReactNode } from "react"
import UnauthLanding from "@/components/UnauthLanding"

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Added variant prop to show context-aware landing page for unauthenticated users
interface AdminGuardProps {
  children: ReactNode
  variant?: "dashboard" | "pet"
}

export default function AdminGuard({ children, variant = "dashboard" }: AdminGuardProps) {
// --- END AI-MODIFIED ---
  const { status, data: session } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-4 w-64">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    )
  }

  // --- AI-MODIFIED (2026-05-10) ---
  // Purpose: Detect expired Discord session and prompt re-login instead of
  // trapping the user in a broken state where every API call silently fails.
  if ((session as any)?.error === "RefreshTokenError") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Session expired</h2>
          <p className="text-muted-foreground text-sm">Your Discord session has expired. Sign in again to continue.</p>
        </div>
        <button
          onClick={() => signIn("discord")}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
        >
          Sign in with Discord
        </button>
      </div>
    )
  }
  // --- END AI-MODIFIED ---

  if (status === "unauthenticated") {
    // --- AI-REPLACED (2026-03-17) ---
    // Reason: Minimal sign-in block replaced with rich marketing-style landing page
    // What the new code does better: Shows feature previews, social proof, and context-aware content
    // --- Original code (commented out for rollback) ---
    // return (
    //   <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
    //     <div className="text-center">
    //       <h2 className="text-2xl font-bold text-foreground mb-2">Sign in required</h2>
    //       <p className="text-muted-foreground">Connect your Discord account to access the dashboard.</p>
    //     </div>
    //     <button
    //       onClick={() => signIn("discord")}
    //       className="px-6 py-3 bg-primary hover:bg-primary/90 text-foreground rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
    //     >
    //       Sign in with Discord
    //     </button>
    //   </div>
    // )
    // --- End original code ---
    return <UnauthLanding variant={variant} />
    // --- END AI-REPLACED ---
  }

  return <>{children}</>
}
