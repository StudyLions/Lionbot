// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Seller dashboard - active listings, sales history,
//          revenue summary
// ============================================================

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Complete redesign -- mini listing cards for active items,
//   richer past listings table with images, improved sales log
// --- Original code: see git history for pre-redesign version ---
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState } from "react"
import Link from "next/link"
import {
  Coins, Gem, Clock, CheckCircle, XCircle, AlertTriangle, ScrollText,
} from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelTabBar from "@/components/pet/ui/PixelTabBar"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import { calcGlowTier, calcGlowIntensity, GLOW_TEXT_COLORS, GLOW_LABELS } from "@/utils/gameConstants"
import { cn } from "@/lib/utils"

const RARITY_TEXT: Record<string, string> = {
  COMMON: "#a0a8b4", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ffa0c0",
}
const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const STATUS_STYLE: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  SOLD: { icon: CheckCircle, color: "text-[var(--pet-green,#40d870)]", label: "SOLD", bg: "bg-[#40d870]/5" },
  CANCELLED: { icon: XCircle, color: "text-[#4a5a6a]", label: "CANCELLED", bg: "" },
  EXPIRED: { icon: AlertTriangle, color: "text-[var(--pet-gold,#f0c040)]", label: "EXPIRED", bg: "bg-[#f0c040]/5" },
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h left`
  return `${Math.floor(h / 24)}d ${h % 24}h`
}

type DashTab = "active" | "history" | "sales"
const TABS: { key: DashTab; label: string }[] = [
  { key: "active", label: "ACTIVE" },
  { key: "history", label: "PAST" },
  { key: "sales", label: "SALES LOG" },
]

export default function MyListingsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<DashTab>("active")
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [pastSort, setPastSort] = useState<"date" | "status" | "price">("date")

  const { data, isLoading, mutate } = useDashboard<any>(session ? "/api/pet/marketplace/my-listings" : null)

  async function handleCancel(listingId: number) {
    setCancelling(listingId)
    try {
      const res = await fetch("/api/pet/marketplace/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
      if (res.ok) {
        invalidatePrefix("/api/pet/marketplace")
        mutate()
      }
    } finally {
      setCancelling(null)
    }
  }

  const sortedPast = (data?.past ?? []).slice().sort((a: any, b: any) => {
    if (pastSort === "status") return a.status.localeCompare(b.status)
    if (pastSort === "price") return b.pricePerUnit - a.pricePerUnit
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  })

  return (
    <Layout SEO={{ title: "My Listings - Marketplace", description: "Manage your marketplace listings" }}>
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

              <Link href="/pet/marketplace">
                <a className="font-pixel text-[13px] text-[#4a5a70] hover:text-[#8899aa] transition-colors inline-flex items-center gap-1.5">
                  <span>&#x25C4;</span> Back to Marketplace
                </a>
              </Link>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)] flex items-center gap-3">
                    <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                    MY LISTINGS
                    <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                  </h1>
                  <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--pet-gold,#f0c040)] to-transparent mt-1" />
                </div>
                <Link href="/pet/marketplace/sell">
                  <PixelButton variant="primary" size="sm">+ SELL MORE</PixelButton>
                </Link>
              </div>

              {/* Revenue Summary */}
              {data?.revenue && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                    <span className="font-pixel text-[11px] text-[#4a5a6a] flex items-center gap-1.5">
                      <Coins size={12} className="text-[var(--pet-gold,#f0c040)]" /> GOLD EARNED
                    </span>
                    <GoldDisplay amount={data.revenue.totalGold} size="lg" className="mt-1" />
                  </div>
                  <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                    <span className="font-pixel text-[11px] text-[#4a5a6a] flex items-center gap-1.5">
                      <Gem size={12} className="text-[#a855f7]" /> GEMS EARNED
                    </span>
                    <GoldDisplay amount={data.revenue.totalGems} size="lg" type="gem" className="mt-1" />
                  </div>
                  <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                    <span className="font-pixel text-[11px] text-[#4a5a6a]">ITEMS SOLD</span>
                    <p className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] mt-1">{data.revenue.totalSales}</p>
                  </div>
                </div>
              )}

              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Migrated inline tab buttons to shared PixelTabBar component */}
              {/* --- Original code (commented out for rollback) ---
              <div className="flex gap-2">
                {TABS.map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={cn("font-pixel text-[12px] px-4 py-2 border-2 transition-all",
                      tab === t.key ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff] shadow-[2px_2px_0_#060810]"
                        : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]")}>
                    {t.label}
                  </button>
                ))}
              </div>
              --- End original code --- */}
              <PixelTabBar tabs={TABS} active={tab} onChange={(k) => setTab(k as DashTab)} />

              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Active Listings -- Mini Cards */}
                  {tab === "active" && (
                    <div className="space-y-3">
                      {!data?.active?.length ? (
                        <PixelCard className="p-12 text-center" corners>
                          <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                            NO ACTIVE LISTINGS.{" "}
                            <Link href="/pet/marketplace/sell">
                              <a className="text-[var(--pet-blue,#4080f0)] hover:underline">List an item?</a>
                            </Link>
                          </p>
                        </PixelCard>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {data.active.map((l: any) => {
                            const imgUrl = getItemImageUrl(l.item.assetPath, l.item.category)
                            const CIcon = l.currency === "GOLD" ? Coins : Gem
                            const sold = l.quantityListed - l.quantityRemaining
                            const bc = RARITY_BORDER[l.item.rarity] || "#6a7a8a"
                            const scrollData = l.scrollData ?? []
                            const totalBonus = l.totalBonus ?? 0
                            const glowTier = calcGlowTier(l.enhancementLevel ?? 0, totalBonus)
                            const glowIntensity = calcGlowIntensity(l.enhancementLevel ?? 0)
                            return (
                              <div key={l.listingId}
                                className="border-2 bg-[#0c1020] shadow-[2px_2px_0_#060810] flex gap-3 p-3"
                                style={{ borderColor: bc }}>
                                <Link href={`/pet/marketplace/${l.listingId}`}>
                                  <a className="flex-shrink-0">
                                    <ItemGlow rarity={l.item.rarity} glowTier={glowTier} glowIntensity={glowIntensity}>
                                      <div className="w-14 h-14 flex items-center justify-center border bg-[#080c18] overflow-hidden" style={{ borderColor: `${bc}60` }}>
                                        {imgUrl ? (
                                          <CroppedItemImage src={imgUrl} alt={l.item.name} className="w-full h-full object-contain" />
                                        ) : (
                                          <span className="text-lg">{getCategoryPlaceholder(l.item.category)}</span>
                                        )}
                                      </div>
                                    </ItemGlow>
                                  </a>
                                </Link>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Link href={`/pet/marketplace/${l.listingId}`}>
                                      <a className="font-pixel text-[12px] truncate hover:underline"
                                        style={{ color: RARITY_TEXT[l.item.rarity] || "#a0a8b4" }}>
                                        {l.item.name}
                                      </a>
                                    </Link>
                                    {l.enhancementLevel > 0 && (
                                      <span className="font-pixel text-[10px] border border-[#40d870] bg-[#2a7a3a]/40 text-[#d0ffd8] px-1">+{l.enhancementLevel}</span>
                                    )}
                                    {scrollData.length > 0 && (
                                      <span className="font-pixel text-[8px] border border-[#6090e0] bg-[#4060a0]/40 text-[#c0d8ff] px-1 flex items-center gap-0.5">
                                        <ScrollText size={7} />{scrollData.length}
                                      </span>
                                    )}
                                    {glowTier !== "none" && (
                                      <span className={cn("font-pixel text-[8px]", GLOW_TEXT_COLORS[glowTier])}>{GLOW_LABELS[glowTier]}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 font-pixel text-[10px] text-[#4a5a6a]">
                                    <span className={cn("flex items-center gap-1", l.currency === "GOLD" ? "text-[var(--pet-gold,#f0c040)]" : "text-[#a855f7]")}>
                                      <CIcon size={11} /> {l.pricePerUnit} each
                                    </span>
                                    <span>{l.quantityRemaining}/{l.quantityListed} left</span>
                                    <span className="flex items-center gap-0.5"><Clock size={10} /> {timeLeft(l.expiresAt)}</span>
                                  </div>
                                  <PixelBar value={sold} max={l.quantityListed} segments={8} color="green" showText={false} className="max-w-[10rem]" />
                                </div>
                                <PixelButton onClick={() => handleCancel(l.listingId)} disabled={cancelling === l.listingId}
                                  loading={cancelling === l.listingId} variant="danger" size="sm" className="self-center flex-shrink-0">
                                  CANCEL
                                </PixelButton>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Past Listings -- Table */}
                  {tab === "history" && (
                    <div className="space-y-2">
                      {!data?.past?.length ? (
                        <PixelCard className="p-12 text-center" corners>
                          <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">NO PAST LISTINGS</p>
                        </PixelCard>
                      ) : (
                        <>
                          <div className="flex gap-1.5 mb-1">
                            {(["date", "status", "price"] as const).map((s) => (
                              <button key={s} onClick={() => setPastSort(s)}
                                className={cn("font-pixel text-[9px] px-2 py-1 border transition-all",
                                  pastSort === s ? "border-[var(--pet-blue,#4080f0)] text-[#80b0ff] bg-[#101830]" : "border-[#1a2a3c] text-[#4a5a6a]")}>
                                Sort: {s}
                              </button>
                            ))}
                          </div>
                          {sortedPast.map((l: any) => {
                            const st = STATUS_STYLE[l.status] ?? STATUS_STYLE.CANCELLED
                            const StatusIcon = st.icon
                            const imgUrl = getItemImageUrl(l.item?.assetPath, l.item?.category)
                            return (
                              <div key={l.listingId} className={cn("flex items-center gap-3 px-3 py-2 border-2 border-[#1a2a3c] bg-[#0c1020]", st.bg)}>
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-[#1a2a3c] bg-[#080c18]">
                                  {imgUrl ? (
                                    <CroppedItemImage src={imgUrl} alt={l.item?.name ?? "?"} className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="text-xs">{getCategoryPlaceholder(l.item?.category)}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <span className="font-pixel text-[11px] truncate" style={{ color: RARITY_TEXT[l.item?.rarity] || "#a0a8b4" }}>
                                    {l.item?.name ?? "Unknown"}
                                  </span>
                                  {l.enhancementLevel > 0 && (
                                    <span className="font-pixel text-[9px] text-[#d0ffd8]">+{l.enhancementLevel}</span>
                                  )}
                                  {l.scrollData?.length > 0 && (
                                    <span className="font-pixel text-[8px] text-[#c0d8ff] flex items-center gap-0.5">
                                      <ScrollText size={7} />{l.scrollData.length}
                                    </span>
                                  )}
                                </div>
                                <span className="font-pixel text-[10px] text-[#4a5a6a] flex-shrink-0">
                                  {l.quantityListed - l.quantityRemaining}/{l.quantityListed}
                                </span>
                                <div className="w-16 flex-shrink-0">
                                  <GoldDisplay amount={l.pricePerUnit} type={l.currency === "GOLD" ? "gold" : "gem"} size="sm" />
                                </div>
                                <StatusIcon size={14} className={cn(st.color, "flex-shrink-0")} />
                                <span className={cn("font-pixel text-[9px] w-16 flex-shrink-0", st.color)}>{st.label}</span>
                              </div>
                            )
                          })}
                        </>
                      )}
                    </div>
                  )}

                  {/* Sales Log */}
                  {tab === "sales" && (
                    <div className="space-y-2">
                      {!data?.sales?.length ? (
                        <PixelCard className="p-12 text-center" corners>
                          <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                            NO SALES YET -- LIST SOME ITEMS!
                          </p>
                        </PixelCard>
                      ) : data.sales.map((s: any, i: number) => {
                        const CIcon = s.currency === "GOLD" ? Coins : Gem
                        const cColor = s.currency === "GOLD" ? "text-[var(--pet-gold,#f0c040)]" : "text-[#a855f7]"
                        const imgUrl = getItemImageUrl(s.itemAssetPath, s.itemCategory)
                        return (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 border-2 border-[#1a2a3c] bg-[#0c1020]">
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-[#1a2a3c] bg-[#080c18]">
                              {imgUrl ? (
                                <CroppedItemImage src={imgUrl} alt={s.itemName} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-xs">{getCategoryPlaceholder(s.itemCategory)}</span>
                              )}
                            </div>
                            <CheckCircle size={12} className="text-[var(--pet-green,#40d870)] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] truncate block">
                                <span className="text-[#4a5a6a]">{s.buyerName}</span> bought{" "}
                                <span className="text-[var(--pet-text,#e2e8f0)]">{s.quantity}x {s.itemName}</span>
                              </span>
                            </div>
                            <span className={cn("font-pixel text-[12px] flex items-center gap-1 flex-shrink-0", cColor)}>
                              <CIcon size={12} /> {s.totalPrice.toLocaleString()}
                            </span>
                            <span className="font-pixel text-[9px] text-[#4a5a6a] flex-shrink-0">
                              {new Date(s.soldAt).toLocaleDateString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}
// --- END AI-MODIFIED ---

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
