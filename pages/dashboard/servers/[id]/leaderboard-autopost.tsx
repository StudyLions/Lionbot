// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Leaderboard auto-post config dashboard page
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  SectionCard, SettingRow, Toggle, NumberInput, TextInput,
  ChannelSelect, RoleSelect, SaveBar, PageHeader, toast,
  ConfirmModal, EmptyState, Badge,
} from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useCallback } from "react"
import {
  Trophy, Plus, Trash2, Play, Eye, Zap,
  Clock, Hash, Send, Bell, Shield,
  BarChart3, CheckCircle, XCircle, Loader2,
  Coins, Settings2, Medal,
} from "lucide-react"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Premium gate component for non-premium servers
import PremiumGate from "@/components/dashboard/PremiumGate"
// --- END AI-MODIFIED ---
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Types ──────────────────────────────────────────────────

interface RewardTier {
  from: number
  to: number
  coins: number
}

interface EmbedField {
  name: string
  value: string
  inline: boolean
}

interface AutopostConfig {
  configid: number
  guildid: string
  config_name: string
  enabled: boolean
  lb_type: string
  messages_metric: string
  frequency: string
  seasonal_mode: string | null
  week_starts_on: string
  top_count: number
  post_channel: string | null
  post_day: number | null
  post_hour: number
  post_minute: number
  top1_roles: string[]
  topn_roles: string[]
  auto_remove_roles: boolean
  reward_tiers: RewardTier[]
  announce_content: string | null
  embed_title: string | null
  embed_description: string | null
  embed_footer: string | null
  embed_color: number | null
  embed_url: string | null
  embed_author_name: string | null
  embed_author_url: string | null
  embed_fields: EmbedField[]
  include_image: boolean
  mention_winners: boolean
  pin_post: boolean
  delete_previous: boolean
  min_threshold: number | null
  notify_public_post: boolean
  notify_dm_winners: boolean
  dm_scope: string
  dm_template_title: string | null
  dm_template_body: string | null
  dm_stagger_seconds: number
  notify_mod_log: boolean
  mod_log_channel: string | null
  skip_if_empty: boolean
  skip_if_same_as_last: boolean
  continue_on_partial: boolean
  max_coins_per_user: number | null
  last_posted_at: string | null
  last_message_id: string | null
  last_winner_ids: any
  created_at: string | null
}

interface HistoryEntry {
  historyid: number
  configid: number
  posted_at: string
  top_users: any
  roles_added: number
  roles_removed: number
  coins_awarded: number
  dms_sent: number
  dms_failed: number
  status: string
  error_message: string | null
}

// ── Presets ─────────────────────────────────────────────────

const PRESETS: Record<string, Partial<AutopostConfig> & { _label: string; _desc: string; _color: string }> = {
  weekly_study_buddies: {
    _label: "Weekly Study Buddies",
    _desc: "Post top 10 studiers every Sunday with tiered coin rewards",
    _color: "text-yellow-400",
    config_name: "Weekly Study Buddies",
    lb_type: "study",
    frequency: "weekly",
    top_count: 10,
    post_day: 6,
    post_hour: 20,
    post_minute: 0,
    week_starts_on: "monday",
    embed_color: 16766720,
    include_image: true,
    announce_content: "{topn_role} The following LionCoins are awarded to you!\n{reward_summary}",
    embed_title: "TOP {top_count} WEEKLY STUDY BUDDIES",
    embed_description: "Here are our {topn_role} for the week of **{period}**:",
    embed_footer: "{server_name}",
    embed_fields: [{ name: "Note:", value: "The users below will hold the role for one (1) week. If you wish to have the role removed, please contact a Server Moderator.", inline: false }],
    reward_tiers: [
      { from: 1, to: 1, coins: 3000 },
      { from: 2, to: 2, coins: 2000 },
      { from: 3, to: 3, coins: 1500 },
      { from: 4, to: 10, coins: 1000 },
    ],
  },
  daily_grind: {
    _label: "Daily Grind",
    _desc: "Post top 5 studiers every day at 10pm",
    _color: "text-blue-400",
    config_name: "Daily Grind",
    lb_type: "study",
    frequency: "daily",
    top_count: 5,
    post_hour: 22,
    post_minute: 0,
    embed_color: 3447003,
    include_image: true,
    embed_title: "DAILY TOP {top_count} STUDY LEADERBOARD",
    embed_description: "Top studiers for **{period}**:",
    embed_footer: "{server_name}",
    reward_tiers: [
      { from: 1, to: 1, coins: 500 },
      { from: 2, to: 5, coins: 200 },
    ],
  },
  monthly_champions: {
    _label: "Monthly Champions",
    _desc: "Post top 10 studiers on the 1st of each month",
    _color: "text-purple-400",
    config_name: "Monthly Champions",
    lb_type: "study",
    frequency: "monthly",
    top_count: 10,
    post_day: 1,
    post_hour: 12,
    post_minute: 0,
    embed_color: 10181046,
    include_image: true,
    embed_title: "MONTHLY CHAMPIONS",
    embed_description: "Our top {top_count} studiers for **{period}**:",
    embed_footer: "{server_name}",
    reward_tiers: [
      { from: 1, to: 1, coins: 10000 },
      { from: 2, to: 3, coins: 5000 },
      { from: 4, to: 10, coins: 2000 },
    ],
  },
}

// ── Helpers ─────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "seasonal", label: "Seasonal" },
]
const LB_TYPE_OPTIONS = [
  { value: "study", label: "Study Time", icon: <Clock size={14} /> },
  { value: "messages", label: "Messages", icon: <Hash size={14} /> },
  { value: "coins", label: "LionCoins", icon: <BarChart3 size={14} /> },
]
const DM_SCOPE_OPTIONS = [
  { value: "top_1", label: "Top 1 only" },
  { value: "top_3", label: "Top 3" },
  { value: "top_n", label: "All Top N" },
]
const WEEK_START_OPTIONS = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
  { value: "match_dashboard", label: "Match website leaderboard" },
]
const SEASONAL_MODE_OPTIONS = [
  { value: "guild_season", label: "Guild season (from Settings)" },
  { value: "calendar_quarter", label: "Calendar quarter (Q1-Q4)" },
]

function colorIntToHex(n: number | null): string {
  if (!n) return "#FFD700"
  return "#" + n.toString(16).padStart(6, "0")
}
function hexToColorInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16)
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Never"
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function makeDefaultConfig(): Partial<AutopostConfig> {
  return {
    config_name: "Leaderboard",
    enabled: true,
    lb_type: "study",
    messages_metric: "count",
    frequency: "weekly",
    seasonal_mode: null,
    week_starts_on: "monday",
    top_count: 10,
    post_channel: null,
    post_day: 0,
    post_hour: 20,
    post_minute: 0,
    top1_roles: [],
    topn_roles: [],
    auto_remove_roles: true,
    reward_tiers: [],
    announce_content: null,
    embed_title: null,
    embed_description: null,
    embed_footer: null,
    embed_color: 16766720,
    embed_url: null,
    embed_author_name: null,
    embed_author_url: null,
    embed_fields: [],
    include_image: true,
    mention_winners: false,
    pin_post: false,
    delete_previous: false,
    min_threshold: 0,
    notify_public_post: true,
    notify_dm_winners: false,
    dm_scope: "top_n",
    dm_template_title: null,
    dm_template_body: null,
    dm_stagger_seconds: 2,
    notify_mod_log: false,
    mod_log_channel: null,
    skip_if_empty: true,
    skip_if_same_as_last: false,
    continue_on_partial: true,
    max_coins_per_user: null,
  }
}

// ── Variable chips ──────────────────────────────────────────

const TEMPLATE_VARIABLES = [
  "{server_name}", "{frequency}", "{type}", "{type_unit}", "{top_count}",
  "{period}", "{top1_name}", "{top1_mention}", "{top1_value}",
  "{topn_role}", "{top1_role}", "{reward_summary}", "{winner_list}",
]

const DM_EXTRA_VARIABLES = ["{mention}", "{rank}", "{value}", "{coins}"]

// ── Reward tier editor ──────────────────────────────────────

function RewardTierEditor({
  tiers,
  onChange,
}: {
  tiers: RewardTier[]
  onChange: (t: RewardTier[]) => void
}) {
  const addTier = () => {
    const lastTo = tiers.length > 0 ? tiers[tiers.length - 1].to : 0
    onChange([...tiers, { from: lastTo + 1, to: lastTo + 1, coins: 500 }])
  }
  const removeTier = (i: number) => onChange(tiers.filter((_, idx) => idx !== i))
  const updateTier = (i: number, field: keyof RewardTier, val: number) => {
    const copy = [...tiers]
    copy[i] = { ...copy[i], [field]: val }
    onChange(copy)
  }

  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => (
        <div key={i} className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground w-10">Rank</span>
          <input
            type="number" min={1} max={25}
            value={tier.from}
            onChange={(e) => updateTier(i, "from", parseInt(e.target.value) || 1)}
            className="w-14 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="number" min={tier.from} max={25}
            value={tier.to}
            onChange={(e) => updateTier(i, "to", parseInt(e.target.value) || tier.from)}
            className="w-14 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
          />
          <span className="text-xs text-muted-foreground">:</span>
          <input
            type="number" min={0}
            value={tier.coins}
            onChange={(e) => updateTier(i, "coins", parseInt(e.target.value) || 0)}
            className="w-24 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
          />
          <span className="text-xs text-muted-foreground">LionCoins</span>
          <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-300 ml-auto">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addTier}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 mt-1"
      >
        <Plus size={12} /> Add tier
      </button>
    </div>
  )
}

// ── Embed field editor ──────────────────────────────────────

function EmbedFieldEditor({
  fields,
  onChange,
}: {
  fields: EmbedField[]
  onChange: (f: EmbedField[]) => void
}) {
  const addField = () => {
    if (fields.length >= 6) return
    onChange([...fields, { name: "", value: "", inline: false }])
  }
  const removeField = (i: number) => onChange(fields.filter((_, idx) => idx !== i))
  const updateField = (i: number, key: keyof EmbedField, val: any) => {
    const copy = [...fields]
    copy[i] = { ...copy[i], [key]: val }
    onChange(copy)
  }

  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={i} className="p-3 bg-gray-800/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Field {i + 1}</span>
            <button onClick={() => removeField(i)} className="text-red-400 hover:text-red-300">
              <Trash2 size={12} />
            </button>
          </div>
          <input
            placeholder="Field name" maxLength={256}
            value={field.name}
            onChange={(e) => updateField(i, "name", e.target.value)}
            className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
          />
          <textarea
            placeholder="Field value (supports template variables)" maxLength={1024}
            value={field.value}
            onChange={(e) => updateField(i, "value", e.target.value)}
            className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded resize-none"
            rows={2}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox" checked={field.inline}
              onChange={(e) => updateField(i, "inline", e.target.checked)}
              className="rounded"
            />
            Inline
          </label>
        </div>
      ))}
      {fields.length < 6 && (
        <button
          onClick={addField}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
        >
          <Plus size={12} /> Add embed field ({fields.length}/6)
        </button>
      )}
    </div>
  )
}

// ── Variable chips inserter ─────────────────────────────────

function VariableChips({
  variables,
  onInsert,
}: {
  variables: string[]
  onInsert: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {variables.map((v) => (
        <button
          key={v}
          onClick={() => onInsert(v)}
          className="px-1.5 py-0.5 text-[10px] bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors font-mono"
          title={`Click to copy ${v}`}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

// ── Live preview ────────────────────────────────────────────

const SAMPLE_VARS: Record<string, string> = {
  "{server_name}": "My Server",
  "{frequency}": "Weekly",
  "{type}": "Study Time",
  "{type_unit}": "hours",
  "{top_count}": "10",
  "{period}": "March 15 to March 21, 2026",
  "{top1_name}": "alice",
  "{top1_mention}": "@alice",
  "{top1_value}": "112",
  "{topn_role}": "@Top Studier",
  "{top1_role}": "@Study Champion",
  "{reward_summary}": "Top 1 – 3,000 LionCoins\nTop 2 – 2,000 LionCoins\nTop 3 – 1,500 LionCoins",
  "{winner_list}": "1. alice – 112 hours\n2. bob – 98 hours\n3. charlie – 85 hours",
  "{mention}": "@alice",
  "{rank}": "1",
  "{value}": "112",
  "{coins}": "3,000",
}

function renderPreview(text: string | null): string {
  if (!text) return ""
  let result = text
  for (const [key, val] of Object.entries(SAMPLE_VARS)) {
    result = result.split(key).join(val)
  }
  return result
}

function EmbedPreview({ config }: { config: Partial<AutopostConfig> }) {
  const colorHex = colorIntToHex(config.embed_color ?? 16766720)

  return (
    <div className="bg-[#2f3136] rounded-lg p-4 max-w-lg">
      {config.announce_content && (
        <div className="text-sm text-gray-200 mb-2 whitespace-pre-wrap">
          {renderPreview(config.announce_content)}
        </div>
      )}
      <div className="flex" style={{ borderLeft: `3px solid ${colorHex}` }}>
        <div className="pl-3 py-1 flex-1 min-w-0">
          {config.embed_author_name && (
            <div className="text-[11px] text-gray-400 mb-0.5">
              {renderPreview(config.embed_author_name)}
            </div>
          )}
          {config.embed_title && (
            <div className="text-sm font-semibold text-blue-400 mb-1">
              {renderPreview(config.embed_title)}
            </div>
          )}
          {config.embed_description && (
            <div className="text-sm text-gray-300 whitespace-pre-wrap">
              {renderPreview(config.embed_description)}
            </div>
          )}
          {config.include_image && (
            <div className="mt-2 bg-gray-700/50 rounded h-24 flex items-center justify-center text-xs text-gray-500">
              Leaderboard Image
            </div>
          )}
          {(config.embed_fields ?? []).map((f, i) => (
            <div key={i} className={`mt-2 ${f.inline ? "inline-block mr-4" : "block"}`}>
              <div className="text-xs font-semibold text-gray-300">
                {renderPreview(f.name) || "\u200b"}
              </div>
              <div className="text-xs text-gray-400 whitespace-pre-wrap">
                {renderPreview(f.value) || "\u200b"}
              </div>
            </div>
          ))}
          {config.embed_footer && (
            <div className="text-[10px] text-gray-500 mt-2 pt-1 border-t border-gray-700">
              {renderPreview(config.embed_footer)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main config editor ──────────────────────────────────────

function ConfigEditor({
  serverId,
  config,
  isNew,
  onClose,
  onSaved,
}: {
  serverId: string
  config: Partial<AutopostConfig>
  isNew: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Partial<AutopostConfig>>({ ...config })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [showRunConfirm, setShowRunConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [simulateResult, setSimulateResult] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(true)

  const apiBase = `/api/dashboard/servers/${serverId}/leaderboard-autopost`
  const actionApi = `/api/dashboard/servers/${serverId}/leaderboard-autopost-action`

  const update = useCallback((field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }, [])

  const handleSave = async () => {
    if (!form.post_channel) {
      toast.error("Please select a post channel")
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        await dashboardMutate("POST", apiBase, form)
        toast.success("Config created!")
      } else {
        await dashboardMutate("PATCH", apiBase, { configid: form.configid, ...form })
        toast.success("Config saved!")
      }
      setDirty(false)
      onSaved()
    } catch (e: any) {
      toast.error(e.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!form.configid) return
    try {
      await dashboardMutate("DELETE", `${apiBase}?configid=${form.configid}`, undefined)
      toast.success("Config deleted")
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Failed to delete")
    }
  }

  const handleAction = async (action: string) => {
    if (!form.configid) {
      toast.error("Save the config first")
      return
    }
    setActionLoading(action)
    setSimulateResult(null)
    try {
      const { queueid } = await dashboardMutate("POST", actionApi, {
        configid: form.configid,
        action,
      })
      if (action === "simulate") {
        let tries = 0
        while (tries < 30) {
          await new Promise((r) => setTimeout(r, 2000))
          const res = await fetch(`${actionApi}?queueid=${queueid}&id=${serverId}`)
          const data = await res.json()
          if (data.status === "done") {
            const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result
            setSimulateResult(parsed)
            toast.success("Simulation complete!")
            break
          }
          if (data.status === "failed") {
            const err = typeof data.result === "string" ? JSON.parse(data.result) : data.result
            toast.error(err?.error || "Simulation failed")
            break
          }
          tries++
        }
        if (tries >= 30) toast.error("Simulation timed out")
      } else {
        toast.success(action === "test" ? "Test post queued!" : "Full cycle queued!")
        let tries = 0
        while (tries < 20) {
          await new Promise((r) => setTimeout(r, 2000))
          const res = await fetch(`${actionApi}?queueid=${queueid}&id=${serverId}`)
          const data = await res.json()
          if (data.status === "done" || data.status === "failed") {
            if (data.status === "done") {
              toast.success("Action completed!")
            } else {
              const err = typeof data.result === "string" ? JSON.parse(data.result) : data.result
              toast.error(err?.error || "Action failed")
            }
            break
          }
          tries++
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Action failed")
    } finally {
      setActionLoading(null)
    }
  }

  const copyVariable = (v: string) => {
    navigator.clipboard.writeText(v)
    toast.success(`Copied ${v}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to configs
        </button>
        {!isNew && (
          <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      {/* Basics */}
      <SectionCard title="Basics" icon={<BarChart3 size={16} />} defaultOpen>
        <SettingRow label="Config Name" description="Unique name for this leaderboard schedule">
          <TextInput
            value={form.config_name || ""}
            onChange={(v) => update("config_name", v)}
            placeholder="Weekly Study Buddies"
            maxLength={64}
          />
        </SettingRow>
        <SettingRow label="Enabled">
          <Toggle checked={form.enabled ?? true} onChange={(v) => update("enabled", v)} />
        </SettingRow>
        <SettingRow label="Leaderboard Type">
          <div className="flex gap-2">
            {LB_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update("lb_type", opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  form.lb_type === opt.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-gray-800 text-muted-foreground border border-gray-700 hover:border-gray-600"
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </SettingRow>
        {form.lb_type === "messages" && (
          <SettingRow label="Messages Metric" description="Count raw messages or use XP equivalent">
            <div className="flex gap-2">
              {[{ value: "count", label: "Message Count" }, { value: "xp", label: "Message XP" }].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("messages_metric", opt.value)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    form.messages_metric === opt.value
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-gray-800 text-muted-foreground border border-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SettingRow>
        )}
        <SettingRow label="Frequency">
          <div className="flex gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update("frequency", opt.value)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  form.frequency === opt.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-gray-800 text-muted-foreground border border-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SettingRow>
        {form.frequency === "seasonal" && (
          <SettingRow label="Seasonal Mode">
            <div className="flex gap-2 flex-wrap">
              {SEASONAL_MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("seasonal_mode", opt.value)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    form.seasonal_mode === opt.value
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-gray-800 text-muted-foreground border border-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SettingRow>
        )}
        <SettingRow label="Post Channel" description="Where to post the leaderboard">
          <ChannelSelect
            guildId={serverId}
            value={form.post_channel || ""}
            onChange={(v) => update("post_channel", v)}
            channelTypes={[0, 5]}
          />
        </SettingRow>
        <SettingRow label="Top N Count" description="Number of entries (1-25)">
          <NumberInput
            value={form.top_count ?? 10}
            onChange={(v) => update("top_count", v)}
            min={1} max={25}
          />
        </SettingRow>
      </SectionCard>

      {/* Schedule */}
      <SectionCard title="Schedule" icon={<Clock size={16} />} defaultOpen>
        {form.frequency === "weekly" && (
          <>
            <SettingRow label="Week Starts On">
              <div className="flex gap-2 flex-wrap">
                {WEEK_START_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("week_starts_on", opt.value)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      form.week_starts_on === opt.value
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-gray-800 text-muted-foreground border border-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Post Day" description="Day of week to post">
              <select
                value={form.post_day ?? 0}
                onChange={(e) => update("post_day", parseInt(e.target.value))}
                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm"
              >
                {DAYS_OF_WEEK.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </SettingRow>
          </>
        )}
        {form.frequency === "monthly" && (
          <SettingRow label="Post Day" description="Day of month (clamped to last day when needed)">
            <NumberInput
              value={form.post_day ?? 1}
              onChange={(v) => update("post_day", v)}
              min={1} max={31}
            />
          </SettingRow>
        )}
        <SettingRow label="Post Hour" description="Hour in server timezone (0-23)">
          <NumberInput
            value={form.post_hour ?? 20}
            onChange={(v) => update("post_hour", v)}
            min={0} max={23}
          />
        </SettingRow>
        <SettingRow label="Post Minute" description="Minute (0-59)">
          <NumberInput
            value={form.post_minute ?? 0}
            onChange={(v) => update("post_minute", v)}
            min={0} max={59}
          />
        </SettingRow>
        <div className="text-xs text-muted-foreground px-1">
          Uses your server timezone from Settings. The bot checks every 60 seconds.
        </div>
      </SectionCard>

      {/* Roles */}
      <SectionCard title="Roles" icon={<Trophy size={16} />} defaultOpen={false}>
        <SettingRow label="Top 1 Roles" description="All roles assigned to the #1 winner (can select multiple)">
          <RoleSelect
            guildId={serverId}
            value={form.top1_roles ?? []}
            onChange={(v) => update("top1_roles", v || [])}
            multiple
          />
        </SettingRow>
        <SettingRow label="Top N Roles" description="Roles assigned to all winners (can select multiple)">
          <RoleSelect
            guildId={serverId}
            value={form.topn_roles ?? []}
            onChange={(v) => update("topn_roles", v || [])}
            multiple
          />
        </SettingRow>
        <SettingRow
          label="Auto-Remove Old Roles"
          description="Remove roles from previous holders when new leaderboard posts"
        >
          <Toggle
            checked={form.auto_remove_roles ?? true}
            onChange={(v) => update("auto_remove_roles", v)}
          />
        </SettingRow>
      </SectionCard>

      {/* Rewards */}
      <SectionCard title="LionCoin Rewards" icon={<BarChart3 size={16} />} defaultOpen={false}>
        <SettingRow label="Reward Tiers" description="Coins awarded per rank range">
          <RewardTierEditor
            tiers={form.reward_tiers ?? []}
            onChange={(t) => update("reward_tiers", t)}
          />
        </SettingRow>
        <SettingRow label="Max Coins Per User" description="Optional per-run cap (leave empty for no limit)">
          <NumberInput
            value={form.max_coins_per_user ?? 0}
            onChange={(v) => update("max_coins_per_user", v || null)}
            min={0}
          />
        </SettingRow>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" icon={<Bell size={16} />} defaultOpen={false}>
        <SettingRow label="Post to Channel" description="Main leaderboard post">
          <Toggle
            checked={form.notify_public_post ?? true}
            onChange={(v) => update("notify_public_post", v)}
          />
        </SettingRow>
        <SettingRow label="DM Winners">
          <Toggle
            checked={form.notify_dm_winners ?? false}
            onChange={(v) => update("notify_dm_winners", v)}
          />
        </SettingRow>
        {form.notify_dm_winners && (
          <>
            <SettingRow label="DM Scope">
              <div className="flex gap-2">
                {DM_SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("dm_scope", opt.value)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      form.dm_scope === opt.value
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-gray-800 text-muted-foreground border border-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="DM Stagger (seconds)" description="Delay between each DM (1-10)">
              <NumberInput
                value={form.dm_stagger_seconds ?? 2}
                onChange={(v) => update("dm_stagger_seconds", v)}
                min={1} max={10}
              />
            </SettingRow>
            <SettingRow label="DM Title" description="Optional embed title for winner DMs">
              <TextInput
                value={form.dm_template_title || ""}
                onChange={(v) => update("dm_template_title", v || null)}
                placeholder="Congratulations!"
                maxLength={256}
              />
            </SettingRow>
            <SettingRow label="DM Body" description="Embed description for winner DMs">
              <textarea
                value={form.dm_template_body || ""}
                onChange={(e) => update("dm_template_body", e.target.value || null)}
                placeholder="You placed #{rank} on the {frequency} {type} leaderboard in {server_name}!"
                className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md resize-none"
                rows={3}
                maxLength={4096}
              />
              <VariableChips variables={[...TEMPLATE_VARIABLES, ...DM_EXTRA_VARIABLES]} onInsert={copyVariable} />
            </SettingRow>
          </>
        )}
        <SettingRow label="Mod Log">
          <Toggle
            checked={form.notify_mod_log ?? false}
            onChange={(v) => update("notify_mod_log", v)}
          />
        </SettingRow>
        {form.notify_mod_log && (
          <SettingRow label="Mod Log Channel">
            <ChannelSelect
              guildId={serverId}
              value={form.mod_log_channel || ""}
              onChange={(v) => update("mod_log_channel", v || null)}
              channelTypes={[0, 5]}
            />
          </SettingRow>
        )}
      </SectionCard>

      {/* Embed editor */}
      <SectionCard title="Message & Embed" icon={<Send size={16} />} defaultOpen={false}>
        <SettingRow label="Announcement Content" description="Text above the embed">
          <textarea
            value={form.announce_content || ""}
            onChange={(e) => update("announce_content", e.target.value || null)}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md resize-none"
            rows={3}
            maxLength={2000}
            placeholder="{topn_role} Congratulations to this week's winners!"
          />
          <div className="flex justify-between mt-1">
            <VariableChips variables={TEMPLATE_VARIABLES} onInsert={copyVariable} />
            <span className="text-[10px] text-muted-foreground">{(form.announce_content || "").length}/2000</span>
          </div>
        </SettingRow>
        <SettingRow label="Embed Title">
          <TextInput
            value={form.embed_title || ""}
            onChange={(v) => update("embed_title", v || null)}
            placeholder="TOP {top_count} WEEKLY STUDY BUDDIES"
            maxLength={256}
          />
        </SettingRow>
        <SettingRow label="Embed URL" description="Link when clicking the title">
          <TextInput
            value={form.embed_url || ""}
            onChange={(v) => update("embed_url", v || null)}
            placeholder="https://..."
          />
        </SettingRow>
        <SettingRow label="Embed Description">
          <textarea
            value={form.embed_description || ""}
            onChange={(e) => update("embed_description", e.target.value || null)}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md resize-none"
            rows={3}
            maxLength={4096}
          />
          <VariableChips variables={TEMPLATE_VARIABLES} onInsert={copyVariable} />
        </SettingRow>
        <SettingRow label="Embed Color">
          <input
            type="color"
            value={colorIntToHex(form.embed_color ?? 16766720)}
            onChange={(e) => update("embed_color", hexToColorInt(e.target.value))}
            className="w-10 h-8 rounded cursor-pointer"
          />
        </SettingRow>
        <SettingRow label="Author Name">
          <TextInput
            value={form.embed_author_name || ""}
            onChange={(v) => update("embed_author_name", v || null)}
            maxLength={256}
          />
        </SettingRow>
        <SettingRow label="Author URL">
          <TextInput
            value={form.embed_author_url || ""}
            onChange={(v) => update("embed_author_url", v || null)}
          />
        </SettingRow>
        <SettingRow label="Embed Footer">
          <TextInput
            value={form.embed_footer || ""}
            onChange={(v) => update("embed_footer", v || null)}
            placeholder="{server_name}"
            maxLength={2048}
          />
        </SettingRow>
        <SettingRow label="Embed Fields" description="Additional embed fields (max 6)">
          <EmbedFieldEditor
            fields={form.embed_fields ?? []}
            onChange={(f) => update("embed_fields", f)}
          />
        </SettingRow>
        <SettingRow label="Include Leaderboard Image">
          <Toggle
            checked={form.include_image ?? true}
            onChange={(v) => update("include_image", v)}
          />
        </SettingRow>
        <SettingRow label="Mention Winners" description="@ mention each winner in the message content">
          <Toggle
            checked={form.mention_winners ?? false}
            onChange={(v) => update("mention_winners", v)}
          />
        </SettingRow>
        <SettingRow label="Pin Post">
          <Toggle checked={form.pin_post ?? false} onChange={(v) => update("pin_post", v)} />
        </SettingRow>
        <SettingRow label="Delete Previous Post">
          <Toggle
            checked={form.delete_previous ?? false}
            onChange={(v) => update("delete_previous", v)}
          />
        </SettingRow>
        <SettingRow label="Min Threshold" description="Minimum value to qualify (0 = no minimum)">
          <NumberInput
            value={form.min_threshold ?? 0}
            onChange={(v) => update("min_threshold", v)}
            min={0}
          />
        </SettingRow>
      </SectionCard>

      {/* Safety */}
      <SectionCard title="Safety & Behavior" icon={<Shield size={16} />} defaultOpen={false}>
        <SettingRow label="Skip If Empty" description="Don't post if nobody qualifies">
          <Toggle
            checked={form.skip_if_empty ?? true}
            onChange={(v) => update("skip_if_empty", v)}
          />
        </SettingRow>
        <SettingRow
          label="Continue On Partial Failure"
          description="Still award coins/DMs if the channel post fails"
        >
          <Toggle
            checked={form.continue_on_partial ?? true}
            onChange={(v) => update("continue_on_partial", v)}
          />
        </SettingRow>
        <SettingRow
          label="Skip If Same Winners"
          description="Advanced: skip if the winner set hasn't changed"
        >
          <Toggle
            checked={form.skip_if_same_as_last ?? false}
            onChange={(v) => update("skip_if_same_as_last", v)}
          />
        </SettingRow>
      </SectionCard>

      {/* Live Preview */}
      <SectionCard
        title="Preview"
        icon={<Eye size={16} />}
        defaultOpen
        badge="Live"
        badgeVariant="green"
      >
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-2">Channel Post Preview</div>
            <EmbedPreview config={form} />
          </div>
          {form.notify_dm_winners && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">DM Preview (sample rank #3)</div>
              <div className="bg-[#2f3136] rounded-lg p-3 max-w-sm">
                <div className="flex" style={{ borderLeft: `3px solid ${colorIntToHex(form.embed_color ?? 16766720)}` }}>
                  <div className="pl-3 py-1">
                    {form.dm_template_title && (
                      <div className="text-sm font-semibold text-blue-400 mb-1">
                        {renderPreview(form.dm_template_title)}
                      </div>
                    )}
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">
                      {form.dm_template_body
                        ? renderPreview(form.dm_template_body)
                        : "Congratulations! You placed #3 on the Weekly Study Time leaderboard in My Server!"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Actions */}
      {!isNew && (
        <SectionCard title="Actions" icon={<Zap size={16} />} defaultOpen>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAction("test")}
              disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {actionLoading === "test" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Test Post
            </button>
            <button
              onClick={() => handleAction("simulate")}
              disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {actionLoading === "simulate" ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
              Simulate
            </button>
            <button
              onClick={() => setShowRunConfirm(true)}
              disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {actionLoading === "run_now" ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Run Now
            </button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            <p><strong>Test Post</strong> &ndash; Posts to channel with TEST footer, no roles/coins/DMs. (3/hour)</p>
            <p><strong>Simulate</strong> &ndash; Shows what would happen without any side effects.</p>
            <p><strong>Run Now</strong> &ndash; Full production cycle immediately. (1/hour)</p>
          </div>

          {simulateResult && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg space-y-2">
              <div className="text-sm font-semibold text-foreground">Simulation Results</div>
              <div className="text-xs text-muted-foreground">Period: {simulateResult.period}</div>
              <div className="text-xs space-y-1">
                <p>Winners: {simulateResult.winners?.length ?? 0}</p>
                <p>Roles to add: {simulateResult.roles_add}, remove: {simulateResult.roles_remove}</p>
                <p>Total coins: {(simulateResult.total_coins ?? 0).toLocaleString()}</p>
                <p>DMs to send: {simulateResult.dms_would_send}</p>
              </div>
              {simulateResult.winners?.length > 0 && (
                <div className="mt-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-1 pr-2">#</th>
                        <th className="py-1 pr-2">User</th>
                        <th className="py-1 pr-2">Value</th>
                        <th className="py-1 pr-2">Coins</th>
                        <th className="py-1">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulateResult.winners.map((w: any) => (
                        <tr key={w.userid} className="border-t border-gray-700/50">
                          <td className="py-1 pr-2">{w.rank}</td>
                          <td className="py-1 pr-2">{w.name}</td>
                          <td className="py-1 pr-2">{w.value}</td>
                          <td className="py-1 pr-2">{(w.would_get_coins ?? 0).toLocaleString()}</td>
                          <td className="py-1">
                            {w.would_get_role ? <CheckCircle size={12} className="text-green-400" /> : <XCircle size={12} className="text-gray-600" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      )}

      <SaveBar show={dirty} onSave={handleSave} onReset={() => { setForm({ ...config }); setDirty(false) }} saving={saving} />

      <ConfirmModal
        open={showRunConfirm}
        onCancel={() => setShowRunConfirm(false)}
        onConfirm={() => { setShowRunConfirm(false); handleAction("run_now") }}
        title="Run Full Cycle Now"
        message="This will post the leaderboard, assign roles, and award LionCoins right now. This cannot be undone. Continue?"
        confirmLabel="Run Now"
        variant="danger"
      />
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────

interface PageData {
  configs: AutopostConfig[]
  history: HistoryEntry[]
  // --- AI-MODIFIED (2026-03-21) ---
  // Purpose: Premium gate flag from API
  isPremium: boolean
  // --- END AI-MODIFIED ---
}

export default function LeaderboardAutopostPage() {
  const router = useRouter()
  const serverId = router.query.id as string
  const apiUrl = serverId ? `/api/dashboard/servers/${serverId}/leaderboard-autopost` : null

  const { data, isLoading, mutate } = useDashboard<PageData>(apiUrl)
  const [editing, setEditing] = useState<{ config: Partial<AutopostConfig>; isNew: boolean } | null>(null)
  const [historyConfigId, setHistoryConfigId] = useState<number | null>(null)

  const { data: historyData } = useDashboard<PageData>(
    historyConfigId ? `${apiUrl}?history=${historyConfigId}` : null
  )

  const configs = data?.configs ?? []
  // --- AI-MODIFIED (2026-03-21) ---
  // Purpose: Premium gate
  const isPremium = data?.isPremium ?? false
  // --- END AI-MODIFIED ---

  const startNew = (preset?: Partial<AutopostConfig>) => {
    const base = makeDefaultConfig()
    setEditing({ config: { ...base, ...preset }, isNew: true })
  }

  const pageContent = editing ? (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title={editing.isNew ? "New Leaderboard Config" : `Edit: ${editing.config.config_name}`}
        description="Configure automated leaderboard posting"
      />
      <ConfigEditor
        serverId={serverId}
        config={editing.config}
        isNew={editing.isNew}
        onClose={() => setEditing(null)}
        onSaved={() => { mutate(); setEditing(null) }}
      />
    </main>
  ) : (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title="Leaderboard Auto-Post"
        description="Automatically post leaderboards, assign roles, and award LionCoins on a schedule"
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !isPremium ? (
        <PremiumGate
          title="Leaderboard Auto-Post"
          subtitle="Automate your server's competitive edge. Schedule leaderboard posts with role rewards, coin prizes, and winner notifications — all hands-free."
        >
          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {[
              { icon: <Clock size={18} />, label: "Scheduled Posting", desc: "Daily, weekly, monthly, or seasonal — pick any schedule" },
              { icon: <Shield size={18} />, label: "Role Rewards", desc: "Auto-assign roles to your top performers each cycle" },
              { icon: <Coins size={18} />, label: "Coin Prizes", desc: "Award LionCoins to winners with tiered prize pools" },
              { icon: <Bell size={18} />, label: "Winner DMs", desc: "Winners get a personal DM with their rank and rewards" },
              { icon: <Settings2 size={18} />, label: "Up to 10 Configs", desc: "Run multiple leaderboards with different types and schedules" },
              { icon: <Zap size={18} />, label: "Custom Embeds", desc: "Personalized messages, colors, and embed fields" },
            ].map((f) => (
              <div
                key={f.label}
                className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/20 transition-colors"
              >
                <div className="text-amber-400/80 mb-2">{f.icon}</div>
                <p className="text-sm font-semibold text-gray-200">{f.label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Mock Discord embed preview */}
          <div className="rounded-xl bg-gray-800/40 border border-gray-700/40 p-4 sm:p-5">
            <p className="text-[11px] font-medium text-gray-500 mb-3 uppercase tracking-wider">
              Preview — What it looks like in Discord
            </p>
            <div className="flex gap-3">
              {/* Bot avatar */}
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Trophy size={16} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Bot name + timestamp */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-amber-400">StudyLion</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">BOT</span>
                  <span className="text-[10px] text-gray-600">Today at 12:00 AM</span>
                </div>
                {/* Discord embed */}
                <div className="rounded bg-[#2b2d31] border-l-4 border-amber-500 p-3 sm:p-4 max-w-md">
                  <p className="text-xs font-bold text-white mb-0.5">Weekly Study Leaderboard</p>
                  <p className="text-[11px] text-gray-400 mb-3">Top performers this week</p>
                  <div className="space-y-1.5">
                    {[
                      { medal: "🥇", name: "StudyQueen", hours: "42h 15m", role: true },
                      { medal: "🥈", name: "FocusMaster", hours: "38h 02m", role: true },
                      { medal: "🥉", name: "NightOwl99", hours: "35h 48m", role: true },
                      { medal: " 4.", name: "DeepWorkFan", hours: "31h 20m", role: false },
                      { medal: " 5.", name: "CalmCoder", hours: "28h 55m", role: false },
                    ].map((row) => (
                      <div key={row.name} className="flex items-center gap-2 text-[12px]">
                        <span className="w-6 text-center flex-shrink-0">{row.medal}</span>
                        <span className="text-white font-medium flex-1 truncate">{row.name}</span>
                        <span className="text-gray-400 flex-shrink-0">{row.hours}</span>
                        {row.role && (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            <Medal size={8} /> Role
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-700/50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">+1,500 LionCoins awarded</span>
                    <span className="text-[10px] text-gray-600">Next: in 7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PremiumGate>
      ) : configs.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={<Trophy size={32} />}
            title="Automate Your Leaderboards"
            description="Create scheduled leaderboard posts with role rewards and coin prizes. Choose a preset to get started quickly."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => startNew(preset)}
                className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-left hover:border-primary/30 hover:bg-gray-800 transition-colors"
              >
                <div className={`text-sm font-semibold ${preset._color}`}>{preset._label}</div>
                <div className="text-xs text-muted-foreground mt-1">{preset._desc}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {configs.length}/10 configs
            </div>
            {configs.length < 10 && (
              <button
                onClick={() => startNew()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary rounded-md text-sm hover:bg-primary/30 transition-colors"
              >
                <Plus size={14} /> Add Leaderboard
              </button>
            )}
          </div>

          {configs.map((cfg) => (
            <div
              key={cfg.configid}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {cfg.config_name}
                    </span>
                    <Badge variant="default">
                      {cfg.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{cfg.frequency.charAt(0).toUpperCase() + cfg.frequency.slice(1)}</span>
                    <span>&middot;</span>
                    <span>{(LB_TYPE_OPTIONS.find(o => o.value === cfg.lb_type) || {}).label || cfg.lb_type}</span>
                    <span>&middot;</span>
                    <span>Top {cfg.top_count}</span>
                    <span>&middot;</span>
                    <span>Last: {formatRelativeTime(cfg.last_posted_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryConfigId(cfg.configid)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    title="View history"
                  >
                    <Clock size={14} />
                  </button>
                  <button
                    onClick={() => setEditing({ config: cfg, isNew: false })}
                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {historyConfigId && historyData?.history && historyData.history.length > 0 && (
            <SectionCard title="Recent Runs" icon={<Clock size={16} />} defaultOpen>
              <div className="space-y-2">
                {historyData.history.map((h) => (
                  <div key={h.historyid} className="flex items-center gap-3 text-xs py-2 border-b border-gray-700/50 last:border-0">
                    <span className="text-muted-foreground w-32 flex-shrink-0">
                      {new Date(h.posted_at).toLocaleString()}
                    </span>
                    <span className={
                      h.status === "success" ? "text-green-400" :
                      h.status === "partial" ? "text-yellow-400" :
                      h.status === "failed" ? "text-red-400" :
                      "text-muted-foreground"
                    }>
                      {h.status}
                    </span>
                    <span className="text-muted-foreground">
                      +{h.roles_added}/-{h.roles_removed} roles
                    </span>
                    <span className="text-muted-foreground">
                      {(h.coins_awarded ?? 0).toLocaleString()} coins
                    </span>
                    <span className="text-muted-foreground">
                      {h.dms_sent}/{(h.dms_sent ?? 0) + (h.dms_failed ?? 0)} DMs
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </main>
  )

  // --- AI-MODIFIED (2026-03-21) ---
  // Purpose: Add missing SEO prop required by Layout component
  return (
    <Layout SEO={{ title: "Leaderboard Auto-Post", description: "Configure automatic leaderboard posting" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
  {/* --- END AI-MODIFIED --- */}
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-6xl mx-auto flex gap-8">
              <ServerNav serverId={serverId} serverName="..." isAdmin isMod />
              {pageContent}
            </div>
          </div>
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
