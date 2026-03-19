// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: 4x8 shard cluster grid with sequential boot animation
// ============================================================
import { motion } from "framer-motion"
import { useState } from "react"

interface Shard {
  shardId: number
  name: string
  guildCount: number
  lastLogin: string | null
  online: boolean
}

function formatUptime(lastLogin: string | null): string {
  if (!lastLogin) return "unknown"
  const diff = Date.now() - new Date(lastLogin).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return `${days}d ${hours}h`
}

export default function ShardGrid({ shards }: { shards: Shard[] }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  if (!shards || shards.length === 0) return null

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_SHARD CLUSTER MAP
      </h2>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
        {shards.map((shard, i) => (
          <motion.div
            key={shard.shardId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            onMouseEnter={() => setHoveredId(shard.shardId)}
            onMouseLeave={() => setHoveredId(null)}
            className={`relative p-2 text-center cursor-default transition-all duration-300 ${
              shard.online
                ? "border border-green-500/20 bg-[rgba(0,255,65,0.03)]"
                : "border border-red-500/20 bg-[rgba(255,0,64,0.03)]"
            }`}
            style={{
              boxShadow: shard.online
                ? "0 0 10px rgba(0,255,65,0.08)"
                : "0 0 10px rgba(255,0,64,0.08)",
            }}
          >
            {shard.online && (
              <motion.div
                className="absolute inset-0 border border-green-500/10"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <div
              className={`text-[9px] font-mono tracking-wider ${
                shard.online ? "text-green-500/60" : "text-red-500/60"
              }`}
            >
              SHARD_{String(shard.shardId).padStart(2, "0")}
            </div>
            <div
              className={`text-xs font-mono mt-0.5 ${
                shard.online ? "text-green-400" : "text-red-400"
              }`}
              style={
                shard.online
                  ? { textShadow: "0 0 8px rgba(0,255,65,0.4)" }
                  : {}
              }
            >
              {shard.guildCount.toLocaleString()}
            </div>
            {!shard.online && (
              <div className="text-[8px] text-red-500/80 font-mono mt-0.5">
                [OFFLINE]
              </div>
            )}

            {hoveredId === shard.shardId && (
              <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-green-500/30 text-[9px] font-mono text-green-400 whitespace-nowrap">
                {shard.name}
                <br />
                guilds: {shard.guildCount.toLocaleString()}
                <br />
                uptime: {formatUptime(shard.lastLogin)}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
