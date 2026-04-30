// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Static data for the "Feature Your Server" premium feature.
//          - LISTING_CATEGORIES: ~40 curated tags. Predefined-only
//            so /servers filtering stays clean and abuse-free.
//          - LISTING_FONTS: 6 curated Google Fonts that pair well
//            with our existing Inter/Rubik base. Loaded on demand
//            on /servers/[slug] so we don't penalise other pages.
//          - LISTING_THEMES: 6 preset gradient/colour combinations
//            that drive the cover-blend hero on the public profile.
//          - LISTING_COUNTRIES / LISTING_LANGUAGES: top-50 lists,
//            ISO 3166-1 alpha-2 / ISO 639-1.
//          - LISTING_AGE_BANDS: discrete audience-age picker.
//          - DEFAULT_SECTIONS_ENABLED: every panel toggleable per
//            server -- defaults shown here are the recommended
//            first-time-setup values.
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

export interface ListingFont {
  id: string
  label: string
  /** CSS family value (already quoted if multi-word). */
  family: string
  /** Google Fonts URL fragment (everything after `family=`). */
  google: string
  /** Pairs well with this body weight. */
  weights: string
  /** Mood word so admins can pick by feel, not by typeface name. */
  mood: string
}

/**
 * 6 curated fonts. We prefer typefaces that look distinct from our
 * default Inter/Rubik base so picking one actually changes the feel
 * of a server's page. All are Google Fonts so they are zero-install
 * and respect Google's CDN caching for repeat visitors.
 */
export const LISTING_FONTS: ListingFont[] = [
  { id: "inter",          label: "Inter (default)",       family: "Inter, sans-serif",                google: "Inter:wght@400;600;700",          weights: "400;600;700",      mood: "Clean & modern" },
  { id: "playfair",       label: "Playfair Display",      family: "'Playfair Display', serif",        google: "Playfair+Display:wght@500;700;900",weights: "500;700;900",     mood: "Elegant & academic" },
  { id: "space-grotesk",  label: "Space Grotesk",         family: "'Space Grotesk', sans-serif",      google: "Space+Grotesk:wght@400;500;700",  weights: "400;500;700",      mood: "Editorial & confident" },
  { id: "fraunces",       label: "Fraunces",              family: "Fraunces, serif",                  google: "Fraunces:wght@500;700;900",       weights: "500;700;900",      mood: "Warm & literary" },
  { id: "jetbrains-mono", label: "JetBrains Mono",        family: "'JetBrains Mono', monospace",      google: "JetBrains+Mono:wght@400;600;700", weights: "400;600;700",      mood: "Coding & technical" },
  { id: "outfit",         label: "Outfit",                family: "Outfit, sans-serif",               google: "Outfit:wght@400;600;800",         weights: "400;600;800",      mood: "Friendly & geometric" },
]

export const LISTING_FONT_IDS = new Set(LISTING_FONTS.map((f) => f.id))

export interface ListingTheme {
  id: string
  label: string
  /** Default accent the admin starts with -- they can override. */
  defaultAccent: string
  /** Hero background gradient (CSS, full string). */
  heroGradient: string
  /** Body background tint applied behind sections. */
  bodyTint: string
  /** Card surface colour. */
  cardSurface: string
  /** Whether the theme is best paired with light or dark text by default. */
  textTone: "light" | "dark"
  /** Short label shown in the editor preview. */
  vibe: string
}

/**
 * 6 preset themes. Each defines the cover-blend gradient + body tint
 * + card surface so the admin's uploaded cover photo blends into the
 * page automatically (mirroring the homepage hero pattern in
 * pages/index.tsx). Admins can override the accent colour separately.
 */
export const LISTING_THEMES: ListingTheme[] = [
  {
    id: "midnight",
    label: "Midnight",
    defaultAccent: "#3b82f6",
    heroGradient: "linear-gradient(180deg, hsl(222 47% 11% / 0.4) 0%, hsl(222 47% 11% / 0.95) 100%)",
    bodyTint: "hsl(222 47% 11%)",
    cardSurface: "hsl(224 40% 14%)",
    textTone: "light",
    vibe: "Dark & focused — our default",
  },
  {
    id: "ocean",
    label: "Ocean",
    defaultAccent: "#06b6d4",
    heroGradient: "linear-gradient(180deg, hsl(200 60% 12% / 0.35) 0%, hsl(200 60% 12% / 0.95) 100%)",
    bodyTint: "hsl(200 60% 12%)",
    cardSurface: "hsl(202 50% 16%)",
    textTone: "light",
    vibe: "Cool & calming",
  },
  {
    id: "forest",
    label: "Forest",
    defaultAccent: "#10b981",
    heroGradient: "linear-gradient(180deg, hsl(150 35% 12% / 0.35) 0%, hsl(150 35% 12% / 0.95) 100%)",
    bodyTint: "hsl(150 35% 12%)",
    cardSurface: "hsl(150 30% 16%)",
    textTone: "light",
    vibe: "Earthy & grounded",
  },
  {
    id: "sunset",
    label: "Sunset",
    defaultAccent: "#f97316",
    heroGradient: "linear-gradient(180deg, hsl(20 50% 14% / 0.35) 0%, hsl(20 50% 14% / 0.95) 100%)",
    bodyTint: "hsl(20 50% 14%)",
    cardSurface: "hsl(22 45% 18%)",
    textTone: "light",
    vibe: "Warm & energising",
  },
  {
    id: "rose",
    label: "Rose",
    defaultAccent: "#ec4899",
    heroGradient: "linear-gradient(180deg, hsl(335 45% 14% / 0.35) 0%, hsl(335 45% 14% / 0.95) 100%)",
    bodyTint: "hsl(335 45% 14%)",
    cardSurface: "hsl(335 40% 18%)",
    textTone: "light",
    vibe: "Bold & creative",
  },
  {
    id: "parchment",
    label: "Parchment",
    defaultAccent: "#7c3aed",
    heroGradient: "linear-gradient(180deg, hsl(40 35% 92% / 0.4) 0%, hsl(40 35% 92% / 0.95) 100%)",
    bodyTint: "hsl(40 35% 92%)",
    cardSurface: "hsl(40 30% 96%)",
    textTone: "dark",
    vibe: "Light & academic",
  },
]

export const LISTING_THEME_IDS = new Set(LISTING_THEMES.map((t) => t.id))

/**
 * Default panel-visibility map a new listing starts with. Admins can
 * toggle each one individually in the editor. Defaults reflect the
 * "most common, safest" choices: show the hero/description/tags by
 * default, but leave verified-stats / live-sessions OFF so the admin
 * has to opt in (some servers are private about their numbers).
 */
export const DEFAULT_SECTIONS_ENABLED: Record<string, boolean> = {
  hero: true,
  description: true,
  tags: true,
  country_language: true,
  gallery: false,
  external_link: true,
  verified_stats: false,
  live_sessions: false,
  embed_widget: true,
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
  { key: "hero",             label: "Hero & cover image",  description: "Big cover photo, server name, tagline, and Join button" },
  { key: "description",      label: "Long description",    description: "Markdown-formatted description of your community" },
  { key: "tags",             label: "Tags & category",     description: "Show your category and secondary tags as chips" },
  { key: "country_language", label: "Country & language",  description: "Show the primary country and language of your community" },
  { key: "gallery",          label: "Photo gallery",       description: "Up to 6 images of your channels, events, or members" },
  { key: "external_link",    label: "Website link (DoFollow)", description: "A single SEO-boosting backlink to your own site" },
  { key: "verified_stats",   label: "Verified by Leo",     description: "Live numbers from Leo: tracked members & study hours", requiresBotData: true },
  { key: "live_sessions",    label: "Live study sessions", description: "Real-time count of members currently in voice channels", requiresBotData: true },
  { key: "embed_widget",     label: "Embed widget snippet",description: "Lets visitors embed your card on their own websites" },
]

export const LISTING_SECTION_KEYS = new Set(LISTING_SECTIONS.map((s) => s.key as string))

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
