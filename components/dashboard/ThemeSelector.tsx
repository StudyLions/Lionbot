// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Theme selector popover for switching between color themes
// ============================================================
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Palette, Check } from "lucide-react"

interface ThemeOption {
  id: string
  label: string
  colors: { bg: string; card: string; primary: string }
}

const themes: ThemeOption[] = [
  {
    id: "midnight",
    label: "Midnight",
    colors: { bg: "hsl(222, 47%, 11%)", card: "hsl(224, 40%, 14%)", primary: "hsl(217, 91%, 60%)" },
  },
  {
    id: "light",
    label: "Light",
    colors: { bg: "hsl(210, 20%, 98%)", card: "hsl(0, 0%, 100%)", primary: "hsl(217, 91%, 50%)" },
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: { bg: "hsl(200, 50%, 8%)", card: "hsl(200, 45%, 12%)", primary: "hsl(187, 80%, 50%)" },
  },
  {
    id: "forest",
    label: "Forest",
    colors: { bg: "hsl(150, 30%, 8%)", card: "hsl(150, 25%, 12%)", primary: "hsl(142, 70%, 50%)" },
  },
  {
    id: "sunset",
    label: "Sunset",
    colors: { bg: "hsl(20, 30%, 8%)", card: "hsl(20, 25%, 12%)", primary: "hsl(28, 90%, 55%)" },
  },
]

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground">
        <span className="flex-shrink-0 opacity-70"><Palette size={16} /></span>
        <span>Theme</span>
      </button>
    )
  }

  const current = themes.find((t) => t.id === theme) || themes[0]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <span className="flex-shrink-0 opacity-70"><Palette size={16} /></span>
          <span className="flex-1 text-left">Theme</span>
          <span
            className="w-4 h-4 rounded-full border border-border flex-shrink-0"
            style={{ background: current.colors.primary }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={8} className="w-52 p-2">
        <p className="text-xs font-semibold text-muted-foreground px-2 pb-2">Choose theme</p>
        <div className="space-y-1">
          {themes.map((t) => {
            const isActive = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <div className="flex gap-0.5 flex-shrink-0">
                  <span
                    className="w-4 h-4 rounded-l-md border border-border"
                    style={{ background: t.colors.bg }}
                  />
                  <span
                    className="w-4 h-4 border-y border-border"
                    style={{ background: t.colors.card }}
                  />
                  <span
                    className="w-4 h-4 rounded-r-md border border-border"
                    style={{ background: t.colors.primary }}
                  />
                </div>
                <span className="flex-1 text-left">{t.label}</span>
                {isActive && <Check size={14} className="text-primary flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
