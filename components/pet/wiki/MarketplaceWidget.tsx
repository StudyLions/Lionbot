// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Real marketplace widget for item detail pages.
//          Shows actual price history, active listings, and
//          supply data. No mock data -- shows encouraging
//          empty states when no data exists.
// ============================================================
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Store, BarChart2, ShoppingCart } from "lucide-react"
import PriceChart from "@/components/pet/marketplace/PriceChart"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import PixelButton from "@/components/pet/ui/PixelButton"

interface Props {
  itemId: number
  itemName: string
}

export default function MarketplaceWidget({ itemId, itemName }: Props) {
  const { data: session } = useSession()
  const { data } = useDashboard<any>(session ? `/api/pet/marketplace/history?itemId=${itemId}&days=30` : null)

  const summary = data?.summary
  const hasData = summary && (summary.totalSales > 0 || summary.activeListings > 0)

  return (
    <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-4 space-y-4 shadow-[2px_2px_0_#060810]">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-sm text-[#c0d0e0] flex items-center gap-2">
          <Store size={14} /> Marketplace
        </h3>
        <Link href="/pet/marketplace" className="font-pixel text-[9px] text-[#4080f0] hover:text-[#80b0ff] transition-colors">
          View All Listings
        </Link>
      </div>

      {hasData ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2.5 text-center">
              <p className="font-pixel text-lg text-[#f0c040]">
                {summary.avgPrice > 0 ? (
                  <GoldDisplay amount={Math.round(summary.avgPrice)} size="md" />
                ) : (
                  <span className="text-[#2a3a50]">--</span>
                )}
              </p>
              <p className="font-pixel text-[8px] text-[#4a5a70]">Avg Price (30d)</p>
            </div>
            <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2.5 text-center">
              <p className="font-pixel text-lg text-[#c0d0e0]">{summary.totalVolume}</p>
              <p className="font-pixel text-[8px] text-[#4a5a70]">Units Traded</p>
            </div>
            <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2.5 text-center">
              <p className="font-pixel text-lg text-[#c0d0e0]">{summary.activeListings}</p>
              <p className="font-pixel text-[8px] text-[#4a5a70]">Active Listings</p>
            </div>
          </div>

          {summary.lowestPrice && (
            <p className="font-pixel text-[9px] text-[#4a5a70]">
              Cheapest listing: <span className="text-[#f0c040]">{summary.lowestPrice.price.toLocaleString()} {summary.lowestPrice.currency}</span>
            </p>
          )}

          <div>
            <h4 className="font-pixel text-[9px] uppercase text-[#4a5a70] mb-2">Price History (30 days)</h4>
            <PriceChart data={data?.priceHistory ?? []} height={140} />
          </div>

          {data?.supply?.length > 0 && (
            <div>
              <h4 className="font-pixel text-[9px] uppercase text-[#4a5a70] mb-1">Recent Supply Sources</h4>
              <div className="flex flex-wrap gap-2">
                {data.supply.map((s: any) => (
                  <span key={s.source} className="font-pixel px-2 py-0.5 border-2 border-[#1a2a3c] bg-[#0f1628] text-[8px] text-[#4a5a70]">
                    {s.source}: {s.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <BarChart2 size={28} className="mx-auto text-[#1a2a3c] mb-2" />
          <p className="font-pixel text-[10px] text-[#4a5a70]">No marketplace activity yet for this item</p>
          <p className="font-pixel text-[8px] text-[#2a3a50] mt-1 max-w-[240px] mx-auto">
            Be the first to set the market! List {itemName} for sale and start the economy.
          </p>
          <Link href="/pet/marketplace/sell">
            <PixelButton variant="gold" size="sm" className="mt-3 mx-auto">
              <ShoppingCart size={10} /> List for Sale
            </PixelButton>
          </Link>
        </div>
      )}
    </div>
  )
}
