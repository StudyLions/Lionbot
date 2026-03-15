// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Collapsible wiki overview with global stats and charts
// ============================================================
import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Package, Users, Sparkles, Crown, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#9ca3af", UNCOMMON: "#4ade80", RARE: "#60a5fa",
  EPIC: "#c084fc", LEGENDARY: "#fbbf24", MYTHICAL: "#fb7185",
}

interface MetaData {
  categories: Array<{ category: string; count: number }>
  rarities: Array<{ rarity: string; count: number }>
  totalItems: number
  totalOwned: number
  totalEnhancements: number
  mostPopularItem: { name: string; rarity: string; ownerCount: number; category: string; assetPath: string | null } | null
  rarestOwnedItem: { name: string; rarity: string; ownerCount: number; category: string; assetPath: string | null } | null
  gameConstants: { MATERIAL_DROP_WEIGHTS: Record<string, number> }
}

export default function WikiOverview({ data }: { data: MetaData }) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true
    return localStorage.getItem("wiki-overview-open") !== "false"
  })

  useEffect(() => {
    localStorage.setItem("wiki-overview-open", String(open))
  }, [open])

  const rarityData = data.rarities.map((r) => ({ name: r.rarity, count: r.count, fill: RARITY_COLORS[r.rarity] ?? "#666" }))
  const dropData = Object.entries(data.gameConstants.MATERIAL_DROP_WEIGHTS).map(([name, value]) => ({
    name, value, fill: RARITY_COLORS[name] ?? "#666",
  }))

  const statCards = [
    { label: "Total Items", value: data.totalItems, icon: <Package size={14} /> },
    { label: "Owned Across Players", value: data.totalOwned.toLocaleString(), icon: <Users size={14} /> },
    { label: "Total Enhancements", value: data.totalEnhancements.toLocaleString(), icon: <Sparkles size={14} /> },
  ]

  return (
    <div className="rounded-xl border border-border/30 bg-muted/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground/80">Wiki Overview</span>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/15 border border-border/20 p-3 flex flex-col gap-1">
                <span className="text-muted-foreground/50 text-[10px] flex items-center gap-1">{s.icon} {s.label}</span>
                <span className="text-lg font-bold text-foreground/90">{s.value}</span>
              </div>
            ))}
            {data.mostPopularItem && (
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3 flex flex-col gap-1">
                <span className="text-muted-foreground/50 text-[10px] flex items-center gap-1"><Crown size={10} /> Most Popular</span>
                <span className="text-xs font-bold text-amber-400 truncate">{data.mostPopularItem.name}</span>
                <span className="text-[10px] text-muted-foreground/40">{data.mostPopularItem.ownerCount} owners</span>
              </div>
            )}
            {data.rarestOwnedItem && (
              <div className="rounded-lg bg-rose-500/5 border border-rose-500/15 p-3 flex flex-col gap-1">
                <span className="text-muted-foreground/50 text-[10px] flex items-center gap-1"><Star size={10} /> Rarest Owned</span>
                <span className="text-xs font-bold text-rose-400 truncate">{data.rarestOwnedItem.name}</span>
                <span className="text-[10px] text-muted-foreground/40">{data.rarestOwnedItem.ownerCount} owners</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/10 border border-border/20 p-3">
              <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-2">Rarity Distribution</h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={rarityData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#999" }} width={70} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {rarityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-lg bg-muted/10 border border-border/20 p-3">
              <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-2">Material Drop Rates</h4>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={dropData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
                    {dropData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }}
                    formatter={(value: number) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
                {dropData.map((d) => (
                  <span key={d.name} className="text-[9px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.fill }} />
                    {d.name} {d.value}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
