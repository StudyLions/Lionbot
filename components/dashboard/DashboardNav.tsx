// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Main dashboard sidebar navigation with sections, user avatar, mobile sheet
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useDashboard } from "@/hooks/useDashboard"
import {
  BarChart3, Server, CheckSquare, History, Target, Bell, Palette,
  Gem, User, Menu, Trophy,
} from "lucide-react"

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
      {/* --- AI-MODIFIED (2026-03-14) --- */}
      {/* Purpose: prominent Servers button with accent styling, separate from regular nav */}
      <div className="px-3 py-2">
        <Link href="/dashboard/servers" onClick={onNavigate}>
          <span
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all border",
              router.pathname.startsWith("/dashboard/servers")
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-semibold"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15 hover:border-indigo-500/30"
            )}
            aria-current={router.pathname.startsWith("/dashboard/servers") ? "page" : undefined}
          >
            <Server size={20} className="flex-shrink-0" />
            <div className="min-w-0">
              <span className="block leading-tight">Servers</span>
              <span className="block text-[10px] text-indigo-400/60 font-normal leading-tight">
                Server Management
              </span>
            </div>
          </span>
        </Link>
      </div>
      {/* --- END AI-MODIFIED --- */}
      <Separator />
      <ScrollArea className="flex-1 px-3 py-3">
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

      {/* Mobile trigger */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
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
