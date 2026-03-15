// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Mock marketplace section with price chart
// ============================================================
import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { TrendingUp, TrendingDown, Minus, Coins } from "lucide-react"

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

interface Props {
  itemId: number
  goldPrice: number | null
  rarity: string
}

const RARITY_BASE: Record<string, number> = {
  COMMON: 50, UNCOMMON: 150, RARE: 400, EPIC: 1000, LEGENDARY: 3000, MYTHICAL: 10000,
}

export default function MarketplaceMock({ itemId, goldPrice, rarity }: Props) {
  const basePrice = goldPrice ?? RARITY_BASE[rarity] ?? 100
  const rand = seededRandom(itemId * 7919)

  const { priceData, avgPrice, trend, trades } = useMemo(() => {
    const r = seededRandom(itemId * 7919)
    const data = []
    let price = basePrice
    for (let d = 30; d >= 0; d--) {
      price = Math.max(10, price + (r() - 0.48) * basePrice * 0.08)
      data.push({ day: `${d}d ago`, price: Math.round(price) })
    }
    const avg = Math.round(data.reduce((s, d) => s + d.price, 0) / data.length)
    const lastThird = data.slice(-10)
    const firstThird = data.slice(0, 10)
    const lastAvg = lastThird.reduce((s, d) => s + d.price, 0) / lastThird.length
    const firstAvg = firstThird.reduce((s, d) => s + d.price, 0) / firstThird.length
    const diff = (lastAvg - firstAvg) / firstAvg
    const t = diff > 0.03 ? "Rising" : diff < -0.03 ? "Falling" : "Stable"

    const mockTrades = [
      { buyer: `Player${Math.floor(r() * 9000 + 1000)}`, qty: 1, price: Math.round(basePrice * (0.9 + r() * 0.2)), ago: "2h ago" },
      { buyer: `Player${Math.floor(r() * 9000 + 1000)}`, qty: Math.floor(r() * 3) + 1, price: Math.round(basePrice * (0.85 + r() * 0.3)), ago: "8h ago" },
      { buyer: `Player${Math.floor(r() * 9000 + 1000)}`, qty: 1, price: Math.round(basePrice * (0.88 + r() * 0.25)), ago: "1d ago" },
    ]

    return { priceData: data.reverse(), avgPrice: avg, trend: t, trades: mockTrades }
  }, [itemId, basePrice])

  const TrendIcon = trend === "Rising" ? TrendingUp : trend === "Falling" ? TrendingDown : Minus
  const trendColor = trend === "Rising" ? "text-emerald-400" : trend === "Falling" ? "text-red-400" : "text-muted-foreground"

  return (
    <div className="rounded-xl border border-border/20 bg-muted/5 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
        PREVIEW
      </div>
      <h3 className="text-sm font-semibold mb-3">Marketplace</h3>
      <p className="text-[10px] text-muted-foreground/40 mb-4">Coming Soon -- Mock data for preview</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-muted/10 p-2.5">
          <span className="text-[10px] text-muted-foreground/50">Average Price</span>
          <div className="flex items-center gap-1 mt-1">
            <Coins size={12} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">~{avgPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="rounded-lg bg-muted/10 p-2.5">
          <span className="text-[10px] text-muted-foreground/50">Price Trend</span>
          <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
            <TrendIcon size={12} />
            <span className="text-sm font-bold">{trend}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted/10 border border-border/10 p-3 mb-4">
        <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-2">Price History (30 days)</h4>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={priceData} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" tick={{ fontSize: 8, fill: "#666" }} interval={6} />
            <YAxis tick={{ fontSize: 9, fill: "#999" }} width={40} />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="price" stroke="#fbbf24" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-2">Recent Trades</h4>
        <div className="space-y-1.5">
          {trades.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] text-muted-foreground/60">
              <span>{t.buyer} bought x{t.qty}</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Coins size={8} /> {t.price.toLocaleString()} <span className="text-muted-foreground/30 ml-1">{t.ago}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
