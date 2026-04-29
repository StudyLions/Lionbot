// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 Phase 2 -- split-pane store studio.
//
//          Left pane (sticky on lg+): live preview backed by
//          StoreCanvas + ThemeStyle so changes show instantly.
//          Right pane: theme picker, animation chips, accent
//          color picker, store name, speech bubble, lion pose.
//
//          Key design: free users can EXPERIMENT with premium
//          themes/animations/colors freely (we just visually
//          mark them locked). Save-time diff routes any locked
//          field through UpgradePrompt instead of saving it.
// ============================================================
import { useMemo, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Save, Lock, Palette, Sparkles, Type, MessageSquare, Link2 } from "lucide-react"
import { toast } from "sonner"

import { dashboardMutate, invalidatePrefix } from "@/hooks/useDashboard"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import UpgradePrompt, { type UpgradePromptItem } from "@/components/pet/store/UpgradePrompt"
import { LION_HEART_TIER_LABELS, type LionHeartTier } from "@/utils/subscription"
import { sanitizeAccentColor } from "@/constants/StoreThemes"
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 Phase 3 -- client-side slug shape check so we
// don't bother the server with obviously-broken slugs as the user types.
// The server is still the authoritative validator.
import {
  validateSlugShape, normalizeSlug, SLUG_MIN_LENGTH, SLUG_MAX_LENGTH,
} from "@/utils/storeSlug"
// --- END AI-MODIFIED ---
import { cn } from "@/lib/utils"

const StoreCanvas = dynamic(() => import("@/components/pet/store/StoreCanvas"), { ssr: false })
const ThemeStyle = dynamic(() => import("@/components/pet/store/ThemeStyle"), { ssr: false })

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
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 3 -- vanity slug.
  slug: string | null
  // --- END AI-MODIFIED ---
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
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 3 -- slug + featured perks.
  canSetSlug: boolean
  featuredSlots: number
  slugMinLength: number
  slugMaxLength: number
  // --- END AI-MODIFIED ---
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
  gameboySkinPath?: string | null
  shopkeeperName: string
  /** Callback after a successful save -- typically used to invalidate caches. */
  onSaved?: () => void
}

export default function StoreCustomizer({
  initial,
  pet,
  gameboySkinPath,
  shopkeeperName,
  onSaved,
}: StoreCustomizerProps) {
  // --- Draft state (mirrors the current API shape so save can diff) -----
  const [displayName, setDisplayName] = useState(initial.store.displayName ?? "")
  const [speechBubble, setSpeechBubble] = useState(initial.store.speechBubble ?? "")
  const [lionPose, setLionPose] = useState(initial.store.lionPose ?? "idle")
  const [themeId, setThemeId] = useState(initial.store.themeId ?? "default")
  const [animationId, setAnimationId] = useState(initial.store.backgroundAnimation ?? "none")
  const [accentColor, setAccentColor] = useState(initial.store.accentColor ?? "")
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 3 -- vanity slug draft state.
  const [slug, setSlug] = useState(initial.store.slug ?? "")
  // --- END AI-MODIFIED ---
  const [saving, setSaving] = useState(false)
  const [upgradePrompt, setUpgradePrompt] = useState<{
    open: boolean
    items: UpgradePromptItem[]
    requiredTier: LionHeartTier
  }>({ open: false, items: [], requiredTier: "LIONHEART" })

  const isPremium = initial.gating.tier !== "FREE"

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

  // --- Compute the locked items being attempted in the current draft ---
  const lockedItems = useMemo<UpgradePromptItem[]>(() => {
    const items: UpgradePromptItem[] = []
    let highestRequiredTier: LionHeartTier = "LIONHEART"
    const tierRank: Record<LionHeartTier, number> = {
      FREE: 0, LIONHEART: 1, LIONHEART_PLUS: 2, LIONHEART_PLUS_PLUS: 3,
    }
    const bumpRequired = (t: LionHeartTier) => {
      if (tierRank[t] > tierRank[highestRequiredTier]) highestRequiredTier = t
    }

    const trimmedName = displayName.trim()
    if (
      trimmedName.length > 0 &&
      trimmedName !== (initial.store.displayName ?? "") &&
      !initial.gating.canSetDisplayName
    ) {
      items.push({
        field: "displayName",
        label: "Custom store name",
        description: `Replace "${initial.store.effectiveName}" with anything you like.`,
      })
      bumpRequired("LIONHEART")
    }
    if (
      speechBubble !== initial.store.speechBubble &&
      speechBubble.length > initial.defaults.speechBubbleMaxLengthFree &&
      !isPremium
    ) {
      items.push({
        field: "speechBubble",
        label: "Longer speech bubble",
        description: `Up to ${initial.defaults.speechBubbleMaxLengthPremium} characters instead of ${initial.defaults.speechBubbleMaxLengthFree}.`,
      })
      bumpRequired("LIONHEART")
    }
    if (
      initial.defaults.premiumLionPoses.includes(lionPose) &&
      lionPose !== initial.store.lionPose &&
      !initial.gating.canPickPremiumLionPose
    ) {
      items.push({
        field: "lionPose",
        label: "Premium lion poses",
        description: "Wave, sit, or sleep -- coming soon as animated sprites.",
      })
      bumpRequired("LIONHEART")
    }
    const themeOpt = themeMap.get(themeId)
    if (themeOpt && !themeOpt.unlocked && themeId !== initial.store.themeId) {
      items.push({
        field: "themeId",
        label: `${themeOpt.name} theme`,
        description: themeOpt.description,
      })
      bumpRequired(themeOpt.minTier)
    }
    const animOpt = animMap.get(animationId)
    if (animOpt && !animOpt.unlocked && animationId !== initial.store.backgroundAnimation) {
      items.push({
        field: "backgroundAnimation",
        label: `${animOpt.name} background`,
        description: animOpt.description,
      })
      bumpRequired(animOpt.minTier)
    }
    if (
      accentColor.trim().length > 0 &&
      accentColor !== (initial.store.accentColor ?? "") &&
      !initial.gating.canPickAccentColor
    ) {
      items.push({
        field: "accentColor",
        label: "Custom accent color",
        description: "Tint the speech bubble border + store accents to your liking.",
      })
      bumpRequired("LIONHEART")
    }
    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 Phase 3 -- slug is premium-gated.
    const trimmedSlug = normalizeSlug(slug)
    if (
      trimmedSlug.length > 0 &&
      trimmedSlug !== (initial.store.slug ?? "") &&
      !initial.gating.canSetSlug
    ) {
      items.push({
        field: "slug",
        label: "Custom store URL",
        description: "Replace your numeric ID with a memorable handle like /store/cool-shop.",
      })
      bumpRequired("LIONHEART")
    }
    // --- END AI-MODIFIED ---

    return items.length > 0
      ? items.map((i) => ({ ...i }))
      : []
  }, [
    displayName, speechBubble, lionPose, themeId, animationId, accentColor, slug,
    initial, isPremium, themeMap, animMap,
  ])

  const requiredTier = useMemo<LionHeartTier>(() => {
    let highest: LionHeartTier = "LIONHEART"
    const rank: Record<LionHeartTier, number> = {
      FREE: 0, LIONHEART: 1, LIONHEART_PLUS: 2, LIONHEART_PLUS_PLUS: 3,
    }
    for (const item of lockedItems) {
      if (item.field === "themeId") {
        const t = themeMap.get(themeId)
        if (t && rank[t.minTier] > rank[highest]) highest = t.minTier
      } else if (item.field === "backgroundAnimation") {
        const a = animMap.get(animationId)
        if (a && rank[a.minTier] > rank[highest]) highest = a.minTier
      }
    }
    return highest
  }, [lockedItems, themeId, animationId, themeMap, animMap])

  const handleSave = useCallback(async () => {
    if (lockedItems.length > 0) {
      setUpgradePrompt({ open: true, items: lockedItems, requiredTier })
      return
    }

    setSaving(true)
    try {
      // Diff payload -- only send changed fields.
      const payload: Record<string, unknown> = {}
      if ((displayName || null) !== (initial.store.displayName || null)) {
        payload.displayName = displayName.trim() || null
      }
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
      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Marketplace 2.0 Phase 3 -- include slug in save diff.
      const normalizedSlug = normalizeSlug(slug)
      const slugForCompare = normalizedSlug === "" ? null : normalizedSlug
      if (slugForCompare !== (initial.store.slug || null)) {
        payload.slug = slugForCompare
      }
      // --- END AI-MODIFIED ---
      if (Object.keys(payload).length === 0) {
        toast.message("Nothing to save -- you haven't changed anything yet.")
        setSaving(false)
        return
      }
      await dashboardMutate("PUT", "/api/pet/marketplace/store/me", payload)
      toast.success("Store updated!")
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

  const previewBubble = speechBubble.trim() || initial.defaults.speechBubble

  return (
    <div className="space-y-5">
      {/* Inject font + animation CSS for the chosen theme so the preview
          renders correctly. */}
      <ThemeStyle
        themeId={themeId as any}
        animationId={animationId as any}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-6 items-start">
        {/* PREVIEW */}
        <div className="lg:sticky lg:top-4 space-y-3">
          <div className={cn("lg-store-theme-preview overflow-hidden p-4 border-2", `lg-store-theme-${themeId}`)}>
            {/* Preview wrapper inherits the theme via inline style so we can
                show actual theme colors without rebuilding the page wrapper. */}
            <PreviewWrapper themeId={themeId} animationId={animationId}>
              <StoreCanvas
                pet={pet}
                gameboySkinPath={gameboySkinPath}
                speechBubble={previewBubble}
                shopkeeperName={shopkeeperName}
                accentColor={accentColor || null}
                themeId={themeId as any}
                animationId={animationId as any}
                width={300}
                animated
              />
            </PreviewWrapper>
          </div>
          <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] text-center">
            Live preview &mdash; visitors will see this on{" "}
            <code className="text-[var(--pet-text,#e2e8f0)]">
              /pet/marketplace/store/{normalizeSlug(slug) || initial.store.slug || "your-id"}
            </code>
          </p>
        </div>

        {/* CONTROLS */}
        <div className="space-y-4">
          {/* Theme picker */}
          <PixelCard className="p-4 space-y-3" corners>
            <FieldHeader
              label="Theme"
              icon={<Palette size={14} />}
              hint="Picks the overall look. Free users see a lock icon on premium themes -- you can still preview them but Save will route through an upgrade prompt."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {initial.gating.themes.map((t) => {
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
                      className="h-10 w-full"
                      style={{
                        background: t.previewSwatch,
                        backgroundSize: "200% 200%",
                      }}
                    />
                    <div className="p-2 bg-[#080c18]">
                      <div className="flex items-center gap-1">
                        <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate">
                          {t.name}
                        </span>
                        {!t.unlocked && (
                          <Lock size={9} className="text-[var(--pet-gold,#f0c040)] flex-shrink-0" />
                        )}
                      </div>
                      <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#7a8a9a)] mt-0.5">
                        {t.unlocked ? "Free for you" : LION_HEART_TIER_LABELS[t.minTier]}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </PixelCard>

          {/* Background animation */}
          <PixelCard className="p-4 space-y-3" corners>
            <FieldHeader
              label="Background motion"
              icon={<Sparkles size={14} />}
              hint="Animates the background of your store. Respect the user's reduce-motion preference -- nothing animates if they have that on."
            />
            <div className="flex flex-wrap gap-2">
              {initial.gating.animations.map((a) => {
                const selected = animationId === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAnimationId(a.id)}
                    className={cn(
                      "font-pixel text-[11px] px-3 py-1.5 border-2 transition-all flex items-center gap-1",
                      selected
                        ? "border-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/15 text-[var(--pet-gold,#f0c040)]"
                        : "border-[#1a2a3c] bg-[#080c18] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)]",
                    )}
                  >
                    {!a.unlocked && <Lock size={9} />} {a.name}
                  </button>
                )
              })}
            </div>
          </PixelCard>

          {/* Accent color */}
          <PixelCard className="p-4 space-y-3" corners>
            <FieldHeader
              label="Accent color"
              icon={<Palette size={14} />}
              locked={!initial.gating.canPickAccentColor}
              hint="Tints the speech bubble border. Leave blank to inherit from the chosen theme."
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor || "#f0c040"}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-12 h-10 border-2 border-[#1a2a3c] bg-[#080c18] cursor-pointer"
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
          </PixelCard>

          {/* Store name */}
          <PixelCard className="p-4 space-y-3" corners>
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
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
              {displayName.length}/{initial.defaults.storeNameMaxLength}
            </p>
          </PixelCard>

          {/* --- AI-MODIFIED (2026-04-29) --- */}
          {/* Purpose: Marketplace 2.0 Phase 3 -- vanity slug picker */}
          <PixelCard className="p-4 space-y-3" corners>
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
              const shape = validateSlugShape(normalizeSlug(slug))
              if (shape) {
                return (
                  <p className="font-pixel text-[10px] text-[var(--pet-rose,#ff6b9d)]">{shape.message}</p>
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
          {/* --- END AI-MODIFIED --- */}

          {/* Speech bubble */}
          <PixelCard className="p-4 space-y-3" corners>
            <FieldHeader
              label="Speech bubble"
              icon={<MessageSquare size={14} />}
              hint="Your lion shopkeeper will say this. Free up to 100 characters; LionHeart members can write up to 500."
            />
            <textarea
              value={speechBubble}
              maxLength={initial.defaults.speechBubbleMaxLengthPremium}
              onChange={(e) => setSpeechBubble(e.target.value)}
              placeholder={initial.defaults.speechBubble}
              rows={3}
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

          {/* Lion pose */}
          <PixelCard className="p-4 space-y-3" corners>
            <FieldHeader
              label="Lion pose"
              locked={!initial.gating.canPickPremiumLionPose}
              hint="The pose your lion shopkeeper holds. New animated poses ship with LionHeart."
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
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-4 px-4 pb-4 pt-3 bg-gradient-to-t from-[var(--pet-bg,#02050d)] via-[var(--pet-bg,#02050d)] to-transparent">
        <div className="flex items-center justify-end gap-2">
          {lockedItems.length > 0 && (
            <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)] mr-auto flex items-center gap-1.5">
              <Lock size={10} /> {lockedItems.length} premium change{lockedItems.length === 1 ? "" : "s"} pending
            </span>
          )}
          <PixelButton
            variant="primary"
            size="lg"
            onClick={handleSave}
            loading={saving}
            disabled={saving}
          >
            <Save size={12} className="mr-1" /> Save changes
          </PixelButton>
        </div>
      </div>

      <UpgradePrompt
        open={upgradePrompt.open}
        onClose={() => setUpgradePrompt((s) => ({ ...s, open: false }))}
        requiredTier={upgradePrompt.requiredTier}
        lockedItems={upgradePrompt.items}
      />
    </div>
  )
}

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

interface PreviewWrapperProps {
  themeId: string
  animationId: string
  children: React.ReactNode
}

function PreviewWrapper({ themeId, animationId, children }: PreviewWrapperProps) {
  // Read the theme color directly via getComputedStyle on the
  // pre-injected ThemeStyle definition; cleaner to just inline it.
  // We fall back to the default theme colors if anything is undefined.
  const knownThemes: Record<string, { bg: string; panel: string }> = {
    default:    { bg: "linear-gradient(180deg, #02050d 0%, #0c1020 100%)", panel: "#0c1020" },
    stardew:    { bg: "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, #4a2c14 0 2px, #6b4220 2px 240px, #4a2c14 240px 242px, #8b6033 242px 480px)", panel: "#f8e8c0" },
    pokemon:    { bg: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", panel: "#f5f0e6" },
    earthbound: { bg: "linear-gradient(135deg, #ff6b9d 0%, #ffd93d 25%, #6bcf7f 50%, #4dc4ff 75%, #c084fc 100%)", panel: "rgba(10,10,10,0.85)" },
    gameboy:    { bg: "repeating-linear-gradient(0deg, rgba(15,56,15,0.9) 0 2px, rgba(48,98,48,0.9) 2px 4px)", panel: "#9bbc0f" },
  }
  const theme = knownThemes[themeId] ?? knownThemes.default

  return (
    <div
      className={cn(
        "lg-store-bg relative",
        animationId !== "none" && "lg-store-anim",
        animationId === "parallax-clouds" && "lg-store-anim-parallax-clouds",
        animationId === "pulse" && "lg-store-anim-pulse",
        animationId === "rainbow" && "lg-store-anim-rainbow",
      )}
      style={{
        background: theme.bg,
        backgroundSize: animationId === "rainbow" ? "400% 400%" : undefined,
        padding: 16,
        minHeight: 320,
      }}
    >
      <div className="flex justify-center">{children}</div>
    </div>
  )
}
