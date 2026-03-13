// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Skin inventory - rebuilt with shared UI
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: design system migration - color classes (bg-background, text-foreground, etc.)
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: add Skin Shop section with preview dialog and buy flow
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { PageHeader, Badge, ConfirmModal, EmptyState, toast } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import Link from "next/link"
import { Palette, Star, Clock, ShoppingBag, Gem } from "lucide-react"
import ProfileCard, { SKIN_PRESETS, type ProfileCardSkin } from "@/components/dashboard/ProfileCard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SkinItem {
  id: number
  active: boolean
  acquiredAt: string | null
  expiresAt: string | null
  skinName: string
  baseSkinId: number | null
}

interface RendererData {
  username: string
  avatarUrl?: string | null
  coins: number
  gems: number
  studyHours: number
  currentRank: string | null
  rankProgress: number
  nextRank: string | null
  achievements: Array<{ id: string; unlocked: boolean }>
  currentStreak: number
  voteCount: number
}

const SHOP_SKINS = [
  { id: "obsidian", price: 1500 },
  { id: "platinum", price: 750 },
  { id: "boston_blue", price: 750 },
  { id: "cotton_candy", price: 1500 },
  { id: "blue_bayoux", price: 1500 },
  { id: "bubblegum", price: 1500 },
] as const

export default function InventoryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: invData, error, isLoading: loading, mutate } = useDashboard<{ skins: SkinItem[] }>(
    session ? "/api/dashboard/inventory" : null
  )
  const { data: rendererData } = useDashboard<RendererData>(
    session ? "/api/dashboard/renderer-data" : null
  )
  const skins = invData?.skins ?? []
  const ownedSkinIds = new Set(skins.map((s) => s.skinName?.toLowerCase()).filter(Boolean))
  // --- END AI-MODIFIED ---
  const [confirmItem, setConfirmItem] = useState<SkinItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null)
  const [loadingToggle, setLoadingToggle] = useState(false)
  const [previewSkin, setPreviewSkin] = useState<typeof SHOP_SKINS[number] | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const handleToggle = async (item: SkinItem) => {
    setConfirmItem(null)
    setConfirmAction(null)
    setLoadingToggle(true)
    try {
      await dashboardMutate("PATCH", "/api/dashboard/inventory", {
        itemId: item.id,
        active: !item.active,
      })
      toast.success(item.active ? "Skin deactivated" : "Skin activated")
      mutate()
    } catch {
      toast.error("Error toggling skin")
    } finally {
      setLoadingToggle(false)
    }
  }

  const handlePurchase = async (skinId: string) => {
    setPurchasing(true)
    try {
      await dashboardMutate("POST", "/api/dashboard/skins/purchase", { skinId })
      toast.success("Skin purchased!")
      setPreviewSkin(null)
      mutate()
      invalidate("/api/dashboard/renderer-data")
    } catch (err: any) {
      toast.error(err.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  const activeSkin = skins.find(s => s.active)
  const gems = rendererData?.gems ?? 0

  return (
    <Layout SEO={{ title: "Inventory - LionBot Dashboard", description: "Your skin collection" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="My Skins"
                description="Your skin collection. Activate a skin to use it on your profile card across servers."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Inventory" },
                ]}
              />

              {/* Skin Shop */}
              <div id="skin-shop" className="mb-10">
                <h2 className="text-lg font-semibold text-foreground mb-4">Skin Shop</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {SHOP_SKINS.map((shopSkin) => {
                    const preset = SKIN_PRESETS[shopSkin.id]
                    const owned = preset ? ownedSkinIds.has(shopSkin.id) : false
                    const skinName = preset?.name ?? shopSkin.id
                    return (
                      <div
                        key={shopSkin.id}
                        className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => setPreviewSkin(shopSkin)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-12 h-12 rounded-lg shrink-0"
                            style={{
                              background: preset
                                ? `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`
                                : "#6366f1",
                            }}
                          />
                          {owned && (
                            <Badge variant="purple">Owned</Badge>
                          )}
                        </div>
                        <h3 className="text-foreground font-medium mb-1">{skinName}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <Gem size={14} className="text-amber-500" />
                          {shopSkin.price.toLocaleString()} gems
                        </p>
                        {!owned && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewSkin(shopSkin)
                            }}
                            className="mt-3 w-full py-2 rounded-xl text-sm font-medium bg-primary text-foreground hover:bg-primary/90 transition-colors"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <h2 className="text-lg font-semibold text-foreground mb-4">My Skins</h2>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card rounded-xl p-6 animate-pulse h-44" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-destructive">{error.message}</p>
                  <button
                    onClick={() => mutate()}
                    className="text-primary hover:text-primary text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : skins.length === 0 ? (
                <div className="bg-card rounded-xl border border-border">
                  <EmptyState
                    icon={<Palette size={48} className="text-muted-foreground" strokeWidth={1} />}
                    title="No skins in your inventory"
                    description="Browse the skin shop or earn gems to unlock custom profile cards."
                    action={{
                      label: "Browse Skins",
                      onClick: () =>
                        document.getElementById("skin-shop")?.scrollIntoView({ behavior: "smooth" }),
                    }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {skins.map((item) => {
                    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date()
                    const isActive = item.active
                    return (
                      <div
                        key={item.id}
                        className={`bg-card rounded-xl p-5 border transition-all ${
                          isActive ? "border-indigo-500 shadow-indigo-500/10" : "border-border"
                        } ${isExpired ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <Palette size={20} className="text-foreground/80" />
                          </div>
                          <div className="flex gap-2">
                            {isActive && <Badge variant="purple">Active</Badge>}
                            {isExpired && <Badge variant="error">Expired</Badge>}
                          </div>
                        </div>

                        <h3 className="text-foreground font-medium mb-1">{item.skinName}</h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          Custom profile card skin
                        </p>

                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-4">
                          {item.acquiredAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(item.acquiredAt).toLocaleDateString()}
                            </span>
                          )}
                          {item.expiresAt && !isExpired && (
                            <span className="flex items-center gap-1">
                              <Star size={12} />
                              Expires {new Date(item.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {!isExpired && (
                          <button
                            onClick={() => {
                              setConfirmItem(item)
                              setConfirmAction(isActive ? "deactivate" : "activate")
                            }}
                            className={`w-full py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                              isActive
                                ? "bg-gray-700 text-foreground/80 hover:bg-gray-600"
                                : "bg-primary text-foreground hover:bg-primary/90"
                            }`}
                          >
                            <ShoppingBag size={14} />
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          open={!!confirmItem && !!confirmAction}
          onConfirm={() => confirmItem && handleToggle(confirmItem)}
          onCancel={() => {
            setConfirmItem(null)
            setConfirmAction(null)
          }}
          title={confirmAction === "deactivate" ? "Deactivate skin?" : "Activate skin?"}
          message={
            confirmAction === "deactivate"
              ? `This will deactivate "${confirmItem?.skinName}". You can reactivate it anytime.`
              : `Activate "${confirmItem?.skinName}" as your profile card skin?`
          }
          confirmLabel={confirmAction === "deactivate" ? "Deactivate" : "Activate"}
          variant={confirmAction === "deactivate" ? "warning" : "info"}
          loading={loadingToggle}
        />

        {/* Skin preview dialog */}
        <Dialog open={!!previewSkin} onOpenChange={(open) => !open && setPreviewSkin(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {previewSkin && (SKIN_PRESETS[previewSkin.id]?.name ?? previewSkin.id)}
              </DialogTitle>
            </DialogHeader>
            {previewSkin && rendererData && (
              <>
                <div className="flex justify-center py-4">
                  <ProfileCard
                    skin={SKIN_PRESETS[previewSkin.id] as ProfileCardSkin}
                    data={{
                      username: rendererData.username,
                      avatarUrl: rendererData.avatarUrl,
                      coins: rendererData.coins,
                      gems: rendererData.gems,
                      studyHours: rendererData.studyHours,
                      currentRank: rendererData.currentRank,
                      rankProgress: rendererData.rankProgress,
                      nextRank: rendererData.nextRank,
                      achievements: rendererData.achievements,
                      currentStreak: rendererData.currentStreak,
                      voteCount: rendererData.voteCount,
                    }}
                  />
                </div>
                {ownedSkinIds.has(previewSkin.id) ? (
                  <p className="text-center text-muted-foreground text-sm">You already own this skin.</p>
                ) : gems >= previewSkin.price ? (
                  <button
                    onClick={() => handlePurchase(previewSkin.id)}
                    disabled={purchasing}
                    className="w-full py-3 rounded-xl font-medium bg-primary text-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Gem size={18} />
                    Buy for {previewSkin.price.toLocaleString()} gems
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-destructive font-medium mb-2">
                      Need {(previewSkin.price - gems).toLocaleString()} more gems
                    </p>
                    <Link href="/donate">
                      <a className="inline-flex items-center gap-2 text-primary hover:underline">
                        Get gems
                      </a>
                    </Link>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </AdminGuard>
    </Layout>
  )
}
