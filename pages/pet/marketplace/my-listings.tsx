// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Seller dashboard - active listings, sales history,
//          revenue summary
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState } from "react"
import Link from "next/link"
import {
  Coins, Gem, Clock, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import PixelBar from "@/components/pet/ui/PixelBar"

const RARITY_TEXT: Record<string, string> = {
  COMMON: "#a0a8b4", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ffa0c0",
}

const STATUS_STYLE: Record<string, { icon: any; color: string; label: string }> = {
  SOLD: { icon: CheckCircle, color: "text-[var(--pet-green,#40d870)]", label: "SOLD" },
  CANCELLED: { icon: XCircle, color: "text-[#4a5a6a]", label: "CANCELLED" },
  EXPIRED: { icon: AlertTriangle, color: "text-[var(--pet-gold,#f0c040)]", label: "EXPIRED" },
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h left`
  return `${Math.floor(h / 24)}d ${h % 24}h left`
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

  return (
    <Layout SEO={{ title: "My Listings - Marketplace", description: "Manage your marketplace listings" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

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
                {/* --- AI-MODIFIED (2026-03-21) --- */}
                {/* Purpose: Stack revenue summary on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* --- END AI-MODIFIED --- */}
                  <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                    <span className="font-pixel text-[12px] text-[#4a5a6a] flex items-center gap-1.5">
                      <Coins size={14} className="text-[var(--pet-gold,#f0c040)]" /> GOLD EARNED
                    </span>
                    <GoldDisplay amount={data.revenue.totalGold} size="lg" className="mt-1" />
                  </div>
                  <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                    <span className="font-pixel text-[12px] text-[#4a5a6a] flex items-center gap-1.5">
                      <Gem size={14} className="text-[#a855f7]" /> GEMS EARNED
                    </span>
                    <GoldDisplay amount={data.revenue.totalGems} size="lg" type="gem" className="mt-1" />
                  </div>
                  <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                    <span className="font-pixel text-[12px] text-[#4a5a6a]">ITEMS SOLD</span>
                    <p className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] mt-1">{data.revenue.totalSales}</p>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`font-pixel text-[13px] px-4 py-2 border-2 transition-all ${
                      tab === t.key
                        ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff] shadow-[2px_2px_0_#060810]"
                        : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Active */}
                  {tab === "active" && (
                    <div className="space-y-2">
                      {!data?.active?.length ? (
                        <PixelCard className="p-12 text-center" corners>
                          <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                            NO ACTIVE LISTINGS.{" "}
                            <Link href="/pet/marketplace/sell">
                              <a className="text-[var(--pet-blue,#4080f0)] hover:underline">List an item?</a>
                            </Link>
                          </p>
                        </PixelCard>
                      ) : data.active.map((l: any) => {
                        const imgUrl = getItemImageUrl(l.item.assetPath, l.item.category)
                        const CIcon = l.currency === "GOLD" ? Coins : Gem
                        const sold = l.quantityListed - l.quantityRemaining
                        return (
                          <div
                            key={l.listingId}
                            className="flex items-center gap-3 px-4 py-3 border-2 border-[#2a3a5c] bg-[#0c1020] shadow-[2px_2px_0_#060810]"
                          >
                            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-[#1a2a3c] bg-[#080c18]">
                              {imgUrl ? (
                                <CroppedItemImage src={imgUrl} alt={l.item.name} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-lg">{getCategoryPlaceholder(l.item.category)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-pixel text-[13px] truncate"
                                style={{ color: RARITY_TEXT[l.item.rarity] || "#a0a8b4" }}
                              >
                                {l.item.name}
                              </p>
                              <div className="flex items-center gap-2 font-pixel text-[12px] text-[#4a5a6a] mt-0.5">
                                <span className={`flex items-center gap-1 ${l.currency === "GOLD" ? "text-[var(--pet-gold,#f0c040)]" : "text-[#a855f7]"}`}>
                                  <CIcon size={13} /> {l.pricePerUnit} each
                                </span>
                                <span>{l.quantityRemaining}/{l.quantityListed} remaining</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {timeLeft(l.expiresAt)}</span>
                              </div>
                              <PixelBar
                                value={sold}
                                max={l.quantityListed}
                                segments={8}
                                color="green"
                                showText={false}
                                className="mt-1 max-w-[8rem]"
                              />
                            </div>
                            <PixelButton
                              onClick={() => handleCancel(l.listingId)}
                              disabled={cancelling === l.listingId}
                              loading={cancelling === l.listingId}
                              variant="danger"
                              size="sm"
                            >
                              CANCEL
                            </PixelButton>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Past Listings */}
                  {tab === "history" && (
                    <div className="space-y-2">
                      {!data?.past?.length ? (
                        <PixelCard className="p-12 text-center" corners>
                          <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">NO PAST LISTINGS</p>
                        </PixelCard>
                      ) : data.past.map((l: any) => {
                        const st = STATUS_STYLE[l.status] ?? STATUS_STYLE.CANCELLED
                        const StatusIcon = st.icon
                        return (
                          <div
                            key={l.listingId}
                            className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#1a2a3c] bg-[#0c1020]"
                          >
                            <StatusIcon size={16} className={st.color} />
                            <span
                              className="font-pixel text-[13px] flex-1 truncate"
                              style={{ color: RARITY_TEXT[l.item.rarity] || "#a0a8b4" }}
                            >
                              {l.item.name}
                            </span>
                            <span className="font-pixel text-[12px] text-[#4a5a6a]">
                              {l.quantityListed - l.quantityRemaining}/{l.quantityListed} sold
                            </span>
                            <span className={`font-pixel text-[12px] ${st.color}`}>{st.label}</span>
                          </div>
                        )
                      })}
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
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-2.5 border-2 border-[#1a2a3c] bg-[#0c1020]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle size={14} className="text-[var(--pet-green,#40d870)] flex-shrink-0" />
                              <span className="font-pixel text-[13px] truncate text-[var(--pet-text-dim,#8899aa)]">
                                <span className="text-[#4a5a6a]">{s.buyerName}</span> bought{" "}
                                <span className="text-[var(--pet-text,#e2e8f0)]">{s.quantity}x {s.itemName}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`font-pixel text-[13px] flex items-center gap-1 ${cColor}`}>
                                <CIcon size={14} /> {s.totalPrice.toLocaleString()}
                              </span>
                              <span className="font-pixel text-[11px] text-[#4a5a6a]">
                                {new Date(s.soldAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
