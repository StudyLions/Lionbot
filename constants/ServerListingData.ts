// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Updated: 2026-05-01 (dark-only theme palette)
// Purpose: Static data for the "Feature Your Server" premium feature.
//          - LISTING_CATEGORIES: ~40 curated tags. Predefined-only
//            so /servers filtering stays clean and abuse-free.
//          - LISTING_THEMES: 5 *editorial* theme presets. Each one
//            is a real visual reskin (different display + body font
//            pairing, different dark surface treatment, different
//            cover blend, different rule style) -- not a palette
//            swap. All five are now dark variants so the public
//            profile pages match the rest of lionbot.org. Themes
//            are named after real magazines so admins pick by mood
//            instead of trying to decode "Theme 3 / vibe: cool &
//            calming". The font pair is implied by the theme, so
//            we no longer expose a standalone font picker.
//          - LISTING_FONTS: kept exported only because legacy listing
//            rows persist a `font_family` column. The renderer no
//            longer reads it -- typography is theme-driven now.
//          - LEGACY_THEME_MAP: maps the original 6 palette themes
//            (midnight/ocean/forest/sunset/rose/parchment) onto the
//            5 editorial themes so unmigrated rows still render.
//          - LISTING_COUNTRIES / LISTING_LANGUAGES: top-50 lists,
//            ISO 3166-1 alpha-2 / ISO 639-1.
//          - LISTING_AGE_BANDS: discrete audience-age picker.
//          - DEFAULT_SECTIONS_ENABLED: 5 toggleable panels (down
//            from 9 in v1 -- tags + country/language always show
//            in the meta-line, embed snippet moved into the editor,
//            verified_stats + live_sessions coalesced into "stats").
// ============================================================

export interface ListingCategory {
  id: string
  label: string
  emoji: string
  /** Single-line description used in the editor's category dropdown. */
  description: string
}

/**
 * 40 curated categories. The first one ("study") is the default and
 * matches our brand positioning. Order matters for the editor's
 * dropdown -- we group conceptually similar tags together.
 */
export const LISTING_CATEGORIES: ListingCategory[] = [
  // Study & academics
  { id: "study",            label: "Study & Focus",        emoji: "📚", description: "General study, productivity, and focus communities" },
  { id: "language-learning",label: "Language Learning",    emoji: "🗣️", description: "Practice or teach a new language together" },
  { id: "math",             label: "Math",                 emoji: "➗", description: "From arithmetic to abstract algebra" },
  { id: "science",          label: "Science",              emoji: "🔬", description: "Physics, chemistry, biology, and beyond" },
  { id: "coding",           label: "Coding & CS",          emoji: "💻", description: "Programming, computer science, and dev communities" },
  { id: "engineering",      label: "Engineering",          emoji: "⚙️", description: "Mechanical, electrical, civil, and other engineering" },
  { id: "medicine",         label: "Medicine & Pre-med",   emoji: "🩺", description: "Med students, MCAT/USMLE prep, healthcare careers" },
  { id: "law",              label: "Law",                  emoji: "⚖️", description: "Law school, bar prep, and legal study groups" },
  { id: "business",         label: "Business & Finance",   emoji: "💼", description: "MBA, accounting, finance, and entrepreneurship" },
  { id: "arts",             label: "Art & Design",         emoji: "🎨", description: "Drawing, painting, design, and creative practice" },
  { id: "music",            label: "Music",                emoji: "🎵", description: "Music theory, instruments, production, and performance" },
  { id: "writing",          label: "Writing",              emoji: "✍️", description: "Creative writing, journalism, and academic writing" },
  // Standardised tests
  { id: "sat-act",          label: "SAT / ACT",            emoji: "🇺🇸", description: "US college admissions test prep" },
  { id: "ib",               label: "IB",                   emoji: "🌍", description: "International Baccalaureate" },
  { id: "a-levels",         label: "A-Levels",             emoji: "🇬🇧", description: "UK A-Levels and AS-Levels" },
  { id: "gcse",             label: "GCSE",                 emoji: "📘", description: "UK GCSEs and IGCSEs" },
  { id: "ap",               label: "AP",                   emoji: "📓", description: "US Advanced Placement courses" },
  { id: "gre-gmat",         label: "GRE / GMAT",           emoji: "🎓", description: "US graduate school admissions" },
  { id: "lsat",             label: "LSAT",                 emoji: "📜", description: "US law school admissions" },
  { id: "mcat",             label: "MCAT",                 emoji: "💉", description: "US medical school admissions" },
  // Hobbies & lifestyle
  { id: "fitness",          label: "Fitness & Health",     emoji: "🏋️", description: "Gym, running, nutrition, and healthy habits" },
  { id: "mindfulness",      label: "Mindfulness",          emoji: "🧘", description: "Meditation, journaling, and mental wellness" },
  { id: "self-improvement", label: "Self-Improvement",     emoji: "🌱", description: "Habit-building, goals, and personal growth" },
  { id: "reading",          label: "Reading & Books",      emoji: "📖", description: "Book clubs and reading communities" },
  { id: "gaming",           label: "Gaming",               emoji: "🎮", description: "Gaming communities that also study together" },
  { id: "anime-manga",      label: "Anime & Manga",        emoji: "🌸", description: "Anime and manga fan communities" },
  { id: "chess",            label: "Chess & Strategy",     emoji: "♟️", description: "Chess and strategy game communities" },
  // Communities & demographics
  { id: "high-school",      label: "High School",          emoji: "🏫", description: "High school and secondary school students" },
  { id: "university",       label: "University",           emoji: "🎒", description: "College and university communities" },
  { id: "graduate",         label: "Graduate School",      emoji: "🎓", description: "Master's, PhD, and post-grad students" },
  { id: "professional",     label: "Professional",         emoji: "👔", description: "Working professionals and career networking" },
  { id: "lgbtq-friendly",   label: "LGBTQ+ Friendly",      emoji: "🏳️‍🌈", description: "Welcoming and inclusive communities" },
  { id: "neurodivergent",   label: "Neurodivergent",       emoji: "🧠", description: "ADHD, autism, and neurodivergent-friendly spaces" },
  { id: "international",    label: "International",        emoji: "🌐", description: "Multicultural communities with members worldwide" },
  // Interests / niche
  { id: "creative-writing", label: "Creative Writing",     emoji: "📝", description: "Fiction, poetry, screenwriting, and storytelling" },
  { id: "philosophy",       label: "Philosophy",           emoji: "🦉", description: "Philosophy, ethics, and critical thinking" },
  { id: "history",          label: "History",              emoji: "🏛️", description: "Historical study and discussion" },
  { id: "psychology",       label: "Psychology",           emoji: "🧩", description: "Psychology study and applied topics" },
  { id: "ai-ml",            label: "AI & Machine Learning",emoji: "🤖", description: "AI, ML, and data science communities" },
  { id: "other",            label: "Other",                emoji: "✨", description: "Anything that doesn't fit the categories above" },
]

export const LISTING_CATEGORY_IDS = new Set(LISTING_CATEGORIES.map((c) => c.id))

// ── EDITORIAL THEME SYSTEM ────────────────────────────────────
// Each theme is a real visual reskin: a serif/sans pair, a surface
// treatment, a cover-blend recipe, a rule style, and an optional
// drop-cap. The renderer (components/listing/EditorialThemeProvider)
// reads these fields and writes the corresponding CSS variables +
// loads the right Google Fonts on demand.

export type CoverBlendStyle =
  | "duotone"     // Wired -- harsh black + accent two-tone
  | "monochrome"  // Kinfolk -- desaturated to pure greyscale
  | "wash"        // Vogue -- accent-tinted gradient wash over the cover
  | "paper"       // Atlantic -- soft fade into the warm-dark surface
  | "spare"       // Frieze -- minimal dark-edge vignette only

export type SurfaceTreatment =
  | "dusk"        // Atlantic -- warm near-black, journalism feel
  | "matte"       // Wired -- matte black with a faint noise grain
  | "graphite"    // Kinfolk -- cool near-black, generous margins
  | "wine"        // Vogue -- deep oxblood, fashion-magazine night
  | "void"        // Frieze -- pure dark, vast negative space

export type RuleStyle =
  | "hairline"    // 1px, 30% opacity
  | "double"      // double horizontal rule for section breaks
  | "thick"       // 4px solid accent
  | "none"        // no rules at all

export type GalleryFilter =
  | "none"
  | "grayscale"   // Kinfolk + Frieze
  | "sepia"       // Vogue
  | "duotone"     // Wired (CSS filter approximation)

export interface ListingTheme {
  id: string
  label: string
  /** Magazine the visual language is borrowed from -- shown in the
   *  editor as a subtitle so admins know what they're picking. */
  inspired: string
  defaultAccent: string

  // Typography
  /** Display (headline) font: CSS family value, already quoted. */
  displayFont: string
  /** Body (paragraph) font: CSS family value, already quoted. */
  bodyFont: string
  /** Google Fonts URL fragments (everything after `family=`).
   *  The provider concatenates them into a single stylesheet load. */
  googleFonts: string[]
  /** True if the display font should be rendered in italic by default
   *  for the kicker / deck. Vogue + Kinfolk lean into this. */
  italicDeck: boolean

  // Surface
  surfaceTreatment: SurfaceTreatment
  /** Computed background colour for the page body. */
  bodyBg: string
  /** Computed primary text colour. */
  bodyText: string
  /** Computed muted text colour (deck, captions, meta). */
  mutedText: string
  /** Computed hairline rule colour. */
  ruleColor: string
  ruleStyle: RuleStyle

  // Hero
  coverBlend: CoverBlendStyle
  /** Whether the page is best rendered with light or dark base text. */
  textTone: "light" | "dark"

  // Article body
  /** Whether the first letter of the description gets a drop-cap. */
  dropCap: boolean
  /** Optional CSS filter to apply to gallery images (e.g. `grayscale(1)`). */
  galleryFilter: GalleryFilter

  /** Editorial-style description shown in the dashboard theme picker. */
  pitch: string
}

/**
 * 5 editorial themes. Pick one and the page gets a real personality:
 * a serif headline, a body font that pairs, a dark surface, a cover
 * blend, a rule treatment. Admins still pick an accent colour on
 * top, but the theme does the heavy lifting so the page doesn't
 * read as "AI default".
 *
 * All five themes use dark surfaces so the public profile pages
 * match the rest of lionbot.org. They stay distinct from each other
 * by typography (Spectral / Inter Tight / EB Garamond / Playfair),
 * surface temperature (warm vs cool vs wine vs neutral), accent
 * colour, gallery treatment, and rule style.
 */
export const LISTING_THEMES: ListingTheme[] = [
  {
    id: "atlantic",
    label: "The Atlantic",
    inspired: "Long-form journalism, warm dark",
    // Burgundy lifted from the original #8b1e1e so it reads against
    // a near-black surface without going muddy.
    defaultAccent: "#c64545",
    displayFont: "Spectral, Georgia, serif",
    bodyFont: "Inter, system-ui, sans-serif",
    googleFonts: ["Spectral:ital,wght@0,400;0,600;0,700;1,400;1,600", "Inter:wght@400;500;600"],
    italicDeck: true,
    surfaceTreatment: "dusk",
    bodyBg: "#1a1612",
    bodyText: "#ece4d3",
    mutedText: "#8e8273",
    ruleColor: "rgba(236,228,211,0.18)",
    ruleStyle: "hairline",
    coverBlend: "paper",
    textTone: "light",
    dropCap: true,
    galleryFilter: "none",
    pitch: "Warm near-black, Spectral serif headlines, drop caps. Reads like a long-form feature at midnight.",
  },
  {
    id: "wired",
    label: "Wired",
    inspired: "Tech-magazine, neon on black",
    defaultAccent: "#ff2d6e",
    displayFont: "'Inter Tight', Inter, sans-serif",
    bodyFont: "Inter, system-ui, sans-serif",
    googleFonts: ["Inter+Tight:wght@600;800;900", "Inter:wght@400;500;600"],
    italicDeck: false,
    surfaceTreatment: "matte",
    bodyBg: "#0a0a0c",
    bodyText: "#f5f5f7",
    mutedText: "#9b9ba3",
    ruleColor: "rgba(255,255,255,0.10)",
    ruleStyle: "thick",
    coverBlend: "duotone",
    textTone: "light",
    dropCap: true,
    galleryFilter: "duotone",
    pitch: "Matte black, accent-coloured all-caps headlines, neon-tinted gallery. Confident and modern.",
  },
  {
    id: "kinfolk",
    label: "Kinfolk",
    inspired: "Slow-life, monochrome stillness",
    // Soft off-white accent — charcoal-on-charcoal disappears on a
    // dark surface, so we flip Kinfolk's restrained accent to a near
    // white that reads but never shouts.
    defaultAccent: "#cfc8be",
    displayFont: "'EB Garamond', Garamond, serif",
    bodyFont: "Karla, system-ui, sans-serif",
    googleFonts: ["EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500", "Karla:wght@400;500;600"],
    italicDeck: true,
    surfaceTreatment: "graphite",
    bodyBg: "#17191a",
    bodyText: "#e6e3dc",
    mutedText: "#8a8782",
    ruleColor: "rgba(230,227,220,0.14)",
    ruleStyle: "hairline",
    coverBlend: "monochrome",
    textTone: "light",
    dropCap: false,
    galleryFilter: "grayscale",
    pitch: "Cool near-black, restrained Garamond, monochrome photos. Calm, considered, almost ascetic.",
  },
  {
    id: "vogue",
    label: "Vogue",
    inspired: "Fashion magazine, statement headlines",
    // Rose lifted from the original #a82038 so the title accent
    // pops against the deep wine surface.
    defaultAccent: "#d63b58",
    displayFont: "'Playfair Display', Georgia, serif",
    bodyFont: "Lato, system-ui, sans-serif",
    googleFonts: ["Playfair+Display:ital,wght@0,500;0,700;0,900;1,500;1,700", "Lato:wght@400;700"],
    italicDeck: true,
    surfaceTreatment: "wine",
    bodyBg: "#171012",
    bodyText: "#ebe1d8",
    mutedText: "#9a8b7e",
    ruleColor: "rgba(235,225,216,0.20)",
    ruleStyle: "double",
    coverBlend: "wash",
    textTone: "light",
    dropCap: true,
    galleryFilter: "sepia",
    pitch: "Deep oxblood, oversized Playfair display, italic deck, sepia gallery. The cover-story treatment.",
  },
  {
    id: "frieze",
    label: "Frieze",
    inspired: "Art magazine, severe negative space",
    // Crisp white instead of black — same idea (a near-monotone
    // accent against the surface), inverted for dark.
    defaultAccent: "#ffffff",
    displayFont: "'Inter Tight', Inter, sans-serif",
    bodyFont: "Inter, system-ui, sans-serif",
    googleFonts: ["Inter+Tight:wght@500;700;900", "Inter:wght@400;500"],
    italicDeck: false,
    surfaceTreatment: "void",
    bodyBg: "#0e0e0d",
    bodyText: "#ededed",
    mutedText: "#7a7a7a",
    ruleColor: "rgba(255,255,255,0.10)",
    ruleStyle: "none",
    coverBlend: "spare",
    textTone: "light",
    dropCap: false,
    galleryFilter: "grayscale",
    pitch: "Pure dark, vast margins, very large headline, very small body. Art-quarterly cool.",
  },
]

export const LISTING_THEME_IDS = new Set(LISTING_THEMES.map((t) => t.id))

/**
 * Maps the v1 palette themes onto v2 editorial themes so unmigrated
 * rows still render. The same mapping is applied by the SQL migration
 * (manual_2026_04_30_serverlistings_editorial.sql) and as a runtime
 * fallback in resolveTheme() so we don't depend on the migration
 * having run before code ships.
 */
export const LEGACY_THEME_MAP: Record<string, string> = {
  midnight: "wired",
  ocean: "frieze",
  forest: "kinfolk",
  sunset: "vogue",
  rose: "vogue",
  parchment: "atlantic",
}

/**
 * Resolve any persisted theme_preset (legacy or current) to a real
 * ListingTheme object. Always returns a theme -- never undefined --
 * so callers don't need to guard against missing data.
 */
export function resolveTheme(id: string | null | undefined): ListingTheme {
  if (id) {
    const direct = LISTING_THEMES.find((t) => t.id === id)
    if (direct) return direct
    const mapped = LEGACY_THEME_MAP[id]
    if (mapped) {
      const theme = LISTING_THEMES.find((t) => t.id === mapped)
      if (theme) return theme
    }
  }
  // Atlantic is the default for new listings -- it's the most flattering
  // theme on a server that hasn't customised anything yet.
  return LISTING_THEMES[0]
}

// ── Vestigial: LISTING_FONTS ────────────────────────────────────
// Kept exported only because legacy listing rows persist a font_family
// column and a couple of files still import the type. The renderer no
// longer reads it -- typography is now driven entirely by the chosen
// theme. Will be removed once nothing imports it.

export interface ListingFont {
  id: string
  label: string
  family: string
  google: string
  weights: string
  mood: string
}

export const LISTING_FONTS: ListingFont[] = [
  { id: "inter", label: "Inter", family: "Inter, sans-serif", google: "Inter:wght@400;600;700", weights: "400;600;700", mood: "Default" },
]

export const LISTING_FONT_IDS = new Set(LISTING_FONTS.map((f) => f.id))

/**
 * Default panel-visibility map a new listing starts with. Admins can
 * toggle each one individually in the editor. v2 (editorial redesign)
 * collapses the original 9 toggles down to 5:
 *   - tags + country_language always show in the meta-line, no toggle
 *   - embed_widget moved out of the public page entirely; lives only
 *     in the dashboard editor as a copy-paste snippet
 *   - verified_stats + live_sessions are coalesced into a single
 *     "stats" toggle (the public page treats them as one pull-quote
 *     row, so it never made sense to gate them independently)
 */
export const DEFAULT_SECTIONS_ENABLED: Record<string, boolean> = {
  hero: true,
  description: true,
  stats: false,
  gallery: false,
  external_link: true,
}

export type ListingSectionKey = keyof typeof DEFAULT_SECTIONS_ENABLED

export interface ListingSectionDef {
  key: ListingSectionKey
  label: string
  description: string
  /** True if the data behind this section requires premium-tracked
   *  guild data; we hide the toggle entirely if Leo isn't in the server. */
  requiresBotData?: boolean
}

export const LISTING_SECTIONS: ListingSectionDef[] = [
  { key: "hero",          label: "Hero & cover image",       description: "Big full-bleed cover photo, kicker, headline, deck, Join CTA" },
  { key: "description",   label: "Article body",             description: "Your long-form pitch -- supports markdown, gets a drop-cap" },
  { key: "stats",         label: "Pull-quote stats",         description: "Verified-by-Leo members, study hours, and live in-voice count", requiresBotData: true },
  { key: "gallery",       label: "Photo essay",              description: "Up to 6 full-width images, themed filter applied" },
  { key: "external_link", label: "Website link (DoFollow)",  description: "A single SEO-boosting backlink to your own site" },
]

export const LISTING_SECTION_KEYS = new Set(LISTING_SECTIONS.map((s) => s.key as string))

/**
 * Coalesce a persisted sections_enabled JSON value (which may still
 * carry the v1 keys verified_stats/live_sessions/embed_widget/tags/
 * country_language) onto the v2 5-key shape the renderer expects.
 *
 * Always returns a fully-populated map -- callers don't need to guard
 * for missing keys. Unknown keys are silently dropped.
 */
export function normalizeSections(
  raw: Record<string, unknown> | null | undefined,
): Record<string, boolean> {
  const out: Record<string, boolean> = { ...DEFAULT_SECTIONS_ENABLED }
  if (!raw || typeof raw !== "object") return out

  const get = (k: string): boolean | undefined => {
    const v = (raw as Record<string, unknown>)[k]
    return typeof v === "boolean" ? v : undefined
  }

  if (get("hero") !== undefined) out.hero = get("hero")!
  if (get("description") !== undefined) out.description = get("description")!
  if (get("gallery") !== undefined) out.gallery = get("gallery")!
  if (get("external_link") !== undefined) out.external_link = get("external_link")!

  // v2 explicit `stats`, else fall back to the OR of the v1 keys.
  if (get("stats") !== undefined) {
    out.stats = get("stats")!
  } else {
    const v1 = (get("verified_stats") ?? false) || (get("live_sessions") ?? false)
    out.stats = v1
  }

  return out
}

export const LISTING_AGE_BANDS = [
  { id: "13+", label: "13+ (general)" },
  { id: "16+", label: "16+ (older teens)" },
  { id: "18+", label: "18+ (adults only)" },
] as const

/**
 * Top 50 countries by typical Discord/study-bot user volume. ISO
 * 3166-1 alpha-2 codes. Order is rough relevance, not strict ranking.
 */
export const LISTING_COUNTRIES: { id: string; label: string; flag: string }[] = [
  { id: "US", label: "United States", flag: "🇺🇸" },
  { id: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { id: "CA", label: "Canada", flag: "🇨🇦" },
  { id: "AU", label: "Australia", flag: "🇦🇺" },
  { id: "DE", label: "Germany", flag: "🇩🇪" },
  { id: "FR", label: "France", flag: "🇫🇷" },
  { id: "NL", label: "Netherlands", flag: "🇳🇱" },
  { id: "ES", label: "Spain", flag: "🇪🇸" },
  { id: "IT", label: "Italy", flag: "🇮🇹" },
  { id: "BR", label: "Brazil", flag: "🇧🇷" },
  { id: "MX", label: "Mexico", flag: "🇲🇽" },
  { id: "AR", label: "Argentina", flag: "🇦🇷" },
  { id: "IN", label: "India", flag: "🇮🇳" },
  { id: "PK", label: "Pakistan", flag: "🇵🇰" },
  { id: "ID", label: "Indonesia", flag: "🇮🇩" },
  { id: "PH", label: "Philippines", flag: "🇵🇭" },
  { id: "MY", label: "Malaysia", flag: "🇲🇾" },
  { id: "SG", label: "Singapore", flag: "🇸🇬" },
  { id: "JP", label: "Japan", flag: "🇯🇵" },
  { id: "KR", label: "South Korea", flag: "🇰🇷" },
  { id: "CN", label: "China", flag: "🇨🇳" },
  { id: "TW", label: "Taiwan", flag: "🇹🇼" },
  { id: "HK", label: "Hong Kong", flag: "🇭🇰" },
  { id: "TR", label: "Türkiye", flag: "🇹🇷" },
  { id: "RU", label: "Russia", flag: "🇷🇺" },
  { id: "UA", label: "Ukraine", flag: "🇺🇦" },
  { id: "PL", label: "Poland", flag: "🇵🇱" },
  { id: "RO", label: "Romania", flag: "🇷🇴" },
  { id: "GR", label: "Greece", flag: "🇬🇷" },
  { id: "PT", label: "Portugal", flag: "🇵🇹" },
  { id: "BE", label: "Belgium", flag: "🇧🇪" },
  { id: "AT", label: "Austria", flag: "🇦🇹" },
  { id: "CH", label: "Switzerland", flag: "🇨🇭" },
  { id: "SE", label: "Sweden", flag: "🇸🇪" },
  { id: "NO", label: "Norway", flag: "🇳🇴" },
  { id: "DK", label: "Denmark", flag: "🇩🇰" },
  { id: "FI", label: "Finland", flag: "🇫🇮" },
  { id: "IE", label: "Ireland", flag: "🇮🇪" },
  { id: "IL", label: "Israel", flag: "🇮🇱" },
  { id: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { id: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
  { id: "EG", label: "Egypt", flag: "🇪🇬" },
  { id: "ZA", label: "South Africa", flag: "🇿🇦" },
  { id: "NG", label: "Nigeria", flag: "🇳🇬" },
  { id: "KE", label: "Kenya", flag: "🇰🇪" },
  { id: "VN", label: "Vietnam", flag: "🇻🇳" },
  { id: "TH", label: "Thailand", flag: "🇹🇭" },
  { id: "BD", label: "Bangladesh", flag: "🇧🇩" },
  { id: "NZ", label: "New Zealand", flag: "🇳🇿" },
  { id: "OTHER", label: "Other / multiple", flag: "🌐" },
]

export const LISTING_LANGUAGES: { id: string; label: string }[] = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish (Español)" },
  { id: "pt", label: "Portuguese (Português)" },
  { id: "fr", label: "French (Français)" },
  { id: "de", label: "German (Deutsch)" },
  { id: "it", label: "Italian (Italiano)" },
  { id: "nl", label: "Dutch (Nederlands)" },
  { id: "pl", label: "Polish (Polski)" },
  { id: "ru", label: "Russian (Русский)" },
  { id: "uk", label: "Ukrainian (Українська)" },
  { id: "tr", label: "Turkish (Türkçe)" },
  { id: "ar", label: "Arabic (العربية)" },
  { id: "fa", label: "Persian (فارسی)" },
  { id: "he", label: "Hebrew (עברית)" },
  { id: "hi", label: "Hindi (हिन्दी)" },
  { id: "ur", label: "Urdu (اردو)" },
  { id: "bn", label: "Bengali (বাংলা)" },
  { id: "ta", label: "Tamil (தமிழ்)" },
  { id: "id", label: "Indonesian (Bahasa Indonesia)" },
  { id: "ms", label: "Malay (Bahasa Melayu)" },
  { id: "th", label: "Thai (ไทย)" },
  { id: "vi", label: "Vietnamese (Tiếng Việt)" },
  { id: "ja", label: "Japanese (日本語)" },
  { id: "ko", label: "Korean (한국어)" },
  { id: "zh", label: "Chinese (中文)" },
  { id: "el", label: "Greek (Ελληνικά)" },
  { id: "sv", label: "Swedish (Svenska)" },
  { id: "no", label: "Norwegian (Norsk)" },
  { id: "da", label: "Danish (Dansk)" },
  { id: "fi", label: "Finnish (Suomi)" },
  { id: "ro", label: "Romanian (Română)" },
  { id: "hu", label: "Hungarian (Magyar)" },
  { id: "cs", label: "Czech (Čeština)" },
  { id: "MULTI", label: "Multilingual" },
]

export const LISTING_BLEND_MODES = [
  { id: "fade",     label: "Fade",     description: "Cover fades into the page background" },
  { id: "gradient", label: "Gradient", description: "Cover sits behind a gradient overlay" },
  { id: "tint",     label: "Tint",     description: "Cover takes on your accent colour as a tint" },
] as const

export type ListingBlendMode = (typeof LISTING_BLEND_MODES)[number]["id"]

export const MAX_GALLERY_IMAGES = 6
export const MAX_SECONDARY_TAGS = 3
export const MAX_DESCRIPTION_LENGTH = 4000
export const MAX_TAGLINE_LENGTH = 160
export const MAX_DISPLAY_NAME_LENGTH = 80
export const COVER_RECOMMENDED_WIDTH = 1920
export const COVER_RECOMMENDED_HEIGHT = 480
export const GALLERY_MAX_DIMENSION = 1600

/** Premium grace period after `premium_until` lapses, in days. */
export const LISTING_GRACE_PERIOD_DAYS = 30

/** LionGem cost to promote a server to the top of /servers for 24h. */
export const LISTING_PROMOTION_GEM_COST = 100
export const LISTING_PROMOTION_HOURS = 24

/** Discord ID of the developer who reviews listings (Ari). */
export const LISTING_REVIEWER_DISCORD_ID = "757652191656804413"

/** Discord channel where new submissions are announced. */
export const LISTING_REVIEW_CHANNEL_ID = "1499358894466662410"
