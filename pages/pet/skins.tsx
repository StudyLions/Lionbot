// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Gameboy skin gallery -- browse, purchase, and equip
//          gameboy frame skins with preview, filters, and
//          collection tracking
// ============================================================
import { useState, useCallback, useMemo, useEffect } from "react"
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import PixelCard from "@/components/pet/ui/PixelCard"
import SkinCard from "@/components/pet/skins/SkinCard"
import SkinPreview from "@/components/pet/skins/SkinPreview"
import CollectionStats from "@/components/pet/skins/CollectionStats"
import SkinFilters from "@/components/pet/skins/SkinFilters"
import {
  type SkinData,
  type SkinsPageData,
  type UnlockFilter,
  type OwnedFilter,
  formatThemeName,
  groupSkinsByTheme,
} from "@/components/pet/skins/skinTypes"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export default function SkinsPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<SkinsPageData>(
    session ? "/api/pet/skins" : null
  )
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [collapsedThemes, setCollapsedThemes] = useState<Set<string>>(new Set())
  const [selectedSkin, setSelectedSkin] = useState<SkinData | null>(null)
  const [unlockFilter, setUnlockFilter] = useState<UnlockFilter>("ALL")
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>("ALL")
  const [mobilePreview, setMobilePreview] = useState(false)

  const showMessage = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }, [])

  const toggleTheme = useCallback((theme: string) => {
    setCollapsedThemes((prev) => {
      const next = new Set(prev)
      if (next.has(theme)) next.delete(theme)
      else next.add(theme)
      return next
    })
  }, [])

  const handlePurchase = useCallback(async (skinId: number) => {
    setLoadingId(skinId)
    try {
      const res = await fetch("/api/pet/skins/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId }),
      })
      const body = await res.json()
      if (!res.ok) {
        showMessage(body.error || "Purchase failed", "error")
        return
      }
      showMessage("Skin purchased and equipped!", "success")
      mutate()
      invalidate("/api/pet/overview")
      invalidate("/api/pet/farm")
      invalidate("/api/pet/balance")
    } catch {
      showMessage("Network error", "error")
    } finally {
      setLoadingId(null)
    }
  }, [mutate, showMessage])

  const handleEquip = useCallback(async (skinId: number) => {
    setLoadingId(skinId)
    try {
      const res = await fetch("/api/pet/skins/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId }),
      })
      const body = await res.json()
      if (!res.ok) {
        showMessage(body.error || "Equip failed", "error")
        return
      }
      showMessage("Skin equipped!", "success")
      mutate()
      invalidate("/api/pet/overview")
      invalidate("/api/pet/farm")
    } catch {
      showMessage("Network error", "error")
    } finally {
      setLoadingId(null)
    }
  }, [mutate, showMessage])

  const handleSkinClick = useCallback((skin: SkinData) => {
    setSelectedSkin((prev) => (prev?.skinId === skin.skinId ? null : skin))
    setMobilePreview(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setSelectedSkin(null)
    setMobilePreview(false)
  }, [])

  // Keep selectedSkin in sync with data refreshes (e.g. after purchase/equip)
  useEffect(() => {
    if (selectedSkin && data) {
      const updated = data.skins.find((s) => s.skinId === selectedSkin.skinId)
      if (updated) setSelectedSkin(updated)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeSkin = data?.skins.find((s) => s.active) ?? null

  // Filter skins
  const filteredSkins = useMemo(() => {
    if (!data) return []
    return data.skins.filter((s) => {
      if (unlockFilter !== "ALL" && s.unlockType !== unlockFilter) return false
      if (ownedFilter === "OWNED" && !s.owned) return false
      if (ownedFilter === "UNOWNED" && s.owned) return false
      return true
    })
  }, [data, unlockFilter, ownedFilter])

  const themeGroups = useMemo(
    () => groupSkinsByTheme(filteredSkins, data?.themes ?? []),
    [filteredSkins, data?.themes]
  )

  // Type counts for filter badges
  const typeCounts = useMemo(() => {
    if (!data) return {}
    const counts: Record<string, number> = {}
    for (const s of data.skins) {
      counts[s.unlockType] = (counts[s.unlockType] ?? 0) + 1
    }
    return counts
  }, [data])

  return (
    <Layout SEO={{ title: "Gameboy Skins - LionGotchi", description: "Browse and equip gameboy frame skins" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {/* Toast */}
              {message && (
                <div
                  className="fixed top-4 right-4 z-50 font-pixel text-sm px-4 py-2 border-2 animate-in fade-in slide-in-from-top-2"
                  style={{
                    borderColor: message.type === "success" ? "#40d870" : "#e04040",
                    backgroundColor: message.type === "success" ? "#0a2018" : "#200a0a",
                    color: message.type === "success" ? "#40d870" : "#e04040",
                    boxShadow: "2px 2px 0 #060810",
                  }}
                >
                  {message.text}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-60" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : !data?.hasPet ? (
                <PixelCard className="p-12 text-center space-y-4" corners>
                  <h2 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)]">No pet yet!</h2>
                  <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                    Use the /pet command in Discord to create your LionGotchi first.
                  </p>
                </PixelCard>
              ) : (
                <>
                  {/* Header */}
                  <div>
                    <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Gameboy Skins</h1>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="block h-[3px] w-8 bg-[#d060f0]" />
                      <span className="block h-[3px] w-4 bg-[#d060f0]/60" />
                      <span className="block h-[3px] w-2 bg-[#d060f0]/30" />
                    </div>
                    <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                      Customize your Gameboy frame &middot; {data.skins.length} skins available
                    </p>
                  </div>

                  {/* Collection stats */}
                  <CollectionStats
                    skins={data.skins}
                    gold={Number(data.gold)}
                    gems={data.gems}
                    petLevel={data.petLevel}
                  />

                  {/* Filters */}
                  <SkinFilters
                    unlockFilter={unlockFilter}
                    ownedFilter={ownedFilter}
                    onUnlockChange={setUnlockFilter}
                    onOwnedChange={setOwnedFilter}
                    typeCounts={typeCounts}
                  />

                  {/* Two-column layout: grid + preview */}
                  <div className="flex gap-4 items-start">
                    {/* Skin grid */}
                    <div className="flex-1 min-w-0 space-y-4">
                      {themeGroups.length === 0 ? (
                        <PixelCard className="p-8 text-center" corners>
                          <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                            No skins match your filters.
                          </p>
                        </PixelCard>
                      ) : (
                        themeGroups.map(({ displayTheme, skins }) => {
                          const isCollapsed = collapsedThemes.has(displayTheme)
                          const ownedCount = skins.filter((s) => s.owned).length
                          const allOwned = ownedCount === skins.length
                          return (
                            <PixelCard key={displayTheme} className="overflow-hidden" corners>
                              {/* Theme header with mini progress */}
                              <button
                                onClick={() => toggleTheme(displayTheme)}
                                className="w-full flex items-center justify-between px-4 py-3 border-b-2 border-[#1a2a3c] hover:bg-[#0a0e1a]/50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                                    {formatThemeName(displayTheme)}
                                  </span>
                                  {allOwned && (
                                    <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">{"\u2713"}</span>
                                  )}
                                  {/* Mini collection segments */}
                                  <div className="flex gap-[2px]">
                                    {skins.map((s) => (
                                      <div
                                        key={s.skinId}
                                        className="w-[8px] h-[6px]"
                                        style={{
                                          backgroundColor: s.owned ? "#d060f0" : "#1a1e2c",
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                                    {ownedCount}/{skins.length}
                                  </span>
                                </div>
                                <span
                                  className="font-pixel text-sm text-[#8899aa] transition-transform duration-200"
                                  style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }}
                                >
                                  {"\u25B4"}
                                </span>
                              </button>

                              <div
                                className="transition-all duration-200 overflow-hidden"
                                style={{
                                  maxHeight: isCollapsed ? 0 : 2000,
                                  opacity: isCollapsed ? 0 : 1,
                                }}
                              >
                                <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                                  {skins.map((skin) => (
                                    <SkinCard
                                      key={skin.skinId}
                                      skin={skin}
                                      selected={selectedSkin?.skinId === skin.skinId}
                                      onClick={handleSkinClick}
                                    />
                                  ))}
                                </div>
                              </div>
                            </PixelCard>
                          )
                        })
                      )}
                    </div>

                    {/* Desktop preview panel (sticky sidebar) */}
                    {selectedSkin && (
                      <div className="hidden lg:block w-[300px] flex-shrink-0 sticky top-6">
                        <SkinPreview
                          skin={selectedSkin}
                          activeSkin={activeSkin}
                          gold={Number(data.gold)}
                          gems={data.gems}
                          loadingId={loadingId}
                          onEquip={handleEquip}
                          onPurchase={handlePurchase}
                          onClose={handleClosePreview}
                        />
                      </div>
                    )}
                  </div>

                  {/* Mobile preview overlay */}
                  {selectedSkin && mobilePreview && (
                    <div className="lg:hidden fixed inset-0 z-40 flex items-end justify-center">
                      {/* Backdrop */}
                      <div
                        className="absolute inset-0 bg-black/60"
                        onClick={handleClosePreview}
                      />
                      {/* Panel */}
                      <div className="relative w-full max-w-md mx-4 mb-4 animate-in slide-in-from-bottom-4 fade-in duration-200">
                        <SkinPreview
                          skin={selectedSkin}
                          activeSkin={activeSkin}
                          gold={Number(data.gold)}
                          gems={data.gems}
                          loadingId={loadingId}
                          onEquip={handleEquip}
                          onPurchase={handlePurchase}
                          onClose={handleClosePreview}
                        />
                      </div>
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
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
