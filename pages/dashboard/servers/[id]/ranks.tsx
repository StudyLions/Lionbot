// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Ranks editor - rebuilt with RoleSelect, ConfirmModal, proper design
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader, Badge, ConfirmModal, RoleSelect, EmptyState, FirstTimeBanner, toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { Trophy, Plus, Pencil, Trash2, X, Check } from "lucide-react"

interface Rank {
  rankId: number
  roleId: string
  required: number
  reward: number
  message: string | null
}

interface RanksData {
  rankType: string | null
  rankChannel: string | null
  dmRanks: boolean
  xpRanks: Rank[]
  voiceRanks: Rank[]
  msgRanks: Rank[]
}

type TabKey = "XP" | "VOICE" | "MESSAGE"

const TAB_CONFIG: Record<TabKey, { label: string; unit: string; description: string; activeClass: string }> = {
  XP: { label: "XP Ranks", unit: "XP", description: "Combined voice and text activity", activeClass: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" },
  VOICE: { label: "Voice Ranks", unit: "hours", description: "Study time in voice channels", activeClass: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" },
  MESSAGE: { label: "Message Ranks", unit: "messages", description: "Total text messages sent", activeClass: "bg-amber-600 text-white shadow-lg shadow-amber-600/20" },
}

export default function RanksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  const [data, setData] = useState<RanksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("XP")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ required: 0, reward: 0, message: "" })
  const [addForm, setAddForm] = useState({ roleId: "", required: "", reward: "", message: "" })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Rank | null>(null)

  const fetchData = useCallback(async () => {
    if (!id || !session) return
    try {
      const [ranksRes, serverRes] = await Promise.all([
        fetch(`/api/dashboard/servers/${id}/ranks`),
        fetch(`/api/dashboard/servers/${id}`),
      ])
      if (ranksRes.ok) setData(await ranksRes.json())
      const serverData = await serverRes.json()
      setServerName(serverData.server?.name || "Server")
    } catch {}
    setLoading(false)
  }, [id, session])

  useEffect(() => { fetchData() }, [fetchData])

  const currentRanks = data
    ? activeTab === "XP" ? data.xpRanks : activeTab === "VOICE" ? data.voiceRanks : data.msgRanks
    : []

  const tabConfig = TAB_CONFIG[activeTab]

  const startEdit = (rank: Rank) => {
    setEditingId(rank.rankId)
    setEditForm({ required: rank.required, reward: rank.reward, message: rank.message || "" })
  }

  const saveEdit = async (rankId: number) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankType: activeTab, rankId, ...editForm }),
      })
      if (res.ok) { toast.success("Rank updated"); setEditingId(null); fetchData() }
      else toast.error("Failed to update rank")
    } catch { toast.error("Error saving rank") }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankType: activeTab, rankId: deleteTarget.rankId }),
      })
      if (res.ok) { toast.success("Rank deleted"); fetchData() }
      else toast.error("Failed to delete")
    } catch { toast.error("Error deleting") }
    setDeleteTarget(null)
  }

  const addRank = async () => {
    if (!addForm.roleId || !addForm.required || !addForm.reward) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rankType: activeTab,
          roleId: addForm.roleId,
          required: parseInt(addForm.required),
          reward: parseInt(addForm.reward),
          message: addForm.message || null,
        }),
      })
      if (res.ok) {
        toast.success("Rank tier added")
        setAddForm({ roleId: "", required: "", reward: "", message: "" })
        fetchData()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to add rank")
      }
    } catch { toast.error("Error adding rank") }
    setSaving(false)
  }

  return (
    <Layout SEO={{ title: `Ranks - ${serverName} - LionBot`, description: "Manage rank tiers" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />

            <PageHeader
              title="Ranks"
              description="Ranks reward members as they study. When a member reaches the required threshold, they automatically receive the role and a coin reward."
            />

            {data?.rankType && (
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="info" dot>{`Active: ${data.rankType}`}</Badge>
                {data.dmRanks && <Badge variant="purple" dot>DM Notifications On</Badge>}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setEditingId(null) }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === key ? TAB_CONFIG[key].activeClass : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {TAB_CONFIG[key].label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse h-16" />)}
              </div>
            ) : !data ? (
              <div className="text-center py-20 text-gray-400">Unable to load ranks data</div>
            ) : (
              <>
                {currentRanks.length === 0 ? (
                  <EmptyState
                    icon={<Trophy size={48} strokeWidth={1} />}
                    title={`No ${activeTab.toLowerCase()} ranks configured`}
                    description={`Add your first rank tier below. Members will earn this role when they reach the required ${tabConfig.unit}.`}
                  />
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-700 mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-800/80">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Required ({tabConfig.unit})</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reward</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Message</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {currentRanks.map((rank) => (
                          <tr key={rank.rankId} className="hover:bg-gray-800/30 transition-colors">
                            {editingId === rank.rankId ? (
                              <>
                                <td className="px-4 py-3 text-gray-300 font-mono text-xs">{rank.roleId}</td>
                                <td className="px-4 py-3">
                                  <input type="number" value={editForm.required} onChange={(e) => setEditForm((f) => ({ ...f, required: parseInt(e.target.value) || 0 }))}
                                    className="w-24 bg-gray-700 border border-gray-600 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </td>
                                <td className="px-4 py-3">
                                  <input type="number" value={editForm.reward} onChange={(e) => setEditForm((f) => ({ ...f, reward: parseInt(e.target.value) || 0 }))}
                                    className="w-24 bg-gray-700 border border-gray-600 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </td>
                                <td className="px-4 py-3">
                                  <input type="text" value={editForm.message} onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => saveEdit(rank.rankId)} disabled={saving} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                                      <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors">
                                      <X size={16} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3 text-gray-300 font-mono text-xs">{rank.roleId}</td>
                                <td className="px-4 py-3 text-white font-medium">{rank.required.toLocaleString()} {tabConfig.unit}</td>
                                <td className="px-4 py-3 text-amber-400">{rank.reward} coins</td>
                                <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">{rank.message || "—"}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => startEdit(rank)} className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="Edit">
                                      <Pencil size={15} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(rank)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add rank form */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Plus size={16} />
                    Add New {activeTab} Rank
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Select the role members will receive and set the requirement threshold.</p>
                  <div className="grid grid-cols-1 gap-4 sm:gap-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                      <RoleSelect
                        guildId={guildId}
                        value={addForm.roleId}
                        onChange={(v) => setAddForm((f) => ({ ...f, roleId: (v as string) || "" }))}
                        label="Role"
                        placeholder="Select a role..."
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Required ({tabConfig.unit})</label>
                        <input type="number" value={addForm.required} onChange={(e) => setAddForm((f) => ({ ...f, required: e.target.value }))}
                          placeholder={`e.g. ${activeTab === "XP" ? "1000" : activeTab === "VOICE" ? "10" : "500"}`}
                          className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Coin Reward</label>
                        <input type="number" value={addForm.reward} onChange={(e) => setAddForm((f) => ({ ...f, reward: e.target.value }))}
                          placeholder="e.g. 500"
                          className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Rank-Up Message (optional)</label>
                        <input type="text" value={addForm.message} onChange={(e) => setAddForm((f) => ({ ...f, message: e.target.value }))}
                          placeholder="Congratulations! You reached..."
                          className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                  </div>
                  <button onClick={addRank} disabled={saving || !addForm.roleId || !addForm.required || !addForm.reward}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-all">
                    <Plus size={16} />
                    {saving ? "Adding..." : "Add Rank"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Delete Rank Tier"
          message={`This will permanently remove this rank tier. Members who already have this role will keep it, but no new members will earn it.`}
          confirmLabel="Delete Rank"
          variant="danger"
        />
      </AdminGuard>
    </Layout>
  )
}
