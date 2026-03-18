// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Main dashboard sidebar navigation with sections, user avatar, mobile sheet
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useDashboard } from "@/hooks/useDashboard"
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Added PawPrint icon for LionGotchi pet nav button
import {
  BarChart3, Server, CheckSquare, History, Target, Bell, Palette,
  Gem, User, Menu, Trophy, ChevronRight, BookOpen, Radio, Crown, PawPrint,
} from "lucide-react"
// --- END AI-MODIFIED ---

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: removed Servers from sections -- it now has its own prominent slot
const sections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { href: "/dashboard", label: "Overview", icon: <BarChart3 size={16} /> },
    ],
  },
// --- END AI-MODIFIED ---
  {
    title: "Activity",
    items: [
      { href: "/dashboard/tasks", label: "Tasks", icon: <CheckSquare size={16} /> },
      { href: "/dashboard/history", label: "History", icon: <History size={16} /> },
      { href: "/dashboard/goals", label: "Goals", icon: <Target size={16} /> },
      { href: "/dashboard/reminders", label: "Reminders", icon: <Bell size={16} /> },
    ],
  },
  {
    title: "Collection",
    items: [
      { href: "/dashboard/inventory", label: "Skins", icon: <Palette size={16} /> },
      { href: "/dashboard/gems", label: "LionGems", icon: <Gem size={16} /> },
      { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <Trophy size={16} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: <User size={16} /> },
    ],
  },
  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: Add Tutorials link to dashboard sidebar
  {
    title: "Help",
    items: [
      { href: "/tutorials", label: "Tutorials", icon: <BookOpen size={16} /> },
    ],
  },
  // --- END AI-MODIFIED ---
]

function NavItemLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <span
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-primary/15 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="flex-shrink-0 opacity-70">{item.icon}</span>
        {item.label}
      </span>
    </Link>
  )
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()
  const { data: session } = useSession()
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: add gem balance display in sidebar
  const { data: gemsData } = useDashboard<{ gemBalance: number }>(
    session ? "/api/dashboard/gems" : null
  )
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: live session indicator in sidebar nav with duration and timer info
  const { data: liveData } = useDashboard<{
    active: boolean
    session?: { startTime: string; guildName: string }
    pomodoro?: { stage: "focus" | "break"; remainingSeconds: number; stageDurationSeconds: number } | null
  }>(
    session ? "/api/dashboard/live-session" : null,
    { refreshInterval: 30000 }
  )
  const hasLiveSession = liveData?.active === true
  const isSessionActive = router.pathname.startsWith("/dashboard/session")

  const [navElapsed, setNavElapsed] = useState("")
  const [navRemaining, setNavRemaining] = useState<number | null>(null)
  const [navStage, setNavStage] = useState<"focus" | "break" | null>(null)

  useEffect(() => {
    if (!liveData?.session?.startTime) { setNavElapsed(""); return }
    const update = () => {
      const secs = Math.floor((Date.now() - new Date(liveData.session!.startTime).getTime()) / 1000)
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      setNavElapsed(h > 0 ? `${h}h ${m}m` : `${m}m`)
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [liveData?.session?.startTime])

  useEffect(() => {
    if (!liveData?.pomodoro) { setNavRemaining(null); setNavStage(null); return }
    setNavRemaining(liveData.pomodoro.remainingSeconds)
    setNavStage(liveData.pomodoro.stage)
  }, [liveData?.pomodoro])

  useEffect(() => {
    if (navRemaining !== null && navRemaining > 0) {
      const interval = setInterval(() => setNavRemaining((r) => r !== null ? Math.max(0, r - 1) : null), 1000)
      return () => clearInterval(interval)
    }
  }, [navRemaining !== null && navRemaining > 0])
  // --- END AI-MODIFIED ---

  return (
    <div className="flex flex-col h-full">
      {session?.user && (
        <div className="px-4 py-4 flex items-center gap-3">
          {session.user.image && (
            <img
              src={session.user.image}
              alt=""
              className="w-8 h-8 rounded-full ring-2 ring-border"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
      )}
      {/* --- AI-MODIFIED (2026-03-13) --- */}
      {/* Purpose: gem balance display linking to gems page */}
      {gemsData && (
        <Link href="/dashboard/gems">
          <a className="flex items-center gap-2 px-4 py-2 mx-3 mb-1 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/15 transition-colors text-sm">
            <Gem size={14} />
            <span className="font-medium">{gemsData.gemBalance.toLocaleString()}</span>
            <span className="text-amber-400/60 text-xs">gems</span>
          </a>
        </Link>
      )}
      {/* --- END AI-MODIFIED --- */}
      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: live session nav item with duration, timer info, and pulsing indicator */}
      {hasLiveSession && (
        <div className="px-3 pb-1">
          <Link href="/dashboard/session" onClick={onNavigate}>
            <span
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer",
                isSessionActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/25"
                  : "bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25"
              )}
            >
              <span className="relative flex-shrink-0">
                <Radio size={16} />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-medium leading-tight">Live Session</span>
                <span className={cn(
                  "block text-[10px] leading-tight font-normal tabular-nums",
                  isSessionActive ? "text-emerald-200/70" : "text-emerald-400/60"
                )}>
                  {navElapsed && <>{navElapsed}</>}
                  {navStage && navRemaining !== null && (
                    <>
                      {navElapsed && " · "}
                      {navStage === "focus" ? "Focus" : "Break"}{" "}
                      {Math.floor(navRemaining / 60)}:{String(navRemaining % 60).padStart(2, "0")}
                    </>
                  )}
                </span>
              </div>
            </span>
          </Link>
        </div>
      )}
      {/* --- END AI-MODIFIED --- */}
      {/* --- AI-MODIFIED (2026-03-14) --- */}
      {/* Purpose: prominent Servers button styled as a real button with depth and hover feedback */}
      <div className="px-3 py-2">
        <Link href="/dashboard/servers" onClick={onNavigate}>
          <span
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer",
              "shadow-sm hover:shadow-md",
              router.pathname.startsWith("/dashboard/servers")
                ? "bg-indigo-600 text-white shadow-indigo-500/25 hover:bg-indigo-500"
                : "bg-indigo-600/80 text-indigo-50 hover:bg-indigo-600 shadow-indigo-500/15"
            )}
            aria-current={router.pathname.startsWith("/dashboard/servers") ? "page" : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <Server size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-semibold leading-tight">My Servers</span>
              <span className="block text-[10px] text-indigo-200/70 font-normal leading-tight">
                Manage &amp; configure
              </span>
            </div>
            <ChevronRight size={16} className="flex-shrink-0 opacity-60" />
          </span>
        </Link>
      </div>
      {/* --- END AI-MODIFIED --- */}
      {/* --- AI-MODIFIED (2026-03-17) --- */}
      {/* Purpose: LionGotchi pet button so users can find the pet section from the dashboard */}
      <div className="px-3 pb-2">
        <Link href="/pet" onClick={onNavigate}>
          <span
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer",
              "shadow-sm hover:shadow-md",
              router.pathname.startsWith("/pet")
                ? "bg-amber-500 text-white shadow-amber-500/25 hover:bg-amber-400"
                : "bg-amber-500/80 text-amber-50 hover:bg-amber-500 shadow-amber-500/15"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <PawPrint size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-semibold leading-tight">LionGotchi</span>
              <span className="block text-[10px] text-amber-200/70 font-normal leading-tight">
                Your pet
              </span>
            </div>
            <ChevronRight size={16} className="flex-shrink-0 opacity-60" />
          </span>
        </Link>
      </div>
      {/* --- END AI-MODIFIED --- */}
      <Separator />
      <ScrollArea className="flex-1 px-3 py-3">
        {/* --- AI-MODIFIED (2026-03-17) --- */}
        {/* Purpose: Highlighted LionHeart supporter link at top of nav for visibility */}
        <div className="mb-3">
          <Link href="/dashboard/supporter" onClick={onNavigate}>
            <span
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                "bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10",
                "border border-rose-500/20",
                router.pathname.startsWith("/dashboard/supporter")
                  ? "text-rose-300 border-rose-400/40 from-rose-500/20 via-pink-500/20 to-purple-500/20"
                  : "text-rose-400/80 hover:text-rose-300 hover:border-rose-400/30 hover:from-rose-500/15 hover:via-pink-500/15 hover:to-purple-500/15"
              )}
              aria-current={router.pathname.startsWith("/dashboard/supporter") ? "page" : undefined}
            >
              <Crown size={16} className="flex-shrink-0" />
              <span className="font-medium">LionHeart</span>
              <span className="ml-auto text-[10px] opacity-60">Supporter</span>
            </span>
          </Link>
        </div>
        {/* --- END AI-MODIFIED --- */}
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.href === "/dashboard"
                  ? router.pathname === "/dashboard"
                  : router.pathname.startsWith(item.href)
                return (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    onClick={onNavigate}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

export default function DashboardNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-6 self-start border-r border-border/40 h-[calc(100vh-3rem)]" aria-label="Dashboard navigation">
        <NavContent />
      </nav>

      {/* Mobile trigger — positioned below the sticky Header (h-14 = 56px) */}
      <div className="fixed top-16 left-4 z-40 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card shadow-lg">
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
