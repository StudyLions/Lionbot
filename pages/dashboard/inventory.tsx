// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Full rewrite of Skin Shop with live bot-rendered
//          previews, card type tabs, comparison view, fullscreen,
//          "preview with my data", and enhanced inventory.
// ============================================================
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
import { useState, useCallback, useRef, useEffect } from "react"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import Link from "next/link"
import {
  Gem,
  ShoppingBag,
  Check,
  Loader2,
  AlertTriangle,
  Maximize2,
  X,
  User,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Target,
  Trophy,
  Eye,
  ChevronDown,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { SKIN_CATALOG, SKIN_MAP, type SkinDef } from "@/constants/SkinCatalog"

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

const CARD_TYPES = [
  { id: "profile", label: "Profile", icon: User },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "weekly_stats", label: "Weekly", icon: CalendarDays },
  { id: "monthly_stats", label: "Monthly", icon: CalendarRange },
  { id: "weekly_goals", label: "Goals", icon: Target },
  { id: "monthly_goals", label: "Monthly Goals", icon: Target },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
] as const

type CardType = typeof CARD_TYPES[number]["id"]

function buildPreviewUrl(skinId: string, cardType: string, mode: "sample" | "user" = "sample", guildId?: string) {
  const params = new URLSearchParams({ skin: skinId, type: cardType })
  if (mode === "user" && guildId) {
    params.set("mode", "user")
    params.set("guildid", guildId)
  }
  return `/api/dashboard/skin-preview?${params}`
}

function SkinPreviewImage({
  skinId,
  cardType,
  mode = "sample",
  guildId,
  className = "",
  onLoad,
  onError,
}: {
  skinId: string
  cardType: string
  mode?: "sample" | "user"
  guildId?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const url = buildPreviewUrl(skinId, cardType, mode, guildId)

  useEffect(() => {
    setLoading(true)
    setError(false)
  }, [url])

  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/20 text-muted-foreground min-h-[120px]", className)}>
        <AlertTriangle size={20} className="opacity-40" />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={url}
        alt=""
        className="w-full h-auto rounded-lg"
        onLoad={() => { setLoading(false); onLoad?.() }}
        onError={() => { setLoading(false); setError(true); onError?.() }}
      />
    </div>
  )
}

function DetailPreview({
  skinId,
  cardType,
  mode,
  guildId,
}: {
  skinId: string
  cardType: string
  mode: "sample" | "user"
  guildId?: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPreview = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(false)

    try {
      const apiUrl = buildPreviewUrl(skinId, cardType, mode, guildId)
      const resp = await fetch(apiUrl, { signal: controller.signal })
      if (!resp.ok) throw new Error()
      const blob = await resp.blob()
      const objUrl = URL.createObjectURL(blob)
      setUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return objUrl })
      setLoading(false)
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(true)
        setLoading(false)
      }
    }
  }, [skinId, cardType, mode, guildId])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(fetchPreview, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [fetchPreview])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return (
    <div className="relative flex items-center justify-center min-h-[200px] bg-gray-950/40 rounded-xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/30 backdrop-blur-sm z-10 rounded-xl">
          <Loader2 size={24} className="text-primary animate-spin" />
        </div>
      )}
      {error && !loading && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground py-12">
          <AlertTriangle size={24} />
          <p className="text-sm">Preview unavailable</p>
          <button onClick={fetchPreview} className="text-xs text-primary hover:underline mt-1">Retry</button>
        </div>
      )}
      {url && !error && (
        <img src={url} alt="Skin preview" className="max-w-full" style={{ maxHeight: 600 }} />
      )}
      {!url && !error && !loading && (
        <div className="py-12 text-muted-foreground text-sm">Loading preview...</div>
      )}
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
  const servers = serversData?.servers ?? []
  const normalizeSkinId = (name: string) => name?.toLowerCase().replace(/\s+/g, "_") ?? ""
  const ownedSkinIds = new Set(skins.map((s) => normalizeSkinId(s.skinName)).filter(Boolean))
  ownedSkinIds.add("original")

  const [selectedSkin, setSelectedSkin] = useState<SkinDef | null>(null)
  const [activeCard, setActiveCard] = useState<CardType>("profile")
  const [previewMode, setPreviewMode] = useState<"sample" | "user">("sample")
  const [selectedGuild, setSelectedGuild] = useState("")
  const [compareMode, setCompareMode] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [loadingToggle, setLoadingToggle] = useState(false)
  const [confirmItem, setConfirmItem] = useState<SkinItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null)

  useEffect(() => {
    if (servers.length > 0 && !selectedGuild) setSelectedGuild(servers[0].guildId)
  }, [servers])

  const activeSkin = skins.find((s) => s.active)
  const isBaseEquipped = !activeSkin
  const equippedSkinName = activeSkin ? normalizeSkinId(activeSkin.skinName) : "original"
  const equippedCatalog = SKIN_MAP.get(equippedSkinName)

  const handleToggle = async (item: SkinItem) => {
    setConfirmItem(null)
    setConfirmAction(null)
    setLoadingToggle(true)
    try {
      await dashboardMutate("PATCH", "/api/dashboard/inventory", {
        itemId: item.id,
        active: !item.active,
      })
      toast.success(item.active ? "Skin deactivated" : "Skin equipped!")
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
      mutate()
      invalidate("/api/dashboard/gems")
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  const openDetail = (skin: SkinDef) => {
    setSelectedSkin(skin)
    setActiveCard("profile")
    setCompareMode(false)
    setPreviewMode("sample")
  }

  return (
    <Layout SEO={{ title: "Skin Shop - LionBot Dashboard", description: "Premium profile card skins" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 space-y-8">
              <PageHeader
                title="Skin Shop"
                description="Preview real bot-rendered card skins across all card types, then purchase with gems."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Skins" },
                ]}
              />

              {/* Top bar: gems + equipped skin */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 px-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-foreground font-medium">
                    Your balance: <span className="text-amber-400 font-semibold">{gems.toLocaleString()} gems</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Wearing: <span className="text-foreground font-medium">{equippedCatalog?.name || "Default"}</span>
                  </span>
                </div>
                <Link href="/dashboard/gems">
                  <a className="text-sm text-primary hover:underline font-medium flex items-center gap-1.5 whitespace-nowrap">
                    <Gem size={14} />
                    Get more gems
                  </a>
                </Link>
              </div>

              {/* ============ SKIN DETAIL PANEL ============ */}
              {selectedSkin && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                  {/* Detail header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {selectedSkin.colors.slice(0, 4).map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground">{selectedSkin.name}</h2>
                        <p className="text-xs text-muted-foreground">{selectedSkin.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSkin(null)}
                      className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Card type tabs */}
                  <div className="px-5 pt-4">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin bg-muted/30 rounded-xl p-1">
                      {CARD_TYPES.map((ct) => {
                        const Icon = ct.icon
                        return (
                          <button
                            key={ct.id}
                            onClick={() => setActiveCard(ct.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                              activeCard === ct.id
                                ? "bg-background text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon size={13} />
                            {ct.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Controls row */}
                  <div className="px-5 pt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        compareMode
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                          : "bg-muted/30 border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ArrowLeftRight size={13} />
                      Compare
                    </button>

                    {servers.length > 0 && (
                      <button
                        onClick={() => setPreviewMode(previewMode === "sample" ? "user" : "sample")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          previewMode === "user"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-muted/30 border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Eye size={13} />
                        My Data
                      </button>
                    )}

                    {previewMode === "user" && servers.length > 1 && (
                      <select
                        value={selectedGuild}
                        onChange={(e) => setSelectedGuild(e.target.value)}
                        className="text-xs bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-foreground"
                      >
                        {servers.map((s) => (
                          <option key={s.guildId} value={s.guildId}>{s.guildName}</option>
                        ))}
                      </select>
                    )}

                    <button
                      onClick={() => setFullscreen(true)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
                    >
                      <Maximize2 size={13} />
                      Fullscreen
                    </button>
                  </div>

                  {/* Preview area */}
                  <div className="p-5">
                    {compareMode ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 text-center font-medium">Default</p>
                          <DetailPreview
                            skinId="original"
                            cardType={activeCard}
                            mode={previewMode}
                            guildId={previewMode === "user" ? selectedGuild : undefined}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 text-center font-medium">{selectedSkin.name}</p>
                          <DetailPreview
                            skinId={selectedSkin.id}
                            cardType={activeCard}
                            mode={previewMode}
                            guildId={previewMode === "user" ? selectedGuild : undefined}
                          />
                        </div>
                      </div>
                    ) : (
                      <DetailPreview
                        skinId={selectedSkin.id}
                        cardType={activeCard}
                        mode={previewMode}
                        guildId={previewMode === "user" ? selectedGuild : undefined}
                      />
                    )}
                  </div>

                  {/* Action footer */}
                  <div className="px-5 pb-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        {selectedSkin.colors.slice(0, 4).map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-md border border-white/10 shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">Color palette</span>
                      </div>
                      <div className="flex-1" />
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          {selectedSkin.price === 0 ? "Free" : `${selectedSkin.price.toLocaleString()} gems`}
                        </span>
                        {renderActionButton(selectedSkin)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ SHOP GRID ============ */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  Browse Skins
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {SKIN_CATALOG.map((shopSkin) => {
                    const owned = ownedSkinIds.has(shopSkin.id)
                    const equipped = equippedSkinName === shopSkin.id
                    const isSelected = selectedSkin?.id === shopSkin.id
                    return (
                      <button
                        key={shopSkin.id}
                        onClick={() => openDetail(shopSkin)}
                        className={cn(
                          "bg-card rounded-xl border overflow-hidden transition-all text-left group",
                          isSelected
                            ? "border-primary ring-2 ring-primary/20 shadow-lg"
                            : "border-border hover:border-primary/40 hover:shadow-md"
                        )}
                      >
                        {/* Live preview thumbnail */}
                        <div className="relative bg-gray-950/30 overflow-hidden">
                          <SkinPreviewImage
                            skinId={shopSkin.id}
                            cardType="profile"
                            className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          {/* Color strip at top */}
                          <div className="absolute top-0 left-0 right-0 h-1 flex">
                            {shopSkin.colors.map((c, i) => (
                              <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          {/* Status badges */}
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            {equipped && (
                              <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                EQUIPPED
                              </span>
                            )}
                            {owned && !equipped && (
                              <span className="bg-emerald-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                OWNED
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 border-t border-border">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-foreground font-semibold text-sm">{shopSkin.name}</h3>
                            <span className="text-xs text-muted-foreground font-medium">
                              {shopSkin.price === 0 ? "Free" : `${shopSkin.price.toLocaleString()} gems`}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ============ MY SKINS ============ */}
              <SectionCard title="My Skins" defaultOpen={true}>
                {loadingInv ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-muted/30 rounded-xl h-20 animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <p className="text-destructive">{error.message}</p>
                    <Button variant="outline" size="sm" onClick={() => mutate()}>Retry</Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4">
                    {/* Default skin */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        isBaseEquipped ? "border-primary bg-primary/5" : "border-border bg-card/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                          {SKIN_CATALOG[0].colors.slice(0, 2).map((c, i) => (
                            <div key={i} className="w-5 h-10 first:rounded-l-lg last:rounded-r-lg" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">Default</p>
                            {isBaseEquipped && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                          </div>
                          <p className="text-xs text-muted-foreground">Free</p>
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
                          icon={<ShoppingBag size={40} className="text-muted-foreground" strokeWidth={1} />}
                          title="No premium skins yet"
                          description="Browse the shop above and purchase skins with gems."
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
                        const skinKey = normalizeSkinId(item.skinName)
                        const catalog = SKIN_MAP.get(skinKey)
                        const colors = catalog?.colors || ["#5865f2", "#2b2d31"]
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
                              <div className="flex gap-0.5">
                                {colors.slice(0, 2).map((c, i) => (
                                  <div key={i} className="w-5 h-10 first:rounded-l-lg last:rounded-r-lg" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">{catalog?.name || item.skinName}</p>
                                  {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {item.acquiredAt
                                    ? `Acquired ${new Date(item.acquiredAt).toLocaleDateString()}`
                                    : "Premium skin"}
                                </p>
                              </div>
                            </div>
                            {!isExpired && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    const cat = SKIN_MAP.get(skinKey)
                                    if (cat) openDetail(cat)
                                  }}
                                >
                                  Preview
                                </Button>
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
                              </div>
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

        {/* Confirm equip/deactivate modal */}
        <ConfirmModal
          open={!!confirmItem && !!confirmAction}
          onConfirm={() => confirmItem && handleToggle(confirmItem)}
          onCancel={() => { setConfirmItem(null); setConfirmAction(null) }}
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

        {/* Fullscreen overlay */}
        {fullscreen && selectedSkin && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              {/* Card type tabs in fullscreen */}
              <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1 bg-white/5 rounded-xl p-1">
                {CARD_TYPES.map((ct) => {
                  const Icon = ct.icon
                  return (
                    <button
                      key={ct.id}
                      onClick={() => setActiveCard(ct.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeCard === ct.id
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-white/50 hover:text-white/80"
                      )}
                    >
                      <Icon size={13} />
                      {ct.label}
                    </button>
                  )
                })}
              </div>
              {compareMode ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-xs text-center mb-2">Default</p>
                    <DetailPreview
                      skinId="original"
                      cardType={activeCard}
                      mode={previewMode}
                      guildId={previewMode === "user" ? selectedGuild : undefined}
                    />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs text-center mb-2">{selectedSkin.name}</p>
                    <DetailPreview
                      skinId={selectedSkin.id}
                      cardType={activeCard}
                      mode={previewMode}
                      guildId={previewMode === "user" ? selectedGuild : undefined}
                    />
                  </div>
                </div>
              ) : (
                <DetailPreview
                  skinId={selectedSkin.id}
                  cardType={activeCard}
                  mode={previewMode}
                  guildId={previewMode === "user" ? selectedGuild : undefined}
                />
              )}
            </div>
          </div>
        )}
      </AdminGuard>
    </Layout>
  )

  function renderActionButton(skin: SkinDef) {
    const owned = ownedSkinIds.has(skin.id)
    if (skin.id === "original") {
      return (
        <Button
          variant={isBaseEquipped ? "secondary" : "default"}
          size="sm"
          disabled={isBaseEquipped || loadingToggle}
          onClick={handleEquipBase}
        >
          {isBaseEquipped ? "Equipped" : "Equip"}
        </Button>
      )
    }
    if (owned) {
      const invItem = skins.find((s) => normalizeSkinId(s.skinName) === skin.id)
      if (!invItem) return <Badge variant="purple">Owned</Badge>
      return (
        <Button
          variant={invItem.active ? "secondary" : "default"}
          size="sm"
          disabled={invItem.active || loadingToggle}
          onClick={() => {
            setConfirmItem(invItem)
            setConfirmAction("activate")
          }}
        >
          {invItem.active ? "Equipped" : "Equip"}
        </Button>
      )
    }
    if (gems >= skin.price) {
      return (
        <Button
          size="sm"
          onClick={() => handlePurchase(skin.id)}
          disabled={purchasing}
          className="gap-1.5"
        >
          <Gem size={14} />
          Buy for {skin.price.toLocaleString()}
        </Button>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-destructive font-medium">
          Need {(skin.price - gems).toLocaleString()} more
        </span>
        <Link href="/dashboard/gems">
          <a className="text-xs text-primary hover:underline font-medium">Get gems</a>
        </Link>
      </div>
    )
  }
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
