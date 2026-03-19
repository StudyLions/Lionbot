// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Stats for Nerds - full hacker terminal aesthetic
//          public page with 22 sections of live bot statistics
// ============================================================
import { useState, useCallback, useMemo } from "react"
import Head from "next/head"
import dynamic from "next/dynamic"
import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import BootSequence from "@/components/stats/BootSequence"
import LivePulse from "@/components/stats/LivePulse"
import ShardGrid from "@/components/stats/ShardGrid"
import GrowthChart from "@/components/stats/GrowthChart"
import CalendarHeatmap from "@/components/stats/CalendarHeatmap"
import MilestoneTimeline from "@/components/stats/MilestoneTimeline"
import Records from "@/components/stats/Records"
import RadialClock from "@/components/stats/RadialClock"
import StudyPatterns from "@/components/stats/StudyPatterns"
import CommandStats from "@/components/stats/CommandStats"
import Distributions from "@/components/stats/Distributions"
import FunFacts from "@/components/stats/FunFacts"
import WorldMap from "@/components/stats/WorldMap"

const MatrixRain = dynamic(() => import("@/components/stats/MatrixRain"), {
  ssr: false,
})

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface StatCardProps {
  label: string
  value: number
  comment?: string
}

function StatCard({ label, value, comment }: StatCardProps) {
  return (
    <div
      className="border border-green-500/15 bg-[rgba(0,255,65,0.02)] p-3 sm:p-4"
      style={{ boxShadow: "0 0 12px rgba(0,255,65,0.04)" }}
    >
      <div className="text-[9px] sm:text-[10px] font-mono text-green-500/50 tracking-wider">
        {label}
      </div>
      <div
        className="text-lg sm:text-xl font-mono text-green-400 mt-1 tabular-nums"
        style={{ textShadow: "0 0 12px rgba(0,255,65,0.4)" }}
      >
        {value.toLocaleString()}
      </div>
      {comment && (
        <div className="text-[9px] sm:text-[10px] font-mono text-green-500/30 mt-1.5">
          {"// "}{comment}
        </div>
      )}
    </div>
  )
}

function VoteTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-green-500/30 px-2 py-1 font-mono text-xs text-green-400">
      {label}: {payload[0].value} votes
    </div>
  )
}

function SectionDivider() {
  return <div className="border-t border-green-500/8 my-10 sm:my-14" />
}

function TerminalSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function StatsPage() {
  const [booted, setBooted] = useState(false)
  const onBootComplete = useCallback(() => setBooted(true), [])

  const { data } = useSWR("/api/stats/nerds", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  })

  const loading = !data

  const humanLifetimes = useMemo(() => {
    if (!data?.totals?.totalStudyHours) return 0
    return Math.round(data.totals.totalStudyHours / (80 * 365 * 24))
  }, [data])

  return (
    <>
      <Head>
        <title>Stats for Nerds | StudyLion</title>
        <meta
          name="description"
          content="Live statistics from StudyLion's mainframe. 500M+ database rows, 32 shards, 69K+ servers, 1.3M users. Real-time data, beautifully visualized."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx global>{`
        .stats-page {
          font-family: "JetBrains Mono", "Fira Code", "Cascadia Code",
            Consolas, monospace;
          background: #000;
          color: #00ff41;
          min-height: 100vh;
          position: relative;
        }
        .stats-page::before {
          content: "";
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          );
          pointer-events: none;
          z-index: 40;
        }
        @keyframes crt-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.97; }
        }
        .stats-page {
          animation: crt-flicker 4s ease-in-out infinite;
        }
      `}</style>

      {!booted && <BootSequence onComplete={onBootComplete} />}

      <AnimatePresence>
        {booted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="stats-page"
          >
            <MatrixRain density={25} />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              {/* Hero */}
              <header className="text-center mb-10 sm:mb-14">
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-[0.15em] uppercase"
                  style={{ textShadow: "0 0 30px rgba(0,255,65,0.5)" }}
                >
                  {">"}_STATS FOR NERDS
                </h1>
                {data?.records?.botAge && (
                  <div className="mt-3 text-xs sm:text-sm text-green-500/60 tracking-wider">
                    system_uptime: {data.records.botAge.days}d{" "}
                    {data.records.botAge.hours}h | shards:{" "}
                    {data?.live?.totalShards || 32} | status: OPERATIONAL
                    <span className="inline-block w-2 h-4 bg-green-400/80 ml-1 animate-pulse align-middle" />
                  </div>
                )}
              </header>

              {loading ? (
                <div className="text-center py-20">
                  <div className="text-green-500/60 animate-pulse font-mono">
                    {">"} LOADING DATA...
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* 2-3. Live Pulse + Activity Feed */}
                  <TerminalSection>
                    <LivePulse
                      live={data.live}
                      totalStudyHours={data.totals.totalStudyHours}
                      records={data.records}
                    />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 4. Shard Grid */}
                  <TerminalSection>
                    <ShardGrid shards={data.shards} />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 5. System Metrics */}
                  <TerminalSection>
                    <h2
                      className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
                      style={{
                        textShadow: "0 0 10px rgba(0,255,65,0.3)",
                      }}
                    >
                      {">"}_SYSTEM METRICS
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      <StatCard
                        label="TOTAL_STUDY_HOURS"
                        value={data.totals.totalStudyHours}
                        comment={`${humanLifetimes} human lifetimes`}
                      />
                      <StatCard
                        label="VOICE_SESSIONS"
                        value={data.totals.totalVoiceSessions}
                      />
                      <StatCard
                        label="TEXT_SESSIONS"
                        value={data.totals.totalTextSessions}
                      />
                      <StatCard
                        label="REGISTERED_USERS"
                        value={data.totals.totalUsers}
                        comment="population > Estonia"
                      />
                      <StatCard
                        label="TOTAL_MEMBERS"
                        value={data.totals.totalMembers}
                        comment="a city bigger than Singapore"
                      />
                      <StatCard
                        label="TASKS_CREATED"
                        value={data.totals.totalTasks}
                      />
                      <StatCard
                        label="COMMANDS_EXECUTED"
                        value={data.totals.totalCommands}
                      />
                      <StatCard
                        label="COIN_TRANSACTIONS"
                        value={data.totals.totalCoinTransactions}
                      />
                    </div>
                  </TerminalSection>

                  <SectionDivider />

                  {/* 6. Growth */}
                  <TerminalSection>
                    <GrowthChart data={data.growth} />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 7. Calendar Heatmap */}
                  <TerminalSection>
                    <CalendarHeatmap data={data.calendarHeatmap} />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 8. Milestones */}
                  <TerminalSection>
                    <MilestoneTimeline milestones={data.milestones} />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 9. Records */}
                  <TerminalSection>
                    <Records
                      records={data.records}
                      avgResponseTime={data.avgResponseTime}
                      commandsPerMinute={data.commandsPerMinute}
                    />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 10. Radial Clock */}
                  <TerminalSection>
                    <RadialClock data={data.studyByHour} />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 11. Study Patterns */}
                  <TerminalSection>
                    <StudyPatterns
                      studyByDay={data.studyByDay}
                      studyByHour={data.studyByHour}
                    />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 12. World Map */}
                  <TerminalSection>
                    <WorldMap data={data.timezoneMap} />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 13-14. Commands */}
                  <TerminalSection>
                    <CommandStats
                      topCommands={data.topCommands}
                      commandTrend={data.commandTrend}
                      totalCommands={data.totals.totalCommands}
                      avgResponseTime={data.avgResponseTime}
                      commandsPerMinute={data.commandsPerMinute}
                    />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 15-16. Distributions */}
                  <TerminalSection>
                    <Distributions
                      serverSizes={data.serverSizes}
                      studyClub={data.studyClub}
                    />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 17. Votes */}
                  {data.votesByMonth?.length > 0 && (
                    <>
                      <TerminalSection>
                        <h2
                          className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
                          style={{
                            textShadow: "0 0 10px rgba(0,255,65,0.3)",
                          }}
                        >
                          {">"}_TOPGG VOTE LOG
                        </h2>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.votesByMonth}>
                              <defs>
                                <linearGradient id="voteGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="month"
                                tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
                                axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
                              />
                              <YAxis
                                tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
                                axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
                              />
                              <Tooltip content={<VoteTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="votes"
                                stroke="#00ff41"
                                fill="url(#voteGrad)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-3 text-center">
                          <a
                            href="https://top.gg/bot/889078613817831495/vote"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-1.5 border border-green-500/30 text-xs font-mono text-green-400 hover:bg-green-500/10 transition-colors"
                          >
                            [ VOTE_FOR_STUDYLION {">"} ]
                          </a>
                        </div>
                      </TerminalSection>
                      <SectionDivider />
                    </>
                  )}

                  {/* 18. Retention */}
                  {data.retention && (
                    <>
                      <TerminalSection>
                        <h2
                          className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
                          style={{
                            textShadow: "0 0 10px rgba(0,255,65,0.3)",
                          }}
                        >
                          {">"}_RETENTION ANALYSIS
                        </h2>
                        <div className="flex items-center gap-6 border border-green-500/15 bg-[rgba(0,255,65,0.02)] p-4 sm:p-6 max-w-md">
                          <div className="relative w-20 h-20 shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                              <circle
                                cx={50}
                                cy={50}
                                r={42}
                                fill="none"
                                stroke="rgba(0,255,65,0.1)"
                                strokeWidth={6}
                              />
                              <circle
                                cx={50}
                                cy={50}
                                r={42}
                                fill="none"
                                stroke="#00ff41"
                                strokeWidth={6}
                                strokeDasharray={`${data.retention.rate * 2.64} 264`}
                                strokeLinecap="round"
                                style={{
                                  filter: "drop-shadow(0 0 6px rgba(0,255,65,0.4))",
                                }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-green-400">
                              {data.retention.rate}%
                            </div>
                          </div>
                          <div className="font-mono text-xs space-y-1">
                            <div className="text-green-500/50">
                              RETENTION_RATE
                            </div>
                            <div className="text-green-500/40">
                              joined: {data.retention.totalJoined.toLocaleString()}
                            </div>
                            <div className="text-green-500/40">
                              still_active: {data.retention.stillActive.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </TerminalSection>
                      <SectionDivider />
                    </>
                  )}

                  {/* 19. Top Servers */}
                  {data.topServers?.length > 0 && (
                    <>
                      <TerminalSection>
                        <h2
                          className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
                          style={{
                            textShadow: "0 0 10px rgba(0,255,65,0.3)",
                          }}
                        >
                          {">"}_TOP GUILDS BY STUDY_HOURS
                        </h2>
                        <div className="overflow-x-auto">
                          <table className="w-full font-mono text-xs">
                            <thead>
                              <tr className="text-green-500/50 border-b border-green-500/10">
                                <th className="text-left py-2 px-2 w-12">RANK</th>
                                <th className="text-left py-2 px-2">GUILD_NAME</th>
                                <th className="text-right py-2 px-2">STUDY_HOURS</th>
                                <th className="text-right py-2 px-2">MEMBERS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.topServers.map(
                                (
                                  server: any,
                                  i: number
                                ) => (
                                  <tr
                                    key={i}
                                    className="border-b border-green-500/5 hover:bg-green-500/5 transition-colors"
                                  >
                                    <td className="py-1.5 px-2 text-green-500/40">
                                      <span
                                        className={
                                          i < 3
                                            ? "text-green-400"
                                            : ""
                                        }
                                        style={
                                          i === 0
                                            ? {
                                                textShadow:
                                                  "0 0 8px rgba(255,215,0,0.5)",
                                                color: "#ffd700",
                                              }
                                            : i === 1
                                            ? { color: "#c0c0c0" }
                                            : i === 2
                                            ? { color: "#cd7f32" }
                                            : {}
                                        }
                                      >
                                        #{String(i + 1).padStart(3, "0")}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-2 text-green-400 truncate max-w-[200px]">
                                      {server.name}
                                    </td>
                                    <td className="py-1.5 px-2 text-right text-green-400 tabular-nums">
                                      {server.studyHours.toLocaleString()}h
                                    </td>
                                    <td className="py-1.5 px-2 text-right text-green-500/50 tabular-nums">
                                      {server.memberCount.toLocaleString()}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TerminalSection>
                      <SectionDivider />
                    </>
                  )}

                  {/* 20. Fun Facts */}
                  <TerminalSection>
                    <FunFacts
                      facts={data.funFacts}
                      totalDbRows={data.totals.totalDatabaseRows}
                      dataGrowthRate={data.dataGrowthRate}
                    />
                  </TerminalSection>

                  <SectionDivider />

                  {/* 21. Meta Footer */}
                  <TerminalSection>
                    <div className="border border-green-500/10 bg-[rgba(0,255,65,0.01)] p-4 sm:p-6 font-mono text-[10px] sm:text-xs text-green-500/40 space-y-1">
                      <div>
                        {">"} PAGE_GENERATED_IN:{" "}
                        <span className="text-green-400">
                          {data.generatedIn}ms
                        </span>
                      </div>
                      <div>
                        {">"} ROWS_QUERIED:{" "}
                        <span className="text-green-400">
                          ~{Math.round(
                            data.totals.totalDatabaseRows / 1_000_000
                          )}
                          M
                        </span>
                      </div>
                      <div>
                        {">"} SHARDS_CONTACTED:{" "}
                        <span className="text-green-400">
                          {data.live.totalShards}
                        </span>
                      </div>
                      <div>{">"} CACHE_TTL: 300s</div>
                      <div>
                        {">"} LAST_REFRESH: {data.generatedAt}
                      </div>
                      <div>
                        {">"} BUILT_WITH: Next.js + PostgreSQL +{" "}
                        {data.live.totalShards} Discord shards + an unreasonable
                        amount of data
                      </div>
                      <div>
                        {">"} CONNECTION_STATUS: [ACTIVE]
                        <span className="inline-block w-1.5 h-3 bg-green-400/80 ml-1 animate-pulse align-middle" />
                      </div>
                    </div>
                  </TerminalSection>

                  {/* 22. Pet Teaser */}
                  <div className="mt-10 text-center">
                    <div className="text-xs font-mono text-green-500/30">
                      {">"}_LIONGOTCHI [CLASSIFIED] -- coming soon
                      <span className="inline-block w-1.5 h-3 bg-green-500/30 ml-1 animate-pulse align-middle" />
                    </div>
                  </div>
                </div>
              )}

              <footer className="mt-12 pb-8 text-center">
                <a
                  href="/"
                  className="text-xs font-mono text-green-500/30 hover:text-green-500/60 transition-colors"
                >
                  {"<"} RETURN_TO_MAINFRAME
                </a>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
