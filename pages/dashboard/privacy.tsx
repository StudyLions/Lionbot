// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-07
// Purpose: GDPR privacy dashboard page. Users can view a
//          summary of their stored data, download a full
//          export, or request account data deletion.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { DashboardShell, PageHeader, toast } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Shield, Download, Trash2, AlertTriangle, CheckCircle,
  XCircle, Clock, Database, FileJson,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Link from "next/link"

interface DataCounts {
  voice_sessions: number
  text_sessions: number
  workout_sessions: number
  tasks: number
  reminders: number
  server_memberships: number
  coin_transactions: number
  gem_transactions: number
  moderation_tickets: number
  has_pet: boolean
  pet_inventory_items: number
  farm_plots: number
}

interface PendingRequest {
  requestId: number
  status: string
  requestedAt: string
  cooloffExpiresAt: string | null
}

export default function PrivacyPage() {
  const { data: session } = useSession()
  const [dataCounts, setDataCounts] = useState<DataCounts | null>(null)
  const [loadingCounts, setLoadingCounts] = useState(true)
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null)
  const [loadingRequest, setLoadingRequest] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportCooldown, setExportCooldown] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [countsRes, requestRes] = await Promise.all([
        fetch("/api/privacy/data-summary"),
        fetch("/api/privacy/deletion-request"),
      ])
      if (countsRes.ok) {
        setDataCounts(await countsRes.json())
      }
      if (requestRes.ok) {
        const data = await requestRes.json()
        setPendingRequest(data.hasPending ? data.request : null)
      }
    } catch {}
    setLoadingCounts(false)
    setLoadingRequest(false)
  }, [])

  useEffect(() => {
    if (session) fetchData()
  }, [session, fetchData])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch("/api/privacy/data-export")
      if (res.status === 429) {
        const data = await res.json()
        setExportCooldown(data.error)
        toast.error(data.error)
        return
      }
      if (!res.ok) {
        toast.error("Export failed. Please try again later.")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const disposition = res.headers.get("content-disposition")
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || "lionbot-data-export.json"
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Your data export has been downloaded.")
      setExportCooldown("You can export again in 24 hours.")
    } catch {
      toast.error("Export failed. Please try again later.")
    } finally {
      setExporting(false)
    }
  }

  const handleSubmitDeletion = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/privacy/deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Deletion request submitted.")
        setPendingRequest({
          requestId: data.requestId,
          status: "PENDING",
          requestedAt: new Date().toISOString(),
          cooloffExpiresAt: data.cooloffExpiresAt,
        })
        setShowConfirm(false)
        setReason("")
      } else {
        toast.error(data.error || "Something went wrong.")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch("/api/privacy/deletion-request", { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        toast.success("Deletion request cancelled.")
        setPendingRequest(null)
      } else {
        toast.error(data.error || "Something went wrong.")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Layout SEO={{ title: "Privacy | LionBot Dashboard", description: "View, export, or request deletion of your personal data stored by LionBot." }}>
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />}>
          <PageHeader
            title="Privacy & Data"
            description="View, export, or request deletion of all personal data we store about you."
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Privacy" },
            ]}
          />

          {/* Data Summary */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database size={20} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">Your Data Summary</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Here is an overview of what data we currently store about your account.
            </p>
            {loadingCounts ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : dataCounts ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <CountCard label="Voice Sessions" value={dataCounts.voice_sessions} />
                <CountCard label="Text Sessions" value={dataCounts.text_sessions} />
                <CountCard label="Workout Sessions" value={dataCounts.workout_sessions} />
                <CountCard label="Tasks" value={dataCounts.tasks} />
                <CountCard label="Reminders" value={dataCounts.reminders} />
                <CountCard label="Server Memberships" value={dataCounts.server_memberships} />
                <CountCard label="Coin Transactions" value={dataCounts.coin_transactions} />
                <CountCard label="Gem Transactions" value={dataCounts.gem_transactions} />
                <CountCard label="Moderation Tickets" value={dataCounts.moderation_tickets} />
                {dataCounts.has_pet && (
                  <>
                    <CountCard label="Pet Inventory" value={dataCounts.pet_inventory_items} />
                    <CountCard label="Farm Plots" value={dataCounts.farm_plots} />
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Could not load data summary.</p>
            )}
          </section>

          {/* Data Export */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileJson size={20} className="text-green-400" />
              <h2 className="text-lg font-semibold text-foreground">Download My Data</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Download a complete copy of all personal data we store about you in JSON format.
              This includes your profile, study sessions, tasks, economy data, pet data, and more.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              You can download your data once every 24 hours. The file may take a moment to generate.
            </p>
            {exportCooldown && (
              <p className="text-sm text-amber-400 mb-3">{exportCooldown}</p>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
            >
              <Download size={16} />
              {exporting ? "Generating export..." : "Download My Data"}
            </button>
          </section>

          {/* Data Deletion */}
          <section className="rounded-2xl border-2 border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 size={20} className="text-red-400" />
              <h2 className="text-lg font-semibold text-foreground">Request Data Deletion</h2>
            </div>

            {/* Warning box */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="text-amber-200 font-medium">Important: Read before requesting deletion</p>
                  <ul className="text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>
                      If you remain in Discord servers where LionBot is active, the bot will <strong className="text-foreground">automatically recreate your data</strong> when
                      it detects your activity (joining voice channels, sending messages, etc.).
                    </li>
                    <li>
                      To ensure your data is not re-collected, you should <strong className="text-foreground">leave all servers that have LionBot</strong> before
                      or after requesting deletion.
                    </li>
                    <li>
                      For a complete removal from all aspects of Discord and LionBot, you may also want to <strong className="text-foreground">delete
                      your Discord account</strong> entirely.
                    </li>
                    <li>
                      There is a <strong className="text-foreground">14-day cooling-off period</strong> during which you can cancel your request.
                      After that, an admin will review and permanently delete your data.
                    </li>
                    <li>
                      Transaction records and moderation tickets will be <strong className="text-foreground">anonymized</strong> (your
                      identity removed) rather than deleted, to preserve server integrity.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {loadingRequest ? (
              <Skeleton className="h-20 rounded-xl" />
            ) : pendingRequest ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-medium">Pending Deletion Request</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Request #{pendingRequest.requestId} submitted on{" "}
                        {new Date(pendingRequest.requestedAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                      {pendingRequest.cooloffExpiresAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Cooling-off period ends on{" "}
                          <span className="text-foreground font-medium">
                            {new Date(pendingRequest.cooloffExpiresAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all active:scale-95"
                >
                  <XCircle size={16} />
                  {cancelling ? "Cancelling..." : "Cancel Deletion Request"}
                </button>
              </div>
            ) : showConfirm ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="deletion-reason" className="block text-sm font-medium text-muted-foreground mb-2">
                    Reason for deletion (optional)
                  </label>
                  <textarea
                    id="deletion-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="You may optionally tell us why you're requesting deletion..."
                    className="w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitDeletion}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
                  >
                    <Trash2 size={16} />
                    {submitting ? "Submitting..." : "Confirm Deletion Request"}
                  </button>
                  <button
                    onClick={() => { setShowConfirm(false); setReason("") }}
                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  By clicking &quot;Confirm&quot;, you acknowledge that after the 14-day cooling-off period,
                  an admin will review and permanently delete all of your data from our systems.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
              >
                <Trash2 size={16} />
                Request Data Deletion
              </button>
            )}
          </section>

          {/* Link to privacy policy */}
          <div className="text-center text-sm text-muted-foreground pb-8">
            Read our full{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            for details on what data we collect, how we use it, and your rights.
          </div>
        </DashboardShell>
      </AdminGuard>
    </Layout>
  )
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-background/50 border border-border/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground mt-1">{value.toLocaleString()}</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
