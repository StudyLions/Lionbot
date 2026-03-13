// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Reminders page with upcoming/past split and CRUD
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

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
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d`
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h`
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m`
  return `${seconds}s`
}

function toLocalDatetimeStr(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RemindersPage() {
  const { data: session } = useSession()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: "", content: "", remindAt: "", intervalMinutes: "" })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/reminders")
      if (res.ok) setReminders((await res.json()).reminders || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { if (session) fetchData() }, [session, fetchData])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const now = new Date()
  const upcoming = reminders.filter(r => new Date(r.remindAt) > now)
  const past = reminders.filter(r => new Date(r.remindAt) <= now)

  const resetForm = () => {
    setForm({ title: "", content: "", remindAt: "", intervalMinutes: "" })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (r: Reminder) => {
    setEditingId(r.id)
    setForm({
      title: r.title || "",
      content: r.content,
      remindAt: toLocalDatetimeStr(r.remindAt),
      intervalMinutes: r.interval ? (r.interval / 60).toString() : "",
    })
    setShowForm(true)
  }

  const saveReminder = async () => {
    if (!form.content || !form.remindAt) return
    setSaving(true)
    const body: any = {
      title: form.title || null,
      content: form.content,
      remindAt: new Date(form.remindAt).toISOString(),
      interval: form.intervalMinutes ? parseInt(form.intervalMinutes) * 60 : null,
    }

    try {
      if (editingId) {
        const res = await fetch("/api/dashboard/reminders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reminderId: editingId, ...body }),
        })
        if (res.ok) { showToast("Reminder updated"); resetForm(); fetchData() }
        else showToast("Failed to update")
      } else {
        const res = await fetch("/api/dashboard/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (res.ok) { showToast("Reminder created"); resetForm(); fetchData() }
        else showToast("Failed to create")
      }
    } catch { showToast("Error saving") }
    setSaving(false)
  }

  const deleteReminder = async (id: number) => {
    if (!confirm("Delete this reminder?")) return
    try {
      const res = await fetch("/api/dashboard/reminders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId: id }),
      })
      if (res.ok) { setReminders(prev => prev.filter(r => r.id !== id)); showToast("Deleted") }
    } catch { showToast("Error deleting") }
  }

  const ReminderCard = ({ r, isPast }: { r: Reminder; isPast?: boolean }) => (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-4 group transition-all hover:border-gray-600 ${
      isPast ? "opacity-60" : ""
    } ${r.failed ? "border-red-500/30" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {r.title && <h4 className="text-white font-medium text-sm mb-1 truncate">{r.title}</h4>}
          <p className="text-gray-300 text-sm">{r.content}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">
              {new Date(r.remindAt).toLocaleString()}
            </span>
            {r.interval && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                Repeats every {formatInterval(r.interval)}
              </span>
            )}
            {r.failed && (
              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">Failed</span>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => startEdit(r)} className="text-indigo-400 hover:text-indigo-300 text-sm px-2 py-1">Edit</button>
          <button onClick={() => deleteReminder(r.id)} className="text-red-400 hover:text-red-300 text-sm px-2 py-1">Delete</button>
        </div>
      </div>
    </div>
  )

  return (
    <Layout SEO={{ title: "Reminders - LionBot Dashboard", description: "Manage your reminders" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard">
                    <span className="text-gray-400 hover:text-white cursor-pointer text-sm">&larr; Dashboard</span>
                  </Link>
                  <h1 className="text-2xl font-bold text-white">My Reminders</h1>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true) }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                  + New Reminder
                </button>
              </div>

              {/* Add/Edit form */}
              {showForm && (
                <div className="bg-gray-800 rounded-2xl border border-indigo-500/30 p-5 mb-6">
                  <h3 className="text-white font-medium mb-4">{editingId ? "Edit Reminder" : "New Reminder"}</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Title (optional)" value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                    <textarea placeholder="Reminder content *" value={form.content} rows={3}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Remind at *</label>
                        <input type="datetime-local" value={form.remindAt}
                          onChange={e => setForm(f => ({ ...f, remindAt: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Repeat interval (minutes, 0 = none)</label>
                        <input type="number" placeholder="0" value={form.intervalMinutes}
                          onChange={e => setForm(f => ({ ...f, intervalMinutes: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={saveReminder} disabled={saving || !form.content || !form.remindAt}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                        {saving ? "Saving..." : editingId ? "Update" : "Create"}
                      </button>
                      <button onClick={resetForm}
                        className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse"><div className="h-4 bg-gray-700 rounded w-3/4" /></div>)}
                </div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
                  <span className="text-5xl mb-4 block">⏰</span>
                  <p className="text-gray-400 text-lg mb-2">No reminders yet</p>
                  <p className="text-gray-500 text-sm">Create your first reminder to stay on track!</p>
                </div>
              ) : (
                <>
                  {/* Upcoming */}
                  {upcoming.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <span className="text-emerald-400">●</span> Upcoming ({upcoming.length})
                      </h2>
                      <div className="space-y-2">
                        {upcoming.map(r => <ReminderCard key={r.id} r={r} />)}
                      </div>
                    </div>
                  )}

                  {/* Past */}
                  {past.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <span className="text-gray-500">●</span> Past ({past.length})
                      </h2>
                      <div className="space-y-2">
                        {past.map(r => <ReminderCard key={r.id} r={r} isPast />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-xl border border-gray-700 text-sm z-50 animate-pulse">
            {toast}
          </div>
        )}
      </AdminGuard>
    </Layout>
  )
}
