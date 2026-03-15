// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Top 5 enhancement leaderboard for an item
// ============================================================
import { Trophy, Medal, Award, Sparkles } from "lucide-react"

interface Entry { name: string; level: number }

const RANK_STYLES = [
  { icon: <Trophy size={14} />, color: "text-amber-400" },
  { icon: <Medal size={14} />, color: "text-gray-300" },
  { icon: <Award size={14} />, color: "text-amber-700" },
]

export default function EnhancementLeaderboard({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-muted/5 p-4 text-center">
        <Sparkles className="mx-auto mb-2 text-muted-foreground/20" size={20} />
        <p className="text-xs text-muted-foreground/40">Be the first to enhance this item!</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
      <h3 className="text-sm font-semibold mb-3">Enhancement Leaderboard</h3>
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const rank = RANK_STYLES[i]
          return (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <span className={`w-6 flex justify-center ${rank?.color ?? "text-muted-foreground/30"}`}>
                {rank ? rank.icon : <span className="text-xs">#{i + 1}</span>}
              </span>
              <span className="flex-1 text-xs font-medium truncate">{entry.name}</span>
              <span className="text-xs font-bold text-primary">+{entry.level}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
