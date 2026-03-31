// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Modal for creating a new shared board
// ============================================================
import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import ColorPicker from "./ColorPicker"

interface CreateBoardModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateBoardModal({ open, onClose, onCreated }: CreateBoardModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState<string | null>("#6366f1")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/dashboard/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, color }),
      })
      if (res.ok) {
        setName("")
        setDescription("")
        setColor("#6366f1")
        onCreated()
        onClose()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to create board")
      }
    } catch {
      setError("Network error")
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Create a Board</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Board Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study Group Project"
              maxLength={50}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this board for?"
              maxLength={200}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Color</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className={cn(
              "w-full py-2.5 rounded-lg font-medium transition-all",
              name.trim() && !loading
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
          >
            {loading ? "Creating..." : "Create Board"}
          </button>
        </form>
      </div>
    </div>
  )
}
