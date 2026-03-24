// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family settings page with info editing, icon, daily
//          gold cap, visual permissions editor grid, and danger
//          zone (transfer leadership, disband).
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import PetShell from "@/components/pet/PetShell"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import {
  hasPermission, canEditRolePerms,
  PERMISSION_KEYS, PERMISSION_LABELS,
  type PermissionKey, type AllRolePermissions,
} from "@/utils/familyPermissions"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Match the nested response shape from /api/pet/family
interface FamilyOverviewResponse {
  family: {
    familyId: number
    rolePermissions?: unknown
    level: number
  } | null
  membership: { role: string } | null
}
// --- END AI-MODIFIED ---

interface FamilySettings {
  name: string
  description: string | null
  iconUrl: string | null
  dailyGoldCap: number
}

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Match /api/pet/family/members response shape
interface FamilyMembersResponse {
  members: Array<{
    discordId: string
    discordName: string
    petName: string
    role: string
  }>
}
// --- END AI-MODIFIED ---

const EDITABLE_ROLES = ["ADMIN", "MODERATOR", "MEMBER"] as const

export default function FamilySettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Correctly destructure nested API response
  const { data: familyCtx, isLoading: ctxLoading } = useDashboard<FamilyOverviewResponse>(
    session ? "/api/pet/family" : null
  )

  const familyId = familyCtx?.family?.familyId
  const role = familyCtx?.membership?.role ?? "MEMBER"
  const perms = familyCtx?.family?.rolePermissions
  const canEdit = hasPermission(role, "edit_settings", perms)
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (!ctxLoading && familyId && !canEdit) {
      router.replace("/pet/family")
    }
  }, [ctxLoading, familyId, canEdit, router])

  if (ctxLoading) {
    return (
      <Layout SEO={{ title: "Family Settings - LionGotchi", description: "Manage your family" }}>
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
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-60" />
                <Skeleton className="h-40" />
          {/* --- AI-REPLACED (2026-03-24) --- */}
          {/* Original closing: </div></div></div> */}
          </PetShell>
          {/* --- END AI-REPLACED --- */}
        </AdminGuard>
      </Layout>
    )
  }

  if (!familyId) {
    return (
      <Layout SEO={{ title: "Family Settings - LionGotchi", description: "Manage your family" }}>
        <AdminGuard variant="pet">
          {/* --- AI-REPLACED (2026-03-24) --- */}
          {/* Reason: Migrated to PetShell for consistent layout */}
          {/* --- Original code (commented out for rollback) ---
          <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
            <div className="max-w-6xl mx-auto flex gap-6">
              <PetNav />
              <div className="flex-1 min-w-0">
          --- End original code --- */}
          <PetShell>
          {/* --- END AI-REPLACED --- */}
                <PixelCard className="p-12 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                    You are not in a family.
                  </p>
                </PixelCard>
          {/* --- AI-REPLACED (2026-03-24) --- */}
          {/* Original closing: </div></div></div> */}
          </PetShell>
          {/* --- END AI-REPLACED --- */}
        </AdminGuard>
      </Layout>
    )
  }

  return (
    <Layout SEO={{ title: "Family Settings - LionGotchi", description: "Manage your family" }}>
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
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Family Settings</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Configure your family&apos;s name, permissions, and more
                </p>
              </div>

              <FamilyInfoSection familyId={familyId} role={role} />
              {/* Icon upload disabled for now -- will be re-enabled later */}
              {/* <FamilyIconSection familyId={familyId} /> */}
              {role === "LEADER" && <DailyCapSection familyId={familyId} />}
              <PermissionsSection familyId={familyId} role={role} />
              {role === "LEADER" && <DangerZoneSection familyId={familyId} />}
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

function FamilyInfoSection({ familyId, role }: { familyId: number; role: string }) {
  const { data, isLoading, mutate } = useDashboard<FamilySettings>(
    `/api/pet/family/settings?familyId=${familyId}`
  )

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (data) {
      setName(data.name)
      setDescription(data.description ?? "")
      setDirty(false)
    }
  }, [data])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/settings", {
        name: name !== data?.name ? name : undefined,
        description: description !== (data?.description ?? "") ? description : undefined,
      })
      toast.success("Family info updated!")
      mutate()
      setDirty(false)
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }, [name, description, data, mutate])

  if (isLoading) return <Skeleton className="h-48" />

  return (
    <PixelCard className="p-4 space-y-4" corners>
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\uD83D\uDCDD"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Family Info</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] block mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setDirty(true) }}
            maxLength={32}
            className={cn(
              "w-full font-pixel text-sm bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2",
              "text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c]",
              "focus:outline-none focus:border-[var(--pet-gold,#f0c040)]"
            )}
          />
          {name !== data?.name && (
            <p className="font-pixel text-[9px] text-[var(--pet-gold,#f0c040)] mt-1 flex items-center gap-1">
              {"\u26A0\uFE0F"} Renaming costs 500 gems
            </p>
          )}
        </div>

        <div>
          <label className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] block mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setDirty(true) }}
            maxLength={200}
            rows={3}
            className={cn(
              "w-full font-pixel text-sm bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2 resize-none",
              "text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c]",
              "focus:outline-none focus:border-[var(--pet-gold,#f0c040)]"
            )}
            placeholder="Tell others about your family..."
          />
          <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] text-right">
            {description.length}/200
          </p>
        </div>

        <PixelButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving}
          loading={saving}
        >
          Save Changes
        </PixelButton>
      </div>
    </PixelCard>
  )
}

function FamilyIconSection({ familyId }: { familyId: number }) {
  const { data, isLoading, mutate } = useDashboard<FamilySettings>(
    `/api/pet/family/settings?familyId=${familyId}`
  )

  const [iconUrl, setIconUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setIconUrl(data.iconUrl ?? "")
  }, [data])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/settings", { iconUrl })
      toast.success("Icon updated!")
      mutate()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }, [iconUrl, mutate])

  if (isLoading) return <Skeleton className="h-36" />

  const currentIcon = data?.iconUrl

  return (
    <PixelCard className="p-4 space-y-3" corners>
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\uD83D\uDDBC\uFE0F"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Family Icon</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 border-2 border-[#2a3a5c] bg-[#080c18] flex items-center justify-center flex-shrink-0">
          {currentIcon ? (
            <img
              src={currentIcon}
              alt="Family icon"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <span className="font-pixel text-2xl text-[var(--pet-text-dim,#8899aa)]">{"\uD83E\uDD81"}</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            placeholder="https://example.com/icon.png"
            className={cn(
              "w-full font-pixel text-sm bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2",
              "text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c]",
              "focus:outline-none focus:border-[var(--pet-gold,#f0c040)]"
            )}
          />
          <p className="font-pixel text-[9px] text-[var(--pet-gold,#f0c040)] flex items-center gap-1">
            {"\u26A0\uFE0F"} Upload costs 200 gems
          </p>
        </div>
      </div>

      <PixelButton
        variant="gold"
        size="sm"
        onClick={handleSave}
        disabled={saving || iconUrl === (data?.iconUrl ?? "")}
        loading={saving}
      >
        Save Icon
      </PixelButton>
    </PixelCard>
  )
}

function DailyCapSection({ familyId }: { familyId: number }) {
  const { data, isLoading, mutate } = useDashboard<FamilySettings>(
    `/api/pet/family/settings?familyId=${familyId}`
  )

  const [cap, setCap] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setCap(String(data.dailyGoldCap))
  }, [data])

  const handleSave = useCallback(async () => {
    const parsed = parseInt(cap, 10)
    if (!parsed || parsed < 0) { toast.error("Enter a valid number"); return }
    setSaving(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/settings", { dailyGoldCap: parsed })
      toast.success("Daily withdrawal cap updated!")
      mutate()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }, [cap, mutate])

  if (isLoading) return <Skeleton className="h-28" />

  return (
    <PixelCard className="p-4 space-y-3" corners>
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\uD83D\uDCB0"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Daily Gold Withdrawal Cap</span>
        <span className="font-pixel text-[9px] text-[var(--pet-gold,#f0c040)] ml-auto border border-[var(--pet-gold,#f0c040)]/30 bg-[var(--pet-gold,#f0c040)]/5 px-1.5 py-0.5">
          Leader only
        </span>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] block mb-1">
            Max gold per member per day
          </label>
          <input
            type="number"
            min={0}
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            className={cn(
              "w-full font-pixel text-sm bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2",
              "text-[var(--pet-text,#e2e8f0)]",
              "focus:outline-none focus:border-[var(--pet-gold,#f0c040)]"
            )}
          />
        </div>
        <PixelButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saving || cap === String(data?.dailyGoldCap)}
          loading={saving}
        >
          Save
        </PixelButton>
      </div>
    </PixelCard>
  )
}

function PermissionsSection({ familyId, role }: { familyId: number; role: string }) {
  const { data: permsData, isLoading, mutate } = useDashboard<AllRolePermissions>(
    `/api/pet/family/permissions?familyId=${familyId}`
  )

  const [localPerms, setLocalPerms] = useState<AllRolePermissions | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (permsData) {
      setLocalPerms(structuredClone(permsData))
      setDirty(false)
    }
  }, [permsData])

  const togglePerm = useCallback((targetRole: string, key: PermissionKey) => {
    if (!canEditRolePerms(role, targetRole)) return
    setLocalPerms((prev) => {
      if (!prev) return prev
      const updated = structuredClone(prev)
      updated[targetRole][key] = !updated[targetRole][key]
      return updated
    })
    setDirty(true)
  }, [role])

  const handleSave = useCallback(async () => {
    if (!localPerms) return
    setSaving(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/permissions", {
        permissions: localPerms,
      })
      toast.success("Permissions saved!")
      mutate()
      setDirty(false)
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }, [localPerms, mutate])

  if (isLoading || !localPerms) return <Skeleton className="h-80" />

  return (
    <PixelCard className="p-4 space-y-3" corners>
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\uD83D\uDD10"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Permissions</span>
        {dirty && (
          <span className="font-pixel text-[9px] text-[var(--pet-gold,#f0c040)] ml-auto animate-pulse">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr>
              <th className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] text-left pr-3 py-1.5">
                Permission
              </th>
              {EDITABLE_ROLES.map((r) => (
                <th key={r} className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] text-center px-2 py-1.5">
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_KEYS.map((key) => {
              const isChanged = EDITABLE_ROLES.some(
                (r) => localPerms[r]?.[key] !== permsData?.[r]?.[key]
              )

              return (
                <tr
                  key={key}
                  className={cn(
                    "border-t border-[#1a2a3c] transition-colors",
                    isChanged && "bg-[var(--pet-gold,#f0c040)]/5"
                  )}
                >
                  <td className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] pr-3 py-1.5">
                    {PERMISSION_LABELS[key]}
                  </td>
                  {EDITABLE_ROLES.map((r) => {
                    const canToggle = canEditRolePerms(role, r)
                    const isOn = localPerms[r]?.[key] ?? false

                    return (
                      <td key={r} className="text-center px-2 py-1.5">
                        <button
                          onClick={() => togglePerm(r, key)}
                          disabled={!canToggle}
                          className={cn(
                            "w-6 h-6 border-2 transition-all inline-flex items-center justify-center",
                            canToggle
                              ? "cursor-pointer hover:brightness-125"
                              : "cursor-not-allowed opacity-40",
                            isOn
                              ? "bg-[var(--pet-green,#40d870)]/20 border-[var(--pet-green,#40d870)]"
                              : "bg-[#0a0e1a] border-[#2a3a5c]"
                          )}
                        >
                          {isOn && (
                            <span className="font-pixel text-[10px] text-[var(--pet-green,#40d870)]">
                              {"\u2713"}
                            </span>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <PixelButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving}
          loading={saving}
        >
          Save Permissions
        </PixelButton>
        {dirty && (
          <PixelButton
            variant="ghost"
            size="sm"
            onClick={() => {
              if (permsData) {
                setLocalPerms(structuredClone(permsData))
                setDirty(false)
              }
            }}
          >
            Reset
          </PixelButton>
        )}
      </div>
    </PixelCard>
  )
}

function DangerZoneSection({ familyId }: { familyId: number }) {
  const router = useRouter()
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Correctly destructure members API response
  const { data: membersResp } = useDashboard<FamilyMembersResponse>(
    familyId ? `/api/pet/family/members` : null
  )

  const [transferTarget, setTransferTarget] = useState("")
  const [showDisband, setShowDisband] = useState(false)
  const [disbandConfirm, setDisbandConfirm] = useState("")
  const [acting, setActing] = useState(false)

  const adminMembers = membersResp?.members?.filter((m) => m.role === "ADMIN") ?? []
  // --- END AI-MODIFIED ---

  const handleTransfer = useCallback(async () => {
    if (!transferTarget) { toast.error("Select a member"); return }
    setActing(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/settings", {
        transferLeadership: transferTarget,
      })
      toast.success("Leadership transferred!")
      invalidate("/api/pet/family")
      router.push("/pet/family")
    } catch (e: any) {
      toast.error(e.message || "Transfer failed")
    } finally {
      setActing(false)
    }
  }, [transferTarget, router])

  const handleDisband = useCallback(async () => {
    if (disbandConfirm !== "DISBAND") {
      toast.error("Type DISBAND to confirm")
      return
    }
    setActing(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/disband", {})
      toast.success("Family disbanded.")
      invalidate("/api/pet/family")
      router.push("/pet/family")
    } catch (e: any) {
      toast.error(e.message || "Disband failed")
    } finally {
      setActing(false)
    }
  }, [disbandConfirm, router])

  return (
    <PixelCard className="p-4 space-y-4" corners borderColor="#e04040">
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#e04040]/30">
        <span className="font-pixel text-[14px]">{"\u26A0\uFE0F"}</span>
        <span className="font-pixel text-xs text-[var(--pet-red,#e04040)]">Danger Zone</span>
      </div>

      {/* Transfer Leadership */}
      <div className="space-y-2">
        <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">
          Transfer Leadership
        </p>
        <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
          Transfer your leader role to an admin member. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <select
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
            className={cn(
              "flex-1 font-pixel text-sm bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2",
              "text-[var(--pet-text,#e2e8f0)]",
              "focus:outline-none focus:border-[var(--pet-red,#e04040)]"
            )}
          >
            <option value="">Select an admin...</option>
            {adminMembers.map((m) => (
              <option key={m.discordId} value={m.discordId}>
                {m.petName} (@{m.discordName})
              </option>
            ))}
          </select>
          <PixelButton
            variant="danger"
            size="sm"
            onClick={handleTransfer}
            disabled={!transferTarget || acting}
            loading={acting}
          >
            Transfer
          </PixelButton>
        </div>
        {!adminMembers.length && (
          <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] italic">
            Promote a member to Admin first before transferring leadership.
          </p>
        )}
      </div>

      <div className="h-px bg-[#e04040]/20" />

      {/* Disband */}
      <div className="space-y-2">
        <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">
          Disband Family
        </p>
        <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
          Permanently delete this family. All bank items and gold will be lost. This action is irreversible.
        </p>
        {!showDisband ? (
          <PixelButton variant="danger" size="sm" onClick={() => setShowDisband(true)}>
            Disband Family...
          </PixelButton>
        ) : (
          <div className="space-y-2 p-3 border-2 border-[#e04040]/30 bg-[#e04040]/5">
            <p className="font-pixel text-[10px] text-[var(--pet-red,#e04040)]">
              Type <span className="text-[var(--pet-text,#e2e8f0)]">DISBAND</span> to confirm:
            </p>
            <input
              type="text"
              value={disbandConfirm}
              onChange={(e) => setDisbandConfirm(e.target.value)}
              placeholder="DISBAND"
              className={cn(
                "w-full font-pixel text-sm bg-[#080c18] border-2 border-[#e04040]/40 px-3 py-2",
                "text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c]",
                "focus:outline-none focus:border-[var(--pet-red,#e04040)]"
              )}
            />
            <div className="flex gap-2">
              <PixelButton
                variant="danger"
                size="sm"
                onClick={handleDisband}
                disabled={disbandConfirm !== "DISBAND" || acting}
                loading={acting}
              >
                Confirm Disband
              </PixelButton>
              <PixelButton
                variant="ghost"
                size="sm"
                onClick={() => { setShowDisband(false); setDisbandConfirm("") }}
              >
                Cancel
              </PixelButton>
            </div>
          </div>
        )}
      </div>
    </PixelCard>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
