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
import { useState, useCallback, useEffect, useRef } from "react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import dynamic from "next/dynamic"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelCard from "@/components/pet/ui/PixelCard"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { getUiIconUrl, getFarmAnimationUrl } from "@/utils/petAssets"
import ArtistAttribution from "@/components/pet/ui/ArtistAttribution"
import type { FarmPlot } from "@/components/pet/farm/FarmScene"

const FarmScene = dynamic(() => import("@/components/pet/farm/FarmScene"), { ssr: false })
const FarmStats = dynamic(() => import("@/components/pet/farm/FarmStats"), { ssr: false })
const PlotDetail = dynamic(() => import("@/components/pet/farm/PlotDetail"), { ssr: false })
const SeedSelector = dynamic(() => import("@/components/pet/farm/SeedSelector"), { ssr: false })
const HarvestModal = dynamic(() => import("@/components/pet/farm/HarvestModal"), { ssr: false })
const FarmHistory = dynamic(() => import("@/components/pet/farm/FarmHistory"), { ssr: false })
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Use shared GameboyFrame from components/pet/ (supports skin + width props)
const GameboyFrame = dynamic(() => import("@/components/pet/GameboyFrame"), { ssr: false })
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Add fullscreenMode and materialDrops to FarmData/HarvestResult types
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
  fullscreenMode: boolean
  // --- AI-MODIFIED (2026-03-17) ---
  gameboySkinPath?: string | null
  // --- END AI-MODIFIED ---
}

interface HarvestResult {
  count: number
  totalGold: number
  totalInvested: number
  netProfit: number
  totalVoiceMinutes: number
  totalMessages: number
  details: Array<{ name: string; rarity: string; gold: number; multiplier: number }>
  materialDrops?: Array<{ itemId: number; name: string; rarity: string }>
}

const RARITY_REVEAL_COLORS: Record<string, string> = {
  UNCOMMON: "#4080f0",
  RARE: "#e04040",
  EPIC: "#f0c040",
  LEGENDARY: "#d060f0",
}
// --- END AI-MODIFIED ---

export default function FarmPage() {
  const { data: session } = useSession()
  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Auto-refresh every 30s to keep farm growth data live
  const { data, error, isLoading, mutate } = useDashboard<FarmData>(
    session ? "/api/pet/farm?history=true" : null,
    { refreshInterval: 30000 }
  )
  // --- END AI-MODIFIED ---
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null)
  const [showSeedSelector, setShowSeedSelector] = useState(false)
  const [justWatered, setJustWatered] = useState(false)
  const [harvestResult, setHarvestResult] = useState<HarvestResult | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Auto-scroll to PlotDetail when user selects a farm plot (fixes UX bug where users
  // couldn't find the planting controls below the Gameboy frame)
  const plotDetailRef = useRef<HTMLDivElement>(null)
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Rarity reveal flash state for planting animation
  const [rarityReveal, setRarityReveal] = useState<{ rarity: string; name: string } | null>(null)
  const fullscreenInitialized = useRef(false)

  useEffect(() => {
    if (data && !fullscreenInitialized.current) {
      setIsFullscreen(data.fullscreenMode)
      fullscreenInitialized.current = true
    }
  }, [data])
  // --- END AI-MODIFIED ---

  const selectedPlotData = data?.plots.find((p) => p.plotId === selectedPlot) ?? null
  const hasPlanted = data?.plots.some(p => !p.empty && !p.dead)
  const hasHarvestable = data?.plots.some(p => p.readyToHarvest && !p.dead)
  const hasDead = data?.plots.some(p => p.dead)

  const showMessage = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }, [])

  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Auto-scroll to plot detail panel after selecting a plot so users can see
  // the Plant Seed / Water / Harvest controls without manual scrolling
  const handleSelectPlot = useCallback((plotId: number) => {
    setSelectedPlot((prev) => {
      const newVal = prev === plotId ? null : plotId
      if (newVal !== null) {
        setTimeout(() => {
          plotDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }, 80)
      }
      return newVal
    })
    setShowSeedSelector(false)
  }, [])
  // --- END AI-MODIFIED ---

  const handleAction = useCallback(async (plotId: number, action: string) => {
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, plotId }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Action failed", "error"); return }
      if (action === "harvest") {
        // --- AI-MODIFIED (2026-03-16) ---
        // Purpose: Show single-harvest as a mini harvest result with material drops
        const dropCount = body.materialDrops?.length || 0
        const dropMsg = dropCount > 0 ? ` + ${dropCount} material${dropCount > 1 ? "s" : ""}!` : ""
        const mult = body.rarity !== "COMMON" ? ` (${body.rarity} x${body.multiplier})` : ""
        showMessage(`Harvested ${body.seedName}! +${body.goldEarned}G${mult}${dropMsg}`, "success")
        // --- END AI-MODIFIED ---
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

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Rarity reveal animation when planting non-COMMON seeds
  const handlePlant = useCallback(async (plotId: number, seedId: number) => {
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "plant", plotId, seedId }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Planting failed", "error"); return }

      if (body.rarity && body.rarity !== "COMMON") {
        setRarityReveal({ rarity: body.rarity, name: body.seedName })
        setTimeout(() => setRarityReveal(null), 3000)
      } else {
        showMessage(`Planted ${body.seedName} for ${body.cost}G!`, "success")
      }

      setShowSeedSelector(false)
      mutate()
      invalidate("/api/pet/overview")
    } catch { showMessage("Network error", "error") }
  }, [mutate, showMessage])
  // --- END AI-MODIFIED ---

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

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Fullscreen toggle syncs to database via API instead of localStorage only
  const toggleFullscreen = useCallback(async () => {
    setIsFullscreen(prev => !prev)
    try {
      await fetch("/api/pet/farm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleFullscreen" }),
      })
    } catch {}
  }, [])
  // --- END AI-MODIFIED ---

  return (
    <Layout SEO={{ title: "Farm - LionGotchi", description: "Grow plants for Gold" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />

            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Farm</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
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
                    alt="" width={18} height={18}
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="font-pixel text-[10px]"
                    style={{ color: message.type === "success" ? "var(--pet-green)" : "var(--pet-red)" }}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* --- AI-MODIFIED (2026-03-16) --- */}
              {/* Purpose: Rarity reveal banner with animated glow */}
              {rarityReveal && (
                <div
                  className="flex items-center justify-center gap-3 px-4 py-3 border-2 animate-pulse"
                  style={{
                    borderColor: RARITY_REVEAL_COLORS[rarityReveal.rarity] || "#4080f0",
                    backgroundColor: `${RARITY_REVEAL_COLORS[rarityReveal.rarity] || "#4080f0"}15`,
                    boxShadow: `0 0 20px ${RARITY_REVEAL_COLORS[rarityReveal.rarity] || "#4080f0"}40`,
                  }}
                >
                  <span className="font-pixel text-lg" style={{ color: RARITY_REVEAL_COLORS[rarityReveal.rarity] }}>
                    {rarityReveal.rarity === "LEGENDARY" ? "\u2B50" : rarityReveal.rarity === "EPIC" ? "\uD83D\uDC51" : rarityReveal.rarity === "RARE" ? "\u2764\uFE0F" : "\uD83D\uDD39"}
                  </span>
                  <span className="font-pixel text-sm" style={{ color: RARITY_REVEAL_COLORS[rarityReveal.rarity] }}>
                    {rarityReveal.rarity} {rarityReveal.name}!
                  </span>
                </div>
              )}
              {/* --- END AI-MODIFIED --- */}

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-[600px]" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : !data?.plots.length ? (
                <PixelCard className="p-12 text-center space-y-3" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">No farm plots yet.</p>
                  <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                    Use /pet in Discord to create your pet and unlock your farm!
                  </p>
                </PixelCard>
              ) : (
                // --- AI-MODIFIED (2026-03-20) ---
                // Purpose: Improved layout -- gameboy frame + toolbar grouped as one
                //          visual unit, responsive sizing, better flow
                <>
                  <FarmStats plots={data.plots} gold={data.gold} />

                  {/* Gameboy + toolbar unit -- centered, max-width constrained */}
                  <div className="w-full max-w-[880px] mx-auto space-y-0">
                    <GameboyFrame isFullscreen={isFullscreen} skinAssetPath={data.gameboySkinPath ?? undefined}>
                      <FarmScene
                        plots={data.plots}
                        selectedPlot={selectedPlot}
                        onSelectPlot={handleSelectPlot}
                        justWatered={justWatered}
                      />
                    </GameboyFrame>

                    {/* Toolbar flush under the frame */}
                    {/* --- AI-MODIFIED (2026-03-21) --- */}
                    {/* Purpose: Add gap + padding so wrapped toolbar buttons have breathing room on mobile */}
                    <div
                      className="flex items-center justify-center flex-wrap gap-1 py-1 border-x-[3px] border-b-[3px] border-[#2a3a5c] bg-[#0c1020]/90"
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
                    {/* --- END AI-MODIFIED --- */}
                  </div>

                  <ArtistAttribution />

                  {/* --- AI-MODIFIED (2026-03-22) --- */}
                  {/* Purpose: Wrap PlotDetail/SeedSelector in a div with ref for auto-scroll */}
                  <div ref={plotDetailRef}>
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

                  </div>
                  {/* --- END AI-MODIFIED --- */}

                  {selectedPlot === null && !hasPlanted && (
                    <div className="text-center py-3">
                      <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)]">
                        Click on any plot to plant a seed
                      </p>
                    </div>
                  )}

                  {data.history && data.history.length > 0 && (
                    <FarmHistory history={data.history} />
                  )}
                </>
                // --- END AI-MODIFIED ---
              )}
            </div>
          </div>
        </div>

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
      <span className="font-pixel text-[13px]" style={{ color }}>{label}</span>
    </button>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
