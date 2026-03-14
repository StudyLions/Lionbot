// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Sticky section navigation sidebar for settings page
// ============================================================
import { useEffect, useState, useRef, ReactNode } from "react"

export interface NavSection {
  id: string
  label: string
  icon: ReactNode
  modifiedCount?: number
}

interface SettingsNavProps {
  sections: NavSection[]
  searchQuery: string
  onSearchChange: (q: string) => void
}

export default function SettingsNav({ sections, searchQuery, onSearchChange }: SettingsNavProps) {
  const [activeId, setActiveId] = useState<string>("")
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current?.disconnect()
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    )
    observerRef.current = observer

    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sections])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveId(id)
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block w-48 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search settings..."
            className="w-full bg-background border border-input text-foreground text-xs rounded-md px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <ul className="space-y-0.5">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                  activeId === s.id
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                }`}
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{s.icon}</span>
                <span className="flex-1 truncate">{s.label}</span>
                {(s.modifiedCount ?? 0) > 0 && (
                  <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full px-1">
                    {s.modifiedCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile horizontal pills */}
      <div className="lg:hidden sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 px-4 py-2 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search settings..."
            className="flex-1 bg-card border border-input text-foreground text-xs rounded-md px-3 py-1.5 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors whitespace-nowrap ${
                activeId === s.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground bg-card"
              }`}
            >
              {s.label}
              {(s.modifiedCount ?? 0) > 0 && (
                <span className="min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded-full px-0.5">
                  {s.modifiedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
