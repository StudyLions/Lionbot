// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Task list - rebuilt with shared UI
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full redesign - Todoist-style with stats, filters, inline edit, subtasks,
//          reward badges, animations, milestones, bulk ops, mobile UX
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { ConfirmModal, EmptyState, toast } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  CheckSquare, Plus, Trash2, Check, Circle, Coins, ChevronDown, ChevronRight,
  ListChecks, Flame, Trophy, Sparkles, X, SquareCheck,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- Types ---

interface Task {
  id: number
  content: string
  completed: boolean
  completedAt: string | null
  createdAt: string | null
  updatedAt: string | null
  parentId: number | null
  rewarded: boolean | null
}

interface TaskStats {
  completedToday: number
  completedThisWeek: number
  totalCompleted: number
  totalActive: number
  weeklyGoal: number | null
}

type FilterTab = "all" | "active" | "completed"

const MILESTONES = [10, 25, 50, 100, 250, 500, 1000]

// --- Helpers ---

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

// --- Main Component ---

export default function TasksPage() {
  const { data: session } = useSession()
  const { data: tasksData, isLoading: loading, mutate } = useDashboard<{ tasks: Task[]; stats: TaskStats }>(
    session ? "/api/dashboard/tasks" : null
  )
  const tasks = tasksData?.tasks || []
  const stats = tasksData?.stats || null

  const [newTask, setNewTask] = useState("")
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<FilterTab>("all")
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<number | null>(null)
  const [subtaskContent, setSubtaskContent] = useState("")
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set())
  const [milestoneMsg, setMilestoneMsg] = useState<string | null>(null)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [parentDropdown, setParentDropdown] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)

  const addInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)
  const prevTotalCompleted = useRef<number>(stats?.totalCompleted ?? 0)

  useEffect(() => {
    if (stats && stats.totalCompleted > prevTotalCompleted.current) {
      const crossed = MILESTONES.find(
        m => stats.totalCompleted >= m && prevTotalCompleted.current < m
      )
      if (crossed) {
        setMilestoneMsg(`You've completed ${crossed} tasks! Keep it up!`)
        setTimeout(() => setMilestoneMsg(null), 4000)
      }
    }
    if (stats) prevTotalCompleted.current = stats.totalCompleted
  }, [stats?.totalCompleted])

  // --- Actions ---

  const addTask = useCallback(async () => {
    if (!newTask.trim() || adding) return
    setAdding(true)
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newTask.trim(), parentId: selectedParentId }),
      })
      if (res.ok) {
        setNewTask("")
        setSelectedParentId(null)
        setParentDropdown(false)
        mutate()
        toast.success(selectedParentId ? "Subtask added" : "Task added")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to add task")
      }
    } catch {
      toast.error("Failed to add task")
    }
    setAdding(false)
  }, [newTask, adding, selectedParentId, mutate])

  const addSubtask = useCallback(async (parentId: number) => {
    if (!subtaskContent.trim()) return
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: subtaskContent.trim(), parentId }),
      })
      if (res.ok) {
        setSubtaskContent("")
        setAddingSubtaskFor(null)
        mutate()
        toast.success("Subtask added")
      } else {
        toast.error("Failed to add subtask")
      }
    } catch {
      toast.error("Failed to add subtask")
    }
  }, [subtaskContent, mutate])

  const toggleTask = useCallback(async (taskId: number, completed: boolean) => {
    setAnimatingIds(prev => new Set(prev).add(taskId))
    setTimeout(() => setAnimatingIds(prev => { const n = new Set(prev); n.delete(taskId); return n }), 400)

    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed, cascade: true }),
      })
      if (res.ok) {
        const data = await res.json()
        mutate()
        if (data.cascadedCount > 0) {
          toast.success(`${completed ? "Completed" : "Uncompleted"} task + ${data.cascadedCount} subtask${data.cascadedCount > 1 ? "s" : ""}`)
        }
      } else {
        toast.error("Failed to update task")
      }
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

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: deleteTarget.id }),
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
    setDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget, mutate])

  const clearCompleted = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_completed" }),
      })
      if (res.ok) {
        const data = await res.json()
        mutate()
        toast.success(`Cleared ${data.deletedCount} completed task${data.deletedCount !== 1 ? "s" : ""}`)
      } else {
        toast.error("Failed to clear tasks")
      }
    } catch {
      toast.error("Failed to clear tasks")
    }
    setClearConfirm(false)
  }, [mutate])

  const bulkDelete = useCallback(async () => {
    if (selected.size === 0) return
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds: Array.from(selected) }),
      })
      if (res.ok) {
        const data = await res.json()
        mutate()
        toast.success(`Deleted ${data.deletedCount} task${data.deletedCount !== 1 ? "s" : ""}`)
        setSelected(new Set())
        setSelectMode(false)
      } else {
        toast.error("Failed to delete tasks")
      }
    } catch {
      toast.error("Failed to delete tasks")
    }
    setBulkDeleteConfirm(false)
  }, [selected, mutate])

  // --- Computed ---

  const rootTasks = useMemo(() => tasks.filter(t => !t.parentId), [tasks])
  const childTasksMap = useMemo(() => {
    const map = new Map<number, Task[]>()
    for (const t of tasks) {
      if (t.parentId) {
        const arr = map.get(t.parentId) || []
        arr.push(t)
        map.set(t.parentId, arr)
      }
    }
    return map
  }, [tasks])

  const filteredRootTasks = useMemo(() => {
    if (filter === "active") return rootTasks.filter(t => !t.completed)
    if (filter === "completed") return rootTasks.filter(t => t.completed)
    return [...rootTasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return 0
    })
  }, [rootTasks, filter])

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks])
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks])

  const toggleCollapse = (id: number) => {
    setCollapsed(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditContent(task.content)
    setTimeout(() => editInputRef.current?.focus(), 50)
  }

  // --- Render ---

  return (
    <Layout SEO={{ title: "Tasks - LionBot Dashboard", description: "Manage your study tasks" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-3xl space-y-4">

              {/* Page Header */}
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Track your study tasks and mark them complete as you go.</p>
              </div>

              {/* Stats Header */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-card rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium">Today</p>
                    <p className="text-xl font-bold text-foreground">{stats.completedToday}</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium">This Week</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-xl font-bold text-foreground">{stats.completedThisWeek}</p>
                      {stats.weeklyGoal && (
                        <span className="text-xs text-muted-foreground">/ {stats.weeklyGoal}</span>
                      )}
                    </div>
                    {stats.weeklyGoal && stats.weeklyGoal > 0 && (
                      <div className="h-1 mt-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${Math.min(100, (stats.completedThisWeek / stats.weeklyGoal) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-card rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium">Active</p>
                    <p className="text-xl font-bold text-foreground">{stats.totalActive}</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium">All-Time</p>
                    <p className="text-xl font-bold text-foreground flex items-center gap-1.5">
                      {stats.totalCompleted}
                      {stats.totalCompleted >= 100 && <Trophy size={14} className="text-amber-400" />}
                    </p>
                  </div>
                </div>
              )}

              {/* Milestone Banner */}
              {milestoneMsg && (
                <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                  <Sparkles size={18} className="text-amber-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-foreground flex-1">{milestoneMsg}</p>
                  <button onClick={() => setMilestoneMsg(null)} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Filter Tabs + Actions Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center bg-muted/30 rounded-lg p-0.5 gap-0.5">
                  {([
                    { key: "all" as FilterTab, label: "All", count: tasks.length },
                    { key: "active" as FilterTab, label: "Active", count: activeTasks.length },
                    { key: "completed" as FilterTab, label: "Done", count: completedTasks.length },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        filter === tab.key
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                      <span className={cn(
                        "ml-1.5 text-[10px] px-1 py-0.5 rounded-full",
                        filter === tab.key ? "bg-muted text-foreground" : "text-muted-foreground"
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  {completedTasks.length > 0 && (
                    <button
                      onClick={() => setClearConfirm(true)}
                      className="px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      Clear {completedTasks.length} done
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectMode(!selectMode)
                      if (selectMode) setSelected(new Set())
                    }}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs transition-colors",
                      selectMode
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <SquareCheck size={12} className="inline mr-1" />
                    {selectMode ? "Cancel" : "Select"}
                  </button>
                </div>
              </div>

              {/* Bulk Action Bar */}
              {selectMode && selected.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
                  <span className="text-sm font-medium text-foreground flex-1">
                    {selected.size} selected
                  </span>
                  <button
                    onClick={() => setBulkDeleteConfirm(true)}
                    className="px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 text-xs font-medium transition-colors"
                  >
                    <Trash2 size={12} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              )}

              {/* Add Task Form */}
              <div className="bg-card rounded-xl border border-border p-3">
                <div className="flex gap-2">
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask()
                      if (e.key === "Escape") { setNewTask(""); setSelectedParentId(null); setParentDropdown(false) }
                    }}
                    placeholder="What do you need to do?"
                    maxLength={100}
                    className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  <span className={cn(
                    "text-[10px] self-center tabular-nums flex-shrink-0",
                    newTask.length > 90 ? "text-amber-400" : "text-muted-foreground/40"
                  )}>
                    {newTask.length}/100
                  </span>
                  <button
                    onClick={addTask}
                    disabled={!newTask.trim() || adding}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus size={14} />
                    {adding ? "..." : "Add"}
                  </button>
                </div>
                {/* Parent selector for subtask creation */}
                {rootTasks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    {selectedParentId ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Adding under:</span>
                        <span className="text-xs text-foreground font-medium truncate max-w-[200px]">
                          {tasks.find(t => t.id === selectedParentId)?.content}
                        </span>
                        <button
                          onClick={() => { setSelectedParentId(null); setParentDropdown(false) }}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setParentDropdown(!parentDropdown)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <ChevronDown size={10} className={cn("transition-transform", parentDropdown && "rotate-180")} />
                        Add as subtask...
                      </button>
                    )}
                    {parentDropdown && !selectedParentId && (
                      <div className="mt-1.5 max-h-32 overflow-y-auto space-y-0.5">
                        {rootTasks.filter(t => !t.completed).map(t => (
                          <button
                            key={t.id}
                            onClick={() => { setSelectedParentId(t.id); setParentDropdown(false) }}
                            className="w-full text-left px-2 py-1 rounded text-xs text-foreground/80 hover:bg-muted/50 truncate transition-colors"
                          >
                            {t.content}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Task List */}
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md bg-muted" />
                        <div className="h-4 bg-muted rounded flex-1" style={{ width: `${50 + i * 8}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={<CheckSquare size={48} strokeWidth={1} className="text-muted-foreground" />}
                  title="No tasks yet"
                  description="Add your first task above to start tracking your goals!"
                />
              ) : filteredRootTasks.length === 0 ? (
                <div className="text-center py-12">
                  <ListChecks size={40} strokeWidth={1} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {filter === "active" ? "All done! No active tasks." : "No completed tasks yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRootTasks.map(task => {
                    const children = childTasksMap.get(task.id) || []
                    const filteredChildren = filter === "active" ? children.filter(c => !c.completed)
                      : filter === "completed" ? children.filter(c => c.completed)
                      : children
                    const isCollapsed = collapsed.has(task.id)

                    return (
                      <div key={task.id}>
                        <TaskRow
                          task={task}
                          childCount={children.length}
                          isCollapsed={isCollapsed}
                          isAnimating={animatingIds.has(task.id)}
                          isEditing={editingId === task.id}
                          editContent={editContent}
                          selectMode={selectMode}
                          isSelected={selected.has(task.id)}
                          onToggle={() => toggleTask(task.id, !task.completed)}
                          onDelete={() => setDeleteTarget(task)}
                          onStartEdit={() => startEdit(task)}
                          onEditChange={setEditContent}
                          onSaveEdit={saveEdit}
                          onCancelEdit={() => { setEditingId(null); setEditContent("") }}
                          onToggleCollapse={() => toggleCollapse(task.id)}
                          onToggleSelect={() => toggleSelect(task.id)}
                          onAddSubtask={() => { setAddingSubtaskFor(task.id); setTimeout(() => subtaskInputRef.current?.focus(), 50) }}
                          editInputRef={editInputRef}
                          isSubtask={false}
                        />

                        {/* Subtasks */}
                        {children.length > 0 && !isCollapsed && (
                          <div className="ml-7 border-l border-border/40 pl-3 space-y-0.5 mt-0.5">
                            {filteredChildren.map(child => (
                              <TaskRow
                                key={child.id}
                                task={child}
                                childCount={0}
                                isCollapsed={false}
                                isAnimating={animatingIds.has(child.id)}
                                isEditing={editingId === child.id}
                                editContent={editContent}
                                selectMode={selectMode}
                                isSelected={selected.has(child.id)}
                                onToggle={() => toggleTask(child.id, !child.completed)}
                                onDelete={() => setDeleteTarget(child)}
                                onStartEdit={() => startEdit(child)}
                                onEditChange={setEditContent}
                                onSaveEdit={saveEdit}
                                onCancelEdit={() => { setEditingId(null); setEditContent("") }}
                                onToggleCollapse={() => {}}
                                onToggleSelect={() => toggleSelect(child.id)}
                                onAddSubtask={() => {}}
                                editInputRef={editInputRef}
                                isSubtask={true}
                              />
                            ))}
                          </div>
                        )}

                        {/* Inline subtask add */}
                        {addingSubtaskFor === task.id && (
                          <div className="ml-7 border-l border-border/40 pl-3 mt-0.5">
                            <div className="flex items-center gap-2 p-2 bg-card/50 rounded-lg border border-border/50">
                              <input
                                ref={subtaskInputRef}
                                type="text"
                                value={subtaskContent}
                                onChange={e => setSubtaskContent(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") addSubtask(task.id)
                                  if (e.key === "Escape") { setAddingSubtaskFor(null); setSubtaskContent("") }
                                }}
                                placeholder="Add subtask..."
                                maxLength={100}
                                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                              />
                              <button
                                onClick={() => addSubtask(task.id)}
                                disabled={!subtaskContent.trim()}
                                className="text-emerald-500 hover:text-emerald-400 disabled:text-muted-foreground p-0.5 transition-colors"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => { setAddingSubtaskFor(null); setSubtaskContent("") }}
                                className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Progress Bar (bottom) */}
              {tasks.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">
                      {completedTasks.length} of {tasks.length} complete
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirm */}
        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Delete task?"
          message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.content}"?` : ""}
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
        />

        {/* Clear Completed Confirm */}
        <ConfirmModal
          open={clearConfirm}
          onConfirm={clearCompleted}
          onCancel={() => setClearConfirm(false)}
          title="Clear completed tasks?"
          message={`This will remove ${completedTasks.length} completed task${completedTasks.length !== 1 ? "s" : ""}. This cannot be undone.`}
          confirmLabel="Clear All"
          variant="danger"
        />

        {/* Bulk Delete Confirm */}
        <ConfirmModal
          open={bulkDeleteConfirm}
          onConfirm={bulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
          title="Delete selected tasks?"
          message={`This will remove ${selected.size} task${selected.size !== 1 ? "s" : ""}. This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      </AdminGuard>
    </Layout>
  )
}

// --- Task Row Component ---

interface TaskRowProps {
  task: Task
  childCount: number
  isCollapsed: boolean
  isAnimating: boolean
  isEditing: boolean
  editContent: string
  selectMode: boolean
  isSelected: boolean
  onToggle: () => void
  onDelete: () => void
  onStartEdit: () => void
  onEditChange: (v: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleCollapse: () => void
  onToggleSelect: () => void
  onAddSubtask: () => void
  editInputRef: React.RefObject<HTMLInputElement>
  isSubtask: boolean
}

function TaskRow({
  task, childCount, isCollapsed, isAnimating, isEditing, editContent,
  selectMode, isSelected, onToggle, onDelete, onStartEdit, onEditChange,
  onSaveEdit, onCancelEdit, onToggleCollapse, onToggleSelect, onAddSubtask,
  editInputRef, isSubtask,
}: TaskRowProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg transition-all",
        isSubtask ? "p-2 hover:bg-muted/20" : "p-3 hover:bg-muted/20",
        task.completed && "opacity-60",
        isSelected && "bg-primary/5 border border-primary/20",
        !isSelected && "border border-transparent",
      )}
    >
      {/* Select checkbox */}
      {selectMode && (
        <button onClick={onToggleSelect} className="flex-shrink-0">
          <div className={cn(
            "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
          )}>
            {isSelected && <Check size={10} strokeWidth={3} />}
          </div>
        </button>
      )}

      {/* Collapse toggle for parents */}
      {childCount > 0 && !selectMode && (
        <button onClick={onToggleCollapse} className="flex-shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors">
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
      {childCount === 0 && !selectMode && !isSubtask && <div className="w-5" />}

      {/* Completion checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0"
      >
        <div className={cn(
          "rounded-md flex items-center justify-center transition-all",
          isSubtask ? "w-4 h-4 border" : "w-5 h-5 border-2",
          task.completed
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-muted-foreground/30 hover:border-emerald-500",
          isAnimating && task.completed && "animate-check-pop"
        )}>
          {task.completed && <Check size={isSubtask ? 10 : 12} strokeWidth={3} />}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editContent}
            onChange={e => onEditChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") onSaveEdit()
              if (e.key === "Escape") onCancelEdit()
            }}
            onBlur={onSaveEdit}
            maxLength={100}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none border-b border-primary pb-0.5"
          />
        ) : (
          <span
            onClick={onStartEdit}
            className={cn(
              "block truncate cursor-text",
              isSubtask ? "text-xs" : "text-sm",
              task.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}
          >
            {task.content}
          </span>
        )}
      </div>

      {/* Meta: reward badge + timestamp */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {task.rewarded && (
          <span className="flex items-center gap-0.5 text-[10px] text-amber-400/70" title="Coins rewarded">
            <Coins size={10} />
          </span>
        )}
        {task.createdAt && (
          <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">
            {timeAgo(task.completedAt || task.createdAt)}
          </span>
        )}
      </div>

      {/* Actions (hover-visible) */}
      {!selectMode && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {!isSubtask && !task.completed && (
            <button
              onClick={onAddSubtask}
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors"
              title="Add subtask"
            >
              <Plus size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
