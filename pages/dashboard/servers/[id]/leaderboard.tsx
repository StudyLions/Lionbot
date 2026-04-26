// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Leaderboard configuration page (season, unranked roles, role filter)
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
import {
  PageHeader,
  SectionCard,
  SettingRow,
  RoleSelect,
  FirstTimeBanner,
  SaveBar,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { BarChart3, EyeOff, Filter } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface LeaderboardConfigData {
  seasonStart: string | null
  roleFilterEnabled: boolean
  unrankedRoleIds: string[]
  filterRoleIds: string[]
}

export default function LeaderboardConfigPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const { data: lbData, isLoading: loading, mutate } = useDashboard<LeaderboardConfigData>(
    id && session ? `/api/dashboard/servers/${id}/leaderboard-config` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"

  const [data, setData] = useState<LeaderboardConfigData | null>(null)
  const [original, setOriginal] = useState<LeaderboardConfigData | null>(null)

  useEffect(() => {
    if (lbData) {
      setData(lbData)
      setOriginal({ ...lbData })
    } else if (lbData === undefined && !loading) {
      setData(null)
      setOriginal(null)
    }
  }, [lbData, loading])

  const [saving, setSaving] = useState(false)

  const set = useCallback((updates: Partial<LeaderboardConfigData>) => {
    setData((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const hasChanges =
    data &&
    original &&
    (data.seasonStart !== original.seasonStart ||
      data.roleFilterEnabled !== original.roleFilterEnabled ||
      JSON.stringify([...data.unrankedRoleIds].sort()) !== JSON.stringify([...original.unrankedRoleIds].sort()) ||
      JSON.stringify([...data.filterRoleIds].sort()) !== JSON.stringify([...original.filterRoleIds].sort()))

  const handleSave = async () => {
    if (!data || !original || !hasChanges) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/leaderboard-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonStart: data.seasonStart,
          roleFilterEnabled: data.roleFilterEnabled,
          unrankedRoleIds: data.unrankedRoleIds || [],
          filterRoleIds: data.filterRoleIds || [],
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      setOriginal({ ...data })
      mutate()
      toast.success("Leaderboard settings saved — allow 1-2 min for changes to take effect")
    } catch {
      toast.error("Failed to save. Check your permissions.")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) setData({ ...original })
  }

  return (
    <Layout
      SEO={{
        title: `Leaderboard - ${serverName} - LionBot`,
        description: "Configure leaderboard settings, seasons, and role filters",
      }}
    >
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-5xl mx-auto flex gap-8">
                <ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />
                <div className="flex-1 min-w-0">
            --- End original code --- */}
        <DashboardShell nav={<ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />}>
        {/* --- END AI-REPLACED --- */}
              <PageHeader
                title="Leaderboard"
                description="Configure leaderboard seasons, hidden roles, and role-based filtering for the /leaderboard command."
              />

              <FirstTimeBanner
                storageKey="leaderboard-config-intro"
                title="Leaderboard Settings"
                description="Control how the /leaderboard command works in your server. Set a season start date for periodic rankings, hide roles from the leaderboard, and optionally let users filter by specific roles."
                icon={<BarChart3 size={22} />}
              />

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-card/50 border border-border rounded-xl p-6 animate-pulse"
                    >
                      <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                      <div className="space-y-3">
                        <div className="h-10 bg-muted rounded" />
                        <div className="h-10 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !data ? (
                // --- AI-MODIFIED (2026-04-25) ---
                // Purpose: This page requires admin (see ServerGuard requiredLevel="admin"
                // on line 115); the previous copy said "moderator" which was incorrect.
                <div className="text-center py-20">
                  <p className="text-muted-foreground">
                    Unable to load leaderboard settings. You may not have administrator permissions.
                  </p>
                </div>
                // --- END AI-MODIFIED ---
              ) : (
                <div className="space-y-4">
                  <SectionCard
                    title="General"
                    description="Season and visibility settings"
                    icon={<BarChart3 size={18} />}
                  >
                    <SettingRow
                      label="Season Start Date"
                      description="When the current ranking season started"
                      tooltip="Leaderboards and rank progress are counted from this date. Set a date to start a new season, or leave empty for all-time tracking."
                    >
                      <input
                        type="date"
                        value={data.seasonStart ? new Date(data.seasonStart).toISOString().split("T")[0] : ""}
                        onChange={(e) =>
                          set({ seasonStart: e.target.value ? new Date(e.target.value).toISOString() : null })
                        }
                        className="bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Unranked Roles"
                      description="Roles hidden from the leaderboard"
                      tooltip="Members with any of these roles won't appear on the server leaderboard. Useful for moderators or bots."
                    >
                      <RoleSelect
                        guildId={guildId}
                        value={data.unrankedRoleIds || []}
                        onChange={(v) =>
                          set({ unrankedRoleIds: Array.isArray(v) ? v : v ? [v] : [] })
                        }
                        placeholder="Select roles to hide from leaderboard"
                        multiple
                        excludeEveryone
                      />
                    </SettingRow>
                  </SectionCard>

                  <SectionCard
                    title="Role Filtering"
                    description="Let users filter the leaderboard by role"
                    icon={<Filter size={18} />}
                  >
                    <SettingRow
                      label="Enable Role Filtering"
                      description='When enabled, a "Filter by Role" dropdown appears on the /leaderboard command'
                      tooltip="Users can filter the leaderboard to show only members with a specific role. You choose which roles are available as filter options below."
                    >
                      <button
                        type="button"
                        role="switch"
                        aria-checked={data.roleFilterEnabled}
                        onClick={() => set({ roleFilterEnabled: !data.roleFilterEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                          data.roleFilterEnabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            data.roleFilterEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </SettingRow>
                    {data.roleFilterEnabled && (
                      <SettingRow
                        label="Filterable Roles"
                        description="Roles users can filter the leaderboard by (max 24)"
                        tooltip="Only these roles will appear as options in the role filter dropdown on the /leaderboard command."
                      >
                        <RoleSelect
                          guildId={guildId}
                          value={data.filterRoleIds || []}
                          onChange={(v) =>
                            set({ filterRoleIds: Array.isArray(v) ? (v as string[]).slice(0, 24) : v ? [v] : [] })
                          }
                          placeholder="Select roles for leaderboard filter"
                          multiple
                          excludeEveryone
                          excludeManaged
                        />
                      </SettingRow>
                    )}
                  </SectionCard>
                </div>
              )}

              <SaveBar
                show={!!hasChanges}
                onSave={handleSave}
                onReset={handleReset}
                saving={saving}
              />
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
