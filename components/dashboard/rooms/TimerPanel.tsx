// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Pomodoro timer controls for private room detail view.
//          Supports create, edit, start/stop, and delete operations
//          with visual phase indicator and larger touch targets.
// ============================================================
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Timer, Play, Square, Pencil, Trash2, Plus } from "lucide-react"
import { dashboardMutate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { RoomTimer } from "./types"

export default function TimerPanel({
  channelId,
  timer,
  isOwner,
  onMutate,
}: {
  channelId: string
  timer: RoomTimer | null
  isOwner: boolean
  onMutate: () => void
}) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [focus, setFocus] = useState(timer?.focusMinutes ?? 25)
  const [brk, setBrk] = useState(timer?.breakMinutes ?? 5)
  const [autoRestart, setAutoRestart] = useState(timer?.autoRestart ?? false)
  const [loading, setLoading] = useState(false)

  const handleCreate = useCallback(async () => {
    setLoading(true)
    try {
      await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/timer`, {
        focusMinutes: focus,
        breakMinutes: brk,
        autoRestart,
      })
      toast.success("Timer created!")
      setCreating(false)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create timer")
    } finally {
      setLoading(false)
    }
  }, [channelId, focus, brk, autoRestart, onMutate])

  const handleEdit = useCallback(async () => {
    setLoading(true)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/rooms/${channelId}/timer`, {
        focusMinutes: focus,
        breakMinutes: brk,
        autoRestart,
      })
      toast.success("Timer updated!")
      setEditing(false)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update timer")
    } finally {
      setLoading(false)
    }
  }, [channelId, focus, brk, autoRestart, onMutate])

  const handleStartStop = useCallback(
    async (action: "start" | "stop") => {
      setLoading(true)
      try {
        await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/timer`, { action })
        toast.success(action === "start" ? "Timer started!" : "Timer stopped!")
        onMutate()
      } catch (err: any) {
        toast.error(err.message || `Failed to ${action} timer`)
      } finally {
        setLoading(false)
      }
    },
    [channelId, onMutate]
  )

  const handleDelete = useCallback(async () => {
    if (!confirm("Delete this timer? This cannot be undone.")) return
    setLoading(true)
    try {
      await dashboardMutate("DELETE", `/api/dashboard/rooms/${channelId}/timer`, {})
      toast.success("Timer deleted")
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete timer")
    } finally {
      setLoading(false)
    }
  }, [channelId, onMutate])

  if (!isOwner && !timer) return null

  const formFields = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Focus (min)</label>
          <input
            type="number"
            min={1}
            max={1440}
            value={focus}
            onChange={(e) => setFocus(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Break (min)</label>
          <input
            type="number"
            min={1}
            max={1440}
            value={brk}
            onChange={(e) => setBrk(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={autoRestart}
          onChange={(e) => setAutoRestart(e.target.checked)}
          className="rounded border-border bg-muted text-purple-500 focus:ring-purple-500/30"
        />
        Auto-restart after break
      </label>
    </div>
  )

  if (!timer && !creating) {
    return (
      <div className="space-y-2.5">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Pomodoro Timer
        </h4>
        {isOwner ? (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20 transition-colors"
          >
            <Plus size={12} /> Add Timer
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">No timer configured</p>
        )}
      </div>
    )
  }

  if (creating) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Create Timer
        </h4>
        {formFields}
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => setCreating(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Pomodoro Timer
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-semibold",
              timer!.isRunning
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {timer!.isRunning ? "Running" : "Stopped"}
          </span>
        </h4>
        {isOwner && (
          <div className="flex gap-1">
            {timer!.isRunning ? (
              <button
                onClick={() => handleStartStop("stop")}
                disabled={loading}
                className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition-colors"
                title="Stop"
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                onClick={() => handleStartStop("start")}
                disabled={loading}
                className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
                title="Start"
              >
                <Play size={14} />
              </button>
            )}
            <button
              onClick={() => {
                setFocus(timer!.focusMinutes)
                setBrk(timer!.breakMinutes)
                setAutoRestart(timer!.autoRestart)
                setEditing(!editing)
              }}
              className="p-2 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            Focus: <span className="text-foreground">{timer!.focusMinutes}min</span>
          </span>
          <span>
            Break: <span className="text-foreground">{timer!.breakMinutes}min</span>
          </span>
          {timer!.autoRestart && <span className="text-purple-400">Auto-restart</span>}
        </div>
      ) : (
        <div className="space-y-3">
          {formFields}
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
