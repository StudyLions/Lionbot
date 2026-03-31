// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Slide-over panel for managing board members
// ============================================================
import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, UserPlus, Crown, Pencil, Eye, Trash2, LogOut } from "lucide-react"
import { toast } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"

interface Member {
  userId: string
  role: string
  joinedAt: string
  name: string | null
  avatarHash: string | null
}

interface MemberPanelProps {
  listId: number
  members: Member[]
  myRole: "owner" | "editor" | "viewer"
  onClose: () => void
  onUpdate: () => void
}

function getDiscordAvatarUrl(userId: string, hash: string | null) {
  if (hash) return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`
  const index = Number(BigInt(userId) % BigInt(6))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  owner: { label: "Owner", icon: <Crown size={12} />, cls: "bg-amber-500/20 text-amber-400" },
  editor: { label: "Editor", icon: <Pencil size={12} />, cls: "bg-blue-500/20 text-blue-400" },
  viewer: { label: "Viewer", icon: <Eye size={12} />, cls: "bg-gray-500/20 text-gray-400" },
}

export default function MemberPanel({ listId, members, myRole, onClose, onUpdate }: MemberPanelProps) {
  const { data: session } = useSession()
  const myUserId = (session as any)?.discordId || ""
  const [addUserId, setAddUserId] = useState("")
  const [addRole, setAddRole] = useState("editor")
  const [adding, setAdding] = useState(false)

  const canManageMembers = myRole === "owner" || myRole === "editor"

  const handleAdd = async () => {
    if (!addUserId.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`/api/dashboard/boards/${listId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: addUserId.trim(), role: addRole }),
      })
      if (res.ok) {
        setAddUserId("")
        onUpdate()
        toast.success("Member added")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to add member")
      }
    } catch {
      toast.error("Network error")
    }
    setAdding(false)
  }

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/dashboard/boards/${listId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      })
      if (res.ok) {
        onUpdate()
        toast.success("Role updated")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to update role")
      }
    } catch {
      toast.error("Network error")
    }
  }

  const handleRemove = async (userId: string) => {
    try {
      const res = await fetch(`/api/dashboard/boards/${listId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        onUpdate()
        toast.success("Member removed")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to remove member")
      }
    } catch {
      toast.error("Network error")
    }
  }

  const handleLeave = async () => {
    try {
      const res = await fetch(`/api/dashboard/boards/${listId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        toast.success("Left the board")
        window.location.href = "/dashboard/boards"
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to leave")
      }
    } catch {
      toast.error("Network error")
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Members ({members.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {canManageMembers && (
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                <UserPlus size={14} /> Add Member
              </div>
              <input
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                placeholder="Discord User ID"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={handleAdd}
                  disabled={!addUserId.trim() || adding}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    addUserId.trim() && !adding
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {members.map((m) => {
              const config = ROLE_CONFIG[m.role] || ROLE_CONFIG.viewer
              const isMe = m.userId === myUserId
              return (
                <div key={m.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 group">
                  <img
                    src={getDiscordAvatarUrl(m.userId, m.avatarHash)}
                    alt={m.name || ""}
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200 truncate">
                        {m.name || `User ${m.userId}`}
                      </span>
                      {isMe && <span className="text-xs text-gray-500">(you)</span>}
                    </div>
                    <span className={cn("inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full mt-0.5", config.cls)}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {myRole === "owner" && !isMe && (
                      <>
                        <select
                          value={m.role}
                          onChange={(e) => handleChangeRole(m.userId, e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="owner">Owner</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button onClick={() => handleRemove(m.userId)} className="p-1 text-gray-500 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {isMe && m.role !== "owner" && (
                      <button onClick={handleLeave} className="p-1 text-gray-500 hover:text-red-400" title="Leave board">
                        <LogOut size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
