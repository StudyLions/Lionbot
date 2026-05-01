// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist Premium Task -- Card branding.
//          Inline preset picker (7 baseline skins). Per-card color
//          customisation lives in the full editor at
//          /dashboard/servers/[id]/branding.
// ============================================================
import { useEffect, useState } from "react"
import { Palette, ExternalLink } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import DrawerFooter from "../../DrawerFooter"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../../SetupChecklist"

interface BrandingResponse {
  isPremium: boolean
  baseSkinName: string | null
  availableSkins: string[]
  properties: Record<string, Record<string, string>>
}

// User-friendly labels + a representative swatch color for each preset
// skin. Hex values are picked to evoke the actual rendered card mood;
// the real per-card colors are richer and live in the bot's PIL
// renderer, but a single dot is enough for an at-a-glance inline picker.
const SKIN_META: Record<string, { label: string; swatch: string; subtitle: string }> = {
  original:     { label: "Original",      swatch: "#DDB21D", subtitle: "Leo's classic gold + warm tones." },
  obsidian:     { label: "Obsidian",      swatch: "#1F2937", subtitle: "Pitch-black with muted highlights." },
  platinum:     { label: "Platinum",      swatch: "#E5E7EB", subtitle: "Cool greys, lots of light." },
  boston_blue:  { label: "Boston Blue",   swatch: "#1E3A8A", subtitle: "Deep navy, formal." },
  cotton_candy: { label: "Cotton Candy",  swatch: "#F472B6", subtitle: "Soft pink, friendly." },
  blue_bayoux:  { label: "Blue Bayoux",   swatch: "#5B7B9D", subtitle: "Muted slate-blue, calm." },
  bubblegum:    { label: "Bubblegum",     swatch: "#EC4899", subtitle: "Bright pink, playful." },
}

export default function BrandingTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/branding`
  const editorUrl = `/dashboard/servers/${guildId}/branding`
  const { data } = useDashboard<BrandingResponse>(open ? apiKey : null)

  const [draftSkin, setDraftSkin] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data) return
    setDraftSkin(data.baseSkinName ?? "original")
    setDirty(false)
  }, [data, open])

  async function save() {
    if (!draftSkin) return
    setSaving(true)
    try {
      await dashboardMutate("PATCH", apiKey, { baseSkinName: draftSkin })
      invalidate(apiKey)
      invalidate(`/api/dashboard/servers/${guildId}/setup-checklist`)
      toast.success("Theme saved.")
      onComplete()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || "Couldn't save \u2014 try again.")
    } finally {
      setSaving(false)
    }
  }

  function pick(skin: string) {
    setDraftSkin(skin)
    setDirty(skin !== (data?.baseSkinName ?? "original"))
  }

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Card branding"
      subtitle="Pick the colours used on Leo's profile, leaderboard, and stat cards."
      icon={Palette}
      returnFocusTo="setup-task-trigger-branding"
      footer={
        <DrawerFooter
          onSkip={() => {
            onSkip()
            onClose()
          }}
          onSave={save}
          onClose={onClose}
          saving={saving}
          dirty={dirty}
          onComplete={onComplete}
          // hasValue=true: there's always a current skin to confirm
          // (defaults to "original"), so the no-write path is always
          // available via "Looks good -- mark as done".
          hasValue
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Pick a baseline theme that matches your server's vibe. Each one
        recolours every Leo image (profile cards, leaderboards, stat
        graphs, rank-up notifications) consistently.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(SKIN_META).map(([skin, meta]) => {
          const checked = draftSkin === skin
          return (
            <button
              key={skin}
              type="button"
              onClick={() => pick(skin)}
              disabled={saving}
              className={`text-left rounded-lg border px-3 py-2.5 transition-colors min-h-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                checked ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/50"
              }`}
              aria-pressed={checked}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="shrink-0 inline-block w-7 h-7 rounded-full border border-border/40"
                  style={{ background: meta.swatch }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{meta.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{meta.subtitle}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <a
        href={editorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        More options (per-card colours, fonts, advanced)
        <ExternalLink size={12} aria-hidden="true" />
      </a>
    </TaskDrawer>
  )
}
