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
import {
  PawPrint, Package, Hammer, Sparkles, Sprout, BookOpen,
  Store, Menu, ChevronLeft, Home, Palette, Volume2, VolumeX,
} from "lucide-react"
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
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: "PET",
    items: [
      { href: "/pet", label: "Overview", icon: <PawPrint size={14} /> },
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Added Room link between Overview and Inventory
      { href: "/pet/room", label: "Room", icon: <Home size={14} /> },
      // --- END AI-MODIFIED ---
      { href: "/pet/inventory", label: "Inventory", icon: <Package size={14} /> },
      // --- AI-MODIFIED (2026-03-17) ---
      // Purpose: Added Skins link for gameboy frame customization
      { href: "/pet/skins", label: "Skins", icon: <Palette size={14} /> },
      // --- END AI-MODIFIED ---
      { href: "/pet/farm", label: "Farm", icon: <Sprout size={14} /> },
    ],
  },
  {
    title: "CRAFTING",
    items: [
      { href: "/pet/crafting", label: "Crafting", icon: <Hammer size={14} /> },
      { href: "/pet/enhancement", label: "Enhancement", icon: <Sparkles size={14} /> },
    ],
  },
  {
    title: "BROWSE",
    items: [
      { href: "/pet/wiki", label: "Item Wiki", icon: <BookOpen size={14} /> },
      { href: "/pet/marketplace", label: "Marketplace", icon: <Store size={14} /> },
    ],
  },
]

function NavItemLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  if (item.disabled) {
    return (
      <span className="font-pixel flex items-center gap-2.5 px-3 py-2 text-sm text-[#4a5568] cursor-not-allowed">
        <span className="opacity-40">{item.icon}</span>
        {item.label}
        <span className="ml-auto text-[11px] text-[#3a4050]">SOON</span>
      </span>
    )
  }

  return (
    <Link href={item.href} onClick={onClick}>
      <span
        className={cn(
          "font-pixel flex items-center gap-2.5 px-3 py-2 text-sm transition-all border-l-2",
          isActive
            ? "border-l-[#f0c040] bg-[#f0c040]/8 text-[#f0c040]"
            : "border-l-transparent text-[#8899aa] hover:text-[#c0d0e0] hover:bg-[#1a2438] hover:border-l-[#3a4a6c]"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="opacity-70">{item.icon}</span>
        {item.label}
      </span>
    </Link>
  )
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
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

  return (
    <div className="flex flex-col h-full bg-[var(--pet-card,#0f1628)]">
      {session?.user && (
        <div className="px-4 py-4 flex flex-col gap-2 border-b-2 border-[var(--pet-border,#2a3a5c)]">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-8 h-8 border-2 border-[var(--pet-border,#2a3a5c)]"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <div className="min-w-0">
              <p className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] truncate">
                {session.user.name}
              </p>
              <p className="font-pixel text-[12px] text-[var(--pet-gold,#f0c040)]">LionGotchi</p>
            </div>
          </div>
          {/* --- AI-MODIFIED (2026-03-16) --- */}
          {/* Purpose: Persistent gold/gems balance display */}
          {balanceData && (
            <div className="flex items-center gap-3 px-1 py-1.5 bg-[#0a0e1a] border border-[#1a2a3c]">
              <GoldDisplay amount={Number(balanceData.gold)} size="sm" />
              <div className="w-px h-4 bg-[#2a3a5c]" />
              <GoldDisplay amount={balanceData.gems} size="sm" type="gem" />
            </div>
          )}
          {/* --- END AI-MODIFIED --- */}
        </div>
      )}

      <div className="px-3 py-3">
        <Link href="/dashboard" onClick={onNavigate}>
          <span
            className={cn(
              "font-pixel flex items-center gap-2 px-3 py-2.5 text-sm",
              "bg-[#1a2050] border-2 border-[#4060c0] text-[#8090d0]",
              "shadow-[2px_2px_0_#060810]",
              "hover:shadow-[1px_1px_0_#060810] hover:translate-x-px hover:translate-y-px",
              "active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
              "transition-all cursor-pointer"
            )}
          >
            <ChevronLeft size={14} />
            Dashboard
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-1 scrollbar-hide">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="font-pixel text-[12px] text-[#4a5a70] tracking-widest">{section.title}</span>
              <div className="flex-1 h-px bg-[var(--pet-border,#2a3a5c)]" />
            </div>
            <div>
              {section.items.map((item) => {
                const isActive = item.href === "/pet"
                  ? router.pathname === "/pet"
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
      </div>
      {/* --- AI-MODIFIED (2026-03-20) --- */}
      {/* Purpose: Sound toggle matching pixel art style */}
      <div className="px-3 py-3 border-t-2 border-[var(--pet-border,#2a3a5c)]">
        <button
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            if (next) playSound('toggleOn')
          }}
          className={cn(
            "font-pixel flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-all border-l-2",
            soundEnabled
              ? "border-l-transparent text-[#8899aa] hover:text-[#c0d0e0] hover:bg-[#1a2438]"
              : "border-l-transparent text-[#4a5568] hover:text-[#8899aa] hover:bg-[#1a2438]"
          )}
          title={soundEnabled ? "Mute UI sounds" : "Enable UI sounds"}
        >
          <span className="opacity-70">
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </span>
          <span>{soundEnabled ? "Sounds on" : "Sounds off"}</span>
        </button>
      </div>
      {/* --- END AI-MODIFIED --- */}
    </div>
  )
}

export default function PetNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav
        className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-6 self-start border-r-2 border-[var(--pet-border,#2a3a5c)] h-[calc(100vh-3rem)] bg-[var(--pet-card,#0f1628)]"
        aria-label="Pet navigation"
      >
        <NavContent />
      </nav>

      <div className="fixed top-16 left-4 z-40 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-[var(--pet-card,#0f1628)] border-2 border-[var(--pet-border,#2a3a5c)] shadow-[2px_2px_0_#060810]">
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 bg-[var(--pet-card,#0f1628)] border-r-2 border-[var(--pet-border,#2a3a5c)]">
            <SheetHeader className="sr-only">
              <SheetTitle>Pet Navigation</SheetTitle>
            </SheetHeader>
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
