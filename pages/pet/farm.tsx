// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet farm page - pixel art RPG-style with Gameboy frame,
//          HUD bar, action toolbar, harvest modal, history log
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { useState, useCallback, useEffect } from "react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import dynamic from "next/dynamic"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelCard from "@/components/pet/ui/PixelCard"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { getUiIconUrl, getFarmAnimationUrl } from "@/utils/petAssets"
import type { FarmPlot } from "@/components/pet/farm/FarmScene"

const FarmScene = dynamic(() => import("@/components/pet/farm/FarmScene"), { ssr: false })
const FarmStats = dynamic(() => import("@/components/pet/farm/FarmStats"), { ssr: false })
const PlotDetail = dynamic(() => import("@/components/pet/farm/PlotDetail"), { ssr: false })
const SeedSelector = dynamic(() => import("@/components/pet/farm/SeedSelector"), { ssr: false })
const HarvestModal = dynamic(() => import("@/components/pet/farm/HarvestModal"), { ssr: false })
const FarmHistory = dynamic(() => import("@/components/pet/farm/FarmHistory"), { ssr: false })
const GameboyFrame = dynamic(() => import("@/components/pet/farm/GameboyFrame"), { ssr: false })

interface FarmData {
  plots: FarmPlot[]
  availableSeeds: Array<{
    id: number; name: string; plantType: string
    growTimeHours: number; waterIntervalHours: number; harvestGold: number
    plantCost: number; growthPointsNeeded: number; assetPrefix: string; typeId: number
  }>
  ownedSeeds: Array<{ inventoryId: number; quantity: number; itemId: number; name: string }>
  gold: number
  history: Array<{ type: string; amount: number; description: string; createdAt: string }>
}

interface HarvestResult {
  count: number
  totalGold: number
  totalInvested: number
  netProfit: number
  totalVoiceMinutes: number
  totalMessages: number
  details: Array<{ name: string; rarity: string; gold: number; multiplier: number }>
}

export default function FarmPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<FarmData>(
    session ? "/api/pet/farm?history=true" : null
  )
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null)
  const [showSeedSelector, setShowSeedSelector] = useState(false)
  const [justWatered, setJustWatered] = useState(false)
  const [harvestResult, setHarvestResult] = useState<HarvestResult | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("farm-fullscreen")
    if (saved === "true") setIsFullscreen(true)
  }, [])

  const selectedPlotData = data?.plots.find((p) => p.plotId === selectedPlot) ?? null
  const hasPlanted = data?.plots.some(p => !p.empty && !p.dead)
  const hasHarvestable = data?.plots.some(p => p.readyToHarvest && !p.dead)
  const hasDead = data?.plots.some(p => p.dead)

  const showMessage = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }, [])

  const handleSelectPlot = useCallback((plotId: number) => {
    setSelectedPlot((prev) => prev === plotId ? null : plotId)
    setShowSeedSelector(false)
  }, [])

  const handleAction = useCallback(async (plotId: number, action: string) => {
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, plotId }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Action failed", "error"); return }
      if (action === "harvest") {
        const mult = body.rarity !== "COMMON" ? ` (${body.rarity} x${body.multiplier})` : ""
        showMessage(`Harvested ${body.seedName}! +${body.goldEarned}G${mult}`, "success")
        setSelectedPlot(null)
      } else if (action === "water") {
        showMessage("Watered!", "success")
        setJustWatered(true)
        setTimeout(() => setJustWatered(false), 3000)
      } else if (action === "clear") {
        showMessage("Dead plant cleared.", "success")
        setSelectedPlot(null)
      }
      mutate()
      invalidate("/api/pet/overview")
    } catch { showMessage("Network error", "error") }
  }, [mutate, showMessage])

  const handleRemove = useCallback(async (plotId: number) => {
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", plotId }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Remove failed", "error"); return }
      showMessage(`Plant removed. Refunded ${body.refund}G (50% of ${body.invested}G)`, "success")
      setSelectedPlot(null)
      mutate()
      invalidate("/api/pet/overview")
    } catch { showMessage("Network error", "error") }
  }, [mutate, showMessage])

  const handlePlant = useCallback(async (plotId: number, seedId: number) => {
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "plant", plotId, seedId }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Planting failed", "error"); return }
      const rarityMsg = body.rarity !== "COMMON" ? ` [${body.rarity}]` : ""
      showMessage(`Planted ${body.seedName}${rarityMsg} for ${body.cost}G!`, "success")
      setShowSeedSelector(false)
      mutate()
      invalidate("/api/pet/overview")
    } catch { showMessage("Network error", "error") }
  }, [mutate, showMessage])

  const handleWaterAll = useCallback(async () => {
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "waterAll" }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Failed", "error"); return }
      showMessage(`Watered ${body.count} plots!`, "success")
      setJustWatered(true)
      setTimeout(() => setJustWatered(false), 3000)
      mutate()
    } catch { showMessage("Network error", "error") }
  }, [mutate, showMessage])

  const handleHarvestAll = useCallback(async () => {
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "harvestAll" }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Failed", "error"); return }
      setHarvestResult(body)
      setSelectedPlot(null)
      mutate()
      invalidate("/api/pet/overview")
    } catch { showMessage("Network error", "error") }
  }, [mutate, showMessage])

  const handleClearDead = useCallback(async () => {
    if (!data) return
    const deadPlots = data.plots.filter(p => p.dead)
    for (const p of deadPlots) {
      await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", plotId: p.plotId }),
      })
    }
    showMessage(`Cleared ${deadPlots.length} dead plots`, "success")
    mutate()
  }, [data, mutate, showMessage])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev
      localStorage.setItem("farm-fullscreen", String(next))
      return next
    })
  }, [])

  return (
    <Layout SEO={{ title: "Farm - LionGotchi", description: "Grow plants for Gold" }}>
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />

            <div className="flex-1 min-w-0 space-y-4">
              {/* Title with decorative underline */}
              <div>
                <h1 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)]">Farm</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Plant seeds, water them, harvest for Gold. Click any plot.
                </p>
              </div>

              {/* Toast with icon */}
              {message && (
                <div
                  className="flex items-center gap-2 px-3 py-2 border-2"
                  style={{
                    borderColor: message.type === "success" ? "var(--pet-green)" : "var(--pet-red)",
                    backgroundColor: message.type === "success" ? "rgba(40,100,60,0.15)" : "rgba(100,40,40,0.15)",
                    boxShadow: "2px 2px 0 #060810",
                  }}
                >
                  <img
                    src={getUiIconUrl(message.type === "success" ? "trophy" : "liongotchi_heart")}
                    alt="" width={14} height={14}
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="font-pixel text-[10px]"
                    style={{ color: message.type === "success" ? "var(--pet-green)" : "var(--pet-red)" }}>
                    {message.text}
                  </span>
                </div>
              )}

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-[600px]" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-xs text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : !data?.plots.length ? (
                <PixelCard className="p-12 text-center space-y-3" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">No farm plots yet.</p>
                  <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                    Use /pet in Discord to create your pet and unlock your farm!
                  </p>
                </PixelCard>
              ) : (
                <>
                  {/* RPG HUD Bar */}
                  <FarmStats plots={data.plots} gold={data.gold} />

                  {/* Farm Scene with Gameboy Frame */}
                  <div className="flex justify-center">
                    <GameboyFrame isFullscreen={isFullscreen}>
                      <FarmScene
                        plots={data.plots}
                        selectedPlot={selectedPlot}
                        onSelectPlot={handleSelectPlot}
                        justWatered={justWatered}
                        isFullscreen={isFullscreen}
                      />
                    </GameboyFrame>
                  </div>

                  {/* Action Toolbar */}
                  <div
                    className="flex items-center justify-center gap-0 border-[3px] border-[#2a3a5c] bg-[#0c1020]"
                    style={{ boxShadow: "3px 3px 0 #060810" }}
                  >
                    {hasPlanted && (
                      <ToolbarButton
                        iconUrl={getUiIconUrl("liongotchi_greenpot")}
                        label="Water All"
                        onClick={handleWaterAll}
                        color="#4080f0"
                      />
                    )}
                    {hasPlanted && hasHarvestable && <div className="w-px h-10 bg-[#1a2a3c]" />}
                    {hasHarvestable && (
                      <ToolbarButton
                        iconUrl={getUiIconUrl("trophy")}
                        label="Harvest All"
                        onClick={handleHarvestAll}
                        color="#f0c040"
                      />
                    )}
                    {(hasPlanted || hasHarvestable) && hasDead && <div className="w-px h-10 bg-[#1a2a3c]" />}
                    {hasDead && (
                      <ToolbarButton
                        iconUrl={getFarmAnimationUrl("skull", 1)}
                        label="Clear Dead"
                        onClick={handleClearDead}
                        color="#e04040"
                      />
                    )}
                    {(hasPlanted || hasHarvestable || hasDead) && <div className="w-px h-10 bg-[#1a2a3c]" />}
                    <ToolbarButton
                      iconUrl={getUiIconUrl(isFullscreen ? "liongotchi_heart" : "liongotchi_greenpot")}
                      label={isFullscreen ? "Compact" : "Fullscreen"}
                      onClick={toggleFullscreen}
                      color="#8899aa"
                    />
                  </div>

                  {/* Plot detail / Seed selector */}
                  {selectedPlotData && !showSeedSelector && (
                    <PlotDetail
                      plot={selectedPlotData}
                      onAction={handleAction}
                      onPlantClick={() => setShowSeedSelector(true)}
                      onRemove={handleRemove}
                    />
                  )}

                  {showSeedSelector && selectedPlot !== null && (
                    <SeedSelector
                      seeds={data.availableSeeds}
                      gold={data.gold}
                      plotId={selectedPlot}
                      onPlant={handlePlant}
                      onCancel={() => setShowSeedSelector(false)}
                    />
                  )}

                  {selectedPlot === null && (
                    <div className="text-center py-3">
                      <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                        Click on any plot to view details and take actions
                      </p>
                    </div>
                  )}

                  {/* History Log */}
                  {data.history && data.history.length > 0 && (
                    <FarmHistory history={data.history} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Harvest Modal */}
        {harvestResult && (
          <HarvestModal result={harvestResult} onClose={() => setHarvestResult(null)} />
        )}
      </AdminGuard>
    </Layout>
  )
}

function ToolbarButton({ iconUrl, label, onClick, color }: {
  iconUrl: string; label: string; onClick: () => void; color: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 transition-all hover:bg-[rgba(255,255,255,0.03)] active:bg-[rgba(255,255,255,0.06)]"
    >
      <img
        src={iconUrl} alt="" width={18} height={18}
        className="flex-shrink-0"
        style={{ imageRendering: "pixelated" }}
      />
      <span className="font-pixel text-[10px]" style={{ color }}>{label}</span>
    </button>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
