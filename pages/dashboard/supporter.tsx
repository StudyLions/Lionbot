// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Modified: 2026-03-20
// Purpose: LionHeart supporter dashboard page -- subscription
//          status, perks grid, and full-featured card effects
//          customization studio with per-effect toggles, color
//          pickers, particle styles, intensity, speed, border
//          styles, bio text, seasonal effects, and live preview.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { PageHeader, Toggle, toast } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useState, useCallback, useEffect, useRef } from "react"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import {
  COLOR_PRESETS,
  PARTICLE_STYLES,
  EFFECT_INTENSITIES,
  ANIMATION_SPEEDS,
  BORDER_STYLES,
} from "@/constants/CardEffectPresets"
import {
  SUBSCRIPTION_TIERS,
  TIER_ORDER,
  FREE_TIER,
  type SubscriptionTier,
} from "@/constants/SubscriptionData"
import { cn } from "@/lib/utils"
import {
  Crown,
  Heart,
  Gem,
  Sparkles,
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
  Timer,
  Palette,
  ImageOff,
  Zap,
  CircleDot,
  Frame,
  Type,
  Snowflake,
  Gauge,
} from "lucide-react"
import { HexColorPicker } from "react-colorful"
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
  sparkles_enabled: boolean
  ring_enabled: boolean
  edge_glow_enabled: boolean
  particles_enabled: boolean
  effect_intensity: string
  edge_glow_color: string | null
  particle_color: string | null
  particle_style: string
  animation_speed: string
  username_color: string | null
  bio_text: string | null
  border_style: string
  seasonal_effects: boolean
  embed_color: string | null
}

interface TimerPreferences {
  theme: string
  custom_accent_color: string | null
  focus_label: string | null
  break_label: string | null
  session_label: string | null
}

const DEFAULT_PREFS: CardPreferences = {
  effects_enabled: true,
  sparkle_color: null,
  ring_color: null,
  sparkles_enabled: true,
  ring_enabled: true,
  edge_glow_enabled: true,
  particles_enabled: true,
  effect_intensity: "normal",
  edge_glow_color: null,
  particle_color: null,
  particle_style: "stars",
  animation_speed: "normal",
  username_color: null,
  bio_text: null,
  border_style: "clean",
  seasonal_effects: false,
  embed_color: null,
}

const DEFAULT_TIMER_PREFS: TimerPreferences = {
  theme: "classic",
  custom_accent_color: null,
  focus_label: null,
  break_label: null,
  session_label: null,
}

const PERK_CARDS = [
  { key: "monthlyGems", label: "Monthly Gems", icon: <Gem size={18} />, format: (v: number) => `${v.toLocaleString()} gems/month`, freeValue: 0 },
  { key: "gemsPerVote", label: "Gems per Vote", icon: <Heart size={18} />, format: (v: number) => `${v} gems`, freeValue: FREE_TIER.gemsPerVote },
  { key: "lionCoinBoost", label: "LionCoin Boost", icon: <Coins size={18} />, format: (v: number) => `${v}x multiplier`, freeValue: FREE_TIER.lionCoinBoost },
  { key: "lgGoldBoost", label: "LionGotchi Gold", icon: <Coins size={18} />, format: (v: number) => `${v}x bonus`, freeValue: FREE_TIER.lgGoldBoost },
  { key: "dropRateBonus", label: "Drop Rate Bonus", icon: <Sparkles size={18} />, format: (v: number) => `+${Math.round(v * 100)}%`, freeValue: FREE_TIER.dropRateBonus },
  { key: "farmGrowthSpeed", label: "Farm Growth", icon: <Sprout size={18} />, format: (v: number) => `${v}x speed`, freeValue: FREE_TIER.farmGrowthSpeed },
  { key: "seedCostDiscount", label: "Seed Discount", icon: <Sprout size={18} />, format: (v: number) => `${Math.round(v * 100)}% off`, freeValue: FREE_TIER.seedCostDiscount },
  { key: "harvestGoldBonus", label: "Harvest Bonus", icon: <Droplets size={18} />, format: (v: number) => `+${Math.round(v * 100)}%`, freeValue: FREE_TIER.harvestGoldBonus },
  { key: "uprootRefund", label: "Uproot Refund", icon: <Shield size={18} />, format: (v: number) => `${Math.round(v * 100)}%`, freeValue: FREE_TIER.uprootRefund },
]

function ColorPickerPopover({
  color,
  onChange,
  disabled,
}: {
  color: string | null
  onChange: (color: string | null) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [tempColor, setTempColor] = useState(color || "#5B8DEF")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (color) setTempColor(color)
  }, [color])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "w-7 h-7 rounded-full border-2 border-border hover:border-primary/50 transition-all",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        style={{ backgroundColor: color || "#5B8DEF" }}
        title="Open color picker"
      />
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-card border border-border rounded-xl p-3 shadow-xl">
          <HexColorPicker color={tempColor} onChange={setTempColor} />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={tempColor}
              onChange={(e) => setTempColor(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs text-foreground font-mono"
              maxLength={7}
            />
            <Button
              size="sm"
              className="text-xs h-7"
              onClick={() => { onChange(tempColor); setOpen(false) }}
            >
              Apply
            </Button>
          </div>
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className="text-[10px] text-muted-foreground hover:text-foreground mt-1 block"
          >
            Reset to Default
          </button>
        </div>
      )}
    </div>
  )
}

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
        "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all",
        selected
          ? "bg-primary/15 ring-2 ring-primary"
          : "hover:bg-accent/50",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full border-2 transition-transform",
          selected ? "border-primary scale-110" : "border-border"
        )}
        style={hex ? { backgroundColor: hex } : undefined}
      >
        {!hex && (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">DEF</span>
          </div>
        )}
        {selected && hex && (
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <Check size={12} className="text-white drop-shadow-md" />
          </div>
        )}
      </div>
      <span className="text-[9px] text-muted-foreground truncate max-w-[50px]">{name}</span>
    </button>
  )
}

function ColorSection({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string | null
  onChange: (v: string | null) => void
  disabled?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <ColorPickerPopover color={value} onChange={onChange} disabled={disabled} />
      </div>
      <div className="flex flex-wrap gap-0.5">
        <ColorSwatch
          hex={null}
          name="Default"
          selected={value === null}
          disabled={disabled}
          onClick={() => onChange(null)}
        />
        {COLOR_PRESETS.map((preset) => (
          <ColorSwatch
            key={preset.id}
            hex={preset.hex}
            name={preset.name}
            selected={value === preset.hex}
            disabled={disabled}
            onClick={() => onChange(preset.hex)}
          />
        ))}
      </div>
    </div>
  )
}

function OptionSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  renderOption,
}: {
  label: string
  options: readonly { id: T; name: string; icon?: string }[]
  value: T
  onChange: (v: T) => void
  disabled?: boolean
  renderOption?: (opt: { id: T; name: string; icon?: string }, selected: boolean) => React.ReactNode
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.id
          if (renderOption) return <div key={opt.id}>{renderOption(opt, selected)}</div>
          return (
            <button
              key={opt.id}
              onClick={() => !disabled && onChange(opt.id)}
              disabled={disabled}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                selected
                  ? "bg-primary/15 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
              {opt.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SubscriptionBanner({ sub }: { sub: SubscriptionData }) {
  const [portalLoading, setPortalLoading] = useState(false)

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const result = await dashboardMutate("POST", "/api/subscription/portal")
      if (result.url) window.open(result.url, "_blank")
    } catch (e: unknown) {
      const msg = (e as Error)?.message || "Failed to open subscription management"
      if (msg.includes("test mode")) {
        toast.error("Subscription management is only available in production.")
      } else {
        toast.error(msg)
      }
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
  const tierConfig = sub.tier in SUBSCRIPTION_TIERS
    ? SUBSCRIPTION_TIERS[sub.tier as SubscriptionTier]
    : null

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Perks</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PERK_CARDS.map((perk) => {
          const value = (sub as unknown as Record<string, unknown>)[perk.key] as number | null
          if (value == null || value === 0) return null
          const isUpgraded = perk.freeValue !== undefined && value > perk.freeValue
          return (
            <div key={perk.key} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary/70">{perk.icon}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {perk.label}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">{perk.format(value)}</p>
              {isUpgraded && perk.freeValue > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Free: {perk.format(perk.freeValue)}
                </p>
              )}
            </div>
          )
        })}
        {tierConfig && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary/70"><Timer size={18} /></span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Timer Themes
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">{tierConfig.timerThemes} unlocked</p>
          </div>
        )}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary/70"><Palette size={18} /></span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Card Effects
            </span>
          </div>
          <p className="text-lg font-bold text-foreground">Full Studio</p>
          <p className="text-[10px] text-muted-foreground mt-1">Sparkles, glow, particles, borders &amp; more</p>
        </div>
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
  previewError,
  onRefreshPreview,
  previewLoading,
}: {
  prefs: CardPreferences
  onPrefsChange: (p: CardPreferences) => void
  onSave: () => void
  saving: boolean
  isSupporter: boolean
  previewUrl: string | null
  previewError: string | null
  onRefreshPreview: () => void
  previewLoading: boolean
}) {
  const disabled = !isSupporter

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-primary" />
        Profile Card Effects Studio
      </h3>

      <div className="relative">
        {!isSupporter && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
            <Lock size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Supporter Exclusive</p>
            <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
              Animated sparkles, glowing effects, custom particles, border styles, and more for your profile card.
            </p>
            <Link href="/donate">
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                Unlock with LionHeart
              </Button>
            </Link>
          </div>
        )}

        <div className={cn(
          "bg-card rounded-2xl border border-border p-6 space-y-8",
          !isSupporter && "pointer-events-none select-none"
        )}>
          {/* Master Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Animated Effects</p>
              <p className="text-xs text-muted-foreground">
                Master toggle for all card animation effects
              </p>
            </div>
            <Toggle
              checked={prefs.effects_enabled}
              onChange={(v) => onPrefsChange({ ...prefs, effects_enabled: v })}
              id="effects-toggle"
            />
          </div>

          {/* Effect Toggles */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              Individual Effects
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                { key: "sparkles_enabled" as const, label: "Sparkles", desc: "Twinkling star particles" },
                { key: "ring_enabled" as const, label: "Avatar Ring", desc: "Pulsing avatar border" },
                { key: "edge_glow_enabled" as const, label: "Edge Glow", desc: "Card border glow" },
                { key: "particles_enabled" as const, label: "Rising Particles", desc: "Floating particles" },
              ]).map(({ key, label, desc }) => (
                <div
                  key={key}
                  className={cn(
                    "rounded-xl border p-3 transition-all cursor-pointer",
                    prefs[key]
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card hover:border-primary/20"
                  )}
                  onClick={() => !disabled && onPrefsChange({ ...prefs, [key]: !prefs[key] })}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
                      prefs[key] ? "border-primary bg-primary" : "border-border"
                    )}>
                      {prefs[key] && <Check size={10} className="text-white" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Palette size={14} className="text-primary" />
              Colors
            </p>
            <p className="text-[10px] text-muted-foreground mb-4">
              Pick a preset or click the circle on the right to open a full color picker with any hex color.
            </p>
            <div className="space-y-5">
              <ColorSection
                label="Sparkle Color"
                value={prefs.sparkle_color}
                onChange={(v) => onPrefsChange({ ...prefs, sparkle_color: v })}
                disabled={disabled}
              />
              <ColorSection
                label="Avatar Ring Color"
                value={prefs.ring_color}
                onChange={(v) => onPrefsChange({ ...prefs, ring_color: v })}
                disabled={disabled}
              />
              <ColorSection
                label="Edge Glow Color"
                value={prefs.edge_glow_color}
                onChange={(v) => onPrefsChange({ ...prefs, edge_glow_color: v })}
                disabled={disabled}
              />
              <ColorSection
                label="Rising Particle Color"
                value={prefs.particle_color}
                onChange={(v) => onPrefsChange({ ...prefs, particle_color: v })}
                disabled={disabled}
              />
              <ColorSection
                label="Username Color"
                value={prefs.username_color}
                onChange={(v) => onPrefsChange({ ...prefs, username_color: v })}
                disabled={disabled}
              />
              <ColorSection
                label="Embed Accent Color"
                value={prefs.embed_color}
                onChange={(v) => onPrefsChange({ ...prefs, embed_color: v })}
                disabled={disabled}
              />
              <p className="text-[10px] text-muted-foreground -mt-3">
                Custom color for bot embeds (reminders, study summaries, etc.)
              </p>
            </div>
          </div>

          {/* Style & Motion */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <CircleDot size={14} className="text-primary" />
              Style &amp; Motion
            </p>
            <div className="space-y-5">
              <OptionSelector
                label="Particle Style"
                options={PARTICLE_STYLES}
                value={prefs.particle_style as typeof PARTICLE_STYLES[number]["id"]}
                onChange={(v) => onPrefsChange({ ...prefs, particle_style: v })}
                disabled={disabled}
              />
              <OptionSelector
                label="Effect Intensity"
                options={EFFECT_INTENSITIES}
                value={prefs.effect_intensity as typeof EFFECT_INTENSITIES[number]["id"]}
                onChange={(v) => onPrefsChange({ ...prefs, effect_intensity: v })}
                disabled={disabled}
              />
              <OptionSelector
                label="Animation Speed"
                options={ANIMATION_SPEEDS}
                value={prefs.animation_speed as typeof ANIMATION_SPEEDS[number]["id"]}
                onChange={(v) => onPrefsChange({ ...prefs, animation_speed: v })}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Border Style */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Frame size={14} className="text-primary" />
              Card Border
            </p>
            <OptionSelector
              label=""
              options={BORDER_STYLES}
              value={prefs.border_style as typeof BORDER_STYLES[number]["id"]}
              onChange={(v) => onPrefsChange({ ...prefs, border_style: v })}
              disabled={disabled}
            />
          </div>

          {/* Personalization */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Type size={14} className="text-primary" />
              Personalization
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Bio / Status Text (50 chars max)
                </label>
                <input
                  type="text"
                  value={prefs.bio_text || ""}
                  onChange={(e) => onPrefsChange({ ...prefs, bio_text: e.target.value.slice(0, 50) || null })}
                  placeholder="e.g. Grinding for finals..."
                  maxLength={50}
                  disabled={disabled}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-40"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {(prefs.bio_text || "").length}/50 characters
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Snowflake size={12} className="text-primary" />
                    Seasonal Effects
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Auto-switch particle style by season (snowflakes in winter, hearts on Valentine&apos;s, etc.)
                  </p>
                </div>
                <Toggle
                  checked={prefs.seasonal_effects}
                  onChange={(v) => onPrefsChange({ ...prefs, seasonal_effects: v })}
                  id="seasonal-toggle"
                />
              </div>
            </div>
          </div>

          {/* Save & Preview */}
          {isSupporter && (
            <div className="pt-4 border-t border-border">
              <div className="flex gap-3 mb-6">
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

              <div>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Gauge size={12} />
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
                  ) : previewError ? (
                    <div className="w-full aspect-[2.17/1] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 px-4 text-center">
                        <ImageOff size={24} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{previewError}</span>
                        <Button variant="ghost" size="sm" onClick={onRefreshPreview} className="mt-1">
                          <RefreshCw size={12} className="mr-1" /> Try Again
                        </Button>
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
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={24} className="text-muted-foreground animate-spin" />
                        <span className="text-xs text-muted-foreground">Loading preview...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TimerPersonalization({
  prefs,
  onPrefsChange,
  onSave,
  saving,
  isSupporter,
}: {
  prefs: TimerPreferences
  onPrefsChange: (p: TimerPreferences) => void
  onSave: () => void
  saving: boolean
  isSupporter: boolean
}) {
  const disabled = !isSupporter

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Timer size={20} className="text-primary" />
        Timer Personalization
      </h3>

      <div className={cn(
        "bg-card rounded-2xl border border-border p-6 space-y-6",
        !isSupporter && "opacity-50 pointer-events-none"
      )}>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Custom Timer Accent Color</p>
          <p className="text-[10px] text-muted-foreground mb-3">
            Override the timer ring and glow color with your own choice.
          </p>
          <div className="flex items-center gap-3">
            <ColorPickerPopover
              color={prefs.custom_accent_color}
              onChange={(v) => onPrefsChange({ ...prefs, custom_accent_color: v })}
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground">
              {prefs.custom_accent_color || "Using theme default"}
            </span>
            {prefs.custom_accent_color && (
              <button
                onClick={() => onPrefsChange({ ...prefs, custom_accent_color: null })}
                className="text-[10px] text-muted-foreground hover:text-foreground underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-3">Custom Stage Labels</p>
          <p className="text-[10px] text-muted-foreground mb-3">
            Replace the default &quot;FOCUS&quot;, &quot;BREAK&quot;, and &quot;SESSION&quot; labels with your own text (max 20 chars each).
          </p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: "focus_label" as const, placeholder: "FOCUS", defaultLabel: "Focus" },
              { key: "break_label" as const, placeholder: "BREAK", defaultLabel: "Break" },
              { key: "session_label" as const, placeholder: "SESSION", defaultLabel: "Session" },
            ]).map(({ key, placeholder, defaultLabel }) => (
              <div key={key}>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">
                  {defaultLabel} Label
                </label>
                <input
                  type="text"
                  value={prefs[key] || ""}
                  onChange={(e) => onPrefsChange({ ...prefs, [key]: e.target.value.slice(0, 20) || null })}
                  placeholder={placeholder}
                  maxLength={20}
                  disabled={disabled}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-40"
                />
              </div>
            ))}
          </div>
        </div>

        {isSupporter && (
          <Button onClick={onSave} disabled={saving} size="sm">
            {saving ? "Saving..." : "Save Timer Settings"}
          </Button>
        )}
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
                  {tier.farmGrowthSpeed}x farm growth
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary flex-shrink-0" />
                  {tier.timerThemes} timer themes
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary flex-shrink-0" />
                  Full card effects studio
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

  const { data: timerPrefsData } = useDashboard<TimerPreferences>(
    session ? "/api/dashboard/focus-preferences" : null
  )

  const [prefs, setPrefs] = useState<CardPreferences>(DEFAULT_PREFS)
  const [timerPrefs, setTimerPrefs] = useState<TimerPreferences>(DEFAULT_TIMER_PREFS)
  const [saving, setSaving] = useState(false)
  const [timerSaving, setTimerSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const initialPreviewDone = useRef(false)

  useEffect(() => {
    if (prefsData) {
      setPrefs({ ...DEFAULT_PREFS, ...prefsData })
    }
  }, [prefsData])

  useEffect(() => {
    if (timerPrefsData) {
      setTimerPrefs({ ...DEFAULT_TIMER_PREFS, ...timerPrefsData })
    }
  }, [timerPrefsData])

  const isSupporter = sub?.status === "ACTIVE" && sub?.tier !== "NONE"

  const renderPreview = useCallback(async (prefsToRender: CardPreferences) => {
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      const params = new URLSearchParams()
      params.set("effects_enabled", String(prefsToRender.effects_enabled))
      params.set("sparkles_enabled", String(prefsToRender.sparkles_enabled))
      params.set("ring_enabled", String(prefsToRender.ring_enabled))
      params.set("edge_glow_enabled", String(prefsToRender.edge_glow_enabled))
      params.set("particles_enabled", String(prefsToRender.particles_enabled))
      params.set("effect_intensity", prefsToRender.effect_intensity)
      params.set("particle_style", prefsToRender.particle_style)
      params.set("animation_speed", prefsToRender.animation_speed)
      params.set("border_style", prefsToRender.border_style)
      params.set("seasonal_effects", String(prefsToRender.seasonal_effects))

      if (prefsToRender.sparkle_color) params.set("sparkle_color", prefsToRender.sparkle_color)
      if (prefsToRender.ring_color) params.set("ring_color", prefsToRender.ring_color)
      if (prefsToRender.edge_glow_color) params.set("edge_glow_color", prefsToRender.edge_glow_color)
      if (prefsToRender.particle_color) params.set("particle_color", prefsToRender.particle_color)

      const url = `/api/dashboard/supporter-preview?${params}`
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Render failed (${res.status})`)
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return objectUrl
      })
    } catch (e: unknown) {
      const msg = (e as Error)?.message || "Card rendering service unavailable"
      setPreviewError(msg)
    }
    setPreviewLoading(false)
  }, [])

  useEffect(() => {
    if (isSupporter && prefsData && !initialPreviewDone.current) {
      initialPreviewDone.current = true
      renderPreview({ ...DEFAULT_PREFS, ...prefsData })
    }
  }, [isSupporter, prefsData, renderPreview])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const result = await dashboardMutate("PATCH", "/api/dashboard/card-preferences", prefs)
      toast.success("Preferences saved")
      renderPreview(result || prefs)
    } catch {
      toast.error("Failed to save preferences")
    }
    setSaving(false)
  }, [prefs, renderPreview])

  const handleRefreshPreview = useCallback(() => {
    renderPreview(prefs)
  }, [prefs, renderPreview])

  const handleTimerSave = useCallback(async () => {
    setTimerSaving(true)
    try {
      await dashboardMutate("PATCH", "/api/dashboard/focus-preferences", timerPrefs)
      toast.success("Timer settings saved")
    } catch {
      toast.error("Failed to save timer settings")
    }
    setTimerSaving(false)
  }, [timerPrefs])

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
                    previewError={previewError}
                    onRefreshPreview={handleRefreshPreview}
                    previewLoading={previewLoading}
                  />

                  <TimerPersonalization
                    prefs={timerPrefs}
                    onPrefsChange={setTimerPrefs}
                    onSave={handleTimerSave}
                    saving={timerSaving}
                    isSupporter={!!isSupporter}
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
