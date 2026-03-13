// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: LionGems/Premium page
// ============================================================
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
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Gem, Star, CreditCard, Gift } from "lucide-react"

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
  const [data, setData] = useState<GemsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/gems")
      if (res.ok) {
        setData(await res.json())
      } else {
        toast.error("Failed to load gems data")
      }
    } catch {
      toast.error("Failed to load gems data")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchData()
  }, [session, fetchData])

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
        <span className="text-gray-300">{row.description || "—"}</span>
      ),
    },
    {
      key: "userAmount",
      label: "Amount",
      sortable: true,
      render: (row) => (
        <span
          className={`font-mono font-medium ${
            row.userAmount >= 0 ? "text-emerald-400" : "text-red-400"
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
        <span className="text-gray-400 text-xs">
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
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="LionGems"
                description="LionGems are LionBot's premium currency. Use them to unlock custom profile skins, contribute to server premium, and access exclusive features."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "LionGems" },
                ]}
              />

              {loading ? (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-xl p-8 animate-pulse h-32" />
                  <div className="bg-gray-800 rounded-xl p-6 animate-pulse h-48" />
                  <div className="bg-gray-800 rounded-xl p-6 animate-pulse h-64" />
                </div>
              ) : (
                <>
                  {/* Gem balance card */}
                  <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-600/30 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Gem size={24} className="text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-amber-200/80">
                        Your Balance
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-amber-100">
                      {(data?.gemBalance ?? 0).toLocaleString()}{" "}
                      <span className="text-lg font-normal text-amber-200/70">
                        gems
                      </span>
                    </p>
                    <Link
                      href="/donate"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors"
                    >
                      <CreditCard size={16} />
                      Get more gems
                    </Link>
                  </div>

                  {/* Premium Benefits */}
                  <SectionCard
                    title="Premium Benefits"
                    description="What you can do with LionGems"
                    icon={<Star size={18} />}
                    defaultOpen={true}
                  >
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <Gift size={16} className="text-amber-500 flex-shrink-0" />
                        Buy custom profile skins from the skin shop
                      </li>
                      <li className="flex items-center gap-2">
                        <Star size={16} className="text-amber-500 flex-shrink-0" />
                        Contribute gems to servers for premium features
                      </li>
                      <li className="flex items-center gap-2">
                        <Gem size={16} className="text-amber-500 flex-shrink-0" />
                        Unlock exclusive profile card customizations
                      </li>
                    </ul>
                    <Link
                      href="/donate"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <CreditCard size={16} />
                      Purchase gems
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
                          <Gem size={48} className="text-gray-500" strokeWidth={1} />
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
