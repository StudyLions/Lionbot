// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: LionGotchi leaderboard page with podium top 3,
//          ranked list 4-10, category/timeframe tabs,
//          countdown timer, and user rank footer.
// ============================================================
import { useState, useEffect } from "react"
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelTabBar from "@/components/pet/ui/PixelTabBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import MiniGameboy from "@/components/pet/social/MiniGameboy"
import PetProfileCard from "@/components/pet/social/PetProfileCard"
import GameboyFrame from "@/components/pet/GameboyFrame"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import { mergeLayout } from "@/utils/roomConstraints"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import type { PetVisualData } from "@/components/pet/social/MiniGameboy"
import type { PetProfileData } from "@/components/pet/social/PetProfileCard"

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Add "families" category for family-vs-family leaderboard tab
type Category = "vc" | "messages" | "drops" | "marketplace" | "families"
type Timeframe = "daily" | "weekly" | "monthly"

interface FamilyLeaderboardEntry {
  rank: number
  familyId: number
  name: string
  level: number
  xp: string
  memberCount: number
  leaderName: string
}

interface FamilyLeaderboardData {
  families: FamilyLeaderboardEntry[]
}
// --- END AI-MODIFIED ---

interface LeaderboardProfile {
  discordId: string
  discordName: string
  avatarHash: string | null
  petName: string
  petLevel: number
  food: number
  bath: number
  sleep: number
  petVisual: PetVisualData
}

interface LeaderboardEntry {
  rank: number
  userId: string
  value: number
  displayValue: string
  itemName: string | null
  itemRarity: string | null
  profile: LeaderboardProfile | null
}

interface LeaderboardData {
  entries: LeaderboardEntry[]
  userRank: { rank: number; value: number; displayValue: string } | null
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "vc", label: "VC Time" },
  { key: "messages", label: "Messages" },
  { key: "drops", label: "Lucky Drops" },
  { key: "marketplace", label: "Marketplace" },
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Family leaderboard tab
  { key: "families", label: "Families" },
  // --- END AI-MODIFIED ---
]

const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
]

const PODIUM_COLORS = {
  1: { border: "#f0c040", bg: "rgba(240,192,64,0.12)", label: "1st", crown: "text-[#f0c040]" },
  2: { border: "#b0b8c4", bg: "rgba(176,184,196,0.10)", label: "2nd", crown: "text-[#b0b8c4]" },
  3: { border: "#cd7f32", bg: "rgba(205,127,50,0.10)", label: "3rd", crown: "text-[#cd7f32]" },
} as const

function useCountdown(): string {
  const [text, setText] = useState("")

  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
      const diff = tomorrow.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setText(`${h}h ${m}m`)
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [])

  return text
}

function PodiumEntry({
  entry,
  rank,
  size,
}: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  size: number
}) {
  const colors = PODIUM_COLORS[rank]
  const visual = entry.profile?.petVisual
  const screenSize = Math.round(size * (200 / 260))

  return (
    <div className={cn("flex flex-col items-center gap-2", rank === 1 && "order-2", rank === 2 && "order-1", rank === 3 && "order-3")}>
      <span className={cn("font-pixel text-lg", colors.crown)}>{colors.label}</span>
      <div
        className="border-2 p-2"
        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
      >
        {visual ? (
          <GameboyFrame isFullscreen={false} skinAssetPath={visual.skinPath ?? undefined} width={size}>
            <RoomCanvas
              roomPrefix={visual.roomPrefix}
              furniture={visual.furniture}
              layout={mergeLayout(visual.roomLayout as any)}
              equipment={visual.equipment}
              expression={visual.expression}
              size={screenSize}
              animated
            />
          </GameboyFrame>
        ) : (
          <div className="bg-[#0a0e1a] flex items-center justify-center" style={{ width: size, height: size * 1.54 }}>
            <span className="font-pixel text-[#3a4a5c] text-xs">No data</span>
          </div>
        )}
      </div>
      {entry.profile && (
        <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate max-w-[180px] text-center">
          {entry.profile.petName}
        </p>
      )}
      <div className="text-center">
        <span className="font-pixel text-sm" style={{ color: colors.border }}>
          {entry.displayValue}
        </span>
        {entry.itemRarity && (
          <div className="mt-1">
            <PixelBadge rarity={entry.itemRarity} />
          </div>
        )}
      </div>
    </div>
  )
}

function RankedRow({ entry, category }: { entry: LeaderboardEntry; category: Category }) {
  if (entry.profile) {
    const profileData: PetProfileData = {
      discordId: entry.profile.discordId,
      discordName: entry.profile.discordName,
      avatarHash: entry.profile.avatarHash,
      petName: entry.profile.petName,
      petLevel: entry.profile.petLevel,
      food: entry.profile.food,
      bath: entry.profile.bath,
      sleep: entry.profile.sleep,
      petVisual: entry.profile.petVisual,
    }

    return (
      <PetProfileCard
        profile={profileData}
        gameboyWidth={100}
        href={`/pet/friends/${entry.profile.discordId}`}
        badge={
          category === "drops" && entry.itemRarity ? (
            <PixelBadge rarity={entry.itemRarity} />
          ) : undefined
        }
        stat={
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[13px] text-[#8899aa]">#{entry.rank}</span>
            <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
              {entry.displayValue}
            </span>
          </div>
        }
      />
    )
  }

  return (
    <PixelCard className="p-3 flex items-center gap-3">
      <span className="font-pixel text-sm text-[#8899aa] w-8 text-right">#{entry.rank}</span>
      <div className="flex-1 min-w-0">
        <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">
          User {entry.userId.slice(-4)}
        </p>
      </div>
      <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">{entry.displayValue}</span>
    </PixelCard>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center items-end gap-4 py-8">
        <Skeleton className="w-32 h-60" />
        <Skeleton className="w-40 h-72" />
        <Skeleton className="w-32 h-56" />
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  )
}

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Family leaderboard section showing families ranked by XP/level
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { familyLevelThreshold } from "@/utils/familyPermissions"

function FamilyLeaderboardView() {
  const { data, isLoading } = useDashboard<FamilyLeaderboardData>(
    "/api/pet/family/leaderboard?limit=10"
  )

  if (isLoading) return <LoadingSkeleton />
  if (!data || data.families.length === 0) {
    return (
      <PixelCard className="p-8 text-center" corners>
        <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
          No families yet
        </p>
      </PixelCard>
    )
  }

  return (
    <div className="space-y-3">
      {data.families.map((fam, i) => {
        const nextXp = familyLevelThreshold(fam.level + 1)
        const currentXp = Number(fam.xp)
        const prevXp = familyLevelThreshold(fam.level)
        const progress = nextXp > prevXp ? Math.min(1, (currentXp - prevXp) / (nextXp - prevXp)) : 1
        const medal = i === 0 ? "#f0c040" : i === 1 ? "#b0b8c4" : i === 2 ? "#cd7f32" : undefined

        return (
          <PixelCard
            key={fam.familyId}
            className="p-4 flex items-center gap-4"
            borderColor={medal}
          >
            <span
              className="font-pixel text-lg w-8 text-right flex-shrink-0"
              style={{ color: medal ?? "#8899aa" }}
            >
              #{fam.rank}
            </span>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[15px] text-[var(--pet-text,#e2e8f0)] truncate">
                  {fam.name}
                </span>
                <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] flex-shrink-0">
                  Lv.{fam.level}
                </span>
              </div>
              <div className="h-1.5 bg-[#1a2438] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f0c040] to-[#e08030] transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] font-pixel text-[#6a7a8c]">
                <span>{fam.memberCount} members</span>
                <span>Leader: {fam.leaderName}</span>
              </div>
            </div>
          </PixelCard>
        )
      })}
    </div>
  )
}
// --- END AI-MODIFIED ---

export default function PetLeaderboard() {
  const { data: session } = useSession()
  const [category, setCategory] = useState<Category>("vc")
  const [timeframe, setTimeframe] = useState<Timeframe>("daily")
  const countdown = useCountdown()

  const isFamily = category === "families"

  const { data, isLoading } = useDashboard<LeaderboardData>(
    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Skip fetching individual leaderboard when family tab is active
    isFamily ? null : `/api/pet/leaderboard?category=${category}&timeframe=${timeframe}`
    // --- END AI-MODIFIED ---
  )

  const top3 = data?.entries.filter((e) => e.rank <= 3) ?? []
  const rest = data?.entries.filter((e) => e.rank > 3) ?? []

  const orderedTop3: (LeaderboardEntry | null)[] = [
    top3.find((e) => e.rank === 2) ?? null,
    top3.find((e) => e.rank === 1) ?? null,
    top3.find((e) => e.rank === 3) ?? null,
  ]

  return (
    <Layout SEO={{ title: "Leaderboard - LionGotchi", description: "LionGotchi pet leaderboard" }}>
      <AdminGuard variant="pet">
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to PetShell for consistent layout */}
        {/* --- Original code (commented out for rollback) ---
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
        --- End original code --- */}
        <PetShell>
        {/* --- END AI-REPLACED --- */}
              {/* Header */}
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Leaderboard</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Resets in {countdown}
                </p>
              </div>

              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Migrated PixelButton category tabs to shared PixelTabBar component */}
              {/* --- Original code (commented out for rollback) ---
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <PixelButton key={c.key} variant={category === c.key ? "gold" : "ghost"} size="sm"
                    onClick={() => setCategory(c.key)}>{c.label}</PixelButton>
                ))}
              </div>
              --- End original code --- */}
              <PixelTabBar tabs={CATEGORIES} active={category} onChange={(k) => setCategory(k as Category)} />

              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Migrated timeframe button strip to shared PixelTabBar component */}
              {/* --- Original code (commented out for rollback) ---
              {!isFamily && (
                <div className="flex gap-1.5">
                  {TIMEFRAMES.map((t) => (
                    <button key={t.key} onClick={() => setTimeframe(t.key)}
                      className={cn("font-pixel text-[12px] px-3 py-1.5 border-2 transition-all",
                        "shadow-[1px_1px_0_#060810]", "hover:translate-x-px hover:translate-y-px hover:shadow-none",
                        timeframe === t.key ? "border-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/15 text-[var(--pet-gold,#f0c040)]"
                          : "border-[var(--pet-border,#2a3a5c)] bg-transparent text-[#8899aa] hover:text-[#c0d0e0]"
                      )}>{t.label}</button>
                  ))}
                </div>
              )}
              --- End original code --- */}
              {!isFamily && (
                <PixelTabBar tabs={TIMEFRAMES} active={timeframe} onChange={(k) => setTimeframe(k as Timeframe)} />
              )}

              {/* --- AI-MODIFIED (2026-03-22) --- */}
              {/* Purpose: Render family leaderboard when families tab is active */}
              {isFamily ? (
                <FamilyLeaderboardView />
              ) : isLoading ? (
                <LoadingSkeleton />
              ) : !data || data.entries.length === 0 ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                    No entries yet for this period
                  </p>
                </PixelCard>
              ) : (
                <>
                  {/* Podium */}
                  {top3.length > 0 && (
                    <PixelCard className="p-6" corners>
                      {/* Desktop: horizontal podium */}
                      <div className="hidden sm:flex items-end justify-center gap-6">
                        {orderedTop3.map((entry, i) => {
                          if (!entry) return <div key={i} className="w-32" />
                          const rank = entry.rank as 1 | 2 | 3
                          const size = rank === 1 ? 200 : 160
                          return <PodiumEntry key={entry.userId} entry={entry} rank={rank} size={size} />
                        })}
                      </div>

                      {/* Mobile: vertical stack */}
                      <div className="flex sm:hidden flex-col items-center gap-6">
                        {[1, 2, 3].map((r) => {
                          const entry = top3.find((e) => e.rank === r)
                          if (!entry) return null
                          const rank = r as 1 | 2 | 3
                          const size = rank === 1 ? 180 : 140
                          return <PodiumEntry key={entry.userId} entry={entry} rank={rank} size={size} />
                        })}
                      </div>
                    </PixelCard>
                  )}

                  {/* Rows 4-10 */}
                  {rest.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rest.map((entry) => (
                        <RankedRow key={entry.userId} entry={entry} category={category} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* User rank footer (individual categories only) */}
              {!isFamily && data?.userRank && (
                <div
                  className="sticky bottom-4 z-10 border-2 border-[var(--pet-gold,#f0c040)] bg-[#0f1628]/95 backdrop-blur-sm p-3"
                  style={{ boxShadow: "2px 2px 0 #060810, 0 0 16px rgba(240,192,64,0.15)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
                        Your Rank
                      </span>
                      <span className="font-pixel text-lg text-[var(--pet-text,#e2e8f0)]">
                        #{data.userRank.rank}
                      </span>
                    </div>
                    <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
                      {data.userRank.displayValue}
                    </span>
                  </div>
                </div>
              )}
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
