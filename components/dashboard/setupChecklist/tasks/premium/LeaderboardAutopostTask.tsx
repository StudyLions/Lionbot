// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist Premium Task -- Leaderboard auto-post.
//          Editor at /dashboard/servers/[id]/leaderboard-autopost handles
//          schedule (frequency, day, time), top-N count, leaderboard type
//          (study time / messages / coins), and reward role tiers. Too
//          much UI for an inline drawer.
// ============================================================
import { BarChart3, ExternalLink, Calendar, Trophy, Award } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import DrawerFooter from "../../DrawerFooter"
import type { TaskComponentProps } from "../../SetupChecklist"

export default function LeaderboardAutopostTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const editorUrl = `/dashboard/servers/${guildId}/leaderboard-autopost`

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Leaderboard auto-post"
      subtitle="Schedule top-studier posts daily, weekly, or monthly."
      icon={BarChart3}
      returnFocusTo="setup-task-trigger-leaderboard_autopost"
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
        Pick a channel, pick a frequency, and Leo will automatically post a clean
        leaderboard of your top members on your schedule. Built-in role rewards
        let the top N members get a special role for the period.
      </p>

      <ul className="space-y-2.5 mb-5 text-sm">
        <li className="flex items-start gap-2.5">
          <Calendar size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Flexible schedule.</strong>
            <span className="text-muted-foreground"> Daily, weekly, or monthly — pick the day and hour.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Trophy size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Choose what to rank.</strong>
            <span className="text-muted-foreground"> Study time, message count, or coins earned.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Award size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Tiered role rewards.</strong>
            <span className="text-muted-foreground"> Auto-assign a role to your top 3 / top 10 / top 25.</span>
          </span>
        </li>
      </ul>

      <a
        href={editorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md bg-primary/10 text-primary hover:bg-primary/15 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Set up your leaderboard schedule
        <ExternalLink size={14} aria-hidden="true" />
      </a>

      <p className="mt-4 text-[12px] text-muted-foreground/80">
        Editor opens in a new tab. You can run multiple schedules in
        parallel (e.g. one weekly study leaderboard plus one monthly
        messages leaderboard).
      </p>
    </TaskDrawer>
  )
}
