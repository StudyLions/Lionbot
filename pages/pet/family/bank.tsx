// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family bank page with Equipment and Treasury tabs.
//          Equipment tab: shared item storage with deposit/withdraw.
//          Treasury tab: family gold balance, deposits, withdrawals,
//          daily cap tracking, and transaction log.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import PetNav from "@/components/pet/PetNav"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { hasPermission, type PermissionKey } from "@/utils/familyPermissions"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

type BankTab = "equipment" | "treasury"

interface BankItem {
  bankEntryId: number
  inventoryId: number
  itemId: number
  name: string
  category: string
  rarity: string
  assetPath: string | null
  enhancementLevel: number
  glowTier: string
  glowIntensity: number
  depositedBy: string
  depositedByName: string
  depositedAt: string
}

interface BankItemsData {
  items: BankItem[]
}

interface InventoryItem {
  inventoryId: number
  item: {
    itemId: number
    name: string
    category: string
    rarity: string
    assetPath: string | null
    slot: string | null
  }
  enhancementLevel: number
  glowTier: string
  glowIntensity: number
  quantity: number
  equipped: boolean
  totalBonus: number
}

interface PersonalInventoryData {
  items: InventoryItem[]
  counts: { equipment: number; scrolls: number }
}

interface TreasuryData {
  balance: string
  dailyUsed: number
  dailyCap: number
  log: Array<{
    amount: number
    action: string
    description: string
    userId: string
    userName: string
    createdAt: string
  }>
}

interface FamilyCtx {
  familyId: number
  role: string
  permissions: unknown
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const TABS: { key: BankTab; label: string; icon: string }[] = [
  { key: "equipment", label: "Equipment", icon: "\u2694\uFE0F" },
  { key: "treasury", label: "Treasury", icon: "\uD83C\uDFE6" },
]

export default function FamilyBankPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<BankTab>("equipment")
  const [showDeposit, setShowDeposit] = useState(false)

  const { data: familyCtx } = useDashboard<FamilyCtx>(
    session ? "/api/pet/family" : null
  )

  const familyId = familyCtx?.familyId
  const role = familyCtx?.role ?? "MEMBER"
  const perms = familyCtx?.permissions

  return (
    <Layout SEO={{ title: "Family Bank - LionGotchi", description: "Shared family storage" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />

            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Family Bank</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Shared storage for your family&apos;s items and gold
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {TABS.map((t) => (
                  <PixelButton
                    key={t.key}
                    variant={tab === t.key ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => { setTab(t.key); setShowDeposit(false) }}
                  >
                    <span>{t.icon}</span> {t.label}
                  </PixelButton>
                ))}
              </div>

              {!familyId ? (
                <PixelCard className="p-12 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                    You are not in a family. Join or create one first!
                  </p>
                </PixelCard>
              ) : tab === "equipment" ? (
                <EquipmentTab
                  familyId={familyId}
                  role={role}
                  perms={perms}
                  showDeposit={showDeposit}
                  setShowDeposit={setShowDeposit}
                />
              ) : (
                <TreasuryTab familyId={familyId} role={role} perms={perms} />
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

function EquipmentTab({
  familyId, role, perms, showDeposit, setShowDeposit,
}: {
  familyId: number; role: string; perms: unknown
  showDeposit: boolean; setShowDeposit: (v: boolean) => void
}) {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<BankItemsData>(
    `/api/pet/family/bank/items?familyId=${familyId}`
  )
  const [acting, setActing] = useState<number | null>(null)

  const canWithdraw = hasPermission(role, "withdraw_items", perms)
  const canDeposit = hasPermission(role, "deposit_items", perms)

  const handleWithdraw = useCallback(async (bankEntryId: number) => {
    setActing(bankEntryId)
    try {
      await dashboardMutate("POST", "/api/pet/family/bank/items", {
        action: "withdraw", bankEntryId,
      })
      toast.success("Item withdrawn!")
      mutate()
      invalidate("/api/pet/inventory?filter=equipment")
    } catch (e: any) {
      toast.error(e.message || "Withdraw failed")
    } finally {
      setActing(null)
    }
  }, [mutate])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[160px]" />)}
      </div>
    )
  }

  if (error) {
    return (
      <PixelCard className="p-8 text-center" corners>
        <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
          {(error as Error).message}
        </p>
      </PixelCard>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
            {data?.items.length ?? 0} item{(data?.items.length ?? 0) !== 1 ? "s" : ""}
          </span>
          <span className="font-pixel text-[10px] text-[var(--pet-green,#40d870)] border border-[var(--pet-green,#40d870)]/30 bg-[var(--pet-green,#40d870)]/5 px-2 py-0.5">
            Unlimited capacity
          </span>
        </div>
        {canDeposit && (
          <PixelButton
            variant={showDeposit ? "ghost" : "gold"}
            size="sm"
            onClick={() => setShowDeposit(!showDeposit)}
          >
            {showDeposit ? "Cancel" : "Deposit Item"}
          </PixelButton>
        )}
      </div>

      {showDeposit && (
        <DepositPanel familyId={familyId} onDone={() => { setShowDeposit(false); mutate() }} />
      )}

      {!data?.items.length ? (
        <PixelCard className="p-12 text-center space-y-2" corners>
          <p className="font-pixel text-2xl">{"\uD83C\uDFE6"}</p>
          <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
            Bank is empty
          </p>
          <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
            Deposit equipment to share with your family
          </p>
        </PixelCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
          {data.items.map((item) => (
            <BankItemCard
              key={item.bankEntryId}
              item={item}
              canWithdraw={canWithdraw}
              acting={acting === item.bankEntryId}
              onWithdraw={() => handleWithdraw(item.bankEntryId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BankItemCard({
  item, canWithdraw, acting, onWithdraw,
}: {
  item: BankItem; canWithdraw: boolean; acting: boolean; onWithdraw: () => void
}) {
  const bc = RARITY_BORDER[item.rarity] || "#3a4a6c"
  const imgUrl = getItemImageUrl(item.assetPath, item.category)
  const depositDate = new Date(item.depositedAt)
  const dateStr = `${depositDate.getMonth() + 1}/${depositDate.getDate()}`

  return (
    <ItemGlow rarity={item.rarity} glowTier={item.glowTier as any} glowIntensity={item.glowIntensity}>
      <div
        className="flex flex-col border-2 bg-[#0c1020] transition-all hover:bg-[#101830]"
        style={{ borderColor: `${bc}80`, boxShadow: "2px 2px 0 #060810" }}
      >
        <div className="relative flex items-center justify-center h-[72px] bg-[#080c18] border-b border-[#1a2a3c]">
          {imgUrl ? (
            <CroppedItemImage src={imgUrl} alt={item.name} className="w-14 h-14 object-contain" />
          ) : (
            <span className="text-2xl">{getCategoryPlaceholder(item.category)}</span>
          )}
          {item.enhancementLevel > 0 && (
            <span className="absolute top-1 right-1 font-pixel text-[9px] text-[var(--pet-gold,#f0c040)] bg-[#0a0e1a]/80 px-1">
              +{item.enhancementLevel}
            </span>
          )}
        </div>

        <div className="px-2 py-1.5 flex-1 min-h-0">
          <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate block">
            {item.name}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <PixelBadge rarity={item.rarity} className="text-[8px] px-1 py-0" />
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] truncate">
              {item.depositedByName}
            </span>
            <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] ml-auto flex-shrink-0">
              {dateStr}
            </span>
          </div>
        </div>

        {canWithdraw && (
          <div className="px-2 pb-1.5">
            <button
              className={cn(
                "w-full font-pixel text-[9px] py-1 border transition-all",
                "hover:brightness-125 active:translate-y-px disabled:opacity-40",
                "border-[var(--pet-gold,#f0c040)] text-[var(--pet-gold,#f0c040)] bg-[#f0c040]/5 hover:bg-[#f0c040]/10"
              )}
              onClick={onWithdraw}
              disabled={acting}
            >
              {acting ? "..." : "Withdraw"}
            </button>
          </div>
        )}
      </div>
    </ItemGlow>
  )
}

function DepositPanel({ familyId, onDone }: { familyId: number; onDone: () => void }) {
  const { data: session } = useSession()
  const { data: invData, isLoading } = useDashboard<PersonalInventoryData>(
    session ? "/api/pet/inventory?filter=equipment" : null
  )
  const [depositing, setDepositing] = useState<number | null>(null)

  const unequipped = invData?.items.filter((i) => !i.equipped) ?? []

  const handleDeposit = useCallback(async (inventoryId: number) => {
    setDepositing(inventoryId)
    try {
      await dashboardMutate("POST", "/api/pet/family/bank/items", {
        action: "deposit", inventoryId,
      })
      toast.success("Item deposited to family bank!")
      invalidate("/api/pet/inventory?filter=equipment")
      onDone()
    } catch (e: any) {
      toast.error(e.message || "Deposit failed")
    } finally {
      setDepositing(null)
    }
  }, [onDone])

  return (
    <PixelCard className="p-3" corners borderColor="#f0c040">
      <div className="flex items-center gap-2 pb-2 mb-2 border-b-2 border-[#f0c040]/20">
        <span className="font-pixel text-xs text-[var(--pet-gold,#f0c040)]">
          Select an item to deposit
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[100px]" />)}
        </div>
      ) : !unequipped.length ? (
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] py-4 text-center">
          No unequipped items to deposit
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto">
          {unequipped.map((inv) => {
            const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
            const bc = RARITY_BORDER[inv.item.rarity] || "#3a4a6c"
            const isDepositing = depositing === inv.inventoryId

            return (
              <button
                key={inv.inventoryId}
                className={cn(
                  "flex flex-col items-center border-2 bg-[#0c1020] p-2 transition-all",
                  "hover:bg-[#101830] hover:border-[var(--pet-gold,#f0c040)] disabled:opacity-40"
                )}
                style={{ borderColor: `${bc}60` }}
                onClick={() => handleDeposit(inv.inventoryId)}
                disabled={isDepositing}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  {imgUrl ? (
                    <CroppedItemImage src={imgUrl} alt={inv.item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-lg">{getCategoryPlaceholder(inv.item.category)}</span>
                  )}
                </div>
                <span className="font-pixel text-[8px] text-[var(--pet-text,#e2e8f0)] truncate w-full text-center mt-1">
                  {isDepositing ? "..." : inv.item.name}
                </span>
                <PixelBadge rarity={inv.item.rarity} className="text-[7px] px-0.5 py-0 mt-0.5" />
              </button>
            )
          })}
        </div>
      )}
    </PixelCard>
  )
}

function TreasuryTab({ familyId, role, perms }: { familyId: number; role: string; perms: unknown }) {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<TreasuryData>(
    `/api/pet/family/bank/gold?familyId=${familyId}`,
    { refreshInterval: 30000 }
  )
  const { data: overview } = useDashboard<{ gold: number }>(
    session ? "/api/pet/overview" : null
  )

  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canDeposit = hasPermission(role, "deposit_gold", perms)
  const canWithdraw = hasPermission(role, "withdraw_gold", perms)
  const personalGold = overview?.gold ?? 0
  const dailyUsed = data?.dailyUsed ?? 0
  const dailyCap = data?.dailyCap ?? 10000
  const capReached = dailyUsed >= dailyCap

  const handleGoldAction = useCallback(async (action: "deposit" | "withdraw") => {
    const raw = action === "deposit" ? depositAmount : withdrawAmount
    const amount = parseInt(raw, 10)
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return }

    setSubmitting(true)
    try {
      await dashboardMutate("POST", "/api/pet/family/bank/gold", {
        action, amount,
      })
      toast.success(action === "deposit" ? `Deposited ${amount.toLocaleString()} gold!` : `Withdrew ${amount.toLocaleString()} gold!`)
      setDepositAmount("")
      setWithdrawAmount("")
      mutate()
      invalidate("/api/pet/overview")
    } catch (e: any) {
      toast.error(e.message || `${action} failed`)
    } finally {
      setSubmitting(false)
    }
  }, [depositAmount, withdrawAmount, mutate])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
        <Skeleton className="h-60" />
      </div>
    )
  }

  if (error) {
    return (
      <PixelCard className="p-8 text-center" corners>
        <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
          {(error as Error).message}
        </p>
      </PixelCard>
    )
  }

  const balance = parseInt(data?.balance ?? "0", 10)
  const capPercent = dailyCap > 0 ? Math.min(100, (dailyUsed / dailyCap) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Balance */}
      <PixelCard className="p-6 text-center" corners>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] mb-2">
          Family Treasury
        </p>
        <GoldDisplay amount={balance} size="xl" />
      </PixelCard>

      {/* Deposit / Withdraw */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Deposit */}
        <PixelCard className="p-4 space-y-3" corners>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[14px]">{"\uD83D\uDCE5"}</span>
            <span className="font-pixel text-xs text-[var(--pet-green,#40d870)]">Deposit Gold</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Your gold:</span>
            <GoldDisplay amount={personalGold} size="sm" />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={personalGold}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount"
              className={cn(
                "flex-1 font-pixel text-sm bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2",
                "text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c]",
                "focus:outline-none focus:border-[var(--pet-green,#40d870)]"
              )}
              disabled={!canDeposit || submitting}
            />
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => handleGoldAction("deposit")}
              disabled={!canDeposit || submitting || !depositAmount}
              loading={submitting}
            >
              Deposit
            </PixelButton>
          </div>
          {!canDeposit && (
            <p className="font-pixel text-[9px] text-[var(--pet-red,#e04040)]">
              No permission to deposit gold
            </p>
          )}
        </PixelCard>

        {/* Withdraw */}
        <PixelCard className="p-4 space-y-3" corners>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[14px]">{"\uD83D\uDCE4"}</span>
            <span className="font-pixel text-xs text-[var(--pet-gold,#f0c040)]">Withdraw Gold</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Daily cap:</span>
              <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">
                {dailyUsed.toLocaleString()} / {dailyCap.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-[#1a2a3c] border border-[#2a3a5c]">
              <div
                className={cn(
                  "h-full transition-all",
                  capPercent >= 100 ? "bg-[var(--pet-red,#e04040)]" : capPercent >= 75 ? "bg-[var(--pet-gold,#f0c040)]" : "bg-[var(--pet-green,#40d870)]"
                )}
                style={{ width: `${capPercent}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={dailyCap - dailyUsed}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount"
              className={cn(
                "flex-1 font-pixel text-sm bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2",
                "text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c]",
                "focus:outline-none focus:border-[var(--pet-gold,#f0c040)]"
              )}
              disabled={!canWithdraw || submitting || capReached}
            />
            <PixelButton
              variant="gold"
              size="sm"
              onClick={() => handleGoldAction("withdraw")}
              disabled={!canWithdraw || submitting || capReached || !withdrawAmount}
              loading={submitting}
            >
              Withdraw
            </PixelButton>
          </div>
          {capReached && (
            <p className="font-pixel text-[9px] text-[var(--pet-red,#e04040)]">
              Daily withdrawal cap reached. Resets at midnight UTC.
            </p>
          )}
          {!canWithdraw && !capReached && (
            <p className="font-pixel text-[9px] text-[var(--pet-red,#e04040)]">
              No permission to withdraw gold
            </p>
          )}
        </PixelCard>
      </div>

      {/* Transaction Log */}
      <PixelCard className="p-4" corners>
        <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-[#1a2a3c]">
          <span className="font-pixel text-[14px]">{"\uD83D\uDCDC"}</span>
          <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Transaction Log</span>
        </div>

        {!data?.log?.length ? (
          <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] py-4 text-center italic">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {data.log.map((entry, i) => {
              const isDeposit = entry.action === "deposit" || entry.amount > 0
              const ts = new Date(entry.createdAt)
              const timeStr = `${ts.getMonth() + 1}/${ts.getDate()} ${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}`

              return (
                <div
                  key={`${entry.createdAt}-${i}`}
                  className="flex items-center gap-2 px-2 py-1.5 bg-[#080c18] border border-[#1a2a3c] hover:border-[#2a3a5c] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#1a2a3c] flex items-center justify-center flex-shrink-0">
                    <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                      {entry.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate">
                        {entry.userName}
                      </span>
                      <span className={cn(
                        "font-pixel text-[10px] ml-auto flex-shrink-0",
                        isDeposit ? "text-[var(--pet-green,#40d870)]" : "text-[var(--pet-red,#e04040)]"
                      )}>
                        {isDeposit ? "+" : ""}{entry.amount.toLocaleString()}G
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] truncate">
                        {entry.description || entry.action}
                      </span>
                      <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] ml-auto flex-shrink-0">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </PixelCard>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
