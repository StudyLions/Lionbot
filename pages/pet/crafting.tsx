// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet crafting page - browse recipes, craft items
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Hammer, Coins, Check, X, Loader2 } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface Ingredient {
  item: { id: number; name: string; rarity: string }
  required: number
  owned: number
}

interface Recipe {
  recipeId: number
  resultItem: { id: number; name: string; category: string; rarity: string; description: string }
  resultQuantity: number
  goldCost: number
  description: string
  ingredients: Ingredient[]
  canCraft: boolean
}

interface CraftingData {
  recipes: Recipe[]
  gold: string
}

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-amber-400",
  MYTHICAL: "text-rose-400",
}

const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-500/20",
  UNCOMMON: "border-green-500/20",
  RARE: "border-blue-500/20",
  EPIC: "border-purple-500/20",
  LEGENDARY: "border-amber-500/20",
  MYTHICAL: "border-rose-500/20",
}

export default function CraftingPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<CraftingData>(
    session ? "/api/pet/crafting" : null
  )
  const [crafting, setCrafting] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  async function handleCraft(recipeId: number) {
    setCrafting(recipeId)
    setMessage(null)
    try {
      const res = await fetch("/api/pet/crafting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ text: body.error || "Craft failed", type: "error" })
      } else {
        setMessage({
          text: `Crafted ${body.quantity}x ${body.craftedItem}!`,
          type: "success",
        })
        mutate()
        invalidate("/api/pet/inventory?filter=equipment")
        invalidate("/api/pet/inventory?filter=materials")
        invalidate("/api/pet/inventory?filter=scrolls")
        invalidate("/api/pet/overview")
      }
    } catch {
      setMessage({ text: "Network error", type: "error" })
    } finally {
      setCrafting(null)
    }
  }

  return (
    <Layout SEO={{ title: "Crafting - LionGotchi", description: "Craft items from materials" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Hammer size={24} className="text-orange-400" />
                  Crafting
                </h1>
                <p className="text-sm text-muted-foreground">
                  Combine materials to create scrolls and equipment
                  {data && <span className="ml-2">&middot; <Coins size={12} className="inline text-amber-400" /> {Number(data.gold).toLocaleString()} Gold</span>}
                </p>
              </div>

              {message && (
                <div className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium",
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                  {message.text}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{(error as Error).message}</p>
                </div>
              ) : !data?.recipes.length ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No recipes available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recipes.map((recipe) => (
                    <Card key={recipe.recipeId} className={cn("border", rarityBorder[recipe.resultItem.rarity] ?? "border-border")}>
                      <CardContent className="pt-5 pb-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className={cn("text-base font-semibold", rarityColor[recipe.resultItem.rarity] ?? "text-foreground")}>
                              {recipe.resultItem.name}
                              {recipe.resultQuantity > 1 && <span className="text-muted-foreground ml-1">x{recipe.resultQuantity}</span>}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {recipe.resultItem.rarity} {recipe.resultItem.category}
                              {recipe.description && <span> &middot; {recipe.description}</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCraft(recipe.recipeId)}
                            disabled={!recipe.canCraft || crafting !== null}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0",
                              recipe.canCraft
                                ? "bg-primary hover:bg-primary/90 text-foreground"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                          >
                            {crafting === recipe.recipeId ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Hammer size={14} />
                            )}
                            Craft
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                            Ingredients
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {recipe.ingredients.map((ing) => {
                              const hasEnough = ing.owned >= ing.required
                              return (
                                <div
                                  key={ing.item.id}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
                                    hasEnough ? "bg-emerald-500/5" : "bg-red-500/5"
                                  )}
                                >
                                  {hasEnough ? (
                                    <Check size={12} className="text-emerald-400 flex-shrink-0" />
                                  ) : (
                                    <X size={12} className="text-red-400 flex-shrink-0" />
                                  )}
                                  <span className={cn("truncate", rarityColor[ing.item.rarity] ?? "text-foreground")}>
                                    {ing.item.name}
                                  </span>
                                  <span className={cn(
                                    "ml-auto flex-shrink-0 font-mono text-xs",
                                    hasEnough ? "text-emerald-400" : "text-red-400"
                                  )}>
                                    {ing.owned}/{ing.required}
                                  </span>
                                </div>
                              )
                            })}
                            {recipe.goldCost > 0 && (
                              <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
                                Number(data.gold) >= recipe.goldCost ? "bg-emerald-500/5" : "bg-red-500/5"
                              )}>
                                <Coins size={12} className="text-amber-400 flex-shrink-0" />
                                <span className="text-amber-400">Gold</span>
                                <span className={cn(
                                  "ml-auto flex-shrink-0 font-mono text-xs",
                                  Number(data.gold) >= recipe.goldCost ? "text-emerald-400" : "text-red-400"
                                )}>
                                  {Number(data.gold).toLocaleString()}/{recipe.goldCost.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
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
