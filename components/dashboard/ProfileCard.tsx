// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Web-native profile card renderer (Discord-style preview, no Canvas)
// ============================================================
import { cn } from "@/lib/utils"
import {
  Clock,
  Flame,
  CalendarDays,
  Dumbbell,
  CheckSquare,
  Calendar,
  TrendingUp,
  ThumbsUp,
  LucideIcon,
} from "lucide-react"

export interface ProfileCardSkin {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

export interface ProfileCardProps {
  className?: string
  skin?: ProfileCardSkin
  data: {
    username: string
    avatarUrl?: string
    coins: number
    gems: number
    studyHours: number
    currentRank?: string
    rankProgress?: number
    nextRank?: string
    achievements: Array<{ id: string; unlocked: boolean }>
    currentStreak: number
    voteCount: number
  }
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: Update SKIN_PRESETS and DEFAULT_SKIN to match bot's skin.json colors
export const DEFAULT_SKIN: ProfileCardSkin = {
  id: "base",
  name: "Default",
  primaryColor: "#1473A2",
  secondaryColor: "#051822",
  accentColor: "#DDB21D",
  backgroundColor: "#0B1929",
  textColor: "#FFFFFF",
}

export const SKIN_PRESETS: Record<string, ProfileCardSkin> = {
  base: {
    id: "base",
    name: "Default",
    primaryColor: "#1473A2",
    secondaryColor: "#051822",
    accentColor: "#DDB21D",
    backgroundColor: "#0B1929",
    textColor: "#FFFFFF",
  },
  obsidian: {
    id: "obsidian",
    name: "Obsidian",
    primaryColor: "#9A9FCC",
    secondaryColor: "#414A9F",
    accentColor: "#B3B6C6",
    backgroundColor: "#1A1A2E",
    textColor: "#FFFFFF",
  },
  platinum: {
    id: "platinum",
    name: "Platinum",
    primaryColor: "#8685EF",
    secondaryColor: "#9545FF",
    accentColor: "#C154DA",
    backgroundColor: "#E8E8EE",
    textColor: "#4C4847",
  },
  boston_blue: {
    id: "boston_blue",
    name: "Boston Blue",
    primaryColor: "#1E9AC4",
    secondaryColor: "#E97BC1",
    accentColor: "#2276A0",
    backgroundColor: "#152A4A",
    textColor: "#FFFFFF",
  },
  cotton_candy: {
    id: "cotton_candy",
    name: "Cotton Candy",
    primaryColor: "#FF8B8B",
    secondaryColor: "#546CB3",
    accentColor: "#FFE894",
    backgroundColor: "#F0E0E8",
    textColor: "#9A9ECF",
  },
  blue_bayoux: {
    id: "blue_bayoux",
    name: "Blue Bayoux",
    primaryColor: "#B79AE2",
    secondaryColor: "#6671D3",
    accentColor: "#4E89F4",
    backgroundColor: "#2A2D40",
    textColor: "#FFFFFF",
  },
  bubblegum: {
    id: "bubblegum",
    name: "Bubblegum",
    primaryColor: "#FF3589",
    secondaryColor: "#345AA9",
    accentColor: "#99D3EE",
    backgroundColor: "#2E1B30",
    textColor: "#FFF2D4",
  },
}
// --- END AI-MODIFIED ---

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  VoiceHours: Clock,
  voice_hours: Clock,
  VoiceStreak: Flame,
  voice_streak: Flame,
  VoiceDays: CalendarDays,
  voice_days: CalendarDays,
  Workout: Dumbbell,
  workout: Dumbbell,
  TasksComplete: CheckSquare,
  tasks_complete: CheckSquare,
  ScheduledSessions: Calendar,
  scheduled_sessions: Calendar,
  MonthlyHours: TrendingUp,
  monthly_hours: TrendingUp,
  Voting: ThumbsUp,
  voting: ThumbsUp,
}

function getAchievementIcon(id: string): LucideIcon {
  return ACHIEVEMENT_ICONS[id] ?? CheckSquare
}

function StatCell({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-3 px-2"
      style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
    >
      <p className="text-xs uppercase tracking-wide opacity-70" style={{ color }}>
        {label}
      </p>
      <p className="text-sm font-bold mt-0.5" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

export default function ProfileCard({
  className,
  skin,
  data,
}: ProfileCardProps) {
  const colors = skin ?? DEFAULT_SKIN

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
        className="h-20"
        style={{
          background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
        }}
      />

      {/* Avatar */}
      <div className="relative px-6 -mt-10">
        <div
          className="w-20 h-20 rounded-full border-4 overflow-hidden shrink-0"
          style={{ borderColor: colors.backgroundColor }}
        >
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: `${colors.textColor}20` }}
            />
          )}
        </div>
      </div>

      {/* Username + rank */}
      <div className="px-6 py-3" style={{ color: colors.textColor }}>
        <h3 className="text-lg font-bold truncate">{data.username}</h3>
        {data.currentRank && (
          <p className="text-sm opacity-70">{data.currentRank}</p>
        )}
      </div>

      {/* Stats grid */}
      <div
        className="grid grid-cols-3 gap-px mx-6 mb-4 rounded-lg overflow-hidden"
        style={{ backgroundColor: `${colors.primaryColor}20` }}
      >
        <StatCell
          label="Study"
          value={`${data.studyHours}h`}
          color={colors.accentColor}
        />
        <StatCell
          label="Coins"
          value={data.coins.toLocaleString()}
          color={colors.accentColor}
        />
        <StatCell
          label="Gems"
          value={data.gems.toLocaleString()}
          color={colors.accentColor}
        />
      </div>

      {/* Achievement row */}
      <div className="flex gap-2 px-6 mb-4">
        {data.achievements.slice(0, 8).map((a) => {
          const Icon = getAchievementIcon(a.id)
          return (
            <div
              key={a.id}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                !a.unlocked && "opacity-30"
              )}
              style={{
                backgroundColor: a.unlocked
                  ? colors.accentColor
                  : `${colors.textColor}20`,
                color: a.unlocked ? colors.backgroundColor : colors.textColor,
              }}
              title={a.id}
            >
              <Icon size={14} strokeWidth={2.5} />
            </div>
          )
        })}
      </div>

      {/* --- AI-MODIFIED (2026-04-25) --- */}
      {/* Purpose: Premium polish -- replace emoji with Lucide icons so they tint     */}
      {/* with the active skin's accent colour and render at consistent weight       */}
      {/* across all OS emoji fonts. Keeps the same visual meaning (flame=streak,    */}
      {/* thumbs-up=votes) but colours align with the rest of the card.              */}
      {/* Streak + Votes row */}
      <div
        className="flex gap-4 px-6 mb-4 text-sm"
        style={{ color: `${colors.textColor}99` }}
      >
        <span className="inline-flex items-center gap-1.5">
          <Flame size={14} style={{ color: colors.accentColor }} aria-hidden="true" />
          {data.currentStreak} day streak
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp size={14} style={{ color: colors.accentColor }} aria-hidden="true" />
          {data.voteCount} votes
        </span>
      </div>
      {/* --- END AI-MODIFIED --- */}

      {/* Rank progress bar */}
      {data.rankProgress != null && (
        <div className="px-6 pb-5">
          <div
            className="flex justify-between text-xs mb-1"
            style={{ color: `${colors.textColor}80` }}
          >
            <span>{data.currentRank ?? "Unranked"}</span>
            <span>{data.nextRank ?? ""}</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: `${colors.textColor}15` }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, data.rankProgress))}%`,
                backgroundColor: colors.accentColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
