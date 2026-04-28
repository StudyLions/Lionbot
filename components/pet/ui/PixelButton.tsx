// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled button with press animation
// ============================================================
import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

// --- AI-MODIFIED (2026-04-28) ---
// Purpose: Lock the action color palette to a documented 5-ink rule, plus
// `ghost` for subtle inline links. Adding `cosmetic` (purple) so cosmetic
// overlay actions get their own ink and stop sharing purple with the
// (conceptually different) "Try On" preview action.
//
// THE 5-INK RULE (use these consistently across the /pet section):
//   gold     -> primary CTAs ("Equip Best", "Adopt", "Buy", "Save")
//   info     -> navigation/secondary links ("Marketplace", "Customize", "View")
//   primary  -> positive state confirmation ("Equipped", "Confirm", "Success")
//   danger   -> destructive actions ("Unequip", "Sell", "Delete", "Reset")
//   cosmetic -> cosmetic overlay actions ONLY ("Set as Cosmetic", "Show cosmetics")
//   ghost    -> subtle inline / secondary actions, no ink commitment
//
// Anything outside this palette in the /pet section should be flagged in
// review. Off-palette buttons add visual noise and break the read.
const variants = {
  primary:  "bg-[#2a7a3a] border-[#40d870] text-[#d0ffd8] hover:bg-[#338844]",
  danger:   "bg-[#7a2a2a] border-[#e04040] text-[#ffd0d0] hover:bg-[#883333]",
  info:     "bg-[#2a3a7a] border-[#4080f0] text-[#d0e0ff] hover:bg-[#334488]",
  gold:     "bg-[#6a5a1a] border-[#f0c040] text-[#fff4d0] hover:bg-[#786622]",
  cosmetic: "bg-[#3a1a5c] border-[#d060f0] text-[#f0d0ff] hover:bg-[#4a226e]",
  ghost:    "bg-transparent border-[#3a4a6c] text-[#8899aa] hover:bg-[#1a2438] hover:text-[#c0d0e0]",
} as const
// --- END AI-MODIFIED ---

type PixelButtonVariant = keyof typeof variants

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Increased button sizes for better readability
const sizes = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
}
// --- END AI-MODIFIED ---

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, type, ...props }, ref) => (
    <button
      ref={ref}
      // --- AI-MODIFIED (2026-04-25) ---
      // Purpose: Premium polish -- explicit type=button to prevent accidental form
      // submits, aria-busy when loading, motion-safe on translate animations,
      // visible "loading" text replaced with hiding children + spinner overlay
      // for cleaner feedback
      type={type ?? "button"}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        "font-pixel inline-flex items-center justify-center gap-1.5 relative",
        "border-2 transition-all select-none",
        "shadow-[2px_2px_0_#060810]",
        "motion-safe:hover:shadow-[1px_1px_0_#060810] motion-safe:hover:translate-x-px motion-safe:hover:translate-y-px",
        "motion-safe:active:shadow-none motion-safe:active:translate-x-0.5 motion-safe:active:translate-y-0.5",
        "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pet-blue,#4080f0)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0e1a]",
        // --- END AI-MODIFIED ---
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
)

PixelButton.displayName = "PixelButton"
export default PixelButton
