// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Server size distribution + study hours club funnel
// ============================================================
import { motion } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface SizeData {
  label: string
  count: number
}

interface ClubData {
  label: string
  count: number
}

const SIZE_COLORS = [
  "rgba(0,255,65,0.2)",
  "rgba(0,255,65,0.35)",
  "rgba(0,255,65,0.5)",
  "rgba(0,255,65,0.65)",
  "rgba(0,255,65,0.8)",
]

const SizeTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-green-500/30 px-2 py-1 font-mono text-xs text-green-400">
      {payload[0].name}: {Number(payload[0].value).toLocaleString()} guilds
    </div>
  )
}

export default function Distributions({
  serverSizes,
  studyClub,
}: {
  serverSizes: SizeData[]
  studyClub: ClubData[]
}) {
  const hasSizes = serverSizes && serverSizes.length > 0
  const hasClub = studyClub && studyClub.length > 0

  if (!hasSizes && !hasClub) return null

  const totalServers = serverSizes?.reduce((s, d) => s + d.count, 0) || 0
  const large =
    serverSizes
      ?.filter(
        (s) =>
          s.label.includes("Medium") ||
          s.label.includes("Large") ||
          s.label.includes("Mega")
      )
      .reduce((s, d) => s + d.count, 0) || 0
  const largePct =
    totalServers > 0 ? Math.round((large / totalServers) * 100) : 0

  const clubMax = hasClub ? Math.max(...studyClub.map((c) => c.count)) : 0

  return (
    <section className="space-y-10">
      {hasSizes && (
        <div>
          <h2
            className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
            style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
          >
            {">"}_GUILD SIZE DISTRIBUTION
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-[220px] w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serverSizes}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    strokeWidth={1}
                    stroke="rgba(0,0,0,0.5)"
                  >
                    {serverSizes.map((_: any, i: number) => (
                      <Cell key={i} fill={SIZE_COLORS[i % SIZE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<SizeTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {serverSizes.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3"
                    style={{ backgroundColor: SIZE_COLORS[i % SIZE_COLORS.length] }}
                  />
                  <span className="text-green-500/60">{s.label}:</span>
                  <span className="text-green-400">
                    {s.count.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="text-green-500/40 mt-2">
                {"// "}{largePct}% of guilds have 500+ members
              </div>
            </div>
          </div>
        </div>
      )}

      {hasClub && (
        <div>
          <h2
            className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
            style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
          >
            {">"}_STUDY_HOURS DISTRIBUTION
          </h2>

          <div className="space-y-2 max-w-xl">
            {studyClub.map((tier, i) => {
              const pct = clubMax > 0 ? (tier.count / clubMax) * 100 : 0
              return (
                <motion.div
                  key={tier.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-green-500/60 w-20 text-right">
                      {tier.label}
                    </span>
                    <div className="flex-1 h-5 bg-green-500/5 relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full bg-green-500/40"
                        style={{
                          boxShadow:
                            i === 0
                              ? "0 0 10px rgba(0,255,65,0.3)"
                              : "none",
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-green-400 w-20">
                      {tier.count.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="text-xs font-mono text-green-500/30 mt-3">
            {"// where do YOU fall in the pyramid?"}
          </div>
        </div>
      )}
    </section>
  )
}
