// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Collapsible "Power user" footer for the Setup Checklist.
//          Surfaces the high-impact settings the legacy wizard never touched
//          but most admins didn't know existed (untracked channels alone is
//          worth a 10x rewards-fairness improvement on most servers).
//
//          Each row is a one-sentence explanation + a link to the dedicated
//          settings page. Renders below the 8 main task list inside the widget.
// ============================================================
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  EyeOff,
  UserPlus,
  Video,
  ListTodo,
  ShoppingBag,
  Award,
  Brush,
  Moon,
  Pin,
} from "lucide-react"

interface PowerLink {
  href: string
  title: string
  blurb: string
  icon: LucideIcon
}

const buildLinks = (guildId: string): PowerLink[] => [
  {
    href: `/dashboard/servers/${guildId}/settings#untracked`,
    title: "Don't count these channels for XP",
    blurb: "Stops AFK / staff / announcement channels from rewarding members for sitting in them.",
    icon: EyeOff,
  },
  {
    href: `/dashboard/servers/${guildId}/settings#autoroles`,
    title: "Auto-give roles to new members",
    blurb: "Automatically gives a role to anyone who joins your server.",
    icon: UserPlus,
  },
  {
    href: `/dashboard/servers/${guildId}/videochannels`,
    title: "Camera / screen share enforcement",
    blurb: "Force members in specific voice channels to keep their camera on.",
    icon: Video,
  },
  {
    href: `/dashboard/servers/${guildId}/role-menus`,
    title: "Role menus",
    blurb: "Self-service role pickers your members can use in any channel.",
    icon: ListTodo,
  },
  {
    href: `/dashboard/servers/${guildId}/shop`,
    title: "Server shop editor",
    blurb: "Add roles, colours and perks members can buy with LionCoins.",
    icon: ShoppingBag,
  },
  {
    href: `/dashboard/servers/${guildId}/ranks`,
    title: "Ranks editor",
    blurb: "Customize the rank ladder \u2014 names, role rewards, thresholds.",
    icon: Award,
  },
  {
    href: `/dashboard/servers/${guildId}/branding`,
    title: "Server branding",
    blurb: "Custom colours and logos on your members' profile cards.",
    icon: Brush,
  },
  {
    href: `/dashboard/servers/${guildId}/anti-afk`,
    title: "Anti-AFK",
    blurb: "Disconnect or move members who go idle in voice channels.",
    icon: Moon,
  },
  {
    href: `/dashboard/servers/${guildId}/sticky-messages`,
    title: "Sticky messages",
    blurb: "Pin a message to the bottom of any channel so it's always visible.",
    icon: Pin,
  },
]

interface Props {
  guildId: string
}

export default function PowerUserSection({ guildId }: Props) {
  const [open, setOpen] = useState(false)
  const links = buildLinks(guildId)

  return (
    <div className="border-t border-border/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-3 min-h-[44px] text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-medium text-foreground/90">Power-user settings</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Less common knobs. Most servers don't need these.
          </p>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
        )}
      </button>
      {open && (
        <ul role="list" className="grid gap-1 px-3 sm:px-4 pb-4">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <link.icon size={16} className="text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground/90 leading-tight">
                    {link.title}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{link.blurb}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
