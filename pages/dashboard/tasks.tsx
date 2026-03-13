// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Task manager with hierarchical list and CRUD
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState("")
  const [adding, setAdding] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/tasks")
      if (!res.ok) return
      const data = await res.json()
      setTasks(data.tasks)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchTasks()
  }, [session, fetchTasks])

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
        await fetchTasks()
      }
    } catch {}
    setAdding(false)
  }

  const toggleTask = async (taskId: number, completed: boolean) => {
    await fetch("/api/dashboard/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed }),
    })
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null } : t
    ))
  }

  const deleteTask = async (taskId: number) => {
    await fetch("/api/dashboard/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    })
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const rootTasks = tasks.filter(t => !t.parentId)
  const childTasks = (parentId: number) => tasks.filter(t => t.parentId === parentId)
  const completedCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <Layout SEO={{ title: "Tasks - LionBot Dashboard", description: "Manage your study tasks" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/dashboard">
                <span className="text-gray-400 hover:text-white cursor-pointer text-sm">&larr; Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{completedCount} of {tasks.length} completed</span>
                <span className="text-white font-bold text-lg">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Add task */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a new task..."
                maxLength={200}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <button
                onClick={addTask}
                disabled={!newTask.trim() || adding}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95"
              >
                {adding ? "..." : "Add"}
              </button>
            </div>

            {/* Task list */}
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
                <span className="text-5xl mb-4 block">📝</span>
                <p className="text-gray-400 text-lg mb-2">No tasks yet</p>
                <p className="text-gray-500 text-sm">Add your first task above to start tracking your goals!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rootTasks.map((task) => (
                  <div key={task.id}>
                    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-4 flex items-center gap-3 group transition-all hover:border-gray-600 ${
                      task.completed ? "opacity-60" : ""
                    }`}>
                      <button
                        onClick={() => toggleTask(task.id, !task.completed)}
                        className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-gray-600 hover:border-emerald-500"
                        }`}
                      >
                        {task.completed && <span className="text-xs">✓</span>}
                      </button>
                      <span className={`flex-1 text-sm ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
                        {task.content}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-sm px-2"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Child tasks */}
                    {childTasks(task.id).map((child) => (
                      <div key={child.id} className={`ml-8 mt-1 bg-gray-800/50 rounded-lg border border-gray-700/50 p-3 flex items-center gap-3 group ${
                        child.completed ? "opacity-60" : ""
                      }`}>
                        <button
                          onClick={() => toggleTask(child.id, !child.completed)}
                          className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            child.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-gray-600 hover:border-emerald-500"
                          }`}
                        >
                          {child.completed && <span className="text-[10px]">✓</span>}
                        </button>
                        <span className={`flex-1 text-xs ${child.completed ? "line-through text-gray-500" : "text-gray-300"}`}>
                          {child.content}
                        </span>
                        <button
                          onClick={() => deleteTask(child.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-xs px-1"
                        >
                          ✕
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
      </AdminGuard>
    </Layout>
  )
}
