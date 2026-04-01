// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Slide-over panel for viewing board activity history
// ============================================================
import { useState, useEffect, useCallback } from "react"
import { X, Loader2 } from "lucide-react"

interface HistoryEntry {
  id: number
  taskId: number | null
  userId: string
  userName: string
  userAvatar: string | null
  action: string
  details: any
  createdAt: string
}

interface HistoryPanelProps {
  listId: number
  onClose: () => void
}

function getDiscordAvatarUrl(userId: string, hash: string | null) {
  if (hash) return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`
  const index = Number((BigInt(userId) >> BigInt(22)) % BigInt(6))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

const ACTION_LABELS: Record<string, { verb: string; color: string }> = {
  board_created: { verb: "created this board", color: "text-indigo-400" },
  board_edited: { verb: "edited the board", color: "text-blue-400" },
  task_created: { verb: "created a task", color: "text-emerald-400" },
  task_completed: { verb: "completed a task", color: "text-green-400" },
  task_uncompleted: { verb: "reopened a task", color: "text-yellow-400" },
  task_edited: { verb: "edited a task", color: "text-blue-400" },
  task_moved: { verb: "moved a task", color: "text-purple-400" },
  task_deleted: { verb: "deleted a task", color: "text-red-400" },
  task_assigned: { verb: "assigned a task", color: "text-cyan-400" },
  column_created: { verb: "created a column", color: "text-indigo-400" },
  column_renamed: { verb: "renamed a column", color: "text-blue-400" },
  column_deleted: { verb: "deleted a column", color: "text-red-400" },
  column_reordered: { verb: "reordered columns", color: "text-purple-400" },
  member_added: { verb: "added a member", color: "text-emerald-400" },
  member_removed: { verb: "removed a member", color: "text-red-400" },
  member_role_changed: { verb: "changed a role", color: "text-amber-400" },
}

function formatDetail(entry: HistoryEntry): string {
  const d = entry.details || {}
  switch (entry.action) {
    case "task_created":
    case "task_deleted":
      return d.content ? `"${d.content}"` : ""
    case "task_completed":
    case "task_uncompleted":
      return d.newContent || d.content || ""
    case "task_edited":
      if (d.oldContent && d.newContent) return `"${d.oldContent}" → "${d.newContent}"`
      return ""
    case "task_moved":
      return `column ${d.fromColumnId || "?"} → ${d.toColumnId || "?"}`
    case "column_created":
    case "column_deleted":
      return d.name ? `"${d.name}"` : ""
    case "column_renamed":
      if (d.oldName && d.newName) return `"${d.oldName}" → "${d.newName}"`
      return ""
    case "member_added":
    case "member_removed":
      return d.targetUserId ? `User ${d.targetUserId}` : ""
    case "member_role_changed":
      return `${d.oldRole} → ${d.newRole}`
    default:
      return ""
  }
}

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
  return new Date(dateStr).toLocaleDateString()
}

export default function HistoryPanel({ listId, onClose }: HistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchHistory = useCallback(async (cursor?: number) => {
    const url = `/api/dashboard/boards/${listId}/history` + (cursor ? `?cursor=${cursor}` : "")
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json()
    return data as { entries: HistoryEntry[]; nextCursor: number | null }
  }, [listId])

  useEffect(() => {
    fetchHistory().then((data) => {
      if (data) {
        setEntries(data.entries)
        setNextCursor(data.nextCursor)
      }
      setLoading(false)
    })
  }, [fetchHistory])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    const data = await fetchHistory(nextCursor)
    if (data) {
      setEntries((prev) => [...prev, ...data.entries])
      setNextCursor(data.nextCursor)
    }
    setLoadingMore(false)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gray-500" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No activity yet</p>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => {
                const action = ACTION_LABELS[entry.action] || { verb: entry.action, color: "text-gray-400" }
                const detail = formatDetail(entry)
                return (
                  <div key={entry.id} className="flex gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-800/50">
                    <img
                      src={getDiscordAvatarUrl(entry.userId, entry.userAvatar)}
                      alt={entry.userName}
                      className="w-7 h-7 rounded-full mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-gray-200">{entry.userName}</span>
                        {" "}
                        <span className={action.color}>{action.verb}</span>
                      </p>
                      {detail && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{detail}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 shrink-0 mt-0.5">
                      {timeAgo(entry.createdAt)}
                    </span>
                  </div>
                )
              })}
              {nextCursor && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 flex items-center justify-center gap-2"
                >
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
