// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Goals page - weekly and monthly study goals
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full redesign - radial progress, all goal types, checklist CRUD, period nav,
//          cross-server summary, streaks, attendance, inline editing, celebrations
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { EmptyState, ConfirmModal, toast, DashboardShell, PageHeader } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useCallback, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import TabBar from "@/components/dashboard/ui/TabBar"
import {
  Target, ChevronLeft, ChevronRight, Flame, Trophy, BookOpen,
  MessageSquare, CheckSquare, Plus, Trash2, Check, X, Pencil, Calendar,
  Users,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- Types ---

interface GoalTask { id: number; content: string; completed: boolean }
interface Attendance { booked: number; attended: number }

interface GoalItem {
  guildId: string
  serverName: string
  periodId: number
  studyGoal: number | null
  taskGoal: number | null
  messageGoal: number | null
  studyProgress: number
  tasksProgress: number
  messageProgress: number
  attendance: Attendance
  goalTasks: GoalTask[]
}

interface GoalsSummary {
  totalStudyHours: number
  totalTasksDone: number
  totalMessages: number
  serversWithGoals: number
  goalsSet: number
  goalsMet: number
  allGoalsMet: boolean
}

interface GoalsData {
  weekId: number
  monthId: number
  weekOffset: number
  monthOffset: number
  weekLabel: string
  monthLabel: string
  canGoBack: { weekly: boolean; monthly: boolean }
  canGoForward: { weekly: boolean; monthly: boolean }
  weekly: GoalItem[]
  monthly: GoalItem[]
  summary: GoalsSummary
  streaks: { weeklyStreak: number; monthlyStreak: number }
}

type PeriodTab = "weekly" | "monthly"

// --- Radial Progress Component ---

function RadialProgress({
  value, max, label, unit, size = 80, strokeWidth = 6,
}: {
  value: number; max: number | null; label: string; unit: string
  size?: number; strokeWidth?: number
}) {
  const pct = max && max > 0 ? Math.min(100, (value / max) * 100) : 0
  const isComplete = max != null && max > 0 && value >= max
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const color = isComplete ? "stroke-emerald-500" : pct >= 50 ? "stroke-amber-400" : "stroke-muted-foreground/30"
  const textColor = isComplete ? "text-emerald-400" : "text-foreground"

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            className="stroke-muted/30" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            className={cn(color, "transition-all duration-700")}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-sm font-bold leading-none", textColor)}>
            {max != null && max > 0 ? value : "—"}
          </span>
          {max != null && max > 0 && (
            <span className="text-[9px] text-muted-foreground">/{max}{unit}</span>
          )}
        </div>
        {isComplete && (
          <div className="absolute -top-1 -right-1">
            <Check size={14} className="text-emerald-400 bg-background rounded-full" />
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
  )
}

// --- Main Component ---

export default function GoalsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<PeriodTab>("weekly")
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [editingGuild, setEditingGuild] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ study: string; task: string; message: string }>({ study: "", task: "", message: "" })
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null)
  const [newTaskContent, setNewTaskContent] = useState("")

  const offset = tab === "weekly" ? weekOffset : monthOffset
  const queryParams = `weekOffset=${weekOffset}&monthOffset=${monthOffset}`
  const { data, isLoading: loading, mutate } = useDashboard<GoalsData>(
    session ? `/api/dashboard/goals?${queryParams}` : null
  )

  const goals = tab === "weekly" ? (data?.weekly ?? []) : (data?.monthly ?? [])
  const summary = data?.summary ?? null
  const streaks = data?.streaks ?? { weeklyStreak: 0, monthlyStreak: 0 }
  const periodLabel = tab === "weekly" ? data?.weekLabel : data?.monthLabel
  const canGoBack = tab === "weekly" ? data?.canGoBack?.weekly : data?.canGoBack?.monthly
  const canGoForward = tab === "weekly" ? data?.canGoForward?.weekly : data?.canGoForward?.monthly

  // Navigation
  const goBack = () => tab === "weekly" ? setWeekOffset(o => o - 1) : setMonthOffset(o => o - 1)
  const goForward = () => tab === "weekly" ? setWeekOffset(o => o + 1) : setMonthOffset(o => o + 1)
  const goToCurrent = () => { setWeekOffset(0); setMonthOffset(0) }

  // Toggle goal task
  const toggleTask = useCallback(async (taskId: number) => {
    try {
      await fetch("/api/dashboard/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_task", taskId, type: tab }),
      })
      mutate()
    } catch { toast.error("Failed to toggle task") }
  }, [tab, mutate])

  // Add goal task
  const addTask = useCallback(async (guildId: string, periodId: number) => {
    if (!newTaskContent.trim()) return
    try {
      const res = await fetch("/api/dashboard/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_task", guildId, periodId, type: tab,
          content: newTaskContent.trim(),
        }),
      })
      if (res.ok) {
        setNewTaskContent("")
        setAddingTaskFor(null)
        mutate()
        toast.success("Goal added")
      }
    } catch { toast.error("Failed to add goal") }
  }, [newTaskContent, tab, mutate])

  // Delete goal task
  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await fetch("/api/dashboard/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, type: tab }),
      })
      mutate()
      toast.success("Goal removed")
    } catch { toast.error("Failed to remove goal") }
  }, [tab, mutate])

  // Save edited goal values
  const saveGoals = useCallback(async (guildId: string, periodId: number) => {
    try {
      const body: any = {
        guildId, type: tab,
        study_goal: editValues.study ? Number(editValues.study) : null,
        task_goal: editValues.task ? Number(editValues.task) : null,
        message_goal: editValues.message ? Number(editValues.message) : null,
      }
      if (tab === "weekly") body.weekid = periodId
      else body.monthid = periodId

      const res = await fetch("/api/dashboard/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setEditingGuild(null)
        mutate()
        toast.success("Goals updated")
      }
    } catch { toast.error("Failed to save goals") }
  }, [editValues, tab, mutate])

  const startEditing = (g: GoalItem) => {
    setEditingGuild(g.guildId)
    setEditValues({
      study: g.studyGoal?.toString() ?? "",
      task: g.taskGoal?.toString() ?? "",
      message: g.messageGoal?.toString() ?? "",
    })
  }

  const isCurrent = weekOffset === 0 && monthOffset === 0

  return (
    <Layout SEO={{ title: "Goals - LionBot Dashboard", description: "Track your study goals" }}>
      <AdminGuard>
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to DashboardShell layout wrapper */}
        {/* Original: <div className="min-h-screen ..."><div className="max-w-6xl ..."><DashboardNav /><div className="flex-1 min-w-0 max-w-3xl space-y-5"> */}
        <DashboardShell nav={<DashboardNav />} className="max-w-3xl space-y-5">

              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Migrated to shared PageHeader component for consistency */}
              {/* What the new code does better: Consistent page header styling with breadcrumbs */}
              {/* --- Original code (commented out for rollback) --- */}
              {/* <div>
                <h1 className="text-2xl font-bold text-foreground">Goals</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Set targets, track progress, and build consistent study habits.
                </p>
              </div> */}
              {/* --- End original code --- */}
              <PageHeader
                title="Goals"
                description="Set targets, track progress, and build consistent study habits."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Goals" },
                ]}
              />
              {/* --- END AI-REPLACED --- */}

              {/* Summary Card */}
              {summary && goals.length > 0 && tab === "weekly" && isCurrent && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Overall ring */}
                    <RadialProgress
                      value={summary.goalsMet} max={summary.goalsSet || null}
                      label="Goals Met" unit="" size={72} strokeWidth={5}
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-semibold text-foreground">
                        {summary.goalsSet > 0
                          ? `${summary.goalsMet} of ${summary.goalsSet} goals met this week`
                          : "No goals set this week"}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{summary.totalStudyHours}h studied</span>
                        <span>{summary.totalTasksDone} tasks</span>
                        {summary.totalMessages > 0 && <span>{summary.totalMessages} messages</span>}
                        <span>{summary.serversWithGoals} server{summary.serversWithGoals !== 1 ? "s" : ""}</span>
                      </div>
                      {/* Streaks */}
                      <div className="flex gap-3">
                        {streaks.weeklyStreak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                            <Flame size={12} /> {streaks.weeklyStreak}-week streak
                          </span>
                        )}
                        {streaks.monthlyStreak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                            <Flame size={12} /> {streaks.monthlyStreak}-month streak
                          </span>
                        )}
                      </div>
                    </div>
                    {summary.allGoalsMet && summary.goalsSet > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                        <Trophy size={14} className="text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">All goals met!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Period Navigation */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Tab switcher */}
                {/* --- AI-REPLACED (2026-03-24) ---
                    Reason: Migrated from custom segmented control to shared TabBar component
                    --- Original code (commented out for rollback) ---
                    <div className="flex items-center bg-muted/30 rounded-lg p-0.5 gap-0.5">
                      <button onClick={() => setTab("weekly")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", ...)}>Weekly</button>
                      <button onClick={() => setTab("monthly")} className={cn(...)}>Monthly</button>
                    </div>
                    --- End original code --- */}
                <TabBar
                  tabs={[
                    { key: "weekly", label: "Weekly" },
                    { key: "monthly", label: "Monthly" },
                  ]}
                  active={tab}
                  onChange={(k) => setTab(k as PeriodTab)}
                  variant="pills"
                />
                {/* --- END AI-REPLACED --- */}

                {/* Period arrows */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={goBack}
                    disabled={!canGoBack}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-medium text-foreground min-w-[140px] text-center">
                    {periodLabel || "..."}
                  </span>
                  <button
                    onClick={goForward}
                    disabled={!canGoForward}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  {!isCurrent && (
                    <button
                      onClick={goToCurrent}
                      className="ml-1 px-2 py-1 rounded-md text-[10px] text-primary hover:bg-primary/10 transition-colors"
                    >
                      Current
                    </button>
                  )}
                </div>
              </div>

              {/* Goal Cards */}
              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Replaced custom animate-pulse divs with shared Skeleton component */}
              {/* What the new code does better: Consistent loading states using the shared Skeleton component */}
              {/* --- Original code (commented out for rollback) --- */}
              {/* loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                      <div className="flex gap-6 justify-center">
                        {[1, 2, 3].map(j => <div key={j} className="w-16 h-16 rounded-full bg-muted" />)}
                      </div>
                    </div>
                  ))}
                </div> */}
              {/* --- End original code --- */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-card rounded-xl border border-border p-6">
                      <Skeleton className="h-4 w-1/3 mb-4" />
                      <div className="flex gap-6 justify-center">
                        {[1, 2, 3].map(j => <Skeleton key={j} className="w-16 h-16 rounded-full" />)}
                      </div>
                    </div>
                  ))}
                  {/* --- END AI-REPLACED --- */}
                </div>
              ) : goals.length === 0 ? (
                <EmptyState
                  icon={<Target size={48} strokeWidth={1} className="text-muted-foreground" />}
                  title={isCurrent ? "No goals set yet" : "No goals for this period"}
                  description={isCurrent
                    ? "Set study goals in Discord using LionBot commands, or navigate to past weeks to see your history."
                    : "Navigate to the current period to set goals, or go further back to see older goals."}
                />
              ) : (
                <div className="space-y-4">
                  {goals.map(g => {
                    const isEditing = editingGuild === g.guildId
                    const allMet = (
                      (!g.studyGoal || g.studyGoal <= 0 || g.studyProgress >= g.studyGoal) &&
                      (!g.taskGoal || g.taskGoal <= 0 || g.tasksProgress >= g.taskGoal) &&
                      (!g.messageGoal || g.messageGoal <= 0 || g.messageProgress >= g.messageGoal)
                    )
                    const hasAnyGoal = (g.studyGoal && g.studyGoal > 0) || (g.taskGoal && g.taskGoal > 0) || (g.messageGoal && g.messageGoal > 0)

                    return (
                      <div
                        key={g.guildId}
                        className={cn(
                          "bg-card rounded-xl border p-4 transition-all",
                          allMet && hasAnyGoal
                            ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                            : "border-border"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">{g.serverName}</span>
                            {allMet && hasAnyGoal && (
                              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
                                <Trophy size={10} /> All met
                              </span>
                            )}
                          </div>
                          {isCurrent && !isEditing && (
                            <button
                              onClick={() => startEditing(g)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                              title="Edit goals"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                        </div>

                        {/* Radial Progress Row */}
                        {isEditing ? (
                          <div className="space-y-3 mb-4">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] text-muted-foreground block mb-1">Study hours</label>
                                <input
                                  type="number" min="0" step="1"
                                  value={editValues.study}
                                  onChange={e => setEditValues(v => ({ ...v, study: e.target.value }))}
                                  className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground block mb-1">Tasks</label>
                                <input
                                  type="number" min="0" step="1"
                                  value={editValues.task}
                                  onChange={e => setEditValues(v => ({ ...v, task: e.target.value }))}
                                  className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground block mb-1">Messages</label>
                                <input
                                  type="number" min="0" step="1"
                                  value={editValues.message}
                                  onChange={e => setEditValues(v => ({ ...v, message: e.target.value }))}
                                  className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingGuild(null)}
                                className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveGoals(g.guildId, g.periodId)}
                                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4">
                            <RadialProgress
                              value={g.studyProgress} max={g.studyGoal}
                              label="Study" unit="h"
                            />
                            <RadialProgress
                              value={g.tasksProgress} max={g.taskGoal}
                              label="Tasks" unit=""
                            />
                            <RadialProgress
                              value={g.messageProgress} max={g.messageGoal}
                              label="Messages" unit=""
                            />
                          </div>
                        )}

                        {/* Attendance */}
                        {g.attendance.booked > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Users size={10} /> Attendance
                              </span>
                              <span className="text-foreground/80">{g.attendance.attended} / {g.attendance.booked}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  g.attendance.attended >= g.attendance.booked ? "bg-emerald-500" : "bg-amber-400"
                                )}
                                style={{ width: `${Math.min(100, (g.attendance.attended / g.attendance.booked) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Goal Tasks Checklist */}
                        {(g.goalTasks.length > 0 || (isCurrent && addingTaskFor === g.guildId)) && (
                          <div className="border-t border-border/50 pt-3 mt-1">
                            <p className="text-[10px] text-muted-foreground font-medium mb-2">
                              {tab === "weekly" ? "Goals of the Week" : "Goals of the Month"}
                            </p>
                            <div className="space-y-1">
                              {g.goalTasks.map(t => (
                                <div key={t.id} className="group flex items-center gap-2 py-1 px-1 rounded hover:bg-muted/20 transition-colors">
                                  <button
                                    onClick={() => toggleTask(t.id)}
                                    className="flex-shrink-0"
                                  >
                                    <div className={cn(
                                      "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                      t.completed
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "border-muted-foreground/30 hover:border-emerald-500"
                                    )}>
                                      {t.completed && <Check size={10} strokeWidth={3} />}
                                    </div>
                                  </button>
                                  <span className={cn(
                                    "flex-1 text-xs",
                                    t.completed ? "line-through text-muted-foreground" : "text-foreground"
                                  )}>
                                    {t.content}
                                  </span>
                                  {isCurrent && (
                                    <button
                                      onClick={() => deleteTask(t.id)}
                                      className="p-0.5 text-muted-foreground/30 hover:text-destructive lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add task inline */}
                        {isCurrent && addingTaskFor === g.guildId ? (
                          <div className="flex items-center gap-2 mt-2 px-1">
                            <input
                              type="text"
                              value={newTaskContent}
                              onChange={e => setNewTaskContent(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") addTask(g.guildId, g.periodId)
                                if (e.key === "Escape") { setAddingTaskFor(null); setNewTaskContent("") }
                              }}
                              placeholder="Add a goal..."
                              maxLength={200}
                              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none border-b border-border pb-1"
                              autoFocus
                            />
                            <button
                              onClick={() => addTask(g.guildId, g.periodId)}
                              disabled={!newTaskContent.trim()}
                              className="text-emerald-500 hover:text-emerald-400 disabled:text-muted-foreground p-0.5"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => { setAddingTaskFor(null); setNewTaskContent("") }}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : isCurrent && (
                          <button
                            onClick={() => { setAddingTaskFor(g.guildId); setNewTaskContent("") }}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground mt-2 px-1 transition-colors"
                          >
                            <Plus size={10} /> Add goal
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
