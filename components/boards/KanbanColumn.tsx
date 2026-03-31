// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Kanban column with droppable zone and sortable tasks
// ============================================================
import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { Plus, MoreHorizontal, Pencil, Trash2, X } from "lucide-react"
import TaskCard, { type TaskData } from "./TaskCard"

export interface ColumnData {
  id: number
  name: string
  position: number
  color: string | null
  tasks: TaskData[]
}

interface KanbanColumnProps {
  column: ColumnData
  canEdit: boolean
  isOwner: boolean
  memberMap: Map<string, { name: string | null; avatarHash: string | null }>
  onAddTask: (columnId: number, content: string) => void
  onToggleTask: (taskId: number, completed: boolean) => void
  onEditTask: (taskId: number, content: string, description?: string) => void
  onDeleteTask: (taskId: number) => void
  onAssignTask: (taskId: number, assigneeId: string | null) => void
  onRenameColumn: (columnId: number, name: string) => void
  onDeleteColumn: (columnId: number) => void
}

export default function KanbanColumn({
  column,
  canEdit,
  isOwner,
  memberMap,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onAssignTask,
  onRenameColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskContent, setNewTaskContent] = useState("")
  const [showMenu, setShowMenu] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameName, setRenameName] = useState(column.name)

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id },
  })

  const handleAddTask = () => {
    if (newTaskContent.trim()) {
      onAddTask(column.id, newTaskContent.trim())
      setNewTaskContent("")
      setAddingTask(false)
    }
  }

  const handleRename = () => {
    if (renameName.trim() && renameName.trim() !== column.name) {
      onRenameColumn(column.id, renameName.trim())
    }
    setRenaming(false)
  }

  const completedCount = column.tasks.filter((t) => t.completed).length

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 w-72 shrink-0",
        isOver && "border-indigo-500/50 bg-indigo-500/5"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-800">
        {column.color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: column.color }} />}
        {renaming ? (
          <input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            maxLength={30}
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            autoFocus
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false) }}
          />
        ) : (
          <h3 className="text-sm font-semibold text-gray-200 flex-1 truncate">{column.name}</h3>
        )}
        <span className="text-xs text-gray-500">{completedCount}/{column.tasks.length}</span>
        {canEdit && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-500 hover:text-gray-300">
              <MoreHorizontal size={14} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                  <button
                    onClick={() => { setRenameName(column.name); setRenaming(true); setShowMenu(false) }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <Pencil size={13} /> Rename
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => { onDeleteColumn(column.id); setShowMenu(false) }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[80px] max-h-[calc(100vh-280px)]"
      >
        <SortableContext
          items={column.tasks.map((t) => `task-${t.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              canEdit={canEdit}
              memberMap={memberMap}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onAssign={onAssignTask}
            />
          ))}
        </SortableContext>
      </div>

      {canEdit && (
        <div className="p-2 border-t border-gray-800">
          {addingTask ? (
            <div className="space-y-2">
              <input
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder="Task name..."
                maxLength={100}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") { setAddingTask(false); setNewTaskContent("") } }}
              />
              <div className="flex gap-2">
                <button onClick={handleAddTask} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-500">Add</button>
                <button onClick={() => { setAddingTask(false); setNewTaskContent("") }} className="text-xs px-3 py-1 text-gray-400 hover:text-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center gap-1.5 w-full text-sm text-gray-500 hover:text-gray-300 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} /> Add task
            </button>
          )}
        </div>
      )}
    </div>
  )
}
