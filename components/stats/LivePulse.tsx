// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Live system status with odometer counters, ticking
//          cumulative study time, and terminal log feed
// ============================================================
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface LiveData {
  studyingNow: number
  activeTimers: number
  shardsOnline: number
  totalShards: number
  totalServers: number
}

interface Records {
  quietestMoment?: { value: number; date: string } | null
}

function OdometerDigit({ digit }: { digit: string }) {
  return (
    <span className="inline-block overflow-hidden h-[1.2em] relative">
      <motion.span
        key={digit}
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="block"
      >
        {digit}
      </motion.span>
    </span>
  )
}

function OdometerNumber({ value }: { value: number }) {
  const formatted = value.toLocaleString()
  return (
    <span className="inline-flex font-mono tabular-nums">
      {formatted.split("").map((char, i) => (
        <OdometerDigit key={`${i}-${char}`} digit={char} />
      ))}
    </span>
  )
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2 mr-2">
      {active && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${
          active ? "bg-green-400" : "bg-red-500"
        }`}
      />
    </span>
  )
}

function CumulativeTimer({
  totalStudyHours,
  studyingNow,
}: {
  totalStudyHours: number
  studyingNow: number
}) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
    setElapsed(0)
  }, [totalStudyHours])

  useEffect(() => {
    const interval = setInterval(() => {
      const secondsSinceLoad = (Date.now() - startRef.current) / 1000
      const additionalHours = (studyingNow * secondsSinceLoad) / 3600
      setElapsed(additionalHours)
    }, 1000)
    return () => clearInterval(interval)
  }, [studyingNow])

  const totalHours = totalStudyHours + elapsed
  const totalSeconds = Math.floor(totalHours * 3600)
  const years = Math.floor(totalSeconds / (365 * 24 * 3600))
  const remaining = totalSeconds - years * 365 * 24 * 3600
  const months = Math.floor(remaining / (30 * 24 * 3600))
  const rem2 = remaining - months * 30 * 24 * 3600
  const days = Math.floor(rem2 / (24 * 3600))
  const rem3 = rem2 - days * 24 * 3600
  const hours = Math.floor(rem3 / 3600)
  const mins = Math.floor((rem3 % 3600) / 60)
  const secs = Math.floor(rem3 % 60)

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="text-center mt-6">
      <div className="text-xs text-green-500/60 tracking-widest uppercase mb-1">
        cumulative_study_time
      </div>
      <div
        className="text-2xl sm:text-3xl font-mono text-green-400 tracking-wider"
        style={{ textShadow: "0 0 20px rgba(0,255,65,0.4)" }}
      >
        {years}y {months}m {days}d {pad(hours)}:{pad(mins)}:{pad(secs)}
      </div>
    </div>
  )
}

const LOG_TEMPLATES = [
  (t: string) => `[${t}] SESSION_START user_██████ joined voice`,
  (t: string) => `[${t}] SESSION_END duration=2h14m reward=134coins`,
  (t: string) => `[${t}] CMD_EXEC /leaderboard latency=45ms`,
  (t: string) => `[${t}] CMD_EXEC /profile latency=32ms`,
  (t: string) => `[${t}] CMD_EXEC /stats latency=28ms`,
  (t: string) => `[${t}] SESSION_START user_██████ joined voice`,
  (t: string) => `[${t}] GUILD_JOIN shard_17 guild_count=2288`,
  (t: string) => `[${t}] SESSION_END duration=45m reward=38coins`,
  (t: string) => `[${t}] CMD_EXEC /tasklist latency=51ms`,
  (t: string) => `[${t}] SESSION_START user_██████ joined voice`,
]

function ActivityFeed() {
  const [logs, setLogs] = useState<string[]>([])
  const indexRef = useRef(0)

  useEffect(() => {
    const addLog = () => {
      const now = new Date()
      const t = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      const template = LOG_TEMPLATES[indexRef.current % LOG_TEMPLATES.length]
      indexRef.current++
      setLogs((prev) => [...prev.slice(-40), template(t)])
    }
    addLog()
    const interval = setInterval(addLog, 2000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="overflow-hidden whitespace-nowrap border border-green-500/10 bg-black/50 py-1.5 px-3">
      <motion.div
        className="inline-flex gap-8 text-xs font-mono text-green-500/70"
        animate={{ x: [0, -2000] }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {logs.map((log, i) => (
          <span key={i}>{log}</span>
        ))}
        {logs.map((log, i) => (
          <span key={`dup-${i}`}>{log}</span>
        ))}
      </motion.div>
    </div>
  )
}

export default function LivePulse({
  live,
  totalStudyHours,
  records,
}: {
  live: LiveData
  totalStudyHours: number
  records: Records
}) {
  const stats = [
    {
      label: "USERS_IN_VOICE",
      value: live.studyingNow,
      status: "ACTIVE",
    },
    {
      label: "ACTIVE_TIMERS",
      value: live.activeTimers,
      status: "ACTIVE",
    },
    {
      label: "CONNECTED_GUILDS",
      value: live.totalServers,
      status: "ACTIVE",
    },
    {
      label: "SHARDS_ONLINE",
      value: live.shardsOnline,
      suffix: `/${live.totalShards}`,
      status:
        live.shardsOnline === live.totalShards
          ? "ALL_SYSTEMS_GO"
          : "DEGRADED",
    },
  ]

  return (
    <section>
      <ActivityFeed />

      <div className="mt-6">
        <h2
          className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
          style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
        >
          {">"}_LIVE SYSTEMS STATUS
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border border-green-500/15 bg-[rgba(0,255,65,0.02)] p-3 sm:p-4"
              style={{
                boxShadow:
                  "0 0 15px rgba(0,255,65,0.05), inset 0 0 15px rgba(0,255,65,0.02)",
              }}
            >
              <div className="text-[10px] text-green-500/50 tracking-wider font-mono mb-2">
                {s.label}
              </div>
              <div
                className="text-xl sm:text-2xl font-mono text-green-400"
                style={{ textShadow: "0 0 15px rgba(0,255,65,0.5)" }}
              >
                <OdometerNumber value={s.value} />
                {s.suffix && (
                  <span className="text-green-500/60">{s.suffix}</span>
                )}
              </div>
              <div className="flex items-center mt-2 text-[10px] font-mono">
                <StatusDot
                  active={s.status === "ACTIVE" || s.status === "ALL_SYSTEMS_GO"}
                />
                <span
                  className={
                    s.status === "DEGRADED"
                      ? "text-red-400"
                      : "text-green-500/60"
                  }
                >
                  [{s.status}]
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <CumulativeTimer
          totalStudyHours={totalStudyHours}
          studyingNow={live.studyingNow}
        />

        {records?.quietestMoment && (
          <div className="text-xs font-mono text-green-500/40 mt-3 text-center">
            {"// min_concurrent_ever: "}
            {records.quietestMoment.value.toLocaleString()} (
            {records.quietestMoment.date.split("T")[0]}) -- studylion never
            sleeps
          </div>
        )}
      </div>
    </section>
  )
}
