// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Deposit coins panel for private room detail view.
//          Shows wallet balance, preset deposit buttons, custom
//          amount input, and post-deposit preview.
// ============================================================
import { useState, useCallback, useMemo } from "react"
import { Coins, Wallet, ArrowRight } from "lucide-react"
import { dashboardMutate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"

export default function DepositPanel({
  channelId,
  rentPrice,
  walletBalance,
  coinBalance,
  onDeposit,
}: {
  channelId: string
  rentPrice: number
  walletBalance: number
  coinBalance: number
  onDeposit: () => void
}) {
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const presets = [
    { days: 7, label: "+7 days" },
    { days: 14, label: "+14 days" },
    { days: 30, label: "+30 days" },
  ]

  const doDeposit = useCallback(
    async (payload: { days?: number; amount?: number }) => {
      setLoading(true)
      try {
        const result = await dashboardMutate(
          "POST",
          `/api/dashboard/rooms/${channelId}/deposit`,
          payload
        )
        toast.success(
          `Deposited ${result.deposited.toLocaleString()} coins! Balance: ${result.newCoinBalance.toLocaleString()} (${result.newDaysRemaining} days)`
        )
        setCustomAmount("")
        onDeposit()
      } catch (err: any) {
        toast.error(err.message || "Deposit failed")
      } finally {
        setLoading(false)
      }
    },
    [channelId, onDeposit]
  )

  const customNum = Number(customAmount) || 0
  const previewDays = useMemo(() => {
    if (customNum <= 0 || rentPrice <= 0) return null
    return Math.floor((coinBalance + customNum) / rentPrice)
  }, [customNum, coinBalance, rentPrice])

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Coins size={14} className="text-amber-400" /> Deposit Coins
      </h4>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs">
        <Wallet size={14} className="text-amber-400 flex-shrink-0" />
        <span className="text-muted-foreground">Your wallet:</span>
        <span className="text-amber-300 font-semibold">
          {walletBalance.toLocaleString()} coins
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const cost = p.days * rentPrice
          const canAfford = walletBalance >= cost
          return (
            <button
              key={p.days}
              disabled={loading || !canAfford}
              onClick={() => doDeposit({ days: p.days })}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={!canAfford ? `Need ${cost.toLocaleString()} coins` : undefined}
            >
              {p.label}
              <span className="ml-1 text-muted-foreground">= {cost.toLocaleString()}</span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:outline-none"
        />
        <button
          disabled={loading || customNum <= 0 || customNum > walletBalance}
          onClick={() => doDeposit({ amount: customNum })}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Deposit
        </button>
      </div>

      {previewDays !== null && customNum > 0 && customNum <= walletBalance && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowRight size={12} className="text-amber-400" />
          After deposit: ~{previewDays} days of rent
        </div>
      )}

      {customNum > walletBalance && customNum > 0 && (
        <p className="text-xs text-red-400">
          Not enough coins (need {customNum.toLocaleString()}, have {walletBalance.toLocaleString()})
        </p>
      )}
    </div>
  )
}
