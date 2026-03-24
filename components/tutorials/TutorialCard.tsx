// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Card component for the tutorials landing page grid
// ============================================================
import Link from "next/link"
import { ChevronRight, Clock } from "lucide-react"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Added icons for new tutorials (History, Pencil, Maximize2, Gem, Armchair, Hammer, Sparkles, Users2, Volume2, Crown)
import {
  Rocket, CheckSquare, Bell, User, Timer, Coins, Trophy, Palette,
  Settings, BarChart3, ShoppingBag, Layers, Sliders, Shield, Video,
  LayoutDashboard, Target, Heart, DoorOpen, Cat, Sprout, Store,
  History, Pencil, Maximize2, Gem, Armchair, Hammer, Sparkles, Users2, Volume2, Crown,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Rocket, CheckSquare, Bell, User, Timer, Coins, Trophy, Palette,
  Settings, BarChart3, ShoppingBag, Layers, Sliders, Clock, Shield, Video,
  LayoutDashboard, Target, Heart, DoorOpen, Cat, Sprout, Store,
  History, Pencil, Maximize2, Gem, Armchair, Hammer, Sparkles, Users2, Volume2, Crown,
}
// --- END AI-MODIFIED ---

interface TutorialCardProps {
  slug: string
  title: string
  description: string
  iconName: string
  estimatedMinutes: number
  audience: "member" | "admin"
}

export default function TutorialCard({
  slug,
  title,
  description,
  iconName,
  estimatedMinutes,
  audience,
}: TutorialCardProps) {
  const Icon = ICON_MAP[iconName] || Rocket

  return (
    <Link href={`/tutorials/${slug}`}>
      <div className="group bg-card/50 border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer h-full flex flex-col">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <Icon size={20} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                {audience === "member" ? "Member" : "Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock size={10} />
                {estimatedMinutes} min
              </span>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
          />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
          {description}
        </p>
      </div>
    </Link>
  )
}
