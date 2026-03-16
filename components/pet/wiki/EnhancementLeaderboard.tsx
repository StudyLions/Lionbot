// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Top 5 enhancement leaderboard for an item
// ============================================================
import { Trophy, Medal, Award, Sparkles } from "lucide-react"

interface Entry { name: string; level: number }

const RANK_STYLES = [
  { icon: <Trophy size={18} />, color: "#f0c040", border: "#f0c040" },
  { icon: <Medal size={18} />, color: "#c0d0e0", border: "#6a7a8a" },
  { icon: <Award size={18} />, color: "#cd7f32", border: "#cd7f32" },
]

export default function EnhancementLeaderboard({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-4 text-center shadow-[2px_2px_0_#060810]">
        <Sparkles className="mx-auto mb-2 text-[#2a3a5c]" size={24} />
        <p className="font-pixel text-[13px] text-[#4a5a70]">Be the first to enhance this item!</p>
      </div>
    )
  }

  return (
    <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-4 shadow-[2px_2px_0_#060810]">
      <h3 className="font-pixel text-sm text-[#c0d0e0] mb-3">Enhancement Leaderboard</h3>
      <div className="space-y-0">
        {entries.map((entry, i) => {
          const rank = RANK_STYLES[i]
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-2 px-2 border-b border-[#1a2a3c] last:border-b-0"
              style={{ backgroundColor: i % 2 === 0 ? "#0c1020" : "#0a0e1a" }}
            >
              <span
                className="w-8 h-8 flex items-center justify-center border-2"
                style={{
                  color: rank?.color ?? "#4a5a70",
                  borderColor: rank?.border ?? "#1a2a3c",
                  backgroundColor: "#0f1628",
                }}
              >
                {rank ? rank.icon : <span className="font-pixel text-[12px]">#{i + 1}</span>}
              </span>
              <span className="flex-1 font-pixel text-[13px] text-[#8899aa] truncate">{entry.name}</span>
              <span className="font-pixel text-[13px] text-[#40e070]">+{entry.level}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
