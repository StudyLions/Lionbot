// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Gameboy skin gallery -- browse, purchase, and equip
//          gameboy frame skins grouped by theme
// ============================================================
import { useState, useCallback } from "react"
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { getGameboyFrameUrl } from "@/utils/petAssets"
import PixelCard from "@/components/pet/ui/PixelCard"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import GameboyFrame from "@/components/pet/GameboyFrame"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface SkinData {
  skinId: number
  theme: string
  color: string
  assetPath: string
  unlockType: string
  unlockLevel: number | null
  goldPrice: number | null
  gemPrice: number | null
  owned: boolean
  eligible: boolean
  active: boolean
}

interface SkinsPageData {
  hasPet: boolean
  skins: SkinData[]
  themes: string[]
  activeSkinId: number | null
  petLevel: number
  gold: string
  gems: number
}

const UNLOCK_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  FREE: { label: "FREE", color: "#40d870", bg: "#40d870" },
  GOLD: { label: "GOLD", color: "#f0c040", bg: "#f0c040" },
  GEMS: { label: "GEMS", color: "#d060f0", bg: "#d060f0" },
  LEVEL: { label: "LEVEL", color: "#4080f0", bg: "#4080f0" },
}

function formatThemeName(theme: string): string {
  return theme.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatSkinLabel(theme: string, color: string): string {
  return `${formatThemeName(theme)} ${color.replace(/\b\w/g, (c) => c.toUpperCase())}`
}

export default function SkinsPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<SkinsPageData>(
    session ? "/api/pet/skins" : null
  )
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [collapsedThemes, setCollapsedThemes] = useState<Set<string>>(new Set())

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

  const activeSkin = data?.skins.find((s) => s.active)
  const skinsByTheme = data?.themes.map((theme) => ({
    theme,
    skins: data.skins.filter((s) => s.theme === theme),
  })) ?? []

  return (
    <Layout SEO={{ title: "Gameboy Skins - LionGotchi", description: "Browse and equip gameboy frame skins" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {/* Toast message */}
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
                  <Skeleton className="h-40" />
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

                  {/* Balance + Active Skin */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Balance bar */}
                    <div
                      className="border-[3px] border-[#3a4a6c] bg-gradient-to-b from-[#111828] to-[#0c1020] px-4 py-3 flex-1"
                      style={{ boxShadow: "3px 3px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <GoldDisplay amount={Number(data.gold)} size="lg" />
                        <div className="w-px h-6 bg-[#2a3a5c]" />
                        <GoldDisplay amount={data.gems} size="md" type="gem" />
                        <div className="w-px h-6 bg-[#2a3a5c]" />
                        <span className="font-pixel text-[13px] text-[#4080f0]">
                          Lv.{data.petLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active skin preview */}
                  {activeSkin && (
                    <PixelCard className="p-4" corners>
                      <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-[#1a2a3c]">
                        <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">Active Skin</span>
                        <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)]">
                          {formatSkinLabel(activeSkin.theme, activeSkin.color)}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <GameboyFrame isFullscreen={false} skinAssetPath={activeSkin.assetPath} width={300}>
                          <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#0a0e1a] flex items-center justify-center">
                            <span className="font-pixel text-[11px] text-[#3a4a6c]">Preview</span>
                          </div>
                        </GameboyFrame>
                      </div>
                    </PixelCard>
                  )}

                  {/* Skin grid by theme */}
                  {skinsByTheme.map(({ theme, skins }) => {
                    const isCollapsed = collapsedThemes.has(theme)
                    const ownedCount = skins.filter((s) => s.owned).length
                    return (
                      <PixelCard key={theme} className="overflow-hidden" corners>
                        {/* Theme header */}
                        <button
                          onClick={() => toggleTheme(theme)}
                          className="w-full flex items-center justify-between px-4 py-3 border-b-2 border-[#1a2a3c] hover:bg-[#0a0e1a]/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                              {formatThemeName(theme)}
                            </span>
                            <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                              {ownedCount}/{skins.length}
                            </span>
                          </div>
                          <span className="font-pixel text-sm text-[#8899aa]">
                            {isCollapsed ? "+" : "\u2212"}
                          </span>
                        </button>

                        {!isCollapsed && (
                          <div className="p-3 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {skins.map((skin) => (
                              <SkinCard
                                key={skin.skinId}
                                skin={skin}
                                isLoading={loadingId === skin.skinId}
                                onPurchase={handlePurchase}
                                onEquip={handleEquip}
                              />
                            ))}
                          </div>
                        )}
                      </PixelCard>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

function SkinCard({
  skin,
  isLoading,
  onPurchase,
  onEquip,
}: {
  skin: SkinData
  isLoading: boolean
  onPurchase: (id: number) => void
  onEquip: (id: number) => void
}) {
  const badge = UNLOCK_BADGE[skin.unlockType] ?? UNLOCK_BADGE.FREE
  const borderColor = skin.active ? "#f0c040" : skin.owned ? "#3a4a6c" : "#1a2a3c"

  let actionButton = null
  if (skin.active) {
    actionButton = (
      <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] uppercase">
        Active
      </span>
    )
  } else if (skin.owned) {
    actionButton = (
      <button
        onClick={() => onEquip(skin.skinId)}
        disabled={isLoading}
        className="font-pixel text-[11px] px-3 py-1 border-2 border-[#4080f0] text-[#4080f0] bg-[#0a1628] hover:bg-[#1a2850] transition-colors disabled:opacity-40"
      >
        {isLoading ? "..." : "Equip"}
      </button>
    )
  } else if (skin.unlockType === "LEVEL" && !skin.eligible) {
    actionButton = (
      <span className="font-pixel text-[11px] text-[#4a5a70]">
        Lv.{skin.unlockLevel}
      </span>
    )
  } else if ((skin.unlockType === "GOLD" || skin.unlockType === "GEMS") && skin.eligible) {
    actionButton = (
      <button
        onClick={() => onPurchase(skin.skinId)}
        disabled={isLoading}
        className="font-pixel text-[11px] px-3 py-1 border-2 transition-colors disabled:opacity-40"
        style={{
          borderColor: badge.color,
          color: badge.color,
          backgroundColor: "#0a0e1a",
        }}
      >
        {isLoading ? "..." : "Buy"}
      </button>
    )
  } else if ((skin.unlockType === "GOLD" || skin.unlockType === "GEMS") && !skin.eligible) {
    actionButton = (
      <span className="font-pixel text-[11px] text-[#4a5a70]">
        {skin.unlockType === "GOLD" ? `${skin.goldPrice}G` : `${skin.gemPrice} Gems`}
      </span>
    )
  }

  return (
    <div
      className="border-2 bg-[#080c18] p-2 transition-colors"
      style={{
        borderColor,
        boxShadow: skin.active ? "0 0 8px rgba(240,192,64,0.15)" : "1px 1px 0 #060810",
      }}
    >
      {/* Skin preview thumbnail */}
      <div className="flex justify-center mb-2 bg-[#060810] border border-[#1a2a3c] p-1">
        <img
          src={getGameboyFrameUrl(skin.assetPath)}
          alt={formatSkinLabel(skin.theme, skin.color)}
          className="h-[100px] w-auto"
          style={{ imageRendering: "pixelated" }}
          draggable={false}
        />
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] truncate">
            {skin.color.replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="font-pixel text-[9px] px-1.5 py-0.5 rounded-sm uppercase"
              style={{
                color: badge.color,
                backgroundColor: `${badge.bg}15`,
                border: `1px solid ${badge.bg}30`,
              }}
            >
              {badge.label}
            </span>
            {skin.unlockType === "GOLD" && skin.goldPrice != null && !skin.owned && (
              <span className="font-pixel text-[10px] text-[#f0c040]">{skin.goldPrice}G</span>
            )}
            {skin.unlockType === "GEMS" && skin.gemPrice != null && !skin.owned && (
              <span className="font-pixel text-[10px] text-[#d060f0]">{skin.gemPrice} Gems</span>
            )}
            {skin.unlockType === "LEVEL" && skin.unlockLevel != null && !skin.owned && (
              <span className="font-pixel text-[10px] text-[#4080f0]">Lv.{skin.unlockLevel}</span>
            )}
            {skin.owned && !skin.active && (
              <span className="font-pixel text-[10px] text-[#40d870]">Owned</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {actionButton}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
