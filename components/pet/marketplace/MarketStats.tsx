// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace stats banner (volume, listings, trades)
// ============================================================
import { Coins, Gem, ShoppingCart, TrendingUp, Zap } from "lucide-react"

interface StatsData {
  activeListings: number
  totalSalesEver: number
  volume24h: { gold: number; gems: number }
  biggestSale: { itemName: string; totalPrice: number; currency: string; quantity: number } | null
}

export default function MarketStats({ data }: { data: StatsData | null }) {
  if (!data) return null

  const hasActivity = data.totalSalesEver > 0 || data.activeListings > 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><ShoppingCart size={10} /> Active Listings</span>
        <p className="text-lg font-bold mt-1">{data.activeListings}</p>
      </div>
      <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><TrendingUp size={10} /> Total Trades</span>
        <p className="text-lg font-bold mt-1">{data.totalSalesEver}</p>
      </div>
      <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Coins size={10} /> 24h Gold Volume</span>
        <p className="text-lg font-bold mt-1 text-amber-400">{data.volume24h.gold.toLocaleString()}</p>
      </div>
      <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Gem size={10} /> 24h Gem Volume</span>
        <p className="text-lg font-bold mt-1 text-cyan-400">{data.volume24h.gems.toLocaleString()}</p>
      </div>
      {!hasActivity && (
        <div className="col-span-full text-center py-2">
          <p className="text-xs text-muted-foreground/40">No trades yet -- be the first to kickstart the economy!</p>
        </div>
      )}
    </div>
  )
}
