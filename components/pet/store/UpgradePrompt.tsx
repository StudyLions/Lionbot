// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- friendly LionHeart upsell modal that
//          fires whenever a free user tries to save a premium-gated
//          store setting (custom name, long speech bubble, premium
//          theme/animation/color in Phase 2).
//
//          Copy emphasizes the open-source / family-project framing
//          per the original feature brief: we want the upsell to feel
//          like an invitation to support the project, not a paywall.
//          CTA links to /donate and lists the specific perks they
//          would unlock.
// ============================================================
import Link from "next/link"
import { X, Heart, Sparkles } from "lucide-react"
import { LION_HEART_TIER_LABELS, type LionHeartTier } from "@/utils/subscription"
import PixelButton from "@/components/pet/ui/PixelButton"

export interface UpgradePromptItem {
  field: string
  label: string
  description?: string
}

interface UpgradePromptProps {
  open: boolean
  onClose: () => void
  /** Lowest tier required to unlock everything in `lockedItems`. */
  requiredTier: LionHeartTier
  /** Locked features the user just tried to save. */
  lockedItems: UpgradePromptItem[]
  /** Optional override for the headline. */
  headline?: string
}

export default function UpgradePrompt({
  open,
  onClose,
  requiredTier,
  lockedItems,
  headline,
}: UpgradePromptProps) {
  if (!open) return null

  const tierLabel = LION_HEART_TIER_LABELS[requiredTier] ?? "LionHeart"
  const heading =
    headline ??
    (lockedItems.length === 1
      ? `Unlock ${lockedItems[0].label} with ${tierLabel}`
      : `Unlock these features with ${tierLabel}`)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-prompt-title"
    >
      <div
        className="relative max-w-md w-full bg-[#0c1020] border-2 border-[var(--pet-gold,#f0c040)] shadow-[6px_6px_0_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-5 pt-5 pb-3 border-b-2 border-[#1a2a3c] flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[var(--pet-gold,#f0c040)]/15 border border-[var(--pet-gold,#f0c040)]">
            <Heart size={18} className="text-[var(--pet-gold,#f0c040)]" />
          </div>
          <div className="min-w-0">
            <h2
              id="upgrade-prompt-title"
              className="font-pixel text-base text-[var(--pet-text,#e2e8f0)] leading-tight"
            >
              {heading}
            </h2>
            <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] mt-1">
              We&apos;re an open-source family project &mdash; subscribers fund every new
              item, animation, and feature you see in the bot.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-2">
          {lockedItems.map((item) => (
            <div
              key={item.field}
              className="flex items-start gap-2 px-3 py-2 border border-[#1a2a3c] bg-[#080c18]"
            >
              <Sparkles size={12} className="text-[var(--pet-gold,#f0c040)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">
                  {item.label}
                </p>
                {item.description && (
                  <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 pt-1 flex flex-col sm:flex-row gap-2 justify-end">
          <PixelButton variant="ghost" size="md" onClick={onClose}>
            Maybe later
          </PixelButton>
          <Link href="/donate">
            <a>
              <PixelButton variant="gold" size="md" className="w-full sm:w-auto">
                Become a {tierLabel}
              </PixelButton>
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}
