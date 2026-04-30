// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: "Feature Your Server" dashboard editor.
//
//          This page lets a premium server admin design the
//          public profile page that lives at /servers/[slug].
//          Layout:
//            - Page header w/ status badge + view-public-page link
//            - PremiumGate fallback for non-premium guilds
//            - Two-pane layout (form left, live-preview iframe right)
//            - Collapsible SectionCards: Basics, Branding,
//              Categorization, Invite, External Link, Sections
//            - SaveBar at the bottom: "Save draft" + "Submit for review"
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  DashboardShell,
  PageHeader,
  SectionCard,
  TextInput,
  Toggle,
  Badge,
  toast,
} from "@/components/dashboard/ui"
import PremiumGate from "@/components/dashboard/PremiumGate"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useCallback, useMemo, useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import {
  Globe, Sparkles, Image as ImageIcon, Tags as TagsIcon, Palette,
  Link2, Eye, ExternalLink, RefreshCw,
  Check, AlertTriangle, Send, Save, Trash2, Upload, Info,
  MapPin, Languages, FileText, BadgeCheck,
} from "lucide-react"
import {
  LISTING_CATEGORIES,
  LISTING_THEMES,
  LISTING_FONTS,
  LISTING_COUNTRIES,
  LISTING_LANGUAGES,
  LISTING_AGE_BANDS,
  LISTING_SECTIONS,
  LISTING_BLEND_MODES,
  DEFAULT_SECTIONS_ENABLED,
  MAX_GALLERY_IMAGES,
  MAX_SECONDARY_TAGS,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAGLINE_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  COVER_RECOMMENDED_WIDTH,
  COVER_RECOMMENDED_HEIGHT,
  // --- AI-MODIFIED (2026-04-30) ---
  // Phase 3 -- gem-promotion constants used by the boost card.
  LISTING_PROMOTION_GEM_COST,
  LISTING_PROMOTION_HOURS,
  // --- END AI-MODIFIED ---
  type ListingSectionKey,
} from "@/constants/ServerListingData"
import { LISTING_IMAGE_CONSTRAINTS } from "@/utils/listingBlob"
import {
  validateListingSlugShape,
  normalizeListingSlug,
  LISTING_SLUG_MAX_LENGTH,
} from "@/utils/listingSlug"
import type { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Types ─────────────────────────────────────────────────────

interface GalleryImage {
  url: string
  caption?: string
}

interface ListingDTO {
  guildid: string
  slug: string
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "ARCHIVED"
  display_name: string
  tagline: string | null
  description: string
  cover_image_url: string | null
  guild_icon_url: string | null
  gallery_images: GalleryImage[]
  category: string
  secondary_tags: string[]
  is_study_server: boolean
  primary_country: string | null
  primary_language: string | null
  audience_age: string | null
  theme_preset: string
  accent_color: string | null
  font_family: string | null
  cover_blend_mode: string
  invite_code: string | null
  invite_managed: boolean
  invite_last_rotated: string | null
  external_link_url: string | null
  external_link_label: string | null
  sections_enabled: Record<string, boolean>
  nsfw_confirmed: boolean
  submitted_at: string | null
  approved_at: string | null
  rejection_reason: string | null
  pending_changes: Record<string, any> | null
  view_count: number
  invite_click_count: number
  promoted_until: string | null
}

interface ListingApiResponse {
  isPremium: boolean
  premiumUntil: string | null
  inGracePeriod: boolean
  graceDaysRemaining: number
  guild: { name: string | null }
  listing: ListingDTO | null
  suggestedSlug: string | null
  previewToken: string | null
}

interface FormState {
  slug: string
  display_name: string
  tagline: string
  description: string
  cover_image_url: string | null
  guild_icon_url: string | null
  gallery_images: GalleryImage[]
  category: string
  secondary_tags: string[]
  is_study_server: boolean
  primary_country: string
  primary_language: string
  audience_age: string
  theme_preset: string
  accent_color: string
  font_family: string
  cover_blend_mode: string
  external_link_url: string
  external_link_label: string
  sections_enabled: Record<string, boolean>
  nsfw_confirmed: boolean
}

type StatusBadgeVariant = "default" | "success" | "warning" | "error" | "info" | "purple"

const STATUS_BADGES: Record<ListingDTO["status"], { variant: StatusBadgeVariant; label: string; tooltip: string }> = {
  DRAFT:    { variant: "default", label: "Draft",            tooltip: "Save when ready -- not yet submitted." },
  PENDING:  { variant: "warning", label: "Pending review",   tooltip: "Waiting for our team to approve. Usually within 24h." },
  APPROVED: { variant: "success", label: "Live",             tooltip: "Your page is live at /servers/your-slug." },
  REJECTED: { variant: "error",   label: "Needs changes",    tooltip: "We sent feedback -- update and re-submit." },
  EXPIRED:  { variant: "warning", label: "Premium expired",  tooltip: "Renew premium to keep your listing live." },
  ARCHIVED: { variant: "default", label: "Archived",         tooltip: "Inactive listing. Slug has been freed." },
}

function emptyForm(suggestedSlug: string, guildName: string): FormState {
  return {
    slug: suggestedSlug || "",
    display_name: guildName || "",
    tagline: "",
    description: "",
    cover_image_url: null,
    guild_icon_url: null,
    gallery_images: [],
    category: LISTING_CATEGORIES[0].id,
    secondary_tags: [],
    is_study_server: true,
    primary_country: "",
    primary_language: "en",
    audience_age: "13+",
    theme_preset: "midnight",
    accent_color: LISTING_THEMES[0].defaultAccent,
    font_family: "inter",
    cover_blend_mode: "fade",
    external_link_url: "",
    external_link_label: "",
    sections_enabled: { ...DEFAULT_SECTIONS_ENABLED },
    nsfw_confirmed: false,
  }
}

function formFromListing(l: ListingDTO): FormState {
  return {
    slug: l.slug,
    display_name: l.display_name,
    tagline: l.tagline ?? "",
    description: l.description ?? "",
    cover_image_url: l.cover_image_url,
    guild_icon_url: l.guild_icon_url,
    gallery_images: l.gallery_images ?? [],
    category: l.category,
    secondary_tags: l.secondary_tags ?? [],
    is_study_server: l.is_study_server,
    primary_country: l.primary_country ?? "",
    primary_language: l.primary_language ?? "",
    audience_age: l.audience_age ?? "",
    theme_preset: l.theme_preset,
    accent_color: l.accent_color ?? LISTING_THEMES.find((t) => t.id === l.theme_preset)?.defaultAccent ?? "#3b82f6",
    font_family: l.font_family ?? "inter",
    cover_blend_mode: l.cover_blend_mode ?? "fade",
    external_link_url: l.external_link_url ?? "",
    external_link_label: l.external_link_label ?? "",
    sections_enabled: { ...DEFAULT_SECTIONS_ENABLED, ...(l.sections_enabled ?? {}) },
    nsfw_confirmed: l.nsfw_confirmed,
  }
}

// ── The main editor ───────────────────────────────────────────

function ListingEditorInner({ data, mutate }: { data: ListingApiResponse; mutate: () => void }) {
  const router = useRouter()
  const guildId = router.query.id as string

  const [form, setForm] = useState<FormState>(() =>
    data.listing ? formFromListing(data.listing) : emptyForm(data.suggestedSlug ?? "", data.guild.name ?? ""),
  )
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [regenInvite, setRegenInvite] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  const slugError = useMemo(() => {
    const normalized = normalizeListingSlug(form.slug)
    return validateListingSlugShape(normalized)
  }, [form.slug])

  const canSubmit = useMemo(() => {
    return (
      !slugError &&
      form.display_name.trim().length > 0 &&
      form.description.trim().length >= 20 &&
      form.category &&
      form.nsfw_confirmed
    )
  }, [slugError, form])

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSlugChange = useCallback((raw: string) => {
    const normalized = normalizeListingSlug(raw)
    updateField("slug", normalized)
  }, [updateField])

  const handleSecondaryTagToggle = useCallback((tagId: string) => {
    setForm((prev) => {
      const current = prev.secondary_tags
      if (current.includes(tagId)) {
        return { ...prev, secondary_tags: current.filter((t) => t !== tagId) }
      }
      if (current.length >= MAX_SECONDARY_TAGS) {
        toast.error(`You can pick at most ${MAX_SECONDARY_TAGS} secondary tags.`)
        return prev
      }
      return { ...prev, secondary_tags: [...current, tagId] }
    })
  }, [])

  const handleCoverUpload = useCallback(async (file: File) => {
    const constraints = LISTING_IMAGE_CONSTRAINTS.cover
    if (file.size > constraints.maxBytes) {
      toast.error(`Cover image must be ${(constraints.maxBytes / 1024 / 1024).toFixed(0)}MB or smaller.`)
      return
    }
    if (!constraints.allowedContentTypes.includes(file.type)) {
      toast.error("Cover image must be JPG, PNG, or WebP.")
      return
    }
    setCoverUploading(true)
    try {
      const result = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `/api/dashboard/servers/${guildId}/listing/upload-token`,
        clientPayload: JSON.stringify({ kind: "cover", filename: file.name }),
      })
      updateField("cover_image_url", result.url)
      toast.success("Cover image uploaded.")
    } catch (err: any) {
      toast.error(err?.message || "Cover upload failed.")
    } finally {
      setCoverUploading(false)
    }
  }, [guildId, updateField])

  const handleGalleryUpload = useCallback(async (file: File) => {
    if (form.gallery_images.length >= MAX_GALLERY_IMAGES) {
      toast.error(`Up to ${MAX_GALLERY_IMAGES} gallery images.`)
      return
    }
    const constraints = LISTING_IMAGE_CONSTRAINTS.gallery
    if (file.size > constraints.maxBytes) {
      toast.error(`Gallery images must be ${(constraints.maxBytes / 1024 / 1024).toFixed(0)}MB or smaller.`)
      return
    }
    if (!constraints.allowedContentTypes.includes(file.type)) {
      toast.error("Gallery images must be JPG, PNG, or WebP.")
      return
    }
    setGalleryUploading(true)
    try {
      const result = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `/api/dashboard/servers/${guildId}/listing/upload-token`,
        clientPayload: JSON.stringify({ kind: "gallery", filename: file.name }),
      })
      setForm((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, { url: result.url }],
      }))
      toast.success("Gallery image added.")
    } catch (err: any) {
      toast.error(err?.message || "Gallery upload failed.")
    } finally {
      setGalleryUploading(false)
    }
  }, [form.gallery_images.length, guildId])

  const removeGalleryImage = useCallback((idx: number) => {
    setForm((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== idx),
    }))
  }, [])

  const handleRegenerateInvite = useCallback(async () => {
    setRegenInvite(true)
    try {
      const res = await dashboardMutate("POST", `/api/dashboard/servers/${guildId}/listing/regenerate-invite`)
      toast.success(`Invite created: discord.gg/${res.invite_code}`)
      mutate()
    } catch (err: any) {
      toast.error(err?.message || "Couldn't create the invite.")
    } finally {
      setRegenInvite(false)
    }
  }, [guildId, mutate])

  const submitListing = useCallback(async (asSubmit: boolean) => {
    if (asSubmit && !canSubmit) {
      toast.error("Please complete all required fields and confirm there's no NSFW content.")
      return
    }
    setSaving(asSubmit ? "submit" : "draft")
    try {
      const body = {
        ...form,
        tagline: form.tagline.trim() || null,
        primary_country: form.primary_country || null,
        primary_language: form.primary_language || null,
        audience_age: form.audience_age || null,
        external_link_url: form.external_link_url.trim() || null,
        external_link_label: form.external_link_label.trim() || null,
        accent_color: form.accent_color || null,
        font_family: form.font_family || null,
        submit: asSubmit,
      }
      const res = await dashboardMutate("PUT", `/api/dashboard/servers/${guildId}/listing`, body)
      toast.success(res.message || (asSubmit ? "Submitted for review." : "Saved."))
      invalidate(`/api/dashboard/servers/${guildId}/listing`)
      mutate()
      setPreviewKey((k) => k + 1)
    } catch (err: any) {
      toast.error(err?.message || "Save failed.")
    } finally {
      setSaving(null)
    }
  }, [form, guildId, canSubmit, mutate])

  const previewUrl = useMemo(() => {
    if (!data.previewToken) return null
    const slug = normalizeListingSlug(form.slug)
    if (!slug) return null
    return `/servers/${slug}?preview=${encodeURIComponent(data.previewToken)}`
  }, [data.previewToken, form.slug])

  const status = data.listing?.status ?? "DRAFT"
  const statusBadge = STATUS_BADGES[status]
  const hasPendingChanges = !!data.listing?.pending_changes

  return (
    <>
      <PageHeader
        title="Feature Your Server"
        description="Build a stunning public profile for your community. Approved pages are added to lionbot.org/servers and indexed by search engines for serious SEO juice."
        breadcrumbs={[
          { label: "Servers", href: "/dashboard/servers" },
          { label: data.guild.name ?? "Server", href: `/dashboard/servers/${guildId}` },
          { label: "Feature Your Server" },
        ]}
        actions={
          <div className="flex items-center gap-2" title={statusBadge.tooltip}>
            <Badge variant={statusBadge.variant} dot>{statusBadge.label}</Badge>
            {data.listing?.status === "APPROVED" && (
              <a
                href={`/servers/${data.listing.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                View public page <ExternalLink size={12} />
              </a>
            )}
          </div>
        }
      />

      {data.listing?.rejection_reason && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-300">We need a few changes:</p>
              <p className="text-sm text-red-200/80 mt-1 whitespace-pre-line">{data.listing.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      {data.listing?.status === "EXPIRED" && data.inGracePeriod && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-300">
                Your premium expired. Listing hides in {data.graceDaysRemaining} day{data.graceDaysRemaining === 1 ? "" : "s"}.
              </p>
              <p className="text-sm text-amber-200/80 mt-1">Renew your server premium subscription to keep your page live.</p>
            </div>
          </div>
        </div>
      )}

      {hasPendingChanges && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-300">Edits are pending re-approval</p>
              <p className="text-sm text-blue-200/80 mt-1">
                Your live page stays unchanged until we approve the new version.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">
        {/* ── Form column ─────────────────────────────────── */}
        <div className="space-y-4 min-w-0">
          <SectionCard title="Basics" description="Name, URL, description" icon={<FileText size={16} />} defaultOpen>
            <div className="space-y-4 pt-4">
              <TextInput
                label="Display name"
                value={form.display_name}
                onChange={(v) => updateField("display_name", v)}
                placeholder="Your community's public name"
                maxLength={MAX_DISPLAY_NAME_LENGTH}
              />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Public URL</label>
                <div className="mt-1 flex items-stretch gap-0 rounded-lg border border-input bg-card overflow-hidden">
                  <span className="px-3 py-2 text-sm text-muted-foreground bg-muted/40 border-r border-input flex items-center">
                    lionbot.org/servers/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="study-haven"
                    maxLength={LISTING_SLUG_MAX_LENGTH}
                    className="flex-1 px-3 py-2 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                {slugError ? (
                  <p className="mt-1 text-xs text-red-400">{slugError.message}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Lowercase letters, numbers, hyphens, underscores. Choose carefully -- this is your permanent URL.</p>
                )}
              </div>
              <TextInput
                label="Tagline"
                value={form.tagline}
                onChange={(v) => updateField("tagline", v)}
                placeholder="A one-line hook that grabs attention"
                maxLength={MAX_TAGLINE_LENGTH}
              />
              <TextInput
                label="Long description (Markdown supported)"
                value={form.description}
                onChange={(v) => updateField("description", v)}
                placeholder="Tell visitors why your community is worth joining. Min 20 characters."
                multiline
                rows={6}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
            </div>
          </SectionCard>

          <SectionCard title="Branding" description="Cover, theme, colours, fonts" icon={<Palette size={16} />}>
            <div className="space-y-5 pt-4">
              <CoverUploadField
                value={form.cover_image_url}
                uploading={coverUploading}
                onUpload={handleCoverUpload}
                onClear={() => updateField("cover_image_url", null)}
              />
              <ThemePickerGrid
                selected={form.theme_preset}
                onSelect={(id) => {
                  const t = LISTING_THEMES.find((x) => x.id === id)
                  setForm((prev) => ({
                    ...prev,
                    theme_preset: id,
                    accent_color: t?.defaultAccent ?? prev.accent_color,
                  }))
                }}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Accent colour</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="color"
                      value={form.accent_color}
                      onChange={(e) => updateField("accent_color", e.target.value.toLowerCase())}
                      className="h-10 w-14 rounded-lg border border-input bg-card cursor-pointer"
                      aria-label="Accent colour"
                    />
                    <input
                      type="text"
                      value={form.accent_color}
                      onChange={(e) => updateField("accent_color", e.target.value.toLowerCase())}
                      pattern="^#[0-9a-fA-F]{6}$"
                      className="flex-1 px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Headline font</label>
                  <select
                    value={form.font_family}
                    onChange={(e) => updateField("font_family", e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {LISTING_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>{f.label} -- {f.mood}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Cover blend mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {LISTING_BLEND_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateField("cover_blend_mode", m.id)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        form.cover_blend_mode === m.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <div className="font-medium">{m.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{m.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <GalleryUploadField
                images={form.gallery_images}
                uploading={galleryUploading}
                onUpload={handleGalleryUpload}
                onRemove={removeGalleryImage}
              />
            </div>
          </SectionCard>

          <SectionCard title="Categorization" description="Help people discover your server" icon={<TagsIcon size={16} />}>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Primary category</label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    const next = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      category: next,
                      secondary_tags: prev.secondary_tags.filter((t) => t !== next),
                    }))
                  }}
                  className="mt-1 w-full px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {LISTING_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">{LISTING_CATEGORIES.find((c) => c.id === form.category)?.description}</p>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Secondary tags</label>
                  <span className="text-xs text-muted-foreground">{form.secondary_tags.length}/{MAX_SECONDARY_TAGS}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {LISTING_CATEGORIES.filter((c) => c.id !== form.category).map((c) => {
                    const active = form.secondary_tags.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSecondaryTagToggle(c.id)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          active
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"><MapPin size={12} /> Country</label>
                  <select
                    value={form.primary_country}
                    onChange={(e) => updateField("primary_country", e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">--</option>
                    {LISTING_COUNTRIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.flag} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Languages size={12} /> Language</label>
                  <select
                    value={form.primary_language}
                    onChange={(e) => updateField("primary_language", e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">--</option>
                    {LISTING_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Audience age</label>
                  <select
                    value={form.audience_age}
                    onChange={(e) => updateField("audience_age", e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">--</option>
                    {LISTING_AGE_BANDS.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Toggle
                  label="Mark as a study server"
                  checked={form.is_study_server}
                  onChange={(v) => updateField("is_study_server", v)}
                />
                <p className="text-xs text-muted-foreground pl-[3.5rem]">Servers tagged as study servers get featured in the Study filter on /servers.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Discord invite" description="Bot-managed link your visitors click to join" icon={<Sparkles size={16} />}>
            <div className="space-y-4 pt-4">
              {data.listing?.invite_code ? (
                <div className="p-3 rounded-lg bg-card border border-border flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Current invite</div>
                    <div className="text-sm font-mono text-foreground truncate">discord.gg/{data.listing?.invite_code}</div>
                    {data.listing?.invite_last_rotated && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Last rotated {new Date(data.listing.invite_last_rotated).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateInvite}
                    disabled={regenInvite}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={regenInvite ? "animate-spin" : ""} /> Regenerate
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-card border border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground mb-3">No invite yet. Leo will create and rotate it for you.</p>
                  <button
                    type="button"
                    onClick={handleRegenerateInvite}
                    disabled={regenInvite}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={14} className={regenInvite ? "animate-pulse" : ""} /> Create invite via Leo
                  </button>
                </div>
              )}
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-200/80 leading-relaxed flex items-start gap-2">
                <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p>Make sure Leo has the <strong>Create Invite</strong> permission in your server. Leo will pick a suitable channel automatically.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Website link (DoFollow SEO)" description="Premium-only backlink to your own site" icon={<Link2 size={16} />}>
            <div className="space-y-4 pt-4">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-200/85 leading-relaxed flex items-start gap-2">
                <BadgeCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p>
                  This link is rendered with <code className="font-mono">rel="dofollow"</code>, passing real SEO authority from lionbot.org to your site.
                  A single quality DoFollow backlink from a high-traffic domain is worth $50&ndash;200/month from typical SEO services. <strong>Premium servers only.</strong>
                </p>
              </div>
              <div className="grid sm:grid-cols-[1fr_220px] gap-3">
                <TextInput
                  label="URL"
                  value={form.external_link_url}
                  onChange={(v) => updateField("external_link_url", v)}
                  placeholder="https://your-website.com"
                />
                <TextInput
                  label="Button label"
                  value={form.external_link_label}
                  onChange={(v) => updateField("external_link_label", v)}
                  placeholder="Visit website"
                  maxLength={80}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="What to show on your page" description="Toggle each panel on or off" icon={<Eye size={16} />}>
            <div className="space-y-2 pt-4">
              {LISTING_SECTIONS.map((s) => {
                const checked = !!form.sections_enabled[s.key]
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      sections_enabled: { ...prev.sections_enabled, [s.key]: !checked },
                    }))}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      checked
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border hover:bg-accent/30"
                    }`}
                  >
                    <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      checked ? "bg-primary border-primary" : "border-input"
                    }`}>
                      {checked && <Check size={12} className="text-primary-foreground" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{s.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{s.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard title="Submit for review" description="Required: confirm your server has no NSFW content" icon={<Send size={16} />}>
            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <Toggle
                  label="I confirm this server has no NSFW or adult content"
                  checked={form.nsfw_confirmed}
                  onChange={(v) => updateField("nsfw_confirmed", v)}
                />
                <p className="text-xs text-muted-foreground pl-[3.5rem]">Required to submit. This is part of our terms -- false confirmations result in permanent removal.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => submitListing(false)}
                  disabled={saving !== null || !!slugError}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Save size={14} /> {saving === "draft" ? "Saving..." : "Save draft"}
                </button>
                <button
                  type="button"
                  onClick={() => submitListing(true)}
                  disabled={saving !== null || !canSubmit}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send size={14} /> {saving === "submit" ? "Submitting..." : "Submit for review"}
                </button>
              </div>
              {!canSubmit && (
                <p className="text-xs text-muted-foreground">
                  To submit: choose a category, write at least 20 characters of description, fix any URL errors, and confirm no NSFW.
                </p>
              )}
            </div>
          </SectionCard>

          {/* --- AI-MODIFIED (2026-04-30) --- */}
          {/* Purpose: Phase 2 -- show the embed snippet generator and the */}
          {/* admin-only analytics card once the listing is approved. We hide */}
          {/* both for DRAFT/PENDING/REJECTED so the editor stays focused on */}
          {/* getting the first version live. */}
          {data.listing?.status === "APPROVED" && (
            <>
              <EmbedSnippetCard slug={data.listing.slug} />
              <ListingAnalyticsCard guildId={guildId} />
              {/* --- AI-MODIFIED (2026-04-30) --- */}
              {/* Phase 3 -- gem-funded promotion to the top of /servers. */}
              <PromotionCard
                guildId={guildId}
                promotedUntil={data.listing.promoted_until}
                onPromoted={() => mutate()}
              />
              {/* --- END AI-MODIFIED --- */}
            </>
          )}
          {/* --- END AI-MODIFIED --- */}
        </div>

        {/* ── Live preview column ─────────────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live preview</span>
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <RefreshCw size={11} /> Refresh
              </button>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden aspect-[3/4] max-h-[calc(100vh-160px)]">
              {previewUrl ? (
                <iframe
                  key={previewKey}
                  src={previewUrl}
                  className="w-full h-full"
                  title="Live preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center px-6">
                  <p className="text-xs text-muted-foreground">Save the listing to see a preview here.</p>
                </div>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              The preview reflects what's saved in the database -- click <strong>Save draft</strong> to refresh it with your latest edits.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────

function CoverUploadField({
  value,
  uploading,
  onUpload,
  onClear,
}: {
  value: string | null
  uploading: boolean
  onUpload: (file: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">Cover image</label>
      <div className="mt-1 relative aspect-[4/1] w-full rounded-lg overflow-hidden border border-input bg-card">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-1">
            <ImageIcon size={24} className="text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">Recommended {COVER_RECOMMENDED_WIDTH}&times;{COVER_RECOMMENDED_HEIGHT} (4:1)</p>
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-input text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <Upload size={12} /> {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-input text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}

function GalleryUploadField({
  images,
  uploading,
  onUpload,
  onRemove,
}: {
  images: GalleryImage[]
  uploading: boolean
  onUpload: (file: File) => void
  onRemove: (idx: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const canUploadMore = images.length < MAX_GALLERY_IMAGES
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-muted-foreground">Gallery</label>
        <span className="text-xs text-muted-foreground">{images.length}/{MAX_GALLERY_IMAGES}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {images.map((g, i) => (
          <div key={g.url} className="relative aspect-[3/2] rounded-lg overflow-hidden border border-input bg-card group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove gallery image"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {canUploadMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-[3/2] rounded-lg border border-dashed border-input bg-card hover:bg-accent transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground disabled:opacity-50"
          >
            <Upload size={16} />
            <span className="text-[11px]">{uploading ? "Uploading..." : "Add image"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

function ThemePickerGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">Theme preset</label>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LISTING_THEMES.map((t) => {
          const active = t.id === selected
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={`text-left rounded-lg overflow-hidden border-2 transition-all ${
                active ? "border-primary ring-2 ring-primary/30" : "border-input hover:border-border"
              }`}
            >
              <div
                className="aspect-[2/1] relative"
                style={{ background: `${t.bodyTint}` }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: t.heroGradient }}
                />
                <div
                  className="absolute bottom-2 left-2 right-2 h-1.5 rounded-full"
                  style={{ background: t.defaultAccent }}
                />
              </div>
              <div className="px-2 py-1.5 bg-card">
                <div className="text-xs font-semibold text-foreground">{t.label}</div>
                <div className="text-[10px] text-muted-foreground">{t.vibe}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Outer wrapper: handles loading + premium gating ───────────

function ListingEditorPage() {
  const router = useRouter()
  const { id } = router.query
  const apiKey = id ? `/api/dashboard/servers/${id}/listing` : null
  const { data, error, isLoading, mutate } = useDashboard<ListingApiResponse>(apiKey)
  const serverId = (id as string) || ""
  const serverName = data?.guild.name || "..."

  return (
    <Layout
      SEO={{
        title: "Feature Your Server - LionBot Dashboard",
        description: "Design your server's public profile page on LionBot.",
      }}
    >
      <AdminGuard>
        <DashboardShell nav={<ServerNav serverId={serverId} serverName={serverName} isAdmin isMod />} wide>
          <ServerGuard requiredLevel="admin">
            {isLoading && (
              <div className="space-y-4">
                <div className="h-8 w-72 bg-muted rounded animate-pulse" />
                <div className="h-4 w-96 bg-muted/60 rounded animate-pulse" />
                <div className="h-72 bg-muted/40 rounded-xl animate-pulse" />
              </div>
            )}
            {error && (
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                Couldn&apos;t load listing data. Please refresh.
              </div>
            )}
            {data && !data.isPremium && (
              <PremiumGate
                title="Feature Your Server"
                subtitle="Build a stunning, SEO-friendly public profile for your community at lionbot.org/servers/your-slug. Get a DoFollow backlink, custom branding, and a discoverable listing alongside other premium servers."
              >
                <FeatureUpsell />
              </PremiumGate>
            )}
            {data && data.isPremium && <ListingEditorInner data={data} mutate={mutate} />}
          </ServerGuard>
        </DashboardShell>
      </AdminGuard>
    </Layout>
  )
}

function FeatureUpsell() {
  const features = [
    { icon: Globe,      label: "Custom public profile page at lionbot.org/servers/your-slug" },
    { icon: Palette,    label: "Themes, accent colours, fonts, cover image, and gallery" },
    { icon: Link2,      label: "DoFollow backlink to your website (real SEO value)" },
    { icon: Sparkles,   label: "Bot-managed Discord invite, regenerated on demand" },
    { icon: BadgeCheck, label: "\"Verified by Leo\" live stats panel" },
    { icon: Eye,        label: "Full directory listing with search and filters" },
  ]
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-left">
      {features.map((f, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
          <f.icon size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-foreground/90">{f.label}</span>
        </div>
      ))}
    </div>
  )
}

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Phase 2 -- "Embed widget" snippet generator.
//   Renders the iframe HTML the admin can paste on their own site.
//   We expose two snippet variants (responsive + fixed-width) so non-
//   technical admins can pick whichever fits their site without
//   editing CSS.
function EmbedSnippetCard({ slug }: { slug: string }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://lionbot.org"
  const responsive = `<iframe
  src="${origin}/embed/server/${slug}"
  title="Join us on Discord"
  loading="lazy"
  style="border:0;width:100%;max-width:380px;height:280px;border-radius:14px;"
  referrerpolicy="origin"
></iframe>`
  const fixed = `<iframe
  src="${origin}/embed/server/${slug}"
  title="Join us on Discord"
  loading="lazy"
  width="360" height="270"
  style="border:0;border-radius:14px;"
  referrerpolicy="origin"
></iframe>`

  const [activeVariant, setActiveVariant] = useState<"responsive" | "fixed">("responsive")
  const [copied, setCopied] = useState(false)
  const snippet = activeVariant === "responsive" ? responsive : fixed

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy. Select the text manually.")
    }
  }, [snippet])

  return (
    <SectionCard
      title="Embed your listing"
      description="Paste a tiny widget on your own site that links back to your Discord"
      icon={<ExternalLink size={16} />}
    >
      <div className="space-y-4 pt-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          The embed shows your cover, name, tagline, and a Join button. The Join button
          uses our tracked redirect, so clicks count toward your listing analytics.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveVariant("responsive")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeVariant === "responsive"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Responsive
          </button>
          <button
            type="button"
            onClick={() => setActiveVariant("fixed")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeVariant === "fixed"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Fixed 360x270
          </button>
        </div>

        <div className="relative">
          <pre className="text-[11px] font-mono leading-relaxed rounded-lg border border-border bg-card/40 px-4 py-3 overflow-x-auto whitespace-pre">
            {snippet}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card border border-border text-[11px] text-muted-foreground hover:text-foreground"
          >
            {copied ? <><Check size={11} /> Copied</> : <><Save size={11} /> Copy</>}
          </button>
        </div>

        <details className="rounded-lg border border-border bg-card/40 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-foreground">Preview</summary>
          <div className="mt-3 flex justify-center">
            <iframe
              src={`${origin}/embed/server/${slug}`}
              title="Embed preview"
              className="border-0 rounded-xl"
              style={{ width: 360, height: 280 }}
              loading="lazy"
            />
          </div>
        </details>
      </div>
    </SectionCard>
  )
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Phase 2 -- compact analytics card for the editor. Pulls from
//   our /api/.../listing/analytics endpoint and renders headline numbers
//   plus a 14-day sparkline plus the top referrer hostnames. Kept
//   intentionally lightweight: no chart library dependency, just inline
//   SVG sparklines.
interface AnalyticsResponse {
  totals: {
    all_time_views: number
    all_time_invite_clicks: number
    last7d: { views: number; invite_clicks: number; external_clicks: number }
    last30d: { views: number; invite_clicks: number; external_clicks: number }
  }
  daily: { date: string; views: number; invite_clicks: number; external_clicks: number }[]
  top_referrers: { hostname: string; count: number }[]
}

function ListingAnalyticsCard({ guildId }: { guildId: string }) {
  const { data, error } = useDashboard<AnalyticsResponse>(
    guildId ? `/api/dashboard/servers/${guildId}/listing/analytics` : null,
  )

  return (
    <SectionCard
      title="Performance"
      description="Visits, invite clicks, and where your traffic comes from"
      icon={<BadgeCheck size={16} />}
    >
      <div className="space-y-5 pt-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            Couldn&apos;t load analytics right now. Please refresh.
          </div>
        )}
        {!data && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        )}
        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Views (all time)" value={data.totals.all_time_views} />
              <StatTile label="Invite clicks (all time)" value={data.totals.all_time_invite_clicks} />
              <StatTile label="Views (7d)" value={data.totals.last7d.views} />
              <StatTile label="Invite clicks (7d)" value={data.totals.last7d.invite_clicks} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Last 14 days
                </span>
                <span className="text-[11px] text-muted-foreground">
                  views &middot; invite clicks &middot; outbound clicks
                </span>
              </div>
              <Sparkline series={data.daily} />
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Top referrers (30d)
              </div>
              {data.top_referrers.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No tracked referrers yet. Share your listing to start collecting data.
                </p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border bg-card/40">
                  {data.top_referrers.map((row) => (
                    <li
                      key={row.hostname}
                      className="px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <span className="text-foreground truncate">{row.hostname}</span>
                      <span className="text-muted-foreground tabular-nums">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </SectionCard>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-bold text-foreground tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function Sparkline({
  series,
}: {
  series: { date: string; views: number; invite_clicks: number; external_clicks: number }[]
}) {
  // We render three overlaid sparklines (views in primary, invite
  // clicks in green, external clicks in muted) so admins can compare
  // trend lines side-by-side without us shipping a chart library.
  const W = 480
  const H = 80
  const PAD = 6
  const innerW = W - PAD * 2
  const innerH = H - PAD * 2
  const max = Math.max(
    1,
    ...series.flatMap((p) => [p.views, p.invite_clicks, p.external_clicks]),
  )
  const xStep = innerW / Math.max(1, series.length - 1)

  function pathFor(key: "views" | "invite_clicks" | "external_clicks"): string {
    return series
      .map((p, i) => {
        const x = PAD + i * xStep
        const y = PAD + innerH - (p[key] / max) * innerH
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(" ")
  }

  return (
    <div className="rounded-lg border border-border bg-card/40 p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" strokeOpacity="0.1" />
        <path d={pathFor("views")} stroke="hsl(217 91% 60%)" strokeWidth="2" fill="none" />
        <path d={pathFor("invite_clicks")} stroke="hsl(142 71% 45%)" strokeWidth="2" fill="none" />
        <path d={pathFor("external_clicks")} stroke="hsl(220 9% 46%)" strokeWidth="2" fill="none" />
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        <LegendDot color="hsl(217 91% 60%)" label="Page views" />
        <LegendDot color="hsl(142 71% 45%)" label="Invite clicks" />
        <LegendDot color="hsl(220 9% 46%)" label="Website clicks" />
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Phase 3 -- gem-promotion card. Lets the admin spend
//   LISTING_PROMOTION_GEM_COST gems for LISTING_PROMOTION_HOURS of
//   featured placement at the top of /servers. We refresh the
//   listing data after a successful promote so the UI reflects the
//   new promoted_until window without a hard reload.
function PromotionCard({
  guildId,
  promotedUntil,
  onPromoted,
}: {
  guildId: string
  promotedUntil: string | null
  onPromoted: () => void
}) {
  const [busy, setBusy] = useState(false)
  const isPromoted = promotedUntil && new Date(promotedUntil) > new Date()

  const handlePromote = useCallback(async () => {
    if (busy) return
    const ok = window.confirm(
      `Spend ${PROMO_COST} gems to feature your server at the top of /servers for ${PROMO_HOURS} hours?`,
    )
    if (!ok) return
    setBusy(true)
    try {
      const res = await dashboardMutate("POST", `/api/dashboard/servers/${guildId}/listing/promote`)
      toast.success(`Boosted! Now featured until ${new Date(res.promoted_until).toLocaleString()}`)
      onPromoted()
    } catch (err: any) {
      toast.error(err?.message || "Couldn't promote your listing.")
    } finally {
      setBusy(false)
    }
  }, [busy, guildId, onPromoted])

  return (
    <SectionCard
      title="Boost your listing"
      description={`Top of /servers for ${PROMO_HOURS} hours, paid with LionGems`}
      icon={<Sparkles size={16} />}
    >
      <div className="space-y-4 pt-4">
        {isPromoted ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200">
            <Sparkles size={12} className="inline -mt-0.5 mr-1" />
            Currently featured until{" "}
            <strong className="font-semibold">
              {new Date(promotedUntil!).toLocaleString()}
            </strong>
            . You can extend the boost by buying another window now.
          </div>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Featured listings sit in the &quot;Promoted&quot; carousel at the top of the
            directory and outrank approved listings in the main grid. Each boost is
            additive &mdash; buy multiple to stack the duration.
          </p>
        )}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground">Cost</div>
            <div className="text-base font-bold text-foreground">
              {PROMO_COST.toLocaleString()} gems
            </div>
            <div className="text-[11px] text-muted-foreground/70">
              for {PROMO_HOURS} hours of featured placement
            </div>
          </div>
          <button
            type="button"
            onClick={handlePromote}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-amber-950 text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} />
            {busy ? "Boosting..." : isPromoted ? "Extend boost" : "Boost now"}
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

const PROMO_COST = LISTING_PROMOTION_GEM_COST
const PROMO_HOURS = LISTING_PROMOTION_HOURS
// --- END AI-MODIFIED ---

export default ListingEditorPage

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
