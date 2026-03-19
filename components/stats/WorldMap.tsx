// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: SVG world map with glowing dots for timezone distribution
// ============================================================
import { useMemo, useState } from "react"

interface TzData {
  timezone: string
  count: number
}

const TZ_COORDS: Record<string, [number, number]> = {
  "Asia/Kolkata": [78, 21], "Asia/Calcutta": [78, 21],
  "Brazil/East": [-47, -15], "America/Sao_Paulo": [-47, -23],
  "Asia/Manila": [121, 14], "Asia/Singapore": [104, 1],
  "Japan": [140, 36], "Asia/Tokyo": [140, 36],
  "America/New_York": [-74, 41], "US/Eastern": [-74, 41],
  "Europe/Berlin": [13, 52], "Europe/London": [0, 51],
  "CST6CDT": [-90, 32], "US/Central": [-90, 32],
  "Asia/Bangkok": [100, 14], "Asia/Jakarta": [107, -6],
  "PST8PDT": [-118, 34], "US/Pacific": [-118, 34],
  "Europe/Paris": [2, 49], "Europe/Madrid": [-4, 40],
  "EST5EDT": [-74, 41], "EST": [-74, 41],
  "America/Argentina/Buenos_Aires": [-58, -34],
  "America/Chicago": [-88, 42],
  "America/Los_Angeles": [-118, 34],
  "Asia/Seoul": [127, 37], "Asia/Shanghai": [121, 31],
  "Australia/Sydney": [151, -34],
  "Europe/Moscow": [37, 56], "Europe/Rome": [12, 42],
  "Africa/Cairo": [31, 30], "Africa/Lagos": [3, 6],
  "Etc/GMT-8": [120, 10], "Etc/GMT+5": [-75, 20],
  "Asia/Dhaka": [90, 24], "Asia/Karachi": [67, 25],
  "America/Mexico_City": [-99, 19],
  "Europe/Istanbul": [29, 41], "Europe/Warsaw": [21, 52],
  "Asia/Kuala_Lumpur": [102, 3], "Asia/Ho_Chi_Minh": [107, 11],
}

function lonToX(lon: number): number {
  return ((lon + 180) / 360) * 800
}

function latToY(lat: number): number {
  return ((90 - lat) / 180) * 400
}

export default function WorldMap({ data }: { data: TzData[] }) {
  const [hovered, setHovered] = useState<TzData | null>(null)

  const dots = useMemo(() => {
    if (!data || data.length === 0) return []

    const max = Math.max(...data.map((d) => d.count))

    return data
      .map((d) => {
        const coords = TZ_COORDS[d.timezone]
        if (!coords) return null
        const [lon, lat] = coords
        return {
          x: lonToX(lon),
          y: latToY(lat),
          r: 3 + (d.count / max) * 10,
          opacity: 0.3 + (d.count / max) * 0.7,
          tz: d.timezone,
          count: d.count,
        }
      })
      .filter(Boolean) as Array<{
      x: number
      y: number
      r: number
      opacity: number
      tz: string
      count: number
    }>
  }, [data])

  if (dots.length === 0) return null

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_GLOBAL DISTRIBUTION
      </h2>

      <div className="relative overflow-hidden">
        <svg viewBox="0 0 800 400" className="w-full" style={{ maxHeight: 350 }}>
          <rect width={800} height={400} fill="transparent" />
          <line x1={0} y1={200} x2={800} y2={200} stroke="rgba(0,255,65,0.05)" />
          <line x1={400} y1={0} x2={400} y2={400} stroke="rgba(0,255,65,0.05)" />
          {[100, 300].map((y) => (
            <line key={y} x1={0} y1={y} x2={800} y2={y} stroke="rgba(0,255,65,0.03)" strokeDasharray="4 8" />
          ))}
          {[200, 600].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={400} stroke="rgba(0,255,65,0.03)" strokeDasharray="4 8" />
          ))}

          {dots.map((dot) => (
            <g
              key={dot.tz}
              onMouseEnter={() =>
                setHovered({ timezone: dot.tz, count: dot.count })
              }
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              <circle
                cx={dot.x}
                cy={dot.y}
                r={dot.r * 2}
                fill={`rgba(0,255,65,${dot.opacity * 0.15})`}
              />
              <circle
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
                fill={`rgba(0,255,65,${dot.opacity})`}
                style={{
                  filter: `drop-shadow(0 0 ${dot.r}px rgba(0,255,65,${dot.opacity * 0.5}))`,
                }}
              />
            </g>
          ))}
        </svg>

        {hovered && (
          <div className="absolute top-2 right-2 bg-black border border-green-500/30 px-2 py-1 font-mono text-xs text-green-400">
            {hovered.timezone}: {hovered.count} users
          </div>
        )}
      </div>
    </section>
  )
}
