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
  clearRoleCache,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback } from "react"
import { Trophy, Plus, Pencil, Trash2, X, Check, GripVertical, Download } from "lucide-react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

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

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: rank presets for Load Preset feature
interface PresetTier {
  required: number
  reward: number
  name: string
}

const PRESET_STARTER: PresetTier[] = [
  { required: 10, reward: 100, name: "Newcomer" },
  { required: 50, reward: 250, name: "Regular" },
  { required: 200, reward: 500, name: "Dedicated" },
  { required: 500, reward: 1000, name: "Expert" },
  { required: 1000, reward: 2000, name: "Master" },
]

const PRESET_STANDARD: PresetTier[] = [
  { required: 5, reward: 50, name: "Bronze I" },
  { required: 15, reward: 100, name: "Bronze II" },
  { required: 30, reward: 150, name: "Silver I" },
  { required: 60, reward: 200, name: "Silver II" },
  { required: 100, reward: 300, name: "Gold I" },
  { required: 200, reward: 500, name: "Gold II" },
  { required: 400, reward: 750, name: "Platinum I" },
  { required: 700, reward: 1000, name: "Platinum II" },
  { required: 1200, reward: 1500, name: "Diamond" },
  { required: 2000, reward: 3000, name: "Champion" },
]

// Hardcore: 20 tiers from 5 to 5000 with increasing gaps and rewards
const PRESET_HARDCORE: PresetTier[] = (() => {
  const names = ["Rookie", "Beginner", "Learner", "Apprentice", "Student", "Scholar", "Adept", "Expert", "Veteran", "Master", "Grandmaster", "Champion", "Legend", "Mythic", "Titan", "Sovereign", "Ascendant", "Transcendent", "Paragon", "Apex"]
  const tiers: PresetTier[] = []
  for (let i = 0; i < 20; i++) {
    const required = Math.round(5 * Math.pow(5000 / 5, i / 19))
    const reward = Math.round(100 + (2400 * Math.pow(i / 19, 0.9)))
    tiers.push({ required, reward, name: names[i] })
  }
  return tiers
})()

const PRESETS = [
  { id: "starter", name: "Starter (5 tiers)", tiers: PRESET_STARTER, description: "For small communities" },
  { id: "standard", name: "Standard (10 tiers)", tiers: PRESET_STANDARD, description: "For medium communities" },
  { id: "hardcore", name: "Hardcore (20 tiers)", tiers: PRESET_HARDCORE, description: "For large study communities" },
] as const

function scalePresetForTab(tiers: PresetTier[], tab: TabKey): PresetTier[] {
  const scale = tab === "VOICE" ? 0.1 : tab === "MESSAGE" ? 10 : 1
  return tiers.map((t) => ({ ...t, required: Math.round(t.required * scale), reward: t.reward }))
}
// --- END AI-MODIFIED ---

const TAB_CONFIG: Record<TabKey, { label: string; unit: string; description: string; activeClass: string }> = {
  XP: { label: "XP Ranks", unit: "XP", description: "Combined voice and text activity", activeClass: "bg-emerald-600 text-foreground shadow-lg shadow-emerald-600/20" },
  VOICE: { label: "Voice Ranks", unit: "hours", description: "Study time in voice channels", activeClass: "bg-primary text-foreground shadow-lg shadow-indigo-600/20" },
  MESSAGE: { label: "Message Ranks", unit: "messages", description: "Total text messages sent", activeClass: "bg-amber-600 text-foreground shadow-lg shadow-amber-600/20" },
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: Sortable row wrapper for drag-and-drop rank ordering
function SortableRankRow({
  rank,
  tabConfig,
  editingId,
  editForm,
  setEditForm,
  setEditingId,
  setDeleteTarget,
  startEdit,
  saveEdit,
  saving,
}: {
  rank: Rank
  tabConfig: (typeof TAB_CONFIG)[TabKey]
  editingId: number | null
  editForm: { required: number; reward: number; message: string }
  setEditForm: React.Dispatch<React.SetStateAction<{ required: number; reward: number; message: string }>>
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>
  setDeleteTarget: React.Dispatch<React.SetStateAction<Rank | null>>
  startEdit: (r: Rank) => void
  saveEdit: (id: number) => void
  saving: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rank.rankId })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-accent/30 transition-colors ${isDragging ? "opacity-50 bg-accent/50" : ""}`}
    >
      <td className="px-2 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing rounded hover:bg-muted"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      </td>
      {editingId === rank.rankId ? (
        <>
          <td className="px-4 py-3 text-foreground/80 font-mono text-xs">{rank.roleId}</td>
          <td className="px-4 py-3">
            <input type="number" value={editForm.required} onChange={(e) => setEditForm((f) => ({ ...f, required: parseInt(e.target.value) || 0 }))}
              className="w-24 bg-muted border border-border text-foreground rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </td>
          <td className="px-4 py-3">
            <input type="number" value={editForm.reward} onChange={(e) => setEditForm((f) => ({ ...f, reward: parseInt(e.target.value) || 0 }))}
              className="w-24 bg-muted border border-border text-foreground rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </td>
          <td className="px-4 py-3">
            <input type="text" value={editForm.message} onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full bg-muted border border-border text-foreground rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Optional" />
          </td>
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => saveEdit(rank.rankId)} disabled={saving} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                <Check size={16} />
              </button>
              <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="px-4 py-3 text-foreground/80 font-mono text-xs">{rank.roleId}</td>
          <td className="px-4 py-3 text-foreground font-medium">{rank.required.toLocaleString()} {tabConfig.unit}</td>
          <td className="px-4 py-3 text-amber-400">{rank.reward} coins</td>
          <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{rank.message || "—"}</td>
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => startEdit(rank)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-indigo-400/10 rounded-lg transition-colors" title="Edit">
                <Pencil size={15} />
              </button>
              <button onClick={() => setDeleteTarget(rank)} className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </td>
        </>
      )}
    </tr>
  )
}
// --- END AI-MODIFIED ---

export default function RanksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data, error, isLoading: loading, mutate } = useDashboard<RanksData>(
    id && session ? `/api/dashboard/servers/${id}/ranks` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"
  // --- END AI-MODIFIED ---
  const [activeTab, setActiveTab] = useState<TabKey>("XP")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ required: 0, reward: 0, message: "" })
  const [addForm, setAddForm] = useState({ roleId: "", required: "", reward: "", message: "" })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Rank | null>(null)
  const [deleting, setDeleting] = useState(false)
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: preset dialog and confirmation state
  const [presetDialogOpen, setPresetDialogOpen] = useState(false)
  const [presetConfirmOpen, setPresetConfirmOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESETS[number] | null>(null)
  const [loadingPreset, setLoadingPreset] = useState(false)
  const [guildRoles, setGuildRoles] = useState<{ id: string; name: string }[]>([])
  // --- END AI-MODIFIED ---

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
      if (res.ok) { toast.success("Rank updated"); setEditingId(null); mutate() }
      else toast.error("Failed to update rank")
    } catch { toast.error("Error saving rank") }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankType: activeTab, rankId: deleteTarget.rankId }),
      })
      if (res.ok) { toast.success("Rank deleted"); mutate() }
      else toast.error("Failed to delete")
    } catch { toast.error("Error deleting") }
    setDeleteTarget(null)
    setDeleting(false)
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
        clearRoleCache(guildId)
        mutate()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to add rank")
      }
    } catch { toast.error("Error adding rank") }
    setSaving(false)
  }

  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: Load preset - fetch roles when opening dialog, apply preset on confirm
  const openPresetDialog = useCallback(async () => {
    setPresetDialogOpen(true)
    try {
      const r = await fetch(`/api/discord/guild/${guildId}/roles`)
      if (r.ok) {
        const roles = await r.json()
        setGuildRoles(roles.filter((x: { managed: boolean }) => !x.managed).filter((x: { name: string }) => x.name !== "@everyone"))
      }
    } catch {
      toast.error("Could not load roles")
    }
  }, [guildId])

  const handlePresetSelect = (preset: typeof PRESETS[number]) => {
    setSelectedPreset(preset)
    setPresetDialogOpen(false)
    setPresetConfirmOpen(true)
  }

  const applyPreset = async () => {
    if (!selectedPreset || !id) return
    setLoadingPreset(true)
    const scaledTiers = scalePresetForTab(selectedPreset.tiers, activeTab)
    const roleMap = new Map(guildRoles.map((r) => [r.name.toLowerCase(), r.id]))
    const toCreate = scaledTiers.filter((t) => roleMap.has(t.name.toLowerCase())).map((t) => ({ ...t, roleId: roleMap.get(t.name.toLowerCase())! }))
    const missing = scaledTiers.filter((t) => !roleMap.has(t.name.toLowerCase())).map((t) => t.name)
    if (missing.length > 0) {
      toast.error(`Create these roles first: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` and ${missing.length - 5} more` : ""}`)
      setLoadingPreset(false)
      setPresetConfirmOpen(false)
      setSelectedPreset(null)
      return
    }
    try {
      for (const rank of currentRanks) {
        await fetch(`/api/dashboard/servers/${id}/ranks`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rankType: activeTab, rankId: rank.rankId }),
        })
      }
      for (const tier of toCreate) {
        const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rankType: activeTab,
            roleId: tier.roleId,
            required: tier.required,
            reward: tier.reward,
            message: null,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to create rank")
        }
      }
      clearRoleCache(guildId)
      mutate()
      toast.success(`Loaded ${selectedPreset.name} preset`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to apply preset")
    }
    setLoadingPreset(false)
    setPresetConfirmOpen(false)
    setSelectedPreset(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !data) return
    const ranks = [...currentRanks]
    const oldIndex = ranks.findIndex((r) => r.rankId === active.id)
    const newIndex = ranks.findIndex((r) => r.rankId === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const [moved] = ranks.splice(oldIndex, 1)
    ranks.splice(newIndex, 0, moved)
    const maxOrig = Math.max(...currentRanks.map((r) => r.required), 100)
    const minReq = 1
    const maxReq = maxOrig + 100
    const newReqs: number[] = []
    for (let i = 0; i < ranks.length; i++) {
      if (ranks.length === 1) newReqs.push(minReq)
      else if (i === 0) newReqs.push(minReq)
      else if (i === ranks.length - 1) newReqs.push(maxReq)
      else newReqs.push(Math.round(minReq + (maxReq - minReq) * (i / (ranks.length - 1))))
    }
    setSaving(true)
    try {
      for (let i = 0; i < ranks.length; i++) {
        const r = ranks[i]
        const newReq = newReqs[i]
        if (r.required !== newReq) {
          await fetch(`/api/dashboard/servers/${id}/ranks`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rankType: activeTab, rankId: r.rankId, required: newReq }),
          })
        }
      }
      mutate()
      toast.success("Ranks reordered")
    } catch {
      toast.error("Failed to save order")
    }
    setSaving(false)
  }
  // --- END AI-MODIFIED ---

  return (
    <Layout SEO={{ title: `Ranks - ${serverName} - LionBot`, description: "Manage rank tiers" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
            <div className="flex-1 min-w-0">
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
                    activeTab === key ? TAB_CONFIG[key].activeClass : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {TAB_CONFIG[key].label}
                </button>
              ))}
            </div>

            {/* --- AI-MODIFIED (2026-03-13) --- */}
            {/* Purpose: Load Preset button - opens preset selection dialog */}
            <div className="mb-6">
              <Button variant="outline" size="sm" onClick={openPresetDialog} disabled={loading || !data}>
                <Download size={16} className="mr-2" />
                Load Preset
              </Button>
            </div>
            {/* --- END AI-MODIFIED --- */}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse h-16" />)}
              </div>
            ) : !data ? (
              <div className="text-center py-20 text-muted-foreground">Unable to load ranks data</div>
            ) : (
              <>
                {currentRanks.length === 0 ? (
                  <EmptyState
                    icon={<Trophy size={48} strokeWidth={1} />}
                    title={`No ${activeTab.toLowerCase()} ranks configured`}
                    description={`Add your first rank tier below. Members will earn this role when they reach the required ${tabConfig.unit}.`}
                  />
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border mb-6">
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-card/80">
                            <th className="px-2 py-3 w-8" />
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Required ({tabConfig.unit})</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Reward</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Message</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase w-28">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <SortableContext items={currentRanks.map((r) => r.rankId)} strategy={verticalListSortingStrategy}>
                            {currentRanks.map((rank) => (
                              <SortableRankRow
                                key={rank.rankId}
                                rank={rank}
                                tabConfig={tabConfig}
                                editingId={editingId}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                setEditingId={setEditingId}
                                setDeleteTarget={setDeleteTarget}
                                startEdit={startEdit}
                                saveEdit={saveEdit}
                                saving={saving}
                              />
                            ))}
                          </SortableContext>
                        </tbody>
                      </table>
                    </DndContext>
                  </div>
                )}

                {/* Add rank form */}
                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                    <Plus size={16} />
                    Add New {activeTab} Rank
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Select the role members will receive and set the requirement threshold.</p>
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
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Required ({tabConfig.unit})</label>
                        <input type="number" value={addForm.required} onChange={(e) => setAddForm((f) => ({ ...f, required: e.target.value }))}
                          placeholder={`e.g. ${activeTab === "XP" ? "1000" : activeTab === "VOICE" ? "10" : "500"}`}
                          className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Coin Reward</label>
                        <input type="number" value={addForm.reward} onChange={(e) => setAddForm((f) => ({ ...f, reward: e.target.value }))}
                          placeholder="e.g. 500"
                          className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Rank-Up Message (optional)</label>
                        <input type="text" value={addForm.message} onChange={(e) => setAddForm((f) => ({ ...f, message: e.target.value }))}
                          placeholder="Congratulations! You reached..."
                          className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                  </div>
                  <button onClick={addRank} disabled={saving || !addForm.roleId || !addForm.required || !addForm.reward}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg text-sm font-medium transition-all">
                    <Plus size={16} />
                    {saving ? "Adding..." : "Add Rank"}
                  </button>
                </div>
              </>
            )}
            </div>
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
          loading={deleting}
        />

        {/* --- AI-MODIFIED (2026-03-13) --- */}
        {/* Purpose: Preset selection dialog */}
        <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Rank Preset</DialogTitle>
              <DialogDescription>
                Choose a preset to replace all current {activeTab.toLowerCase()} ranks. Create roles with the preset names in your server first (e.g. Newcomer, Regular for Starter).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="font-medium text-foreground">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">{preset.description}</div>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPresetDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmModal
          open={presetConfirmOpen}
          onConfirm={applyPreset}
          onCancel={() => { setPresetConfirmOpen(false); setSelectedPreset(null) }}
          title="Confirm Preset"
          message={selectedPreset ? `This will replace all current ${activeTab.toLowerCase()} ranks with the ${selectedPreset.name} preset. Continue?` : ""}
          confirmLabel="Load Preset"
          loading={loadingPreset}
        />
        {/* --- END AI-MODIFIED --- */}
      </AdminGuard>
    </Layout>
  )
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
// --- END AI-MODIFIED ---
