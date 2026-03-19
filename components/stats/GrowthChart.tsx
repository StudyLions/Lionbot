// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Growth trajectory area chart with toggle and
//          exam season annotations
// ============================================================
import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts"

interface GrowthPoint {
  date: string
  guilds: number
  users: number
  inVoice: number
  members: number
}

type MetricKey = "guilds" | "users" | "inVoice"

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "guilds", label: "GUILDS" },
  { key: "users", label: "USERS" },
  { key: "inVoice", label: "VOICE" },
]

const EXAM_SEASONS = [
  { date: "2024-12-01", label: "FINALS '24" },
  { date: "2025-05-01", label: "FINALS '25" },
  { date: "2025-12-01", label: "FINALS '25" },
  { date: "2026-01-01", label: "FINALS '26" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-green-500/30 px-3 py-2 font-mono text-xs">
      <div className="text-green-500/60 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-green-400">
          {p.dataKey}: {Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  )
}

export default function GrowthChart({ data }: { data: GrowthPoint[] }) {
  const [metric, setMetric] = useState<MetricKey>("guilds")

  if (!data || data.length === 0) return null

  const formatted = data.map((d) => ({
    ...d,
    label: d.date,
  }))

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_GROWTH TRAJECTORY
      </h2>

      <div className="flex gap-1 mb-4">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-3 py-1 text-xs font-mono border transition-all ${
              metric === m.key
                ? "border-green-500/50 bg-green-500/10 text-green-400"
                : "border-green-500/15 text-green-500/40 hover:text-green-500/60"
            }`}
          >
            [{m.label}]
          </button>
        ))}
      </div>

      <div className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,255,65,0.08)"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "rgba(0,255,65,0.1)" }}
              axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
              tickFormatter={(v) => {
                if (!v) return ""
                const d = new Date(v)
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
              }}
              interval={Math.floor(formatted.length / 8)}
            />
            <YAxis
              tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "rgba(0,255,65,0.1)" }}
              axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
              tickFormatter={(v) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                  ? `${(v / 1000).toFixed(0)}K`
                  : String(v)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            {EXAM_SEASONS.map((es) => (
              <ReferenceLine
                key={es.date}
                x={es.date}
                stroke="#00ffff"
                strokeDasharray="4 4"
                strokeOpacity={0.3}
                label={{
                  value: es.label,
                  fill: "#00ffff",
                  fontSize: 9,
                  fontFamily: "monospace",
                  position: "top",
                  opacity: 0.5,
                }}
              />
            ))}
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#00ff41"
              strokeWidth={2}
              fill="url(#greenGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
