// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Stats card preview component (study times, streak calendar)
// ============================================================
import { cn } from "@/lib/utils"
import { Clock, Flame, Trophy } from "lucide-react"
import type { ProfileCardSkin } from "./ProfileCard"
import { DEFAULT_SKIN } from "./ProfileCard"

export interface StatsCardProps {
  className?: string
  skin?: ProfileCardSkin
  data: {
    leaderboardPosition?: number
    todayMinutes: number
    weekMinutes: number
    monthMinutes: number
    allTimeMinutes: number
    activeDays: string[] // ISO dates for the current month
    currentStreak: number
    longestStreak: number
  }
}

function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes}m`
}

/** Get Monday=0 weekday for a date */
function getWeekday(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** Build calendar grid for a month: array of rows, each row has 7 cells (Mon-Sun), null = empty */
function buildMonthGrid(
  year: number,
  month: number,
  activeDaysSet: Set<string>
): (number | null)[][] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const daysInMonth = last.getDate()
  const startOffset = getWeekday(first)

  const grid: (number | null)[][] = []
  let row: (number | null)[] = Array(7).fill(null)
  let col = startOffset

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    row[col] = activeDaysSet.has(iso) ? day : -day // -day = inactive, +day = active (we'll use abs for display)
    col++
    if (col >= 7) {
      grid.push(row)
      row = Array(7).fill(null)
      col = 0
    }
  }
  if (col > 0) grid.push(row)

  return grid
}

export default function StatsCard({
  className,
  skin,
  data,
}: StatsCardProps) {
  const colors = skin ?? DEFAULT_SKIN

  const year = data.activeDays.length > 0
    ? new Date(data.activeDays[0]).getFullYear()
    : new Date().getFullYear()
  const month = data.activeDays.length > 0
    ? new Date(data.activeDays[0]).getMonth()
    : new Date().getMonth()

  const activeDaysSet = new Set(data.activeDays.map((d) => d.slice(0, 10)))
  const grid = buildMonthGrid(year, month, activeDaysSet)

  const periodRows = [
    { label: "Today", value: data.todayMinutes },
    { label: "This Week", value: data.weekMinutes },
    { label: "This Month", value: data.monthMinutes },
    { label: "All Time", value: data.allTimeMinutes },
  ]

  return (
    <div
      className={cn(
        "relative w-full max-w-[440px] rounded-xl overflow-hidden shadow-2xl",
        className
      )}
      style={{ backgroundColor: colors.backgroundColor }}
    >
      {/* Header gradient bar */}
      <div
        className="h-12"
        style={{
          background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
        }}
      />

      {/* Title */}
      <div className="px-6 py-3" style={{ color: colors.textColor }}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock size={20} strokeWidth={2} />
          Stats
        </h3>
      </div>

      {/* --- AI-MODIFIED (2026-03-21) --- */}
      {/* Purpose: Stack columns on mobile so they don't get cramped */}
      <div className="px-4 sm:px-6 pb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
        {/* --- END AI-MODIFIED --- */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: `${colors.primaryColor}20` }}
          >
            {periodRows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center px-3 py-2 border-b last:border-b-0"
                style={{
                  borderColor: `${colors.textColor}15`,
                  color: colors.textColor,
                }}
              >
                <span className="text-sm">{row.label}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: colors.accentColor }}
                >
                  {formatMinutes(row.value)}
                </span>
              </div>
            ))}
          </div>
          {data.leaderboardPosition != null && (
            <div
              className="mt-2 flex items-center gap-2 text-sm"
              style={{ color: `${colors.textColor}99` }}
            >
              <Trophy size={14} style={{ color: colors.accentColor }} />
              <span>#{data.leaderboardPosition} on leaderboard</span>
            </div>
          )}
        </div>

        {/* Right: Streak calendar */}
        <div className="flex-shrink-0">
          <p
            className="text-xs uppercase tracking-wide mb-1.5"
            style={{ color: `${colors.textColor}80` }}
          >
            {new Date(year, month).toLocaleString("default", {
              month: "short",
              year: "numeric",
            })}
          </p>
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: `${colors.primaryColor}15` }}
          >
            {/* Weekday headers */}
            <div className="flex gap-0.5 mb-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div
                  key={i}
                  className="w-6 h-4 flex items-center justify-center text-[10px] font-medium"
                  style={{ color: `${colors.textColor}70` }}
                >
                  {d}
                </div>
              ))}
            </div>
            {grid.map((row, ri) => (
              <div key={ri} className="flex gap-0.5">
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium",
                      cell !== null && cell > 0
                        ? "text-white"
                        : "opacity-50"
                    )}
                    style={{
                      backgroundColor:
                        cell !== null && cell > 0
                          ? colors.accentColor
                          : cell !== null
                            ? `${colors.textColor}20`
                            : "transparent",
                      color:
                        cell !== null && cell > 0
                          ? colors.backgroundColor
                          : colors.textColor,
                    }}
                  >
                    {cell !== null ? Math.abs(cell) : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Streak stats */}
      <div
        className="flex gap-4 px-6 py-3 border-t"
        style={{
          borderColor: `${colors.textColor}15`,
          backgroundColor: `${colors.primaryColor}10`,
          color: colors.textColor,
        }}
      >
        <span className="flex items-center gap-1.5 text-sm">
          <Flame size={14} style={{ color: colors.accentColor }} />
          <strong>{data.currentStreak}</strong> day streak
        </span>
        <span className="flex items-center gap-1.5 text-sm opacity-80">
          Best: <strong>{data.longestStreak}</strong> days
        </span>
      </div>
    </div>
  )
}
