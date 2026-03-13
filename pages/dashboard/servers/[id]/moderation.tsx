// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Moderation tickets - rebuilt with shared UI components
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: Phase 2D - add Pardon button with reason dialog
import {
  PageHeader,
  Badge,
  DataTable,
  SearchSelect,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
// --- END AI-MODIFIED ---
import { useDashboard } from "@/hooks/useDashboard"
import { Shield, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"

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

interface TicketsResponse {
  tickets: Ticket[]
}

export default function ModerationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const [filterType, setFilterType] = useState("")
  const [filterState, setFilterState] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const params = new URLSearchParams()
  if (filterType) params.set("type", filterType)
  if (filterState) params.set("state", filterState)
  const ticketsKey =
    id && session ? `/api/dashboard/servers/${id}/tickets?${params}` : null
  const { data: ticketsData, error, isLoading: loading, mutate } = useDashboard<TicketsResponse>(ticketsKey)
  const [pardonTarget, setPardonTarget] = useState<Ticket | null>(null)
  const [pardonReason, setPardonReason] = useState("")
  const [pardoning, setPardoning] = useState(false)
  const { data: serverData } = useDashboard(
    id && session ? `/api/dashboard/servers/${id}` : null
  )

  const tickets = ticketsData?.tickets ?? []
  const serverName = serverData?.server?.name ?? "Server"
  // --- END AI-MODIFIED ---

  const columns = [
    {
      key: "expand",
      label: "",
      className: "w-10",
      render: (row: Ticket) =>
        expandedId === row.id ? (
          <ChevronDown size={16} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
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
        <span className="text-muted-foreground font-mono text-xs">...{row.targetId.slice(-4)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row: Ticket) => (
        <span className="text-muted-foreground text-sm">
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
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />
            <div className="flex-1 min-w-0">
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
                  <div key={i} className="bg-card rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                {error.message || "Failed to load tickets"}
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle size={48} strokeWidth={1} className="text-muted-foreground" />}
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
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield size={14} />
                      Click a row to expand details
                    </span>
                  }
                />

                {expandedId != null && (() => {
                  const ticket = tickets.find((t) => t.id === expandedId)
                  if (!ticket) return null
                  return (
                    <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getTypeVariant(ticket.type)}>
                            {ticket.type.replace(/_/g, " ")}
                          </Badge>
                          <Badge variant={getStateVariant(ticket.state)}>
                            {ticket.state}
                          </Badge>
                          {ticket.auto && <Badge variant="default">Auto</Badge>}
                          <span className="text-muted-foreground text-sm">
                            Ticket #{ticket.id} &middot; Target: ...{ticket.targetId.slice(-4)}
                          </span>
                        </div>
                        {ticket.content && (
                          <div>
                            <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">
                              Content
                            </span>
                            <p className="text-foreground text-sm">{ticket.content}</p>
                          </div>
                        )}
                        {ticket.context && (
                          <div>
                            <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">
                              Context
                            </span>
                            <p className="text-foreground/80 text-sm">{ticket.context}</p>
                          </div>
                        )}
                        {ticket.addendum && (
                          <div>
                            <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">
                              Addendum
                            </span>
                            <p className="text-foreground/80 text-sm">{ticket.addendum}</p>
                          </div>
                        )}
                        {ticket.duration != null && (
                          <p className="text-muted-foreground text-sm">
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
                        {ticket.state !== "PARDONED" && (
                          <button
                            type="button"
                            onClick={() => {
                              setPardonTarget(ticket)
                              setPardonReason("")
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            Pardon
                          </button>
                        )}
                        <p className="text-muted-foreground text-xs">
                          Moderator: ...{ticket.moderatorId.slice(-4)} &middot;{" "}
                          {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleString()
                            : ""}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
        </div>

        <Dialog open={!!pardonTarget} onOpenChange={(open) => !open && setPardonTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pardon ticket</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will mark the ticket as pardoned. Optionally provide a reason.
            </p>
            <textarea
              value={pardonReason}
              onChange={(e) => setPardonReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <DialogFooter>
              <button
                type="button"
                onClick={() => setPardonTarget(null)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!pardonTarget || !id) return
                  setPardoning(true)
                  try {
                    const res = await fetch(`/api/dashboard/servers/${id}/tickets`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ticketId: pardonTarget.id, reason: pardonReason }),
                    })
                    if (res.ok) {
                      toast.success("Ticket pardoned")
                      setPardonTarget(null)
                      mutate()
                    } else {
                      const err = await res.json()
                      toast.error(err.error || "Failed to pardon")
                    }
                  } catch {
                    toast.error("Failed to pardon")
                  }
                  setPardoning(false)
                }}
                disabled={pardoning}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                {pardoning ? "Pardoning..." : "Pardon"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminGuard>
    </Layout>
  )
}
