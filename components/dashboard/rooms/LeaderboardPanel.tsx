// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Study leaderboard panel for private room detail view.
//          Ranks room members by total voice study time.
// ============================================================
import { cn } from "@/lib/utils"
import { Trophy, Crown } from "lucide-react"
import { formatDuration } from "./types"
import type { RoomMember } from "./types"

export default function LeaderboardPanel({ members }: { members: RoomMember[] }) {
  const sorted = [...members].sort((a, b) => b.totalStudySeconds - a.totalStudySeconds)
  if (sorted.length === 0 || sorted.every((m) => m.totalStudySeconds === 0)) return null

  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Trophy size={14} className="text-amber-400" /> Study Leaderboard
      </h4>
      <div className="space-y-1">
        {sorted.map((m, i) => (
          <div key={m.userId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/50">
            <span
              className={cn(
                "w-5 text-center text-xs font-bold",
                i === 0
                  ? "text-amber-400"
                  : i === 1
                    ? "text-foreground"
                    : i === 2
                      ? "text-orange-400"
                      : "text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                {m.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-sm text-foreground truncate">
              {m.displayName}
              {m.isOwner && <Crown size={12} className="inline ml-1 text-amber-400" />}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {formatDuration(m.totalStudySeconds)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
