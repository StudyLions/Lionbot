// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Card component for the guides hub grid
// ============================================================
import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GuideMeta } from "@/lib/guides"

const CATEGORY_COLORS: Record<string, { badge: string; text: string }> = {
  productivity: { badge: "bg-blue-500/10 text-blue-400", text: "text-blue-400" },
  economy: { badge: "bg-amber-500/10 text-amber-400", text: "text-amber-400" },
  moderation: { badge: "bg-red-500/10 text-red-400", text: "text-red-400" },
  setup: { badge: "bg-emerald-500/10 text-emerald-400", text: "text-emerald-400" },
  customization: { badge: "bg-purple-500/10 text-purple-400", text: "text-purple-400" },
  community: { badge: "bg-cyan-500/10 text-cyan-400", text: "text-cyan-400" },
}

const DEFAULT_COLORS = { badge: "bg-primary/10 text-primary", text: "text-primary" }

export default function GuideCard({ guide }: { guide: GuideMeta }) {
  const colors = CATEGORY_COLORS[guide.category] || DEFAULT_COLORS

  return (
    <Link href={`/guides/${guide.slug}`}>
      <a className="group block h-full p-5 rounded-xl border border-border hover:border-primary/30 bg-accent/10 hover:bg-accent/30 transition-all">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", colors.badge)}>
            {guide.category}
          </span>
          {guide.featured && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400">
              Featured
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {guide.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {guide.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {guide.readingTimeMinutes} min read
          </span>
          <span className={cn("text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", colors.text)}>
            Read guide
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </a>
    </Link>
  )
}
