// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- owner-side store config endpoint.
//
//          GET returns the caller's own store config plus the field
//          gating metadata (which fields they can edit at their
//          current tier, and which tier each gated field needs).
//
//          PUT accepts partial updates. EVERY premium-gated field
//          is validated server-side: a free user trying to set a
//          custom display_name gets a 403 with `{ code: "PREMIUM_REQUIRED",
//          field: "display_name", requiredTier: "LIONHEART" }` so the
//          UI can render a contextual upsell prompt instead of
//          silently dropping the change.
//
//          This is the single write path for store settings. Phase 2
//          will extend it with theme_id / accent_color / background_animation
//          gating; the schema columns already exist for those.
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import {
  getUserTier, tierAtLeast, LION_HEART_TIER_LABELS, type LionHeartTier,
  getFeaturedListingSlots,
} from "@/utils/subscription"
import {
  STORE_NAME_MAX_LENGTH, SPEECH_BUBBLE_MAX_FREE, SPEECH_BUBBLE_MAX_PREMIUM,
} from "@/utils/marketplace"
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 Phase 2 -- accept theme / animation / accent
// updates with the same field-level gating pattern as Phase 1 fields.
import {
  STORE_THEMES, STORE_ANIMATIONS, STORE_THEME_ORDER, STORE_ANIMATION_ORDER,
  canUseTheme, canUseAnimation, isValidThemeId, isValidAnimationId,
  sanitizeAccentColor,
  type StoreThemeId, type StoreAnimationId,
} from "@/constants/StoreThemes"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 Phase 3 -- vanity slug validation pipeline.
import {
  validateSlug, normalizeSlug, SLUG_MIN_LENGTH, SLUG_MAX_LENGTH,
} from "@/utils/storeSlug"
// --- END AI-MODIFIED ---

const DEFAULT_SPEECH_BUBBLE = "Welcome to my shop! Have a look around."

// Phase 1 lion poses. Free users get "idle"; the rest are reserved for
// LionHeart subscribers (the bot will animate these once the assets exist;
// for now they all map to the same idle sprite, but the gating is correct).
const FREE_LION_POSES = ["idle"] as const
const PREMIUM_LION_POSES = ["wave", "sit", "sleep"] as const
const ALL_LION_POSES = new Set<string>([...FREE_LION_POSES, ...PREMIUM_LION_POSES])

interface StorePayload {
  displayName: string | null
  effectiveName: string
  speechBubble: string
  lionPose: string
  themeId: string
  accentColor: string | null
  backgroundAnimation: string
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 3 -- vanity slug, null when unset.
  slug: string | null
  // --- END AI-MODIFIED ---
}

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

interface GatingPayload {
  tier: LionHeartTier
  tierLabel: string
  speechBubbleMaxLength: number
  canSetDisplayName: boolean
  canPickPremiumLionPose: boolean
  // Phase 2 -- theme + animation + color gating filled in by the customizer.
  canPickPremiumTheme: boolean
  canPickPremiumAnimation: boolean
  canPickAccentColor: boolean
  themes: ThemeOption[]
  animations: AnimationOption[]
  // Phase 3 -- slug + featured perks.
  canSetSlug: boolean
  featuredSlots: number
  slugMinLength: number
  slugMaxLength: number
}

function buildGating(tier: LionHeartTier): GatingPayload {
  const isPremium = tier !== "FREE"
  return {
    tier,
    tierLabel: LION_HEART_TIER_LABELS[tier],
    speechBubbleMaxLength: isPremium ? SPEECH_BUBBLE_MAX_PREMIUM : SPEECH_BUBBLE_MAX_FREE,
    canSetDisplayName: isPremium,
    canPickPremiumLionPose: isPremium,
    canPickPremiumTheme: isPremium,
    canPickPremiumAnimation: isPremium,
    canPickAccentColor: isPremium,
    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 Phase 3 -- slug + featured perks gating.
    canSetSlug: isPremium,
    featuredSlots: getFeaturedListingSlots(tier),
    slugMinLength: SLUG_MIN_LENGTH,
    slugMaxLength: SLUG_MAX_LENGTH,
    // --- END AI-MODIFIED ---
    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 Phase 2 -- ship the theme + animation
    // catalogs with the gating payload so the customizer doesn't have
    // to import StoreThemes.ts on the client (lighter bundle, single
    // source of truth).
    themes: STORE_THEME_ORDER.map((id) => {
      const t = STORE_THEMES[id]
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        minTier: t.minTier,
        unlocked: canUseTheme(tier, t.id),
        previewSwatch: t.previewSwatch,
      }
    }),
    animations: STORE_ANIMATION_ORDER.map((id) => {
      const a = STORE_ANIMATIONS[id]
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        minTier: a.minTier,
        unlocked: canUseAnimation(tier, a.id),
      }
    }),
    // --- END AI-MODIFIED ---
  }
}

class HttpError extends Error {
  status: number
  body?: Record<string, unknown>
  constructor(status: number, message: string, body?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.body = body
  }
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userid = BigInt(auth.discordId)
    const [storeRow, userConfig, tier] = await Promise.all([
      prisma.lg_user_stores.findUnique({ where: { userid } }),
      prisma.user_config.findUnique({
        where: { userid }, select: { name: true },
      }),
      getUserTier(userid),
    ])

    const fallbackName = userConfig?.name ?? `Player${auth.discordId.slice(-4)}`
    const store: StorePayload = {
      displayName: storeRow?.display_name ?? null,
      effectiveName: storeRow?.display_name ?? `${fallbackName}'s Shop`,
      speechBubble: storeRow?.speech_bubble ?? DEFAULT_SPEECH_BUBBLE,
      lionPose: storeRow?.lion_pose ?? "idle",
      themeId: storeRow?.theme_id ?? "default",
      accentColor: storeRow?.accent_color ?? null,
      backgroundAnimation: storeRow?.background_animation ?? "none",
      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Marketplace 2.0 Phase 3 -- vanity slug.
      slug: storeRow?.slug ?? null,
      // --- END AI-MODIFIED ---
    }

    return res.status(200).json({
      store,
      gating: buildGating(tier),
      defaults: {
        speechBubble: DEFAULT_SPEECH_BUBBLE,
        speechBubbleMaxLengthFree: SPEECH_BUBBLE_MAX_FREE,
        speechBubbleMaxLengthPremium: SPEECH_BUBBLE_MAX_PREMIUM,
        storeNameMaxLength: STORE_NAME_MAX_LENGTH,
        freeLionPoses: FREE_LION_POSES,
        premiumLionPoses: PREMIUM_LION_POSES,
      },
    })
  },

  async PUT(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userid = BigInt(auth.discordId)
    const tier = await getUserTier(userid)
    const isPremium = tier !== "FREE"

    const body = (req.body ?? {}) as Partial<{
      displayName: string | null
      speechBubble: string | null
      lionPose: string
      themeId: string
      backgroundAnimation: string
      accentColor: string | null
      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Marketplace 2.0 Phase 3 -- vanity slug.
      slug: string | null
      // --- END AI-MODIFIED ---
    }>

    const updateData: Record<string, unknown> = {}

    try {
      if ("displayName" in body) {
        const raw = body.displayName
        if (raw === null || raw === undefined || raw === "") {
          // Clearing the custom name is always allowed -- falls back to Discord username.
          updateData.display_name = null
        } else {
          if (!isPremium) {
            throw new HttpError(403, "Custom store names are a LionHeart perk.", {
              code: "PREMIUM_REQUIRED", field: "displayName", requiredTier: "LIONHEART",
            })
          }
          const trimmed = String(raw).trim()
          if (trimmed.length === 0) {
            updateData.display_name = null
          } else if (trimmed.length > STORE_NAME_MAX_LENGTH) {
            throw new HttpError(400, `Store name must be ${STORE_NAME_MAX_LENGTH} characters or fewer.`)
          } else {
            updateData.display_name = trimmed
          }
        }
      }

      if ("speechBubble" in body) {
        const raw = body.speechBubble
        if (raw === null || raw === undefined || raw === "") {
          updateData.speech_bubble = null
        } else {
          const trimmed = String(raw).trim()
          if (trimmed.length === 0) {
            updateData.speech_bubble = null
          } else {
            const cap = isPremium ? SPEECH_BUBBLE_MAX_PREMIUM : SPEECH_BUBBLE_MAX_FREE
            if (trimmed.length > cap) {
              throw new HttpError(
                isPremium ? 400 : 403,
                isPremium
                  ? `Speech bubble must be ${cap} characters or fewer.`
                  : `Free speech bubbles are limited to ${SPEECH_BUBBLE_MAX_FREE} characters. ` +
                    `Upgrade to LionHeart for up to ${SPEECH_BUBBLE_MAX_PREMIUM}.`,
                isPremium ? undefined : {
                  code: "PREMIUM_REQUIRED",
                  field: "speechBubble",
                  requiredTier: "LIONHEART",
                  freeLimit: SPEECH_BUBBLE_MAX_FREE,
                  premiumLimit: SPEECH_BUBBLE_MAX_PREMIUM,
                },
              )
            }
            updateData.speech_bubble = trimmed
          }
        }
      }

      if ("lionPose" in body) {
        const pose = String(body.lionPose ?? "idle")
        if (!ALL_LION_POSES.has(pose)) {
          throw new HttpError(400, `Unknown lion pose: ${pose}`)
        }
        if (!FREE_LION_POSES.includes(pose as (typeof FREE_LION_POSES)[number]) && !isPremium) {
          throw new HttpError(403, "Premium lion poses require LionHeart.", {
            code: "PREMIUM_REQUIRED",
            field: "lionPose",
            requiredTier: "LIONHEART",
          })
        }
        updateData.lion_pose = pose
      }

      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Marketplace 2.0 Phase 2 -- theme / animation / accent
      // updates. Theme + animation are validated against the per-id minTier
      // table in StoreThemes.ts; accent color is validated as a CSS hex
      // color before being persisted.
      if ("themeId" in body) {
        const themeId = String(body.themeId ?? "default")
        if (!isValidThemeId(themeId)) {
          throw new HttpError(400, `Unknown store theme: ${themeId}`)
        }
        if (!canUseTheme(tier, themeId as StoreThemeId)) {
          throw new HttpError(403, `That store theme requires ${LION_HEART_TIER_LABELS[STORE_THEMES[themeId as StoreThemeId].minTier]}.`, {
            code: "PREMIUM_REQUIRED",
            field: "themeId",
            requiredTier: STORE_THEMES[themeId as StoreThemeId].minTier,
          })
        }
        updateData.theme_id = themeId
      }

      if ("backgroundAnimation" in body) {
        const animId = String(body.backgroundAnimation ?? "none")
        if (!isValidAnimationId(animId)) {
          throw new HttpError(400, `Unknown background animation: ${animId}`)
        }
        if (!canUseAnimation(tier, animId as StoreAnimationId)) {
          throw new HttpError(403, `That background animation requires ${LION_HEART_TIER_LABELS[STORE_ANIMATIONS[animId as StoreAnimationId].minTier]}.`, {
            code: "PREMIUM_REQUIRED",
            field: "backgroundAnimation",
            requiredTier: STORE_ANIMATIONS[animId as StoreAnimationId].minTier,
          })
        }
        updateData.background_animation = animId
      }

      if ("accentColor" in body) {
        const raw = body.accentColor
        if (raw === null || raw === undefined || raw === "") {
          // Clearing the accent always allowed -- falls back to theme accent.
          updateData.accent_color = null
        } else {
          if (!isPremium) {
            throw new HttpError(403, "Custom accent colors are a LionHeart perk.", {
              code: "PREMIUM_REQUIRED",
              field: "accentColor",
              requiredTier: "LIONHEART",
            })
          }
          const sanitized = sanitizeAccentColor(String(raw))
          if (!sanitized) {
            throw new HttpError(400, "Accent color must be a CSS hex color (e.g. #f0c040).")
          }
          updateData.accent_color = sanitized
        }
      }
      // --- END AI-MODIFIED ---

      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Marketplace 2.0 Phase 3 -- vanity slug update. Premium-gated;
      // FREE users that send a non-empty slug get a PREMIUM_REQUIRED 403 so
      // the customizer can render an UpgradePrompt. Empty / null clears the
      // slug, which is always allowed (lets a former subscriber reset).
      if ("slug" in body) {
        const raw = body.slug
        if (raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "")) {
          updateData.slug = null
        } else {
          if (!isPremium) {
            throw new HttpError(403, "Custom store URLs are a LionHeart perk.", {
              code: "PREMIUM_REQUIRED", field: "slug", requiredTier: "LIONHEART",
            })
          }
          const normalized = normalizeSlug(String(raw))
          const slugError = await validateSlug(normalized, userid)
          if (slugError) {
            throw new HttpError(400, slugError.message, {
              code: `SLUG_${slugError.code}`,
              field: "slug",
            })
          }
          updateData.slug = normalized
        }
      }
      // --- END AI-MODIFIED ---

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No editable fields supplied." })
      }

      updateData.updated_at = new Date()

      const saved = await prisma.lg_user_stores.upsert({
        where: { userid },
        create: { userid, ...(updateData as any) },
        update: updateData as any,
      })

      return res.status(200).json({
        ok: true,
        store: {
          displayName: saved.display_name ?? null,
          speechBubble: saved.speech_bubble ?? DEFAULT_SPEECH_BUBBLE,
          lionPose: saved.lion_pose,
          themeId: saved.theme_id,
          accentColor: saved.accent_color ?? null,
          backgroundAnimation: saved.background_animation,
          // --- AI-MODIFIED (2026-04-29) ---
          // Purpose: Marketplace 2.0 Phase 3 -- echo back the slug so
          // optimistic UI / customizer can show the updated URL.
          slug: saved.slug ?? null,
          // --- END AI-MODIFIED ---
        },
        gating: buildGating(tier),
      })
    } catch (e: any) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message, ...(e.body ?? {}) })
      }
      throw e
    }
  },
})

// Make it explicit that tierAtLeast is intentionally exported by the
// module even though Phase 1 only uses isPremium derived inline -- the
// Phase 2 customizer will need it to gate theme picks per ThemeTier.
void tierAtLeast
