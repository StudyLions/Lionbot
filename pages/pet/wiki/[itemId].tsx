// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Item encyclopedia detail page - full item view with
//          stats, ownership, recipes, enhancement info, scroll
//          properties, leaderboard, marketplace mock, related
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Coins, Gem, Users, Package, ShoppingCart, Hammer,
  Sparkles, Shield, Droplets, Mic, MessageSquare, Lock,
} from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import dynamic from "next/dynamic"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const EnhancementLeaderboard = dynamic(() => import("@/components/pet/wiki/EnhancementLeaderboard"), { ssr: false })
const MarketplaceWidget = dynamic(() => import("@/components/pet/wiki/MarketplaceWidget"), { ssr: false })
const RelatedItems = dynamic(() => import("@/components/pet/wiki/RelatedItems"), { ssr: false })

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}
const rarityBg: Record<string, string> = {
  COMMON: "bg-gray-500/10", UNCOMMON: "bg-green-500/10", RARE: "bg-blue-500/10",
  EPIC: "bg-purple-500/10", LEGENDARY: "bg-amber-500/10", MYTHICAL: "bg-rose-500/10",
}
const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-500/30", UNCOMMON: "border-green-500/30", RARE: "border-blue-500/30",
  EPIC: "border-purple-500/30", LEGENDARY: "border-amber-500/30", MYTHICAL: "border-rose-500/30",
}
const rarityBadge: Record<string, string> = {
  COMMON: "bg-gray-500/15 text-gray-400", UNCOMMON: "bg-green-500/15 text-green-400",
  RARE: "bg-blue-500/15 text-blue-400", EPIC: "bg-purple-500/15 text-purple-400",
  LEGENDARY: "bg-amber-500/15 text-amber-400", MYTHICAL: "bg-rose-500/15 text-rose-400",
}

const EQUIP_CATS = new Set(["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS"])

const SuccessCurveChart = dynamic(
  () => import("@/components/pet/wiki/SuccessCurveChart"),
  { ssr: false }
)

export default function ItemDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const itemId = router.query.itemId as string

  const { data, isLoading, error } = useDashboard<any>(
    session && itemId ? `/api/pet/wiki/${itemId}` : null
  )

  if (!session) {
    return (
      <Layout SEO={{ title: "Item Wiki - LionGotchi", description: "Browse item details" }}>
        <AdminGuard>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-muted-foreground">Sign in to view item details</p>
          </div>
        </AdminGuard>
      </Layout>
    )
  }

  const item = data?.item
  const imgUrl = item ? getItemImageUrl(item.assetPath, item.category) : null
  const isEquipment = item ? EQUIP_CATS.has(item.category) : false

  return (
    <Layout SEO={{ title: item ? `${item.name} - Item Wiki` : "Item Wiki", description: item?.description ?? "" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-6">

              <Link href="/pet/wiki" className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
                <ArrowLeft size={12} /> Back to Wiki
              </Link>

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                </div>
              ) : error || !item ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Item not found</p>
                </div>
              ) : (
                <>
                  {/* Hero */}
                  <div className={cn("rounded-2xl border-2 p-6 flex flex-col sm:flex-row items-center gap-6", rarityBorder[item.rarity], rarityBg[item.rarity])}>
                    <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-muted/30 flex items-center justify-center text-5xl">
                          {getCategoryPlaceholder(item.category)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                      <h1 className={cn("text-2xl font-bold", rarityColor[item.rarity])}>{item.name}</h1>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", rarityBadge[item.rarity])}>{item.rarity}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted/20 text-muted-foreground">{item.category}</span>
                        {item.slot && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted/20 text-muted-foreground">{item.slot}</span>}
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", item.tradeable ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                          {item.tradeable ? "Tradeable" : "Untradeable"}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground/70 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Coins size={10} /> Gold Price</span>
                      <p className="text-sm font-bold mt-1 text-amber-400">{item.goldPrice ? item.goldPrice.toLocaleString() : "Not for sale"}</p>
                    </div>
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Gem size={10} /> Gem Price</span>
                      <p className="text-sm font-bold mt-1 text-cyan-400">{item.gemPrice ?? "N/A"}</p>
                    </div>
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Users size={10} /> Owners</span>
                      <p className="text-sm font-bold mt-1">{data.ownership.count}</p>
                      <p className="text-[10px] text-muted-foreground/40">{data.ownership.tier}</p>
                    </div>
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Package size={10} /> Your Collection</span>
                      <p className={cn("text-sm font-bold mt-1", data.ownership.userOwned > 0 ? "text-emerald-400" : "text-muted-foreground/30")}>
                        {data.ownership.userOwned > 0 ? `You own x${data.ownership.userOwned}` : "Not owned"}
                      </p>
                    </div>
                  </div>

                  {/* How to Obtain */}
                  <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ShoppingCart size={14} /> How to Obtain
                    </h3>
                    <div className="space-y-2 text-xs">
                      {(item.goldPrice || item.gemPrice) && (
                        <div className="flex items-center gap-2 text-muted-foreground/70">
                          <Coins size={12} className="text-amber-400" />
                          Buy for {item.goldPrice ? `${item.goldPrice.toLocaleString()} Gold` : ""}{item.goldPrice && item.gemPrice ? " or " : ""}{item.gemPrice ? `${item.gemPrice} Gems` : ""}
                        </div>
                      )}
                      {data.craftedFrom && (
                        <div className="flex items-start gap-2 text-muted-foreground/70">
                          <Hammer size={12} className="text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span>Craft from: </span>
                            {data.craftedFrom.ingredients.map((ing: any, i: number) => (
                              <span key={i}>
                                <Link href={`/pet/wiki/${ing.item.id}`} className={cn("hover:underline", rarityColor[ing.item.rarity])}>
                                  {ing.item.name}
                                </Link>
                                <span className="text-muted-foreground/40"> x{ing.quantity}</span>
                                {i < data.craftedFrom.ingredients.length - 1 && ", "}
                              </span>
                            ))}
                            {data.craftedFrom.goldCost > 0 && (
                              <span className="text-amber-400"> + {data.craftedFrom.goldCost} Gold</span>
                            )}
                          </div>
                        </div>
                      )}
                      {data.dropInfo && (
                        <div className="flex items-center gap-2 text-muted-foreground/70">
                          <Droplets size={12} className="text-cyan-400" />
                          Drops from activity. Drop tier: {item.rarity} ({data.dropInfo.dropTierPercent}% of material drops)
                        </div>
                      )}
                      {data.dropInfo && (
                        <div className="flex items-center gap-4 ml-5 text-[10px] text-muted-foreground/50">
                          <span className="flex items-center gap-1"><Mic size={9} /> {(data.dropInfo.voiceChance * 100).toFixed(0)}% per voice session</span>
                          <span className="flex items-center gap-1"><MessageSquare size={9} /> {(data.dropInfo.textChance * 100).toFixed(0)}% per text session</span>
                        </div>
                      )}
                      {!item.goldPrice && !item.gemPrice && !data.craftedFrom && !data.dropInfo && (
                        <div className="flex items-center gap-2 text-muted-foreground/40">
                          <Lock size={12} /> Acquisition method unknown
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Used In Recipes (materials/scrolls) */}
                  {data.usedInRecipes?.length > 0 && (
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Hammer size={14} /> Used In Recipes
                      </h3>
                      <div className="space-y-2">
                        {data.usedInRecipes.map((r: any) => {
                          const resultImg = getItemImageUrl(r.resultItem.assetPath, r.resultItem.category)
                          return (
                            <Link key={r.recipeId} href={`/pet/wiki/${r.resultItem.id}`}>
                              <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/15 transition-colors">
                                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                                  {resultImg ? (
                                    <img src={resultImg} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                                  ) : (
                                    <span>{getCategoryPlaceholder(r.resultItem.category)}</span>
                                  )}
                                </div>
                                <span className={cn("text-xs font-medium", rarityColor[r.resultItem.rarity])}>{r.resultItem.name}</span>
                                <span className="text-[10px] text-muted-foreground/40 ml-auto">needs x{r.quantityNeeded}</span>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Enhancement Info (equipment) */}
                  {data.enhancement && (
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles size={14} /> Enhancement Info
                      </h3>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-lg font-bold text-primary">+{data.enhancement.maxLevel}</p>
                          <p className="text-[10px] text-muted-foreground/50">Max Level</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-emerald-400">+{(data.enhancement.goldBonusPerLevel * 100).toFixed(0)}%</p>
                          <p className="text-[10px] text-muted-foreground/50">Gold/XP per level</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-amber-400">+{(data.enhancement.maxGoldBonus * 100).toFixed(0)}%</p>
                          <p className="text-[10px] text-muted-foreground/50">Max Bonus</p>
                        </div>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-muted/20 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary" style={{ width: "100%" }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground/40 mt-1">
                        <span>+0</span>
                        <span>+{data.enhancement.maxLevel}</span>
                      </div>
                    </div>
                  )}

                  {/* Scroll Properties */}
                  {data.scrollProperties && (
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4 space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Shield size={14} /> Scroll Properties
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3 text-center">
                          <p className="text-xl font-bold text-emerald-400">{(data.scrollProperties.success_rate * 100).toFixed(0)}%</p>
                          <p className="text-[10px] text-muted-foreground/50">Base Success Rate</p>
                        </div>
                        <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3 text-center">
                          <p className="text-xl font-bold text-red-400">{(data.scrollProperties.destroy_rate * 100).toFixed(0)}%</p>
                          <p className="text-[10px] text-muted-foreground/50">Destroy Rate</p>
                        </div>
                      </div>
                      {data.scrollProperties.target_slot && (
                        <p className="text-xs text-muted-foreground/60">Target slot: {data.scrollProperties.target_slot}</p>
                      )}
                      <div className="rounded-lg bg-muted/10 border border-border/15 p-3">
                        <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-2">Success Rate by Enhancement Level</h4>
                        <SuccessCurveChart scrollProps={data.scrollProperties} gameConstants={data.gameConstants} />
                      </div>
                    </div>
                  )}

                  {/* Enhancement Leaderboard (equipment) */}
                  {isEquipment && (
                    <EnhancementLeaderboard entries={data.enhancementLeaderboard ?? []} />
                  )}

                  {/* Marketplace */}
                  <MarketplaceWidget itemId={item.id} itemName={item.name} />

                  {/* Related Items */}
                  {data.related?.length > 0 && <RelatedItems items={data.related} />}
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
