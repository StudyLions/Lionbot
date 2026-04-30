// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist task -- Premium features preview (non-premium
//          servers only). One browse drawer that lays out all 7 premium
//          features with a tiny preview each. The tone is creative and
//          benefit-first per Ari's brief: NO upgrade exclamation marks,
//          NO scarcity tactics, NO animated counters, NO pricing in the
//          per-feature cards. ONE quiet "See pricing" outline button at
//          the bottom plus a "Maybe later" link that marks the task done
//          so the row stops nagging.
// ============================================================
import { Crown, Music2, ShieldOff, Pin, BarChart3, Hourglass, Palette, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import DrawerFooter from "../../DrawerFooter"
import type { TaskComponentProps } from "../../SetupChecklist"

interface PreviewItem {
  icon: LucideIcon
  name: string
  blurb: string
}

// Order matches the premium tasks array in SetupChecklist.tsx so the
// experience feels consistent if a user upgrades and comes back to find
// the actual checklist rows in the same order.
const ITEMS: PreviewItem[] = [
  {
    icon: Music2,
    name: "Ambient sounds",
    blurb: "Up to 10 looping background bots — rain, ocean, campfire, LoFi, brown noise.",
  },
  {
    icon: ShieldOff,
    name: "Anti-AFK in study rooms",
    blurb: "Quietly remove or pause members who go idle in voice for too long.",
  },
  {
    icon: Hourglass,
    name: "Premium Pomodoro extras",
    blurb: "Themes, animated timer, group goals, and a golden hour coin multiplier.",
  },
  {
    icon: BarChart3,
    name: "Leaderboard auto-post",
    blurb: "Schedule daily, weekly, or monthly top-studier posts with role rewards.",
  },
  {
    icon: Pin,
    name: "Sticky messages",
    blurb: "Auto-repost a pinned-style embed at the bottom of busy channels.",
  },
  {
    icon: Palette,
    name: "Card branding",
    blurb: "Recolour every Leo card to match your server's theme.",
  },
  {
    icon: Sparkles,
    name: "Feature your server",
    blurb: "Public profile page on lionbot.org with a real DoFollow backlink.",
  },
]

export default function PremiumPreviewTask({ open, onClose, onComplete, onSkip }: TaskComponentProps) {
  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Premium features"
      subtitle="A short tour of what's available with a premium subscription."
      icon={Crown}
      returnFocusTo="setup-task-trigger-premium_preview"
      footer={
        <DrawerFooter
          // "Maybe later" stays as the gentle skip option (the secondary
          // button in DrawerFooter). Marks done so the row stops appearing.
          onSkip={() => {
            onSkip()
            onClose()
          }}
          onClose={onClose}
          // Primary button reads "Looks good -- mark as done" because we
          // pass hasValue. That gives non-premium admins an honest "I've
          // had a look, hide this" path without shaming them into
          // upgrading.
          onComplete={onComplete}
          hasValue
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-5">
        Here's what your server gets with premium. Have a look — no rush.
        We'd rather you understand what's available than feel pushed.
      </p>

      <ul className="space-y-2.5 mb-6">
        {ITEMS.map((item) => (
          <li
            key={item.name}
            className="rounded-lg border border-border bg-card/50 px-3 py-2.5"
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md bg-amber-500/10 text-amber-400/85">
                <item.icon size={16} aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{item.name}</div>
                <div className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                  {item.blurb}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Single, quiet CTA. Outline (not primary) so it doesn't dominate
          the drawer — the goal is to inform, not to push. */}
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] px-4 py-4">
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          If any of these would help your community, premium starts low and
          supports a small, family-run team that builds Leo full-time.
        </p>
        <a
          href="/donate"
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 rounded-md border border-amber-500/40 bg-transparent text-amber-300 hover:bg-amber-500/10 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          See premium pricing
        </a>
      </div>

      <p className="mt-4 text-[12px] text-muted-foreground/80">
        Hit "Skip for now" below to hide this row. You can always re-open
        the checklist from the sidebar if you change your mind.
      </p>
    </TaskDrawer>
  )
}
