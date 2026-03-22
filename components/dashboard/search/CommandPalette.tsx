// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Global command palette (Ctrl+K / Cmd+K) for searching
//          across all dashboard pages, settings, and features.
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search, BarChart3, Users, Shield, Coins, Settings, Trophy,
  ShoppingBag, ListChecks, Calendar, Timer, Video, Wand2,
  Paintbrush, Volume2, Pin, DoorOpen, PawPrint,
  BookOpen, CheckSquare, Lock, Globe, MessageSquare,
  Dumbbell, Hash, UserCog, EyeOff, Bot, AlertTriangle,
  Sparkles, ArrowRight, CornerDownLeft,
} from "lucide-react"
import type { SearchItem } from "./searchRegistry"
import { getSearchItems } from "./searchRegistry"
import { useSearch, flatResults, hasResults } from "./useSearch"

const ICON_MAP: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 size={16} />,
  Users: <Users size={16} />,
  Shield: <Shield size={16} />,
  Coins: <Coins size={16} />,
  Settings: <Settings size={16} />,
  Trophy: <Trophy size={16} />,
  ShoppingBag: <ShoppingBag size={16} />,
  ListChecks: <ListChecks size={16} />,
  Calendar: <Calendar size={16} />,
  Timer: <Timer size={16} />,
  Video: <Video size={16} />,
  Wand2: <Wand2 size={16} />,
  Paintbrush: <Paintbrush size={16} />,
  Volume2: <Volume2 size={16} />,
  Pin: <Pin size={16} />,
  DoorOpen: <DoorOpen size={16} />,
  PawPrint: <PawPrint size={16} />,
  BookOpen: <BookOpen size={16} />,
  CheckSquare: <CheckSquare size={16} />,
  Lock: <Lock size={16} />,
  Globe: <Globe size={16} />,
  MessageSquare: <MessageSquare size={16} />,
  Dumbbell: <Dumbbell size={16} />,
  Hash: <Hash size={16} />,
  UserCog: <UserCog size={16} />,
  EyeOff: <EyeOff size={16} />,
  Bot: <Bot size={16} />,
  AlertTriangle: <AlertTriangle size={16} />,
}

interface CommandPaletteProps {
  serverId: string
  isAdmin: boolean
  isMod: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ResultItem({
  item,
  isActive,
  onSelect,
  onHover,
}: {
  item: SearchItem
  isActive: boolean
  onSelect: () => void
  onHover: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
        isActive
          ? "bg-primary/15 text-foreground"
          : "text-muted-foreground hover:bg-accent/40"
      )}
    >
      <span className={cn(
        "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
        item.premium ? "bg-amber-500/10 text-amber-400" : "bg-accent/60 text-muted-foreground"
      )}>
        {ICON_MAP[item.iconName] ?? <Settings size={16} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{item.title}</span>
          {item.premium && <Sparkles size={12} className="text-amber-400/60 flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground/70 truncate">{item.description}</p>
      </div>
      <span className="flex-shrink-0 text-[10px] text-muted-foreground/50 px-1.5 py-0.5 rounded bg-accent/40">
        {item.page}
      </span>
      {isActive && (
        <CornerDownLeft size={12} className="flex-shrink-0 text-muted-foreground/50" />
      )}
    </button>
  )
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {label}
      </p>
      {children}
    </div>
  )
}

export default function CommandPalette({ serverId, isAdmin, isMod, open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = getSearchItems(isAdmin, isMod)
  const grouped = useSearch(query, items)
  const flat = flatResults(grouped)
  const showResults = hasResults(grouped)

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setActiveIndex(0)
    }
  }, [open])

  const navigateTo = useCallback((item: SearchItem) => {
    const basePath = `/dashboard/servers/${serverId}`
    let path = basePath + item.route
    if (item.section) {
      path += `?section=${item.section}`
    }
    onOpenChange(false)
    router.push(path)
  }, [serverId, router, onOpenChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && flat[activeIndex]) {
      e.preventDefault()
      navigateTo(flat[activeIndex])
    }
  }, [flat, activeIndex, navigateTo])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl p-0 gap-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/60"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Search dashboard</DialogTitle>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
          <Search size={18} className="text-muted-foreground/60 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings, pages..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/50 bg-accent/40 rounded border border-border/40">
            ESC
          </kbd>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2">
            {query.trim() === "" ? (
              <div className="py-8 text-center">
                <Search size={32} className="mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/50">
                  Type to search pages and settings
                </p>
                <p className="text-xs text-muted-foreground/30 mt-1">
                  Try &quot;rewards&quot;, &quot;timezone&quot;, or &quot;pomodoro&quot;
                </p>
              </div>
            ) : !showResults ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground/50">
                  No results for &quot;{query}&quot;
                </p>
                <p className="text-xs text-muted-foreground/30 mt-1">
                  Try different keywords
                </p>
              </div>
            ) : (
              <>
                {grouped.pages.length > 0 && (
                  <ResultGroup label="Pages">
                    {grouped.pages.map((r) => {
                      const idx = flat.indexOf(r)
                      return (
                        <ResultItem
                          key={r.id}
                          item={r}
                          isActive={idx === activeIndex}
                          onSelect={() => navigateTo(r)}
                          onHover={() => setActiveIndex(idx)}
                        />
                      )
                    })}
                  </ResultGroup>
                )}
                {grouped.settings.length > 0 && (
                  <ResultGroup label="Settings">
                    {grouped.settings.map((r) => {
                      const idx = flat.indexOf(r)
                      return (
                        <ResultItem
                          key={r.id}
                          item={r}
                          isActive={idx === activeIndex}
                          onSelect={() => navigateTo(r)}
                          onHover={() => setActiveIndex(idx)}
                        />
                      )
                    })}
                  </ResultGroup>
                )}
                {grouped.features.length > 0 && (
                  <ResultGroup label="Feature Settings">
                    {grouped.features.map((r) => {
                      const idx = flat.indexOf(r)
                      return (
                        <ResultItem
                          key={r.id}
                          item={r}
                          isActive={idx === activeIndex}
                          onSelect={() => navigateTo(r)}
                          onHover={() => setActiveIndex(idx)}
                        />
                      )
                    })}
                  </ResultGroup>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {showResults && (
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground/40">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-accent/40 border border-border/40 font-mono">&uarr;&darr;</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-accent/40 border border-border/40 font-mono">&crarr;</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-accent/40 border border-border/40 font-mono">esc</kbd>
              close
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
