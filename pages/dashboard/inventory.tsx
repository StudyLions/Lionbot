// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Premium skin shop with try-before-you-buy experience
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Skin shop with static image previews from SkinsList
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  Badge,
  ConfirmModal,
  EmptyState,
  SectionCard,
  toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import Link from "next/link"
import { Palette, Gem, ShoppingBag, Check, ImageOff } from "lucide-react"
import { SKIN_PRESETS, DEFAULT_SKIN } from "@/components/dashboard/ProfileCard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SkinsList } from "@/constants/SkinsList"
import Image from "next/image"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const skinImageMap: Record<string, any> = {}
SkinsList.forEach((s) => { skinImageMap[s.id] = s.image.imageOne })

function getSkinImage(skinId: string) {
  return skinImageMap[skinId] || skinImageMap["obsidian"] || null
}

interface SkinItem {
  id: number
  active: boolean
  acquiredAt: string | null
  expiresAt: string | null
  skinName: string
  baseSkinId: number | null
}

interface GemsData {
  gemBalance: number
}

const SHOP_SKINS = [
  { id: "base", name: "Default", price: 0, description: "The classic LionBot look" },
  { id: "obsidian", name: "Obsidian", price: 1500, description: "Dark and mysterious" },
  { id: "platinum", name: "Platinum", price: 750, description: "Sleek metallic elegance" },
  { id: "boston_blue", name: "Boston Blue", price: 750, description: "Cool ocean vibes" },
  { id: "cotton_candy", name: "Cotton Candy", price: 1500, description: "Sweet pastel colors" },
  { id: "blue_bayoux", name: "Blue Bayoux", price: 1500, description: "Deep twilight tones" },
  { id: "bubblegum", name: "Bubblegum", price: 1500, description: "Bold and playful pink" },
]

function BotRenderedPreview({
  skinId,
  cardType,
  alt,
  className = "",
}: {
  skinId: string
  cardType: string
  alt: string
  className?: string
}) {
  const imgSrc = getSkinImage(skinId)
  if (!imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-muted/30 text-muted-foreground p-8 ${className}`}>
        <ImageOff className="h-8 w-8" />
      </div>
    )
  }
  return (
    <div className={`relative ${className}`}>
      <Image src={imgSrc} alt={alt} width={400} height={400} objectFit="contain" />
    </div>
  )
}

function UserDataPreview({
  skinId,
  cardType,
  guildId,
  alt,
  className = "",
  refreshKey,
}: {
  skinId: string
  cardType: string
  guildId: string
  alt: string
  className?: string
  refreshKey: number
}) {
  const imgSrc = getSkinImage(skinId)
  if (!imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-muted/30 text-muted-foreground p-8 ${className}`}>
        <div className="text-center space-y-2">
          <ImageOff className="h-8 w-8 mx-auto" />
          <p className="text-sm">Preview not available</p>
        </div>
      </div>
    )
  }
  return (
    <div className={`relative ${className}`}>
      <Image src={imgSrc} alt={alt} width={400} height={400} objectFit="contain" />
    </div>
  )
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const { data: invData, error, isLoading: loadingInv, mutate } = useDashboard<{ skins: SkinItem[] }>(
    session ? "/api/dashboard/inventory" : null
  )
  const { data: gemsData } = useDashboard<GemsData>(session ? "/api/dashboard/gems" : null)
  const { data: serversData } = useDashboard<{ servers: { guildId: string; guildName: string }[] }>(
    session ? "/api/dashboard/servers" : null
  )

  const skins = invData?.skins ?? []
  const gems = gemsData?.gemBalance ?? 0
  const firstGuildId = serversData?.servers?.[0]?.guildId ?? ""
  const normalizeSkinId = (name: string) => name?.toLowerCase().replace(/\s+/g, "_") ?? ""
  const ownedSkinIds = new Set(
    skins.map((s) => normalizeSkinId(s.skinName)).filter(Boolean)
  )
  ownedSkinIds.add("base")

  const [confirmItem, setConfirmItem] = useState<SkinItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null)
  const [loadingToggle, setLoadingToggle] = useState(false)
  const [previewSkin, setPreviewSkin] = useState<(typeof SHOP_SKINS)[number] | null>(null)
  const [previewWithMyData, setPreviewWithMyData] = useState(false)
  const [previewTab, setPreviewTab] = useState<"profile" | "stats">("profile")
  const [purchasing, setPurchasing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleToggle = async (item: SkinItem) => {
    setConfirmItem(null)
    setConfirmAction(null)
    setLoadingToggle(true)
    try {
      await dashboardMutate("PATCH", "/api/dashboard/inventory", {
        itemId: item.id,
        active: !item.active,
      })
      toast.success(item.active ? "Skin deactivated" : "Skin equipped")
      mutate()
    } catch {
      toast.error("Error toggling skin")
    } finally {
      setLoadingToggle(false)
    }
  }

  const handleEquipBase = async () => {
    const activeItem = skins.find((s) => s.active)
    if (!activeItem) return
    setLoadingToggle(true)
    try {
      await dashboardMutate("PATCH", "/api/dashboard/inventory", {
        itemId: activeItem.id,
        active: false,
      })
      toast.success("Default skin equipped")
      mutate()
    } catch {
      toast.error("Error switching skin")
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
      invalidate("/api/dashboard/gems")
      invalidate("/api/dashboard/renderer-data")
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  const activeSkin = skins.find((s) => s.active)
  const isBaseEquipped = !activeSkin

  return (
    <Layout SEO={{ title: "Skin Shop - LionBot Dashboard", description: "Premium profile card skins" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 space-y-8">
              <PageHeader
                title="Skin Shop"
                description="Preview real bot-rendered card skins, then purchase with gems."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Inventory" },
                ]}
              />

              {/* Gem balance bar */}
              <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-card border border-border">
                <span className="text-foreground font-medium">
                  Your balance: <span className="text-amber-500">{gems.toLocaleString()} gems</span>
                </span>
                <Link href="/dashboard/gems">
                  <a className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                    <Gem size={14} />
                    Get more
                  </a>
                </Link>
              </div>

              {/* Skin Gallery */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Browse Skins</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SHOP_SKINS.map((shopSkin) => {
                    const owned = ownedSkinIds.has(shopSkin.id)
                    return (
                      <div
                        key={shopSkin.id}
                        className={cn(
                          "bg-card rounded-xl border overflow-hidden transition-all",
                          "hover:border-primary/50 hover:shadow-lg",
                          "border-border"
                        )}
                      >
                        <div className="bg-muted/30 overflow-hidden">
                          <BotRenderedPreview
                            skinId={shopSkin.id}
                            cardType="profile"
                            alt={`${shopSkin.name} profile card preview`}
                            className="w-full"
                          />
                        </div>
                        <div className="p-4 border-t border-border">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="text-foreground font-semibold">{shopSkin.name}</h3>
                            {owned && (
                              <Badge variant="purple">Owned</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {shopSkin.price === 0 ? "Free" : `${shopSkin.price.toLocaleString()} gems`}
                          </p>
                          <Button
                            variant={owned ? "secondary" : "default"}
                            className="w-full"
                            onClick={() => {
                              setPreviewSkin(shopSkin)
                              setPreviewWithMyData(false)
                              setRefreshKey((k) => k + 1)
                            }}
                          >
                            {owned ? (
                              <>
                                <Check size={14} className="mr-2" />
                                Try it
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} className="mr-2" />
                                Try it
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* My Skins section */}
              <SectionCard title="My Skins" defaultOpen={true}>
                {loadingInv ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-muted/30 rounded-xl h-32 animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <p className="text-destructive">{error.message}</p>
                    <Button variant="outline" size="sm" onClick={() => mutate()}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    {/* Base skin (always available) */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        isBaseEquipped ? "border-primary bg-primary/5" : "border-border bg-card/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${DEFAULT_SKIN.primaryColor}, ${DEFAULT_SKIN.secondaryColor})`,
                          }}
                        />
                        <div>
                          <p className="font-medium text-foreground">Default</p>
                          <p className="text-xs text-muted-foreground">Free &bull; Classic look</p>
                        </div>
                      </div>
                      <Button
                        variant={isBaseEquipped ? "secondary" : "outline"}
                        size="sm"
                        onClick={handleEquipBase}
                        disabled={loadingToggle || isBaseEquipped}
                      >
                        {isBaseEquipped ? "Equipped" : "Equip"}
                      </Button>
                    </div>

                    {skins.length === 0 ? (
                      <div className="py-6">
                        <EmptyState
                          icon={<Palette size={48} className="text-muted-foreground" strokeWidth={1} />}
                          title="No premium skins yet"
                          description="Browse the skin shop above and purchase skins with gems."
                          action={{
                            label: "Browse Skins",
                            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
                          }}
                        />
                      </div>
                    ) : (
                      skins.map((item) => {
                        const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date()
                        const isActive = item.active
                        const preset = SKIN_PRESETS[normalizeSkinId(item.skinName)] ?? DEFAULT_SKIN
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl border transition-all",
                              isActive ? "border-primary bg-primary/5" : "border-border bg-card/50",
                              isExpired && "opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`,
                                }}
                              />
                              <div>
                                <p className="font-medium text-foreground">{item.skinName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.acquiredAt
                                    ? `Acquired ${new Date(item.acquiredAt).toLocaleDateString()}`
                                    : "Premium skin"}
                                </p>
                              </div>
                            </div>
                            {!isExpired && (
                              <Button
                                variant={isActive ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setConfirmItem(item)
                                  setConfirmAction(isActive ? "deactivate" : "activate")
                                }}
                                disabled={loadingToggle}
                              >
                                {isActive ? "Equipped" : "Equip"}
                              </Button>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </SectionCard>
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
          title={confirmAction === "deactivate" ? "Deactivate skin?" : "Equip skin?"}
          message={
            confirmAction === "deactivate"
              ? `This will switch to the default skin. You can re-equip "${confirmItem?.skinName}" anytime.`
              : `Equip "${confirmItem?.skinName}" as your profile card skin?`
          }
          confirmLabel={confirmAction === "deactivate" ? "Deactivate" : "Equip"}
          variant={confirmAction === "deactivate" ? "warning" : "info"}
          loading={loadingToggle}
        />

        {/* Full Preview Dialog */}
        <Dialog open={!!previewSkin} onOpenChange={(open) => !open && setPreviewSkin(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {previewSkin && (SHOP_SKINS.find((s) => s.id === previewSkin.id)?.name ?? previewSkin.name)}
              </DialogTitle>
            </DialogHeader>
            {previewSkin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Left: Real bot-rendered card preview with tabs */}
                <div className="space-y-4">
                  <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as "profile" | "stats")}>
                    <TabsList className="w-full">
                      <TabsTrigger value="profile" className="flex-1">
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="stats" className="flex-1">
                        Stats
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-4">
                      <div className="flex justify-center rounded-xl overflow-hidden bg-muted/20">
                        {previewWithMyData && firstGuildId ? (
                          <UserDataPreview
                            skinId={previewSkin.id}
                            cardType="profile"
                            guildId={firstGuildId}
                            alt={`${previewSkin.name} profile card with your data`}
                            className="max-w-full"
                            refreshKey={refreshKey}
                          />
                        ) : (
                          <BotRenderedPreview
                            skinId={previewSkin.id}
                            cardType="profile"
                            alt={`${previewSkin.name} profile card preview`}
                            className="max-w-full"
                          />
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="stats" className="mt-4">
                      <div className="flex justify-center rounded-xl overflow-hidden bg-muted/20">
                        {previewWithMyData && firstGuildId ? (
                          <UserDataPreview
                            skinId={previewSkin.id}
                            cardType="stats"
                            guildId={firstGuildId}
                            alt={`${previewSkin.name} stats card with your data`}
                            className="max-w-full"
                            refreshKey={refreshKey}
                          />
                        ) : (
                          <BotRenderedPreview
                            skinId={previewSkin.id}
                            cardType="stats"
                            alt={`${previewSkin.name} stats card preview`}
                            className="max-w-full"
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <p className="text-xs text-muted-foreground text-center">
                    Real bot-rendered preview — exactly what you see in Discord
                  </p>
                </div>

                {/* Right: Info and purchase */}
                <div className="space-y-6">
                  <div>
                    <p className="text-muted-foreground text-sm">{previewSkin.description}</p>
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {previewSkin.price === 0 ? "Free" : `${previewSkin.price.toLocaleString()} gems`}
                  </div>

                  {firstGuildId && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={previewWithMyData}
                        onChange={(e) => {
                          setPreviewWithMyData(e.target.checked)
                          setRefreshKey((k) => k + 1)
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-muted-foreground">Preview with my data</span>
                    </label>
                  )}

                  <div className="pt-4 border-t border-border">
                    {ownedSkinIds.has(previewSkin.id) ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">You own this skin.</p>
                        {previewSkin.id === "base" ? (
                          <Button
                            variant={isBaseEquipped ? "secondary" : "default"}
                            className="w-full"
                            disabled={isBaseEquipped || loadingToggle}
                            onClick={handleEquipBase}
                          >
                            {isBaseEquipped ? "Equipped" : "Equip"}
                          </Button>
                        ) : (
                          (() => {
                            const invItem = skins.find(
                              (s) => normalizeSkinId(s.skinName) === previewSkin.id
                            )
                            if (!invItem) return <p className="text-sm text-muted-foreground">Owned</p>
                            return (
                              <Button
                                variant={invItem.active ? "secondary" : "default"}
                                className="w-full"
                                disabled={invItem.active || loadingToggle}
                                onClick={() => {
                                  setConfirmItem(invItem)
                                  setConfirmAction("activate")
                                }}
                              >
                                {invItem.active ? "Equipped" : "Equip"}
                              </Button>
                            )
                          })()
                        )}
                      </div>
                    ) : previewSkin.price === 0 ? (
                      <p className="text-sm text-muted-foreground">Default skin is always available.</p>
                    ) : gems >= previewSkin.price ? (
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(previewSkin.id)}
                        disabled={purchasing}
                      >
                        <Gem size={18} className="mr-2" />
                        Buy for {previewSkin.price.toLocaleString()} gems
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-destructive font-medium">
                          Need {(previewSkin.price - gems).toLocaleString()} more gems
                        </p>
                        <Link href="/donate">
                          <a className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                            Get gems
                          </a>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
// --- END AI-MODIFIED ---
