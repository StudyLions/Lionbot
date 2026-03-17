// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: LionHeart supporter dashboard page -- subscription
//          status, perks grid, card effects editor with color
//          presets and live preview, blurred teaser for non-subs.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { PageHeader, Toggle, toast } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useState, useCallback, useEffect } from "react"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { COLOR_PRESETS, DEFAULT_PRESET_ID } from "@/constants/CardEffectPresets"
import {
  SUBSCRIPTION_TIERS,
  TIER_ORDER,
  FREE_TIER,
  type SubscriptionTier,
  type TierConfig,
} from "@/constants/SubscriptionData"
import { cn } from "@/lib/utils"
import {
  Crown,
  Heart,
  Gem,
  Sparkles,
  Zap,
  Shield,
  Sprout,
  Droplets,
  Coins,
  Lock,
  ExternalLink,
  RefreshCw,
  Check,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface SubscriptionData {
  tier: string
  status: string
  tierName: string | null
  tierPrice: number | null
  tierColor: string | null
  monthlyGems: number | null
  gemsPerVote: number | null
  lionCoinBoost: number | null
  lgGoldBoost: number | null
  dropRateBonus: number | null
  farmGrowthSpeed: number | null
  seedCostDiscount: number | null
  harvestGoldBonus: number | null
  uprootRefund: number | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
}

interface CardPreferences {
  effects_enabled: boolean
  sparkle_color: string | null
  ring_color: string | null
}

const PERK_CARDS = [
  { key: "monthlyGems", label: "Monthly Gems", icon: <Gem size={18} />, format: (v: number) => `${v.toLocaleString()} gems/month` },
  { key: "gemsPerVote", label: "Gems per Vote", icon: <Heart size={18} />, format: (v: number) => `${v} gems` },
  { key: "lionCoinBoost", label: "LionCoin Boost", icon: <Coins size={18} />, format: (v: number) => `${v}x multiplier` },
  { key: "lgGoldBoost", label: "LionGotchi Gold", icon: <Coins size={18} />, format: (v: number) => `${v}x bonus` },
  { key: "dropRateBonus", label: "Drop Rate Bonus", icon: <Sparkles size={18} />, format: (v: number) => `+${Math.round(v * 100)}%` },
  { key: "farmGrowthSpeed", label: "Farm Growth", icon: <Sprout size={18} />, format: (v: number) => `${v}x speed` },
  { key: "seedCostDiscount", label: "Seed Discount", icon: <Sprout size={18} />, format: (v: number) => `${Math.round(v * 100)}% off` },
  { key: "harvestGoldBonus", label: "Harvest Bonus", icon: <Droplets size={18} />, format: (v: number) => `+${Math.round(v * 100)}%` },
  { key: "uprootRefund", label: "Uproot Refund", icon: <Shield size={18} />, format: (v: number) => `${Math.round(v * 100)}%` },
]

function ColorSwatch({
  hex,
  name,
  selected,
  disabled,
  onClick,
}: {
  hex: string | null
  name: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
        selected
          ? "bg-primary/15 ring-2 ring-primary"
          : "hover:bg-accent/50",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full border-2 transition-transform",
          selected ? "border-primary scale-110" : "border-border"
        )}
        style={hex ? { backgroundColor: hex } : undefined}
      >
        {!hex && (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">DEF</span>
          </div>
        )}
        {selected && hex && (
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <Check size={14} className="text-white drop-shadow-md" />
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">{name}</span>
    </button>
  )
}

function SubscriptionBanner({ sub }: { sub: SubscriptionData }) {
  const [portalLoading, setPortalLoading] = useState(false)

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const result = await dashboardMutate("POST", "/api/subscription/portal")
      if (result.url) window.open(result.url, "_blank")
    } catch {
      toast.error("Failed to open subscription management")
    }
    setPortalLoading(false)
  }

  if (sub.status === "INACTIVE" || sub.tier === "NONE") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/20 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-pink-500/5" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Crown size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-1">
              Become a LionHeart Supporter
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg">
              Unlock animated profile effects, monthly gems, farm boosts, and much more.
              Support LionBot&apos;s development while getting awesome perks.
            </p>
          </div>
          <Link href="/donate">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25">
              View Plans
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const tierColor = sub.tierColor || "#5B8DEF"
  const renewalDate = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null

  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: `${tierColor}40` }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${tierColor}20` }}
        >
          <Crown size={24} style={{ color: tierColor }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: tierColor }}
            >
              {sub.tierName}
            </span>
            {sub.cancelAtPeriodEnd && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                Cancelling
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {sub.cancelAtPeriodEnd
              ? `Access until ${renewalDate}`
              : renewalDate
                ? `Renews ${renewalDate}`
                : "Active subscription"
            }
            {sub.tierPrice && ` · $${sub.tierPrice}/month`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openPortal}
          disabled={portalLoading}
        >
          <ExternalLink size={14} className="mr-2" />
          {portalLoading ? "Opening..." : "Manage Subscription"}
        </Button>
      </div>
    </div>
  )
}

function PerksGrid({ sub }: { sub: SubscriptionData }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Perks</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PERK_CARDS.map((perk) => {
          const value = (sub as unknown as Record<string, unknown>)[perk.key] as number | null
          if (value == null || value === 0) return null
          return (
            <div key={perk.key} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary/70">{perk.icon}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {perk.label}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">{perk.format(value)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EffectsEditor({
  prefs,
  onPrefsChange,
  onSave,
  saving,
  isSupporter,
  previewUrl,
  onRefreshPreview,
  previewLoading,
}: {
  prefs: CardPreferences
  onPrefsChange: (p: CardPreferences) => void
  onSave: () => void
  saving: boolean
  isSupporter: boolean
  previewUrl: string | null
  onRefreshPreview: () => void
  previewLoading: boolean
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-primary" />
        Profile Card Effects
      </h3>

      <div className="relative">
        {!isSupporter && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
            <Lock size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Supporter Exclusive</p>
            <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
              Animated sparkles, glowing avatar ring, and custom colors on your /me profile card.
            </p>
            <Link href="/donate">
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                Unlock with LionHeart
              </Button>
            </Link>
          </div>
        )}

        <div className={cn(
          "bg-card rounded-2xl border border-border p-6 space-y-6",
          !isSupporter && "pointer-events-none select-none"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Animated Effects</p>
              <p className="text-xs text-muted-foreground">
                Enable sparkles and glowing avatar ring on your /me card
              </p>
            </div>
            <Toggle
              checked={prefs.effects_enabled}
              onChange={(v) => onPrefsChange({ ...prefs, effects_enabled: v })}
              id="effects-toggle"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-3">Sparkle Color</p>
            <div className="flex flex-wrap gap-1">
              <ColorSwatch
                hex={null}
                name="Default"
                selected={prefs.sparkle_color === null}
                disabled={!isSupporter}
                onClick={() => onPrefsChange({ ...prefs, sparkle_color: null })}
              />
              {COLOR_PRESETS.map((preset) => (
                <ColorSwatch
                  key={preset.id}
                  hex={preset.hex}
                  name={preset.name}
                  selected={prefs.sparkle_color === preset.hex}
                  disabled={!isSupporter}
                  onClick={() => onPrefsChange({ ...prefs, sparkle_color: preset.hex })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-3">Avatar Ring Color</p>
            <div className="flex flex-wrap gap-1">
              <ColorSwatch
                hex={null}
                name="Default"
                selected={prefs.ring_color === null}
                disabled={!isSupporter}
                onClick={() => onPrefsChange({ ...prefs, ring_color: null })}
              />
              {COLOR_PRESETS.map((preset) => (
                <ColorSwatch
                  key={preset.id}
                  hex={preset.hex}
                  name={preset.name}
                  selected={prefs.ring_color === preset.hex}
                  disabled={!isSupporter}
                  onClick={() => onPrefsChange({ ...prefs, ring_color: preset.hex })}
                />
              ))}
            </div>
          </div>

          {isSupporter && (
            <div className="flex gap-3">
              <Button onClick={onSave} disabled={saving} size="sm">
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshPreview}
                disabled={previewLoading}
              >
                <RefreshCw size={14} className={cn("mr-2", previewLoading && "animate-spin")} />
                Refresh Preview
              </Button>
            </div>
          )}

          {isSupporter && (
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Live Preview (using your current skin)
              </p>
              <div className="rounded-xl overflow-hidden bg-[#313338] border border-border max-w-[540px]">
                {previewLoading ? (
                  <div className="w-full aspect-[2.17/1] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={24} className="text-muted-foreground animate-spin" />
                      <span className="text-xs text-muted-foreground">Rendering card...</span>
                    </div>
                  </div>
                ) : previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Profile card preview"
                    className="w-full"
                  />
                ) : (
                  <div className="w-full aspect-[2.17/1] flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Click &ldquo;Refresh Preview&rdquo; to generate
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TierComparison({ currentTier }: { currentTier: string }) {
  const tiersToShow = currentTier === "NONE"
    ? TIER_ORDER
    : TIER_ORDER.filter(
        (t) => SUBSCRIPTION_TIERS[t].price > (SUBSCRIPTION_TIERS[currentTier as SubscriptionTier]?.price ?? 0)
      )

  if (tiersToShow.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {currentTier === "NONE" ? "Choose Your Plan" : "Upgrade Your Tier"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiersToShow.map((tierId) => {
          const tier = SUBSCRIPTION_TIERS[tierId]
          return (
            <div
              key={tierId}
              className="bg-card rounded-2xl border border-border p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${tier.color}20` }}
                >
                  <Crown size={16} style={{ color: tier.color }} />
                </div>
                <span className="font-bold text-foreground">{tier.name}</span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                ${tier.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 mt-3 mb-4 flex-1">
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary flex-shrink-0" />
                  {tier.monthlyGems.toLocaleString()} gems/month
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary flex-shrink-0" />
                  {tier.gemsPerVote} gems per vote
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary flex-shrink-0" />
                  {tier.lionCoinBoost}x LionCoin boost
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary flex-shrink-0" />
                  +{Math.round(tier.dropRateBonus * 100)}% drop rates
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary flex-shrink-0" />
                  Animated profile card effects
                </li>
              </ul>
              <Link href="/donate">
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  style={{ borderColor: `${tier.color}40`, color: tier.color }}
                >
                  {currentTier === "NONE" ? "Subscribe" : "Upgrade"}
                </Button>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SupporterPage() {
  const { data: session } = useSession()

  const { data: sub, isLoading: subLoading } = useDashboard<SubscriptionData>(
    session ? "/api/dashboard/subscription" : null
  )
  const { data: prefsData, isLoading: prefsLoading } = useDashboard<CardPreferences>(
    session ? "/api/dashboard/card-preferences" : null
  )

  const [prefs, setPrefs] = useState<CardPreferences>({
    effects_enabled: true,
    sparkle_color: null,
    ring_color: null,
  })
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    if (prefsData) {
      setPrefs(prefsData)
    }
  }, [prefsData])

  const isSupporter = sub?.status === "ACTIVE" && sub?.tier !== "NONE"

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await dashboardMutate("PATCH", "/api/dashboard/card-preferences", prefs)
      toast.success("Preferences saved")
    } catch {
      toast.error("Failed to save preferences")
    }
    setSaving(false)
  }, [prefs])

  const handleRefreshPreview = useCallback(async () => {
    setPreviewLoading(true)
    try {
      const params = new URLSearchParams()
      if (prefs.sparkle_color) params.set("sparkle_color", prefs.sparkle_color)
      if (prefs.ring_color) params.set("ring_color", prefs.ring_color)
      params.set("effects_enabled", String(prefs.effects_enabled))

      const url = `/api/dashboard/supporter-preview?${params}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Render failed")

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return objectUrl
      })
    } catch {
      toast.error("Failed to render preview. The render service may be busy.")
    }
    setPreviewLoading(false)
  }, [prefs])

  const loading = subLoading || prefsLoading

  return (
    <Layout
      SEO={{
        title: "LionHeart - LionBot Dashboard",
        description: "Manage your LionHeart subscription and card effects",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 space-y-8">
              <PageHeader
                title="LionHeart"
                description="Manage your supporter subscription and customize your animated profile card effects."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "LionHeart" },
                ]}
              />

              {loading ? (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl h-24 animate-pulse" />
                  <div className="bg-card rounded-2xl h-64 animate-pulse" />
                  <div className="bg-card rounded-2xl h-80 animate-pulse" />
                </div>
              ) : (
                <>
                  <SubscriptionBanner sub={sub!} />

                  {isSupporter && <PerksGrid sub={sub!} />}

                  <EffectsEditor
                    prefs={prefs}
                    onPrefsChange={setPrefs}
                    onSave={handleSave}
                    saving={saving}
                    isSupporter={!!isSupporter}
                    previewUrl={previewUrl}
                    onRefreshPreview={handleRefreshPreview}
                    previewLoading={previewLoading}
                  />

                  <TierComparison currentTier={sub?.tier ?? "NONE"} />
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
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
