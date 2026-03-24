// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Unified tab bar for all dashboard pages -- replaces
//          8 different ad-hoc tab implementations with one
//          consistent component supporting underline and pill styles
// ============================================================
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

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

export default function TabBar({ tabs, active, onChange, variant = "underline", className }: TabBarProps) {
  if (variant === "pills") {
    return (
      <div className={cn("inline-flex items-center bg-muted/30 rounded-lg p-1 overflow-x-auto", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all",
              active === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className={cn(
                "ml-1 text-xs tabular-nums",
                active === tab.key ? "text-muted-foreground" : "text-muted-foreground/60"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex border-b border-border overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors relative",
            active === tab.key
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count != null && (
            <span className={cn(
              "ml-1 text-xs tabular-nums",
              active === tab.key ? "text-muted-foreground" : "text-muted-foreground/60"
            )}>
              {tab.count}
            </span>
          )}
          {active === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}
