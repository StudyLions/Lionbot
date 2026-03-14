// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Interactive embed wrapper - renders live dashboard widgets
//          inside tutorials. Shows real data for signed-in users,
//          mock data with sign-in CTA for guests.
// ============================================================
import { useSession, signIn } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { useState } from "react"
import { LogIn, Zap, CheckSquare, Plus, Trash2, Check, Circle, Bell, Clock, Repeat, User } from "lucide-react"
import { toast } from "@/components/dashboard/ui"
import ProfileCard, { DEFAULT_SKIN } from "@/components/dashboard/ProfileCard"

interface TryItLiveProps {
  componentId: string
}

export default function TryItLive({ componentId }: TryItLiveProps) {
  const { data: session, status } = useSession()
  const isGuest = status === "unauthenticated"

  const Widget = WIDGET_MAP[componentId]
  if (!Widget) return null

  return (
    <div className="relative rounded-xl border-2 border-primary/30 bg-card/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border-b border-primary/20">
        <Zap size={14} className="text-primary" />
        <span className="text-xs font-semibold text-primary">Try it live</span>
        {isGuest && (
          <span className="text-[10px] text-muted-foreground ml-auto">
            Sign in to use your real data
          </span>
        )}
      </div>

      <div className="relative">
        <Widget isGuest={isGuest} />

        {isGuest && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent flex flex-col items-center justify-end pb-8">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to interact with your real data
            </p>
            <button
              onClick={() => signIn("discord")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              <LogIn size={16} />
              Sign in with Discord
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Widget registry ───────────────────────────────────────
const WIDGET_MAP: Record<string, React.FC<{ isGuest: boolean }>> = {
  tasks: TasksWidget,
  reminders: RemindersWidget,
  "profile-card": ProfileCardWidget,
  "ranks-editor": PlaceholderWidget,
}

// ── Tasks Widget ──────────────────────────────────────────
interface Task {
  id: number
  content: string
  completed: boolean
  completedAt: string | null
  createdAt: string
  parentId: number | null
}

const MOCK_TASKS: Task[] = [
  { id: 1, content: "Read Chapter 3 of Data Structures", completed: true, completedAt: "2026-03-14", createdAt: "2026-03-13", parentId: null },
  { id: 2, content: "Complete practice problems 1-15", completed: false, completedAt: null, createdAt: "2026-03-13", parentId: null },
  { id: 3, content: "Watch lecture recording on sorting algorithms", completed: false, completedAt: null, createdAt: "2026-03-14", parentId: null },
  { id: 4, content: "Start outline for research paper", completed: false, completedAt: null, createdAt: "2026-03-14", parentId: null },
]

function TasksWidget({ isGuest }: { isGuest: boolean }) {
  const { data: session } = useSession()
  const { data: tasksData, isLoading, mutate } = useDashboard<{ tasks: Task[] }>(
    !isGuest && session ? "/api/dashboard/tasks" : null
  )

  const [demoTasks, setDemoTasks] = useState<Task[]>(MOCK_TASKS)
  const [newTask, setNewTask] = useState("")
  const [adding, setAdding] = useState(false)

  const tasks = isGuest ? demoTasks : (tasksData?.tasks || [])
  const rootTasks = tasks.filter((t) => !t.parentId)
  const completedCount = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const addTask = async () => {
    if (!newTask.trim() || adding) return
    if (isGuest) {
      setDemoTasks((prev) => [
        ...prev,
        { id: Date.now(), content: newTask.trim(), completed: false, completedAt: null, createdAt: new Date().toISOString(), parentId: null },
      ])
      setNewTask("")
      return
    }
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
        toast.success("Task added!")
      } else {
        toast.error("Failed to add task")
      }
    } catch {
      toast.error("Failed to add task")
    }
    setAdding(false)
  }

  const toggleTask = async (taskId: number, completed: boolean) => {
    if (isGuest) {
      setDemoTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null } : t))
      return
    }
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
  }

  if (isLoading && !isGuest) {
    return (
      <div className="p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-xs">
          {completedCount} of {tasks.length} complete
        </span>
        <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-medium">
          {progress}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          maxLength={200}
          disabled={isGuest}
          className="flex-1 bg-muted/50 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:opacity-50"
        />
        <button
          onClick={addTask}
          disabled={!newTask.trim() || adding || isGuest}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:cursor-not-allowed text-foreground rounded-lg text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {rootTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 bg-card/30 group transition-all ${
              task.completed ? "opacity-50" : ""
            }`}
          >
            <button
              onClick={() => toggleTask(task.id, !task.completed)}
              disabled={isGuest}
              className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                task.completed
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-input hover:border-emerald-500"
              }`}
            >
              {task.completed && <Check size={12} strokeWidth={2.5} />}
            </button>
            <span
              className={`flex-1 text-sm ${
                task.completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Reminders Widget ──────────────────────────────────────
interface Reminder {
  id: number
  title: string | null
  content: string
  remindAt: string
  interval: number | null
  failed: boolean
  createdAt: string | null
}

const MOCK_REMINDERS: Reminder[] = [
  { id: 1, title: "Study Session", content: "Time to review biology notes", remindAt: new Date(Date.now() + 3600000).toISOString(), interval: null, failed: false, createdAt: "2026-03-14" },
  { id: 2, title: null, content: "Submit assignment to Canvas", remindAt: new Date(Date.now() + 86400000).toISOString(), interval: null, failed: false, createdAt: "2026-03-13" },
  { id: 3, title: "Drink water", content: "Stay hydrated!", remindAt: new Date(Date.now() + 7200000).toISOString(), interval: 7200, failed: false, createdAt: "2026-03-13" },
]

function RemindersWidget({ isGuest }: { isGuest: boolean }) {
  const { data: session } = useSession()
  const { data: remindersData, isLoading, mutate } = useDashboard<{ reminders: Reminder[] }>(
    !isGuest && session ? "/api/dashboard/reminders" : null
  )

  const reminders = isGuest ? MOCK_REMINDERS : (remindersData?.reminders || [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ content: "", remindAt: "", title: "" })
  const [saving, setSaving] = useState(false)

  const saveReminder = async () => {
    if (!form.content || !form.remindAt || isGuest) return
    setSaving(true)
    try {
      const res = await fetch("/api/dashboard/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title || null,
          content: form.content,
          remindAt: new Date(form.remindAt).toISOString(),
          interval: null,
        }),
      })
      if (res.ok) {
        toast.success("Reminder created!")
        setForm({ content: "", remindAt: "", title: "" })
        setShowForm(false)
        mutate()
      } else {
        toast.error("Failed to create reminder")
      }
    } catch {
      toast.error("Failed to create reminder")
    }
    setSaving(false)
  }

  if (isLoading && !isGuest) {
    return (
      <div className="p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          {reminders.length} reminder{reminders.length !== 1 ? "s" : ""}
        </span>
        {!isGuest && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <Plus size={12} />
            New
          </button>
        )}
      </div>

      {showForm && !isGuest && (
        <div className="bg-muted/30 border border-border rounded-lg p-3 mb-4 space-y-2">
          <input
            type="text"
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full bg-muted/50 border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Reminder message..."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full bg-muted/50 border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="datetime-local"
            value={form.remindAt}
            onChange={(e) => setForm((f) => ({ ...f, remindAt: e.target.value }))}
            className="w-full bg-muted/50 border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <button
              onClick={saveReminder}
              disabled={saving || !form.content || !form.remindAt}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg text-xs font-medium transition-all"
            >
              {saving ? "Saving..." : "Create"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground/80 rounded-lg text-xs font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {reminders.map((r) => (
          <div key={r.id} className="bg-card/30 border border-border/50 rounded-lg px-3 py-2.5">
            {r.title && (
              <p className="text-sm font-medium text-foreground mb-0.5">{r.title}</p>
            )}
            <p className="text-sm text-muted-foreground">{r.content}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock size={10} />
                {new Date(r.remindAt).toLocaleString()}
              </span>
              {r.interval && (
                <span className="text-[10px] text-purple-300 flex items-center gap-1">
                  <Repeat size={10} />
                  Every {r.interval >= 3600 ? `${Math.floor(r.interval / 3600)}h` : `${Math.floor(r.interval / 60)}m`}
                </span>
              )}
            </div>
          </div>
        ))}
        {reminders.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No reminders yet</p>
        )}
      </div>
    </div>
  )
}

// ── Profile Card Widget ───────────────────────────────────
const MOCK_PROFILE = {
  username: "StudyLearner",
  avatarUrl: undefined,
  coins: 2450,
  gems: 15,
  studyHours: 127,
  currentRank: "Dedicated",
  rankProgress: 65,
  nextRank: "Expert",
  achievements: [
    { id: "first_hour", unlocked: true },
    { id: "ten_hours", unlocked: true },
    { id: "fifty_hours", unlocked: true },
    { id: "hundred_hours", unlocked: true },
    { id: "task_master", unlocked: false },
    { id: "streak_week", unlocked: true },
  ],
  currentStreak: 12,
  voteCount: 8,
}

function ProfileCardWidget({ isGuest }: { isGuest: boolean }) {
  const { data: session } = useSession()
  const { data: profileData, isLoading } = useDashboard<{
    profile: {
      username: string
      avatarUrl?: string
      coins: number
      gems: number
      studyHours: number
      currentRank?: string
      rankProgress?: number
      nextRank?: string
      achievements: Array<{ id: string; unlocked: boolean }>
      currentStreak: number
      voteCount: number
    }
  }>(!isGuest && session ? "/api/dashboard/renderer-data" : null)

  const data = isGuest
    ? MOCK_PROFILE
    : profileData?.profile || MOCK_PROFILE

  if (isLoading && !isGuest) {
    return (
      <div className="p-5 flex justify-center">
        <div className="w-80 h-96 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-5 flex justify-center">
      <ProfileCard
        data={data}
        skin={DEFAULT_SKIN}
        className="w-full max-w-sm"
      />
    </div>
  )
}

// ── Placeholder Widget (for upcoming interactive sections) ─
function PlaceholderWidget({ isGuest }: { isGuest: boolean }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <Zap size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        Interactive widget coming soon
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        This feature is still being built
      </p>
    </div>
  )
}
