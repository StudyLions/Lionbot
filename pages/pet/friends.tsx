// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Friends list page - search, pending requests,
//          friend grid with PetProfileCard, activity feed,
//          block list management
// ============================================================
import { useState, useCallback, useMemo } from "react"
import { relativeTime } from "@/utils/relativeTime"
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, dashboardMutate, invalidatePrefix } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBar from "@/components/pet/ui/PixelBar"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: PetProfileCard removed -- friends grid now uses inline PixelCard since API
//          doesn't return full petVisual data for every friend (too expensive to batch)
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Match API response shape -- API returns name/expression/friendsSince, not discordName/food/bath/sleep/petVisual
interface FriendEntry {
  discordId: string
  name: string | null
  avatarHash?: string | null
  petName: string | null
  petLevel: number
  expression: string
  friendsSince: string | null
  food?: number
  bath?: number
  sleep?: number
}
// --- END AI-MODIFIED ---

interface PendingRequest {
  requestId: number
  fromUserId: string
  fromUserName: string
  fromPetName: string
  fromAvatarHash?: string | null
  createdAt: string
}

interface BlockedUser {
  userId: string
  userName: string
  blockedAt: string
}

interface SearchResult {
  discordId: string
  discordName: string
  avatarHash?: string | null
  petName: string
  petLevel: number
  isFriend: boolean
  isPending: boolean
}

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Match activity event shape from API (was id/text/icon/createdAt, API returns type/userId/userName/description/timestamp)
interface ActivityEvent {
  type: string
  userId: string
  userName: string
  description: string
  timestamp: string
}

const ACTIVITY_ICONS: Record<string, string> = {
  rare_drop: "\uD83D\uDC8E",
  marketplace_listing: "\uD83D\uDED2",
  level_up: "\u2B50",
}
// --- END AI-MODIFIED ---

interface FriendsData {
  friends: FriendEntry[]
  pendingCount: number
  maxFriends: number
}

// --- AI-REPLACED (2026-03-24) ---
// Reason: Replaced local relativeTime with shared version from @/utils/relativeTime (imported at top)
// --- Original code (commented out for rollback) ---
// function relativeTime(dateStr: string): string {
//   const diff = Date.now() - new Date(dateStr).getTime()
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

function avatarUrl(discordId: string, hash?: string | null): string {
  if (hash) return `https://cdn.discordapp.com/avatars/${discordId}/${hash}.png?size=64`
  const idx = Number((BigInt(discordId) >> BigInt(22)) % BigInt(6))
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

export default function FriendsPage() {
  const { data: session } = useSession()

  const { data: friendsData, isLoading } = useDashboard<FriendsData>(
    session ? "/api/pet/friends" : null
  )
  const { data: pendingData, mutate: mutatePending } = useDashboard<{ requests: PendingRequest[] }>(
    session ? "/api/pet/friends/pending" : null
  )
  const { data: blockedData, mutate: mutateBlocked } = useDashboard<{ blocked: BlockedUser[] }>(
    session ? "/api/pet/friends/blocked" : null
  )
  const { data: activityData } = useDashboard<{ events: ActivityEvent[] }>(
    session ? "/api/pet/friends/activity" : null
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(true)
  const [activityOpen, setActivityOpen] = useState(true)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const friends = friendsData?.friends ?? []
  const pending = pendingData?.requests ?? []
  const blocked = blockedData?.blocked ?? []
  const activity = activityData?.events ?? []
  const maxFriends = friendsData?.maxFriends ?? 10

  const nextSlotLevel = useMemo(() => {
    if (!friendsData) return null
    const thresholds = [5, 10, 15, 20, 30, 40, 50]
    return thresholds.find((t) => t > friends.length) ?? null
  }, [friendsData, friends.length])

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearching(true)
    try {
      const res = await fetch(`/api/pet/friends/search?q=${encodeURIComponent(q)}`)
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Search failed")
        return
      }
      setSearchResults(body.results ?? [])
    } catch {
      toast.error("Network error")
    } finally {
      setSearching(false)
    }
  }, [searchQuery])

  const handleAddFriend = useCallback(async (targetUserId: string) => {
    setActionLoading(targetUserId)
    try {
      // --- AI-MODIFIED (2026-03-24) ---
      // Purpose: request API expects { query } not { targetUserId }
      await dashboardMutate("POST", "/api/pet/friends/request", { query: targetUserId })
      // --- END AI-MODIFIED ---
      toast.success("Friend request sent!")
      setSearchResults((prev) =>
        prev?.map((r) => r.discordId === targetUserId ? { ...r, isPending: true } : r) ?? null
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to send request")
    } finally {
      setActionLoading(null)
    }
  }, [])

  const handleRespond = useCallback(async (requestId: number, action: "accept" | "decline") => {
    setActionLoading(`req-${requestId}`)
    try {
      await dashboardMutate("POST", "/api/pet/friends/respond", { requestId, action })
      toast.success(action === "accept" ? "Friend added!" : "Request declined")
      mutatePending()
      invalidatePrefix("/api/pet/friends")
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setActionLoading(null)
    }
  }, [mutatePending])

  const handleUnblock = useCallback(async (targetUserId: string) => {
    setActionLoading(`block-${targetUserId}`)
    try {
      await dashboardMutate("POST", "/api/pet/friends/block", { targetUserId, action: "unblock" })
      toast.success("User unblocked")
      mutateBlocked()
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setActionLoading(null)
    }
  }, [mutateBlocked])

  return (
    <Layout SEO={{ title: "Friends - LionGotchi", description: "Manage your LionGotchi friends" }}>
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
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Friends</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Visit friends, care for their pets, water their farms
                </p>
              </div>

              {/* Search */}
              <PixelCard className="p-4 space-y-3" corners>
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
                  <span className="font-pixel text-[14px]">🔍</span>
                  <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">Find Friends</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Discord username or ID..."
                    className={cn(
                      "flex-1 font-pixel text-[13px] px-3 py-2",
                      "bg-[#080c18] border-2 border-[#2a3a5c] text-[var(--pet-text,#e2e8f0)]",
                      "placeholder:text-[#3a4a5c] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                    )}
                  />
                  <PixelButton
                    variant="info"
                    size="sm"
                    onClick={handleSearch}
                    loading={searching}
                  >
                    Search
                  </PixelButton>
                </div>

                {searchResults !== null && (
                  <div className="space-y-2 pt-1">
                    {searchResults.length === 0 ? (
                      <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] text-center py-2">
                        No users found
                      </p>
                    ) : (
                      searchResults.map((user) => (
                        <div
                          key={user.discordId}
                          className="flex items-center gap-3 px-3 py-2 border-2 border-[#1a2a3c] bg-[#080c18]"
                        >
                          <img
                            src={avatarUrl(user.discordId, user.avatarHash)}
                            alt=""
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">
                              {user.petName}
                            </p>
                            <p className="font-pixel text-[11px] text-[#6a7a8c] truncate">
                              {user.discordName} · Lv.{user.petLevel}
                            </p>
                          </div>
                          {user.isFriend ? (
                            <span className="font-pixel text-[11px] text-[var(--pet-green,#40d870)]">Friends</span>
                          ) : user.isPending ? (
                            <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)]">Pending</span>
                          ) : (
                            <PixelButton
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddFriend(user.discordId)}
                              loading={actionLoading === user.discordId}
                            >
                              Add Friend
                            </PixelButton>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </PixelCard>

              {/* Pending Requests */}
              {pending.length > 0 && (
                <PixelCard className="p-4 space-y-3" corners>
                  <button
                    onClick={() => setPendingOpen(!pendingOpen)}
                    className="flex items-center justify-between w-full pb-2 border-b-2 border-[#1a2a3c]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[14px]">📬</span>
                      <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                        Pending Requests ({pending.length})
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-[#8899aa] transition-transform",
                        pendingOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {pendingOpen && (
                    <div className="space-y-2">
                      {pending.map((req) => (
                        <div
                          key={req.requestId}
                          className="flex items-center gap-3 px-3 py-2 border-2 border-[#1a2a3c] bg-[#080c18]"
                        >
                          <img
                            src={avatarUrl(req.fromUserId, req.fromAvatarHash)}
                            alt=""
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">
                              {req.fromUserName}
                            </p>
                            <p className="font-pixel text-[11px] text-[#6a7a8c] truncate">
                              Pet: {req.fromPetName} · {relativeTime(req.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <PixelButton
                              variant="primary"
                              size="sm"
                              onClick={() => handleRespond(req.requestId, "accept")}
                              loading={actionLoading === `req-${req.requestId}`}
                            >
                              Accept
                            </PixelButton>
                            <PixelButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRespond(req.requestId, "decline")}
                              disabled={actionLoading === `req-${req.requestId}`}
                            >
                              Decline
                            </PixelButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </PixelCard>
              )}

              {/* Friend Count Bar */}
              {!isLoading && friendsData && (
                <div
                  className="border-[3px] border-[#3a4a6c] bg-gradient-to-b from-[#111828] to-[#0c1020] px-4 py-3"
                  style={{ boxShadow: "3px 3px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                      {friends.length}/{maxFriends} Friends
                    </span>
                    {nextSlotLevel && (
                      <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                        Reach Lv.{nextSlotLevel} for +1 slot
                      </span>
                    )}
                  </div>
                  <PixelBar
                    value={friends.length}
                    max={maxFriends}
                    color="blue"
                    showText={false}
                    segments={Math.max(maxFriends, 10)}
                  />
                </div>
              )}

              {/* Friends Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-56" />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <PixelCard className="p-12 text-center space-y-3" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                    No friends yet
                  </p>
                  <p className="font-pixel text-[13px] text-[#3a4a5c]">
                    Search for users above to send friend requests!
                  </p>
                </PixelCard>
              ) : (
                // --- AI-MODIFIED (2026-03-24) ---
                // Purpose: Render friend cards using API shape (name instead of discordName, no petVisual)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {friends.map((friend) => (
                    <a
                      key={friend.discordId}
                      href={`/pet/friends/${friend.discordId}`}
                      className="block"
                    >
                      <PixelCard className="p-4 space-y-2 hover:border-[var(--pet-blue,#4080f0)] transition-colors cursor-pointer" corners>
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl(friend.discordId, friend.avatarHash)}
                            alt=""
                            className="w-10 h-10 rounded-full border-2 border-[#2a3a5c] flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">
                              {friend.petName ?? "Unknown Pet"}
                            </p>
                            <p className="font-pixel text-[11px] text-[#6a7a8c] truncate">
                              {friend.name ?? friend.discordId} · Lv.{friend.petLevel}
                            </p>
                          </div>
                        </div>
                        {(friend.food != null && friend.bath != null && friend.sleep != null) && (
                          <div className="flex gap-2 pt-1">
                            <PixelBar value={friend.food} max={8} label="🍖" color="gold" showText={false} />
                            <PixelBar value={friend.bath} max={8} label="🧼" color="blue" showText={false} />
                            <PixelBar value={friend.sleep} max={8} label="💤" color="blue" showText={false} />
                          </div>
                        )}
                      </PixelCard>
                    </a>
                  ))}
                </div>
                // --- END AI-MODIFIED ---
              )}

              {/* Activity Feed */}
              {activity.length > 0 && (
                <PixelCard className="p-4 space-y-3" corners>
                  <button
                    onClick={() => setActivityOpen(!activityOpen)}
                    className="flex items-center justify-between w-full pb-2 border-b-2 border-[#1a2a3c]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[14px]">📰</span>
                      <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                        Friend Activity
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-[#8899aa] transition-transform",
                        activityOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* --- AI-MODIFIED (2026-03-24) --- */}
                  {/* Purpose: Use API field names (type/userName/description/timestamp) and icon mapping */}
                  {activityOpen && (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {activity.map((event, idx) => (
                        <div
                          key={`${event.type}-${event.userId}-${idx}`}
                          className="flex items-start gap-2 px-2 py-1.5"
                        >
                          <span className="text-sm flex-shrink-0 mt-0.5">{ACTIVITY_ICONS[event.type] ?? "\u2728"}</span>
                          <p className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] flex-1 min-w-0">
                            <span className="text-[var(--pet-gold,#f0c040)]">{event.userName}</span>{" "}
                            {event.description}
                          </p>
                          <span className="font-pixel text-[10px] text-[#4a5a6a] flex-shrink-0 whitespace-nowrap">
                            {relativeTime(event.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* --- END AI-MODIFIED --- */}
                </PixelCard>
              )}

              {/* Block List */}
              {blocked.length > 0 && (
                <PixelCard className="p-4 space-y-3" corners>
                  <button
                    onClick={() => setBlockedOpen(!blockedOpen)}
                    className="flex items-center justify-between w-full pb-2 border-b-2 border-[#1a2a3c]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[14px]">🚫</span>
                      <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                        Blocked Users ({blocked.length})
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-[#8899aa] transition-transform",
                        blockedOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {blockedOpen && (
                    <div className="space-y-2">
                      {blocked.map((user) => (
                        <div
                          key={user.userId}
                          className="flex items-center gap-3 px-3 py-2 border-2 border-[#1a2a3c] bg-[#080c18]"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">
                              {user.userName}
                            </p>
                            <p className="font-pixel text-[11px] text-[#4a5a6a]">
                              Blocked {relativeTime(user.blockedAt)}
                            </p>
                          </div>
                          <PixelButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnblock(user.userId)}
                            loading={actionLoading === `block-${user.userId}`}
                          >
                            Unblock
                          </PixelButton>
                        </div>
                      ))}
                    </div>
                  )}
                </PixelCard>
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
