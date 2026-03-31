// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Draggable task card for kanban board columns
// ============================================================
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { Check, Circle, GripVertical, Pencil, Trash2, X, User } from "lucide-react"

export interface TaskData {
  id: number
  content: string
  description: string | null
  position: number
  color: string | null
  assigneeId: string | null
  createdBy: string
  completed: boolean
  completedAt: string | null
  createdAt: string | null
  updatedAt: string | null
  columnId: number | null
}

interface TaskCardProps {
  task: TaskData
  canEdit: boolean
  memberMap: Map<string, { name: string | null; avatarHash: string | null }>
  onToggle: (taskId: number, completed: boolean) => void
  onEdit: (taskId: number, content: string, description?: string) => void
  onDelete: (taskId: number) => void
  onAssign: (taskId: number, assigneeId: string | null) => void
}

function getDiscordAvatarUrl(userId: string, hash: string | null) {
  if (hash) return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`
  const index = (BigInt(userId) >> 22n) % 6n
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export default function TaskCard({ task, canEdit, memberMap, onToggle, onEdit, onDelete, onAssign }: TaskCardProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(task.content)
  const [editDesc, setEditDesc] = useState(task.description || "")
  const [expanded, setExpanded] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
    data: { type: "task", task },
    disabled: !canEdit,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== task.content) {
      onEdit(task.id, editContent.trim(), editDesc.trim() || undefined)
    }
    if (editDesc.trim() !== (task.description || "")) {
      onEdit(task.id, editContent.trim() || task.content, editDesc.trim() || undefined)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-gray-800 rounded-lg p-3 border border-indigo-500/50">
        <input
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          maxLength={100}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 mb-2"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditing(false) }}
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Description (optional)"
          maxLength={500}
          rows={2}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 resize-none mb-2"
        />
        <div className="flex gap-2">
          <button onClick={handleSaveEdit} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">Save</button>
          <button onClick={() => setEditing(false)} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-gray-800 rounded-lg p-3 border transition-all group",
        isDragging ? "opacity-50 border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-gray-700/50 hover:border-gray-600",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-2">
        {canEdit && (
          <button {...attributes} {...listeners} className="mt-0.5 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical size={14} />
          </button>
        )}
        <button
          onClick={() => canEdit && onToggle(task.id, !task.completed)}
          disabled={!canEdit}
          className={cn("mt-0.5 shrink-0", canEdit && "cursor-pointer")}
        >
          {task.completed
            ? <Check size={16} className="text-emerald-400" />
            : <Circle size={16} className="text-gray-500 hover:text-gray-300" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1">
            {task.color && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: task.color }} />}
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "text-sm text-left break-words",
                task.completed ? "line-through text-gray-500" : "text-gray-200"
              )}
            >
              {task.content}
            </button>
          </div>
          {expanded && task.description && (
            <p className="text-xs text-gray-500 mt-1 break-words">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <>
              <button onClick={() => { setEditContent(task.content); setEditDesc(task.description || ""); setEditing(true) }} className="p-1 text-gray-500 hover:text-gray-300">
                <Pencil size={13} />
              </button>
              <button onClick={() => onDelete(task.id)} className="p-1 text-gray-500 hover:text-red-400">
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>
      {assignee && (
        <div className="flex items-center gap-1.5 mt-2 ml-7">
          <img
            src={getDiscordAvatarUrl(task.assigneeId!, assignee.avatarHash)}
            alt={assignee.name || ""}
            className="w-4 h-4 rounded-full"
          />
          <span className="text-xs text-gray-500">{assignee.name || "Unknown"}</span>
        </div>
      )}
    </div>
  )
}
