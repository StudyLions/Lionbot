// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet farm page - interactive pixel art farm with
//          layered rendering, hover tooltips, planting,
//          watering, harvesting, and live growth timers
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { useState, useCallback } from "react"
import { Sprout, Coins } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import dynamic from "next/dynamic"
import type { FarmPlot } from "@/components/pet/farm/FarmScene"

const FarmScene = dynamic(() => import("@/components/pet/farm/FarmScene"), { ssr: false })
const FarmStats = dynamic(() => import("@/components/pet/farm/FarmStats"), { ssr: false })
const PlotDetail = dynamic(() => import("@/components/pet/farm/PlotDetail"), { ssr: false })
const SeedSelector = dynamic(() => import("@/components/pet/farm/SeedSelector"), { ssr: false })

interface FarmData {
  plots: FarmPlot[]
  availableSeeds: Array<{
    id: number; name: string; plantType: string
    growTimeHours: number; waterIntervalHours: number; harvestGold: number
    plantCost: number; growthPointsNeeded: number; assetPrefix: string; typeId: number
  }>
  ownedSeeds: Array<{ inventoryId: number; quantity: number; itemId: number; name: string }>
  gold: number
}

export default function FarmPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<FarmData>(
    session ? "/api/pet/farm" : null
  )
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null)
  const [showSeedSelector, setShowSeedSelector] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const selectedPlotData = data?.plots.find((p) => p.plotId === selectedPlot) ?? null

  const handleSelectPlot = useCallback((plotId: number) => {
    setSelectedPlot((prev) => prev === plotId ? null : plotId)
    setShowSeedSelector(false)
    setMessage(null)
  }, [])

  const handleAction = useCallback(async (plotId: number, action: string) => {
    setMessage(null)
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, plotId }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ text: body.error || "Action failed", type: "error" })
        return
      }

      if (action === "harvest") {
        const mult = body.rarity !== "COMMON" ? ` (${body.rarity} x${body.multiplier})` : ""
        setMessage({
          text: `Harvested ${body.seedName}! +${body.goldEarned} Gold${mult}`,
          type: "success",
        })
        setSelectedPlot(null)
      } else if (action === "water") {
        setMessage({ text: "Plot watered!", type: "success" })
      } else if (action === "clear") {
        setMessage({ text: "Dead plant cleared.", type: "success" })
        setSelectedPlot(null)
      }

      mutate()
      invalidate("/api/pet/overview")
    } catch {
      setMessage({ text: "Network error", type: "error" })
    }
  }, [mutate])

  const handlePlant = useCallback(async (plotId: number, seedId: number) => {
    setMessage(null)
    try {
      const res = await fetch("/api/pet/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "plant", plotId, seedId }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ text: body.error || "Planting failed", type: "error" })
        return
      }

      const rarityMsg = body.rarity !== "COMMON" ? ` [${body.rarity}]` : ""
      setMessage({
        text: `Planted ${body.seedName}${rarityMsg} for ${body.cost} Gold!`,
        type: "success",
      })
      setShowSeedSelector(false)
      mutate()
      invalidate("/api/pet/overview")
    } catch {
      setMessage({ text: "Network error", type: "error" })
    }
  }, [mutate])

  return (
    <Layout SEO={{ title: "Farm - LionGotchi", description: "Grow plants for Gold" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />

            <div className="flex-1 min-w-0 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Sprout size={24} className="text-green-400" />
                    Farm
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Plant seeds, water them, and harvest for Gold. Click any plot to interact.
                  </p>
                </div>
                {data && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Coins size={14} className="text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">{data.gold.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Toast */}
              {message && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {message.type === "success" && <Coins size={14} />}
                  {message.text}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                  <Skeleton className="h-[600px] rounded-xl" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{(error as Error).message}</p>
                </div>
              ) : !data?.plots.length ? (
                <div className="text-center py-16 space-y-3">
                  <Sprout size={48} className="text-emerald-500/20 mx-auto" />
                  <p className="text-muted-foreground">
                    No farm plots yet. Use <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">/pet</code> in Discord to create your pet and unlock your farm!
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <FarmStats plots={data.plots} gold={data.gold} />

                  {/* Farm Scene */}
                  <div className="flex justify-center">
                    <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6 inline-block">
                      <FarmScene
                        plots={data.plots}
                        selectedPlot={selectedPlot}
                        onSelectPlot={handleSelectPlot}
                      />
                    </div>
                  </div>

                  {/* Plot detail / Seed selector */}
                  {selectedPlotData && !showSeedSelector && (
                    <PlotDetail
                      plot={selectedPlotData}
                      onAction={handleAction}
                      onPlantClick={() => setShowSeedSelector(true)}
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

                  {/* Hint when no plot selected */}
                  {selectedPlot === null && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">
                        Click on any plot in the farm above to view details and take actions
                      </p>
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
