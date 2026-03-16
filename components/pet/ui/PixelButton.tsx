// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled button with press animation
// ============================================================
import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

const variants = {
  primary: "bg-[#2a7a3a] border-[#40d870] text-[#d0ffd8] hover:bg-[#338844]",
  danger: "bg-[#7a2a2a] border-[#e04040] text-[#ffd0d0] hover:bg-[#883333]",
  info: "bg-[#2a3a7a] border-[#4080f0] text-[#d0e0ff] hover:bg-[#334488]",
  gold: "bg-[#6a5a1a] border-[#f0c040] text-[#fff4d0] hover:bg-[#786622]",
  ghost: "bg-transparent border-[#3a4a6c] text-[#8899aa] hover:bg-[#1a2438] hover:text-[#c0d0e0]",
} as const

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
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "font-pixel inline-flex items-center justify-center gap-1.5",
        "border-2 transition-all select-none",
        "shadow-[2px_2px_0_#060810]",
        "hover:shadow-[1px_1px_0_#060810] hover:translate-x-px hover:translate-y-px",
        "active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
        "disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent animate-spin" />}
      {children}
    </button>
  )
)

PixelButton.displayName = "PixelButton"
export default PixelButton
