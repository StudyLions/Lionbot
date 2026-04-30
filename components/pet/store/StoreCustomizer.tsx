// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- store customizer studio.
//
// 2026-04-30 (rev 2): full redesign. Previous version was a small
// split-pane that lived inside PetShell -- lion previewed in a
// 300x300 box, 7 control cards stacked vertically. None of it
// reflected the actual store layout visitors see.
//
// New shape MIRRORS the public store at /pet/marketplace/store/[id]:
//   - FullBleedShell paints the DRAFT theme background across the
//     entire viewport, so picking a theme repaints the page in
//     real time
//   - Top nav: Back to Marketplace + View live store
//   - Optional 1-line free-tier banner explaining premium previews
//   - Grid (lg:grid-cols-[320px_1fr]):
//     - LEFT sticky sidebar = literal 1:1 preview of the public
//       store sidebar (StoreCanvas 140/260 responsive, identity
//       card, tier badge, speech bubble, /store/{slug}, "+ List
//       a new item"), driven by draft state so every keystroke /
//       theme click updates the preview instantly
//     - RIGHT tabbed control panel: 3 tabs (Look / Identity /
//       Voice) with a gold count badge per tab showing pending
//       premium changes in that tab
//   - Sticky bottom save bar with pending-count indicator
//
// Free users can still PREVIEW every premium theme/animation/colour;
// hitting Save with locked items routes through UpgradePrompt instead
// of dropping the change. This logic is preserved verbatim from rev 1.
// ============================================================
import { useMemo, useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  Save, Lock, Palette, Sparkles, Type, MessageSquare, Link2,
  ChevronLeft, Eye, Heart, Store, ShoppingBag, Check, Wand2, User,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { dashboardMutate, invalidatePrefix } from "@/hooks/useDashboard"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import SpeechBubble from "@/components/pet/store/SpeechBubble"
import UpgradePrompt, { type UpgradePromptItem } from "@/components/pet/store/UpgradePrompt"
import { LION_HEART_TIER_LABELS, type LionHeartTier } from "@/utils/subscription"
import {
  STORE_THEMES, STORE_ANIMATIONS, sanitizeAccentColor,
  type StoreThemeId, type StoreAnimationId,
} from "@/constants/StoreThemes"
import {
  validateSlugShape, normalizeSlug, SLUG_MIN_LENGTH, SLUG_MAX_LENGTH,
} from "@/utils/storeSlug"
import { cn } from "@/lib/utils"

const StoreCanvas = dynamic(() => import("@/components/pet/store/StoreCanvas"), { ssr: false })
const ThemeStyle = dynamic(() => import("@/components/pet/store/ThemeStyle"), { ssr: false })

// ----------------------------------------------------------------
// Types (unchanged contract -- /api/pet/marketplace/store/me)
// ----------------------------------------------------------------

interface ThemeOption {
  id: string
  name: string
  description: string
  minTier: LionHeartTier
  unlocked: boolean
  previewSwatch: string
}

interface AnimationOption {
  id: string
  name: string
  description: string
  minTier: LionHeartTier
  unlocked: boolean
}

interface MeStore {
  displayName: string | null
  effectiveName: string
  speechBubble: string
  lionPose: string
  themeId: string
  accentColor: string | null
  backgroundAnimation: string
  slug: string | null
}

export interface MeGating {
  tier: LionHeartTier
  tierLabel: string
  speechBubbleMaxLength: number
  canSetDisplayName: boolean
  canPickPremiumLionPose: boolean
  canPickPremiumTheme: boolean
  canPickPremiumAnimation: boolean
  canPickAccentColor: boolean
  themes: ThemeOption[]
  animations: AnimationOption[]
  canSetSlug: boolean
  featuredSlots: number
  slugMinLength: number
  slugMaxLength: number
}

export interface MeDefaults {
  speechBubble: string
  speechBubbleMaxLengthFree: number
  speechBubbleMaxLengthPremium: number
  storeNameMaxLength: number
  freeLionPoses: string[]
  premiumLionPoses: string[]
}

export interface MeApiResponse {
  store: MeStore
  gating: MeGating
  defaults: MeDefaults
}

interface PreviewPet {
  name: string
  level: number
  expression: string
  roomPrefix: string
  furniture: Record<string, string>
  roomLayout: Record<string, unknown>
  equipment: Record<string, {
    name: string
    category: string
    rarity: string
    assetPath: string
    glowTier: string
    glowIntensity: number
  }>
}

interface StoreCustomizerProps {
  initial: MeApiResponse
  pet: PreviewPet | null
  shopkeeperName: string
  /** Callback after a successful save -- typically used to invalidate caches. */
  onSaved?: () => void
  /** Discord ID of the signed-in user; used for the "View live store" link. */
  myDiscordId?: string | null
}

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

/**
 * Tier-coloured border for the sidebar preview, matching the public store.
 * Free shows the default border; premium tiers get their tier rim.
 */
const TIER_BADGE_COLORS: Record<LionHeartTier, { border: string; bg: string; text: string }> = {
  FREE:                { border: "#3a4a6c", bg: "#0c1020",   text: "#8899aa" },
  LIONHEART:           { border: "#5B8DEF", bg: "#5B8DEF15", text: "#a8c5ff" },
  LIONHEART_PLUS:      { border: "#FF69B4", bg: "#FF69B415", text: "#ffb0d8" },
  LIONHEART_PLUS_PLUS: { border: "#FFD700", bg: "#FFD70015", text: "#ffe680" },
}

/** Quick-pick accent colours offered below the colour picker. */
const ACCENT_PRESETS: { name: string; hex: string }[] = [
  { name: "Gold",      hex: "#f0c040" },
  { name: "Rose",      hex: "#ff6b9d" },
  { name: "Teal",      hex: "#4dc4ff" },
  { name: "Mint",      hex: "#6bcf7f" },
  { name: "Lavender",  hex: "#c084fc" },
  { name: "Sky",       hex: "#5b8def" },
]

type TabId = "look" | "identity" | "voice"

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "look",     label: "Look",     icon: Wand2 },
  { id: "identity", label: "Identity", icon: User },
  { id: "voice",    label: "Voice",    icon: MessageSquare },
]

const TIER_RANK: Record<LionHeartTier, number> = {
  FREE: 0, LIONHEART: 1, LIONHEART_PLUS: 2, LIONHEART_PLUS_PLUS: 3,
}

// ----------------------------------------------------------------
// Helper: anchor styled like our PixelButton without nesting an
// actual <button>, so the link reliably navigates everywhere.
// ----------------------------------------------------------------

function PixelLinkButton({
  href, variant = "ghost", className, children, openInNewTab = false,
}: {
  href: string
  variant?: "primary" | "info" | "ghost"
  className?: string
  children: React.ReactNode
  openInNewTab?: boolean
}) {
  const variants = {
    primary: "bg-[#2a7a3a] border-[#40d870] text-[#d0ffd8] hover:bg-[#338844]",
    info:    "bg-[#2a3a7a] border-[#4080f0] text-[#d0e0ff] hover:bg-[#334488]",
    ghost:   "bg-transparent border-[#3a4a6c] text-[#8899aa] hover:bg-[#1a2438] hover:text-[#c0d0e0]",
  } as const
  const target = openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {}
  return (
    <Link href={href}>
      <a
        {...target}
        className={cn(
          "font-pixel inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[13px]",
          "border-2 transition-all select-none no-underline",
          "shadow-[2px_2px_0_#060810]",
          "motion-safe:hover:shadow-[1px_1px_0_#060810] motion-safe:hover:translate-x-px motion-safe:hover:translate-y-px",
          "motion-safe:active:shadow-none motion-safe:active:translate-x-0.5 motion-safe:active:translate-y-0.5",
          variants[variant],
          className,
        )}
      >
        {children}
      </a>
    </Link>
  )
}

// ----------------------------------------------------------------
// FullBleedShell -- mirrors the public store's wrapper so the page
// background paints the seller's CHOSEN theme (live preview) across
// the entire viewport.
// ----------------------------------------------------------------

function FullBleedShell({
  themeId, animationId, pageBackground, textColor, children,
}: {
  themeId: StoreThemeId
  animationId: StoreAnimationId
  pageBackground: string
  textColor: string
  children: React.ReactNode
}) {
  const animClass =
    animationId === "parallax-clouds" ? "lg-store-anim lg-store-anim-parallax-clouds"
      : animationId === "pulse" ? "lg-store-anim lg-store-anim-pulse"
      : animationId === "rainbow" ? "lg-store-anim lg-store-anim-rainbow"
      : ""

  return (
    <div
      className={cn(
        "pet-section pet-scanline min-h-[calc(100vh-80px)]",
        animClass,
        // Reserve space for the sticky save bar so content isn't covered.
        "pb-28",
      )}
      style={{
        background: pageBackground,
        backgroundSize: animationId === "rainbow" ? "400% 400%" : undefined,
        color: textColor,
      }}
      data-theme={themeId}
    >
      {children}
    </div>
  )
}

// ----------------------------------------------------------------
// Studio
// ----------------------------------------------------------------

export default function StoreCustomizer({
  initial,
  pet,
  shopkeeperName,
  onSaved,
  myDiscordId,
}: StoreCustomizerProps) {
  // --- Draft state (mirrors the API shape so save can diff) ---------
  const [displayName, setDisplayName] = useState(initial.store.displayName ?? "")
  const [speechBubble, setSpeechBubble] = useState(initial.store.speechBubble ?? "")
  const [lionPose, setLionPose] = useState(initial.store.lionPose ?? "idle")
  const [themeId, setThemeId] = useState(initial.store.themeId ?? "default")
  const [animationId, setAnimationId] = useState(initial.store.backgroundAnimation ?? "none")
  const [accentColor, setAccentColor] = useState(initial.store.accentColor ?? "")
  const [slug, setSlug] = useState(initial.store.slug ?? "")
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("look")
  const [upgradePrompt, setUpgradePrompt] = useState<{
    open: boolean
    items: UpgradePromptItem[]
    requiredTier: LionHeartTier
  }>({ open: false, items: [], requiredTier: "LIONHEART" })
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: timestamp of the last successful save. Drives the green "Saved!"
  // pill + green border in the save bar for 3s so the user gets visible
  // confirmation right at the click point even if the toast misses for any
  // reason. Auto-clears via the useEffect below.
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  // --- END AI-MODIFIED ---

  const isPremium = initial.gating.tier !== "FREE"

  // Map the API gating arrays into id-keyed maps so we don't need to scan
  // them on every render of the locked-items memo / theme-card grid.
  const themeMap = useMemo(() => {
    const m = new Map<string, ThemeOption>()
    initial.gating.themes.forEach((t) => m.set(t.id, t))
    return m
  }, [initial.gating.themes])

  const animMap = useMemo(() => {
    const m = new Map<string, AnimationOption>()
    initial.gating.animations.forEach((a) => m.set(a.id, a))
    return m
  }, [initial.gating.animations])

  // --- Resolve the DRAFT theme (allow premium previews regardless of
  // tier so free users can see the chosen theme; Save will route them
  // through UpgradePrompt). Falls back to default if id is unknown.
  const draftTheme = STORE_THEMES[themeId as StoreThemeId] ?? STORE_THEMES.default
  const draftAnimation = STORE_ANIMATIONS[animationId as StoreAnimationId] ?? STORE_ANIMATIONS.none
  const previewAccent = sanitizeAccentColor(accentColor) ?? draftTheme.accent

  // Resolved values for the sidebar preview, all driven by draft state so
  // every change updates the preview instantly.
  const previewName = (displayName.trim() || initial.store.effectiveName).slice(0, 200)
  const previewBubble = speechBubble.trim() || initial.defaults.speechBubble
  const previewSlug = normalizeSlug(slug) || initial.store.slug || ""
  const previewHref = myDiscordId
    ? `/pet/marketplace/store/${myDiscordId}`
    : "/pet/marketplace"

  // --- Compute locked items (per tab) -------------------------------
  // Each entry carries which tab it belongs to so the tab strip can
  // render a count badge per tab.
  type LockedItemWithTab = UpgradePromptItem & { tab: TabId }

  const lockedItems = useMemo<LockedItemWithTab[]>(() => {
    const items: LockedItemWithTab[] = []

    const trimmedName = displayName.trim()
    if (
      trimmedName.length > 0 &&
      trimmedName !== (initial.store.displayName ?? "") &&
      !initial.gating.canSetDisplayName
    ) {
      items.push({
        tab: "identity",
        field: "displayName",
        label: "Custom store name",
        description: `Replace "${initial.store.effectiveName}" with anything you like.`,
      })
    }
    if (
      speechBubble !== initial.store.speechBubble &&
      speechBubble.length > initial.defaults.speechBubbleMaxLengthFree &&
      !isPremium
    ) {
      items.push({
        tab: "voice",
        field: "speechBubble",
        label: "Longer speech bubble",
        description: `Up to ${initial.defaults.speechBubbleMaxLengthPremium} characters instead of ${initial.defaults.speechBubbleMaxLengthFree}.`,
      })
    }
    if (
      initial.defaults.premiumLionPoses.includes(lionPose) &&
      lionPose !== initial.store.lionPose &&
      !initial.gating.canPickPremiumLionPose
    ) {
      items.push({
        tab: "voice",
        field: "lionPose",
        label: "Premium lion poses",
        description: "Wave, sit, or sleep -- coming soon as animated sprites.",
      })
    }
    const themeOpt = themeMap.get(themeId)
    if (themeOpt && !themeOpt.unlocked && themeId !== initial.store.themeId) {
      items.push({
        tab: "look",
        field: "themeId",
        label: `${themeOpt.name} theme`,
        description: themeOpt.description,
      })
    }
    const animOpt = animMap.get(animationId)
    if (animOpt && !animOpt.unlocked && animationId !== initial.store.backgroundAnimation) {
      items.push({
        tab: "look",
        field: "backgroundAnimation",
        label: `${animOpt.name} background`,
        description: animOpt.description,
      })
    }
    if (
      accentColor.trim().length > 0 &&
      accentColor !== (initial.store.accentColor ?? "") &&
      !initial.gating.canPickAccentColor
    ) {
      items.push({
        tab: "look",
        field: "accentColor",
        label: "Custom accent color",
        description: "Tint the speech bubble border + store accents to your liking.",
      })
    }
    const trimmedSlug = normalizeSlug(slug)
    if (
      trimmedSlug.length > 0 &&
      trimmedSlug !== (initial.store.slug ?? "") &&
      !initial.gating.canSetSlug
    ) {
      items.push({
        tab: "identity",
        field: "slug",
        label: "Custom store URL",
        description: "Replace your numeric ID with a memorable handle like /store/cool-shop.",
      })
    }
    return items
  }, [
    displayName, speechBubble, lionPose, themeId, animationId, accentColor, slug,
    initial, isPremium, themeMap, animMap,
  ])

  const lockedByTab = useMemo(() => {
    const counts: Record<TabId, number> = { look: 0, identity: 0, voice: 0 }
    lockedItems.forEach((i) => { counts[i.tab] += 1 })
    return counts
  }, [lockedItems])

  const requiredTier = useMemo<LionHeartTier>(() => {
    let highest: LionHeartTier = "LIONHEART"
    for (const item of lockedItems) {
      if (item.field === "themeId") {
        const t = themeMap.get(themeId)
        if (t && TIER_RANK[t.minTier] > TIER_RANK[highest]) highest = t.minTier
      } else if (item.field === "backgroundAnimation") {
        const a = animMap.get(animationId)
        if (a && TIER_RANK[a.minTier] > TIER_RANK[highest]) highest = a.minTier
      }
    }
    return highest
  }, [lockedItems, themeId, animationId, themeMap, animMap])

  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: client-side slug shape gate. The IdentityTab has been rendering
  // the inline error from this same call, but the Save button used to stay
  // enabled regardless -- a premium user with "ab" or "-foo" would fire a
  // PUT, the server would return 400, and (because the sonner Toaster wasn't
  // mounted) the rejection was completely silent. Centralizing the check
  // here lets us disable Save AND keep the inline error in sync.
  const slugShapeError = useMemo(() => {
    const normalized = normalizeSlug(slug)
    if (normalized.length === 0) return null
    return validateSlugShape(normalized)
  }, [slug])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: auto-clear the "Saved!" pill 3 seconds after a successful save,
  // so the save bar reverts to the standard "All saved" / "Unsaved changes"
  // state once the confirmation has been visible long enough to register.
  useEffect(() => {
    if (lastSavedAt === null) return
    const t = setTimeout(() => setLastSavedAt(null), 3000)
    return () => clearTimeout(t)
  }, [lastSavedAt])
  // --- END AI-MODIFIED ---

  // --- Diff -- has the user actually changed anything? --------------
  const hasChanges = useMemo(() => {
    if ((displayName.trim() || null) !== (initial.store.displayName || null)) return true
    if (speechBubble !== initial.store.speechBubble) return true
    if (lionPose !== initial.store.lionPose) return true
    if (themeId !== initial.store.themeId) return true
    if (animationId !== initial.store.backgroundAnimation) return true
    const sanitizedAccent = accentColor.trim() === "" ? null : sanitizeAccentColor(accentColor)
    if (sanitizedAccent !== (initial.store.accentColor || null)) return true
    const normSlug = normalizeSlug(slug)
    const slugForCompare = normSlug === "" ? null : normSlug
    if (slugForCompare !== (initial.store.slug || null)) return true
    return false
  }, [displayName, speechBubble, lionPose, themeId, animationId, accentColor, slug, initial])

  // --- Save handler (logic preserved from rev 1) --------------------
  const handleSave = useCallback(async () => {
    if (lockedItems.length > 0) {
      setUpgradePrompt({
        open: true,
        items: lockedItems.map(({ tab: _tab, ...rest }) => rest),
        requiredTier,
      })
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {}
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: trim displayName once and use the trimmed value for both the
      // diff and the payload, matching the hasChanges memo exactly so the two
      // can never disagree on whether displayName changed.
      const trimmedDisplayName = displayName.trim()
      if ((trimmedDisplayName || null) !== (initial.store.displayName || null)) {
        payload.displayName = trimmedDisplayName || null
      }
      // --- END AI-MODIFIED ---
      if (speechBubble !== initial.store.speechBubble) {
        payload.speechBubble = speechBubble.trim() || null
      }
      if (lionPose !== initial.store.lionPose) {
        payload.lionPose = lionPose
      }
      if (themeId !== initial.store.themeId) {
        payload.themeId = themeId
      }
      if (animationId !== initial.store.backgroundAnimation) {
        payload.backgroundAnimation = animationId
      }
      const sanitizedAccent = accentColor.trim() === "" ? null : sanitizeAccentColor(accentColor)
      if (sanitizedAccent !== (initial.store.accentColor || null)) {
        payload.accentColor = sanitizedAccent
      }
      const normalizedSlug = normalizeSlug(slug)
      const slugForCompare = normalizedSlug === "" ? null : normalizedSlug
      if (slugForCompare !== (initial.store.slug || null)) {
        payload.slug = slugForCompare
      }
      if (Object.keys(payload).length === 0) {
        toast.message("Nothing to save -- you haven't changed anything yet.")
        setSaving(false)
        return
      }
      await dashboardMutate("PUT", "/api/pet/marketplace/store/me", payload)
      toast.success("Store updated!")
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: flash the inline "Saved!" pill in the save bar for 3s so the
      // user gets visible feedback at the click point regardless of toast
      // visibility (defense in depth -- toast was the only signal until now).
      setLastSavedAt(Date.now())
      // --- END AI-MODIFIED ---
      invalidatePrefix("/api/pet/marketplace/store")
      onSaved?.()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }, [
    displayName, speechBubble, lionPose, themeId, animationId, accentColor, slug,
    initial, lockedItems, requiredTier, onSaved,
  ])

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <>
      {/* Inject font + animation CSS for the chosen theme so the live
          preview AND the page background animate correctly. */}
      <ThemeStyle
        themeId={themeId as StoreThemeId}
        animationId={animationId as StoreAnimationId}
      />

      <FullBleedShell
        themeId={themeId as StoreThemeId}
        animationId={animationId as StoreAnimationId}
        pageBackground={draftTheme.pageBackground}
        textColor={draftTheme.textColor}
      >
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* TOP NAV */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
            <Link href="/pet/marketplace">
              <a
                className="font-pixel text-[12px] inline-flex items-center gap-1.5 transition-colors no-underline px-3 py-1.5 border-2 border-transparent hover:border-[#3a4a6c] hover:bg-black/20"
                style={{ color: draftTheme.textDim }}
              >
                <ChevronLeft size={14} /> Back to Marketplace
              </a>
            </Link>
            <PixelLinkButton href={previewHref} variant="ghost" openInNewTab>
              <Eye size={12} /> View live store
            </PixelLinkButton>
          </div>

          {/* TITLE + FREE-TIER BANNER STRIP */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Settings size={18} style={{ color: draftTheme.accent }} />
              <h1
                className="font-pixel text-lg sm:text-xl"
                style={{ color: draftTheme.textColor }}
              >
                Customize your store
              </h1>
              <span
                className="font-pixel text-[10px] px-2 py-1 border-2 inline-flex items-center gap-1"
                style={{
                  borderColor: TIER_BADGE_COLORS[initial.gating.tier].border,
                  background: TIER_BADGE_COLORS[initial.gating.tier].bg,
                  color: TIER_BADGE_COLORS[initial.gating.tier].text,
                }}
              >
                <Heart size={10} /> {initial.gating.tierLabel}
              </span>
            </div>
            {!isPremium && (
              <Link href="/donate">
                <a
                  className="font-pixel text-[11px] underline-offset-2 hover:underline"
                  style={{ color: draftTheme.accent }}
                >
                  Upgrade for more options &rarr;
                </a>
              </Link>
            )}
          </div>

          {!isPremium && (
            <div
              className="border-2 px-3 py-2 flex items-start gap-2"
              style={{
                borderColor: `${draftTheme.accent}88`,
                background: "rgba(0,0,0,0.25)",
              }}
            >
              <Heart
                size={14}
                style={{ color: draftTheme.accent }}
                className="flex-shrink-0 mt-0.5"
              />
              <p
                className="font-pixel text-[11px] leading-relaxed"
                style={{ color: draftTheme.textDim }}
              >
                <span style={{ color: draftTheme.textColor }}>Try anything below for free.</span>{" "}
                Saving a premium change opens an upgrade window so you can decide whether to unlock it.
                Free users can still edit the speech bubble (up to {initial.defaults.speechBubbleMaxLengthFree} characters).
              </p>
            </div>
          )}

          {/* MAIN GRID -- mirrors the public store layout */}
          <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
            {/* LEFT SIDEBAR (LIVE PREVIEW) */}
            <SidebarPreview
              pet={pet}
              shopkeeperName={shopkeeperName}
              theme={draftTheme}
              animation={draftAnimation}
              accent={previewAccent}
              accentColorRaw={accentColor}
              previewName={previewName}
              previewBubble={previewBubble}
              previewSlug={previewSlug}
              tier={initial.gating.tier}
              tierLabel={initial.gating.tierLabel}
            />

            {/* RIGHT TABBED CONTROLS */}
            <section className="space-y-4 min-w-0">
              <TabStrip
                activeTab={activeTab}
                onChange={setActiveTab}
                lockedByTab={lockedByTab}
                themeAccent={draftTheme.accent}
                themeTextDim={draftTheme.textDim}
                themeTextColor={draftTheme.textColor}
              />

              {activeTab === "look" && (
                <LookTab
                  themeId={themeId}
                  setThemeId={setThemeId}
                  animationId={animationId}
                  setAnimationId={setAnimationId}
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  themes={initial.gating.themes}
                  animations={initial.gating.animations}
                  canPickAccentColor={initial.gating.canPickAccentColor}
                />
              )}

              {activeTab === "identity" && (
                <IdentityTab
                  displayName={displayName}
                  setDisplayName={setDisplayName}
                  slug={slug}
                  setSlug={setSlug}
                  slugShapeError={slugShapeError}
                  initial={initial}
                  isPremium={isPremium}
                />
              )}

              {activeTab === "voice" && (
                <VoiceTab
                  speechBubble={speechBubble}
                  setSpeechBubble={setSpeechBubble}
                  lionPose={lionPose}
                  setLionPose={setLionPose}
                  initial={initial}
                  isPremium={isPremium}
                />
              )}
            </section>
          </div>
        </div>
      </FullBleedShell>

      {/* STICKY SAVE BAR -- always visible, lives outside the FullBleedShell
          so it sticks to the viewport regardless of theme background height. */}
      {/* --- AI-MODIFIED (2026-04-30) --- */}
      {/* Purpose: drive the status pill + border colour + disabled prop from
          the new lastSavedAt + slugShapeError signals so the user gets visible
          confirmation right at the click point and can't fire a save with a
          known-invalid slug shape. */}
      {(() => {
        const justSaved = lastSavedAt !== null
        const borderTint =
          justSaved ? "#40d870"
          : slugShapeError ? "#ff6b9d"
          : lockedItems.length > 0 ? "#f0c040"
          : "#3a4a6c"
        return (
          <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 pb-3 sm:pb-4">
              <div
                className={cn(
                  "pointer-events-auto",
                  "border-2 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap",
                  "shadow-[0_-2px_0_#060810,2px_2px_0_#060810]",
                  "transition-[border-color] duration-200",
                )}
                style={{
                  background: "rgba(8,12,24,0.92)",
                  borderColor: borderTint,
                  backdropFilter: "blur(6px)",
                }}
              >
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  {justSaved ? (
                    <span className="font-pixel text-[11px] text-[#40d870] flex items-center gap-1.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200">
                      <Check size={11} /> Saved!
                    </span>
                  ) : slugShapeError ? (
                    <span className="font-pixel text-[11px] text-[#ff6b9d] flex items-center gap-1.5">
                      <Lock size={11} /> Fix slug to save: {slugShapeError.message}
                    </span>
                  ) : lockedItems.length > 0 ? (
                    <span className="font-pixel text-[11px] text-[#f0c040] flex items-center gap-1.5">
                      <Lock size={11} />
                      {lockedItems.length} premium change{lockedItems.length === 1 ? "" : "s"} pending
                    </span>
                  ) : hasChanges ? (
                    <span className="font-pixel text-[11px] text-[#a8c5ff] flex items-center gap-1.5">
                      <Sparkles size={11} /> Unsaved changes
                    </span>
                  ) : (
                    <span className="font-pixel text-[11px] text-[#8899aa] flex items-center gap-1.5">
                      <Check size={11} /> All saved
                    </span>
                  )}
                </div>
                <PixelButton
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  loading={saving}
                  disabled={
                    saving ||
                    slugShapeError !== null ||
                    (!hasChanges && lockedItems.length === 0)
                  }
                >
                  <Save size={12} className="mr-1" />
                  {lockedItems.length > 0 ? "Review & save" : hasChanges ? "Save changes" : "Saved"}
                </PixelButton>
              </div>
            </div>
          </div>
        )
      })()}
      {/* --- END AI-MODIFIED --- */}

      <UpgradePrompt
        open={upgradePrompt.open}
        onClose={() => setUpgradePrompt((s) => ({ ...s, open: false }))}
        requiredTier={upgradePrompt.requiredTier}
        lockedItems={upgradePrompt.items}
      />
    </>
  )
}

// ================================================================
// SidebarPreview -- 1:1 render of the public store's sidebar,
// driven entirely by draft state.
// ================================================================

function SidebarPreview({
  pet, shopkeeperName, theme, animation, accent, accentColorRaw,
  previewName, previewBubble, previewSlug, tier, tierLabel,
}: {
  pet: PreviewPet | null
  shopkeeperName: string
  theme: typeof STORE_THEMES[StoreThemeId]
  animation: typeof STORE_ANIMATIONS[StoreAnimationId]
  accent: string
  accentColorRaw: string
  previewName: string
  previewBubble: string
  previewSlug: string
  tier: LionHeartTier
  tierLabel: string
}) {
  const isPremiumSeller = tier !== "FREE"
  const tierColors = TIER_BADGE_COLORS[tier]

  const canvasProps = {
    pet,
    speechBubble: null,
    shopkeeperName: undefined,
    hideSpeechBubble: true,
    showCaption: false,
    accentColor: accentColorRaw || null,
    themeId: theme.id as StoreThemeId,
    animationId: animation.id as StoreAnimationId,
    animated: true,
  } as const

  return (
    <aside className="lg:sticky lg:top-4 self-start min-w-0">
      <PixelCard
        className="p-4 lg:p-5"
        corners
        borderColor={isPremiumSeller ? tierColors.border : undefined}
      >
        {/* Top row: lion (left on mobile, top on lg) + identity */}
        <div className="flex flex-row lg:flex-col gap-4 items-start lg:items-stretch">
          {/* Lion canvas -- two instances toggled by breakpoint */}
          <div className="flex-shrink-0 lg:self-center">
            <div className="lg:hidden">
              <StoreCanvas {...canvasProps} width={140} />
            </div>
            <div className="hidden lg:block">
              <StoreCanvas {...canvasProps} width={260} />
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex items-start gap-2 flex-wrap">
              <Store size={18} style={{ color: theme.accent }} className="flex-shrink-0 mt-0.5" />
              <h2
                className="font-pixel text-lg sm:text-xl lg:text-[22px] leading-tight break-words flex-1 min-w-0"
                style={{ color: theme.textColor }}
              >
                {previewName}
              </h2>
            </div>
            {isPremiumSeller && (
              <span
                className="font-pixel text-[10px] px-2 py-1 border-2 inline-flex items-center gap-1"
                style={{
                  borderColor: tierColors.border,
                  background: tierColors.bg,
                  color: tierColors.text,
                }}
              >
                <Heart size={10} /> {tierLabel}
              </span>
            )}
            <p
              className="font-pixel text-[11px] leading-relaxed"
              style={{ color: theme.textDim }}
            >
              shopkeeper{" "}
              <span style={{ color: theme.textColor }}>{shopkeeperName}</span>
            </p>
            <p
              className="font-pixel text-[11px] inline-flex items-center gap-1"
              style={{ color: theme.textDim }}
            >
              <ShoppingBag size={11} /> Listings appear on your live store
            </p>
            {previewSlug ? (
              <p>
                <code
                  className="font-pixel text-[10px] px-1.5 py-0.5 border inline-block break-all"
                  style={{
                    color: accent,
                    borderColor: `${accent}55`,
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  /store/{previewSlug}
                </code>
              </p>
            ) : null}
            {pet ? (
              <p
                className="font-pixel text-[11px] leading-relaxed hidden lg:block"
                style={{ color: `${theme.textDim}cc` }}
              >
                Tended by <span style={{ color: theme.textColor }}>{pet.name}</span>,
                a level {pet.level} LionGotchi.
              </p>
            ) : null}
          </div>
        </div>

        {/* Mobile-only "tended by" */}
        {pet ? (
          <p
            className="font-pixel text-[11px] leading-relaxed mt-3 lg:hidden"
            style={{ color: `${theme.textDim}cc` }}
          >
            Tended by <span style={{ color: theme.textColor }}>{pet.name}</span>,
            a level {pet.level} LionGotchi.
          </p>
        ) : null}

        {/* Speech bubble */}
        <div className="mt-4">
          <SpeechBubble
            tailSide="left"
            accentColor={accent}
            className="max-w-none"
          >
            {previewBubble}
          </SpeechBubble>
        </div>

        {/* Owner action */}
        <div className="mt-4">
          <PixelLinkButton
            href="/pet/marketplace/sell"
            variant="primary"
            className="w-full"
          >
            + List a new item
          </PixelLinkButton>
        </div>
      </PixelCard>
    </aside>
  )
}

// ================================================================
// TabStrip
// ================================================================

function TabStrip({
  activeTab, onChange, lockedByTab, themeAccent, themeTextDim, themeTextColor,
}: {
  activeTab: TabId
  onChange: (id: TabId) => void
  lockedByTab: Record<TabId, number>
  themeAccent: string
  themeTextDim: string
  themeTextColor: string
}) {
  return (
    <div
      role="tablist"
      className="grid grid-cols-3 gap-2 border-2 p-1"
      style={{
        background: "rgba(8,12,24,0.65)",
        borderColor: "#1a2a3c",
      }}
    >
      {TABS.map((t) => {
        const Icon = t.icon
        const selected = activeTab === t.id
        const lockCount = lockedByTab[t.id]
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.id)}
            className={cn(
              "font-pixel text-[12px] px-3 py-2 inline-flex items-center justify-center gap-1.5",
              "border-2 transition-all relative",
              selected
                ? "shadow-[inset_0_-3px_0_currentColor]"
                : "border-transparent hover:bg-black/30",
            )}
            style={{
              color: selected ? themeAccent : themeTextDim,
              borderColor: selected ? themeAccent : "transparent",
              background: selected ? `${themeAccent}14` : "transparent",
            }}
          >
            <Icon size={13} />
            <span style={{ color: selected ? themeAccent : themeTextColor }}>
              {t.label}
            </span>
            {lockCount > 0 && (
              <span
                className="font-pixel text-[9px] px-1.5 py-0 border ml-0.5"
                style={{
                  background: "#f0c04022",
                  borderColor: "#f0c040",
                  color: "#f0c040",
                }}
              >
                {lockCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ================================================================
// LookTab -- theme + animation + accent colour
// ================================================================

function LookTab({
  themeId, setThemeId, animationId, setAnimationId,
  accentColor, setAccentColor,
  themes, animations, canPickAccentColor,
}: {
  themeId: string
  setThemeId: (id: string) => void
  animationId: string
  setAnimationId: (id: string) => void
  accentColor: string
  setAccentColor: (v: string) => void
  themes: ThemeOption[]
  animations: AnimationOption[]
  canPickAccentColor: boolean
}) {
  return (
    <div className="space-y-4">
      <PixelCard className="p-4 lg:p-5 space-y-3" corners>
        <FieldHeader
          label="Theme"
          icon={<Palette size={14} />}
          hint="Repaints the entire page background. Pick one and the whole studio updates instantly."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {themes.map((t) => {
            const selected = themeId === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeId(t.id)}
                className={cn(
                  "group flex flex-col items-stretch border-2 transition-all overflow-hidden text-left",
                  selected
                    ? "border-[var(--pet-gold,#f0c040)] shadow-[0_0_0_2px_rgba(240,192,64,0.25)]"
                    : "border-[#1a2a3c] hover:border-[#3a4a6c]",
                )}
              >
                <div
                  className="h-20 w-full"
                  style={{
                    background: t.previewSwatch,
                    backgroundSize: "200% 200%",
                  }}
                />
                <div className="p-2 bg-[#080c18]">
                  <div className="flex items-center gap-1">
                    <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] truncate">
                      {t.name}
                    </span>
                    {!t.unlocked && (
                      <Lock size={10} className="text-[var(--pet-gold,#f0c040)] flex-shrink-0" />
                    )}
                    {selected && t.unlocked && (
                      <Check size={10} className="text-[var(--pet-gold,#f0c040)] flex-shrink-0" />
                    )}
                  </div>
                  <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#7a8a9a)] mt-0.5">
                    {t.unlocked ? "Free for you" : LION_HEART_TIER_LABELS[t.minTier]}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </PixelCard>

      <PixelCard className="p-4 lg:p-5 space-y-3" corners>
        <FieldHeader
          label="Background motion"
          icon={<Sparkles size={14} />}
          hint="Animates the background. Visitors with reduce-motion turned on see the static version automatically."
        />
        <div className="flex flex-wrap gap-2">
          {animations.map((a) => {
            const selected = animationId === a.id
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAnimationId(a.id)}
                className={cn(
                  "font-pixel text-[11px] px-3 py-1.5 border-2 transition-all flex items-center gap-1.5",
                  selected
                    ? "border-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/15 text-[var(--pet-gold,#f0c040)]"
                    : "border-[#1a2a3c] bg-[#080c18] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)]",
                )}
              >
                {selected && <span className="w-1.5 h-1.5 bg-[var(--pet-gold,#f0c040)] rounded-full animate-pulse" />}
                {!a.unlocked && <Lock size={9} />} {a.name}
              </button>
            )
          })}
        </div>
      </PixelCard>

      <PixelCard className="p-4 lg:p-5 space-y-3" corners>
        <FieldHeader
          label="Accent color"
          icon={<Palette size={14} />}
          locked={!canPickAccentColor}
          hint="Tints the speech-bubble border + the URL chip. Leave blank to inherit from the chosen theme."
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accentColor || "#f0c040"}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-12 h-10 border-2 border-[#1a2a3c] bg-[#080c18] cursor-pointer"
            aria-label="Pick accent color"
          />
          <input
            type="text"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            placeholder="#f0c040"
            pattern="^#[0-9a-fA-F]{3,8}$"
            className={cn(
              "font-pixel flex-1 px-3 py-2 bg-[#080c18] border-2 text-[12px] text-[var(--pet-text,#e2e8f0)]",
              "placeholder:text-[#3a4a5c] focus:outline-none focus:border-[var(--pet-gold,#f0c040)]",
              "border-[#1a2a3c]",
            )}
            aria-label="Accent color hex"
          />
          {accentColor && (
            <button
              type="button"
              onClick={() => setAccentColor("")}
              className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors px-2"
            >
              clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {ACCENT_PRESETS.map((p) => {
            const selected = accentColor.toLowerCase() === p.hex.toLowerCase()
            return (
              <button
                key={p.hex}
                type="button"
                onClick={() => setAccentColor(p.hex)}
                title={p.name}
                aria-label={`Pick ${p.name} accent`}
                className={cn(
                  "w-7 h-7 border-2 transition-all relative",
                  selected ? "border-[var(--pet-gold,#f0c040)] scale-110" : "border-[#1a2a3c] hover:border-[#3a4a6c]",
                )}
                style={{ background: p.hex }}
              >
                {selected && (
                  <Check size={11} className="absolute inset-0 m-auto text-black/80" />
                )}
              </button>
            )
          })}
        </div>
      </PixelCard>
    </div>
  )
}

// ================================================================
// IdentityTab -- store name + custom URL
// ================================================================

function IdentityTab({
  displayName, setDisplayName, slug, setSlug, slugShapeError, initial, isPremium,
}: {
  displayName: string
  setDisplayName: (v: string) => void
  slug: string
  setSlug: (v: string) => void
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: receive the slug shape error from the parent so the inline
  // message and the Save button's disabled prop are driven by the same
  // memo (single source of truth).
  slugShapeError: { code: string; message: string } | null
  // --- END AI-MODIFIED ---
  initial: MeApiResponse
  isPremium: boolean
}) {
  return (
    <div className="space-y-4">
      <PixelCard className="p-4 lg:p-5 space-y-3" corners>
        <FieldHeader
          label="Store name"
          icon={<Type size={14} />}
          locked={!initial.gating.canSetDisplayName}
          hint="Replaces your Discord username on the store header."
        />
        <input
          type="text"
          value={displayName}
          maxLength={initial.defaults.storeNameMaxLength}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={initial.store.effectiveName}
          className={cn(
            "font-pixel w-full px-3 py-2 bg-[#080c18] border-2 text-[13px] text-[var(--pet-text,#e2e8f0)]",
            "placeholder:text-[#3a4a5c] focus:outline-none focus:border-[var(--pet-gold,#f0c040)]",
            "border-[#1a2a3c]",
          )}
        />
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] flex items-center justify-between">
          <span>{displayName.length}/{initial.defaults.storeNameMaxLength}</span>
          {!isPremium && displayName.trim().length > 0 && displayName !== (initial.store.displayName ?? "") && (
            <span className="text-[var(--pet-gold,#f0c040)] flex items-center gap-1">
              <Lock size={9} /> Save will prompt to upgrade
            </span>
          )}
        </p>
      </PixelCard>

      <PixelCard className="p-4 lg:p-5 space-y-3" corners>
        <FieldHeader
          label="Custom store URL"
          icon={<Link2 size={14} />}
          locked={!initial.gating.canSetSlug}
          hint={`Letters, numbers, and dashes only. ${SLUG_MIN_LENGTH}-${SLUG_MAX_LENGTH} characters. Must contain at least one letter.`}
        />
        <div className="flex items-stretch gap-0">
          <span className="font-pixel inline-flex items-center px-3 py-2 bg-[#04060e] border-2 border-r-0 border-[#1a2a3c] text-[10px] text-[var(--pet-text-dim,#7a8a9a)]">
            /pet/marketplace/store/
          </span>
          <input
            type="text"
            value={slug}
            maxLength={SLUG_MAX_LENGTH}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            placeholder="cool-shop"
            className={cn(
              "font-pixel flex-1 px-3 py-2 bg-[#080c18] border-2 text-[13px] text-[var(--pet-text,#e2e8f0)]",
              "placeholder:text-[#3a4a5c] focus:outline-none focus:border-[var(--pet-gold,#f0c040)]",
              "border-[#1a2a3c]",
            )}
          />
          {slug && (
            <button
              type="button"
              onClick={() => setSlug("")}
              className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors px-3 border-2 border-l-0 border-[#1a2a3c] bg-[#080c18]"
            >
              clear
            </button>
          )}
        </div>
        {slug && (() => {
          if (slugShapeError) {
            return (
              <p className="font-pixel text-[10px] text-[var(--pet-rose,#ff6b9d)]">{slugShapeError.message}</p>
            )
          }
          if (initial.gating.canSetSlug) {
            return (
              <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                Looks good. Save will check it&apos;s not already taken.
              </p>
            )
          }
          return (
            <p className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)] flex items-center gap-1">
              <Lock size={9} /> Save will prompt to upgrade
            </p>
          )
        })()}
      </PixelCard>
    </div>
  )
}

// ================================================================
// VoiceTab -- speech bubble + lion pose
// ================================================================

function VoiceTab({
  speechBubble, setSpeechBubble, lionPose, setLionPose, initial, isPremium,
}: {
  speechBubble: string
  setSpeechBubble: (v: string) => void
  lionPose: string
  setLionPose: (v: string) => void
  initial: MeApiResponse
  isPremium: boolean
}) {
  return (
    <div className="space-y-4">
      <PixelCard className="p-4 lg:p-5 space-y-3" corners>
        <FieldHeader
          label="Speech bubble"
          icon={<MessageSquare size={14} />}
          hint={`Your lion shopkeeper says this. Free up to ${initial.defaults.speechBubbleMaxLengthFree} characters; LionHeart members can write up to ${initial.defaults.speechBubbleMaxLengthPremium}.`}
        />
        <textarea
          value={speechBubble}
          maxLength={initial.defaults.speechBubbleMaxLengthPremium}
          onChange={(e) => setSpeechBubble(e.target.value)}
          placeholder={initial.defaults.speechBubble}
          rows={4}
          className={cn(
            "font-pixel w-full px-3 py-2 bg-[#080c18] border-2 text-[13px] text-[var(--pet-text,#e2e8f0)]",
            "placeholder:text-[#3a4a5c] focus:outline-none focus:border-[var(--pet-gold,#f0c040)] resize-none",
            "border-[#1a2a3c]",
          )}
        />
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] flex items-center justify-between">
          <span>
            {speechBubble.length}/{initial.gating.speechBubbleMaxLength}
            {!isPremium && speechBubble.length > initial.defaults.speechBubbleMaxLengthFree && (
              <span className="text-[var(--pet-gold,#f0c040)]"> (over free limit)</span>
            )}
          </span>
          {!isPremium && speechBubble.length > initial.defaults.speechBubbleMaxLengthFree && (
            <span className="text-[var(--pet-gold,#f0c040)] flex items-center gap-1">
              <Lock size={9} /> Save will prompt to upgrade
            </span>
          )}
        </p>
      </PixelCard>

      <PixelCard className="p-4 lg:p-5 space-y-3" corners>
        <FieldHeader
          label="Lion pose"
          locked={!initial.gating.canPickPremiumLionPose}
          hint="The pose your lion shopkeeper holds. Animated premium poses ship with LionHeart."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[...initial.defaults.freeLionPoses, ...initial.defaults.premiumLionPoses].map((pose) => {
            const premium = initial.defaults.premiumLionPoses.includes(pose)
            const selected = lionPose === pose
            return (
              <button
                key={pose}
                type="button"
                onClick={() => setLionPose(pose)}
                className={cn(
                  "font-pixel text-[11px] py-2 border-2 transition-all flex items-center justify-center gap-1 capitalize",
                  selected
                    ? "border-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/15 text-[var(--pet-gold,#f0c040)]"
                    : "border-[#1a2a3c] bg-[#080c18] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)]",
                )}
              >
                {premium && !isPremium && <Lock size={9} />} {pose}
              </button>
            )
          })}
        </div>
      </PixelCard>
    </div>
  )
}

// ================================================================
// FieldHeader -- shared label row used by every control card.
// ================================================================

interface FieldHeaderProps {
  label: string
  locked?: boolean
  tier?: LionHeartTier
  hint?: string
  icon?: React.ReactNode
}

function FieldHeader({ label, locked, tier = "LIONHEART", hint, icon }: FieldHeaderProps) {
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {icon && <span className="text-[var(--pet-text-dim,#8899aa)]">{icon}</span>}
        <h3 className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)]">{label}</h3>
        {locked && (
          <span className="font-pixel text-[9px] px-1.5 py-0.5 border border-[var(--pet-gold,#f0c040)] text-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/10 inline-flex items-center gap-1">
            <Lock size={9} /> {LION_HEART_TIER_LABELS[tier]}
          </span>
        )}
      </div>
      {hint && (
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] mt-1 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  )
}
