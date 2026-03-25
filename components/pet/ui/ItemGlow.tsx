// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Reusable animated glow + sparkle wrapper for item cards.
//          Renders a pulsing border glow based on rarity and
//          floating sparkle particles based on glow tier (enhancement).
// ============================================================
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { GlowTier } from "@/utils/gameConstants"

interface ItemGlowProps {
  rarity: string
  glowTier?: GlowTier | string
  glowIntensity?: number
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Cap glow spread values to prevent bleeding into neighboring grid cells.
//   Grids use gap-2 (8px) or gap-3 (12px), so max spread must stay within those bounds.
//   Original values reached up to 20px * 1.75 intensity = 35px, overlapping adjacent cards.
const RARITY_GLOW_CONFIG: Record<string, { color: string; minSpread: number; maxSpread: number }> = {
  UNCOMMON: { color: "rgba(64, 128, 240, 0.35)", minSpread: 2, maxSpread: 4 },
  RARE:     { color: "rgba(224, 64, 64, 0.4)",   minSpread: 2, maxSpread: 5 },
  EPIC:     { color: "rgba(240, 192, 64, 0.45)",  minSpread: 2, maxSpread: 5 },
  LEGENDARY:{ color: "rgba(208, 96, 240, 0.5)",   minSpread: 3, maxSpread: 5 },
  MYTHICAL: { color: "rgba(255, 96, 128, 0.55)",  minSpread: 3, maxSpread: 5 },
}

const ENHANCEMENT_GLOW_CONFIG: Record<string, { color: string; speed: number; minSpread: number; maxSpread: number }> = {
  bronze:   { color: "rgba(205, 127, 50, 0.5)",  speed: 3.5, minSpread: 2, maxSpread: 4 },
  silver:   { color: "rgba(192, 210, 240, 0.55)", speed: 3.0, minSpread: 2, maxSpread: 5 },
  gold:     { color: "rgba(255, 215, 0, 0.6)",   speed: 2.5, minSpread: 3, maxSpread: 5 },
  diamond:  { color: "rgba(100, 200, 255, 0.65)", speed: 2.0, minSpread: 3, maxSpread: 5 },
  celestial:{ color: "rgba(200, 100, 255, 0.7)",  speed: 1.8, minSpread: 3, maxSpread: 6 },
}
// --- END AI-MODIFIED ---

const SPARKLE_COUNTS: Record<string, number> = {
  none: 0, bronze: 2, silver: 3, gold: 4, diamond: 6, celestial: 8,
}

export default function ItemGlow({
  rarity,
  glowTier = "none",
  glowIntensity = 0,
  children,
  className,
  disabled = false,
}: ItemGlowProps) {
  const enhConfig = glowTier !== "none" ? ENHANCEMENT_GLOW_CONFIG[glowTier] : null
  const rarConfig = !enhConfig ? RARITY_GLOW_CONFIG[rarity] : null
  const activeConfig = enhConfig || rarConfig
  const sparkleCount = disabled ? 0 : (SPARKLE_COUNTS[glowTier as string] ?? 0)

  const sparkles = useMemo(() => {
    if (sparkleCount <= 0) return []
    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Clamp sparkle positions to 10-90% to stay within element bounds
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      left: `${Math.max(10, Math.min(90, 15 + (i * 70 / sparkleCount) + Math.sin(i * 2.3) * 6))}%`,
      // --- END AI-MODIFIED ---
      delay: `${(i * 0.7) + Math.cos(i * 1.5) * 0.3}s`,
      duration: `${1.6 + Math.sin(i * 1.1) * 0.4}s`,
      size: glowTier === "celestial" ? 4 : glowTier === "diamond" ? 3.5 : 3,
    }))
  }, [sparkleCount, glowTier])

  if (disabled || (!activeConfig && sparkleCount <= 0)) {
    return <div className={className}>{children}</div>
  }

  const glowColor = activeConfig?.color ?? "transparent"
  const speed = enhConfig?.speed ?? 3.5
  const minSpread = activeConfig?.minSpread ?? 3
  const maxSpread = activeConfig?.maxSpread ?? 8
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Reduce intensity scaling to keep glow within grid gaps
  const intensityMult = 1 + glowIntensity * 0.1
  // --- END AI-MODIFIED ---

  const cssVars = {
    "--glow-color": glowColor,
    "--glow-speed": `${speed}s`,
    "--glow-spread-min": `${Math.round(minSpread * intensityMult)}px`,
    "--glow-spread-max": `${Math.round(maxSpread * intensityMult)}px`,
    "--glow-inset-min": `${Math.round(minSpread * 0.5 * intensityMult)}px`,
    "--glow-inset-max": `${Math.round(maxSpread * 0.4 * intensityMult)}px`,
  } as React.CSSProperties

  const sparkleColor = enhConfig?.color ?? rarConfig?.color ?? "rgba(255,255,255,0.7)"

  return (
    <div
      className={cn(
        "relative",
        activeConfig && (glowTier === "celestial" ? "item-glow-celestial" : "item-glow"),
        className,
      )}
      style={cssVars}
    >
      {children}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            left: s.left,
            bottom: "4px",
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            background: sparkleColor,
            animation: `item-sparkle-float ${s.duration} ease-out infinite`,
            animationDelay: s.delay,
            zIndex: 10,
          }}
        />
      ))}
    </div>
  )
}
