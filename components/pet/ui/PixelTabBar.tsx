// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Unified pixel-styled tab bar for all pet pages --
//          replaces ad-hoc inline tab implementations with
//          consistent sizing and scrollable single-row layout
// ============================================================
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

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

export default function PixelTabBar({ tabs, active, onChange, className }: PixelTabBarProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "font-pixel text-[13px] px-3 py-1.5 border-2 transition-all whitespace-nowrap min-w-[100px] text-center flex-shrink-0 inline-flex items-center justify-center gap-1.5",
            active === tab.key
              ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff] shadow-[2px_2px_0_#060810]"
              : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count != null && (
            <span className="opacity-60">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}
