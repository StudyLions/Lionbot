// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server settings page - grouped config editor
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"

interface SettingGroup {
  title: string
  icon: string
  description: string
  color: string
  fields: SettingField[]
}

interface SettingField {
  key: string
  label: string
  type: "number" | "boolean" | "text" | "select" | "textarea"
  description?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  placeholder?: string
}

const settingGroups: SettingGroup[] = [
  {
    title: "Study Rewards",
    icon: "📚",
    description: "Configure how members earn coins from studying",
    color: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
    fields: [
      { key: "study_hourly_reward", label: "Hourly Reward", type: "number", description: "Coins earned per hour of study", min: 0 },
      { key: "study_hourly_live_bonus", label: "Camera Bonus", type: "number", description: "Extra coins for camera-on study", min: 0 },
      { key: "daily_study_cap", label: "Daily Cap (hours)", type: "number", description: "Max rewarded hours per day (null = unlimited)", min: 0 },
    ],
  },
  {
    title: "Economy",
    icon: "💰",
    description: "Manage the server coin economy",
    color: "from-amber-500/10 to-amber-600/5 border-amber-500/20",
    fields: [
      { key: "starting_funds", label: "Starting Coins", type: "number", description: "Coins given to new members", min: 0 },
      { key: "allow_transfers", label: "Allow Transfers", type: "boolean", description: "Let members send coins to each other" },
      { key: "coins_per_centixp", label: "Coins per 100 XP", type: "number", description: "Coin-to-XP conversion rate", min: 0 },
    ],
  },
  {
    title: "Tasks",
    icon: "✅",
    description: "Task completion rewards",
    color: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    fields: [
      { key: "max_tasks", label: "Max Tasks", type: "number", description: "Maximum tasks per member", min: 1, max: 100 },
      { key: "task_reward", label: "Task Reward", type: "number", description: "Coins per completed task", min: 0 },
      { key: "task_reward_limit", label: "Daily Reward Limit", type: "number", description: "Max task rewards per day", min: 0 },
    ],
  },
  {
    title: "Private Rooms",
    icon: "🔒",
    description: "Private study room settings",
    color: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
    fields: [
      { key: "renting_price", label: "Daily Rent", type: "number", description: "Coins per day to rent a room", min: 0 },
      { key: "renting_cap", label: "Max Members", type: "number", description: "Maximum members per room", min: 1 },
      { key: "renting_visible", label: "Visible", type: "boolean", description: "Rooms visible to non-members" },
    ],
  },
  {
    title: "Accountability",
    icon: "🤝",
    description: "Scheduled accountability sessions",
    color: "from-rose-500/10 to-rose-600/5 border-rose-500/20",
    fields: [
      { key: "accountability_price", label: "Booking Cost", type: "number", description: "Coins to book a session", min: 0 },
      { key: "accountability_reward", label: "Attendance Reward", type: "number", description: "Coins for attending", min: 0 },
      { key: "accountability_bonus", label: "Full Group Bonus", type: "number", description: "Bonus when everyone attends", min: 0 },
    ],
  },
  {
    title: "Ranks",
    icon: "🏆",
    description: "Activity rank progression",
    color: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20",
    fields: [
      { key: "rank_type", label: "Rank Stat", type: "select", options: [
        { value: "XP", label: "XP (Combined)" },
        { value: "VOICE", label: "Voice Time" },
        { value: "MESSAGE", label: "Messages" },
      ], description: "Which stat drives rank progression" },
      { key: "dm_ranks", label: "DM Rank Ups", type: "boolean", description: "Send rank-up notifications via DM" },
      { key: "xp_per_period", label: "XP per Period", type: "number", description: "Voice XP earned per tracking period", min: 0 },
    ],
  },
  {
    title: "Moderation",
    icon: "🛡️",
    description: "Moderation and video room settings",
    color: "from-red-500/10 to-red-600/5 border-red-500/20",
    fields: [
      { key: "video_studyban", label: "Video Study Ban", type: "boolean", description: "Ban from study for camera violations" },
      { key: "video_grace_period", label: "Grace Period (sec)", type: "number", description: "Seconds before camera kick", min: 0 },
      { key: "persist_roles", label: "Persist Roles", type: "boolean", description: "Restore roles when members rejoin" },
    ],
  },
  {
    title: "General",
    icon: "🌍",
    description: "Language and timezone",
    color: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20",
    fields: [
      { key: "timezone", label: "Timezone", type: "text", placeholder: "e.g. US/Eastern, Europe/London" },
      { key: "locale", label: "Language", type: "text", placeholder: "e.g. en_GB, pt_BR" },
      { key: "force_locale", label: "Force Language", type: "boolean", description: "Override member language preferences" },
    ],
  },
  {
    title: "Welcome Messages",
    icon: "👋",
    description: "Greet new and returning members",
    color: "from-pink-500/10 to-pink-600/5 border-pink-500/20",
    fields: [
      { key: "greeting_message", label: "Welcome Message", type: "textarea", placeholder: "Use {mention}, {user_name}, {server_name}" },
      { key: "returning_message", label: "Returning Message", type: "textarea", placeholder: "Message for returning members" },
    ],
  },
  {
    title: "Workouts",
    icon: "💪",
    description: "Workout tracking settings",
    color: "from-orange-500/10 to-orange-600/5 border-orange-500/20",
    fields: [
      { key: "min_workout_length", label: "Min Length (min)", type: "number", description: "Minimum workout duration in minutes", min: 1 },
      { key: "workout_reward", label: "Reward", type: "number", description: "Coins per workout session", min: 0 },
    ],
  },
]

export default function ServerSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [original, setOriginal] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (id && session) {
      fetch(`/api/dashboard/servers/${id}/config`)
        .then((r) => {
          if (!r.ok) throw new Error(r.status === 403 ? "You're not an admin of this server" : "Failed to load")
          return r.json()
        })
        .then((data) => {
          setConfig(data)
          setOriginal({ ...data })
        })
        .catch(() => setConfig(null))
        .finally(() => setLoading(false))
    }
  }, [id, session])

  const handleChange = useCallback((key: string, value: any) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const hasChanges = config && original && JSON.stringify(config) !== JSON.stringify(original)

  const handleSave = async () => {
    if (!config || !original || !hasChanges) return
    setSaving(true)
    const changes: Record<string, any> = {}
    for (const key of Object.keys(config)) {
      if (JSON.stringify(config[key]) !== JSON.stringify(original[key])) {
        changes[key] = config[key]
      }
    }
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error("Save failed")
      setOriginal({ ...config })
      setToast({ type: "success", message: "Settings saved!" })
    } catch {
      setToast({ type: "error", message: "Failed to save. Check your permissions." })
    }
    setSaving(false)
    setTimeout(() => setToast(null), 3000)
  }

  const handleReset = () => {
    if (original) setConfig({ ...original })
  }

  return (
    <Layout SEO={{ title: `Settings - ${config?.name || "Server"} - LionBot`, description: "Server settings" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <ServerNav serverId={id as string} serverName={config?.name || "..."} isAdmin isMod />

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-1/4 mb-4" />
                    <div className="space-y-3">
                      <div className="h-10 bg-gray-700 rounded" />
                      <div className="h-10 bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !config ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">Unable to load settings. You may not have admin permissions.</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {settingGroups.map((group) => (
                    <div
                      key={group.title}
                      className={`bg-gradient-to-br ${group.color} bg-gray-800 rounded-2xl border overflow-hidden transition-all`}
                    >
                      <div className="p-5 sm:p-4">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">{group.icon}</span>
                          <h3 className="text-lg font-bold text-white">{group.title}</h3>
                        </div>
                        <p className="text-gray-400 text-sm ml-11 sm:ml-0 mb-4">{group.description}</p>

                        <div className="grid gap-4 sm:gap-3">
                          {group.fields.map((field) => (
                            <div key={field.key} className="flex items-center justify-between gap-4 sm:flex-col sm:items-start">
                              <div className="flex-1 min-w-0">
                                <label className="text-white text-sm font-medium">{field.label}</label>
                                {field.description && (
                                  <p className="text-gray-500 text-xs mt-0.5">{field.description}</p>
                                )}
                              </div>
                              <div className="w-48 sm:w-full flex-shrink-0">
                                {field.type === "boolean" ? (
                                  <button
                                    onClick={() => handleChange(field.key, !config[field.key])}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${
                                      config[field.key] ? "bg-emerald-500" : "bg-gray-600"
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                                        config[field.key] ? "translate-x-7" : ""
                                      }`}
                                    />
                                  </button>
                                ) : field.type === "select" ? (
                                  <select
                                    value={config[field.key] || ""}
                                    onChange={(e) => handleChange(field.key, e.target.value || null)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                  >
                                    <option value="">Not set</option>
                                    {field.options?.map((opt) => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                ) : field.type === "textarea" ? (
                                  <textarea
                                    value={config[field.key] || ""}
                                    onChange={(e) => handleChange(field.key, e.target.value || null)}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                                  />
                                ) : (
                                  <input
                                    type={field.type}
                                    value={config[field.key] ?? ""}
                                    onChange={(e) =>
                                      handleChange(
                                        field.key,
                                        field.type === "number"
                                          ? e.target.value === "" ? null : parseInt(e.target.value)
                                          : e.target.value || null
                                      )
                                    }
                                    placeholder={field.placeholder}
                                    min={field.min}
                                    max={field.max}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sticky save bar */}
                {hasChanges && (
                  <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 p-4 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                      <p className="text-amber-400 text-sm font-medium">You have unsaved changes</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-xl text-sm transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Toast notification */}
            {toast && (
              <div className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-2xl z-50 text-sm font-medium transition-all animate-[slideIn_0.3s_ease-out] ${
                toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}>
                {toast.message}
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
