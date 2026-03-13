// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Moderation ticket viewer with filters
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"

interface Ticket {
  id: number
  targetId: string
  type: string
  state: string
  moderatorId: string
  content: string | null
  context: string | null
  addendum: string | null
  duration: number | null
  auto: boolean
  createdAt: string
  expiry: string | null
  pardonedBy: string | null
  pardonedAt: string | null
  pardonedReason: string | null
}

const typeColors: Record<string, string> = {
  NOTE: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  WARNING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  STUDY_BAN: "bg-red-500/20 text-red-300 border-red-500/30",
  MESSAGE_CENSOR: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  INVITE_CENSOR: "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

const stateColors: Record<string, string> = {
  OPEN: "bg-emerald-500/20 text-emerald-300",
  EXPIRING: "bg-amber-500/20 text-amber-300",
  EXPIRED: "bg-gray-500/20 text-gray-400",
  PARDONED: "bg-blue-500/20 text-blue-300",
}

export default function ModerationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("")
  const [filterState, setFilterState] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [serverName, setServerName] = useState("")

  const fetchTickets = useCallback(async () => {
    if (!id || !session) return
    setLoading(true)
    const params = new URLSearchParams()
    if (filterType) params.set("type", filterType)
    if (filterState) params.set("state", filterState)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/tickets?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setTickets(data.tickets)
    } catch {}
    setLoading(false)
  }, [id, session, filterType, filterState])

  useEffect(() => { fetchTickets() }, [fetchTickets])
  useEffect(() => {
    if (id && session) {
      fetch(`/api/dashboard/servers/${id}`)
        .then(r => r.json())
        .then(d => setServerName(d.server?.name || "Server"))
        .catch(() => {})
    }
  }, [id, session])

  return (
    <Layout SEO={{ title: `Moderation - ${serverName} - LionBot`, description: "Moderation tickets" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

            <div className="flex gap-3 mb-4 sm:flex-col">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Types</option>
                <option value="NOTE">Notes</option>
                <option value="WARNING">Warnings</option>
                <option value="STUDY_BAN">Study Bans</option>
                <option value="MESSAGE_CENSOR">Message Censors</option>
              </select>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All States</option>
                <option value="OPEN">Open</option>
                <option value="EXPIRING">Expiring</option>
                <option value="EXPIRED">Expired</option>
                <option value="PARDONED">Pardoned</option>
              </select>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                  </div>
                ))
              ) : tickets.length === 0 ? (
                <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
                  <span className="text-4xl mb-4 block">🎉</span>
                  <p className="text-gray-400 text-lg">No tickets found. Clean server!</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                  >
                    <div className="p-4 px-5 flex items-center justify-between gap-3 sm:flex-col sm:items-start">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${typeColors[ticket.type] || "bg-gray-600 text-gray-300"}`}>
                          {ticket.type.replace("_", " ")}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${stateColors[ticket.state] || ""}`}>
                          {ticket.state}
                        </span>
                        {ticket.auto && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded-lg text-xs">Auto</span>
                        )}
                        <span className="text-gray-400 text-sm">
                          Target: ...{ticket.targetId.slice(-4)}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    {expandedId === ticket.id && (
                      <div className="px-5 pb-4 border-t border-gray-700 pt-3 space-y-2">
                        {ticket.content && (
                          <div>
                            <span className="text-gray-500 text-xs uppercase">Content</span>
                            <p className="text-white text-sm">{ticket.content}</p>
                          </div>
                        )}
                        {ticket.context && (
                          <div>
                            <span className="text-gray-500 text-xs uppercase">Context</span>
                            <p className="text-gray-300 text-sm">{ticket.context}</p>
                          </div>
                        )}
                        {ticket.duration && (
                          <p className="text-gray-400 text-sm">Duration: {Math.round(ticket.duration / 3600)}h</p>
                        )}
                        {ticket.pardonedReason && (
                          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                            <span className="text-blue-400 text-xs uppercase">Pardoned</span>
                            <p className="text-blue-200 text-sm">{ticket.pardonedReason}</p>
                          </div>
                        )}
                        <p className="text-gray-500 text-xs">
                          Ticket #{ticket.id} &middot; Moderator: ...{ticket.moderatorId.slice(-4)}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
