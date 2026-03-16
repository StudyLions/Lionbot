// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace stats banner (volume, listings, trades)
// ============================================================
import { ShoppingCart, TrendingUp } from "lucide-react"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

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
      <div className="border-2 border-[#2a3a5c] bg-[#0f1628] p-3 shadow-[2px_2px_0_#060810]">
        <span className="font-pixel text-[8px] text-[#4a5a70] flex items-center gap-1 uppercase tracking-wide">
          <ShoppingCart size={10} /> Active Listings
        </span>
        <p className="font-pixel text-lg text-[#c0d0e0] mt-1.5">{data.activeListings}</p>
      </div>

      <div className="border-2 border-[#2a3a5c] bg-[#0f1628] p-3 shadow-[2px_2px_0_#060810]">
        <span className="font-pixel text-[8px] text-[#4a5a70] flex items-center gap-1 uppercase tracking-wide">
          <TrendingUp size={10} /> Total Trades
        </span>
        <p className="font-pixel text-lg text-[#c0d0e0] mt-1.5">{data.totalSalesEver}</p>
      </div>

      <div className="border-2 border-[#2a3a5c] bg-[#0f1628] p-3 shadow-[2px_2px_0_#060810]">
        <span className="font-pixel text-[8px] text-[#4a5a70] flex items-center gap-1 uppercase tracking-wide">
          24h Gold Vol
        </span>
        <div className="mt-1.5">
          <GoldDisplay amount={data.volume24h.gold} type="gold" size="lg" />
        </div>
      </div>

      <div className="border-2 border-[#2a3a5c] bg-[#0f1628] p-3 shadow-[2px_2px_0_#060810]">
        <span className="font-pixel text-[8px] text-[#4a5a70] flex items-center gap-1 uppercase tracking-wide">
          24h Gem Vol
        </span>
        <div className="mt-1.5">
          <GoldDisplay amount={data.volume24h.gems} type="gem" size="lg" />
        </div>
      </div>

      {!hasActivity && (
        <div className="col-span-full border-2 border-[#1a2a3c] bg-[#0a0e1a] text-center py-3">
          <p className="font-pixel text-[10px] text-[#3a4a60]">
            NO TRADES YET -- BE THE FIRST!
          </p>
        </div>
      )}
    </div>
  )
}
