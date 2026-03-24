// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family overview page - view family details + stats,
//          or create a new family / accept pending invites.
// ============================================================
import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import { relativeTime } from "@/utils/relativeTime"
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import PixelBar from "@/components/pet/ui/PixelBar"
import MiniGameboy, { type PetVisualData } from "@/components/pet/social/MiniGameboy"
import { familyLevelThreshold, hasPermission } from "@/utils/familyPermissions"
import { toast } from "sonner"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface FamilyMemberPreview {
  discordId: string
  discordName: string
  role: string
  petName: string
  petVisual: PetVisualData
}

interface FamilyOverviewData {
  family: {
    familyId: number
    name: string
    description: string
    iconUrl: string | null
    level: number
    xp: string
    gold: string
    maxMembers: number
    maxFarms: number
    memberCount: number
    createdAt: string
    rolePermissions?: unknown
  } | null
  membership: { role: string; contributionXp: string } | null
  recentActivity?: Array<{ type: string; amount: string; description: string; createdAt: string }>
}

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Match field names from /api/pet/family/invite response
interface PendingInvite {
  inviteId: number
  familyName: string
  memberCount: number
  inviterName: string
}
// --- END AI-MODIFIED ---

const ROLE_COLORS: Record<string, string> = {
  LEADER: "#f0c040",
  ADMIN: "#a855f7",
  MODERATOR: "#3b82f6",
  MEMBER: "#4a5a6c",
}

const ROLE_LABELS: Record<string, string> = {
  LEADER: "Leader",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  MEMBER: "Member",
}

const FAMILY_CREATE_COST = 10000
const FAMILY_NAME_MIN = 2
const FAMILY_NAME_MAX = 32

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLORS[role] ?? ROLE_COLORS.MEMBER
  return (
    <span
      className="font-pixel inline-block px-2 py-0.5 text-[10px] border uppercase tracking-wide"
      style={{ borderColor: color, color, backgroundColor: `${color}15` }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function FamilyHero({ family, membership }: {
  family: NonNullable<FamilyOverviewData["family"]>
  membership: NonNullable<FamilyOverviewData["membership"]>
}) {
  const xp = Number(family.xp)
  const currentThreshold = familyLevelThreshold(family.level)
  const nextThreshold = familyLevelThreshold(family.level + 1)
  const xpInLevel = xp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold

  return (
    <PixelCard className="p-4 space-y-3" corners>
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 flex-shrink-0 border-2 border-[#3a4a6c] bg-[#0a0e1a] flex items-center justify-center"
          style={{ imageRendering: "pixelated" }}
        >
          {family.iconUrl ? (
            <img src={family.iconUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{"\u{1F6E1}"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)] truncate">{family.name}</h2>
            <span
              className="font-pixel text-[11px] px-2 py-0.5 border border-[var(--pet-gold,#f0c040)] text-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/10"
            >
              Lv.{family.level}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <RoleBadge role={membership.role} />
            {family.description && (
              <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] truncate">
                {family.description}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">Family XP</span>
          <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)]">
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-4 bg-[#1a2a3c] border border-[#2a3a5c] overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100}%`,
              background: "linear-gradient(90deg, #f0c040, #e0a020)",
            }}
          />
        </div>
      </div>
    </PixelCard>
  )
}

function MemberStrip({ members }: { members: FamilyMemberPreview[] }) {
  const sorted = useMemo(() => {
    const roleOrder: Record<string, number> = { LEADER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 }
    return [...members].sort((a, b) => (roleOrder[a.role] ?? 4) - (roleOrder[b.role] ?? 4))
  }, [members])

  return (
    <PixelCard className="p-3" corners>
      <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\u{1F465}"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Members</span>
        <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] ml-auto">
          {members.length} online
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {sorted.map((m) => {
          const isLeader = m.role === "LEADER"
          const borderColor = ROLE_COLORS[m.role] ?? ROLE_COLORS.MEMBER
          return (
            <Link key={m.discordId} href={`/pet/friends/${m.discordId}`}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
                <div
                  className="border-2 transition-all group-hover:brightness-110"
                  style={{ borderColor }}
                >
                  <MiniGameboy
                    petData={m.petVisual}
                    width={isLeader ? 120 : 100}
                  />
                </div>
                <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate max-w-[100px] text-center">
                  {m.petName}
                </span>
                <span className="font-pixel text-[8px]" style={{ color: borderColor }}>
                  {ROLE_LABELS[m.role] ?? m.role}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </PixelCard>
  )
}

function FamilyStats({ family }: { family: NonNullable<FamilyOverviewData["family"]> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <PixelCard className="p-3 text-center" corners>
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] uppercase">Members</p>
        <p className="font-pixel text-lg text-[var(--pet-text,#e2e8f0)] mt-1">
          {family.memberCount}
          <span className="text-[var(--pet-text-dim,#8899aa)]">/{family.maxMembers}</span>
        </p>
      </PixelCard>
      <PixelCard className="p-3 text-center" corners>
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] uppercase">Treasury</p>
        <div className="mt-1 flex justify-center">
          <GoldDisplay amount={Number(family.gold)} size="md" />
        </div>
      </PixelCard>
      <PixelCard className="p-3 text-center" corners>
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] uppercase">Level</p>
        <p className="font-pixel text-lg text-[var(--pet-gold,#f0c040)] mt-1">{family.level}</p>
      </PixelCard>
      <PixelCard className="p-3 text-center" corners>
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] uppercase">Farm Slots</p>
        <p className="font-pixel text-lg text-[#40d870] mt-1">{family.maxFarms}</p>
      </PixelCard>
    </div>
  )
}

function QuickLinks({ family, membership }: {
  family: NonNullable<FamilyOverviewData["family"]>
  membership: NonNullable<FamilyOverviewData["membership"]>
}) {
  const canEditSettings = membership.role === "LEADER" || hasPermission(membership.role, "edit_settings", family.rolePermissions)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Link href="/pet/family/members">
        <PixelButton variant="info" size="sm" className="w-full">{"\u{1F465}"} Members</PixelButton>
      </Link>
      <Link href="/pet/family/bank">
        <PixelButton variant="gold" size="sm" className="w-full">{"\u{1F4B0}"} Bank</PixelButton>
      </Link>
      <Link href="/pet/family/farm">
        <PixelButton variant="primary" size="sm" className="w-full">{"\u{1F331}"} Farm</PixelButton>
      </Link>
      {canEditSettings && (
        <Link href="/pet/family/settings">
          <PixelButton variant="ghost" size="sm" className="w-full">{"\u2699\uFE0F"} Settings</PixelButton>
        </Link>
      )}
    </div>
  )
}

function ActivityFeed({ activity }: {
  activity: Array<{ type: string; amount: string; description: string; createdAt: string }>
}) {
  if (activity.length === 0) return null

  return (
    <PixelCard className="p-4 space-y-2" corners>
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\u{1F4DC}"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Recent Activity</span>
      </div>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
        {activity.map((entry, i) => {
          const time = new Date(entry.createdAt)
          const relative = relativeTime(time)
          const isPositive = Number(entry.amount) >= 0
          return (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-[#0a0e1a] border border-[#1a2a3c]">
              <span className={cn(
                "font-pixel text-[11px] flex-shrink-0",
                isPositive ? "text-[#40d870]" : "text-[#e04040]"
              )}>
                {isPositive ? "+" : ""}{Number(entry.amount).toLocaleString()}G
              </span>
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] truncate flex-1">
                {entry.description}
              </span>
              <span className="font-pixel text-[9px] text-[#3a4a5c] flex-shrink-0">{relative}</span>
            </div>
          )
        })}
      </div>
    </PixelCard>
  )
}

function CreateFamilyPanel({ userGold }: { userGold: number }) {
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const nameValid = name.trim().length >= FAMILY_NAME_MIN && name.trim().length <= FAMILY_NAME_MAX
  const canAfford = userGold >= FAMILY_CREATE_COST

  const handleCreate = useCallback(async () => {
    if (!nameValid || !canAfford || creating) return
    setCreating(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/create", { name: name.trim() })
      toast.success("Family created!")
      invalidate("/api/pet/family")
      router.replace("/pet/family")
    } catch (err: any) {
      toast.error(err.message || "Failed to create family")
    } finally {
      setCreating(false)
    }
  }, [name, nameValid, canAfford, creating, router])

  return (
    <PixelCard className="p-6 space-y-4" corners>
      <div className="text-center space-y-2">
        <span className="text-4xl">{"\u{1F6E1}"}</span>
        <h2 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)]">Create a Family</h2>
        <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)]">
          Unite with friends, share a farm, build a treasury, and grow together!
        </p>
      </div>

      <div className="space-y-2">
        <label className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] uppercase">Family Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={FAMILY_NAME_MAX}
          placeholder="Enter a name (2-32 characters)"
          className={cn(
            "w-full font-pixel text-sm px-3 py-2 bg-[#0a0e1a] border-2 outline-none transition-colors",
            "text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c]",
            name.length > 0 && !nameValid
              ? "border-[#e04040] focus:border-[#e04040]"
              : "border-[#2a3a5c] focus:border-[var(--pet-gold,#f0c040)]"
          )}
        />
        {name.length > 0 && !nameValid && (
          <p className="font-pixel text-[10px] text-[#e04040]">
            Name must be {FAMILY_NAME_MIN}-{FAMILY_NAME_MAX} characters
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0e1a] border border-[#2a3a5c]">
        <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">Cost:</span>
        <GoldDisplay amount={FAMILY_CREATE_COST} size="md" />
      </div>

      {!canAfford && (
        <div className="px-3 py-2 border border-[#e04040]/30 bg-[#e04040]/5">
          <p className="font-pixel text-[10px] text-[#e04040]">
            Not enough gold. You have {userGold.toLocaleString()}G — need {FAMILY_CREATE_COST.toLocaleString()}G.
          </p>
        </div>
      )}

      <PixelButton
        variant="gold"
        size="lg"
        className="w-full"
        disabled={!nameValid || !canAfford || creating}
        loading={creating}
        onClick={handleCreate}
      >
        {creating ? "Creating..." : "Create Family"}
      </PixelButton>
    </PixelCard>
  )
}

function PendingInvites() {
  const { data: session } = useSession()
  const { data, mutate: mutateInvites } = useDashboard<{ invites: PendingInvite[] }>(
    session ? "/api/pet/family/invite" : null
  )
  const [acting, setActing] = useState<number | null>(null)

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: POST to /api/pet/family/respond (not /invite which is for sending invites)
  const handleRespond = useCallback(async (inviteId: number, action: "accept" | "decline") => {
    if (acting) return
    setActing(inviteId)
    try {
      await dashboardMutate("POST", "/api/pet/family/respond", { inviteId, action })
      toast.success(action === "accept" ? "Joined family!" : "Invite declined")
      mutateInvites()
      if (action === "accept") {
        invalidate("/api/pet/family")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setActing(null)
    }
  }, [acting, mutateInvites])
  // --- END AI-MODIFIED ---

  if (!data?.invites?.length) return null

  return (
    <PixelCard className="p-4 space-y-3" corners>
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\u{1F4E8}"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Pending Invites</span>
        <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)] ml-auto">
          {data.invites.length}
        </span>
      </div>
      <div className="space-y-2">
        {data.invites.map((inv) => (
          <div
            key={inv.inviteId}
            className="flex items-center gap-3 px-3 py-2.5 bg-[#0a0e1a] border border-[#2a3a5c]"
          >
            <div className="flex-shrink-0 w-10 h-10 border border-[#3a4a6c] bg-[#080c18] flex items-center justify-center">
              <span className="text-lg">{"\u{1F6E1}"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">{inv.familyName}</p>
              <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                {inv.memberCount} members &middot; from {inv.inviterName}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <PixelButton
                variant="primary"
                size="sm"
                disabled={acting === inv.inviteId}
                onClick={() => handleRespond(inv.inviteId, "accept")}
              >
                Accept
              </PixelButton>
              <PixelButton
                variant="danger"
                size="sm"
                disabled={acting === inv.inviteId}
                onClick={() => handleRespond(inv.inviteId, "decline")}
              >
                Decline
              </PixelButton>
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  )
}

// --- AI-REPLACED (2026-03-24) ---
// Reason: Replaced local formatRelativeTime with shared relativeTime from @/utils/relativeTime (imported at top)
// --- Original code (commented out for rollback) ---
// function relativeTime(date: Date): string {
//   const diff = Date.now() - date.getTime()
//   const mins = Math.floor(diff / 60000)
//   if (mins < 1) return "just now"
//   if (mins < 60) return `${mins}m ago`
//   const hours = Math.floor(mins / 60)
//   if (hours < 24) return `${hours}h ago`
//   const days = Math.floor(hours / 24)
//   return `${days}d ago`
// }
// --- End original code ---
// --- END AI-REPLACED ---

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Add members fetch, leave family handler
interface FamilyMembersData {
  members: FamilyMemberPreview[]
}

function LeaveButton() {
  const [confirming, setConfirming] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const router = useRouter()

  const handleLeave = useCallback(async () => {
    setLeaving(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/leave", {})
      toast.success("You left the family")
      invalidate("/api/pet/family")
      router.replace("/pet/family")
    } catch (err: any) {
      toast.error(err.message || "Failed to leave")
    } finally {
      setLeaving(false)
      setConfirming(false)
    }
  }, [router])

  if (!confirming) {
    return (
      <PixelButton variant="danger" size="sm" onClick={() => setConfirming(true)}>
        Leave Family
      </PixelButton>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-pixel text-[10px] text-[var(--pet-red,#e04040)]">Are you sure?</span>
      <PixelButton variant="danger" size="sm" disabled={leaving} loading={leaving} onClick={handleLeave}>
        Confirm Leave
      </PixelButton>
      <PixelButton variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </PixelButton>
    </div>
  )
}
// --- END AI-MODIFIED ---

export default function FamilyOverview() {
  const { data: session } = useSession()

  const { data, error, isLoading } = useDashboard<FamilyOverviewData>(
    session ? "/api/pet/family" : null
  )

  const { data: balanceData } = useDashboard<{ gold: string; gems: number }>(
    session ? "/api/pet/balance" : null
  )

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Fetch members separately for the member strip
  const hasFamily = data?.family !== null && data?.family !== undefined
  const { data: membersData } = useDashboard<FamilyMembersData>(
    hasFamily ? "/api/pet/family/members" : null
  )
  // --- END AI-MODIFIED ---
  const userGold = Number(balanceData?.gold ?? 0)

  return (
    <Layout SEO={{ title: "Family - LionGotchi", description: "LionGotchi family guild" }}>
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
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Family</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  {hasFamily ? "Your guild home" : "Join or create a family to play together"}
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-32" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                  </div>
                  <Skeleton className="h-40" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : hasFamily && data.family && data.membership ? (
                <>
                  <FamilyHero family={data.family} membership={data.membership} />

                  {membersData?.members && membersData.members.length > 0 && (
                    <MemberStrip members={membersData.members} />
                  )}

                  <FamilyStats family={data.family} />

                  <QuickLinks family={data.family} membership={data.membership} />

                  {data.recentActivity && data.recentActivity.length > 0 && (
                    <ActivityFeed activity={data.recentActivity} />
                  )}

                  {data.membership.role !== "LEADER" && (
                    <PixelCard className="p-4" corners>
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                          Want to leave this family?
                        </span>
                        <LeaveButton />
                      </div>
                    </PixelCard>
                  )}
                </>
              ) : (
                <>
                  <CreateFamilyPanel userGold={userGold} />
                  <PendingInvites />
                </>
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
