// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Recharts price history line chart (reusable)
// ============================================================
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts"
import { BarChart2 } from "lucide-react"

interface PricePoint { date: string; avgPrice: number; volume: number }

interface Props {
  data: PricePoint[]
  height?: number
  showVolume?: boolean
}

export default function PriceChart({ data, height = 180, showVolume = false }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-lg border border-border/15 bg-muted/5 p-6 flex flex-col items-center justify-center" style={{ height }}>
        <BarChart2 size={24} className="text-muted-foreground/15 mb-2" />
        <p className="text-xs text-muted-foreground/30">No price history yet</p>
        <p className="text-[10px] text-muted-foreground/20 mt-1">Be the first to set the market!</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border/15 bg-muted/5 p-3">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#666" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: "#999" }} width={40} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }}
            formatter={(value: number, name: string) => name === "avgPrice" ? [`${value} Gold`, "Avg Price"] : [`${value}`, "Volume"]}
          />
          <Area type="monotone" dataKey="avgPrice" stroke="#fbbf24" strokeWidth={1.5} fill="url(#priceGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
