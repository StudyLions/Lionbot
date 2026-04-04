// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Consistent layout shell for all dashboard pages --
//          enforces uniform max-width so pages don't jump when navigating
// ============================================================
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DashboardShellProps {
  nav: ReactNode
  children: ReactNode
  wide?: boolean
  className?: string
}

// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Added pl-12 on mobile to prevent fixed hamburger menu button from overlapping content
export default function DashboardShell({ nav, children, wide, className }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background pt-6 pb-20 px-4">
      <div className={cn("mx-auto flex gap-8", wide ? "max-w-7xl" : "max-w-6xl")}>
        {nav}
        <main className={cn("flex-1 min-w-0 max-w-4xl space-y-6 pl-12 lg:pl-0", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
// --- END AI-MODIFIED ---
