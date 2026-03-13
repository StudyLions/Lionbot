// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Economy overview - rebuilt with shared UI components
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, Badge, DataTable } from "@/components/dashboard/ui"
import type { Column } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { Coins, TrendingUp, Users, ArrowUpDown } from "lucide-react"

interface EconomyData {
  overview: { totalCoins: number; memberCount: number }
  topHolders: Array<{ userId: string; displayName: string | null; coins: number }>
  recentTransactions: Array<{
    id: number; type: string; actorId: string; amount: number
    fromAccount: string | null; toAccount: string | null; createdAt: string
  }>
  shopItems: Array<{ id: number; type: string; price: number; purchasable: boolean }>
}

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "purple"

const txTypeConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  VOICE_SESSION: { label: "Study", variant: "success" },
  TEXT_SESSION: { label: "Chat", variant: "info" },
  TRANSFER: { label: "Transfer", variant: "purple" },
  TASKS: { label: "Task", variant: "info" },
  SHOP_PURCHASE: { label: "Shop", variant: "warning" },
  ADMIN: { label: "Admin", variant: "warning" },
  REFUND: { label: "Refund", variant: "default" },
  SCHEDULE_BOOK: { label: "Book", variant: "purple" },
  SCHEDULE_REWARD: { label: "Attend", variant: "success" },
  OTHER: { label: "Other", variant: "default" },
}

export default function EconomyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data, error, isLoading: loading } = useDashboard<EconomyData>(
    id && session ? `/api/dashboard/servers/${id}/economy` : null
  )
  const { data: serverData } = useDashboard(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name ?? "Server"
  // --- END AI-MODIFIED ---

  const topHoldersWithRank = data?.topHolders.map((h, i) => ({ ...h, rank: i + 1 })) ?? []

  const topHolderColumns: Column<typeof topHoldersWithRank[0]>[] = [
    { key: "rank", label: "#", sortable: false, render: (row) => (
      <span className={`font-bold w-6 ${
        row.rank === 1 ? "text-amber-400" : row.rank === 2 ? "text-foreground/80" : row.rank === 3 ? "text-amber-700" : "text-muted-foreground"
      }`}>#{row.rank}</span>
    )},
    { key: "displayName", label: "Member", sortable: false, render: (row) => (
      <span className="text-foreground">{row.displayName || `...${row.userId.slice(-4)}`}</span>
    )},
    { key: "coins", label: "Coins", sortable: true, render: (row) => (
      <span className="text-amber-400 font-mono">{(row.coins || 0).toLocaleString()}</span>
    )},
  ]

  const transactionColumns: Column<EconomyData["recentTransactions"][0]>[] = [
    { key: "type", label: "Type", sortable: false, render: (row) => {
      const cfg = txTypeConfig[row.type] || txTypeConfig.OTHER
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>
    }},
    { key: "createdAt", label: "Date", sortable: true, render: (row) => (
      <span className="text-muted-foreground text-xs">
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ""}
      </span>
    )},
    { key: "amount", label: "Amount", sortable: true, render: (row) => (
      <span className={`font-mono font-medium ${row.amount >= 0 ? "text-success" : "text-destructive"}`}>
        {row.amount >= 0 ? "+" : ""}{row.amount}
      </span>
    )},
  ]

  return (
    <Layout SEO={{ title: `Economy - ${serverName} - LionBot`, description: "Server economy" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />
            <div className="flex-1 min-w-0">
            <PageHeader
              title="Economy"
              description="View total coins in circulation, top coin holders, and recent transactions. The economy rewards members for studying, completing tasks, and participating in server activities."
            />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse h-32" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 text-destructive">
                {error.message || "Unable to load economy data"}
              </div>
            ) : !data ? (
              <div className="text-center py-20 text-muted-foreground">Unable to load economy data</div>
            ) : (
              <>
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-card/50 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Coins size={20} className="text-amber-400" />
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Total Coins</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{data.overview.totalCoins.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm mt-1">in circulation</p>
                  </div>
                  <div className="bg-card/50 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={20} className="text-primary" />
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Members</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{data.overview.memberCount.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm mt-1">with economy data</p>
                  </div>
                  <div className="bg-card/50 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp size={20} className="text-success" />
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Shop Items</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{data.shopItems.length}</p>
                    <p className="text-muted-foreground text-sm mt-1">{data.shopItems.filter(s => s.purchasable).length} purchasable</p>
                  </div>
                  <div className="bg-card/50 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ArrowUpDown size={20} className="text-muted-foreground" />
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Transactions</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{data.recentTransactions.length}</p>
                    <p className="text-muted-foreground text-sm mt-1">recent</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top holders */}
                  <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-border">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <TrendingUp size={20} className="text-amber-400" />
                        Top Coin Holders
                      </h3>
                    </div>
                    <div className="p-4">
                      <DataTable
                        data={topHoldersWithRank}
                        columns={topHolderColumns}
                        keyExtractor={(row) => row.userId}
                        emptyMessage="No holders yet"
                        pageSize={10}
                      />
                    </div>
                  </div>

                  {/* Recent transactions */}
                  <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-border">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ArrowUpDown size={20} className="text-muted-foreground" />
                        Recent Transactions
                      </h3>
                    </div>
                    <div className="p-4">
                      <DataTable
                        data={data.recentTransactions}
                        columns={transactionColumns}
                        keyExtractor={(row) => String(row.id)}
                        emptyMessage="No transactions yet"
                        pageSize={10}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
