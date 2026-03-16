// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet overview page - pixel art RPG style
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getUiIconUrl } from "@/utils/petAssets"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface PetOverviewData {
  hasPet: boolean
  pet: {
    name: string
    expression: string
    level: number
    xp: string
    food: number
    bath: number
    sleep: number
    life: number
    lastDecayAt: string
    fullscreenMode: boolean
    createdAt: string
  } | null
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string }>
  inventoryCount: number
  activeFarmPlots: number
  gold: string
  gems: number
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

export default function PetOverview() {
  const { data: session } = useSession()
  const { data, error, isLoading } = useDashboard<PetOverviewData>(
    session ? "/api/pet/overview" : null
  )

  const pet = data?.pet
  const equipment = data?.equipment ?? {}
  const equipSlots = ["HEAD", "FACE", "BODY", "BACK", "FEET"]

  return (
    <Layout SEO={{ title: "LionGotchi - LionBot", description: "Your virtual pet companion" }}>
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-40" />
                  <Skeleton className="h-32" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-xs text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : !data?.hasPet ? (
                <PixelCard className="p-12 text-center space-y-4" corners>
                  <img src={getUiIconUrl("liongotchi_heart")} alt="" width={48} height={48}
                    className="mx-auto" style={{ imageRendering: "pixelated" }} />
                  <h2 className="font-pixel text-lg text-[var(--pet-text,#e2e8f0)]">No pet yet!</h2>
                  <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] max-w-sm mx-auto">
                    Use the /pet command in any Discord server with LionBot to create your LionGotchi.
                  </p>
                </PixelCard>
              ) : pet && (
                <>
                  {/* Hero */}
                  <div>
                    <h1 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)]">{pet.name}</h1>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                      <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                      <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                    </div>
                    <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                      Level {pet.level} &middot; {pet.expression.toLowerCase()} mood &middot;
                      Created {new Date(pet.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Currency HUD Bar */}
                  <div
                    className="border-[3px] border-[#3a4a6c] bg-gradient-to-b from-[#111828] to-[#0c1020] px-4 py-3"
                    style={{ boxShadow: "3px 3px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <GoldDisplay amount={Number(data.gold)} size="lg" />
                      <div className="flex items-center gap-4">
                        <GoldDisplay amount={data.gems} size="md" type="gem" />
                        <div className="w-px h-6 bg-[#2a3a5c]" />
                        <div className="flex items-center gap-1.5">
                          <img src={getUiIconUrl("liongotchi_greenpot")} alt="" width={16} height={16}
                            style={{ imageRendering: "pixelated" }} />
                          <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">{data.inventoryCount}</span>
                          <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)]">items</span>
                        </div>
                        <div className="w-px h-6 bg-[#2a3a5c]" />
                        <div className="flex items-center gap-1.5">
                          <span className="font-pixel text-xs text-[#40d870]">{data.activeFarmPlots}</span>
                          <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)]">farm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Needs */}
                  <PixelCard className="p-4 space-y-3" corners>
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
                      <img src={getUiIconUrl("liongotchi_heart")} alt="" width={16} height={16}
                        style={{ imageRendering: "pixelated" }} />
                      <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Pet Needs</span>
                    </div>
                    <PixelBar value={pet.food} max={8} label="Food" color="gold" />
                    <PixelBar value={pet.bath} max={8} label="Bath" color="blue" />
                    <PixelBar value={pet.sleep} max={8} label="Sleep" color="blue" />
                    <PixelBar value={pet.life} max={8} label="Life" color="red" />
                  </PixelCard>

                  {/* Equipment */}
                  <PixelCard className="p-4" corners>
                    <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-[#1a2a3c]">
                      <img src={getUiIconUrl("trophy")} alt="" width={16} height={16}
                        style={{ imageRendering: "pixelated" }} />
                      <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Equipment</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {equipSlots.map((slot) => {
                        const item = equipment[slot]
                        const bc = item ? (RARITY_BORDER[item.rarity] || "#3a4a6c") : "#1a2a3c"
                        const imgUrl = item ? getItemImageUrl(item.assetPath, item.category) : null
                        return (
                          <div
                            key={slot}
                            className="flex items-center gap-3 px-3 py-2 border-2 bg-[#080c18]"
                            style={{ borderColor: bc, boxShadow: "1px 1px 0 #060810" }}
                          >
                            <div className="w-9 h-9 border border-[#1a2a3c] bg-[#0a0e1a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {imgUrl ? (
                                <img src={imgUrl} alt={item?.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                              ) : (
                                <span className="font-pixel text-[8px] text-[#3a4a5c]">{slot[0]}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] uppercase">{slot}</p>
                              {item ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] truncate">{item.name}</span>
                                  <PixelBadge rarity={item.rarity} />
                                </div>
                              ) : (
                                <p className="font-pixel text-[10px] text-[#3a4a5c]">Empty</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </PixelCard>
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
