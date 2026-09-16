// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-15
// Purpose: Bulk "remove all plants of a rarity" panel. Lists each
//          rarity present among LIVE plots with its count + estimated
//          50% refund, and a two-step confirm before firing the
//          server-side `removeByRarity` action (one atomic txn).
//          Dead plants are excluded here (parity with single Remove /
//          uprootPlot — those use Clear), so counts match what the
//          server will actually uproot.
// ============================================================
import { useMemo, useState } from "react"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import type { FarmPlot } from "./FarmScene"

// Most-valuable first, so the riskiest removals read top-down.
const RARITY_ORDER = ["LEGENDARY", "EPIC", "RARE", "UNCOMMON", "COMMON"] as const

const rarityBorderColors: Record<string, string> = {
  COMMON: "#6a7080",
  UNCOMMON: "#4080f0",
  RARE: "#e04040",
  EPIC: "#f0c040",
  LEGENDARY: "#d060f0",
}

interface RemoveByRarityPanelProps {
  plots: FarmPlot[]
  onRemove: (rarity: string) => Promise<void>
  onCancel: () => void
}

export default function RemoveByRarityPanel({ plots, onRemove, onCancel }: RemoveByRarityPanelProps) {
  const [pending, setPending] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)

  // Group live, planted plots by rarity. Refund mirrors the server:
  // floor(goldInvested / 2) per plot, summed.
  const groups = useMemo(() => {
    const acc: Record<string, { count: number; refund: number }> = {}
    for (const p of plots) {
      if (p.empty || p.dead || !p.seed) continue
      const r = p.rarity || "COMMON"
      const g = acc[r] || (acc[r] = { count: 0, refund: 0 })
      g.count++
      g.refund += Math.floor((p.goldInvested || 0) / 2)
    }
    return RARITY_ORDER.filter((r) => acc[r]).map((r) => ({ rarity: r, ...acc[r] }))
  }, [plots])

  async function confirm(rarity: string) {
    setActing(rarity)
    try {
      await onRemove(rarity)
    } finally {
      setActing(null)
      setPending(null)
    }
  }

  return (
    <div className="border-[3px] border-[#7a2a2a] p-[3px]" style={{ boxShadow: "3px 3px 0 #060810" }}>
      <div className="border-2 border-[#e04040]/40 bg-[#0c1020] p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-[#1a2a3c]">
          <span className="font-pixel text-base text-[var(--pet-text,#e2e8f0)]">Remove by Rarity</span>
          <button
            onClick={onCancel}
            className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] hover:text-[#c0d0e0]"
          >
            Close
          </button>
        </div>

        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
          Uproots every live plant of the chosen rarity for a 50% gold refund. Dead plants aren&apos;t touched
          (use Clear Dead). This can&apos;t be undone.
        </p>

        {groups.length === 0 ? (
          <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] py-2 text-center">
            No live plants to remove.
          </p>
        ) : (
          <div className="space-y-2">
            {groups.map(({ rarity, count, refund }) => {
              const bc = rarityBorderColors[rarity] || "#3a4a6c"
              const isPending = pending === rarity
              const isActing = acting === rarity
              return (
                <div
                  key={rarity}
                  className="flex items-center justify-between gap-3 border-2 bg-[#080c18] px-3 py-2"
                  style={{ borderColor: `${bc}60` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PixelBadge rarity={rarity} />
                    <span className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)]">
                      {count} plant{count > 1 ? "s" : ""}
                    </span>
                    {refund > 0 && (
                      <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] flex items-center gap-1">
                        ~<GoldDisplay amount={refund} size="sm" /> back
                      </span>
                    )}
                  </div>

                  {isPending ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <PixelButton variant="danger" size="sm" loading={isActing} onClick={() => confirm(rarity)}>
                        Confirm
                      </PixelButton>
                      <PixelButton variant="ghost" size="sm" disabled={isActing} onClick={() => setPending(null)}>
                        Cancel
                      </PixelButton>
                    </div>
                  ) : (
                    <PixelButton
                      variant="danger"
                      size="sm"
                      className="flex-shrink-0"
                      disabled={acting !== null}
                      onClick={() => setPending(rarity)}
                    >
                      Remove all
                    </PixelButton>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}