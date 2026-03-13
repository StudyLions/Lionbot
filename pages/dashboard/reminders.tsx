// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Reminders - rebuilt with shared UI
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: design system migration - color classes (bg-background, text-foreground, etc.)
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  Badge,
  ConfirmModal,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { Bell, Plus, Trash2, Clock, Repeat } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

interface Reminder {
  id: number
  title: string | null
  content: string
  remindAt: string
  interval: number | null
  failed: boolean
  createdAt: string | null
}

function formatInterval(seconds: number): string {
  if (seconds >= 86400) return `Every ${Math.floor(seconds / 86400)} day(s)`
  if (seconds >= 3600) return `Every ${Math.floor(seconds / 3600)} hour(s)`
  if (seconds >= 60) return `Every ${Math.floor(seconds / 60)} minute(s)`
  return `Every ${seconds} second(s)`
}

function toLocalDatetimeStr(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RemindersPage() {
  const { data: session } = useSession()
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: remindersData, isLoading: loading, mutate } = useDashboard<{ reminders: Reminder[] }>(
    session ? "/api/dashboard/reminders" : null
  )
  const reminders = remindersData?.reminders || []
  // --- END AI-MODIFIED ---
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    content: "",
    remindAt: "",
    intervalValue: "",
    intervalUnit: "minutes" as "minutes" | "hours",
  })

  const now = new Date()
  const upcoming = reminders.filter((r) => new Date(r.remindAt) > now)
  const past = reminders.filter((r) => new Date(r.remindAt) <= now)

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      remindAt: "",
      intervalValue: "",
      intervalUnit: "minutes",
    })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (r: Reminder) => {
    setEditingId(r.id)
    const val = r.interval
      ? r.interval >= 3600
        ? Math.floor(r.interval / 3600).toString()
        : Math.floor(r.interval / 60).toString()
      : ""
    const unit = r.interval && r.interval >= 3600 ? "hours" : "minutes"
    setForm({
      title: r.title || "",
      content: r.content,
      remindAt: toLocalDatetimeStr(r.remindAt),
      intervalValue: val,
      intervalUnit: unit,
    })
    setShowForm(true)
  }

  const saveReminder = async () => {
    if (!form.content || !form.remindAt) return
    setSaving(true)
    const intervalSeconds = form.intervalValue
      ? parseInt(form.intervalValue) *
        (form.intervalUnit === "minutes" ? 60 : 3600)
      : null
    const body: Record<string, unknown> = {
      title: form.title || null,
      content: form.content,
      remindAt: new Date(form.remindAt).toISOString(),
      interval: intervalSeconds,
    }

    try {
      if (editingId) {
        const res = await fetch("/api/dashboard/reminders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reminderId: editingId, ...body }),
        })
        if (res.ok) {
          toast.success("Reminder updated")
          resetForm()
          mutate()
        } else toast.error("Failed to update")
      } else {
        const res = await fetch("/api/dashboard/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          toast.success("Reminder created")
          resetForm()
          mutate()
        } else toast.error("Failed to create")
      }
    } catch {
      toast.error("Error saving")
    }
    setSaving(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch("/api/dashboard/reminders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId: deleteTarget }),
      })
      if (res.ok) {
        mutate()
        toast.success("Reminder deleted")
        setDeleteTarget(null)
      } else toast.error("Failed to delete")
    } catch {
      toast.error("Error deleting")
    }
    setDeleting(false)
  }

  const ReminderCard = ({
    r,
    isPast,
  }: {
    r: Reminder
    isPast?: boolean
  }) => (
    <div
      className={`bg-card rounded-xl border border-border p-4 group transition-all hover:border-border ${
        isPast ? "opacity-60" : ""
      } ${r.failed ? "border-red-500/30" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {r.title && (
            <h4 className="text-foreground font-medium text-sm mb-1 truncate">
              {r.title}
            </h4>
          )}
          <p className="text-foreground/80 text-sm">{r.content}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={12} />
              {new Date(r.remindAt).toLocaleString()}
            </span>
            {r.interval && (
              <span className="text-xs flex items-center gap-1 text-purple-300">
                <Repeat size={12} />
                {formatInterval(r.interval)}
              </span>
            )}
            {r.failed && (
              <Badge variant="error" size="sm">
                Failed
              </Badge>
            )}
            <Badge variant={isPast ? "default" : "success"} size="sm" dot>
              {isPast ? "Past" : "Upcoming"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startEdit(r)}
            className="text-primary hover:text-primary text-sm px-2 py-1"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteTarget(r.id)}
            className="text-destructive hover:text-destructive/80 text-sm px-2 py-1 flex items-center gap-1"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <Layout
      SEO={{
        title: "Reminders - LionBot Dashboard",
        description: "Manage your reminders",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-3xl">
              <PageHeader
                title="Reminders"
                description="Create and manage reminders. LionBot will DM you when it's time. Recurring reminders repeat at the interval you set."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Reminders" },
                ]}
                actions={
                  <button
                    onClick={() => {
                      resetForm()
                      setShowForm(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-foreground rounded-xl text-sm font-medium transition-all active:scale-95"
                  >
                    <Plus size={18} />
                    New Reminder
                  </button>
                }
              />

              {/* Add/Edit form */}
              {showForm && (
                <div className="bg-card rounded-2xl border border-indigo-500/30 p-5 mb-6">
                  <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
                    <Bell size={18} />
                    {editingId ? "Edit Reminder" : "New Reminder"}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="w-full bg-muted border border-input text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                    />
                    <textarea
                      placeholder="Reminder content *"
                      value={form.content}
                      rows={3}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, content: e.target.value }))
                      }
                      className="w-full bg-muted border border-input text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none resize-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-muted-foreground text-xs block mb-1">
                          Remind at *
                        </label>
                        <input
                          type="datetime-local"
                          value={form.remindAt}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, remindAt: e.target.value }))
                          }
                          className="w-full bg-muted border border-input text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground text-xs block mb-1">
                          Recurring interval (optional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="0"
                            min={1}
                            value={form.intervalValue}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                intervalValue: e.target.value,
                              }))
                            }
                            className="flex-1 bg-muted border border-input text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                          />
                          <select
                            value={form.intervalUnit}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                intervalUnit: e.target
                                  .value as "minutes" | "hours",
                              }))
                            }
                            className="bg-muted border border-input text-foreground rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring outline-none"
                          >
                            <option value="minutes">minutes</option>
                            <option value="hours">hours</option>
                          </select>
                        </div>
                        {form.intervalValue && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Every {form.intervalValue}{" "}
                            {form.intervalUnit === "minutes"
                              ? parseInt(form.intervalValue) === 1
                                ? "minute"
                                : "minutes"
                              : parseInt(form.intervalValue) === 1
                              ? "hour"
                              : "hours"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={saveReminder}
                        disabled={
                          saving || !form.content || !form.remindAt
                        }
                        className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-xl text-sm font-medium transition-all active:scale-95"
                      >
                        {saving ? "Saving..." : editingId ? "Update" : "Create"}
                      </button>
                      <button
                        onClick={resetForm}
                        className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground/80 rounded-xl text-sm font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card rounded-xl p-4 animate-pulse"
                    >
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reminders.length === 0 ? (
                <EmptyState
                  icon={<Bell size={48} strokeWidth={1} className="text-muted-foreground" />}
                  title="No reminders yet"
                  description="Create your first reminder to stay on track!"
                  action={{
                    label: "Create Reminder",
                    onClick: () => {
                      resetForm()
                      setShowForm(true)
                    },
                  }}
                />
              ) : (
                <>
                  {/* Upcoming */}
                  {upcoming.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        Upcoming
                        <Badge variant="success" size="sm">
                          {String(upcoming.length)}
                        </Badge>
                      </h2>
                      <div className="space-y-2">
                        {upcoming.map((r) => (
                          <ReminderCard key={r.id} r={r} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past */}
                  {past.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        Past
                        <Badge variant="default" size="sm">
                          {String(past.length)}
                        </Badge>
                      </h2>
                      <div className="space-y-2">
                        {past.map((r) => (
                          <ReminderCard key={r.id} r={r} isPast />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          open={deleteTarget !== null}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          title="Delete reminder?"
          message="This reminder will be permanently removed. This cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
        />
      </AdminGuard>
    </Layout>
  )
}
