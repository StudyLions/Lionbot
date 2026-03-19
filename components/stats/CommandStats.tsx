// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Top commands bar chart + monthly trend + speed stats
// ============================================================
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts"

interface Command {
  name: string
  count: number
}

interface TrendPoint {
  month: string
  count: number
}

const CmdTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-green-500/30 px-2 py-1 font-mono text-xs text-green-400">
      /{payload[0].payload.name}: {Number(payload[0].value).toLocaleString()}
    </div>
  )
}

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-green-500/30 px-2 py-1 font-mono text-xs text-green-400">
      {label}: {Number(payload[0].value).toLocaleString()} cmds
    </div>
  )
}

export default function CommandStats({
  topCommands,
  commandTrend,
  totalCommands,
  avgResponseTime,
  commandsPerMinute,
}: {
  topCommands: Command[]
  commandTrend: TrendPoint[]
  totalCommands: number
  avgResponseTime: number
  commandsPerMinute: number
}) {
  if (!topCommands || topCommands.length === 0) return null

  const topPct =
    totalCommands > 0
      ? Math.round((topCommands[0].count / totalCommands) * 100)
      : 0

  return (
    <section className="space-y-8">
      <div>
        <h2
          className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
          style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
        >
          {">"}_COMMAND FREQUENCY ANALYSIS
        </h2>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCommands} layout="vertical" barSize={14}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,255,65,0.06)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                }
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "rgba(0,255,65,0.5)", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
                width={120}
                tickFormatter={(v) => `/${v}`}
              />
              <Tooltip content={<CmdTooltip />} />
              <Bar dataKey="count" fill="#00ff41" fillOpacity={0.5} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 space-y-1 text-xs font-mono text-green-500/40">
          <div>
            {"// "}
            {topPct}% of all commands are /{topCommands[0].name} --
            competition drives engagement
          </div>
          <div>
            {"// avg_response_time: "}
            <span className="text-green-400">{Math.round(avgResponseTime)}ms</span>
          </div>
          <div>
            {"// throughput: "}
            <span className="text-green-400">~{commandsPerMinute} cmds/min</span>
          </div>
        </div>
      </div>

      {commandTrend && commandTrend.length > 0 && (
        <div>
          <h2
            className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
            style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
          >
            {">"}_COMMAND VOLUME [MONTHLY]
          </h2>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={commandTrend}>
                <defs>
                  <linearGradient id="cmdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.06)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#00ffff"
                  strokeWidth={2}
                  fill="url(#cmdGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  )
}
