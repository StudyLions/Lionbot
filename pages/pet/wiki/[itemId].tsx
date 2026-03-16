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
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  Coins, Gem, Users, Package, ShoppingCart, Hammer,
  Sparkles, Shield, Droplets, Mic, MessageSquare, Lock,
} from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import dynamic from "next/dynamic"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"

const EnhancementLeaderboard = dynamic(() => import("@/components/pet/wiki/EnhancementLeaderboard"), { ssr: false })
const MarketplaceWidget = dynamic(() => import("@/components/pet/wiki/MarketplaceWidget"), { ssr: false })
const RelatedItems = dynamic(() => import("@/components/pet/wiki/RelatedItems"), { ssr: false })

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7080", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff60a0",
}
const RARITY_TEXT: Record<string, string> = {
  COMMON: "#a0a8b4", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ffa0c0",
}

const EQUIP_CATS = new Set(["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"])

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
          <div className="pet-section pet-scanline min-h-screen flex items-center justify-center">
            <p className="font-pixel text-base text-[var(--pet-text-dim,#8899aa)]">Sign in to view item details</p>
          </div>
        </AdminGuard>
      </Layout>
    )
  }

  const item = data?.item
  const imgUrl = item ? getItemImageUrl(item.assetPath, item.category) : null
  const isEquipment = item ? EQUIP_CATS.has(item.category) : false
  const bc = item ? (RARITY_BORDER[item.rarity] || "#6a7080") : "#2a3a5c"
  const tc = item ? (RARITY_TEXT[item.rarity] || "#a0a8b4") : "#8899aa"

  return (
    <Layout SEO={{ title: item ? `${item.name} - Item Wiki` : "Item Wiki", description: item?.description ?? "" }}>
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              <Link href="/pet/wiki">
                <a className="font-pixel text-[13px] text-[#4a5a70] hover:text-[#8899aa] transition-colors inline-flex items-center gap-1.5">
                  <span>&#x25C4;</span> Back to Wiki
                </a>
              </Link>

              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-48 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                  <div className="h-24 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                  <div className="h-32 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                </div>
              ) : error || !item ? (
                <PixelCard className="p-12 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">ITEM NOT FOUND</p>
                  <p className="font-pixel text-[13px] text-[#4a5a6a] mt-1">This item may have been removed or doesn&apos;t exist</p>
                </PixelCard>
              ) : (
                <>
                  {/* Hero */}
                  <div
                    className="border-2 p-1 shadow-[2px_2px_0_#060810]"
                    style={{ borderColor: bc }}
                  >
                    <div
                      className="border-2 p-5 flex flex-col sm:flex-row items-center gap-6"
                      style={{ borderColor: `${bc}60`, backgroundColor: `${bc}08` }}
                    >
                      <div className="w-36 h-36 flex items-center justify-center flex-shrink-0 border-2 border-[#1a2a3c] bg-[#080c18]">
                        {imgUrl ? (
                          <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-24 h-24 flex items-center justify-center text-5xl">
                            {getCategoryPlaceholder(item.category)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                        <h1 className="font-pixel text-2xl" style={{ color: tc }}>{item.name}</h1>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <PixelBadge rarity={item.rarity} />
                          <span className="font-pixel text-[12px] px-1.5 py-0.5 border border-[#3a4a6c] text-[#8899aa] bg-[#0a0e1a]">
                            {item.category}
                          </span>
                          {item.slot && (
                            <span className="font-pixel text-[12px] px-1.5 py-0.5 border border-[#3a4a6c] text-[#8899aa] bg-[#0a0e1a]">
                              {item.slot}
                            </span>
                          )}
                          <span
                            className="font-pixel text-[12px] px-1.5 py-0.5 border"
                            style={{
                              borderColor: item.tradeable ? "#40d870" : "#e04040",
                              color: item.tradeable ? "#80ffb0" : "#ff8080",
                              backgroundColor: item.tradeable ? "#40d87010" : "#e0404010",
                            }}
                          >
                            {item.tradeable ? "TRADEABLE" : "UNTRADEABLE"}
                          </span>
                          {item.setName && (
                            <span className="font-pixel text-[12px] px-1.5 py-0.5 border border-[#4080f0] text-[#80b0ff] bg-[#4080f010]">
                              {item.setName}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                      <span className="font-pixel text-[12px] text-[#4a5a6a] flex items-center gap-1">
                        <Coins size={14} className="text-[var(--pet-gold,#f0c040)]" /> GOLD PRICE
                      </span>
                      {item.goldPrice ? (
                        <GoldDisplay amount={item.goldPrice} size="lg" className="mt-1" />
                      ) : (
                        <p className="font-pixel text-sm text-[#4a5a6a] mt-1">N/A</p>
                      )}
                    </div>
                    <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                      <span className="font-pixel text-[12px] text-[#4a5a6a] flex items-center gap-1">
                        <Gem size={18} className="text-[#a855f7]" /> GEM PRICE
                      </span>
                      {item.gemPrice ? (
                        <GoldDisplay amount={item.gemPrice} size="lg" type="gem" className="mt-1" />
                      ) : (
                        <p className="font-pixel text-sm text-[#4a5a6a] mt-1">N/A</p>
                      )}
                    </div>
                    <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                      <span className="font-pixel text-[12px] text-[#4a5a6a] flex items-center gap-1">
                        <Users size={14} /> OWNERS
                      </span>
                      <p className="font-pixel text-base text-[var(--pet-text,#e2e8f0)] mt-1">{data.ownership.count}</p>
                      <p className="font-pixel text-[12px] text-[#4a5a6a]">{data.ownership.tier}</p>
                    </div>
                    <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                      <span className="font-pixel text-[12px] text-[#4a5a6a] flex items-center gap-1">
                        <Package size={14} /> YOUR COLLECTION
                      </span>
                      <p className={`font-pixel text-sm mt-1 ${data.ownership.userOwned > 0 ? "text-[var(--pet-green,#40d870)]" : "text-[#4a5a6a]"}`}>
                        {data.ownership.userOwned > 0 ? `You own x${data.ownership.userOwned}` : "Not owned"}
                      </p>
                    </div>
                  </div>

                  {/* How to Obtain */}
                  <PixelCard className="p-4" corners>
                    <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3 flex items-center gap-2">
                      <ShoppingCart size={18} /> HOW TO OBTAIN
                    </h3>
                    <div className="space-y-2 font-pixel text-[13px]">
                      {(item.goldPrice || item.gemPrice) && (
                        <div className="flex items-center gap-2 text-[var(--pet-text-dim,#8899aa)]">
                          <Coins size={16} className="text-[var(--pet-gold,#f0c040)]" />
                          Buy for {item.goldPrice ? `${item.goldPrice.toLocaleString()} Gold` : ""}{item.goldPrice && item.gemPrice ? " or " : ""}{item.gemPrice ? `${item.gemPrice} Gems` : ""}
                        </div>
                      )}
                      {data.craftedFrom && (
                        <div className="flex items-start gap-2 text-[var(--pet-text-dim,#8899aa)]">
                          <Hammer size={16} className="text-[var(--pet-gold,#f0c040)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span>Craft from: </span>
                            {data.craftedFrom.ingredients.map((ing: any, i: number) => (
                              <span key={i}>
                                <Link
                                  href={`/pet/wiki/${ing.item.id}`}
                                  className="hover:underline"
                                  style={{ color: RARITY_TEXT[ing.item.rarity] || "#a0a8b4" }}
                                >
                                  {ing.item.name}
                                </Link>
                                <span className="text-[#4a5a6a]"> x{ing.quantity}</span>
                                {i < data.craftedFrom.ingredients.length - 1 && ", "}
                              </span>
                            ))}
                            {data.craftedFrom.goldCost > 0 && (
                              <span className="text-[var(--pet-gold,#f0c040)]"> + {data.craftedFrom.goldCost} Gold</span>
                            )}
                          </div>
                        </div>
                      )}
                      {data.dropInfo && (
                        <div className="flex items-center gap-2 text-[var(--pet-text-dim,#8899aa)]">
                          <Droplets size={16} className="text-[#80b0ff]" />
                          Drops from activity. Drop tier: {item.rarity} ({data.dropInfo.dropTierPercent}% of material drops)
                        </div>
                      )}
                      {data.dropInfo && (
                        <div className="flex items-center gap-4 ml-5 text-[12px] text-[#4a5a6a]">
                          <span className="flex items-center gap-1"><Mic size={12} /> {(data.dropInfo.voiceChance * 100).toFixed(0)}% per voice session</span>
                          <span className="flex items-center gap-1"><MessageSquare size={12} /> {(data.dropInfo.textChance * 100).toFixed(0)}% per text session</span>
                        </div>
                      )}
                      {!item.goldPrice && !item.gemPrice && !data.craftedFrom && !data.dropInfo && (
                        <div className="flex items-center gap-2 text-[#4a5a6a]">
                          <Lock size={16} /> Acquisition method unknown
                        </div>
                      )}
                    </div>
                  </PixelCard>

                  {/* Used In Recipes */}
                  {data.usedInRecipes?.length > 0 && (
                    <PixelCard className="p-4" corners>
                      <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3 flex items-center gap-2">
                        <Hammer size={18} /> USED IN RECIPES
                      </h3>
                      <div className="space-y-1">
                        {data.usedInRecipes.map((r: any) => {
                          const resultImg = getItemImageUrl(r.resultItem.assetPath, r.resultItem.category)
                          return (
                            <Link key={r.recipeId} href={`/pet/wiki/${r.resultItem.id}`}>
                              <div className="flex items-center gap-3 px-2 py-1.5 border border-transparent hover:border-[#2a3a5c] hover:bg-[#0c1020] transition-all">
                                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center border border-[#1a2a3c] bg-[#080c18]">
                                  {resultImg ? (
                                    <CroppedItemImage src={resultImg} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <span>{getCategoryPlaceholder(r.resultItem.category)}</span>
                                  )}
                                </div>
                                <span className="font-pixel text-[13px]" style={{ color: RARITY_TEXT[r.resultItem.rarity] || "#a0a8b4" }}>
                                  {r.resultItem.name}
                                </span>
                                <span className="font-pixel text-[12px] text-[#4a5a6a] ml-auto">needs x{r.quantityNeeded}</span>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </PixelCard>
                  )}

                  {/* Enhancement Info (equipment) */}
                  {data.enhancement && (
                    <PixelCard className="p-4" corners>
                      <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3 flex items-center gap-2">
                        <Sparkles size={18} /> ENHANCEMENT INFO
                      </h3>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3">
                          <p className="font-pixel text-lg text-[var(--pet-blue,#4080f0)]">+{data.enhancement.maxLevel}</p>
                          <p className="font-pixel text-[12px] text-[#4a5a6a]">Max Level</p>
                        </div>
                        <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3">
                          <p className="font-pixel text-xl text-[var(--pet-green,#40d870)]">+{(data.enhancement.goldBonusPerLevel * 100).toFixed(0)}%</p>
                          <p className="font-pixel text-[12px] text-[#4a5a6a]">Gold/XP per lvl</p>
                        </div>
                        <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3">
                          <p className="font-pixel text-lg text-[var(--pet-gold,#f0c040)]">+{(data.enhancement.maxGoldBonus * 100).toFixed(0)}%</p>
                          <p className="font-pixel text-[12px] text-[#4a5a6a]">Max Bonus</p>
                        </div>
                      </div>
                      <div className="mt-3 h-3 bg-[#0c1020] overflow-hidden border border-[#1a2a3c]">
                        <div className="h-full bg-gradient-to-r from-[var(--pet-green,#40d870)] to-[var(--pet-blue,#4080f0)]" style={{ width: "100%" }} />
                      </div>
                      <div className="flex justify-between font-pixel text-[12px] text-[#4a5a6a] mt-1">
                        <span>+0</span>
                        <span>+{data.enhancement.maxLevel}</span>
                      </div>
                    </PixelCard>
                  )}

                  {/* Scroll Properties */}
                  {data.scrollProperties && (
                    <PixelCard className="p-4 space-y-4" corners>
                      <h3 className="font-pixel text-xs text-[var(--pet-gold,#f0c040)] flex items-center gap-2">
                        <Shield size={18} /> SCROLL PROPERTIES
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border-2 border-[#40d87040] bg-[#40d87008] p-3 text-center">
                          <p className="font-pixel text-2xl text-[var(--pet-green,#40d870)]">{(data.scrollProperties.success_rate * 100).toFixed(0)}%</p>
                          <p className="font-pixel text-[12px] text-[#4a5a6a]">Base Success Rate</p>
                        </div>
                        <div className="border-2 border-[#e0404040] bg-[#e0404008] p-3 text-center">
                          <p className="font-pixel text-2xl text-[var(--pet-red,#e04040)]">{(data.scrollProperties.destroy_rate * 100).toFixed(0)}%</p>
                          <p className="font-pixel text-[12px] text-[#4a5a6a]">Destroy Rate</p>
                        </div>
                      </div>
                      {data.scrollProperties.target_slot && (
                        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                          Target slot: {data.scrollProperties.target_slot}
                        </p>
                      )}
                      <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3">
                        <h4 className="font-pixel text-[12px] uppercase text-[#4a5a6a] mb-2">SUCCESS RATE BY ENHANCEMENT LEVEL</h4>
                        <SuccessCurveChart scrollProps={data.scrollProperties} gameConstants={data.gameConstants} />
                      </div>
                    </PixelCard>
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
