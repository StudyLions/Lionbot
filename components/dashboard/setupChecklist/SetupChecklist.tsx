// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Dashboard-resident "Setup Checklist" widget.
//          Replaces the standalone 12-step wizard with a focused, in-context
//          card on the server overview page. Each task opens its own drawer;
//          state syncs to guild_config.setup_checklist_state via the
//          /api/dashboard/servers/[id]/setup-checklist endpoint.
//
//          Behaviour:
//          - Hidden entirely if all 8 tasks are done or skipped (collapses
//            to a small "You're all set" card with editor links)
//          - Auto-opens to focus the first pending task when ?setup=open
//          - Tasks render in a stable order (Essentials \u2192 \u2026 \u2192 Pet)
//          - Each task can be clicked, "skipped", or marked done by the API
//          - Power-user footer surfaces settings the wizard never exposed
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/router"
import {
  Settings,
  Trophy,
  Coins,
  Hand,
  Bell,
  Timer,
  Calendar,
  PawPrint,
  Check,
  Minus,
  ChevronRight,
  ListChecks,
  ExternalLink,
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Icons for the 7 premium feature tasks + the section header.
  Crown,
  Music2,
  ShieldOff,
  Pin,
  BarChart3,
  Hourglass,
  Palette,
  Sparkles,
  // --- END AI-MODIFIED ---
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import EssentialsTask from "./tasks/EssentialsTask"
import RanksTask from "./tasks/RanksTask"
import RewardsTask from "./tasks/RewardsTask"
import WelcomeTask from "./tasks/WelcomeTask"
import NotificationsTask from "./tasks/NotificationsTask"
import FocusTask from "./tasks/FocusTask"
import ScheduleTask from "./tasks/ScheduleTask"
import PetTask from "./tasks/PetTask"
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: New premium feature task drawers + the non-premium teaser drawer.
import AntiAfkTask from "./tasks/premium/AntiAfkTask"
import BrandingTask from "./tasks/premium/BrandingTask"
import AmbientSoundsTask from "./tasks/premium/AmbientSoundsTask"
import LeaderboardAutopostTask from "./tasks/premium/LeaderboardAutopostTask"
import PremiumPomodoroTask from "./tasks/premium/PremiumPomodoroTask"
import StickyMessagesTask from "./tasks/premium/StickyMessagesTask"
import ListingTask from "./tasks/premium/ListingTask"
import PremiumPreviewTask from "./tasks/premium/PremiumPreviewTask"
// --- END AI-MODIFIED ---
import PowerUserSection from "./PowerUserSection"

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Expanded TaskId union to include the 7 premium tasks plus the
// `premium_preview` virtual id (only shown to non-premium guilds).
export type TaskId =
  | "essentials"
  | "ranks"
  | "rewards"
  | "welcome"
  | "notifications"
  | "focus"
  | "schedule"
  | "pet"
  | "ambient_sounds"
  | "anti_afk"
  | "sticky_messages"
  | "leaderboard_autopost"
  | "premium_pomodoro"
  | "branding"
  | "listing"
  | "premium_preview"

interface TaskMeta {
  id: TaskId
  title: string
  summary: string
  icon: LucideIcon
  // Some tasks are explicitly optional in the copy bank (Schedule, Pet).
  optional?: boolean
  // Section header rendering: "core" or "premium". `premium_preview` is
  // rendered as the only entry in the premium section for non-premium
  // guilds. Drives the visual divider + Premium pill on each row.
  section?: "core" | "premium"
}

const CORE_TASKS: TaskMeta[] = [
  { id: "essentials",    title: "Server essentials",         summary: "Timezone + admin and moderator roles.",                          icon: Settings,  section: "core" },
  { id: "ranks",         title: "How members rank up",       summary: "Voice time, messages, or XP \u2014 mix and match.",                       icon: Trophy,    section: "core" },
  { id: "rewards",       title: "Member rewards",            summary: "How many LionCoins members earn from studying.",                  icon: Coins,     section: "core" },
  { id: "welcome",       title: "Welcome new members",       summary: "Greet people when they join.",                                    icon: Hand,      section: "core" },
  { id: "notifications", title: "Notification channels",     summary: "Where the bot sends logs, mod alerts and rank-up posts.",         icon: Bell,      section: "core" },
  { id: "focus",         title: "Tasks and focus timer",     summary: "Reward members for tasks and Pomodoro sessions.",                 icon: Timer,     section: "core" },
  { id: "schedule",      title: "Accountability sessions",   summary: "Optional. Members book a slot, show up, earn rewards.",           icon: Calendar,  section: "core", optional: true },
  { id: "pet",           title: "Pet game",                  summary: "Optional. LionGotchi pets that members raise by studying.",       icon: PawPrint,  section: "core", optional: true },
]

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: 7 premium-gated tasks. Order is "high engagement" first --
// ambient sounds and anti-AFK are the most-loved features so they sit at
// the top; admin-flavored options (sticky, leaderboard autopost) follow,
// then the polish/growth options (branding, listing).
const PREMIUM_TASKS: TaskMeta[] = [
  { id: "ambient_sounds",       title: "Ambient sounds",         summary: "Up to 10 ambient sound bots playing rain, ocean, LoFi and more.",  icon: Music2,    section: "premium" },
  { id: "anti_afk",             title: "Anti-AFK in study rooms", summary: "Kick or move members who go idle for too long.",                  icon: ShieldOff, section: "premium" },
  { id: "premium_pomodoro",     title: "Premium Pomodoro extras", summary: "Themes, animated timer, group goals, golden hour multiplier.",     icon: Hourglass, section: "premium" },
  { id: "leaderboard_autopost", title: "Leaderboard auto-post",   summary: "Schedule daily, weekly or monthly top-studier posts.",             icon: BarChart3, section: "premium" },
  { id: "sticky_messages",      title: "Sticky messages",         summary: "Auto-repost a pinned-style embed at the bottom of channels.",      icon: Pin,       section: "premium" },
  { id: "branding",             title: "Card branding",           summary: "Pick the colours and theme used on Leo's stat cards.",             icon: Palette,   section: "premium" },
  { id: "listing",              title: "Feature your server",     summary: "Build a public profile page and get a real backlink.",             icon: Sparkles,  section: "premium" },
]

// Single teaser row used for non-premium servers. Lives in its own array
// so the visible task list stays simple to assemble below.
const PREMIUM_PREVIEW_TASK: TaskMeta = {
  id: "premium_preview",
  title: "Premium features",
  summary: "Have a look at what's available with premium \u2014 no rush.",
  icon: Crown,
  section: "premium",
  optional: true,
}
// --- END AI-MODIFIED ---

type TaskStatus = "pending" | "done" | "skipped"

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: API now returns is_premium so the widget knows whether to render
// the full premium-features section or the single teaser row. Tasks record
// is keyed by string (not the TaskId union) because the API returns a
// dynamic subset depending on premium status.
interface ChecklistResponse {
  is_premium: boolean
  tasks: Record<string, { status: TaskStatus; configured: boolean }>
  completed_count: number
  skipped_count: number
  total: number
  all_done: boolean
}
// --- END AI-MODIFIED ---

interface Props {
  guildId: string
}

export default function SetupChecklist({ guildId }: Props) {
  const router = useRouter()
  const apiKey = `/api/dashboard/servers/${guildId}/setup-checklist`
  const { data, error, isLoading } = useDashboard<ChecklistResponse>(apiKey)
  const [openTask, setOpenTask] = useState<TaskId | null>(null)
  const [allDoneCollapsed, setAllDoneCollapsed] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const autoOpenedRef = useRef(false)
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: aria-live announcer for screen readers. Updated whenever a task
  //          flips state so users on assistive tech hear progress without
  //          having to navigate back to the progress bar each time.
  const [liveAnnouncement, setLiveAnnouncement] = useState("")
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Inline confirmation for the "I've already set this up" bulk-skip
  //          action. Two clicks instead of one so a slipped finger doesn't
  //          dismiss the entire checklist. The widget collapses to the
  //          "all done" state once the request resolves.
  const [confirmDismissAll, setConfirmDismissAll] = useState(false)
  const [bulkSkipping, setBulkSkipping] = useState(false)
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Build the visible task list dynamically based on the API's
  // `is_premium` flag. Premium guilds see the 8 core tasks + 7 premium
  // tasks; non-premium guilds see the 8 core tasks + the 1 premium_preview
  // teaser row. Memo so we don't reallocate on every render.
  const visibleTasks = useMemo<TaskMeta[]>(() => {
    if (!data) return CORE_TASKS
    if (data.is_premium) return [...CORE_TASKS, ...PREMIUM_TASKS]
    return [...CORE_TASKS, PREMIUM_PREVIEW_TASK]
  }, [data])
  // --- END AI-MODIFIED ---

  // Auto-scroll to the widget + open the first pending task when the bot DM
  // links here with ?setup=open. Only runs once per page load.
  useEffect(() => {
    if (autoOpenedRef.current) return
    if (router.query.setup !== "open") return
    if (!data || data.all_done) return
    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Use visibleTasks (depends on is_premium) so we don't try to
    // auto-open a premium task on a non-premium guild.
    const firstPending = visibleTasks.find((t) => data.tasks[t.id]?.status === "pending")
    // --- END AI-MODIFIED ---
    if (firstPending) {
      setOpenTask(firstPending.id)
      autoOpenedRef.current = true
      // Smooth-scroll the widget into view on the next paint
      requestAnimationFrame(() => {
        widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }
  }, [data, router.query.setup, visibleTasks])

  async function updateTaskStatus(task: TaskId, status: TaskStatus) {
    try {
      // Optimistic: snap the status so the UI feels instant.
      const next = (data && {
        ...data,
        tasks: { ...data.tasks, [task]: { ...data.tasks[task], status } },
      }) as ChecklistResponse | undefined
      if (next) {
        // --- AI-MODIFIED (2026-04-30) ---
        // Purpose: Count over visibleTasks so the optimistic update tracks
        // the same task set the API will return.
        const done = visibleTasks.filter((t) => next.tasks[t.id]?.status === "done").length
        const skipped = visibleTasks.filter((t) => next.tasks[t.id]?.status === "skipped").length
        next.completed_count = done
        next.skipped_count = skipped
        next.total = visibleTasks.length
        next.all_done = done + skipped === visibleTasks.length
        // --- END AI-MODIFIED ---
      }
      await dashboardMutate("PATCH", apiKey, { task, status })
      invalidate(apiKey)
      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Announce status changes to assistive tech.
      const meta = visibleTasks.find((t) => t.id === task)
      if (meta) {
        const verb = status === "done" ? "marked done" : status === "skipped" ? "skipped" : "reopened"
        const remaining = next ? next.total - next.completed_count - next.skipped_count : 0
        const tail = next?.all_done
          ? " Setup checklist complete."
          : remaining === 1
          ? " 1 task left."
          : ` ${remaining} tasks left.`
        setLiveAnnouncement(`${meta.title} ${verb}.${tail}`)
      }
      // --- END AI-MODIFIED ---
    } catch (err: any) {
      toast.error(err?.message || "Couldn't save \u2014 try again.")
    }
  }

  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Bulk-skip every still-pending task. Used by the "I've already
  // set this up" escape hatch in the header. Fires PATCH requests in
  // parallel so the round-trip is one network frame, not eight. The widget
  // self-collapses to the all-done state on the next render.
  async function bulkSkipAllPending() {
    if (!data) return
    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Use visibleTasks so non-premium guilds don't try to skip
    // premium task ids that aren't in their dataset.
    const pending = visibleTasks.filter((t) => (data.tasks[t.id]?.status ?? "pending") === "pending")
    // --- END AI-MODIFIED ---
    if (pending.length === 0) return
    setBulkSkipping(true)
    try {
      await Promise.all(
        pending.map((t) =>
          dashboardMutate("PATCH", apiKey, { task: t.id, status: "skipped" }),
        ),
      )
      invalidate(apiKey)
      setLiveAnnouncement(`Marked ${pending.length} remaining tasks as set up.`)
      toast.success("Hidden — re-open from the sidebar any time.")
      setConfirmDismissAll(false)
    } catch (err: any) {
      toast.error(err?.message || "Couldn't dismiss the checklist — try again.")
    } finally {
      setBulkSkipping(false)
    }
  }
  // --- END AI-MODIFIED ---

  function statusIcon(status: TaskStatus, configured: boolean) {
    if (status === "done") {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 motion-safe:animate-check-pop" aria-label="Done">
          <Check size={14} aria-hidden="true" />
        </span>
      )
    }
    if (status === "skipped") {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground" aria-label="Skipped">
          <Minus size={14} aria-hidden="true" />
        </span>
      )
    }
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 ${
          configured ? "border-amber-400/50 bg-amber-500/10" : "border-border bg-muted/40"
        }`}
        aria-label={configured ? "Already configured \u2014 review and confirm" : "Not yet"}
      >
        {configured && <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />}
      </span>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
        Couldn't load your setup checklist. <button onClick={() => invalidate(apiKey)} className="text-primary underline-offset-2 hover:underline">Retry</button>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div
        ref={widgetRef}
        className="rounded-xl border border-border bg-card/60 p-5 sm:p-6 animate-pulse"
        aria-busy="true"
      >
        <div className="h-5 w-48 bg-muted rounded mb-2" />
        <div className="h-3 w-72 bg-muted rounded mb-5" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/60 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // All done state \u2014 collapses to a small "you're set" card.
  if (data.all_done) {
    if (allDoneCollapsed) return null
    return (
      <div ref={widgetRef} className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400">
            <Check size={20} aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">You're all set.</h3>
            <p className="text-sm text-muted-foreground">
              Setup checklist is complete. You can revisit any of these from the dashboard sidebar.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`/dashboard/servers/${guildId}/ranks`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Ranks editor <ExternalLink size={11} aria-hidden="true" />
              </a>
              <a
                href={`/dashboard/servers/${guildId}/shop`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Shop editor <ExternalLink size={11} aria-hidden="true" />
              </a>
              <a
                href={`/dashboard/servers/${guildId}/role-menus`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Role menus <ExternalLink size={11} aria-hidden="true" />
              </a>
              <a
                href={`/dashboard/servers/${guildId}/settings`}
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground/80 px-3 py-1.5 rounded-md bg-muted hover:bg-accent transition-colors"
              >
                All settings
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAllDoneCollapsed(true)}
            className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors px-2 py-1"
            aria-label="Hide setup checklist"
          >
            Hide
          </button>
        </div>
      </div>
    )
  }

  const remaining = data.total - data.completed_count - data.skipped_count
  const progressPct = Math.round(((data.completed_count + data.skipped_count) / data.total) * 100)

  return (
    <>
      {/* --- AI-MODIFIED (2026-04-29) ---
          Purpose: Visually-hidden live region for SR announcements. The sr-only
          util is from the global tailwind setup (or @tailwindcss/forms). */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
      {/* --- END AI-MODIFIED --- */}
      <section
        ref={widgetRef}
        className="rounded-xl border border-border bg-card/60 overflow-hidden"
        aria-labelledby="setup-checklist-title"
      >
        {/* Header */}
        <header className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border bg-gradient-to-br from-card to-card/40">
          <div className="flex items-start gap-3 mb-3">
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15 text-primary">
              <ListChecks size={18} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <h2 id="setup-checklist-title" className="text-base sm:text-lg font-semibold text-foreground">
                Get your server ready
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {data.completed_count === 0 && data.skipped_count === 0
                  ? "A short list of things to set up. Skip anything you don't need — you can change all of it later."
                  : `Nice — keep going. ${data.completed_count + data.skipped_count} of ${data.total} done.`}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Setup progress: ${data.completed_count + data.skipped_count} of ${data.total} tasks`}
            className="h-1.5 w-full bg-muted rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              {remaining} left · {progressPct}%
            </span>
            {/* --- AI-MODIFIED (2026-04-29) ---
                Purpose: Escape hatch for established admins. The widget
                otherwise lingers forever for servers configured before this
                feature shipped (their setup_checklist_state JSON is empty).
                Two-step confirm so a slipped finger doesn't dismiss it.
                Lives in the progress footer row -- discoverable but not
                competing with the title for attention. */}
            {!confirmDismissAll ? (
              <button
                type="button"
                onClick={() => setConfirmDismissAll(true)}
                disabled={bulkSkipping}
                className="shrink-0 inline-flex items-center min-h-[32px] px-2 -mr-2 text-[11px] text-muted-foreground/90 hover:text-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md whitespace-nowrap"
              >
                I've already set this up
              </button>
            ) : (
              <div className="shrink-0 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmDismissAll(false)}
                  disabled={bulkSkipping}
                  className="inline-flex items-center min-h-[32px] px-2 text-[11px] text-muted-foreground hover:text-foreground/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={bulkSkipAllPending}
                  disabled={bulkSkipping}
                  className="inline-flex items-center min-h-[32px] px-2.5 text-[11px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md whitespace-nowrap disabled:opacity-60"
                >
                  {bulkSkipping ? "Hiding…" : "Yes, hide it"}
                </button>
              </div>
            )}
            {/* --- END AI-MODIFIED --- */}
          </div>
        </header>

        {/* --- AI-MODIFIED (2026-04-30) ---
            Purpose: Task list now renders in two visually-separated
            sections: Core (always shown) and Premium (the 7 features for
            premium guilds, or the 1 teaser row for non-premium). The
            section header for Premium includes a "X of 7 set up" sub-
            counter for premium guilds so the small per-section progress
            stays meaningful even though the main progress bar above
            tracks the entire list.
            --- Original code (commented out for rollback) ---
            <ul role="list" className="divide-y divide-border/60">
              {TASKS.map((task) => { ...static-list rendering... })}
            </ul>
            --- End original code --- */}
        <ul role="list" className="divide-y divide-border/60">
          {(() => {
            const renderedRows: React.ReactNode[] = []
            let lastSection: TaskMeta["section"] = undefined
            visibleTasks.forEach((task) => {
              if (task.section !== lastSection) {
                if (task.section === "premium") {
                  // Per-section sub-counter for premium guilds. Skipped for
                  // the non-premium teaser row -- single row doesn't need
                  // a "0 of 1 set up" counter.
                  const premiumDone = data?.is_premium
                    ? PREMIUM_TASKS.filter((t) => data.tasks[t.id]?.status === "done").length
                    : null
                  renderedRows.push(
                    <li key="__premium_header__" className="px-4 sm:px-6 py-2.5 bg-muted/20 border-y border-border/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Crown size={13} className="text-amber-400 shrink-0" aria-hidden="true" />
                        <span className="text-[11px] uppercase tracking-wide font-semibold text-foreground/80">
                          Premium features
                        </span>
                      </div>
                      {data?.is_premium && premiumDone !== null && (
                        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                          {premiumDone} of {PREMIUM_TASKS.length} set up
                        </span>
                      )}
                    </li>
                  )
                }
                lastSection = task.section
              }

              const taskState = data.tasks[task.id]
              const status = taskState?.status ?? "pending"
              const triggerId = `setup-task-trigger-${task.id}`
              const isPremiumRow = task.section === "premium" && task.id !== "premium_preview"
              renderedRows.push(
                <li key={task.id}>
                  <div className="flex items-stretch gap-3 px-4 sm:px-6 py-3">
                    <div className="shrink-0 self-center">{statusIcon(status, taskState?.configured ?? false)}</div>
                    <div className="flex-1 min-w-0 self-center">
                      <button
                        id={triggerId}
                        type="button"
                        onClick={() => setOpenTask(task.id)}
                        className="w-full text-left min-h-[44px] -my-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                        aria-label={`${task.title}: ${task.summary}. Status: ${status}.`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <task.icon
                            size={14}
                            className={
                              task.section === "premium"
                                ? "text-amber-400/85 shrink-0"
                                : "text-muted-foreground shrink-0"
                            }
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium text-foreground">{task.title}</span>
                          {/* Tiny premium pill on each premium row. Subtle,
                              not screaming. Skipped on the teaser row since
                              the section header already says "Premium". */}
                          {isPremiumRow && (
                            <span className="text-[10px] uppercase tracking-wide font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              Premium
                            </span>
                          )}
                          {task.optional && !isPremiumRow && (
                            <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              Optional
                            </span>
                          )}
                          {taskState?.configured && status === "pending" && (
                            <span className="text-[10px] uppercase tracking-wide font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              Already configured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{task.summary}</p>
                      </button>
                    </div>
                    <div className="shrink-0 self-center flex items-center gap-1">
                      {status === "pending" && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, "skipped")}
                          className="hidden sm:inline-flex items-center min-h-[44px] px-3 text-xs text-muted-foreground hover:text-foreground/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                        >
                          Skip
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setOpenTask(task.id)}
                        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                        aria-label={`Open ${task.title}`}
                      >
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })
            return renderedRows
          })()}
        </ul>
        {/* --- END AI-MODIFIED --- */}

        <PowerUserSection guildId={guildId} />
      </section>

      {/* Drawers \u2014 each task component owns its own form state and saves
           via its own endpoint. Widget just toggles open/close. */}
      <EssentialsTask
        guildId={guildId}
        open={openTask === "essentials"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("essentials", "done")}
        onSkip={() => updateTaskStatus("essentials", "skipped")}
      />
      <RanksTask
        guildId={guildId}
        open={openTask === "ranks"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("ranks", "done")}
        onSkip={() => updateTaskStatus("ranks", "skipped")}
      />
      <RewardsTask
        guildId={guildId}
        open={openTask === "rewards"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("rewards", "done")}
        onSkip={() => updateTaskStatus("rewards", "skipped")}
      />
      <WelcomeTask
        guildId={guildId}
        open={openTask === "welcome"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("welcome", "done")}
        onSkip={() => updateTaskStatus("welcome", "skipped")}
      />
      <NotificationsTask
        guildId={guildId}
        open={openTask === "notifications"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("notifications", "done")}
        onSkip={() => updateTaskStatus("notifications", "skipped")}
      />
      <FocusTask
        guildId={guildId}
        open={openTask === "focus"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("focus", "done")}
        onSkip={() => updateTaskStatus("focus", "skipped")}
      />
      <ScheduleTask
        guildId={guildId}
        open={openTask === "schedule"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("schedule", "done")}
        onSkip={() => updateTaskStatus("schedule", "skipped")}
      />
      <PetTask
        guildId={guildId}
        open={openTask === "pet"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("pet", "done")}
        onSkip={() => updateTaskStatus("pet", "skipped")}
      />
      {/* --- AI-MODIFIED (2026-04-30) ---
          Purpose: Mount the 8 new premium task drawers. They're cheap to
          render in their unopen state (just a portal-ready null), so
          unconditionally mounting them keeps the open/close logic simple
          and identical to the core 8 drawers above. Premium tasks won't
          show up in the task list for non-premium guilds, so non-premium
          users will never see these drawers; the teaser drawer
          (PremiumPreviewTask) handles that audience. */}
      <AntiAfkTask
        guildId={guildId}
        open={openTask === "anti_afk"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("anti_afk", "done")}
        onSkip={() => updateTaskStatus("anti_afk", "skipped")}
      />
      <BrandingTask
        guildId={guildId}
        open={openTask === "branding"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("branding", "done")}
        onSkip={() => updateTaskStatus("branding", "skipped")}
      />
      <AmbientSoundsTask
        guildId={guildId}
        open={openTask === "ambient_sounds"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("ambient_sounds", "done")}
        onSkip={() => updateTaskStatus("ambient_sounds", "skipped")}
      />
      <LeaderboardAutopostTask
        guildId={guildId}
        open={openTask === "leaderboard_autopost"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("leaderboard_autopost", "done")}
        onSkip={() => updateTaskStatus("leaderboard_autopost", "skipped")}
      />
      <PremiumPomodoroTask
        guildId={guildId}
        open={openTask === "premium_pomodoro"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("premium_pomodoro", "done")}
        onSkip={() => updateTaskStatus("premium_pomodoro", "skipped")}
      />
      <StickyMessagesTask
        guildId={guildId}
        open={openTask === "sticky_messages"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("sticky_messages", "done")}
        onSkip={() => updateTaskStatus("sticky_messages", "skipped")}
      />
      <ListingTask
        guildId={guildId}
        open={openTask === "listing"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("listing", "done")}
        onSkip={() => updateTaskStatus("listing", "skipped")}
      />
      <PremiumPreviewTask
        guildId={guildId}
        open={openTask === "premium_preview"}
        onClose={() => setOpenTask(null)}
        onComplete={() => updateTaskStatus("premium_preview", "done")}
        onSkip={() => updateTaskStatus("premium_preview", "skipped")}
      />
      {/* --- END AI-MODIFIED --- */}
    </>
  )
}

// Common shape every task component must implement so the widget can drive them.
export interface TaskComponentProps {
  guildId: string
  open: boolean
  onClose: () => void
  onComplete: () => void
  onSkip: () => void
}
