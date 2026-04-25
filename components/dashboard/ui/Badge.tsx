// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Status and type badges
// ============================================================

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "purple"

interface BadgeProps {
  children: string
  variant?: BadgeVariant
  size?: "sm" | "md"
  dot?: boolean
}

// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Premium polish -- default variant now has matching border for
// consistent silhouette across all badge variants (was the only one without border)
const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground border-border",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  error: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
}
// --- END AI-MODIFIED ---

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-muted-foreground",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-blue-400",
  purple: "bg-purple-400",
}

export default function Badge({ children, variant = "default", size = "sm", dot = false }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full border
      ${variantClasses[variant]}
      ${size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}
