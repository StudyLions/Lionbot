// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist Premium Task -- Ambient sounds.
//          The full editor (channel pickers, sound assignments per slot,
//          volume, voting toggles) lives at /dashboard/servers/[id]/ambient-sounds
//          and is too dense to inline here. So this drawer is a
//          benefit-first summary + a single "Open ambient sounds editor"
//          jump. The admin marks the task done either by Save-and-close
//          after configuring (next page-load picks up the configured
//          state via the API's Promise.all) or by clicking "Looks good --
//          mark as done" if they're happy with the defaults.
// ============================================================
import { Music2, ExternalLink, Volume2, Cloud, Headphones } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import DrawerFooter from "../../DrawerFooter"
import type { TaskComponentProps } from "../../SetupChecklist"

export default function AmbientSoundsTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const editorUrl = `/dashboard/servers/${guildId}/ambient-sounds`

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Ambient sounds"
      subtitle="Quiet, looping background audio in your study channels."
      icon={Music2}
      returnFocusTo="setup-task-trigger-ambient_sounds"
      footer={
        <DrawerFooter
          onSkip={() => {
            onSkip()
            onClose()
          }}
          onClose={onClose}
          onComplete={onComplete}
          // hasValue is true so the primary button always reads
          // "Looks good -- mark as done" rather than the bare "Close".
          // Marking done from here is OK because the editor opens in a
          // new tab and the admin will configure things separately.
          hasValue
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Add gentle background sound to your study voice channels — rain on a window,
        a crackling campfire, ocean waves, brown noise, or a curated LoFi playlist.
        Up to 10 ambient bots can run at once across different channels.
      </p>

      <ul className="space-y-2.5 mb-5 text-sm">
        <li className="flex items-start gap-2.5">
          <Volume2 size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Per-channel volume.</strong>
            <span className="text-muted-foreground"> Each ambient bot has its own loudness slider.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Cloud size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">9 sound packs.</strong>
            <span className="text-muted-foreground"> Rain, ocean, campfire, brown / white / pink noise, LoFi, classical, focus.</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Headphones size={16} className="shrink-0 mt-0.5 text-amber-400/85" aria-hidden="true" />
          <span className="text-foreground/90">
            <strong className="font-medium text-foreground">Member voting (optional).</strong>
            <span className="text-muted-foreground"> Members can vote to switch the current track.</span>
          </span>
        </li>
      </ul>

      <a
        href={editorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md bg-primary/10 text-primary hover:bg-primary/15 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Open ambient sounds editor
        <ExternalLink size={14} aria-hidden="true" />
      </a>

      <p className="mt-4 text-[12px] text-muted-foreground/80">
        Editor opens in a new tab so you can keep this checklist open. You can
        always come back and tweak settings later.
      </p>
    </TaskDrawer>
  )
}
