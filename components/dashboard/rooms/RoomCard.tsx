// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Compact room card for the room list sidebar.
//          Features color-coded left border for health status,
//          inline owner badge, voice occupancy indicator.
// ============================================================
import { cn } from "@/lib/utils"
import { DoorOpen, Crown, Coins, Users, Mic, Snowflake } from "lucide-react"
import { healthColor } from "./types"
import type { RoomCard as RoomCardType } from "./types"

export default function RoomCard({
  room,
  selected,
  onClick,
}: {
  room: RoomCardType
  selected: boolean
  onClick: () => void
}) {
  const colors = healthColor(room.daysRemaining, room.frozenAt)
  const maxDays = 30
  const pct = Math.min(100, Math.max(0, (room.daysRemaining / maxDays) * 100))

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3.5 py-3 rounded-xl border-l-[3px] border border-border/50 transition-all",
        colors.border,
        selected
          ? "bg-accent/50 border-border ring-1 ring-primary/20"
          : "bg-card/50 hover:bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <DoorOpen size={14} className="text-blue-400 flex-shrink-0" />
          <span className="font-medium text-sm text-foreground truncate">
            {room.name || "Unnamed Room"}
          </span>
          {room.isOwner && (
            <Crown size={11} className="text-amber-400 flex-shrink-0" />
          )}
          {room.frozenAt && (
            <Snowflake size={11} className="text-blue-400 flex-shrink-0" />
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
          <Users size={11} /> {room.memberCount}/{room.memberCap}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2 text-xs">
        <span className="flex items-center gap-1 text-amber-300">
          <Coins size={12} /> {room.coinBalance.toLocaleString()}
        </span>
        {room.voiceOccupants > 0 && (
          <span className="flex items-center gap-1 text-emerald-400">
            <Mic size={11} /> {room.voiceOccupants} in voice
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] mb-0.5">
          <span className={cn("font-medium", colors.text)}>
            {room.frozenAt
              ? "Frozen"
              : room.daysRemaining <= 0
                ? "Expires next tick!"
                : `${room.daysRemaining}d remaining`}
          </span>
          <span className="text-muted-foreground">{room.rentPrice}/day</span>
        </div>
        <div className={cn("h-1.5 rounded-full overflow-hidden", colors.barBg)}>
          <div
            className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </button>
  )
}
