// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet farm page - view and manage farm plots
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Sprout, Droplets, Scissors, Skull, Loader2, Coins,
} from "lucide-react"
import { getFarmPlantImageUrl } from "@/utils/petAssets"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface FarmPlot {
  plotId: number
  empty: boolean
  dead: boolean
  seed: { id: number; name: string; plantType: string; harvestGold: number } | null
  stage: number
  progress: number
  readyToHarvest: boolean
  needsWater: boolean
  plantedAt?: string
  lastWatered?: string | null
}

interface FarmData {
  plots: FarmPlot[]
  availableSeeds: Array<{
    id: number; name: string; plantType: string
    growTimeHours: number; waterIntervalHours: number; harvestGold: number
  }>
  ownedSeeds: Array<{ inventoryId: number; quantity: number; itemId: number; name: string }>
}

const stageLabels = ["Empty", "Sprout", "Seedling", "Growing", "Budding", "Ready!"]
const stageColors = ["text-muted-foreground", "text-emerald-600", "text-emerald-500", "text-emerald-400", "text-green-400", "text-amber-400"]
const stageBgs = ["bg-muted/20", "bg-emerald-500/5", "bg-emerald-500/8", "bg-emerald-500/10", "bg-green-500/10", "bg-amber-500/10"]

export default function FarmPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<FarmData>(
    session ? "/api/pet/farm" : null
  )
  const [acting, setActing] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  async function handleAction(plotId: number, action: "water" | "harvest") {
    setActing(plotId)
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
      } else if (action === "harvest") {
        setMessage({ text: `Harvested ${body.seedName}! +${body.goldEarned} Gold`, type: "success" })
      } else {
        setMessage({ text: "Plot watered!", type: "success" })
      }
      mutate()
      invalidate("/api/pet/overview")
    } catch {
      setMessage({ text: "Network error", type: "error" })
    } finally {
      setActing(null)
    }
  }

  return (
    <Layout SEO={{ title: "Farm - LionGotchi", description: "Grow plants for Gold" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sprout size={24} className="text-green-400" />
                  Farm
                </h1>
                <p className="text-sm text-muted-foreground">
                  Plant seeds, water them, and harvest for Gold
                </p>
              </div>

              {message && (
                <div className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2",
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                  {message.type === "success" && <Coins size={14} />}
                  {message.text}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{(error as Error).message}</p>
                </div>
              ) : !data?.plots.length ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No farm plots yet. Use /pet in Discord to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {data.plots.map((plot) => (
                    <Card
                      key={plot.plotId}
                      className={cn(
                        "border aspect-square flex flex-col items-center justify-center relative overflow-hidden transition-all",
                        plot.dead
                          ? "border-red-500/20 bg-red-500/5"
                          : plot.readyToHarvest
                          ? "border-amber-500/30 bg-amber-500/10 ring-2 ring-amber-500/20"
                          : plot.needsWater
                          ? "border-blue-500/30 bg-blue-500/5"
                          : plot.empty
                          ? "border-border bg-muted/10"
                          : stageBgs[plot.stage] + " border-emerald-500/20"
                      )}
                    >
                      <CardContent className="p-2 flex flex-col items-center justify-center h-full gap-1.5">
                        {plot.dead ? (
                          <>
                            <Skull size={24} className="text-red-400/60" />
                            <p className="text-[10px] text-red-400 font-medium">Dead</p>
                          </>
                        ) : plot.empty ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                              <Sprout size={16} className="text-muted-foreground/30" />
                            </div>
                            <p className="text-[10px] text-muted-foreground/40">Empty</p>
                          </>
                        ) : (
                          <>
                            {(() => {
                              const plantImg = plot.seed ? getFarmPlantImageUrl(plot.seed.plantType, plot.seed.id, plot.stage) : null
                              return plantImg ? (
                                <img
                                  src={plantImg}
                                  alt={plot.seed?.name ?? "Plant"}
                                  className="w-12 h-12 object-contain"
                                  style={{ imageRendering: "pixelated" }}
                                />
                              ) : (
                                <Sprout size={20} className={stageColors[plot.stage]} />
                              )
                            })()}
                            <p className={cn("text-[10px] font-medium", stageColors[plot.stage])}>
                              {stageLabels[plot.stage]}
                            </p>
                            {plot.seed && (
                              <p className="text-[9px] text-muted-foreground truncate max-w-full px-1">
                                {plot.seed.name}
                              </p>
                            )}
                            {/* Progress bar */}
                            <div className="w-full h-1 rounded-full bg-muted/30 mt-auto">
                              <div
                                className="h-full rounded-full bg-emerald-400 transition-all"
                                style={{ width: `${plot.progress}%` }}
                              />
                            </div>
                          </>
                        )}

                        {/* Action buttons */}
                        {plot.readyToHarvest && !plot.dead && (
                          <button
                            onClick={() => handleAction(plot.plotId, "harvest")}
                            disabled={acting !== null}
                            className="absolute inset-0 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center transition-colors"
                          >
                            {acting === plot.plotId ? (
                              <Loader2 size={20} className="text-amber-400 animate-spin" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Scissors size={18} className="text-amber-400" />
                                <span className="text-[10px] font-semibold text-amber-400">Harvest</span>
                                <span className="text-[9px] text-amber-400/60">
                                  +{plot.seed?.harvestGold} <Coins size={8} className="inline" />
                                </span>
                              </div>
                            )}
                          </button>
                        )}
                        {plot.needsWater && !plot.dead && !plot.readyToHarvest && (
                          <button
                            onClick={() => handleAction(plot.plotId, "water")}
                            disabled={acting !== null}
                            className="absolute bottom-0 left-0 right-0 py-1 bg-blue-500/15 hover:bg-blue-500/25 flex items-center justify-center gap-1 transition-colors"
                          >
                            {acting === plot.plotId ? (
                              <Loader2 size={12} className="text-blue-400 animate-spin" />
                            ) : (
                              <>
                                <Droplets size={10} className="text-blue-400" />
                                <span className="text-[10px] font-medium text-blue-400">Water</span>
                              </>
                            )}
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
