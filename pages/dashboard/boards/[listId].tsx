// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Kanban board page — drag-and-drop columns and tasks
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { DashboardShell, PageHeader, toast } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Plus, Users, History, ArrowLeft, Settings } from "lucide-react"
import KanbanColumn, { type ColumnData } from "@/components/boards/KanbanColumn"
import TaskCard, { type TaskData } from "@/components/boards/TaskCard"
import MemberPanel from "@/components/boards/MemberPanel"
import HistoryPanel from "@/components/boards/HistoryPanel"
import ColorPicker from "@/components/boards/ColorPicker"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface BoardMember {
  userId: string
  role: string
  joinedAt: string
  name: string | null
  avatarHash: string | null
}

interface BoardData {
  id: number
  name: string
  description: string | null
  color: string | null
  ownerId: string
  myRole: "owner" | "editor" | "viewer"
  createdAt: string
  updatedAt: string
  columns: ColumnData[]
  unassignedTasks: TaskData[]
  members: BoardMember[]
}

export default function BoardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const listId = router.query.listId as string

  const { data: board, isLoading, mutate } = useDashboard<BoardData>(
    session && listId ? `/api/dashboard/boards/${listId}` : null
  )

  const [activeTask, setActiveTask] = useState<TaskData | null>(null)
  const [memberPanel, setMemberPanel] = useState(false)
  const [historyPanel, setHistoryPanel] = useState(false)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [newColColor, setNewColColor] = useState<string | null>("#6366f1")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const canEdit = board?.myRole === "owner" || board?.myRole === "editor"
  const isOwner = board?.myRole === "owner"

  const memberMap = useMemo(() => {
    const map = new Map<string, { name: string | null; avatarHash: string | null }>()
    board?.members.forEach((m) => map.set(m.userId, { name: m.name, avatarHash: m.avatarHash }))
    return map
  }, [board?.members])

  const apiBase = `/api/dashboard/boards/${listId}`

  const apiFetch = useCallback(async (path: string, method: string, body?: any) => {
    const res = await fetch(`${apiBase}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || "Request failed")
    }
    return res.json()
  }, [apiBase])

  const handleAddTask = useCallback(async (columnId: number, content: string) => {
    try {
      await apiFetch("/tasks", "POST", { content, columnId })
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }, [apiFetch, mutate])

  const handleToggleTask = useCallback(async (taskId: number, completed: boolean) => {
    try {
      await apiFetch("/tasks", "PATCH", { taskId, completed })
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }, [apiFetch, mutate])

  const handleEditTask = useCallback(async (taskId: number, content: string, description?: string) => {
    try {
      await apiFetch("/tasks", "PATCH", { taskId, content, ...(description !== undefined ? { description } : {}) })
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }, [apiFetch, mutate])

  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      await apiFetch("/tasks", "DELETE", { taskId })
      mutate()
      toast.success("Task deleted")
    } catch (e: any) {
      toast.error(e.message)
    }
  }, [apiFetch, mutate])

  const handleAssignTask = useCallback(async (taskId: number, assigneeId: string | null) => {
    try {
      await apiFetch("/tasks", "PATCH", { taskId, assigneeId })
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }, [apiFetch, mutate])

  const handleRenameColumn = useCallback(async (columnId: number, name: string) => {
    try {
      await apiFetch("/columns", "PATCH", { columnId, name })
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }, [apiFetch, mutate])

  const handleDeleteColumn = useCallback(async (columnId: number) => {
    try {
      await apiFetch("/columns", "DELETE", { columnId })
      mutate()
      toast.success("Column deleted")
    } catch (e: any) {
      toast.error(e.message)
    }
  }, [apiFetch, mutate])

  const handleAddColumn = async () => {
    if (!newColName.trim()) return
    try {
      await apiFetch("/columns", "POST", { name: newColName.trim(), color: newColColor })
      setNewColName("")
      setAddingColumn(false)
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === "task") {
      setActiveTask(active.data.current.task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over || !active.data.current) return

    const activeData = active.data.current
    if (activeData.type !== "task") return

    const task = activeData.task as TaskData
    let targetColumnId: number | null = null

    if (over.data.current?.type === "column") {
      targetColumnId = over.data.current.columnId
    } else if (over.data.current?.type === "task") {
      targetColumnId = (over.data.current.task as TaskData).columnId
    }

    if (targetColumnId !== null && targetColumnId !== task.columnId) {
      try {
        await apiFetch("/tasks", "PATCH", { taskId: task.id, columnId: targetColumnId })
        mutate()
      } catch (e: any) {
        toast.error(e.message)
      }
    }
  }

  if (isLoading) {
    return (
      <Layout SEO={{ title: "Board - LionBot Dashboard", description: "Shared kanban board" }}>
        <AdminGuard>
          <DashboardShell nav={<DashboardNav />} className="max-w-full space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 w-72" />)}
            </div>
          </DashboardShell>
        </AdminGuard>
      </Layout>
    )
  }

  if (!board) {
    return (
      <Layout SEO={{ title: "Board Not Found", description: "Board not found" }}>
        <AdminGuard>
          <DashboardShell nav={<DashboardNav />} className="max-w-3xl">
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Board not found or you don&apos;t have access.</p>
              <button onClick={() => router.push("/dashboard/boards")} className="mt-4 text-indigo-400 hover:underline">
                Back to Boards
              </button>
            </div>
          </DashboardShell>
        </AdminGuard>
      </Layout>
    )
  }

  const totalTasks = board.columns.reduce((s, c) => s + c.tasks.length, 0) + board.unassignedTasks.length
  const completedTasks = board.columns.reduce((s, c) => s + c.tasks.filter((t) => t.completed).length, 0) + board.unassignedTasks.filter((t) => t.completed).length

  return (
    <Layout SEO={{ title: `${board.name} - LionBot Dashboard`, description: "Shared kanban board" }}>
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />} className="max-w-full space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.push("/dashboard/boards")} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {board.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: board.color }} />}
                <h1 className="text-xl font-bold text-foreground truncate">{board.name}</h1>
                <span className="text-sm text-muted-foreground shrink-0">
                  {completedTasks}/{totalTasks} done
                </span>
              </div>
              {board.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{board.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex -space-x-2 mr-2">
                {board.members.slice(0, 5).map((m) => (
                  <img
                    key={m.userId}
                    src={getDiscordAvatarUrl(m.userId, m.avatarHash)}
                    alt={m.name || ""}
                    title={m.name || m.userId}
                    className="w-7 h-7 rounded-full border-2 border-gray-900"
                  />
                ))}
              </div>
              <button
                onClick={() => setMemberPanel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors border border-gray-700"
              >
                <Users size={14} /> Members
              </button>
              <button
                onClick={() => setHistoryPanel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors border border-gray-700"
              >
                <History size={14} /> Activity
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
              {board.columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  canEdit={canEdit}
                  isOwner={isOwner}
                  memberMap={memberMap}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onAssignTask={handleAssignTask}
                  onRenameColumn={handleRenameColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}

              {canEdit && (
                <div className="w-72 shrink-0">
                  {addingColumn ? (
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-3 space-y-3">
                      <input
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        placeholder="Column name..."
                        maxLength={30}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddColumn(); if (e.key === "Escape") setAddingColumn(false) }}
                      />
                      <ColorPicker value={newColColor} onChange={setNewColColor} />
                      <div className="flex gap-2">
                        <button onClick={handleAddColumn} className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">Add</button>
                        <button onClick={() => setAddingColumn(false)} className="text-sm px-3 py-1.5 text-gray-400 hover:text-gray-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingColumn(true)}
                      className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors text-sm"
                    >
                      <Plus size={16} /> Add Column
                    </button>
                  )}
                </div>
              )}
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="bg-gray-800 rounded-lg p-3 border border-indigo-500 shadow-xl shadow-indigo-500/20 w-64 opacity-90">
                  <p className="text-sm text-gray-200">{activeTask.content}</p>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {memberPanel && (
            <MemberPanel
              listId={Number(listId)}
              members={board.members}
              myRole={board.myRole}
              onClose={() => setMemberPanel(false)}
              onUpdate={() => mutate()}
            />
          )}

          {historyPanel && (
            <HistoryPanel
              listId={Number(listId)}
              onClose={() => setHistoryPanel(false)}
            />
          )}
        </DashboardShell>
      </AdminGuard>
    </Layout>
  )
}

function getDiscordAvatarUrl(userId: string, hash: string | null) {
  if (hash) return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`
  const index = Number(BigInt(userId) % BigInt(6))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])) },
})
