// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Recent activity feed for private room detail view.
//          Shows recent voice study sessions with duration and tags.
// ============================================================
import { Activity } from "lucide-react"
import { formatDuration } from "./types"
import type { ActivityEntry } from "./types"

export default function ActivityPanel({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return null

  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Activity size={14} className="text-blue-400" /> Recent Activity
      </h4>
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {entries.map((e, i) => (
          <div
            key={i}
            className="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-card/50 text-xs"
          >
            <span className="text-muted-foreground whitespace-nowrap">
              {new Date(e.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-foreground">
              <span className="font-medium">{e.displayName}</span> studied for{" "}
              {formatDuration(e.durationSeconds)}
              {e.tag && (
                <span className="text-muted-foreground ml-1">({e.tag})</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
