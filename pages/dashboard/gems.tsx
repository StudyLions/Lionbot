// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: LionGems/Premium page
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: design system migration - color classes (bg-background, text-foreground, etc.)
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: prominent balance, quick-buy buttons, Premium for Your Server section
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  Badge,
  SectionCard,
  DataTable,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import type { Column } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import Link from "next/link"
import { Gem, Star, CreditCard, Gift } from "lucide-react"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

const QUICK_BUY_PACKS = [
  { gems: 300, label: "300 gems" },
  { gems: 1550, label: "1,550 gems" },
  { gems: 5100, label: "5,100 gems" },
]

interface GemTransaction {
  transactionId: number
  type: string
  amount: number
  userAmount: number
  description: string
  note: string | null
  timestamp: string | null
  fromAccount: string | null
  toAccount: string | null
}

interface GemsData {
  gemBalance: number
  transactions: GemTransaction[]
  premiumGuildIds: string[]
}

const txTypeConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "purple" | "default" }> = {
  PURCHASE: { label: "Purchase", variant: "success" },
  AUTOMATIC: { label: "Stripe", variant: "info" },
  GIFT: { label: "Gift", variant: "purple" },
  ADMIN: { label: "Admin", variant: "warning" },
}

export default function GemsPage() {
  const { data: session } = useSession()
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Removed gem-based server premium purchase (now uses Stripe subscriptions)
  const { data, error, isLoading: loading } = useDashboard<GemsData>(session ? "/api/dashboard/gems" : null)
  // --- END AI-MODIFIED ---

  const transactionColumns: Column<GemTransaction>[] = [
    {
      key: "type",
      label: "Type",
      sortable: false,
      render: (row) => {
        const cfg = txTypeConfig[row.type] || { label: row.type, variant: "default" as const }
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (row) => (
        <span className="text-foreground/80">{row.description || "—"}</span>
      ),
    },
    {
      key: "userAmount",
      label: "Amount",
      sortable: true,
      render: (row) => (
        <span
          className={`font-mono font-medium ${
            row.userAmount >= 0 ? "text-success" : "text-destructive"
          }`}
        >
          {row.userAmount >= 0 ? "+" : ""}
          {row.userAmount}
        </span>
      ),
    },
    {
      key: "timestamp",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground text-xs">
          {row.timestamp
            ? new Date(row.timestamp).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ]

  return (
    <Layout
      SEO={{
        title: "LionGems - LionBot Dashboard",
        description: "Your LionGems balance and premium benefits",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="LionGems"
                description="LionGems are LionBot's premium currency. Use them to unlock custom profile skins and access exclusive cosmetic features."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "LionGems" },
                ]}
              />

              {loading ? (
                <div className="space-y-6">
                  <div className="bg-card rounded-xl p-8 animate-pulse h-32" />
                  <div className="bg-card rounded-xl p-6 animate-pulse h-48" />
                  <div className="bg-card rounded-xl p-6 animate-pulse h-64" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-destructive">{error.message}</p>
                </div>
              ) : (
                <>
                  {/* Prominent gem balance */}
                  <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-amber-600/40 via-amber-700/30 to-amber-900/50 border border-amber-500/40 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15),transparent_50%)]" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-amber-500/25">
                          <Gem size={40} className="text-amber-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-200/90 uppercase tracking-wider mb-1">
                            Your Balance
                          </p>
                          <p className="text-4xl sm:text-5xl font-bold text-amber-50">
                            {(data?.gemBalance ?? 0).toLocaleString()}
                            <span className="text-2xl font-normal text-amber-200/80 ml-2">gems</span>
                          </p>
                        </div>
                      </div>
                      <Link href="/donate">
                        <a className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-amber-500/30 text-amber-100 hover:bg-amber-500/40 border border-amber-400/40 transition-colors shrink-0">
                          <CreditCard size={20} />
                          Get more gems
                        </a>
                      </Link>
                    </div>
                  </div>

                  {/* Quick-buy packs */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold text-foreground mb-3">Quick buy</h3>
                    <div className="flex flex-wrap gap-3">
                      {QUICK_BUY_PACKS.map((pack) => (
                        <Link key={pack.gems} href="/donate">
                          <a className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors">
                            <Gem size={18} className="text-amber-500" />
                            <span className="font-medium text-foreground">{pack.label}</span>
                            <span className="text-sm text-muted-foreground">Buy</span>
                          </a>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Premium Benefits */}
                  <SectionCard
                    title="Premium Benefits"
                    description="What you can do with LionGems"
                    icon={<Star size={18} />}
                    defaultOpen={true}
                  >
                    <ul className="space-y-2 text-sm text-foreground/80">
                      <li className="flex items-center gap-2">
                        <Gift size={16} className="text-amber-500 flex-shrink-0" />
                        Buy custom profile skins from the skin shop
                      </li>
                      <li className="flex items-center gap-2">
                        <Star size={16} className="text-amber-500 flex-shrink-0" />
                        Gift gems to friends and community members
                      </li>
                      <li className="flex items-center gap-2">
                        <Gem size={16} className="text-amber-500 flex-shrink-0" />
                        Unlock exclusive profile card customizations
                      </li>
                    </ul>
                    <Link href="/donate">
                      <a className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-foreground text-sm font-medium rounded-lg transition-colors">
                        <CreditCard size={16} />
                        Purchase gems
                      </a>
                    </Link>
                  </SectionCard>

                  {/* Transaction History */}
                  <SectionCard
                    title="Transaction History"
                    description="Recent gem activity"
                    icon={<CreditCard size={18} />}
                    defaultOpen={true}
                  >
                    {!data?.transactions?.length ? (
                      <EmptyState
                        icon={
                          <Gem size={48} className="text-muted-foreground" strokeWidth={1} />
                        }
                        title="No transactions yet"
                        description="Your gem purchases and activity will appear here."
                        action={{
                          label: "Get Gems",
                          onClick: () => (window.location.href = "/donate"),
                        }}
                      />
                    ) : (
                      <DataTable<GemTransaction>
                        data={data.transactions}
                        columns={transactionColumns}
                        keyExtractor={(row) => String(row.transactionId)}
                        searchable={false}
                        pageSize={10}
                        emptyMessage="No transactions found"
                      />
                    )}
                  </SectionCard>
                </>
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
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
// --- END AI-MODIFIED ---
