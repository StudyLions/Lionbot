// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Members list - rebuilt with DataTable and shared UI
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader, DataTable, Badge, toast,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import { Users, Download } from "lucide-react"
import type { Column } from "@/components/dashboard/ui"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

interface Member {
  userId: string
  displayName: string | null
  trackedTimeHours: number
  coins: number
  workoutCount: number
  firstJoined: string | null
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface MembersResponse {
  members: Member[]
  pagination: Pagination
}

export default function MembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [sort, setSort] = useState("tracked_time")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const membersKey =
    id && session
      ? `/api/dashboard/servers/${id}/members?page=${currentPage}&sort=${sort}&order=${order}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      : null
  const { data: membersData, error, isLoading: loading } = useDashboard<MembersResponse>(membersKey)
  const { data: serverData } = useDashboard(id && session ? `/api/dashboard/servers/${id}` : null)

  const members = membersData?.members ?? []
  const pagination = membersData?.pagination ?? null
  const serverName = serverData?.server?.name ?? "Server"

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchInput])
  // --- END AI-MODIFIED ---

  const exportCSV = () => {
    const header = "User ID,Display Name,Study Hours,Coins,Workouts,First Joined\n"
    const rows = members.map(m =>
      `${m.userId},"${(m.displayName || "").replace(/"/g, '""')}",${m.trackedTimeHours},${m.coins},${m.workoutCount},${m.firstJoined || ""}`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `members-${id}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  const columns: Column<Member>[] = [
    {
      key: "displayName",
      label: "Member",
      sortable: true,
      render: (m) => (
        <span className="text-white font-medium">
          {m.displayName || `User ...${m.userId.slice(-4)}`}
        </span>
      ),
    },
    {
      key: "trackedTimeHours",
      label: "Study Time",
      sortable: true,
      render: (m) => <span className="text-success font-mono">{m.trackedTimeHours}h</span>,
    },
    {
      key: "coins",
      label: "Coins",
      sortable: true,
      render: (m) => <span className="text-warning font-mono">{m.coins.toLocaleString()}</span>,
    },
    {
      key: "workoutCount",
      label: "Workouts",
      sortable: true,
      render: (m) => <span className="text-foreground/80 font-mono">{m.workoutCount}</span>,
    },
    {
      key: "firstJoined",
      label: "Joined",
      sortable: true,
      render: (m) => (
        <span className="text-muted-foreground text-sm">
          {m.firstJoined ? new Date(m.firstJoined).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ]

  const headerActions = (
    <div className="flex items-center gap-3 flex-wrap sm:flex-col sm:items-stretch">
      <div className="relative flex-1 min-w-[180px] max-w-xs sm:max-w-none">
        <input
          type="text"
          placeholder="Search members..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground/80 hover:text-white hover:border-border rounded-lg text-sm transition-colors"
      >
        <Download size={16} />
        Export CSV
      </button>
    </div>
  )

  return (
    <Layout SEO={{ title: `Members - ${serverName} - LionBot`, description: "Server members" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />
            <div className="flex-1 min-w-0">
            <PageHeader
              title="Members"
              description="View and search server members. Study time, coins, and workout stats are tracked per member."
              actions={
                pagination && (
                  <Badge variant="info" size="md">
                    {`${pagination.total.toLocaleString()} member${pagination.total !== 1 ? "s" : ""}`}
                  </Badge>
                )
              }
            />

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse h-14" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                {error.message || "Failed to load members"}
              </div>
            ) : (
              <DataTable<Member>
                data={members}
                columns={columns}
                keyExtractor={(m) => m.userId}
                searchable={false}
                pageSize={pagination?.pageSize ?? 25}
                emptyMessage={search ? "No members match your search" : "No members found"}
                headerActions={headerActions}
              />
            )}

            {!loading && pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 bg-card border border-border text-foreground/80 rounded-lg text-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 bg-card border border-border text-foreground/80 rounded-lg text-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
// --- END AI-MODIFIED ---
