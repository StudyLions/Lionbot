// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Live Session page - shows active voice/pomodoro session state,
//          room members' tasks, user's editable task list, and focus mode entry
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import CountdownRing from "@/components/dashboard/CountdownRing"
import { toast } from "@/components/dashboard/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/hooks/useDashboard"
import { useStageNotifications } from "@/hooks/useStageNotifications"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Radio, Clock, Users, CheckSquare, Plus, Check, Circle,
  Maximize2, ArrowLeft, Video, MonitorPlay, Trash2, X, Pencil,
  Bell, BellOff, Trophy, Timer,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface LiveSessionData {
  active: boolean
  session?: {
    channelId: string
    guildId: string
    guildName: string
    startTime: string
    currentMinutes: number
    isCamera: boolean
    isStream: boolean
    activity: string | null
  }
  pomodoro?: {
    stage: "focus" | "break"
    focusLength: number
    breakLength: number
    stageStartedAt: string
    stageEndsAt: string
    remainingSeconds: number
    stageDurationSeconds: number
    channelName: string
    cycleNumber: number
    lastStarted: string
  } | null
  roomMembers?: Array<{
    userId: string
    displayName: string
    avatarUrl: string | null
    activity: string | null
    startTime: string | null
    isCamera: boolean
    isStream: boolean
    tasks: Array<{ id: number; content: string; completed: boolean }>
  }>
  myTasks?: Array<{
    id: number
    content: string
    completed: boolean
    completedAt: string | null
    createdAt: string | null
    updatedAt: string | null
    parentId: number | null
    rewarded: boolean | null
  }>
}

function formatDuration(startTime: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`
  return `${m}m ${String(s).padStart(2, "0")}s`
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: format member study duration from startTime
function formatMemberDuration(startTime: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
// --- END AI-MODIFIED ---

export default function SessionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data, isLoading, mutate } = useDashboard<LiveSessionData>(
    session ? "/api/dashboard/live-session" : null,
    { refreshInterval: 10000 }
  )

  const [newTask, setNewTask] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [elapsed, setElapsed] = useState("")
  const [editingActivity, setEditingActivity] = useState(false)
  const [activityInput, setActivityInput] = useState("")
  const [pomRemaining, setPomRemaining] = useState(0)
  const addInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const activityInputRef = useRef<HTMLInputElement>(null)

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: stage change notifications + session summary tracking
  const notifications = useStageNotifications(data?.pomodoro?.stage ?? null)

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: cycle completion celebration glow on session page
  const prevCycleRef = useRef<number | null>(null)
  const [celebratingCycle, setCelebratingCycle] = useState(false)

  useEffect(() => {
    if (!data?.pomodoro) { prevCycleRef.current = null; return }
    if (prevCycleRef.current !== null && data.pomodoro.cycleNumber > prevCycleRef.current) {
      setCelebratingCycle(true)
      setTimeout(() => setCelebratingCycle(false), 1500)
    }
    prevCycleRef.current = data.pomodoro.cycleNumber
  }, [data?.pomodoro?.cycleNumber])
  // --- END AI-MODIFIED ---

  const lastActiveDataRef = useRef<LiveSessionData | null>(null)
  const [sessionSummary, setSessionSummary] = useState<{
    duration: string
    cycles: number | null
    tasksCompleted: number
  } | null>(null)

  useEffect(() => {
    if (data?.active) {
      lastActiveDataRef.current = data
      setSessionSummary(null)
    } else if (lastActiveDataRef.current?.active && data && !data.active) {
      const prev = lastActiveDataRef.current
      const startTime = prev.session?.startTime
      const duration = startTime ? formatDuration(startTime) : "0m"
      const cycles = prev.pomodoro?.cycleNumber ?? null
      const sessionStart = startTime ? new Date(startTime).getTime() : 0
      const tasksCompleted = (prev.myTasks ?? []).filter(
        (t) => t.completed && t.completedAt && new Date(t.completedAt).getTime() >= sessionStart
      ).length
      setSessionSummary({ duration, cycles, tasksCompleted })
      lastActiveDataRef.current = null
    }
  }, [data?.active])
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (!data?.session?.startTime) return
    const update = () => setElapsed(formatDuration(data.session!.startTime))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [data?.session?.startTime])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: track pomodoro remaining seconds client-side for tab title
  useEffect(() => {
    if (!data?.pomodoro) { setPomRemaining(0); return }
    setPomRemaining(data.pomodoro.remainingSeconds)
  }, [data?.pomodoro])

  useEffect(() => {
    if (pomRemaining > 0) {
      const interval = setInterval(() => setPomRemaining((r) => Math.max(0, r - 1)), 1000)
      return () => clearInterval(interval)
    }
  }, [pomRemaining > 0])

  useEffect(() => {
    if (!data?.active) return
    if (data.pomodoro && pomRemaining >= 0) {
      const mins = Math.floor(pomRemaining / 60)
      const secs = pomRemaining % 60
      const stage = data.pomodoro.stage === "focus" ? "Focus" : "Break"
      document.title = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} ${stage} - LionBot`
    } else if (elapsed) {
      document.title = `${elapsed} - Live Session - LionBot`
    }
    return () => { document.title = "Live Session - LionBot" }
  }, [data?.active, data?.pomodoro?.stage, pomRemaining, elapsed])
  // --- END AI-MODIFIED ---

  const setActivity = useCallback(async (tag: string | null) => {
    try {
      const res = await fetch("/api/dashboard/live-session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: tag }),
      })
      if (res.ok) {
        mutate()
        setEditingActivity(false)
        if (tag) toast.success("Activity set")
        else toast.success("Activity cleared")
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || "Failed to set activity")
      }
    } catch {
      toast.error("Failed to set activity")
    }
  }, [mutate])

  const addTask = useCallback(async () => {
    if (!newTask.trim() || adding) return
    setAdding(true)
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newTask.trim() }),
      })
      if (res.ok) {
        setNewTask("")
        mutate()
        toast.success("Task added")
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || "Failed to add task")
      }
    } catch {
      toast.error("Failed to add task")
    }
    setAdding(false)
  }, [newTask, adding, mutate])

  const toggleTask = useCallback(async (taskId: number, completed: boolean) => {
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed }),
      })
      if (res.ok) mutate()
      else toast.error("Failed to update task")
    } catch {
      toast.error("Failed to update task")
    }
  }, [mutate])

  const saveEdit = useCallback(async () => {
    if (editingId === null || !editContent.trim()) return
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: editingId, content: editContent.trim() }),
      })
      if (res.ok) {
        mutate()
        toast.success("Task updated")
      } else {
        toast.error("Failed to update task")
      }
    } catch {
      toast.error("Failed to update task")
    }
    setEditingId(null)
    setEditContent("")
  }, [editingId, editContent, mutate])

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })
      if (res.ok) {
        mutate()
        toast.success("Task deleted")
      } else {
        toast.error("Failed to delete task")
      }
    } catch {
      toast.error("Failed to delete task")
    }
  }, [mutate])

  const startEdit = (task: { id: number; content: string }) => {
    setEditingId(task.id)
    setEditContent(task.content)
    setTimeout(() => editInputRef.current?.focus(), 50)
  }

  const myTasks = data?.myTasks ?? []
  const activeTasks = useMemo(() => myTasks.filter((t) => !t.completed && !t.parentId), [myTasks])
  const completedTasks = useMemo(() => myTasks.filter((t) => t.completed && !t.parentId), [myTasks])
  const roomMembers = data?.roomMembers ?? []
  const membersWithTasks = useMemo(
    () => roomMembers.filter((m) => m.tasks.length > 0),
    [roomMembers]
  )

  return (
    <Layout SEO={{ title: "Live Session - LionBot", description: "Your active study session" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 space-y-6">
              {/* --- AI-MODIFIED (2026-03-16) --- */}
              {/* Purpose: session summary overlay when session ends */}
              {isLoading ? (
                <SessionSkeleton />
              ) : !data?.active && sessionSummary ? (
                <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <Trophy size={28} className="text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">Session Complete</h2>
                    <p className="text-sm text-muted-foreground">Great work! Here&apos;s your session summary.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md w-full">
                    <div className="rounded-xl border border-border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-foreground tabular-nums">{sessionSummary.duration}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Duration</p>
                    </div>
                    {sessionSummary.cycles !== null && (
                      <div className="rounded-xl border border-border bg-card p-4 text-center">
                        <p className="text-2xl font-bold text-foreground tabular-nums">{sessionSummary.cycles}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Cycles</p>
                      </div>
                    )}
                    <div className="rounded-xl border border-border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-foreground tabular-nums">{sessionSummary.tasksCompleted}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Tasks Done</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSessionSummary(null); router.push("/dashboard") }}
                    className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Overview
                  </button>
                </div>
              ) : !data?.active ? (
                <NoSession />
              ) : (
              /* --- END AI-MODIFIED --- */
                <>
                  {/* Session Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <h1 className="text-2xl font-bold text-foreground">Live Session</h1>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                        <span>{data.session!.guildName}</span>
                        {data.pomodoro && (
                          <>
                            <span className="text-border">|</span>
                            <span>{data.pomodoro.channelName}</span>
                          </>
                        )}
                        <span className="text-border">|</span>
                        <span className="font-mono tabular-nums">{elapsed}</span>
                        {data.session!.isCamera && (
                          <span className="flex items-center gap-1 text-blue-400 text-xs">
                            <Video size={12} /> Camera
                          </span>
                        )}
                        {data.session!.isStream && (
                          <span className="flex items-center gap-1 text-purple-400 text-xs">
                            <MonitorPlay size={12} /> Stream
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href="/dashboard">
                      <a className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                        onClick={() => sessionStorage.setItem("dismissed-session-redirect", "true")}>
                        <ArrowLeft size={14} /> Overview
                      </a>
                    </Link>
                  </div>

                  {/* Activity Tag */}
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                    <Pencil size={14} className="text-muted-foreground flex-shrink-0" />
                    {editingActivity ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          ref={activityInputRef}
                          type="text"
                          placeholder="What are you working on?"
                          value={activityInput}
                          onChange={(e) => setActivityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setActivity(activityInput.trim() || null)
                            if (e.key === "Escape") setEditingActivity(false)
                          }}
                          maxLength={10}
                          className="flex-1 bg-transparent text-sm text-foreground border-b border-primary/40 outline-none py-0.5"
                          autoFocus
                        />
                        <span className="text-[10px] text-muted-foreground tabular-nums">{activityInput.length}/10</span>
                        <button
                          onClick={() => setActivity(activityInput.trim() || null)}
                          className="text-xs text-primary hover:text-primary/80 font-medium"
                        >Save</button>
                        <button
                          onClick={() => setEditingActivity(false)}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                        ><X size={12} /></button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        {data.session!.activity ? (
                          <span className="text-sm text-foreground">{data.session!.activity}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground/60 italic">
                            What are you working on?
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setActivityInput(data.session!.activity || "")
                            setEditingActivity(true)
                          }}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {data.session!.activity ? "Edit" : "Set activity"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pomodoro Timer */}
                  {data.pomodoro && (
                    <div className={cn(
                      "relative rounded-2xl border p-6 flex flex-col items-center gap-4 transition-all duration-700",
                      data.pomodoro.stage === "focus"
                        ? "border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent"
                        : "border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent",
                      celebratingCycle && "ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/20"
                    )}>
                      <CountdownRing
                        totalSeconds={data.pomodoro.stageDurationSeconds}
                        remainingSeconds={data.pomodoro.remainingSeconds}
                        stage={data.pomodoro.stage}
                        size={180}
                      />
                      <div className="text-center space-y-1">
                        <p className={cn(
                          "text-xs font-bold uppercase tracking-[0.2em]",
                          data.pomodoro.stage === "focus" ? "text-amber-400" : "text-cyan-400"
                        )}>
                          {data.pomodoro.stage === "focus" ? "Focus Time" : "Break Time"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(data.pomodoro.focusLength / 60)}m focus / {Math.floor(data.pomodoro.breakLength / 60)}m break
                        </p>
                      </div>

                      {/* --- AI-MODIFIED (2026-03-16) --- */}
                      {/* Purpose: cycle counter dots + notification toggle */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(data.pomodoro.cycleNumber, 8) }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              i < data.pomodoro!.cycleNumber - 1
                                ? data.pomodoro!.stage === "focus" ? "bg-amber-400" : "bg-cyan-400"
                                : data.pomodoro!.stage === "focus"
                                  ? "bg-amber-400 animate-pulse"
                                  : "bg-cyan-400 animate-pulse"
                            )}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1 tabular-nums">
                          Cycle {data.pomodoro.cycleNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href="/dashboard/session/focus">
                          <a className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            data.pomodoro.stage === "focus"
                              ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                              : "bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25"
                          )}>
                            <Maximize2 size={14} /> Focus Mode
                          </a>
                        </Link>
                        <button
                          onClick={notifications.toggle}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                            notifications.enabled
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )}
                          title={notifications.enabled ? "Disable alerts" : "Enable stage change alerts"}
                        >
                          {notifications.enabled ? <Bell size={13} /> : <BellOff size={13} />}
                          {notifications.enabled ? "Alerts On" : "Alerts"}
                        </button>
                      </div>
                      {/* --- END AI-MODIFIED --- */}
                    </div>
                  )}

                  {/* Room Members */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <h2 className="text-base font-semibold text-foreground">
                        In This Room
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          {roomMembers.length + 1} {roomMembers.length === 0 ? "person" : "people"}
                        </span>
                      </h2>
                    </div>

                    {roomMembers.length === 0 ? (
                      <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                        You&apos;re the only one here right now.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* --- AI-MODIFIED (2026-03-16) --- */}
                        {/* Purpose: show study duration + camera/stream badges per member */}
                        {roomMembers.map((member) => (
                          <div key={member.userId} className="rounded-xl border border-border bg-card p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <Users size={14} className="text-muted-foreground" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground truncate">{member.displayName}</p>
                                  {member.isCamera && (
                                    <Video size={11} className="text-blue-400 flex-shrink-0" />
                                  )}
                                  {member.isStream && (
                                    <MonitorPlay size={11} className="text-purple-400 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {member.activity ? (
                                    <p className="text-[10px] text-primary/80 truncate">{member.activity}</p>
                                  ) : member.tasks.length > 0 ? (
                                    <p className="text-[10px] text-muted-foreground">
                                      {member.tasks.length} active task{member.tasks.length !== 1 ? "s" : ""}
                                    </p>
                                  ) : null}
                                  {member.startTime && (
                                    <span className="text-[10px] text-muted-foreground/60 tabular-nums flex-shrink-0">
                                      {formatMemberDuration(member.startTime)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* --- END AI-MODIFIED --- */}
                            {member.tasks.length > 0 && (
                              <div className="space-y-1.5 pl-1">
                                {member.tasks.slice(0, 5).map((task) => (
                                  <div key={task.id} className="flex items-start gap-2 text-sm">
                                    <Circle size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground leading-tight">{task.content}</span>
                                  </div>
                                ))}
                                {member.tasks.length > 5 && (
                                  <p className="text-[10px] text-muted-foreground/60 pl-5">
                                    +{member.tasks.length - 5} more
                                  </p>
                                )}
                              </div>
                            )}
                            {member.tasks.length === 0 && (
                              <p className="text-xs text-muted-foreground/60 italic">No tasks set</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* My Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={16} className="text-muted-foreground" />
                        <h2 className="text-base font-semibold text-foreground">
                          My Tasks
                          {activeTasks.length > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground font-normal">
                              {activeTasks.length} active
                            </span>
                          )}
                        </h2>
                      </div>
                      <Link href="/dashboard/tasks">
                        <a className="text-xs text-primary hover:text-primary/80 transition-colors">
                          Full Task List
                        </a>
                      </Link>
                    </div>

                    {/* Add Task */}
                    <div className="flex gap-2">
                      <input
                        ref={addInputRef}
                        type="text"
                        placeholder="Add a task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTask()}
                        maxLength={100}
                        className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                      />
                      <button
                        onClick={addTask}
                        disabled={adding || !newTask.trim()}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>

                    {/* Active Tasks */}
                    <div className="rounded-xl border border-border bg-card divide-y divide-border">
                      {activeTasks.length === 0 && completedTasks.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          No tasks yet. Add one above to get started!
                        </div>
                      ) : (
                        <>
                          {activeTasks.map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              editingId={editingId}
                              editContent={editContent}
                              editInputRef={editInputRef}
                              onToggle={() => toggleTask(task.id, true)}
                              onStartEdit={() => startEdit(task)}
                              onSetEditContent={setEditContent}
                              onSaveEdit={saveEdit}
                              onCancelEdit={() => { setEditingId(null); setEditContent("") }}
                              onDelete={() => deleteTask(task.id)}
                            />
                          ))}
                          {completedTasks.length > 0 && (
                            <div className="px-4 py-2 bg-muted/20">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                                Completed ({completedTasks.length})
                              </p>
                            </div>
                          )}
                          {completedTasks.slice(0, 5).map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              editingId={editingId}
                              editContent={editContent}
                              editInputRef={editInputRef}
                              onToggle={() => toggleTask(task.id, false)}
                              onStartEdit={() => startEdit(task)}
                              onSetEditContent={setEditContent}
                              onSaveEdit={saveEdit}
                              onCancelEdit={() => { setEditingId(null); setEditContent("") }}
                              onDelete={() => deleteTask(task.id)}
                            />
                          ))}
                          {completedTasks.length > 5 && (
                            <div className="px-4 py-2 text-xs text-muted-foreground text-center">
                              +{completedTasks.length - 5} more completed &middot;{" "}
                              <Link href="/dashboard/tasks">
                                <a className="text-primary hover:underline">View all</a>
                              </Link>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Progress */}
                    {myTasks.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {myTasks.filter((t) => t.completed).length} / {myTasks.length} done
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${(myTasks.filter((t) => t.completed).length / myTasks.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

function TaskRow({
  task,
  editingId,
  editContent,
  editInputRef,
  onToggle,
  onStartEdit,
  onSetEditContent,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  task: { id: number; content: string; completed: boolean }
  editingId: number | null
  editContent: string
  editInputRef: React.RefObject<HTMLInputElement>
  onToggle: () => void
  onStartEdit: () => void
  onSetEditContent: (v: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}) {
  const isEditing = editingId === task.id
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 group hover:bg-muted/20 transition-colors">
      <button
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
          task.completed
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-border hover:border-primary"
        )}
      >
        {task.completed && <Check size={10} strokeWidth={3} />}
      </button>
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          value={editContent}
          onChange={(e) => onSetEditContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit()
            if (e.key === "Escape") onCancelEdit()
          }}
          onBlur={onSaveEdit}
          maxLength={100}
          className="flex-1 bg-transparent text-sm text-foreground border-b border-primary/40 outline-none py-0.5"
        />
      ) : (
        <span
          onClick={onStartEdit}
          className={cn(
            "flex-1 text-sm cursor-text",
            task.completed ? "line-through text-muted-foreground/60" : "text-foreground"
          )}
        >
          {task.content}
        </span>
      )}
      <button
        onClick={onDelete}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function NoSession() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
        <Radio size={28} className="text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">No Active Session</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Join a voice channel in any server with LionBot to see your live session here.
          Your study time, room members, and tasks will appear automatically.
        </p>
      </div>
      <Link href="/dashboard">
        <a className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={14} /> Back to Overview
        </a>
      </Link>
    </div>
  )
}

function SessionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
