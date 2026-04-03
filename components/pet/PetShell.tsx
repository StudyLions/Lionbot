// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Consistent layout shell for all pet/LionGotchi pages --
//          enforces uniform max-width so pages don't jump when navigating
// ============================================================
import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import PetNav from "@/components/pet/PetNav"

interface PetShellProps {
  children: ReactNode
  hasPet?: boolean
  wide?: boolean
  className?: string
}

// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Added pl-12 on mobile to prevent fixed hamburger menu button from overlapping content
export default function PetShell({ children, hasPet = true, wide, className }: PetShellProps) {
  return (
    <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
      <div className={cn("mx-auto flex gap-6", wide ? "max-w-7xl" : "max-w-6xl")}>
        <PetNav hasPet={hasPet} />
        <main className={cn("flex-1 min-w-0 max-w-4xl space-y-4 pl-12 lg:pl-0", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
// --- END AI-MODIFIED ---
