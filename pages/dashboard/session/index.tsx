// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Live Session page - shows active voice/pomodoro session state,
//          room members' tasks, user's editable task list, and focus mode entry
// ============================================================
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Migrated hardcoded gray-* Tailwind colors to semantic design tokens
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import CountdownRing from "@/components/dashboard/CountdownRing"
import { toast, DashboardShell, PageHeader } from "@/components/dashboard/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/hooks/useDashboard"
import { useStageNotifications } from "@/hooks/useStageNotifications"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Add icons for inline room controls + owner panel
import {
  Radio, Clock, Users, CheckSquare, Plus, Check, Circle,
  Maximize2, ArrowLeft, Video, MonitorPlay, Trash2, X, Pencil,
  Bell, BellOff, Trophy, Timer, Coins, DoorOpen,
  Crown, UserMinus, ChevronDown, ChevronUp, ExternalLink, PencilLine, Settings,
  Play, Square,
} from "lucide-react"
// --- END AI-MODIFIED ---
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Add privateRoom type to LiveSessionData for inline room controls
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
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Extended pomodoro type with room timer ownership flags and stopped state
  pomodoro?: {
    stage: "focus" | "break" | "stopped"
    focusLength: number
    breakLength: number
    stageStartedAt: string | null
    stageEndsAt: string | null
    remainingSeconds: number
    stageDurationSeconds: number
    channelName: string
    cycleNumber: number
    lastStarted: string | null
    isRoomTimer?: boolean
    timerOwnerMatch?: boolean
  } | null
  roomTimerFlags?: {
    isRoomChannel: boolean
    isRoomOwner: boolean
    hasTimer: boolean
  }
  // --- END AI-MODIFIED ---
  privateRoom?: {
    channelId: string
    name: string | null
    coinBalance: number
    rentPrice: number
    daysRemaining: number
    isOwner: boolean
    ownerId: string
    nextTick: string | null
    createdAt: string | null
    memberCount: number
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
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Room detail type for owner control panel
interface RoomDetailData {
  channelId: string; name: string | null; coinBalance: number; rentPrice: number
  daysRemaining: number; memberCap: number; ownerId: string
  createdAt: string | null; nextTick: string | null
  members: Array<{
    userId: string; displayName: string; avatarUrl: string | null
    isOwner: boolean; totalStudySeconds: number; contribution: number; coinBalance: number
  }>
}
// --- END AI-MODIFIED ---

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

  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: State and handler for inline room deposit from session page
  const [showRoomDeposit, setShowRoomDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [depositing, setDepositing] = useState(false)

  const handleQuickDeposit = useCallback(async (days: number) => {
    if (!data?.privateRoom) return
    setDepositing(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${data.privateRoom.channelId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Deposit failed")
      toast.success(`Deposited ${result.deposited} coins! (${result.newDaysRemaining} days remaining)`)
      mutate()
      setShowRoomDeposit(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDepositing(false)
    }
  }, [data?.privateRoom, mutate])

  const handleCustomDeposit = useCallback(async () => {
    if (!data?.privateRoom || !depositAmount) return
    const amt = Number(depositAmount)
    if (amt <= 0 || !Number.isFinite(amt)) return
    setDepositing(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${data.privateRoom.channelId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.floor(amt) }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Deposit failed")
      toast.success(`Deposited ${result.deposited} coins! (${result.newDaysRemaining} days remaining)`)
      mutate()
      setShowRoomDeposit(false)
      setDepositAmount("")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDepositing(false)
    }
  }, [data?.privateRoom, depositAmount, mutate])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Owner panel state -- fetch room detail when in own room
  const isRoomOwner = data?.privateRoom?.isOwner ?? false
  const roomChannelId = data?.privateRoom?.channelId
  const { data: roomDetail, mutate: mutateRoom } = useDashboard<RoomDetailData>(
    isRoomOwner && roomChannelId ? `/api/dashboard/rooms/${roomChannelId}` : null
  )
  const [showOwnerPanel, setShowOwnerPanel] = useState(true)
  const [editingRoomName, setEditingRoomName] = useState(false)
  const [roomNameInput, setRoomNameInput] = useState("")
  const [savingRoomName, setSavingRoomName] = useState(false)

  const handleRoomRename = useCallback(async () => {
    if (!roomChannelId || !roomNameInput.trim()) return
    setSavingRoomName(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${roomChannelId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomNameInput.trim() }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Rename failed")
      toast.success("Room renamed! Bot will sync on next tick.")
      setEditingRoomName(false)
      mutateRoom(); mutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setSavingRoomName(false) }
  }, [roomChannelId, roomNameInput, mutateRoom, mutate])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Timer controls state and handlers for room owner panel
  const canManageTimer = data?.roomTimerFlags?.isRoomOwner ?? data?.pomodoro?.timerOwnerMatch ?? false
  const hasRoomTimer = data?.roomTimerFlags?.hasTimer ?? !!data?.pomodoro
  const [timerCreating, setTimerCreating] = useState(false)
  const [timerEditing, setTimerEditing] = useState(false)
  const [timerFocus, setTimerFocus] = useState(25)
  const [timerBreak, setTimerBreak] = useState(5)
  const [timerAutoRestart, setTimerAutoRestart] = useState(false)
  const [timerLoading, setTimerLoading] = useState(false)

  const handleTimerCreate = useCallback(async () => {
    if (!roomChannelId) return
    setTimerLoading(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${roomChannelId}/timer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusMinutes: timerFocus, breakMinutes: timerBreak, autoRestart: timerAutoRestart }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed to create timer")
      toast.success("Timer created!")
      setTimerCreating(false)
      mutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setTimerLoading(false) }
  }, [roomChannelId, timerFocus, timerBreak, timerAutoRestart, mutate])

  const handleTimerEdit = useCallback(async () => {
    if (!roomChannelId) return
    setTimerLoading(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${roomChannelId}/timer`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusMinutes: timerFocus, breakMinutes: timerBreak, autoRestart: timerAutoRestart }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed to update timer")
      toast.success("Timer updated!")
      setTimerEditing(false)
      mutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setTimerLoading(false) }
  }, [roomChannelId, timerFocus, timerBreak, timerAutoRestart, mutate])

  const handleTimerStartStop = useCallback(async (action: "start" | "stop") => {
    if (!roomChannelId) return
    setTimerLoading(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${roomChannelId}/timer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || `Failed to ${action} timer`)
      toast.success(action === "start" ? "Timer started!" : "Timer stopped!")
      mutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setTimerLoading(false) }
  }, [roomChannelId, mutate])

  const handleTimerDelete = useCallback(async () => {
    if (!roomChannelId || !confirm("Delete this timer?")) return
    setTimerLoading(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${roomChannelId}/timer`, { method: "DELETE" })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed to delete timer")
      toast.success("Timer deleted")
      mutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setTimerLoading(false) }
  }, [roomChannelId, mutate])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: stage change notifications + session summary tracking
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Filter out "stopped" stage since notifications only apply to focus/break
  const pomodoroStageForNotifications = data?.pomodoro?.stage === "focus" || data?.pomodoro?.stage === "break" ? data.pomodoro.stage : null
  const notifications = useStageNotifications(pomodoroStageForNotifications)
  // --- END AI-MODIFIED ---

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
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to DashboardShell layout wrapper */}
        {/* Original: <div className="min-h-screen ..."><div className="max-w-6xl ..."><DashboardNav /><div className="flex-1 min-w-0 space-y-6"> */}
        <DashboardShell nav={<DashboardNav />}>
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
                  {/* --- AI-REPLACED (2026-03-24) --- */}
                  {/* Reason: Migrated to shared PageHeader component for consistency */}
                  {/* What the new code does better: Consistent page header styling with breadcrumbs */}
                  {/* --- Original code (commented out for rollback) --- */}
                  {/* <div className="flex items-start justify-between gap-4 flex-wrap">
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
                        ... room, pomodoro, elapsed, camera/stream badges ...
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      ... room balance, deposit, overview link ...
                    </div>
                  </div> */}
                  {/* --- End original code --- */}
                  <PageHeader
                    title="Live Session"
                    breadcrumbs={[
                      { label: "Dashboard", href: "/dashboard" },
                      { label: "Live Session" },
                    ]}
                    actions={
                      <div className="flex items-center gap-3">
                        {data.privateRoom && (
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border",
                              data.privateRoom.daysRemaining > 7
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : data.privateRoom.daysRemaining > 3
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>
                              <Coins size={12} /> {data.privateRoom.coinBalance.toLocaleString()}
                              <span className="text-[10px] opacity-70 ml-0.5">
                                ({data.privateRoom.daysRemaining}d)
                              </span>
                            </span>
                            <button
                              onClick={() => setShowRoomDeposit(!showRoomDeposit)}
                              className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-600/80 text-white hover:bg-amber-500 transition-colors"
                            >
                              Deposit
                            </button>
                          </div>
                        )}
                        <Link href="/dashboard">
                          <a className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                            onClick={() => sessionStorage.setItem("dismissed-session-redirect", "true")}>
                            <ArrowLeft size={14} /> Overview
                          </a>
                        </Link>
                      </div>
                    }
                  />
                  <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground -mt-4">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span>{data.session!.guildName}</span>
                    {data.privateRoom && (
                      <>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1 text-blue-400">
                          <DoorOpen size={12} /> {data.privateRoom.name || "Private Room"}
                        </span>
                      </>
                    )}
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
                  {/* --- END AI-REPLACED --- */}
                  {/* Room Deposit Panel (inline) */}
                  {data.privateRoom && showRoomDeposit && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-300 flex items-center gap-1.5">
                          <Coins size={14} /> Quick Deposit
                        </span>
                        <button onClick={() => setShowRoomDeposit(false)} className="text-muted-foreground hover:text-foreground">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[7, 14, 30].map((d) => (
                          <button
                            key={d}
                            disabled={depositing}
                            onClick={() => handleQuickDeposit(d)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20 transition-colors disabled:opacity-50"
                          >
                            +{d} days
                            <span className="ml-1 text-muted-foreground">= {d * data.privateRoom!.rentPrice}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number" min="1" placeholder="Custom amount"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCustomDeposit()}
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:outline-none"
                        />
                        <button
                          disabled={depositing || !depositAmount || Number(depositAmount) <= 0}
                          onClick={handleCustomDeposit}
                          className="px-4 py-1.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
                        >
                          Deposit
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Room expiry warning */}
                  {data.privateRoom && data.privateRoom.daysRemaining <= 3 && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                      data.privateRoom.daysRemaining <= 1
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}>
                      <Clock size={12} />
                      {data.privateRoom.daysRemaining <= 0
                        ? "Your room will expire on the next rent tick! Deposit coins now."
                        : `Your room expires in ${data.privateRoom.daysRemaining} day${data.privateRoom.daysRemaining !== 1 ? "s" : ""}. Consider depositing more coins.`
                      }
                    </div>
                  )}
                  {/* --- END AI-MODIFIED --- */}

                  {/* --- AI-MODIFIED (2026-03-22) --- */}
                  {/* Purpose: Room owner control panel with rename, members, info */}
                  {isRoomOwner && data.privateRoom && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
                      <button onClick={() => setShowOwnerPanel(!showOwnerPanel)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-500/10 transition-colors">
                        <span className="flex items-center gap-2 text-sm font-medium text-blue-300">
                          <Settings size={14} /> Room Controls
                        </span>
                        {showOwnerPanel ? <ChevronUp size={14} className="text-blue-400" /> : <ChevronDown size={14} className="text-blue-400" />}
                      </button>
                      {showOwnerPanel && (
                        <div className="px-4 pb-4 space-y-4 border-t border-blue-500/10">
                          {/* Room Name (editable) */}
                          <div className="pt-3 space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-blue-400/60 font-semibold">Room Name</label>
                            {editingRoomName ? (
                              <div className="flex gap-2">
                                <input type="text" value={roomNameInput} onChange={(e) => setRoomNameInput(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleRoomRename()}
                                  maxLength={100} autoFocus
                                  className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-muted border border-blue-500/30 text-foreground focus:border-blue-500/50 focus:outline-none" />
                                <button disabled={savingRoomName || !roomNameInput.trim()} onClick={handleRoomRename}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white disabled:opacity-50">Save</button>
                                <button onClick={() => setEditingRoomName(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground font-medium">{data.privateRoom.name || "Private Room"}</span>
                                <button onClick={() => { setRoomNameInput(data.privateRoom!.name || ""); setEditingRoomName(true) }}
                                  className="text-blue-400/60 hover:text-blue-400"><PencilLine size={12} /></button>
                              </div>
                            )}
                          </div>

                          {/* Room Info Badges */}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-md text-[10px] bg-muted text-muted-foreground border border-border">
                              <Coins size={9} className="inline mr-1" />{data.privateRoom.rentPrice}/day rent
                            </span>
                            <span className="px-2 py-1 rounded-md text-[10px] bg-muted text-muted-foreground border border-border">
                              <Users size={9} className="inline mr-1" />{data.privateRoom.memberCount}{roomDetail ? `/${roomDetail.memberCap}` : ""} members
                            </span>
                            {data.privateRoom.createdAt && (
                              <span className="px-2 py-1 rounded-md text-[10px] bg-muted text-muted-foreground border border-border">
                                <Clock size={9} className="inline mr-1" />Created {Math.floor((Date.now() - new Date(data.privateRoom.createdAt).getTime()) / 86400000)}d ago
                              </span>
                            )}
                          </div>

                          {/* Member List */}
                          {roomDetail && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-wider text-blue-400/60 font-semibold">Members ({roomDetail.members.length})</label>
                              <div className="space-y-1 max-h-40 overflow-y-auto">
                                {roomDetail.members.slice(0, 10).map((m) => (
                                  <div key={m.userId} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-blue-500/5">
                                    {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-muted" />}
                                    <span className="text-xs text-foreground flex-1 truncate">{m.displayName}</span>
                                    {m.isOwner && <Crown size={9} className="text-amber-400" />}
                                    <span className="text-[10px] text-muted-foreground tabular-nums">{Math.floor(m.totalStudySeconds / 3600)}h</span>
                                    {!m.isOwner && m.contribution > 0 && (
                                      <span className="text-[10px] text-amber-400/60 tabular-nums">{m.contribution}<Coins size={7} className="inline ml-0.5" /></span>
                                    )}
                                  </div>
                                ))}
                                {roomDetail.members.length > 10 && (
                                  <p className="text-[10px] text-muted-foreground text-center">+{roomDetail.members.length - 10} more</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* --- AI-MODIFIED (2026-03-22) --- */}
                          {/* Purpose: Timer controls for room owners in session panel */}
                          {canManageTimer && (
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-wider text-blue-400/60 font-semibold flex items-center gap-1">
                                <Timer size={9} /> Room Timer
                              </label>
                              {!hasRoomTimer && !timerCreating ? (
                                <button onClick={() => setTimerCreating(true)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20 transition-colors">
                                  <Plus size={10} /> Add Timer
                                </button>
                              ) : timerCreating ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] text-muted-foreground block mb-0.5">Focus</label>
                                      <input type="number" min={1} max={1440} value={timerFocus} onChange={(e) => setTimerFocus(Number(e.target.value))}
                                        className="w-full px-2 py-1 text-xs rounded bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-muted-foreground block mb-0.5">Break</label>
                                      <input type="number" min={1} max={1440} value={timerBreak} onChange={(e) => setTimerBreak(Number(e.target.value))}
                                        className="w-full px-2 py-1 text-xs rounded bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
                                    </div>
                                  </div>
                                  <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                                    <input type="checkbox" checked={timerAutoRestart} onChange={(e) => setTimerAutoRestart(e.target.checked)}
                                      className="rounded border-border bg-muted text-purple-500" />
                                    Auto-restart
                                  </label>
                                  <div className="flex gap-2">
                                    <button onClick={handleTimerCreate} disabled={timerLoading}
                                      className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50">Create</button>
                                    <button onClick={() => setTimerCreating(false)}
                                      className="px-3 py-1 text-xs rounded bg-muted text-foreground hover:bg-accent">Cancel</button>
                                  </div>
                                </div>
                              ) : data.pomodoro ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>{Math.floor(data.pomodoro.focusLength / 60)}m / {Math.floor(data.pomodoro.breakLength / 60)}m</span>
                                      <span className={cn("px-1 py-0.5 rounded text-[9px] font-semibold",
                                        data.pomodoro.stage === "stopped"
                                          ? "bg-muted text-muted-foreground"
                                          : "bg-emerald-500/15 text-emerald-400"
                                      )}>{data.pomodoro.stage === "stopped" ? "Stopped" : "Running"}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      {data.pomodoro.stage === "stopped" ? (
                                        <button onClick={() => handleTimerStartStop("start")} disabled={timerLoading}
                                          className="p-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50" title="Start">
                                          <Play size={10} />
                                        </button>
                                      ) : (
                                        <button onClick={() => handleTimerStartStop("stop")} disabled={timerLoading}
                                          className="p-1 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50" title="Stop">
                                          <Square size={10} />
                                        </button>
                                      )}
                                      <button onClick={() => {
                                        setTimerFocus(Math.floor(data.pomodoro!.focusLength / 60))
                                        setTimerBreak(Math.floor(data.pomodoro!.breakLength / 60))
                                        setTimerEditing(!timerEditing)
                                      }} className="p-1 rounded bg-muted text-foreground hover:bg-accent" title="Edit">
                                        <Pencil size={10} />
                                      </button>
                                      <button onClick={handleTimerDelete} disabled={timerLoading}
                                        className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50" title="Delete">
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                  {timerEditing && (
                                    <div className="space-y-2 pt-1">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] text-muted-foreground block mb-0.5">Focus</label>
                                          <input type="number" min={1} max={1440} value={timerFocus} onChange={(e) => setTimerFocus(Number(e.target.value))}
                                            className="w-full px-2 py-1 text-xs rounded bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
                                        </div>
                                        <div>
                                          <label className="text-[10px] text-muted-foreground block mb-0.5">Break</label>
                                          <input type="number" min={1} max={1440} value={timerBreak} onChange={(e) => setTimerBreak(Number(e.target.value))}
                                            className="w-full px-2 py-1 text-xs rounded bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
                                        </div>
                                      </div>
                                      <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                                        <input type="checkbox" checked={timerAutoRestart} onChange={(e) => setTimerAutoRestart(e.target.checked)}
                                          className="rounded border-border bg-muted text-purple-500" />
                                        Auto-restart
                                      </label>
                                      <div className="flex gap-2">
                                        <button onClick={handleTimerEdit} disabled={timerLoading}
                                          className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50">Save</button>
                                        <button onClick={() => setTimerEditing(false)}
                                          className="px-3 py-1 text-xs rounded bg-muted text-foreground hover:bg-accent">Cancel</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}
                          {/* --- END AI-MODIFIED --- */}

                          {/* Quick Links */}
                          <div className="flex gap-3 pt-1">
                            <Link href="/dashboard/rooms">
                              <a className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <ExternalLink size={9} /> Manage All Rooms
                              </a>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* --- END AI-MODIFIED --- */}

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
                  {data.pomodoro && data.pomodoro.stage !== "stopped" && (
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
                        size={typeof window !== 'undefined' && window.innerWidth < 640 ? 130 : 180}
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
                        className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
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
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
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
        className="flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1"
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
