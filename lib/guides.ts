// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Utility functions for reading and parsing MDX guide
//          content from the content/guides/ directory. Used by
//          getStaticProps/getStaticPaths in pages/guides/.
// ============================================================
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"

const GUIDES_DIR = path.join(process.cwd(), "content", "guides")

export interface GuideFrontmatter {
  title: string
  description: string
  slug: string
  keywords: string[]
  category: string
  author: string
  publishedAt: string
  updatedAt: string
  readingTime?: number
  featured?: boolean
  draft?: boolean
}

export interface GuideMeta extends GuideFrontmatter {
  readingTimeMinutes: number
}

export interface GuideContent extends GuideMeta {
  content: string
}

export function getAllGuides(): GuideMeta[] {
  if (!fs.existsSync(GUIDES_DIR)) return []

  const files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".mdx"))

  const guides = files
    .map((filename) => {
      const filePath = path.join(GUIDES_DIR, filename)
      const raw = fs.readFileSync(filePath, "utf-8")
      const { data, content } = matter(raw)
      const fm = data as GuideFrontmatter

      if (fm.draft) return null

      return {
        ...fm,
        slug: fm.slug || filename.replace(/\.mdx$/, ""),
        readingTimeMinutes: fm.readingTime || Math.ceil(readingTime(content).minutes),
      } as GuideMeta
    })
    .filter(Boolean) as GuideMeta[]

  return guides.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getGuideBySlug(slug: string): GuideContent | null {
  if (!fs.existsSync(GUIDES_DIR)) return null

  const files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".mdx"))

  for (const filename of files) {
    const filePath = path.join(GUIDES_DIR, filename)
    const raw = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(raw)
    const fm = data as GuideFrontmatter
    const fileSlug = fm.slug || filename.replace(/\.mdx$/, "")

    if (fileSlug === slug) {
      return {
        ...fm,
        slug: fileSlug,
        readingTimeMinutes: fm.readingTime || Math.ceil(readingTime(content).minutes),
        content,
      }
    }
  }

  return null
}

export function getGuidesByCategory(category: string): GuideMeta[] {
  return getAllGuides().filter((g) => g.category === category)
}

export function getAllGuideSlugs(): string[] {
  return getAllGuides().map((g) => g.slug)
}

export function getRelatedGuides(slug: string, limit = 3): GuideMeta[] {
  const current = getAllGuides().find((g) => g.slug === slug)
  if (!current) return []

  const others = getAllGuides().filter((g) => g.slug !== slug)

  const scored = others.map((g) => {
    let score = 0
    if (g.category === current.category) score += 3
    const sharedKeywords = g.keywords.filter((k) => current.keywords.includes(k))
    score += sharedKeywords.length
    return { guide: g, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.guide)
}

export function getGuideCategories(): string[] {
  const guides = getAllGuides()
  const seen: Record<string, boolean> = {}
  return guides
    .map((g) => g.category)
    .filter((cat) => {
      if (seen[cat]) return false
      seen[cat] = true
      return true
    })
}
