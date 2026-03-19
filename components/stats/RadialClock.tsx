// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: SVG polar clock face showing when the world studies
// ============================================================
import { useMemo } from "react"

interface HourData {
  hour: number
  avgStudying: number
}

export default function RadialClock({ data }: { data: HourData[] }) {
  const paths = useMemo(() => {
    if (!data || data.length === 0) return []

    const max = Math.max(...data.map((d) => d.avgStudying))
    const cx = 200
    const cy = 200
    const innerR = 40
    const maxR = 170

    return data.map((d) => {
      const angle = ((d.hour - 6) * 15 * Math.PI) / 180
      const ratio = d.avgStudying / max
      const r = innerR + (maxR - innerR) * ratio

      const x1 = cx + innerR * Math.cos(angle)
      const y1 = cy + innerR * Math.sin(angle)
      const x2 = cx + r * Math.cos(angle)
      const y2 = cy + r * Math.sin(angle)

      return {
        hour: d.hour,
        avg: d.avgStudying,
        x1,
        y1,
        x2,
        y2,
        ratio,
        labelX: cx + (maxR + 15) * Math.cos(angle),
        labelY: cy + (maxR + 15) * Math.sin(angle),
      }
    })
  }, [data])

  if (paths.length === 0) return null

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_GLOBAL STUDY CLOCK [UTC]
      </h2>

      <div className="flex justify-center">
        <svg viewBox="0 0 400 400" className="w-full max-w-[400px]">
          {[60, 100, 140, 170].map((r) => (
            <circle
              key={r}
              cx={200}
              cy={200}
              r={r}
              fill="none"
              stroke="rgba(0,255,65,0.06)"
              strokeDasharray="2 4"
            />
          ))}

          {paths.map((p) => (
            <g key={p.hour}>
              <line
                x1={p.x1}
                y1={p.y1}
                x2={p.x2}
                y2={p.y2}
                stroke={`rgba(0,255,65,${0.3 + p.ratio * 0.7})`}
                strokeWidth={8}
                strokeLinecap="round"
                style={{
                  filter:
                    p.ratio > 0.7
                      ? "drop-shadow(0 0 6px rgba(0,255,65,0.5))"
                      : "none",
                }}
              />
              <text
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(0,255,65,0.35)"
                fontSize={9}
                fontFamily="monospace"
              >
                {String(p.hour).padStart(2, "0")}
              </text>
            </g>
          ))}

          <circle cx={200} cy={200} r={38} fill="black" />
          <text
            x={200}
            y={196}
            textAnchor="middle"
            fill="#00ff41"
            fontSize={10}
            fontFamily="monospace"
            opacity={0.6}
          >
            UTC
          </text>
          <text
            x={200}
            y={210}
            textAnchor="middle"
            fill="#00ff41"
            fontSize={8}
            fontFamily="monospace"
            opacity={0.4}
          >
            24H
          </text>
        </svg>
      </div>
    </section>
  )
}
