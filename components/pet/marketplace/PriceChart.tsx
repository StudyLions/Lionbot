// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Recharts price history line chart (reusable)
// ============================================================
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts"
import { BarChart2 } from "lucide-react"

interface PricePoint { date: string; avgPrice: number; volume: number }

// --- AI-MODIFIED (2026-03-31) ---
// Purpose: Add currency prop to control chart color and tooltip label
interface Props {
  data: PricePoint[]
  height?: number
  showVolume?: boolean
  currency?: "GOLD" | "GEMS"
}

const CURRENCY_CONFIG = {
  GOLD: { stroke: "#f0c040", label: "Gold", gradId: "priceGradGold" },
  GEMS: { stroke: "#a060f0", label: "Gems", gradId: "priceGradGems" },
} as const

export default function PriceChart({ data, height = 180, showVolume = false, currency = "GOLD" }: Props) {
  const cc = CURRENCY_CONFIG[currency]
// --- END AI-MODIFIED ---

  if (!data.length) {
    return (
      <div
        className="border-2 border-[#2a3a5c] bg-[#0f1628] p-6 flex flex-col items-center justify-center shadow-[2px_2px_0_#060810]"
        style={{ height }}
      >
        <BarChart2 size={24} className="text-[#2a3a5c] mb-2" />
        <p className="font-pixel text-[13px] text-[#4a5a70]">NO PRICE HISTORY</p>
        <p className="font-pixel text-[11px] text-[#3a4a60] mt-1">BE THE FIRST TO SET THE MARKET!</p>
      </div>
    )
  }

  return (
    <div className="border-2 border-[#2a3a5c] bg-[#0f1628] p-3 shadow-[2px_2px_0_#060810]">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
          <defs>
            {/* --- AI-MODIFIED (2026-03-31) --- */}
            {/* Purpose: Use currency-specific gradient ID and color */}
            <linearGradient id={cc.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={cc.stroke} stopOpacity={0.2} />
              <stop offset="95%" stopColor={cc.stroke} stopOpacity={0} />
            </linearGradient>
            {/* --- END AI-MODIFIED --- */}
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="#1a2a3c" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 16, fill: "#4a5a70", fontFamily: "var(--font-pixel)" }}
            interval="preserveStartEnd"
            stroke="#1a2a3c"
          />
          <YAxis
            tick={{ fontSize: 16, fill: "#4a5a70", fontFamily: "var(--font-pixel)" }}
            width={40}
            stroke="#1a2a3c"
          />
          {/* --- AI-MODIFIED (2026-03-31) --- */}
          {/* Purpose: Use currency-aware color and label in tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1628",
              border: "2px solid #2a3a5c",
              borderRadius: 0,
              fontSize: 18,
              fontFamily: "var(--font-pixel)",
              color: "#c0d0e0",
              boxShadow: "2px 2px 0 #060810",
            }}
            itemStyle={{ color: cc.stroke }}
            formatter={(value: number, name: string) =>
              name === "avgPrice" ? [`${value} ${cc.label}`, "Avg Price"] : [`${value}`, "Volume"]
            }
          />
          <Area type="monotone" dataKey="avgPrice" stroke={cc.stroke} strokeWidth={2} fill={`url(#${cc.gradId})`} />
          {/* --- END AI-MODIFIED --- */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
