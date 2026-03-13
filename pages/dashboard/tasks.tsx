// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Task list - rebuilt with shared UI
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: design system migration - color classes (bg-background, text-foreground, etc.)
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  Badge,
  ConfirmModal,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { CheckSquare, Plus, Trash2, Check, Circle } from "lucide-react"

interface Task {
  id: number
  content: string
  completed: boolean
  completedAt: string | null
  createdAt: string
  parentId: number | null
}

export default function TasksPage() {
  const { data: session } = useSession()
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: tasksData, isLoading: loading, mutate } = useDashboard<{ tasks: Task[] }>(
    session ? "/api/dashboard/tasks" : null
  )
  const tasks = tasksData?.tasks || []
  // --- END AI-MODIFIED ---
  const [newTask, setNewTask] = useState("")
  const [adding, setAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  const addTask = async () => {
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
        toast.error("Failed to add task")
      }
    } catch {
      toast.error("Failed to add task")
    }
    setAdding(false)
  }

  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed }),
      })
      if (res.ok) {
        mutate()
      } else {
        toast.error("Failed to update task")
      }
    } catch {
      toast.error("Failed to update task")
    }
  }
  // --- END AI-MODIFIED ---

  const confirmDelete = async () => {
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
  }

  const rootTasks = tasks.filter((t) => !t.parentId)
  const childTasks = (parentId: number) => tasks.filter((t) => t.parentId === parentId)
  const completedCount = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <Layout SEO={{ title: "Tasks - LionBot Dashboard", description: "Manage your study tasks" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-3xl">
              <PageHeader
                title="Tasks"
                description="Track your study tasks and mark them complete as you go."
                breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tasks" }]}
              />

              {/* Progress bar */}
              <div className="bg-card rounded-2xl p-5 border border-border mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">
                    {completedCount} of {tasks.length} complete
                  </span>
                  <Badge variant="success">{`${progress}%`}</Badge>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Add task inline form */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Add a new task..."
                  maxLength={200}
                  className="flex-1 bg-card border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={addTask}
                  disabled={!newTask.trim() || adding}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:cursor-not-allowed text-foreground rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus size={16} />
                  {adding ? "..." : "Add"}
                </button>
              </div>

              {/* Task list */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={<CheckSquare size={48} strokeWidth={1} className="text-muted-foreground" />}
                  title="No tasks yet"
                  description="Add your first task above to start tracking your goals!"
                />
              ) : (
                <div className="space-y-2">
                  {rootTasks.map((task) => (
                    <div key={task.id}>
                      <div
                        className={`bg-card rounded-xl border border-border p-4 flex items-center gap-3 group transition-all hover:border-gray-600 ${
                          task.completed ? "opacity-60" : ""
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(task.id, !task.completed)}
                          className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            task.completed
                              ? "bg-emerald-500 border-emerald-500 text-foreground"
                              : "border-gray-600 hover:border-emerald-500"
                          }`}
                        >
                          {task.completed ? (
                            <Check size={14} strokeWidth={2.5} />
                          ) : (
                            <Circle size={14} strokeWidth={2} className="text-transparent" />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.content}
                        </span>
                        <button
                          onClick={() => setDeleteTarget(task)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1.5 rounded hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {childTasks(task.id).map((child) => (
                        <div
                          key={child.id}
                          className={`ml-8 mt-1 bg-card/50 rounded-lg border border-border/50 p-3 flex items-center gap-3 group ${
                            child.completed ? "opacity-60" : ""
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(child.id, !child.completed)}
                            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                              child.completed
                                ? "bg-emerald-500 border-emerald-500 text-foreground"
                                : "border-gray-600 hover:border-emerald-500"
                            }`}
                          >
                            {child.completed ? (
                              <Check size={12} strokeWidth={2.5} />
                            ) : (
                              <Circle size={12} strokeWidth={2} className="text-transparent" />
                            )}
                          </button>
                          <span
                            className={`flex-1 text-xs ${
                              child.completed ? "line-through text-muted-foreground" : "text-foreground/80"
                            }`}
                          >
                            {child.content}
                          </span>
                          <button
                            onClick={() => setDeleteTarget(child)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Delete task?"
          message={
            deleteTarget
              ? `Are you sure you want to delete "${deleteTarget.content}"? This cannot be undone.`
              : ""
          }
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
        />
      </AdminGuard>
    </Layout>
  )
}
