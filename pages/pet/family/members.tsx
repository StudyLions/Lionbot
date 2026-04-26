// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family members page - grid of member cards with
//          MiniGameboy previews, role badges, admin actions
//          (promote/demote/kick), and an invite panel.
// ============================================================
import { useState, useCallback, useMemo, useEffect } from "react"
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
import MiniGameboy, { type PetVisualData } from "@/components/pet/social/MiniGameboy"
import { hasPermission, roleRank } from "@/utils/familyPermissions"
import { toast } from "sonner"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface FamilyMember {
  discordId: string
  discordName: string
  avatarHash?: string
  petName: string
  petLevel: number
  role: string
  contributionXp: string
  joinedAt: string
  petVisual: PetVisualData
}

interface FamilyMembersData {
  members: FamilyMember[]
}

interface FamilyOverviewData {
  family: {
    familyId: number
    name: string
    rolePermissions?: unknown
  } | null
  membership: { role: string; contributionXp: string } | null
}

interface SearchResult {
  discordId: string
  discordName: string
  petName: string
  petLevel: number
  avatarHash?: string
}

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

const ROLE_ORDER: string[] = ["LEADER", "ADMIN", "MODERATOR", "MEMBER"]

const PROMOTABLE_TO: Record<string, string[]> = {
  MEMBER: ["MODERATOR", "ADMIN"],
  MODERATOR: ["ADMIN"],
  ADMIN: [],
}

const DEMOTABLE_TO: Record<string, string[]> = {
  ADMIN: ["MODERATOR", "MEMBER"],
  MODERATOR: ["MEMBER"],
  MEMBER: [],
}

function RoleBadge({ role, className }: { role: string; className?: string }) {
  const color = ROLE_COLORS[role] ?? ROLE_COLORS.MEMBER
  return (
    <span
      className={cn("font-pixel inline-block px-2 py-0.5 text-[10px] border uppercase tracking-wide", className)}
      style={{ borderColor: color, color, backgroundColor: `${color}15` }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

// --- AI-REPLACED (2026-03-24) ---
// Reason: Replaced local formatRelativeTime with shared relativeTime from @/utils/relativeTime (imported at top)
// --- Original code (commented out for rollback) ---
// function relativeTime(dateStr: string): string {
//   const diff = Date.now() - new Date(dateStr).getTime()
//   const mins = Math.floor(diff / 60000)
//   if (mins < 1) return "just now"
//   if (mins < 60) return `${mins}m ago`
//   const hours = Math.floor(mins / 60)
//   if (hours < 24) return `${hours}h ago`
//   const days = Math.floor(hours / 24)
//   if (days < 30) return `${days}d ago`
//   const months = Math.floor(days / 30)
//   return `${months}mo ago`
// }
// --- End original code ---
// --- END AI-REPLACED ---

function MemberCard({
  member,
  myRole,
  rolePermissions,
  onAction,
  acting,
}: {
  member: FamilyMember
  myRole: string
  rolePermissions: unknown
  onAction: (discordId: string, action: string, newRole?: string) => void
  acting: string | null
}) {
  const [showActions, setShowActions] = useState(false)
  const borderColor = ROLE_COLORS[member.role] ?? ROLE_COLORS.MEMBER
  const myRank = roleRank(myRole)
  const memberRank = roleRank(member.role)

  const canKick = hasPermission(myRole, "kick_members", rolePermissions) && myRank > memberRank
  const canPromoteDemote = hasPermission(myRole, "promote_demote", rolePermissions) && myRank > memberRank
  const isActing = acting === member.discordId
  const hasActions = canKick || canPromoteDemote

  const promoteOptions = member.role !== "LEADER" ? (PROMOTABLE_TO[member.role] ?? []).filter(r => roleRank(r) < myRank) : []
  const demoteOptions = member.role !== "MEMBER" && member.role !== "LEADER" ? (DEMOTABLE_TO[member.role] ?? []).filter(r => roleRank(r) < myRank) : []

  return (
    <PixelCard
      className="p-3 space-y-2 relative"
      borderColor={`${borderColor}60`}
      corners
    >
      {/* Gameboy preview */}
      <div className="flex justify-center">
        <Link href={`/pet/friends/${member.discordId}`}>
          <div
            className="border-2 cursor-pointer transition-all hover:brightness-110"
            style={{ borderColor }}
          >
            <MiniGameboy petData={member.petVisual} width={120} />
          </div>
        </Link>
      </div>

      {/* Info */}
      <div className="text-center space-y-1">
        <RoleBadge role={member.role} />
        <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">{member.petName}</p>
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] truncate">
          @{member.discordName}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-1 px-1">
        <div className="flex justify-between">
          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Contribution</span>
          <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">
            {Number(member.contributionXp).toLocaleString()} XP
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Pet Level</span>
          <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">Lv.{member.petLevel}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Joined</span>
          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
            {relativeTime(member.joinedAt)}
          </span>
        </div>
      </div>

      {/* Admin actions */}
      {hasActions && (
        <div className="pt-1 border-t border-[#1a2a3c]">
          {!showActions ? (
            <button
              onClick={() => setShowActions(true)}
              className="w-full font-pixel text-[9px] py-1 text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors"
            >
              {"\u2699"} Actions
            </button>
          ) : (
            <div className="space-y-1">
              {canPromoteDemote && promoteOptions.length > 0 && (
                <div className="space-y-0.5">
                  <span className="font-pixel text-[8px] text-[#40d870] uppercase">Promote to:</span>
                  {promoteOptions.map((r) => (
                    <button
                      key={r}
                      disabled={isActing}
                      onClick={() => onAction(member.discordId, "promote", r)}
                      className="w-full font-pixel text-[9px] py-1 border border-[#40d870]/30 text-[#40d870] bg-[#40d870]/5 hover:bg-[#40d870]/10 transition-colors disabled:opacity-40"
                    >
                      {"\u2191"} {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              )}
              {canPromoteDemote && demoteOptions.length > 0 && (
                <div className="space-y-0.5">
                  <span className="font-pixel text-[8px] text-[#f0c040] uppercase">Demote to:</span>
                  {demoteOptions.map((r) => (
                    <button
                      key={r}
                      disabled={isActing}
                      onClick={() => onAction(member.discordId, "demote", r)}
                      className="w-full font-pixel text-[9px] py-1 border border-[#f0c040]/30 text-[#f0c040] bg-[#f0c040]/5 hover:bg-[#f0c040]/10 transition-colors disabled:opacity-40"
                    >
                      {"\u2193"} {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              )}
              {canKick && (
                <button
                  disabled={isActing}
                  onClick={() => {
                    if (confirm(`Kick ${member.petName} (@${member.discordName}) from the family?`)) {
                      onAction(member.discordId, "kick")
                    }
                  }}
                  className="w-full font-pixel text-[9px] py-1 border border-[#e04040]/30 text-[#e04040] bg-[#e04040]/5 hover:bg-[#e04040]/10 transition-colors disabled:opacity-40"
                >
                  {"\u2716"} Kick
                </button>
              )}
              <button
                onClick={() => setShowActions(false)}
                className="w-full font-pixel text-[8px] py-0.5 text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </PixelCard>
  )
}

function InvitePanel({ familyId }: { familyId: number }) {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [inviting, setInviting] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    if (!query.trim() || searching) return
    setSearching(true)
    setResults([])
    try {
      const res = await fetch(`/api/pet/friends/search?q=${encodeURIComponent(query.trim())}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error || "Search failed")
        return
      }
      const data = await res.json()
      setResults(data.results ?? [])
      // --- AI-MODIFIED (2026-04-25) ---
      // Purpose: Use toast.info for neutral "no results" notification
      if (!data.results?.length) toast.info("No users found")
      // --- END AI-MODIFIED ---
    } catch {
      toast.error("Search failed")
    } finally {
      setSearching(false)
    }
  }, [query, searching])

  const handleInvite = useCallback(async (targetUserId: string) => {
    if (inviting) return
    setInviting(targetUserId)
    try {
      await dashboardMutate("POST", "/api/pet/family/invite", { targetUserId })
      toast.success("Invite sent!")
      setResults((prev) => prev.filter((r) => r.discordId !== targetUserId))
    } catch (err: any) {
      toast.error(err.message || "Failed to invite")
    } finally {
      setInviting(null)
    }
  }, [inviting])

  return (
    <PixelCard className="p-4 space-y-3" corners>
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\u{1F4E8}"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Invite Members</span>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Discord username or ID"
          className="flex-1 font-pixel text-sm px-3 py-2 bg-[#0a0e1a] border-2 border-[#2a3a5c] outline-none text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c] focus:border-[var(--pet-gold,#f0c040)] transition-colors"
        />
        <PixelButton
          variant="info"
          size="sm"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          loading={searching}
        >
          Search
        </PixelButton>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div
              key={user.discordId}
              className="flex items-center gap-3 px-3 py-2 bg-[#0a0e1a] border border-[#2a3a5c]"
            >
              <div className="w-8 h-8 flex-shrink-0 border border-[#3a4a6c] bg-[#080c18] flex items-center justify-center overflow-hidden">
                {user.avatarHash ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatarHash}.png?size=64`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-pixel text-[10px] text-[#3a4a5c]">{"\u{1F464}"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] truncate">{user.petName}</p>
                <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                  @{user.discordName} &middot; Lv.{user.petLevel}
                </p>
              </div>
              <PixelButton
                variant="gold"
                size="sm"
                disabled={inviting === user.discordId}
                loading={inviting === user.discordId}
                onClick={() => handleInvite(user.discordId)}
              >
                Invite
              </PixelButton>
            </div>
          ))}
        </div>
      )}
    </PixelCard>
  )
}

export default function FamilyMembers() {
  const { data: session } = useSession()
  const router = useRouter()

  const { data: overviewData, isLoading: overviewLoading } = useDashboard<FamilyOverviewData>(
    session ? "/api/pet/family" : null
  )

  const familyId = overviewData?.family?.familyId
  const myRole = overviewData?.membership?.role ?? "MEMBER"
  const rolePermissions = overviewData?.family?.rolePermissions

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Members API no longer needs familyId param (uses auth user's family)
  const { data: membersData, error: membersError, isLoading: membersLoading, mutate: mutateMembers } =
    useDashboard<FamilyMembersData>(
      familyId ? `/api/pet/family/members` : null
    )
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (!overviewLoading && !overviewData?.family) {
      router.replace("/pet/family")
    }
  }, [overviewLoading, overviewData, router])

  const sortedMembers = useMemo(() => {
    if (!membersData?.members) return []
    return [...membersData.members].sort((a, b) => {
      const rankDiff = roleRank(b.role) - roleRank(a.role)
      if (rankDiff !== 0) return rankDiff
      return Number(b.contributionXp) - Number(a.contributionXp)
    })
  }, [membersData?.members])

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Route actions to correct API endpoints (role.ts for promote/demote, kick.ts for kick)
  const handleMemberAction = useCallback(async (discordId: string, action: string, newRole?: string) => {
    try {
      if (action === "kick") {
        await dashboardMutate("POST", "/api/pet/family/kick", {
          targetUserId: discordId,
        })
      } else {
        await dashboardMutate("POST", "/api/pet/family/role", {
          targetUserId: discordId,
          newRole: newRole,
        })
      }
      const labels: Record<string, string> = { promote: "Promoted!", demote: "Demoted!", kick: "Kicked!" }
      toast.success(labels[action] || "Done!")
      mutateMembers()
      invalidate("/api/pet/family")
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    }
  }, [mutateMembers])
  // --- END AI-MODIFIED ---

  const canInvite = hasPermission(myRole, "invite_members", rolePermissions)

  if (!overviewData?.family) {
    return (
      <Layout SEO={{ title: "Family Members - LionGotchi", description: "Family member list" }}>
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
                <Skeleton className="h-12" />
                <Skeleton className="h-64" />
          {/* --- AI-REPLACED (2026-03-24) --- */}
          {/* Original closing: </div></div></div> */}
          </PetShell>
          {/* --- END AI-REPLACED --- */}
        </AdminGuard>
      </Layout>
    )
  }

  return (
    <Layout SEO={{ title: "Family Members - LionGotchi", description: "Manage your family members" }}>
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
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href="/pet/family">
                    <span className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors cursor-pointer">
                      {"\u2190"} {overviewData.family.name}
                    </span>
                  </Link>
                  <RoleBadge role={myRole} />
                </div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)] mt-1">Members</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  {membersData?.members.length ?? "..."} members
                </p>
              </div>

              {/* Members grid */}
              {membersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-[300px]" />
                  ))}
                </div>
              ) : membersError ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
                    {(membersError as Error).message}
                  </p>
                </PixelCard>
              ) : sortedMembers.length === 0 ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">No members found</p>
                </PixelCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {sortedMembers.map((member) => (
                    <MemberCard
                      key={member.discordId}
                      member={member}
                      myRole={myRole}
                      rolePermissions={rolePermissions}
                      onAction={handleMemberAction}
                      acting={null}
                    />
                  ))}
                </div>
              )}

              {/* Invite panel */}
              {canInvite && familyId && (
                <InvitePanel familyId={familyId} />
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
