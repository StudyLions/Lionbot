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

const DEFAULT_SKIN: ProfileCardSkin = {
  id: "base",
  name: "Default",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  accentColor: "#22d3ee",
  backgroundColor: "#1e1b2e",
  textColor: "#e2e8f0",
}

export const SKIN_PRESETS: Record<string, ProfileCardSkin> = {
  base: {
    id: "base",
    name: "Default",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#22d3ee",
    backgroundColor: "#1e1b2e",
    textColor: "#e2e8f0",
  },
  obsidian: {
    id: "obsidian",
    name: "Obsidian",
    primaryColor: "#374151",
    secondaryColor: "#1f2937",
    accentColor: "#f59e0b",
    backgroundColor: "#111827",
    textColor: "#f9fafb",
  },
  platinum: {
    id: "platinum",
    name: "Platinum",
    primaryColor: "#94a3b8",
    secondaryColor: "#cbd5e1",
    accentColor: "#38bdf8",
    backgroundColor: "#0f172a",
    textColor: "#f1f5f9",
  },
  boston_blue: {
    id: "boston_blue",
    name: "Boston Blue",
    primaryColor: "#0284c7",
    secondaryColor: "#0369a1",
    accentColor: "#38bdf8",
    backgroundColor: "#0c1829",
    textColor: "#e0f2fe",
  },
  cotton_candy: {
    id: "cotton_candy",
    name: "Cotton Candy",
    primaryColor: "#f472b6",
    secondaryColor: "#c084fc",
    accentColor: "#f9a8d4",
    backgroundColor: "#1a0a1e",
    textColor: "#fce7f3",
  },
  blue_bayoux: {
    id: "blue_bayoux",
    name: "Blue Bayoux",
    primaryColor: "#4b6f8a",
    secondaryColor: "#2d4a63",
    accentColor: "#67b5d1",
    backgroundColor: "#0d1b26",
    textColor: "#d4e7f0",
  },
  bubblegum: {
    id: "bubblegum",
    name: "Bubblegum",
    primaryColor: "#ec4899",
    secondaryColor: "#f43f5e",
    accentColor: "#fb7185",
    backgroundColor: "#1a0a14",
    textColor: "#fce7f3",
  },
}

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

      {/* Streak + Votes row */}
      <div
        className="flex gap-4 px-6 mb-4 text-sm"
        style={{ color: `${colors.textColor}99` }}
      >
        <span>🔥 {data.currentStreak} day streak</span>
        <span>👍 {data.voteCount} votes</span>
      </div>

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
