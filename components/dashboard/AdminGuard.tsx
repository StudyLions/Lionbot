// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Permission-based wrapper component
// ============================================================
import { useSession, signIn } from "next-auth/react"
import { ReactNode } from "react"

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: removed unused requiredLevel and fallbackMessage props
interface AdminGuardProps {
  children: ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
// --- END AI-MODIFIED ---
  const { status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-4 w-64">
          <div className="h-4 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
          <p className="text-gray-400">Connect your Discord account to access the dashboard.</p>
        </div>
        <button
          onClick={() => signIn("discord")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          Sign in with Discord
        </button>
      </div>
    )
  }

  return <>{children}</>
}
