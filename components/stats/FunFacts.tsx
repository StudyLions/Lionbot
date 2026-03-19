// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Fun comparisons grid + live database row counter
// ============================================================
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Globe,
  Users,
  Rocket,
  Database,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react"

interface FunFact {
  text: string
  icon: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
  graduation: <GraduationCap className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  rocket: <Rocket className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  trending: <TrendingUp className="w-5 h-5" />,
  trophy: <Trophy className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
}

function LiveDbCounter({
  totalRows,
  growthRate,
}: {
  totalRows: number
  growthRate: number
}) {
  const [current, setCurrent] = useState(totalRows)
  const startRef = useRef(Date.now())
  const baseRef = useRef(totalRows)

  useEffect(() => {
    baseRef.current = totalRows
    startRef.current = Date.now()
    setCurrent(totalRows)
  }, [totalRows])

  useEffect(() => {
    if (growthRate <= 0) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000
      setCurrent(Math.floor(baseRef.current + elapsed * growthRate))
    }, 100)
    return () => clearInterval(interval)
  }, [growthRate])

  return (
    <div className="border border-green-500/15 bg-[rgba(0,255,65,0.02)] p-4 text-center">
      <div className="text-[10px] font-mono text-green-500/50 tracking-wider mb-1">
        TOTAL_DATABASE_ROWS [LIVE]
      </div>
      <div
        className="text-2xl sm:text-3xl font-mono text-green-400 tabular-nums"
        style={{ textShadow: "0 0 20px rgba(0,255,65,0.4)" }}
      >
        {current.toLocaleString()}
      </div>
      <div className="text-[10px] font-mono text-green-500/30 mt-1">
        {"// growing at ~"}{growthRate.toFixed(1)} rows/second
      </div>
    </div>
  )
}

export default function FunFacts({
  facts,
  totalDbRows,
  dataGrowthRate,
}: {
  facts: FunFact[]
  totalDbRows: number
  dataGrowthRate: number
}) {
  if (!facts || facts.length === 0) return null

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_FUN_FACTS.exe
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {facts.map((fact, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="border border-green-500/10 bg-[rgba(0,255,65,0.015)] p-3 flex gap-3 items-start"
          >
            <span className="text-green-500/40 mt-0.5 shrink-0">
              {ICON_MAP[fact.icon] || <Database className="w-5 h-5" />}
            </span>
            <span className="text-xs font-mono text-green-500/60 leading-relaxed">
              {"// "}{fact.text}
            </span>
          </motion.div>
        ))}
      </div>

      {totalDbRows > 0 && (
        <LiveDbCounter totalRows={totalDbRows} growthRate={dataGrowthRate} />
      )}
    </section>
  )
}
