// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Member management page with searchable table
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"

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
  const [sort, setSort] = useState("tracked_time")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [serverName, setServerName] = useState("")

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
    } catch {}
    setLoading(false)
  }, [id, session, sort, order, search])

  useEffect(() => { fetchMembers() }, [fetchMembers])
  useEffect(() => {
    if (id && session) {
      fetch(`/api/dashboard/servers/${id}`)
        .then(r => r.json())
        .then(d => setServerName(d.server?.name || "Server"))
        .catch(() => {})
    }
  }, [id, session])

  const toggleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === "desc" ? "asc" : "desc")
    } else {
      setSort(field)
      setOrder("desc")
    }
  }

  const sortIcon = (field: string) => {
    if (sort !== field) return "↕"
    return order === "desc" ? "↓" : "↑"
  }

  const exportCSV = () => {
    const header = "User ID,Display Name,Study Hours,Coins,Workouts,First Joined\n"
    const rows = members.map(m =>
      `${m.userId},"${m.displayName || ""}",${m.trackedTimeHours},${m.coins},${m.workoutCount},${m.firstJoined || ""}`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `members-${id}.csv`
    a.click()
  }

  return (
    <Layout SEO={{ title: `Members - ${serverName} - LionBot`, description: "Server members" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

            <div className="flex items-center gap-3 mb-4 sm:flex-col sm:items-stretch">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <span className="absolute left-3 top-3 text-gray-500">🔍</span>
              </div>
              <button
                onClick={exportCSV}
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm transition-colors"
              >
                Export CSV
              </button>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {[
                        { key: "display_name", label: "Member" },
                        { key: "tracked_time", label: "Study Time" },
                        { key: "coins", label: "Coins" },
                        { key: "workout_count", label: "Workouts" },
                        { key: "first_joined", label: "Joined" },
                      ].map(col => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key)}
                          className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-400 cursor-pointer hover:text-white transition-colors select-none"
                        >
                          {col.label} <span className="text-gray-600">{sortIcon(col.key)}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-700/50">
                          <td colSpan={5} className="px-4 py-3">
                            <div className="h-4 bg-gray-700 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          {search ? "No members match your search" : "No members found"}
                        </td>
                      </tr>
                    ) : (
                      members.map((m, i) => (
                        <tr
                          key={m.userId}
                          className={`border-b border-gray-700/50 hover:bg-gray-750 transition-colors ${
                            i % 2 === 0 ? "bg-gray-800" : "bg-gray-800/50"
                          }`}
                        >
                          <td className="px-4 py-3 text-white font-medium">
                            {m.displayName || `User ...${m.userId.slice(-4)}`}
                          </td>
                          <td className="px-4 py-3 text-emerald-400 font-mono">{m.trackedTimeHours}h</td>
                          <td className="px-4 py-3 text-amber-400 font-mono">{m.coins.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-300 font-mono">{m.workoutCount}</td>
                          <td className="px-4 py-3 text-gray-400 text-sm">
                            {m.firstJoined ? new Date(m.firstJoined).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">
                    {pagination.total} members total
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchMembers(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1.5 text-gray-400 text-sm">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchMembers(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-30"
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
