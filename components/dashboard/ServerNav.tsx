// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server navigation sidebar with grouped links and permission awareness
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: add Sparkles icon for supporter perk highlight + Volume2/VolumeX for sound toggle
import {
  BarChart3, Users, Shield, Coins, Settings, Trophy,
  ShoppingBag, ListChecks, Calendar, Timer, Video,
  Wand2, ArrowLeft, Menu, Server, Paintbrush, Sparkles,
  Volume2, VolumeX, PawPrint,
} from "lucide-react"
import { useUISound } from "@/lib/SoundContext"
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

interface NavSection {
  title: string
  links: NavLink[]
}

function buildSections(isAdmin: boolean, isMod: boolean): NavSection[] {
  const sections: NavSection[] = [
    { title: "Overview", links: [
      { href: "", label: "Dashboard", icon: <BarChart3 size={16} /> },
    ]},
  ]

  if (isMod || isAdmin) {
    sections.push({
      title: "Management",
      links: [
        { href: "/members", label: "Members", icon: <Users size={16} /> },
        { href: "/moderation", label: "Moderation", icon: <Shield size={16} /> },
        { href: "/economy", label: "Economy", icon: <Coins size={16} /> },
      ],
    })
  }

  if (isAdmin) {
    sections.push({
      title: "Configuration",
      links: [
        { href: "/settings", label: "Settings", icon: <Settings size={16} /> },
        { href: "/ranks", label: "Ranks", icon: <Trophy size={16} /> },
        { href: "/shop", label: "Shop", icon: <ShoppingBag size={16} /> },
        { href: "/rolemenus", label: "Role Menus", icon: <ListChecks size={16} /> },
      ],
    })
    sections.push({
      title: "Features",
      links: [
        { href: "/schedule", label: "Schedule", icon: <Calendar size={16} /> },
        { href: "/pomodoro", label: "Pomodoro", icon: <Timer size={16} /> },
        { href: "/videochannels", label: "Video Channels", icon: <Video size={16} /> },
        { href: "/branding", label: "Branding", icon: <Paintbrush size={16} />, supporterPerk: true },
        { href: "/setup", label: "Setup Wizard", icon: <Wand2 size={16} /> },
      ],
    })
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: LionGotchi admin settings section
    sections.push({
      title: "LionGotchi",
      links: [
        { href: "/liongotchi", label: "Pet Settings", icon: <PawPrint size={16} /> },
      ],
    })
    // --- END AI-MODIFIED ---
  }

  return sections
}

function NavContent({ serverId, serverName, sections, onNavigate }: {
  serverId: string
  serverName: string
  sections: NavSection[]
  onNavigate?: () => void
}) {
  const router = useRouter()
  const basePath = `/dashboard/servers/${serverId}`
  // --- AI-MODIFIED (2026-03-20) ---
  const { soundEnabled, setSoundEnabled, playSound } = useUISound()
  // --- END AI-MODIFIED ---

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
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const fullPath = basePath + link.href
                const isActive = link.href === ""
                  ? router.asPath === fullPath || router.asPath === fullPath + "/"
                  : router.asPath.startsWith(fullPath)
                // --- AI-MODIFIED (2026-03-14) ---
                // Purpose: supporter perk visual highlight for cosmetic features
                return (
                  <Link key={link.href} href={fullPath} onClick={onNavigate}>
                    <span
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? link.supporterPerk
                            ? "bg-amber-500/15 text-amber-400 font-medium"
                            : "bg-primary/15 text-primary font-medium"
                          : link.supporterPerk
                            ? "text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
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
        ))}
      </ScrollArea>
      {/* --- AI-MODIFIED (2026-03-20) --- */}
      {/* Purpose: Sound toggle at bottom of server nav */}
      <div className="px-3 py-3 border-t border-border/40">
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

export default function ServerNav({ serverId, serverName, isAdmin = false, isMod = false }: ServerNavProps) {
  const [open, setOpen] = useState(false)
  const sections = buildSections(isAdmin, isMod)

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-6 self-start border-r border-border/40 h-[calc(100vh-3rem)]" aria-label="Server navigation">
        <NavContent serverId={serverId} serverName={serverName} sections={sections} />
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
              <SheetTitle>Server Navigation</SheetTitle>
            </SheetHeader>
            <NavContent
              serverId={serverId}
              serverName={serverName}
              sections={sections}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
