// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Moderation tickets - rebuilt with shared UI components
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader,
  Badge,
  DataTable,
  SearchSelect,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import { Shield, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"
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

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "NOTE", label: "Notes" },
  { value: "WARNING", label: "Warnings" },
  { value: "STUDY_BAN", label: "Study Bans" },
  { value: "MESSAGE_CENSOR", label: "Message Censors" },
  { value: "INVITE_CENSOR", label: "Invite Censors" },
]

const STATE_OPTIONS = [
  { value: "", label: "All States" },
  { value: "OPEN", label: "Open" },
  { value: "EXPIRING", label: "Expiring" },
  { value: "EXPIRED", label: "Expired" },
  { value: "PARDONED", label: "Pardoned" },
]

function getTypeVariant(type: string): "info" | "warning" | "error" | "purple" | "default" {
  switch (type) {
    case "NOTE": return "info"
    case "WARNING": return "warning"
    case "STUDY_BAN": return "error"
    case "MESSAGE_CENSOR":
    case "INVITE_CENSOR": return "purple"
    default: return "default"
  }
}

function getStateVariant(state: string): "success" | "warning" | "info" | "default" {
  switch (state) {
    case "OPEN": return "success"
    case "EXPIRING": return "warning"
    case "EXPIRED": return "default"
    case "PARDONED": return "info"
    default: return "default"
  }
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
    } catch {
      toast.error("Failed to load tickets")
    }
    setLoading(false)
  }, [id, session, filterType, filterState])

  useEffect(() => { fetchTickets() }, [fetchTickets])
  useEffect(() => {
    if (id && session) {
      fetch(`/api/dashboard/servers/${id}`)
        .then((r) => r.json())
        .then((d) => setServerName(d.server?.name || "Server"))
        .catch(() => {})
    }
  }, [id, session])

  const columns = [
    {
      key: "expand",
      label: "",
      className: "w-10",
      render: (row: Ticket) =>
        expandedId === row.id ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        ),
    },
    {
      key: "type",
      label: "Type",
      render: (row: Ticket) => (
        <Badge variant={getTypeVariant(row.type)}>{row.type.replace(/_/g, " ")}</Badge>
      ),
    },
    {
      key: "state",
      label: "State",
      render: (row: Ticket) => (
        <Badge variant={getStateVariant(row.state)}>{row.state}</Badge>
      ),
    },
    {
      key: "targetId",
      label: "Target",
      render: (row: Ticket) => (
        <span className="text-gray-400 font-mono text-xs">...{row.targetId.slice(-4)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row: Ticket) => (
        <span className="text-gray-400 text-sm">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ""}
        </span>
      ),
    },
    {
      key: "auto",
      label: "",
      render: (row: Ticket) =>
        row.auto ? <Badge variant="default">Auto</Badge> : null,
    },
  ]

  return (
    <Layout
      SEO={{
        title: `Moderation - ${serverName} - LionBot`,
        description: "Moderation tickets",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

            <PageHeader
              title="Moderation"
              description="View and manage moderation tickets: notes, warnings, study bans, and censor actions."
            />

            <div className="flex gap-3 mb-6 sm:flex-col sm:max-w-xs">
              <SearchSelect
                options={TYPE_OPTIONS}
                value={filterType}
                onChange={(v) => setFilterType((v as string) ?? "")}
                placeholder="All Types"
                clearable={false}
              />
              <SearchSelect
                options={STATE_OPTIONS}
                value={filterState}
                onChange={(v) => setFilterState((v as string) ?? "")}
                placeholder="All States"
                clearable={false}
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle size={48} strokeWidth={1} className="text-gray-500" />}
                title="No tickets found"
                description="Your server is clean! No moderation tickets match the current filters."
              />
            ) : (
              <>
                <DataTable<Ticket>
                  data={tickets}
                  columns={columns}
                  keyExtractor={(row) => String(row.id)}
                  emptyMessage="No tickets match your filters"
                  onRowClick={(row) =>
                    setExpandedId(expandedId === row.id ? null : row.id)
                  }
                  headerActions={
                    <span className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield size={14} />
                      Click a row to expand details
                    </span>
                  }
                />

                {expandedId != null && (() => {
                  const ticket = tickets.find((t) => t.id === expandedId)
                  if (!ticket) return null
                  return (
                    <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 overflow-hidden">
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getTypeVariant(ticket.type)}>
                            {ticket.type.replace(/_/g, " ")}
                          </Badge>
                          <Badge variant={getStateVariant(ticket.state)}>
                            {ticket.state}
                          </Badge>
                          {ticket.auto && <Badge variant="default">Auto</Badge>}
                          <span className="text-gray-500 text-sm">
                            Ticket #{ticket.id} &middot; Target: ...{ticket.targetId.slice(-4)}
                          </span>
                        </div>
                        {ticket.content && (
                          <div>
                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                              Content
                            </span>
                            <p className="text-white text-sm">{ticket.content}</p>
                          </div>
                        )}
                        {ticket.context && (
                          <div>
                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                              Context
                            </span>
                            <p className="text-gray-300 text-sm">{ticket.context}</p>
                          </div>
                        )}
                        {ticket.addendum && (
                          <div>
                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                              Addendum
                            </span>
                            <p className="text-gray-300 text-sm">{ticket.addendum}</p>
                          </div>
                        )}
                        {ticket.duration != null && (
                          <p className="text-gray-400 text-sm">
                            Duration: {Math.round(ticket.duration / 3600)}h
                          </p>
                        )}
                        {ticket.pardonedReason && (
                          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                            <span className="text-blue-400 text-xs uppercase tracking-wider block mb-1">
                              Pardoned
                            </span>
                            <p className="text-blue-200 text-sm">{ticket.pardonedReason}</p>
                          </div>
                        )}
                        <p className="text-gray-500 text-xs">
                          Moderator: ...{ticket.moderatorId.slice(-4)} &middot;{" "}
                          {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleString()
                            : ""}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Close details
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
