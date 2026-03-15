// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Game-style event log for farm activity history
// ============================================================
import { useState } from "react"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

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
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function FarmHistory({ history }: FarmHistoryProps) {
  const [expanded, setExpanded] = useState(false)

  if (history.length === 0) return null

  const shown = expanded ? history : history.slice(0, 5)

  return (
    <div
      className="border-[3px] border-[#2a3a5c] bg-[#080c18]"
      style={{ boxShadow: "3px 3px 0 #060810" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0c1020] border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[9px] text-[#4a5a70] tracking-[0.15em]">EVENT LOG</span>
        {history.length > 5 && (
          <PixelButton variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Less" : `All (${history.length})`}
          </PixelButton>
        )}
      </div>

      {/* Log entries */}
      <div className="max-h-48 overflow-y-auto scrollbar-hide">
        {shown.map((entry, i) => {
          const isHarvest = entry.type === "FARM_HARVEST"
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5"
              style={{ backgroundColor: i % 2 === 0 ? "transparent" : "rgba(20,30,50,0.3)" }}
            >
              {/* Colored pip */}
              <span
                className="w-2 h-2 flex-shrink-0"
                style={{ backgroundColor: isHarvest ? "#40d870" : "#e04040" }}
              />
              {/* Description */}
              <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)] truncate flex-1 min-w-0">
                {entry.description}
              </span>
              {/* Amount */}
              <GoldDisplay
                amount={entry.amount}
                size="sm"
                showSign={isHarvest}
                className={isHarvest ? "" : "!text-[var(--pet-text-dim,#8899aa)]"}
              />
              {/* Timestamp */}
              <span className="font-pixel text-[8px] text-[#3a4a5c] w-6 text-right flex-shrink-0">
                {timeAgo(entry.createdAt)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
