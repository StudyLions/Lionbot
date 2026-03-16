// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Collapsible wiki overview with global stats and charts
// ============================================================
import { useState, useEffect } from "react"
import { Package, Users, Sparkles, Crown, Star } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const TOOLTIP_STYLE = {
  backgroundColor: "#0f1628",
  border: "2px solid #2a3a5c",
  borderRadius: 0,
  fontSize: 11,
  fontFamily: "var(--font-pixel, monospace)",
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
    { label: "Total Items", value: data.totalItems, icon: <Package size={18} />, border: "#4080f0" },
    { label: "Owned Across Players", value: data.totalOwned.toLocaleString(), icon: <Users size={18} />, border: "#40d870" },
    { label: "Total Enhancements", value: data.totalEnhancements.toLocaleString(), icon: <Sparkles size={18} />, border: "#d060f0" },
  ]

  return (
    <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] overflow-hidden shadow-[2px_2px_0_#060810]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111828] transition-colors"
      >
        <span className="font-pixel text-base text-[#c0d0e0]">Wiki Overview</span>
        <span className="font-pixel text-[13px] text-[#4a5a70] select-none">
          {open ? "[-]" : "[+]"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t-2 border-[#1a2a3c]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="border-2 bg-[#0f1628] p-3 flex flex-col gap-1"
                style={{ borderColor: `${s.border}40` }}
              >
                <span className="font-pixel text-[12px] text-[#4a5a70] flex items-center gap-1">{s.icon} {s.label}</span>
                <span className="font-pixel text-xl text-[#c0d0e0]">{s.value}</span>
              </div>
            ))}
            {data.mostPopularItem && (
              <div className="border-2 border-[#f0c040]/40 bg-[#f0c040]/5 p-3 flex flex-col gap-1">
                <span className="font-pixel text-[12px] text-[#4a5a70] flex items-center gap-1"><Crown size={14} /> Most Popular</span>
                <span className="font-pixel text-[13px] text-[#f0c040] truncate">{data.mostPopularItem.name}</span>
                <span className="font-pixel text-[12px] text-[#4a5a70]">{data.mostPopularItem.ownerCount} owners</span>
              </div>
            )}
            {data.rarestOwnedItem && (
              <div className="border-2 border-[#ff6080]/40 bg-[#ff6080]/5 p-3 flex flex-col gap-1">
                <span className="font-pixel text-[12px] text-[#4a5a70] flex items-center gap-1"><Star size={14} /> Rarest Owned</span>
                <span className="font-pixel text-[13px] text-[#ff6080] truncate">{data.rarestOwnedItem.name}</span>
                <span className="font-pixel text-[12px] text-[#4a5a70]">{data.rarestOwnedItem.ownerCount} owners</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-3">
              <h4 className="font-pixel text-[12px] uppercase text-[#4a5a70] mb-2">Rarity Distribution</h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={rarityData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#4a5a70" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#4a5a70" }} width={70} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" radius={0}>
                    {rarityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-3">
              <h4 className="font-pixel text-[12px] uppercase text-[#4a5a70] mb-2">Material Drop Rates</h4>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={dropData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
                    {dropData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
                {dropData.map((d) => (
                  <span key={d.name} className="font-pixel text-[12px] text-[#4a5a70] flex items-center gap-1">
                    <span className="w-2 h-2 inline-block" style={{ backgroundColor: d.fill }} />
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
