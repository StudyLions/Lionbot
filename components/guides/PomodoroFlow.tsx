// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Visual pomodoro cycle diagram for the pomodoro guide.
//          Animated CSS-only flow showing focus -> break -> repeat.
// ============================================================
import React from "react"

export default function PomodoroFlow() {
  return (
    <div className="not-prose my-8">
      <div className="rounded-xl border border-border bg-accent/20 p-6 sm:p-8">
        <h3 className="text-sm font-semibold text-foreground mb-6 text-center uppercase tracking-wider">
          How the Pomodoro Cycle Works
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
          {/* Step 1: Focus */}
          <div className="flex flex-col items-center text-center w-32">
            <div className="w-16 h-16 rounded-full bg-blue-500/15 border-2 border-blue-500/40 flex items-center justify-center mb-2 animate-pulse" style={{ animationDuration: "3s" }}>
              <span className="text-2xl">🎯</span>
            </div>
            <span className="text-sm font-semibold text-blue-400">Focus</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">25 min default</span>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center px-2 text-muted-foreground/40">
            <svg width="40" height="12" viewBox="0 0 40 12" fill="none" className="text-muted-foreground/30">
              <path d="M0 6h36M32 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="sm:hidden text-muted-foreground/30">
            <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
              <path d="M6 0v20M1 16l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Step 2: Status Card */}
          <div className="flex flex-col items-center text-center w-32">
            <div className="w-16 h-16 rounded-full bg-purple-500/15 border-2 border-purple-500/40 flex items-center justify-center mb-2">
              <span className="text-2xl">📋</span>
            </div>
            <span className="text-sm font-semibold text-purple-400">Status Card</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Press "Present"</span>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center px-2 text-muted-foreground/40">
            <svg width="40" height="12" viewBox="0 0 40 12" fill="none" className="text-muted-foreground/30">
              <path d="M0 6h36M32 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="sm:hidden text-muted-foreground/30">
            <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
              <path d="M6 0v20M1 16l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Step 3: Break */}
          <div className="flex flex-col items-center text-center w-32">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mb-2 animate-pulse" style={{ animationDuration: "4s" }}>
              <span className="text-2xl">☕</span>
            </div>
            <span className="text-sm font-semibold text-emerald-400">Break</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">5 min default</span>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center px-2 text-muted-foreground/40">
            <svg width="40" height="12" viewBox="0 0 40 12" fill="none" className="text-muted-foreground/30">
              <path d="M0 6h36M32 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="sm:hidden text-muted-foreground/30">
            <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
              <path d="M6 0v20M1 16l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Step 4: Repeat */}
          <div className="flex flex-col items-center text-center w-32">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center mb-2">
              <span className="text-2xl">🔁</span>
            </div>
            <span className="text-sm font-semibold text-amber-400">Repeat</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Until you stop</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-md mx-auto">
          LionBot manages the entire cycle automatically. Voice alerts announce each stage,
          and the status card updates in real time.
        </p>
      </div>
    </div>
  )
}
