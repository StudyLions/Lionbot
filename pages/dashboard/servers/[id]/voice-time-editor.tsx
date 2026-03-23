// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor admin page - PremiumGate for non-premium,
//          admin config (toggle, limits, auto-disable) for premium servers
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, SectionCard, SettingRow, Toggle, NumberInput, SaveBar, toast } from "@/components/dashboard/ui"
import PremiumGate from "@/components/dashboard/PremiumGate"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import {
  Clock, Pencil, Flame, Shield, Settings, BarChart3, Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const FEATURE_CARDS = [
  { icon: Clock, label: "Add Missed Sessions", desc: "Users can log study time that wasn't tracked" },
  { icon: Pencil, label: "Edit Duration", desc: "Adjust session length for inaccurate tracking" },
  { icon: Flame, label: "Recover Streaks", desc: "Fill gaps caused by bot downtime or absences" },
  { icon: Shield, label: "Audit Trail", desc: "Every edit is logged for transparency" },
  { icon: Settings, label: "Admin Controls", desc: "Toggle on/off and set monthly limits" },
  { icon: BarChart3, label: "Monthly Limits", desc: "Cap how many edits each user can make" },
]

interface ConfigData {
  isPremium: boolean
  config: {
    manual_sessions_enabled: boolean
    manual_sessions_limit: number
    manual_sessions_until: string | null
  }
  stats: {
    totalEditsThisMonth: number
  }
}

export default function VoiceTimeEditorAdminPage() {
  const router = useRouter()
  const { id } = router.query
  const serverId = id as string

  const { data, isLoading, mutate } = useDashboard<ConfigData>(
    serverId ? `/api/dashboard/servers/${serverId}/voice-time-editor` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    serverId ? `/api/dashboard/servers/${serverId}` : null
  )
  const serverName = serverData?.server?.name || "Server"

  const isPremium = data?.isPremium ?? false

  const [enabled, setEnabled] = useState(false)
  const [limit, setLimit] = useState(5)
  const [untilDate, setUntilDate] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.config) {
      setEnabled(data.config.manual_sessions_enabled)
      setLimit(data.config.manual_sessions_limit)
      setUntilDate(data.config.manual_sessions_until ? data.config.manual_sessions_until.slice(0, 10) : "")
      setHasChanges(false)
    }
  }, [data])

  const handleSave = async () => {
    setSaving(true)
    try {
      const resp = await dashboardMutate("PATCH", `/api/dashboard/servers/${serverId}/voice-time-editor`, {
        manual_sessions_enabled: enabled,
        manual_sessions_limit: limit,
        manual_sessions_until: untilDate ? new Date(untilDate + "T23:59:59Z").toISOString() : null,
      })
      if (resp.error) {
        toast.error(resp.error)
      } else {
        toast.success("Settings saved")
        mutate()
        setHasChanges(false)
      }
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout SEO={{ title: `Voice Time Editor - ${serverName} - LionBot`, description: "Configure Voice Time Editor" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-6xl mx-auto flex gap-8">
              <ServerNav serverId={serverId} serverName={serverName} isAdmin isMod />
              <div className="flex-1 min-w-0 max-w-4xl space-y-6">

                  <PageHeader
                    title="Voice Time Editor"
                    description="Let members add missed study sessions and edit their session history. Stats only — no coins or XP."
                  />

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-card/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : !isPremium ? (
                    <PremiumGate
                      title="Voice Time Editor"
                      subtitle="Let your members add missed study sessions, edit durations, and recover lost streaks — all with full audit logging and monthly limits you control."
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                        {FEATURE_CARDS.map(f => (
                          <div
                            key={f.label}
                            className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/20 transition-colors"
                          >
                            <div className="text-amber-400/80 mb-2"><f.icon size={18} /></div>
                            <p className="text-sm font-semibold text-gray-200">{f.label}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
                          </div>
                        ))}
                      </div>
                    </PremiumGate>
                  ) : (
                    <>
                      <SectionCard title="Configuration">
                        <div className="space-y-0">
                          <SettingRow
                            label="Enable Voice Time Editor"
                            description="When enabled, members can add and edit study sessions from their dashboard"
                          >
                            <Toggle
                              checked={enabled}
                              onChange={v => { setEnabled(v); setHasChanges(true) }}
                            />
                          </SettingRow>

                          <SettingRow
                            label="Monthly edit limit per user"
                            description="How many session adds/edits each member can make per calendar month"
                          >
                            <NumberInput
                              value={limit}
                              onChange={v => { setLimit(v); setHasChanges(true) }}
                              min={1}
                              max={50}
                            />
                          </SettingRow>

                          <SettingRow
                            label="Auto-disable after (optional)"
                            description="If set, the feature automatically disables after this date"
                          >
                            <input
                              type="date"
                              value={untilDate}
                              onChange={e => { setUntilDate(e.target.value); setHasChanges(true) }}
                              className="bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {untilDate && (
                              <button
                                onClick={() => { setUntilDate(""); setHasChanges(true) }}
                                className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                Clear
                              </button>
                            )}
                          </SettingRow>
                        </div>
                      </SectionCard>

                      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                        <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-300/80 leading-relaxed space-y-1">
                          <p>Manual sessions only affect <strong>stats, leaderboards, and streaks</strong>.</p>
                          <p>They do <strong>not</strong> earn coins, XP, or affect LionGotchi. Every edit is logged in an audit trail.</p>
                        </div>
                      </div>

                      {data?.stats && (
                        <SectionCard title="Usage This Month">
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BarChart3 size={18} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-foreground">{data.stats.totalEditsThisMonth}</p>
                              <p className="text-xs text-muted-foreground">total edits across all members</p>
                            </div>
                          </div>
                        </SectionCard>
                      )}

                      <SaveBar
                        show={hasChanges}
                        onSave={handleSave}
                        onReset={() => {
                          if (data?.config) {
                            setEnabled(data.config.manual_sessions_enabled)
                            setLimit(data.config.manual_sessions_limit)
                            setUntilDate(data.config.manual_sessions_until ? data.config.manual_sessions_until.slice(0, 10) : "")
                          }
                          setHasChanges(false)
                        }}
                        saving={saving}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
