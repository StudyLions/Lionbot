// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist Premium Task -- Feature your server (public
//          listing). Editor at /dashboard/servers/[id]/listing handles
//          the entire profile: theme, cover, sections, invite, DoFollow
//          backlink, analytics, promotion. Way too much to inline.
// ============================================================
import { Sparkles, ExternalLink, Globe, Link2, BarChart3 } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import DrawerFooter from "../../DrawerFooter"
import type { TaskComponentProps } from "../../SetupChecklist"

export default function ListingTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const editorUrl = `/dashboard/servers/${guildId}/listing`

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Feature your server"
      subtitle="Build a public profile page on lionbot.org."
      icon={Sparkles}
      returnFocusTo="setup-task-trigger-listing"
      footer={
        <DrawerFooter
          onSkip={() => {
            onSkip()
            onClose()
          }}
          onClose={onClose}
          onComplete={onComplete}
          hasValue
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Get a public profile at <span className="font-mono text-foreground/85">lionbot.org/servers/your-name</span>{" "}
        with a custom theme, cover image, and a real DoFollow backlink to
        your own website. Helps people discover your community and gives
        you a small SEO boost on top of that.
      </p>

      <ul className="space-y-2.5 mb-5 text-sm">
        <li className="flex items-start gap-2.5">
          <Globe size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Custom-themed profile page.</strong>
            <span className="text-muted-foreground"> Pick a preset, accent color, font, and cover image.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Link2 size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Real DoFollow backlink.</strong>
            <span className="text-muted-foreground"> Link out to your website — search engines see it.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <BarChart3 size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Analytics dashboard.</strong>
            <span className="text-muted-foreground"> Page views, invite clicks, and outbound link clicks.</span>
          </span>
        </li>
      </ul>

      <a
        href={editorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md bg-primary/10 text-primary hover:bg-primary/15 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Open the listing editor
        <ExternalLink size={14} aria-hidden="true" />
      </a>

      <p className="mt-4 text-[12px] text-muted-foreground/80">
        New listings go through a quick manual review (usually within
        24 hours) before they're live in the public directory.
      </p>
    </TaskDrawer>
  )
}
