// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Farm activity history log with pixel art styling
// ============================================================
import { useState } from "react"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"

interface HistoryEntry {
  type: string
  amount: number
  description: string
  createdAt: string
}

interface FarmHistoryProps {
  history: HistoryEntry[]
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function FarmHistory({ history }: FarmHistoryProps) {
  const [expanded, setExpanded] = useState(false)

  if (history.length === 0) return null

  const shown = expanded ? history : history.slice(0, 5)

  return (
    <PixelCard className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] tracking-widest">RECENT ACTIVITY</h3>
        {history.length > 5 && (
          <PixelButton variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Less" : `All (${history.length})`}
          </PixelButton>
        )}
      </div>

      <div className="space-y-0.5">
        {shown.map((entry, i) => {
          const isHarvest = entry.type === "FARM_HARVEST"
          return (
            <div key={i} className="flex items-center justify-between px-2 py-1 bg-[#0a0e1a]/40">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-pixel text-[9px]" style={{ color: isHarvest ? "var(--pet-green,#40d870)" : "var(--pet-red,#e04040)" }}>
                  {isHarvest ? "+" : "-"}
                </span>
                <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)] truncate">
                  {entry.description}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-pixel text-[9px]" style={{ color: isHarvest ? "var(--pet-gold,#f0c040)" : "var(--pet-text-dim,#8899aa)" }}>
                  {isHarvest ? "+" : "-"}{entry.amount}G
                </span>
                <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)]">
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </PixelCard>
  )
}
