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
import PowerUserSection from "./PowerUserSection"

export type TaskId =
  | "essentials"
  | "ranks"
  | "rewards"
  | "welcome"
  | "notifications"
  | "focus"
  | "schedule"
  | "pet"

interface TaskMeta {
  id: TaskId
  title: string
  summary: string
  icon: LucideIcon
  // Some tasks are explicitly optional in the copy bank (Schedule, Pet).
  optional?: boolean
}

const TASKS: TaskMeta[] = [
  { id: "essentials",    title: "Server essentials",         summary: "Timezone + admin and moderator roles.",                          icon: Settings },
  { id: "ranks",         title: "How members rank up",       summary: "Voice time, messages, or XP \u2014 mix and match.",                       icon: Trophy },
  { id: "rewards",       title: "Member rewards",            summary: "How many LionCoins members earn from studying.",                  icon: Coins },
  { id: "welcome",       title: "Welcome new members",       summary: "Greet people when they join.",                                    icon: Hand },
  { id: "notifications", title: "Notification channels",     summary: "Where the bot sends logs, mod alerts and rank-up posts.",         icon: Bell },
  { id: "focus",         title: "Tasks and focus timer",     summary: "Reward members for tasks and Pomodoro sessions.",                 icon: Timer },
  { id: "schedule",      title: "Accountability sessions",   summary: "Optional. Members book a slot, show up, earn rewards.",           icon: Calendar, optional: true },
  { id: "pet",           title: "Pet game",                  summary: "Optional. LionGotchi pets that members raise by studying.",       icon: PawPrint, optional: true },
]

type TaskStatus = "pending" | "done" | "skipped"

interface ChecklistResponse {
  tasks: Record<TaskId, { status: TaskStatus; configured: boolean }>
  completed_count: number
  skipped_count: number
  total: number
  all_done: boolean
}

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

  // Auto-scroll to the widget + open the first pending task when the bot DM
  // links here with ?setup=open. Only runs once per page load.
  useEffect(() => {
    if (autoOpenedRef.current) return
    if (router.query.setup !== "open") return
    if (!data || data.all_done) return
    const firstPending = TASKS.find((t) => data.tasks[t.id]?.status === "pending")
    if (firstPending) {
      setOpenTask(firstPending.id)
      autoOpenedRef.current = true
      // Smooth-scroll the widget into view on the next paint
      requestAnimationFrame(() => {
        widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }
  }, [data, router.query.setup])

  async function updateTaskStatus(task: TaskId, status: TaskStatus) {
    try {
      // Optimistic: snap the status so the UI feels instant.
      const next = (data && {
        ...data,
        tasks: { ...data.tasks, [task]: { ...data.tasks[task], status } },
      }) as ChecklistResponse | undefined
      if (next) {
        const done = TASKS.filter((t) => next.tasks[t.id]?.status === "done").length
        const skipped = TASKS.filter((t) => next.tasks[t.id]?.status === "skipped").length
        next.completed_count = done
        next.skipped_count = skipped
        next.all_done = done + skipped === TASKS.length
      }
      await dashboardMutate("PATCH", apiKey, { task, status })
      invalidate(apiKey)
      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Announce status changes to assistive tech.
      const meta = TASKS.find((t) => t.id === task)
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
                  ? "A short list of things to set up. Skip anything you don't need \u2014 you can change all of it later."
                  : `Nice \u2014 keep going. ${data.completed_count + data.skipped_count} of ${data.total} done.`}
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
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{remaining} left</span>
            <span className="tabular-nums">{progressPct}%</span>
          </div>
        </header>

        {/* Task list */}
        <ul role="list" className="divide-y divide-border/60">
          {TASKS.map((task) => {
            const taskState = data.tasks[task.id]
            const status = taskState?.status ?? "pending"
            const triggerId = `setup-task-trigger-${task.id}`
            return (
              <li key={task.id}>
                <div className="flex items-stretch gap-3 px-4 sm:px-6 py-3">
                  <div className="shrink-0 self-center">{statusIcon(status, taskState?.configured ?? false)}</div>
                  <div className="flex-1 min-w-0 self-center">
                    <button
                      id={triggerId}
                      type="button"
                      onClick={() => setOpenTask(task.id)}
                      // 44px tap area achieved via min-h-[44px] and full row click target.
                      className="w-full text-left min-h-[44px] -my-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                      aria-label={`${task.title}: ${task.summary}. Status: ${status}.`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <task.icon size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="text-sm font-medium text-foreground">{task.title}</span>
                        {task.optional && (
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
                        // 44px tap area; muted styling so it doesn't compete with the primary CTA.
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
          })}
        </ul>

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
