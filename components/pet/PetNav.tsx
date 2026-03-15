// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Standalone sidebar navigation for the /pet section
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
import {
  PawPrint, Package, Hammer, Sparkles, Sprout, BookOpen,
  Store, Menu, ChevronRight,
} from "lucide-react"

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
    title: "Pet",
    items: [
      { href: "/pet", label: "Overview", icon: <PawPrint size={16} /> },
      { href: "/pet/inventory", label: "Inventory", icon: <Package size={16} />, disabled: true },
      { href: "/pet/farm", label: "Farm", icon: <Sprout size={16} />, disabled: true },
    ],
  },
  {
    title: "Crafting",
    items: [
      { href: "/pet/crafting", label: "Crafting", icon: <Hammer size={16} />, disabled: true },
      { href: "/pet/enhancement", label: "Enhancement", icon: <Sparkles size={16} />, disabled: true },
    ],
  },
  {
    title: "Browse",
    items: [
      { href: "/pet/wiki", label: "Item Wiki", icon: <BookOpen size={16} />, disabled: true },
      { href: "/pet/marketplace", label: "Marketplace", icon: <Store size={16} />, disabled: true },
    ],
  },
]

function NavItemLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  if (item.disabled) {
    return (
      <span
        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground/40 cursor-not-allowed"
      >
        <span className="flex-shrink-0 opacity-50">{item.icon}</span>
        {item.label}
        <span className="ml-auto text-[10px] uppercase tracking-wide font-medium text-muted-foreground/30">Soon</span>
      </span>
    )
  }

  return (
    <Link href={item.href} onClick={onClick}>
      <span
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-amber-500/15 text-amber-400 font-medium"
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
            <p className="text-xs text-muted-foreground">LionGotchi</p>
          </div>
        </div>
      )}
      <div className="px-3 py-2">
        <Link href="/dashboard" onClick={onNavigate}>
          <span
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer bg-indigo-600/80 text-indigo-50 hover:bg-indigo-600 shadow-sm hover:shadow-md shadow-indigo-500/15"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <ChevronRight size={18} className="rotate-180" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-semibold leading-tight">Dashboard</span>
              <span className="block text-[10px] text-indigo-200/70 font-normal leading-tight">
                Back to main
              </span>
            </div>
          </span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {section.title}
            </p>
            <div className="space-y-0.5">
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
      </ScrollArea>
    </div>
  )
}

export default function PetNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-6 self-start border-r border-border/40 h-[calc(100vh-3rem)]" aria-label="Pet navigation">
        <NavContent />
      </nav>

      <div className="fixed top-16 left-4 z-40 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card shadow-lg">
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
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
