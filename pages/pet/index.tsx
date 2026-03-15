// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet overview page shell - displays basic pet state
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import {
  PawPrint, Heart, Droplets, Moon, Sparkles,
  Coins, Gem, Package, Sprout, Swords,
} from "lucide-react"
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
  equipment: Record<string, { name: string; category: string; rarity: string }>
  inventoryCount: number
  activeFarmPlots: number
  gold: string
  gems: number
}

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-amber-400",
  MYTHICAL: "text-rose-400",
}

function NeedBar({ label, value, max, icon, color }: {
  label: string; value: number; max: number; icon: React.ReactNode; color: string
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  )
}

function NoPetState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400">
        <PawPrint size={40} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">No pet yet!</h2>
        <p className="text-muted-foreground max-w-sm">
          Use the <code className="px-1.5 py-0.5 bg-muted rounded text-sm">/pet</code> command
          in any Discord server with LionBot to create your LionGotchi.
        </p>
      </div>
    </div>
  )
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
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-6">
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-destructive">{(error as Error).message}</p>
                </div>
              ) : !data?.hasPet ? (
                <NoPetState />
              ) : pet && (
                <>
                  {/* Hero */}
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <PawPrint size={24} className="text-amber-400" />
                      {pet.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Level {pet.level} &middot; {pet.expression.toLowerCase()} mood &middot;
                      Created {new Date(pet.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Currency Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-border bg-card">
                      <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Coins size={14} className="text-amber-400" />
                          <span>Gold</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          {Number(data.gold).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Gem size={14} className="text-blue-400" />
                          <span>Gems</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          {data.gems.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Package size={14} className="text-emerald-400" />
                          <span>Items</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          {data.inventoryCount}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Sprout size={14} className="text-green-400" />
                          <span>Farm Plots</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          {data.activeFarmPlots}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Needs */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Heart size={16} className="text-rose-400" />
                        Pet Needs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <NeedBar label="Food" value={pet.food} max={8} icon={<Sparkles size={12} />} color="bg-amber-400" />
                      <NeedBar label="Bath" value={pet.bath} max={8} icon={<Droplets size={12} />} color="bg-blue-400" />
                      <NeedBar label="Sleep" value={pet.sleep} max={8} icon={<Moon size={12} />} color="bg-indigo-400" />
                      <NeedBar label="Life" value={pet.life} max={8} icon={<Heart size={12} />} color="bg-rose-400" />
                    </CardContent>
                  </Card>

                  {/* Equipment */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Swords size={16} className="text-purple-400" />
                        Equipment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {equipSlots.map((slot) => {
                          const item = equipment[slot]
                          return (
                            <div
                              key={slot}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg",
                                item ? "bg-muted/40" : "bg-muted/20"
                              )}
                            >
                              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-muted-foreground">
                                  {slot[0]}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
                                  {slot}
                                </p>
                                {item ? (
                                  <p className={cn("text-sm font-medium truncate", rarityColor[item.rarity] ?? "text-foreground")}>
                                    {item.name}
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground/40 italic">Empty</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
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
