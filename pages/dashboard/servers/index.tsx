// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server list page - shows all servers the user is in
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: added DashboardNav, EmptyState, toast, error handling, Lucide icons; migrated to SWR; design system color classes
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { EmptyState } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import Link from "next/link"
import { Server } from "lucide-react"
// --- END AI-MODIFIED ---

interface Server {
  guildId: string
  guildName: string
  displayName: string | null
  trackedTimeSeconds: number
  trackedTimeHours: number
  coins: number
  firstJoined: string | null
}

export default function Servers() {
  const { status } = useSession()
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: serversData, error, isLoading: loading } = useDashboard<{ servers: Server[] }>(
    status === "authenticated" ? "/api/dashboard/servers" : null
  )
  const servers = serversData?.servers ?? []
  // --- END AI-MODIFIED ---

  return (
    <Layout SEO={{ title: "My Servers - LionBot Dashboard", description: "Your LionBot servers" }}>
      <AdminGuard>
        {/* --- AI-MODIFIED (2026-03-13) --- */}
        {/* Purpose: fixed layout to match other member dashboard pages (flex gap-8 sidebar) */}
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">My Servers</h1>
              <span className="text-muted-foreground text-sm">{servers.length} servers</span>
            </div>
        {/* --- END AI-MODIFIED --- */}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-card rounded-2xl p-5 h-36 animate-pulse border border-gray-700" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <p className="text-destructive">{error.message}</p>
              </div>
            ) : servers.length === 0 ? (
              <EmptyState
                icon={<Server size={48} strokeWidth={1} />}
                title="No servers found"
                description="Make sure LionBot is in your Discord server and you have some tracked activity."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map(server => (
                  <Link key={server.guildId} href={`/dashboard/servers/${server.guildId}`}>
                    <div className="bg-card rounded-2xl p-5 border border-gray-700 hover:border-indigo-500/50 transition-all cursor-pointer h-full group">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold text-foreground truncate group-hover:text-indigo-300 transition-colors pr-2">
                          {server.guildName}
                        </h3>
                        <span className="text-muted-foreground group-hover:text-primary transition-colors text-lg flex-shrink-0">&rarr;</span>
                      </div>
                      {server.displayName && (
                        <p className="text-muted-foreground text-xs mb-3">as {server.displayName}</p>
                      )}
                      <div className="flex items-center gap-6 mt-auto">
                        <div>
                          <p className="text-muted-foreground text-xs">Study</p>
                          <p className="text-emerald-400 font-bold">{server.trackedTimeHours}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Coins</p>
                          <p className="text-warning font-bold">{server.coins.toLocaleString()}</p>
                        </div>
                        {server.firstJoined && (
                          <div>
                            <p className="text-muted-foreground text-xs">Joined</p>
                            <p className="text-gray-400 text-sm">{new Date(server.firstJoined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
