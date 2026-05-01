// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist Premium Task -- Sticky messages.
//          Editor at /dashboard/servers/[id]/sticky-messages handles
//          per-channel message content, image, footer, and re-post
//          interval. Multi-row management is too much for an inline
//          drawer.
// ============================================================
import { Pin, ExternalLink, MessageSquare, Image, Repeat } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import DrawerFooter from "../../DrawerFooter"
import type { TaskComponentProps } from "../../SetupChecklist"

export default function StickyMessagesTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const editorUrl = `/dashboard/servers/${guildId}/sticky-messages`

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Sticky messages"
      subtitle="A message that auto-reposts at the bottom of busy channels."
      icon={Pin}
      returnFocusTo="setup-task-trigger-sticky_messages"
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
        Pin a permanent embed to the bottom of a channel — Leo deletes the
        old copy and reposts a fresh one whenever the channel gets active.
        Great for channel rules, study tips, or important announcements
        that always need to be visible.
      </p>

      <ul className="space-y-2.5 mb-5 text-sm">
        <li className="flex items-start gap-2.5">
          <MessageSquare size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Rich embed content.</strong>
            <span className="text-muted-foreground"> Title, body, custom color, and footer text.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Image size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Optional image.</strong>
            <span className="text-muted-foreground"> Drop in a link to a banner or graphic.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Repeat size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Smart re-post interval.</strong>
            <span className="text-muted-foreground"> Configure how often a busy channel triggers a re-post.</span>
          </span>
        </li>
      </ul>

      <a
        href={editorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md bg-primary/10 text-primary hover:bg-primary/15 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Manage sticky messages
        <ExternalLink size={14} aria-hidden="true" />
      </a>

      <p className="mt-4 text-[12px] text-muted-foreground/80">
        You can have one sticky message per channel. Add as many channels
        as you like.
      </p>
    </TaskDrawer>
  )
}
