// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled sidebar navigation for the /pet section
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Added Home icon import for the new Room nav link
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Added Palette icon for the Skins nav link
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Added Volume2/VolumeX for sound toggle
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Added Lock icon for no-pet nav items
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added Trophy, Users, Shield icons for Social nav section
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Added GraduationCap icon for Tutorial nav link
// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Added Settings icon for the new pet settings page
import {
  PawPrint, Package, Hammer, Sparkles, Sprout, BookOpen,
  Store, Menu, ChevronLeft, Home, Palette, Volume2, VolumeX, Lock,
  Trophy, Users, Shield, GraduationCap, Settings,
} from "lucide-react"
// --- END AI-MODIFIED -->
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
import { useUISound } from "@/lib/SoundContext"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Added balance display imports for persistent gold/gems in nav
import { useDashboard } from "@/hooks/useDashboard"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
// --- END AI-MODIFIED ---

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
  requiresPet?: boolean
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Added requiresPet flag to items that need a pet to access
const sections: NavSection[] = [
  {
    title: "PET",
    items: [
      { href: "/pet", label: "Overview", icon: <PawPrint size={14} /> },
      // --- AI-MODIFIED (2026-03-24) ---
      // Purpose: Tutorial link -- always visible, no requiresPet
      { href: "/pet/tutorial", label: "Tutorial", icon: <GraduationCap size={14} /> },
      // --- END AI-MODIFIED ---
      { href: "/pet/room", label: "Room", icon: <Home size={14} />, requiresPet: true },
      { href: "/pet/inventory", label: "Inventory", icon: <Package size={14} />, requiresPet: true },
      { href: "/pet/skins", label: "Skins", icon: <Palette size={14} />, requiresPet: true },
      { href: "/pet/farm", label: "Farm", icon: <Sprout size={14} />, requiresPet: true },
    ],
  },
  {
    title: "CRAFTING",
    items: [
      { href: "/pet/crafting", label: "Crafting", icon: <Hammer size={14} />, requiresPet: true },
      { href: "/pet/enhancement", label: "Enhancement", icon: <Sparkles size={14} />, requiresPet: true },
    ],
  },
  {
    title: "BROWSE",
    items: [
      { href: "/pet/wiki", label: "Item Wiki", icon: <BookOpen size={14} /> },
      { href: "/pet/marketplace", label: "Marketplace", icon: <Store size={14} /> },
    ],
  },
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Social features nav section (Leaderboard, Friends, Family)
  {
    title: "SOCIAL",
    items: [
      { href: "/pet/leaderboard", label: "Leaderboard", icon: <Trophy size={14} /> },
      { href: "/pet/friends", label: "Friends", icon: <Users size={14} />, requiresPet: true },
      { href: "/pet/family", label: "Family", icon: <Shield size={14} />, requiresPet: true },
    ],
  },
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-04-23) ---
  // Purpose: Account section with Settings link (sound, theme, future prefs)
  {
    title: "ACCOUNT",
    items: [
      { href: "/pet/settings", label: "Settings", icon: <Settings size={14} /> },
    ],
  },
  // --- END AI-MODIFIED ---
]
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Support locked state for items requiring a pet
function NavItemLink({ item, isActive, onClick, locked }: { item: NavItem; isActive: boolean; onClick?: () => void; locked?: boolean }) {
  // --- AI-MODIFIED (2026-04-28) ---
  // Purpose: Match the disabled / locked rows to the new active-row spacing
  // (3px left border + 8px cursor slot) so all rows line up perfectly.
  if (item.disabled) {
    return (
      <span className="font-pixel flex items-center gap-2.5 px-3 py-2 text-sm text-[#4a5568] cursor-not-allowed border-l-[3px] border-l-transparent">
        <span className="font-pixel text-[10px] leading-none w-2 inline-block text-transparent" aria-hidden="true">{"\u25B6"}</span>
        <span className="opacity-40">{item.icon}</span>
        {item.label}
        <span className="ml-auto text-[11px] text-[#3a4050]">SOON</span>
      </span>
    )
  }

  if (locked) {
    return (
      <span className="font-pixel flex items-center gap-2.5 px-3 py-2 text-sm text-[#3a4a5c] cursor-not-allowed border-l-[3px] border-l-transparent"
            title="Adopt a pet to unlock">
        <span className="font-pixel text-[10px] leading-none w-2 inline-block text-transparent" aria-hidden="true">{"\u25B6"}</span>
        <span className="opacity-30">{item.icon}</span>
        <span className="opacity-50">{item.label}</span>
        <Lock size={10} className="ml-auto opacity-40" />
      </span>
    )
  }
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Badge indicator for pending friend requests
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- focus-visible ring on nav items (matches PixelButton),
  // motion-safe animate-pulse on badge so reduced-motion users don't get the throb,
  // aria-label includes badge count for SR users
  const hasBadge = item.badge != null && item.badge > 0
  const ariaLabel = hasBadge ? `${item.label} (${item.badge} pending)` : undefined
  // --- AI-MODIFIED (2026-04-28) ---
  // Purpose: Active item now has a stronger pixel-art treatment -- a 3px
  // solid gold left bar (was 2px), a brighter bg highlight, AND a leading
  // ▶ glyph in pixel font. This makes the current page unmistakable and
  // matches classic RPG menu cursors.
  return (
    <Link href={item.href} onClick={onClick}>
      <span
        className={cn(
          "font-pixel flex items-center gap-2.5 px-3 py-2 text-sm transition-all border-l-[3px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pet-blue,#4080f0)] focus-visible:ring-inset",
          isActive
            ? "border-l-[#f0c040] bg-[#f0c040]/12 text-[#ffd860]"
            : hasBadge
              ? "border-l-[#f0c040]/60 text-[#f0c040] bg-[#f0c040]/5 hover:bg-[#f0c040]/10"
              : "border-l-transparent text-[#8899aa] hover:text-[#c0d0e0] hover:bg-[#1a2438] hover:border-l-[#3a4a6c]"
        )}
        aria-current={isActive ? "page" : undefined}
        aria-label={ariaLabel}
      >
        <span
          className={cn(
            "font-pixel text-[10px] leading-none w-2 inline-block",
            isActive ? "text-[#ffd860]" : "text-transparent"
          )}
          aria-hidden="true"
        >
          {"\u25B6"}
        </span>
        <span className="opacity-70">{item.icon}</span>
        {item.label}
        {hasBadge && (
          <span className="ml-auto font-pixel text-[10px] text-[#0a0e1a] bg-[#f0c040] px-1.5 py-0.5 min-w-[18px] text-center leading-none motion-safe:animate-pulse" aria-hidden="true">
            {item.badge}
          </span>
        )}
      </span>
    </Link>
  )
  // --- END AI-MODIFIED ---
  // --- END AI-MODIFIED ---
  // --- END AI-MODIFIED ---
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Accept hasPet prop to show locked nav items for users without a pet
function NavContent({ onNavigate, hasPet = true }: { onNavigate?: () => void; hasPet?: boolean }) {
// --- END AI-MODIFIED ---
  const router = useRouter()
  const { data: session } = useSession()
  // --- AI-MODIFIED (2026-03-20) ---
  const { soundEnabled, setSoundEnabled, playSound } = useUISound()
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Fetch balance for persistent display in sidebar
  const { data: balanceData } = useDashboard<{ gold: string; gems: number }>(
    session ? "/api/pet/balance" : null,
    { refreshInterval: 30000 }
  )
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Fetch pending friend request count for badge on Friends nav item
  const { data: pendingData } = useDashboard<{ requests: { requestId: number }[] }>(
    session && hasPet ? "/api/pet/friends/pending" : null,
    { refreshInterval: 60000 }
  )
  const pendingCount = pendingData?.requests?.length ?? 0
  // --- END AI-MODIFIED ---

  return (
    <div className="flex flex-col h-full bg-[var(--pet-card,#0f1628)]">
      {session?.user && (
        // --- AI-MODIFIED (2026-04-28) ---
        // Purpose: "Trainer card" header treatment. The Discord avatar gets a
        // proper beveled frame (light top-left + dark bottom-right outer edges
        // + thick dark inner border) so it reads as an intentional pixel-art
        // portrait regardless of source resolution. Drops "LionGotchi" subtitle
        // in favor of the persistent currency strip below which carries the
        // same identity signal more concretely.
        <div className="px-3 py-3 flex flex-col gap-2.5 border-b-2 border-[var(--pet-border,#2a3a5c)] bg-[#0a0e1a]">
          <div className="flex items-center gap-2.5">
            {session.user.image && (
              <span
                className="relative flex-shrink-0"
                style={{
                  // 2-tone outer bevel (light top-left, dark bottom-right) +
                  // hard shadow so the frame feels like an actual portrait holder.
                  boxShadow:
                    "inset 1px 1px 0 #4a5a7c, inset -1px -1px 0 #060810, 2px 2px 0 #060810",
                  padding: 2,
                  background: "#2a3a5c",
                }}
              >
                <img
                  src={session.user.image}
                  alt={session.user.name ? `${session.user.name}'s avatar` : "User avatar"}
                  className="block w-8 h-8"
                  style={{ imageRendering: "pixelated" }}
                />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate leading-tight">
                {session.user.name}
              </p>
              <p className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)] uppercase tracking-wider mt-0.5">
                Trainer
              </p>
            </div>
          </div>
          {balanceData && (
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#060810] border-2 border-[#1a2a3c]"
              style={{ boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.03)" }}
            >
              <GoldDisplay amount={Number(balanceData.gold)} size="sm" />
              <span className="block w-px h-4 bg-[#2a3a5c]" />
              <GoldDisplay amount={balanceData.gems} size="sm" type="gem" />
            </div>
          )}
        </div>
        // --- END AI-MODIFIED ---
      )}

      {/* --- AI-MODIFIED (2026-04-28) ---
          Purpose: Restyle the Dashboard back button so it stops being a
          rogue blue beveled box and instead matches the section header
          pattern (dark strip + ◂ glyph). Still distinct (it's an action,
          not a section), but it harmonizes with the rest of the nav.
          Original kept commented for rollback. */}
      {/* --- Original code (commented out for rollback) ---
      <div className="px-3 py-3">
        <Link href="/dashboard" onClick={onNavigate}>
          <span className={cn(
            "font-pixel flex items-center gap-2 px-3 py-2.5 text-sm",
            "bg-[#1a2050] border-2 border-[#4060c0] text-[#8090d0]",
            "shadow-[2px_2px_0_#060810]",
            "motion-safe:hover:shadow-[1px_1px_0_#060810] motion-safe:hover:translate-x-px motion-safe:hover:translate-y-px",
            "motion-safe:active:shadow-none motion-safe:active:translate-x-0.5 motion-safe:active:translate-y-0.5",
            "transition-all cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4060c0] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0e1a]"
          )}>
            <ChevronLeft size={14} />
            Dashboard
          </span>
        </Link>
      </div>
      --- End original code --- */}
      <div className="px-3 py-2">
        <Link href="/dashboard" onClick={onNavigate}>
          <span
            className={cn(
              "font-pixel flex items-center gap-2 px-2.5 py-1.5 text-[12px]",
              "border-2 border-[#1a2a3c] bg-[#060810] text-[#7a8a9a]",
              "transition-all cursor-pointer",
              "motion-safe:hover:border-[#3a4a6c] motion-safe:hover:text-[#c0d0e0] motion-safe:hover:bg-[#0a0e1a]",
              "motion-safe:hover:shadow-[1px_1px_0_#060810]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a4a6c] focus-visible:ring-inset",
              "uppercase tracking-wider"
            )}
            style={{ boxShadow: "2px 2px 0 #060810" }}
          >
            <span className="text-[10px] leading-none">{"\u25C2"}</span>
            Dashboard
          </span>
        </Link>
      </div>
      {/* --- END AI-MODIFIED --- */}

      <div className="flex-1 overflow-y-auto px-1 py-1 scrollbar-hide">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            {/* --- AI-MODIFIED (2026-04-28) ---
                Purpose: Section labels were tiny dim text with a thin solid
                line separator -- they read as form fieldsets, not zones of
                a game UI. Now: 4x4 gold block ornament + bigger, brighter
                label + dotted leader line. Reads as a category bar. */}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span
                className="block w-1.5 h-1.5 flex-shrink-0"
                style={{ background: "var(--pet-gold,#f0c040)", boxShadow: "1px 1px 0 #060810" }}
              />
              <span className="font-pixel text-[12px] text-[#a8b8c8] tracking-[0.2em] uppercase">
                {section.title}
              </span>
              <div className="flex-1" style={{ borderTop: "1px dotted var(--pet-border,#2a3a5c)" }} />
            </div>
            {/* --- END AI-MODIFIED --- */}
            <div>
              {section.items.map((item) => {
                const isActive = item.href === "/pet"
                  ? router.pathname === "/pet"
                  : router.pathname.startsWith(item.href)
                // --- AI-MODIFIED (2026-03-20) ---
                // Purpose: Lock items that require a pet when user has no pet
                const isLocked = !hasPet && item.requiresPet
                // --- END AI-MODIFIED ---
                // --- AI-MODIFIED (2026-03-24) ---
                // Purpose: Inject pending badge onto Friends nav item
                const itemWithBadge = item.href === "/pet/friends" && pendingCount > 0
                  ? { ...item, badge: pendingCount }
                  : item
                // --- END AI-MODIFIED ---
                return (
                  <NavItemLink
                    key={item.href}
                    item={itemWithBadge}
                    isActive={isActive}
                    onClick={onNavigate}
                    locked={isLocked}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {/* --- AI-MODIFIED (2026-03-20) --- */}
      {/* Purpose: Sound toggle matching pixel art style */}
      {/* --- AI-MODIFIED (2026-04-25) --- */}
      {/* Purpose: Premium polish -- role=switch + aria-checked for proper SR semantics
          (matches DashboardNav/ServerNav), focus-visible ring, type=button */}
      <div className="px-3 py-3 border-t-2 border-[var(--pet-border,#2a3a5c)]">
        <button
          type="button"
          role="switch"
          aria-checked={soundEnabled}
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            if (next) playSound('toggleOn')
          }}
          className={cn(
            "font-pixel flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-all border-l-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pet-blue,#4080f0)] focus-visible:ring-inset",
            soundEnabled
              ? "border-l-transparent text-[#8899aa] hover:text-[#c0d0e0] hover:bg-[#1a2438]"
              : "border-l-transparent text-[#4a5568] hover:text-[#8899aa] hover:bg-[#1a2438]"
          )}
          aria-label={soundEnabled ? "Mute UI sounds" : "Enable UI sounds"}
          title={soundEnabled ? "Mute UI sounds" : "Enable UI sounds"}
        >
          <span className="opacity-70">
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </span>
          <span>{soundEnabled ? "Sounds on" : "Sounds off"}</span>
        </button>
      </div>
      {/* --- END AI-MODIFIED --- */}
      {/* --- END AI-MODIFIED --- */}
    </div>
  )
}

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Accept hasPet prop to show locked nav items
export default function PetNav({ hasPet = true }: { hasPet?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav
        className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-6 self-start border-r-2 border-[var(--pet-border,#2a3a5c)] h-[calc(100vh-3rem)] bg-[var(--pet-card,#0f1628)]"
        aria-label="Pet navigation"
      >
        <NavContent hasPet={hasPet} />
      </nav>

      {/* --- AI-MODIFIED (2026-03-24) --- */}
      {/* Purpose: Standardize mobile trigger to z-50 + minimum 44px touch target */}
      <div className="fixed top-16 left-4 z-50 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-[var(--pet-card,#0f1628)] border-2 border-[var(--pet-border,#2a3a5c)] shadow-[2px_2px_0_#060810] min-w-[44px] min-h-[44px]">
      {/* --- END AI-MODIFIED --- */}
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 bg-[var(--pet-card,#0f1628)] border-r-2 border-[var(--pet-border,#2a3a5c)]">
            <SheetHeader className="sr-only">
              <SheetTitle>Pet Navigation</SheetTitle>
            </SheetHeader>
            <NavContent onNavigate={() => setOpen(false)} hasPet={hasPet} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
// --- END AI-MODIFIED ---
