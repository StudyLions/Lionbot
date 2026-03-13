// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Ranks editor with tabbed view for XP/Voice/Message
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"

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

const tabs: { key: TabKey; label: string; color: string }[] = [
  { key: "XP", label: "XP Ranks", color: "emerald" },
  { key: "VOICE", label: "Voice Ranks", color: "indigo" },
  { key: "MESSAGE", label: "Message Ranks", color: "amber" },
]

export default function RanksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<RanksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("XP")
  const [toast, setToast] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ required: 0, reward: 0, message: "" })
  const [addForm, setAddForm] = useState({ roleId: "", required: "", reward: "", message: "" })
  const [saving, setSaving] = useState(false)

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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const currentRanks = data
    ? activeTab === "XP" ? data.xpRanks : activeTab === "VOICE" ? data.voiceRanks : data.msgRanks
    : []

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
      if (res.ok) { showToast("Rank updated"); setEditingId(null); fetchData() }
      else showToast("Failed to update")
    } catch { showToast("Error saving") }
    setSaving(false)
  }

  const deleteRank = async (rankId: number) => {
    if (!confirm("Delete this rank tier?")) return
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankType: activeTab, rankId }),
      })
      if (res.ok) { showToast("Rank deleted"); fetchData() }
      else showToast("Failed to delete")
    } catch { showToast("Error deleting") }
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
        showToast("Rank added")
        setAddForm({ roleId: "", required: "", reward: "", message: "" })
        fetchData()
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to add")
      }
    } catch { showToast("Error adding") }
    setSaving(false)
  }

  const tabColor = tabs.find(t => t.key === activeTab)?.color || "emerald"

  return (
    <Layout SEO={{ title: `Ranks - ${serverName} - LionBot`, description: "Manage rank tiers" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

            {/* Active rank type badge */}
            {data?.rankType && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-gray-400 text-sm">Active rank system:</span>
                <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                  {data.rankType}
                </span>
                {data.dmRanks && (
                  <span className="text-xs font-medium bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                    DM Notifications
                  </span>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setEditingId(null) }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? `bg-${tab.color}-600 text-white shadow-lg`
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse h-16" />)}
              </div>
            ) : !data ? (
              <div className="text-center py-20 text-gray-400">Unable to load ranks data</div>
            ) : (
              <>
                {/* Ranks table */}
                {currentRanks.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700 mb-6">
                    <span className="text-4xl block mb-3">🏆</span>
                    <p className="text-gray-400">No {activeTab.toLowerCase()} ranks configured yet</p>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mb-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700 text-left">
                          <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400">Role ID</th>
                          <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400">Required</th>
                          <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400">Reward</th>
                          <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400">Message</th>
                          <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {currentRanks.map((rank) => (
                          <tr key={rank.rankId} className="hover:bg-gray-750/50">
                            {editingId === rank.rankId ? (
                              <>
                                <td className="px-5 py-3 text-sm text-gray-300 font-mono">{rank.roleId}</td>
                                <td className="px-5 py-3">
                                  <input type="number" value={editForm.required} onChange={e => setEditForm(f => ({ ...f, required: parseInt(e.target.value) || 0 }))}
                                    className="w-24 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm" />
                                </td>
                                <td className="px-5 py-3">
                                  <input type="number" value={editForm.reward} onChange={e => setEditForm(f => ({ ...f, reward: parseInt(e.target.value) || 0 }))}
                                    className="w-24 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm" />
                                </td>
                                <td className="px-5 py-3">
                                  <input type="text" value={editForm.message} onChange={e => setEditForm(f => ({ ...f, message: e.target.value }))}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm" placeholder="Optional message" />
                                </td>
                                <td className="px-5 py-3 text-right space-x-2">
                                  <button onClick={() => saveEdit(rank.rankId)} disabled={saving}
                                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Save</button>
                                  <button onClick={() => setEditingId(null)}
                                    className="text-gray-400 hover:text-white text-sm">Cancel</button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-5 py-3 text-sm text-gray-300 font-mono">{rank.roleId}</td>
                                <td className="px-5 py-3 text-sm text-white font-medium">{rank.required.toLocaleString()}</td>
                                <td className="px-5 py-3 text-sm text-amber-400">{rank.reward} coins</td>
                                <td className="px-5 py-3 text-sm text-gray-400 truncate max-w-[200px]">{rank.message || "—"}</td>
                                <td className="px-5 py-3 text-right space-x-2">
                                  <button onClick={() => startEdit(rank)}
                                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Edit</button>
                                  <button onClick={() => deleteRank(rank.rankId)}
                                    className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
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
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                  <h3 className="text-white font-medium mb-4">Add New {activeTab} Rank</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <input type="text" placeholder="Role ID" value={addForm.roleId}
                      onChange={e => setAddForm(f => ({ ...f, roleId: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                    <input type="number" placeholder="Required threshold" value={addForm.required}
                      onChange={e => setAddForm(f => ({ ...f, required: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                    <input type="number" placeholder="Coin reward" value={addForm.reward}
                      onChange={e => setAddForm(f => ({ ...f, reward: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                    <input type="text" placeholder="Message (optional)" value={addForm.message}
                      onChange={e => setAddForm(f => ({ ...f, message: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                  </div>
                  <button onClick={addRank} disabled={saving || !addForm.roleId || !addForm.required || !addForm.reward}
                    className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                    {saving ? "Adding..." : "Add Rank"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-xl border border-gray-700 text-sm z-50 animate-pulse">
            {toast}
          </div>
        )}
      </AdminGuard>
    </Layout>
  )
}
