// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Theme picker panel for focus timer. Shows mini SVG ring
//          previews with tier badges and lock states. Optimistic
//          theme switching with PATCH save.
// ============================================================
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { X, Lock, Crown } from "lucide-react"
import {
  ALL_THEMES,
  canAccessTheme,
  TIER_LABEL,
  type ThemeTier,
  type TimerTheme,
} from "@/constants/TimerThemes"

interface Props {
  currentTheme: string
  userTier: ThemeTier
  onSelect: (themeId: string) => void
  onClose: () => void
}

function MiniRing({ theme, active }: { theme: TimerTheme; active: boolean }) {
  const size = 48
  const sw = 3
  const r = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={sw}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={theme.focus.stroke}
        strokeWidth={sw}
        fill="none"
        strokeLinecap={theme.ringLinecap}
        strokeDasharray={circ}
        strokeDashoffset={circ * 0.3}
        style={{
          filter: active ? `drop-shadow(0 0 6px ${theme.focus.glowStrong})` : undefined,
        }}
      />
    </svg>
  )
}

function TierBadge({ tier }: { tier: ThemeTier }) {
  if (tier === "FREE") return null
  const colors: Record<string, string> = {
    LIONHEART: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    LIONHEART_PLUS: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    LIONHEART_PLUS_PLUS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  }
  return (
    <span
      className={cn(
        "text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none",
        colors[tier]
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  )
}

export default function TimerThemePicker({
  currentTheme,
  userTier,
  onSelect,
  onClose,
}: Props) {
  const [saving, setSaving] = useState<string | null>(null)

  const handleSelect = useCallback(
    async (themeId: string) => {
      if (!canAccessTheme(themeId, userTier)) return
      if (themeId === currentTheme) return
      setSaving(themeId)
      onSelect(themeId)
      try {
        await fetch("/api/dashboard/focus-preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: themeId }),
        })
      } finally {
        setSaving(null)
      }
    },
    [currentTheme, userTier, onSelect]
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-t-2xl sm:rounded-2xl",
          "w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 space-y-4",
          "animate-[slideUp_0.3s_ease-out]"
        )}
      >
        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-200">Timer Theme</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize your focus experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {ALL_THEMES.map((theme) => {
            const accessible = canAccessTheme(theme.id, userTier)
            const active = currentTheme === theme.id
            const isSaving = saving === theme.id

            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                disabled={!accessible || isSaving}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  active
                    ? "border-white/20 bg-white/[0.06]"
                    : accessible
                    ? "border-gray-800 hover:border-gray-700 hover:bg-white/[0.03]"
                    : "border-gray-800/50 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="relative flex-shrink-0">
                  <MiniRing theme={theme} active={active} />
                  {!accessible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 rounded-full">
                      <Lock size={14} className="text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-semibold truncate",
                        active ? "text-white" : "text-gray-300"
                      )}
                    >
                      {theme.name}
                    </span>
                    {theme.tier !== "FREE" && (
                      <Crown
                        size={10}
                        className={cn(
                          accessible ? "text-amber-400" : "text-gray-600"
                        )}
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">
                    {theme.description}
                  </p>
                  <TierBadge tier={theme.tier} />
                </div>

                {active && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            )
          })}
        </div>

        {userTier === "FREE" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Crown size={14} className="text-amber-400 flex-shrink-0" />
            <p className="text-[11px] text-amber-300/80">
              Unlock premium themes with a{" "}
              <a
                href="/donate"
                className="underline hover:text-amber-200 transition-colors"
              >
                LionHeart subscription
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
