// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family farm page with multi-farm navigation, FarmScene
//          component, permission-gated planting/watering/harvesting,
//          and attribution of who planted each crop.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import PetNav from "@/components/pet/PetNav"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { hasPermission } from "@/utils/familyPermissions"
import { maxFarmsForLevel } from "@/utils/familyPermissions"
import { getUiIconUrl } from "@/utils/petAssets"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import type { FarmPlot } from "@/components/pet/farm/FarmScene"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const FarmScene = dynamic(() => import("@/components/pet/farm/FarmScene"), { ssr: false })
const GameboyFrame = dynamic(() => import("@/components/pet/GameboyFrame"), { ssr: false })
const SeedSelector = dynamic(() => import("@/components/pet/farm/SeedSelector"), { ssr: false })
const PlotDetail = dynamic(() => import("@/components/pet/farm/PlotDetail"), { ssr: false })

interface FamilyCtx {
  familyId: number
  role: string
  permissions: unknown
  level: number
}

interface FamilyFarmData {
  plots: FarmPlot[]
  availableSeeds: Array<{
    id: number; name: string; plantType: string
    growTimeHours: number; waterIntervalHours: number; harvestGold: number
    plantCost: number; growthPointsNeeded: number; assetPrefix: string; typeId: number
  }>
  gold: number
}

const MAX_FARMS = 10

export default function FamilyFarmPage() {
  const { data: session } = useSession()
  const [farmIndex, setFarmIndex] = useState(0)
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null)
  const [showSeedSelector, setShowSeedSelector] = useState(false)
  const [justWatered, setJustWatered] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const { data: familyCtx } = useDashboard<FamilyCtx>(
    session ? "/api/pet/family" : null
  )

  const familyId = familyCtx?.familyId
  const role = familyCtx?.role ?? "MEMBER"
  const perms = familyCtx?.permissions
  const familyLevel = familyCtx?.level ?? 1
  const maxFarms = maxFarmsForLevel(familyLevel)

  const { data: farmData, error, isLoading, mutate } = useDashboard<FamilyFarmData>(
    familyId ? `/api/pet/family/farm?familyId=${familyId}&farmIndex=${farmIndex}` : null,
    { refreshInterval: 30000 }
  )

  const canPlant = hasPermission(role, "plant_farm", perms)
  const canHarvest = hasPermission(role, "harvest_farm", perms)

  const selectedPlotData = farmData?.plots.find((p) => p.plotId === selectedPlot) ?? null
  const hasPlanted = farmData?.plots.some(p => !p.empty && !p.dead)
  const hasHarvestable = farmData?.plots.some(p => p.readyToHarvest && !p.dead)
  const hasDead = farmData?.plots.some(p => p.dead)

  const showMessage = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }, [])

  const handleSelectPlot = useCallback((plotId: number) => {
    setSelectedPlot((prev) => prev === plotId ? null : plotId)
    setShowSeedSelector(false)
  }, [])

  const handleAction = useCallback(async (plotId: number, action: string) => {
    if (action === "harvest" && !canHarvest) { toast.error("No permission to harvest"); return }
    if ((action === "water" || action === "clear") && !canPlant) { toast.error("No permission"); return }

    try {
      const res = await fetch("/api/pet/family/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmIndex, plotId, action }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Action failed", "error"); return }

      if (action === "harvest") {
        toast.success(`Harvested ${body.seedName}! +${body.goldEarned}G to family treasury!`)
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
    } catch {
      showMessage("Network error", "error")
    }
  }, [farmIndex, mutate, showMessage, canHarvest, canPlant])

  const handlePlant = useCallback(async (plotId: number, seedId: number) => {
    if (!canPlant) { toast.error("No permission to plant"); return }

    try {
      const res = await fetch("/api/pet/family/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmIndex, plotId, action: "plant", seedId }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Planting failed", "error"); return }
      showMessage(`Planted ${body.seedName} for ${body.cost}G!`, "success")
      setShowSeedSelector(false)
      mutate()
    } catch {
      showMessage("Network error", "error")
    }
  }, [farmIndex, mutate, showMessage, canPlant])

  const handleRemove = useCallback(async (plotId: number) => {
    if (!canPlant) { toast.error("No permission"); return }

    try {
      const res = await fetch("/api/pet/family/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmIndex, plotId, action: "remove" }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Remove failed", "error"); return }
      showMessage(`Plant removed. Refunded ${body.refund}G`, "success")
      setSelectedPlot(null)
      mutate()
    } catch {
      showMessage("Network error", "error")
    }
  }, [farmIndex, mutate, showMessage, canPlant])

  const handleWaterAll = useCallback(async () => {
    if (!canPlant) { toast.error("No permission"); return }

    try {
      const res = await fetch("/api/pet/family/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmIndex, action: "waterAll" }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Failed", "error"); return }
      showMessage(`Watered ${body.count} plots!`, "success")
      setJustWatered(true)
      setTimeout(() => setJustWatered(false), 3000)
      mutate()
    } catch {
      showMessage("Network error", "error")
    }
  }, [farmIndex, mutate, showMessage, canPlant])

  const handleHarvestAll = useCallback(async () => {
    if (!canHarvest) { toast.error("No permission to harvest"); return }

    try {
      const res = await fetch("/api/pet/family/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmIndex, action: "harvestAll" }),
      })
      const body = await res.json()
      if (!res.ok) { showMessage(body.error || "Failed", "error"); return }
      toast.success(`Harvested ${body.count} crops! +${body.totalGold}G to family treasury!`)
      setSelectedPlot(null)
      mutate()
    } catch {
      showMessage("Network error", "error")
    }
  }, [farmIndex, mutate, showMessage, canHarvest])

  const handleClearDead = useCallback(async () => {
    if (!farmData) return
    const deadPlots = farmData.plots.filter(p => p.dead)
    for (const p of deadPlots) {
      await fetch("/api/pet/family/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmIndex, plotId: p.plotId, action: "clear" }),
      })
    }
    showMessage(`Cleared ${deadPlots.length} dead plots`, "success")
    mutate()
  }, [farmData, farmIndex, mutate, showMessage])

  const switchFarm = useCallback((idx: number) => {
    if (idx >= maxFarms) return
    setFarmIndex(idx)
    setSelectedPlot(null)
    setShowSeedSelector(false)
  }, [maxFarms])

  return (
    <Layout SEO={{ title: "Family Farm - LionGotchi", description: "Grow crops for your family" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />

            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Family Farm</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Plant seeds together, harvest gold to the family treasury
                </p>
              </div>

              {!familyId ? (
                <PixelCard className="p-12 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                    You are not in a family. Join or create one first!
                  </p>
                </PixelCard>
              ) : (
                <>
                  {/* Farm Tabs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {Array.from({ length: Math.min(MAX_FARMS, Math.max(maxFarms, 1) + 2) }).map((_, idx) => {
                      const unlocked = idx < maxFarms
                      const requiredLevel = idx === 0 ? 1 : idx * 5

                      return (
                        <button
                          key={idx}
                          onClick={() => unlocked && switchFarm(idx)}
                          disabled={!unlocked}
                          className={cn(
                            "font-pixel text-[12px] px-3 py-1.5 border-2 transition-all",
                            "shadow-[2px_2px_0_#060810]",
                            unlocked
                              ? farmIndex === idx
                                ? "bg-[#2a7a3a] border-[#40d870] text-[#d0ffd8]"
                                : "bg-[#0c1020] border-[#2a3a5c] text-[var(--pet-text-dim,#8899aa)] hover:border-[#4a5a7c] hover:text-[var(--pet-text,#e2e8f0)]"
                              : "bg-[#0a0c14] border-[#1a2030] text-[#3a4050] cursor-not-allowed opacity-50"
                          )}
                          title={unlocked ? `Farm ${idx + 1}` : `Requires Lv.${requiredLevel}`}
                        >
                          {unlocked ? (
                            `Farm ${idx + 1}`
                          ) : (
                            <span className="flex items-center gap-1">
                              {"\uD83D\uDD12"} Lv.{requiredLevel}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Gold display */}
                  {farmData && (
                    <div className="flex items-center gap-3">
                      <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                        Family Gold:
                      </span>
                      <GoldDisplay amount={farmData.gold} size="md" />
                    </div>
                  )}

                  {/* Toast */}
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
                      <span
                        className="font-pixel text-[10px]"
                        style={{ color: message.type === "success" ? "var(--pet-green)" : "var(--pet-red)" }}
                      >
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
                      <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
                        {(error as Error).message}
                      </p>
                    </PixelCard>
                  ) : !farmData?.plots.length ? (
                    <PixelCard className="p-12 text-center space-y-3" corners>
                      <p className="font-pixel text-2xl">{"\uD83C\uDF31"}</p>
                      <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                        No plots on this farm yet.
                      </p>
                    </PixelCard>
                  ) : (
                    <>
                      {/* Farm Scene */}
                      <div className="w-full max-w-[880px] mx-auto space-y-0">
                        <GameboyFrame isFullscreen={false}>
                          <FarmScene
                            plots={farmData.plots}
                            selectedPlot={selectedPlot}
                            onSelectPlot={handleSelectPlot}
                            justWatered={justWatered}
                          />
                        </GameboyFrame>

                        {/* Toolbar */}
                        <div
                          className="flex items-center justify-center flex-wrap gap-1 py-1 border-x-[3px] border-b-[3px] border-[#2a3a5c] bg-[#0c1020]/90"
                          style={{ boxShadow: "3px 3px 0 #060810" }}
                        >
                          {hasPlanted && canPlant && (
                            <ToolbarButton
                              iconUrl={getUiIconUrl("liongotchi_greenpot")}
                              label="Water All"
                              onClick={handleWaterAll}
                              color="#4080f0"
                            />
                          )}
                          {hasPlanted && hasHarvestable && <div className="w-px h-10 bg-[#1a2a3c]" />}
                          {hasHarvestable && canHarvest && (
                            <ToolbarButton
                              iconUrl={getUiIconUrl("trophy")}
                              label="Harvest All"
                              onClick={handleHarvestAll}
                              color="#f0c040"
                            />
                          )}
                          {(hasPlanted || hasHarvestable) && hasDead && <div className="w-px h-10 bg-[#1a2a3c]" />}
                          {hasDead && canPlant && (
                            <ToolbarButton
                              iconUrl={getUiIconUrl("liongotchi_heart")}
                              label="Clear Dead"
                              onClick={handleClearDead}
                              color="#e04040"
                            />
                          )}
                        </div>
                      </div>

                      {/* Permission notice */}
                      {(!canPlant || !canHarvest) && (
                        <div className="px-3 py-2 border border-[#f0c040]/20 bg-[#f0c040]/5">
                          <p className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">
                            {!canPlant && !canHarvest
                              ? "You don\u2019t have permission to plant or harvest on the family farm."
                              : !canPlant
                                ? "You don\u2019t have permission to plant or water."
                                : "You don\u2019t have permission to harvest."}
                          </p>
                        </div>
                      )}

                      {/* Plot Detail */}
                      {selectedPlotData && !showSeedSelector && (
                        <div className="space-y-2">
                          {selectedPlotData.plantedBy && (
                            <div className="px-3 py-1.5 border border-[#2a3a5c] bg-[#0a0e1a]">
                              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                                Planted by{" "}
                                <span className="text-[var(--pet-text,#e2e8f0)]">
                                  {(selectedPlotData as any).plantedByName ?? "Unknown"}
                                </span>
                              </span>
                            </div>
                          )}
                          <PlotDetail
                            plot={selectedPlotData}
                            onAction={(plotId, action) => {
                              if (action === "harvest" && !canHarvest) {
                                toast.error("No permission to harvest")
                                return
                              }
                              handleAction(plotId, action)
                            }}
                            onPlantClick={() => {
                              if (!canPlant) { toast.error("No permission to plant"); return }
                              setShowSeedSelector(true)
                            }}
                            onRemove={(plotId) => handleRemove(plotId)}
                          />
                        </div>
                      )}

                      {/* Seed Selector */}
                      {showSeedSelector && selectedPlot !== null && farmData.availableSeeds && (
                        <SeedSelector
                          seeds={farmData.availableSeeds}
                          gold={farmData.gold}
                          plotId={selectedPlot}
                          onPlant={handlePlant}
                          onCancel={() => setShowSeedSelector(false)}
                        />
                      )}

                      {selectedPlot === null && !hasPlanted && (
                        <div className="text-center py-3">
                          <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)]">
                            Click on any plot to plant a seed
                          </p>
                        </div>
                      )}
                    </>
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
