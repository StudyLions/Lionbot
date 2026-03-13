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
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback, useRef } from "react"
import { Users, Download } from "lucide-react"
import type { Column } from "@/components/dashboard/ui"

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

export default function MembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [members, setMembers] = useState<Member[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [sort, setSort] = useState("tracked_time")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [serverName, setServerName] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchMembers = useCallback(async (page = 1) => {
    if (!id || !session) return
    setLoading(true)
    const params = new URLSearchParams({
      page: page.toString(),
      sort,
      order,
      ...(search ? { search } : {}),
    })
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/members?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setMembers(data.members)
      setPagination(data.pagination)
    } catch {
      toast.error("Failed to load members")
    }
    setLoading(false)
  }, [id, session, sort, order, search])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchInput])

  useEffect(() => {
    if (id && session) {
      fetch(`/api/dashboard/servers/${id}`)
        .then(r => r.json())
        .then(d => setServerName(d.server?.name || "Server"))
        .catch(() => {})
    }
  }, [id, session])

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
      render: (m) => <span className="text-emerald-400 font-mono">{m.trackedTimeHours}h</span>,
    },
    {
      key: "coins",
      label: "Coins",
      sortable: true,
      render: (m) => <span className="text-amber-400 font-mono">{m.coins.toLocaleString()}</span>,
    },
    {
      key: "workoutCount",
      label: "Workouts",
      sortable: true,
      render: (m) => <span className="text-gray-300 font-mono">{m.workoutCount}</span>,
    },
    {
      key: "firstJoined",
      label: "Joined",
      sortable: true,
      render: (m) => (
        <span className="text-gray-400 text-sm">
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
          className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-lg text-sm transition-colors"
      >
        <Download size={16} />
        Export CSV
      </button>
    </div>
  )

  return (
    <Layout SEO={{ title: `Members - ${serverName} - LionBot`, description: "Server members" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

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
                  <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse h-14" />
                ))}
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
              <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchMembers(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchMembers(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
