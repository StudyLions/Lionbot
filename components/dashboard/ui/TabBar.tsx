// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Unified tab bar for all dashboard pages -- replaces
//          8 different ad-hoc tab implementations with one
//          consistent component supporting underline and pill styles
// ============================================================
import { cn } from "@/lib/utils"
import { ReactNode, useEffect, useRef, useState } from "react"

interface Tab {
  key: string
  label: string
  count?: number
  icon?: ReactNode
}

interface TabBarProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
  variant?: "underline" | "pills"
  className?: string
}

// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Premium polish -- proper tablist semantics (role + aria-selected),
// animated underline indicator that smoothly slides between tabs (was re-mounted),
// focus-visible rings, arrow-key navigation between tabs (Left/Right/Home/End)
export default function TabBar({ tabs, active, onChange, variant = "underline", className }: TabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  useEffect(() => {
    if (variant !== "underline" || !containerRef.current) return
    const activeBtn = containerRef.current.querySelector<HTMLElement>(`[data-tab-key="${active}"]`)
    if (activeBtn) {
      setIndicator({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth })
    }
  }, [active, tabs, variant])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const idx = tabs.findIndex((t) => t.key === active)
    if (idx < 0) return
    let nextIdx: number | null = null
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabs.length) % tabs.length
    else if (e.key === "Home") nextIdx = 0
    else if (e.key === "End") nextIdx = tabs.length - 1
    if (nextIdx != null) {
      e.preventDefault()
      onChange(tabs[nextIdx].key)
      const nextBtn = containerRef.current?.querySelector<HTMLElement>(`[data-tab-key="${tabs[nextIdx].key}"]`)
      nextBtn?.focus()
    }
  }

  if (variant === "pills") {
    return (
      <div
        role="tablist"
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className={cn("inline-flex items-center bg-muted/40 rounded-lg p-1 overflow-x-auto", className)}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              data-tab-key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count != null && (
                <span className={cn(
                  "ml-1 text-xs tabular-nums",
                  isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="tablist"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={cn("relative flex border-b border-border overflow-x-auto", className)}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            data-tab-key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors duration-150 relative",
              "focus-visible:outline-none focus-visible:bg-accent/30 rounded-t-md",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className={cn(
                "ml-1 text-xs tabular-nums",
                isActive ? "text-muted-foreground" : "text-muted-foreground/60"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 h-0.5 bg-primary rounded-full motion-safe:transition-all motion-safe:duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  )
}
// --- END AI-MODIFIED ---
