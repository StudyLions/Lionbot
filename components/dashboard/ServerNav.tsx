// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server navigation sidebar with grouped links and permission awareness
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: add Sparkles icon for supporter perk highlight + Volume2/VolumeX for sound toggle
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: add Pin icon for sticky messages nav link
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: add DoorOpen icon for Private Rooms nav link + Search/X for sidebar search
// --- AI-MODIFIED (2026-03-25) ---
// Purpose: add Bug and MessageSquareWarning icons for Advanced section
import {
  BarChart3, Users, Shield, Coins, Settings, Trophy,
  ShoppingBag, ListChecks, Calendar, Timer, Video,
  Wand2, ArrowLeft, Menu, Server, Paintbrush, Sparkles,
  Volume2, VolumeX, PawPrint, Crown, Pin, DoorOpen,
  Search, X, Clock, Bug, MessageSquareWarning, Type,
  ShieldAlert,
} from "lucide-react"
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
import { useUISound } from "@/lib/SoundContext"
// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Theme selector in sidebar
import ThemeSelector from "@/components/dashboard/ThemeSelector"
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: global search command palette and sidebar search
import CommandPalette from "@/components/dashboard/search/CommandPalette"
import { getSearchItems } from "@/components/dashboard/search/searchRegistry"
import { useSearch, flatResults, hasResults } from "@/components/dashboard/search/useSearch"
// --- END AI-MODIFIED ---

interface ServerNavProps {
  serverId: string
  serverName: string
  isAdmin?: boolean
  isMod?: boolean
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add supporterPerk flag for cosmetic feature highlighting
interface NavLink {
  href: string
  label: string
  icon: React.ReactNode
  supporterPerk?: boolean
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: add premium flag so entire sections can have distinct amber/gold styling
interface NavSection {
  title: string
  links: NavLink[]
  premium?: boolean
}
// --- END AI-MODIFIED ---

function buildSections(isAdmin: boolean, isMod: boolean): NavSection[] {
  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Add Shop link visible to all members in the Overview section
  const sections: NavSection[] = [
    { title: "Overview", links: [
      { href: "", label: "Dashboard", icon: <BarChart3 size={16} /> },
      { href: "/shop", label: "Shop", icon: <ShoppingBag size={16} /> },
    ]},
  ]
  // --- END AI-MODIFIED ---

  if (isMod || isAdmin) {
    sections.push({
      title: "Management",
      links: [
        { href: "/members", label: "Members", icon: <Users size={16} /> },
        { href: "/moderation", label: "Moderation", icon: <Shield size={16} /> },
        { href: "/economy", label: "Economy", icon: <Coins size={16} /> },
        // --- AI-MODIFIED (2026-03-22) ---
        // Purpose: Private Rooms admin panel in Management section
        { href: "/rooms", label: "Private Rooms", icon: <DoorOpen size={16} /> },
        // --- END AI-MODIFIED ---
      ],
    })
  }

  if (isAdmin) {
    sections.push({
      title: "Configuration",
      links: [
        { href: "/settings", label: "Settings", icon: <Settings size={16} /> },
        { href: "/ranks", label: "Ranks", icon: <Trophy size={16} /> },
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: Leaderboard configuration page in Configuration section
        { href: "/leaderboard", label: "Leaderboard", icon: <BarChart3 size={16} /> },
        // --- END AI-MODIFIED ---
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: Shop link moved to Overview section (visible to all members), removed from admin-only Configuration
        // --- Original code (commented out for rollback) ---
        // { href: "/shop", label: "Shop", icon: <ShoppingBag size={16} /> },
        // --- End original code ---
        // --- END AI-MODIFIED ---
        { href: "/rolemenus", label: "Role Menus", icon: <ListChecks size={16} /> },
        { href: "/liongotchi", label: "Pet Settings", icon: <PawPrint size={16} /> },
      ],
    })
    sections.push({
      title: "Features",
      links: [
        { href: "/schedule", label: "Schedule", icon: <Calendar size={16} /> },
        { href: "/pomodoro", label: "Pomodoro", icon: <Timer size={16} /> },
        { href: "/videochannels", label: "Video Channels", icon: <Video size={16} /> },
        { href: "/setup", label: "Setup Wizard", icon: <Wand2 size={16} /> },
      ],
    })
    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Dedicated premium section with amber styling for paid features
    sections.push({
      title: "Premium Features",
      premium: true,
      links: [
        // --- AI-MODIFIED (2026-04-01) ---
        // Purpose: Rename "Branding" to "Visual Branding" and add Text Branding nav link
        { href: "/branding", label: "Visual Branding", icon: <Paintbrush size={16} />, supporterPerk: true },
        { href: "/text-branding", label: "Text Branding", icon: <Type size={16} />, supporterPerk: true },
        // --- END AI-MODIFIED ---
        { href: "/leaderboard-autopost", label: "Leaderboard", icon: <Trophy size={16} />, supporterPerk: true },
        { href: "/ambient-sounds", label: "Ambient Sounds", icon: <Volume2 size={16} />, supporterPerk: true },
        // --- AI-MODIFIED (2026-03-22) ---
        // Purpose: Sticky messages premium feature nav link
        { href: "/sticky-messages", label: "Sticky Messages", icon: <Pin size={16} />, supporterPerk: true },
        // --- END AI-MODIFIED ---
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: Voice Time Editor premium feature nav link
        { href: "/voice-time-editor", label: "Voice Time Editor", icon: <Clock size={16} />, supporterPerk: true },
        // --- END AI-MODIFIED ---
        // --- AI-MODIFIED (2026-04-06) ---
        // Purpose: Anti AFK System premium feature nav link
        { href: "/anti-afk", label: "Anti AFK System", icon: <ShieldAlert size={16} />, supporterPerk: true },
        // --- END AI-MODIFIED ---
      ],
    })
    // --- END AI-MODIFIED ---
    // --- AI-REPLACED (2026-03-22) ---
    // Reason: Pet Settings moved into Configuration section above
    // What the new code does better: reduces sidebar clutter by grouping under Configuration
    // --- Original code (commented out for rollback) ---
    // sections.push({
    //   title: "LionGotchi",
    //   links: [
    //     { href: "/liongotchi", label: "Pet Settings", icon: <PawPrint size={16} /> },
    //   ],
    // })
    // --- End original code ---
    // --- END AI-REPLACED ---
    // --- AI-MODIFIED (2026-03-25) ---
    // Purpose: Advanced section with Debug Info page and Report a Bug external link
    sections.push({
      title: "Advanced",
      links: [
        { href: "/debug-info", label: "Debug Info", icon: <Bug size={16} /> },
        { href: "https://discord.gg/the-study-lions-780195610154237993", label: "Report a Bug", icon: <MessageSquareWarning size={16} /> },
      ],
    })
    // --- END AI-MODIFIED ---
  }

  return sections
}

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added isAdmin/isMod props, sidebar search input, inline search results, and premium badge
import { useDashboard } from "@/hooks/useDashboard"

interface SubStatusData {
  hasSubscription: boolean
  isPremium: boolean
  premiumUntil: string | null
  subscription: {
    plan: string
    status: string
  } | null
}

function NavContent({ serverId, serverName, sections, isAdmin, isMod, onNavigate, onOpenPalette }: {
  serverId: string
  serverName: string
  sections: NavSection[]
  isAdmin: boolean
  isMod: boolean
  onNavigate?: () => void
  onOpenPalette?: () => void
}) {
  const router = useRouter()
  const basePath = `/dashboard/servers/${serverId}`
  // --- AI-MODIFIED (2026-03-20) ---
  const { soundEnabled, setSoundEnabled, playSound } = useUISound()
  // --- END AI-MODIFIED ---
  const [sidebarQuery, setSidebarQuery] = useState("")
  const { data: subData } = useDashboard<SubStatusData>(
    serverId ? `/api/dashboard/servers/${serverId}/subscription` : null,
    { revalidateOnFocus: false }
  )

  const searchItems = getSearchItems(isAdmin, isMod)
  const grouped = useSearch(sidebarQuery, searchItems)
  const flat = flatResults(grouped)
  const isSearching = sidebarQuery.trim().length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4">
        <Link href="/dashboard/servers" onClick={onNavigate}>
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mb-3">
            <ArrowLeft size={12} />
            All Servers
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Server size={14} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{serverName}</p>
        </div>
        {/* --- AI-MODIFIED (2026-03-22) --- */}
        {/* Purpose: Show premium badge when active, or "Get Premium" hint when not */}
        {subData?.isPremium ? (
          <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            <Crown size={11} className="text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">Premium</span>
            {subData.subscription?.status === "CANCELLING" && (
              <span className="text-[9px] text-amber-400/60 ml-auto">ends {subData.premiumUntil ? new Date(subData.premiumUntil).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}</span>
            )}
          </div>
        ) : subData && !subData.isPremium ? (
          <Link href={`/dashboard/servers/${serverId}/settings`}>
            <a className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-border hover:border-amber-500/30 transition-colors cursor-pointer">
              <Crown size={11} className="text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground hover:text-amber-400 transition-colors">Get Premium</span>
            </a>
          </Link>
        ) : null}
        {/* --- END AI-MODIFIED --- */}
      </div>
      <div className="px-3 pb-1">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            placeholder="Find settings..."
            className="w-full bg-accent/30 border border-border/40 text-foreground text-xs rounded-md pl-8 pr-16 py-1.5 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/50 focus:bg-accent/50 transition-colors"
          />
          {isSearching ? (
            <button
              type="button"
              onClick={() => setSidebarQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
            >
              <X size={12} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPalette}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/35 bg-accent/50 border border-border/30 rounded px-1 py-0.5 hover:text-muted-foreground/60 hover:bg-accent/80 transition-colors"
              title="Open command palette"
            >
              Ctrl+K
            </button>
          )}
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-3">
        {isSearching ? (
          hasResults(grouped) ? (
            <div className="space-y-1">
              {flat.map((item) => {
                const fullPath = basePath + item.route + (item.section ? `?section=${item.section}` : "")
                return (
                  <Link key={item.id} href={fullPath} onClick={onNavigate}>
                    <span className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <span className="flex-shrink-0 opacity-60">
                        <Search size={13} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-medium truncate">{item.title}</span>
                        <span className="block text-[10px] text-muted-foreground/50 truncate">{item.page}{item.section ? ` \u203A ${item.title}` : ""}</span>
                      </span>
                      {item.premium && <Sparkles size={10} className="text-amber-400/50 flex-shrink-0" />}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/40 text-center py-6">
              No results for &ldquo;{sidebarQuery}&rdquo;
            </p>
          )
        ) : (
        sections.map((section) => (
          <div key={section.title} className="mb-4">
            {/* --- AI-MODIFIED (2026-03-22) --- */}
            {/* Purpose: Amber/gold styling for premium section headers */}
            <p className={cn(
              "px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider",
              section.premium
                ? "text-amber-400/70 flex items-center gap-1.5"
                : "text-muted-foreground/60"
            )}>
              {section.premium && <Crown size={10} className="text-amber-400/50" />}
              {section.title}
            </p>
            {/* --- END AI-MODIFIED --- */}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                // --- AI-MODIFIED (2026-03-25) ---
                // Purpose: Support external links (e.g. Report a Bug) that open in new tab
                const isExternal = link.href.startsWith("http")
                const fullPath = isExternal ? link.href : basePath + link.href
                const isActive = isExternal ? false : link.href === ""
                  ? router.asPath === fullPath || router.asPath === fullPath + "/"
                  : router.asPath.startsWith(fullPath)
                const linkClassName = cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? link.supporterPerk
                      ? "bg-amber-500/15 text-amber-400 font-medium"
                      : "bg-primary/15 text-primary font-medium"
                    : link.supporterPerk
                      ? "text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
                if (isExternal) {
                  return (
                    <a key={link.href} href={fullPath} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                      <span className="flex-shrink-0 opacity-70">{link.icon}</span>
                      <span className="flex-1">{link.label}</span>
                    </a>
                  )
                }
                // --- END AI-MODIFIED ---
                // --- AI-MODIFIED (2026-03-14) ---
                // Purpose: supporter perk visual highlight for cosmetic features
                return (
                  <Link key={link.href} href={fullPath} onClick={onNavigate}>
                    <span
                      className={linkClassName}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="flex-shrink-0 opacity-70">{link.icon}</span>
                      <span className="flex-1">{link.label}</span>
                      {link.supporterPerk && (
                        <Sparkles size={12} className="text-amber-400/60 flex-shrink-0" />
                      )}
                    </span>
                  </Link>
                )
                // --- END AI-MODIFIED ---
              })}
            </div>
          </div>
        ))
        )}
      </ScrollArea>
      {/* --- AI-MODIFIED (2026-04-03) --- */}
      {/* Purpose: Theme selector and sound toggle at bottom of server nav */}
      <div className="px-3 py-3 border-t border-border/40 space-y-0.5">
        <ThemeSelector />
        <button
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            if (next) playSound('toggleOn')
          }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
            soundEnabled
              ? "text-muted-foreground hover:text-foreground hover:bg-accent"
              : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent"
          )}
          title={soundEnabled ? "Mute UI sounds" : "Enable UI sounds"}
        >
          <span className="flex-shrink-0 opacity-70">
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </span>
          <span>{soundEnabled ? "Sounds on" : "Sounds off"}</span>
        </button>
      </div>
      {/* --- END AI-MODIFIED --- */}
    </div>
  )
}

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added command palette state, Ctrl+K listener, and pass isAdmin/isMod to NavContent
export default function ServerNav({ serverId, serverName, isAdmin = false, isMod = false }: ServerNavProps) {
  const [open, setOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const sections = buildSections(isAdmin, isMod)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-6 self-start border-r border-border/40 h-[calc(100vh-3rem)]" aria-label="Server navigation">
        <NavContent serverId={serverId} serverName={serverName} sections={sections} isAdmin={isAdmin} isMod={isMod} onOpenPalette={() => setPaletteOpen(true)} />
      </nav>

      {/* --- AI-MODIFIED (2026-03-24) --- */}
      {/* Purpose: Standardize mobile trigger to top-16 left-4 z-50 (consistent with DashboardNav/PetNav) */}
      {/* Mobile trigger */}
      <div className="fixed top-16 left-4 z-50 lg:hidden">
      {/* --- END AI-MODIFIED --- */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card shadow-lg">
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Server Navigation</SheetTitle>
            </SheetHeader>
            <NavContent
              serverId={serverId}
              serverName={serverName}
              sections={sections}
              isAdmin={isAdmin}
              isMod={isMod}
              onNavigate={() => setOpen(false)}
              onOpenPalette={() => { setOpen(false); setPaletteOpen(true) }}
            />
          </SheetContent>
        </Sheet>
      </div>

      <CommandPalette
        serverId={serverId}
        isAdmin={isAdmin}
        isMod={isMod}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
      />
    </>
  )
}
// --- END AI-MODIFIED ---
