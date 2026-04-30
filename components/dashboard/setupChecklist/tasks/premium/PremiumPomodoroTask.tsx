// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist Premium Task -- Premium Pomodoro extras.
//          The free Pomodoro setup happens in the core "Tasks and focus
//          timer" task above. THIS task is for premium-only flourishes:
//          themed timer, animated visuals, group goals, golden hour
//          coin multiplier, focus role.
//          Editor at /dashboard/servers/[id]/pomodoro (the same page as
//          the free Pomodoro config -- the premium fields are gated
//          inside the page itself).
// ============================================================
import { Hourglass, ExternalLink, Sparkles, Users, Sun } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import DrawerFooter from "../../DrawerFooter"
import type { TaskComponentProps } from "../../SetupChecklist"

export default function PremiumPomodoroTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const editorUrl = `/dashboard/servers/${guildId}/pomodoro`

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Premium Pomodoro extras"
      subtitle="Themed timers, group goals, and the golden hour coin multiplier."
      icon={Hourglass}
      returnFocusTo="setup-task-trigger-premium_pomodoro"
      footer={
        <DrawerFooter
          onSkip={() => {
            onSkip()
            onClose()
          }}
          onClose={onClose}
          onComplete={onComplete}
          hasValue
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        You've already set up the core Pomodoro timer earlier in this
        checklist. The premium extras add polish and group accountability
        on top of that — visual flair, weekly goals, and a coin multiplier
        that rotates based on your server's quietest hours.
      </p>

      <ul className="space-y-2.5 mb-5 text-sm">
        <li className="flex items-start gap-2.5">
          <Sparkles size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Themed and animated timer.</strong>
            <span className="text-muted-foreground"> Pick from preset visual styles, no flat default block.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Users size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Server-wide weekly goal.</strong>
            <span className="text-muted-foreground"> Track combined hours toward a community target.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Sun size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Golden hour bonus.</strong>
            <span className="text-muted-foreground"> Extra LionCoins during a window you set (e.g. 5–7 AM).</span>
          </span>
        </li>
      </ul>

      <a
        href={editorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md bg-primary/10 text-primary hover:bg-primary/15 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Customize your premium Pomodoro
        <ExternalLink size={14} aria-hidden="true" />
      </a>

      <p className="mt-4 text-[12px] text-muted-foreground/80">
        The premium-only fields are at the bottom of the editor, below the
        free settings you've already configured.
      </p>
    </TaskDrawer>
  )
}
