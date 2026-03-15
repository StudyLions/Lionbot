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
import { Coins, Store, TrendingUp, BarChart2, ShoppingCart } from "lucide-react"
import PriceChart from "@/components/pet/marketplace/PriceChart"

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
    <div className="rounded-xl border border-border/20 bg-muted/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Store size={14} /> Marketplace
        </h3>
        <Link href="/pet/marketplace" className="text-[10px] text-primary hover:underline">
          View All Listings
        </Link>
      </div>

      {hasData ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/10 p-2.5 text-center">
              <p className="text-lg font-bold text-amber-400">{summary.avgPrice > 0 ? `~${summary.avgPrice}` : "--"}</p>
              <p className="text-[9px] text-muted-foreground/40">Avg Price (30d)</p>
            </div>
            <div className="rounded-lg bg-muted/10 p-2.5 text-center">
              <p className="text-lg font-bold">{summary.totalVolume}</p>
              <p className="text-[9px] text-muted-foreground/40">Units Traded</p>
            </div>
            <div className="rounded-lg bg-muted/10 p-2.5 text-center">
              <p className="text-lg font-bold">{summary.activeListings}</p>
              <p className="text-[9px] text-muted-foreground/40">Active Listings</p>
            </div>
          </div>

          {summary.lowestPrice && (
            <p className="text-[10px] text-muted-foreground/50">
              Cheapest listing: <span className="text-amber-400 font-medium">{summary.lowestPrice.price.toLocaleString()} {summary.lowestPrice.currency}</span>
            </p>
          )}

          <div>
            <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-2">Price History (30 days)</h4>
            <PriceChart data={data?.priceHistory ?? []} height={140} />
          </div>

          {data?.supply?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-1">Recent Supply Sources</h4>
              <div className="flex flex-wrap gap-2">
                {data.supply.map((s: any) => (
                  <span key={s.source} className="px-2 py-0.5 rounded bg-muted/10 text-[9px] text-muted-foreground/50">
                    {s.source}: {s.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <BarChart2 size={28} className="mx-auto text-muted-foreground/15 mb-2" />
          <p className="text-xs text-muted-foreground/40">No marketplace activity yet for this item</p>
          <p className="text-[10px] text-muted-foreground/25 mt-1 max-w-[240px] mx-auto">
            Be the first to set the market! List {itemName} for sale and start the economy.
          </p>
          <Link href="/pet/marketplace/sell">
            <button className="mt-3 px-4 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] font-semibold hover:bg-primary/25 transition-colors flex items-center gap-1 mx-auto">
              <ShoppingCart size={10} /> List for Sale
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
