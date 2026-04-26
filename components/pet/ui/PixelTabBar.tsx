// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Unified pixel-styled tab bar for all pet pages --
//          replaces ad-hoc inline tab implementations with
//          consistent sizing and scrollable single-row layout
// ============================================================
import { cn } from "@/lib/utils"
import { ReactNode, useEffect, useRef } from "react"

interface PixelTab {
  key: string
  label: string
  count?: number
  icon?: ReactNode
}

interface PixelTabBarProps {
  tabs: PixelTab[]
  active: string
  onChange: (key: string) => void
  className?: string
}

// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Premium polish -- proper tablist semantics for SR/keyboard, smooth
// scroll active tab into view when changed (handy on mobile with overflow), arrow-key
// navigation between tabs, focus-visible ring on inactive tabs
export default function PixelTabBar({ tabs, active, onChange, className }: PixelTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeBtn = containerRef.current?.querySelector<HTMLElement>(`[data-tab-key="${active}"]`)
    activeBtn?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" })
  }, [active])

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

  return (
    <div
      ref={containerRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn("flex gap-2 overflow-x-auto scrollbar-hide", className)}
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
              "font-pixel text-[13px] px-3 py-1.5 border-2 transition-all whitespace-nowrap min-w-[100px] text-center flex-shrink-0 inline-flex items-center justify-center gap-1.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pet-blue,#4080f0)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0e1a]",
              isActive
                ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff] shadow-[2px_2px_0_#060810]"
                : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa] hover:border-[#2a3a4c]"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className="opacity-60">({tab.count})</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
// --- END AI-MODIFIED ---
