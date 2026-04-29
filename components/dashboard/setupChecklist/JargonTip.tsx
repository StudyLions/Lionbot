// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Inline "?" tooltip that explains a Discord term in plain English.
//          Used inside drawers wherever the copy bank flagged a term as
//          jargon. Hover on desktop, tap on mobile. ESC to close.
//
//          Definitions live in this file so they can be audited as a single
//          source of truth (mirror of docs/setup-copy.md "JargonTip dictionary").
// ============================================================
import { HelpCircle } from "lucide-react"
import { useState, useRef, useEffect, useId } from "react"

export type JargonTerm =
  | "channel"
  | "category"
  | "role"
  | "permission"
  | "dm"
  | "embed"
  | "webhook"
  | "xp"
  | "lioncoin"
  | "pomodoro"
  | "rank"
  | "untracked_channel"
  | "autorole"
  | "voice_category"
  | "lobby"
  | "mention"

const DEFINITIONS: Record<JargonTerm, { title: string; body: string }> = {
  channel: {
    title: "Channel",
    body: "A room inside a Discord server where messages are sent. Either text or voice.",
  },
  category: {
    title: "Category",
    body: "A folder that groups several channels together in the sidebar.",
  },
  role: {
    title: "Role",
    body: "A label you give members. Used for permissions, colours and rank ladders.",
  },
  permission: {
    title: "Permission",
    body: "Something a member or the bot is allowed to do (like send messages).",
  },
  dm: {
    title: "DM",
    body: "A private message sent to one person, outside any server.",
  },
  embed: {
    title: "Embed",
    body: "A formatted message box with a coloured stripe \u2014 what bots usually post.",
  },
  webhook: {
    title: "Webhook",
    body: "A way for the bot to post to a channel using a custom name and avatar.",
  },
  xp: {
    title: "XP",
    body: "Experience points. Earned from studying. Drives ranks.",
  },
  lioncoin: {
    title: "LionCoin",
    body: "The bot's currency. Spent in the server shop and on accountability bookings.",
  },
  pomodoro: {
    title: "Pomodoro",
    body: "A focus technique: work for 25 min, break for 5. The bot runs the timer.",
  },
  rank: {
    title: "Rank",
    body: "A level a member reaches as they earn XP. Each rank is a role you set up.",
  },
  untracked_channel: {
    title: "Untracked channel",
    body: "A channel where time spent doesn't count toward XP.",
  },
  autorole: {
    title: "Autorole",
    body: "A role given automatically when someone joins or hits a level.",
  },
  voice_category: {
    title: "Voice category",
    body: "A category whose channels are voice channels.",
  },
  lobby: {
    title: "Lobby",
    body: "A waiting voice channel members join before being moved into a session.",
  },
  mention: {
    title: "Mention",
    body: "An @notification that pings a person or role.",
  },
}

interface Props {
  term: JargonTerm
  size?: number
  className?: string
}

export default function JargonTip({ term, size = 14, className = "" }: Props) {
  const [hoverOpen, setHoverOpen] = useState(false)
  const [clickOpen, setClickOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tipId = useId()
  const open = hoverOpen || clickOpen

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setClickOpen(false)
        setHoverOpen(false)
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setClickOpen(false)
        setHoverOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open])

  const def = DEFINITIONS[term]
  if (!def) return null

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setClickOpen((v) => !v)}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        onFocus={() => setHoverOpen(true)}
        onBlur={() => setHoverOpen(false)}
        // 24px tap area satisfies "small inline" while keeping the icon visually 14px.
        className="inline-flex items-center justify-center w-6 h-6 -m-1 rounded-full text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`What's a ${def.title.toLowerCase()}?`}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
      >
        <HelpCircle size={size} />
      </button>
      {open && (
        <div
          id={tipId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 max-w-[calc(100vw-2rem)] px-3 py-2 text-xs text-foreground/90 bg-card border border-border rounded-lg shadow-xl motion-safe:animate-fade-in"
        >
          <div className="font-semibold text-sm mb-0.5">{def.title}</div>
          <div className="text-foreground/80 leading-relaxed">{def.body}</div>
          <div
            aria-hidden="true"
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border"
          />
        </div>
      )}
    </div>
  )
}
