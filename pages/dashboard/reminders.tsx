// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Reminders dashboard - full redesign with timeline, calendar, countdowns
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full rewrite - timeline groups, mini calendar, live countdowns, quick presets, search/filter, X/25 counter
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  Badge,
  ConfirmModal,
  EmptyState,
  toast,
  DashboardShell,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import TabBar from "@/components/dashboard/ui/TabBar"
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  Repeat,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Pencil,
  RotateCcw,
  X,
  Zap,
  Timer,
  MoreVertical,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface Reminder {
  id: number
  title: string | null
  content: string
  remindAt: string
  interval: number | null
  failed: boolean
  createdAt: string | null
}

interface RemindersResponse {
  reminders: Reminder[]
  totalCount: number
}

type FilterType = "all" | "one-time" | "recurring" | "failed"

const MAX_REMINDERS = 25
const MAX_CONTENT = 2000
const MIN_INTERVAL_SECONDS = 600

function formatInterval(seconds: number): string {
  if (seconds >= 86400) {
    const d = Math.floor(seconds / 86400)
    return `Every ${d} ${d === 1 ? "day" : "days"}`
  }
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600)
    return `Every ${h} ${h === 1 ? "hour" : "hours"}`
  }
  const m = Math.floor(seconds / 60)
  return `Every ${m} ${m === 1 ? "minute" : "minutes"}`
}

function toLocalDatetimeStr(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function relativeTime(date: Date, now: Date): string {
  const diff = date.getTime() - now.getTime()
  const absDiff = Math.abs(diff)
  const future = diff > 0

  if (absDiff < 60_000) return future ? "in less than a minute" : "just now"

  const mins = Math.floor(absDiff / 60_000)
  if (mins < 60) {
    const label = `${mins}m`
    return future ? `in ${label}` : `${label} ago`
  }

  const hours = Math.floor(absDiff / 3_600_000)
  const remMins = Math.floor((absDiff % 3_600_000) / 60_000)
  if (hours < 24) {
    const label = remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`
    return future ? `in ${label}` : `${label} ago`
  }

  const days = Math.floor(absDiff / 86_400_000)
  if (days < 30) {
    const label = `${days} ${days === 1 ? "day" : "days"}`
    return future ? `in ${label}` : `${label} ago`
  }

  const months = Math.floor(days / 30)
  const label = `${months} ${months === 1 ? "month" : "months"}`
  return future ? `in ${label}` : `${label} ago`
}

function countdownStr(date: Date, now: Date): string {
  const diff = date.getTime() - now.getTime()
  if (diff <= 0) return "now"
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

type DateBucket = "overdue" | "today" | "tomorrow" | "this_week" | "later"

function getDateBucket(date: Date, now: Date): DateBucket {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  if (date < now) return "overdue"
  if (date < tomorrow) return "today"
  if (date < dayAfterTomorrow) return "tomorrow"
  if (date < endOfWeek) return "this_week"
  return "later"
}

const bucketLabels: Record<DateBucket, string> = {
  overdue: "Overdue",
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "This Week",
  later: "Later",
}

const bucketOrder: DateBucket[] = ["overdue", "today", "tomorrow", "this_week", "later"]

interface QuickPreset {
  label: string
  getTime: () => Date
}

function getQuickPresets(): QuickPreset[] {
  const now = new Date()
  const tomorrow9 = new Date(now)
  tomorrow9.setDate(tomorrow9.getDate() + 1)
  tomorrow9.setHours(9, 0, 0, 0)
  const tomorrow18 = new Date(now)
  tomorrow18.setDate(tomorrow18.getDate() + 1)
  tomorrow18.setHours(18, 0, 0, 0)

  return [
    { label: "In 30 min", getTime: () => new Date(Date.now() + 30 * 60_000) },
    { label: "In 1 hour", getTime: () => new Date(Date.now() + 60 * 60_000) },
    { label: "In 3 hours", getTime: () => new Date(Date.now() + 180 * 60_000) },
    { label: "Tomorrow 9 AM", getTime: () => tomorrow9 },
    { label: "Tomorrow 6 PM", getTime: () => tomorrow18 },
  ]
}

function MiniCalendar({
  reminders,
  selectedDate,
  onSelectDate,
}: {
  reminders: Reminder[]
  selectedDate: string | null
  onSelectDate: (dateStr: string | null) => void
}) {
  const [viewDate, setViewDate] = useState(() => new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const reminderDates = useMemo(() => {
    const set = new Set<string>()
    reminders.forEach((r) => {
      const d = new Date(r.remindAt)
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    })
    return set
  }, [reminders])

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft size={16} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {monthNames[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayNames.map((d) => (
          <div key={d} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const key = `${year}-${month}-${day}`
          const isToday = key === todayKey
          const hasReminder = reminderDates.has(key)
          const isSelected = selectedDate === key
          return (
            <button
              key={key}
              onClick={() => onSelectDate(isSelected ? null : key)}
              className={`relative text-xs py-1.5 rounded-md transition-all ${
                isSelected
                  ? "bg-indigo-500 text-white font-semibold"
                  : isToday
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {day}
              {hasReminder && (
                <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  isSelected ? "bg-white" : "bg-indigo-400"
                }`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LiveCountdown({ targetDate }: { targetDate: Date }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const diff = targetDate.getTime() - Date.now()
    if (diff <= 0) return
    const tick = diff < 86_400_000 ? 1000 : 60_000
    const id = setInterval(() => setNow(new Date()), tick)
    return () => clearInterval(id)
  }, [targetDate])

  const diff = targetDate.getTime() - now.getTime()
  if (diff <= 0) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
      <Timer size={11} />
      {countdownStr(targetDate, now)}
    </span>
  )
}

export default function RemindersPage() {
  const { data: session } = useSession()
  const { data: remindersData, isLoading: loading, mutate } = useDashboard<RemindersResponse>(
    session ? "/api/dashboard/reminders" : null
  )
  const reminders = remindersData?.reminders || []
  const totalCount = remindersData?.totalCount ?? reminders.length

  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [mobileMenuId, setMobileMenuId] = useState<number | null>(null)
  const [clearingPast, setClearingPast] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [form, setForm] = useState({
    title: "",
    content: "",
    remindAt: "",
    intervalValue: "",
    intervalUnit: "minutes" as "minutes" | "hours" | "days",
  })

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const formRef = useRef<HTMLDivElement>(null)

  const filteredReminders = useMemo(() => {
    let list = reminders

    if (filter === "one-time") list = list.filter((r) => !r.interval)
    else if (filter === "recurring") list = list.filter((r) => !!r.interval)
    else if (filter === "failed") list = list.filter((r) => r.failed)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          r.content.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q))
      )
    }

    if (selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number)
      list = list.filter((r) => {
        const rd = new Date(r.remindAt)
        return rd.getFullYear() === y && rd.getMonth() === m && rd.getDate() === d
      })
    }

    return list
  }, [reminders, filter, searchQuery, selectedDate])

  const groupedReminders = useMemo(() => {
    const groups: Record<DateBucket, Reminder[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      this_week: [],
      later: [],
    }
    filteredReminders.forEach((r) => {
      const d = new Date(r.remindAt)
      const bucket = getDateBucket(d, now)
      groups[bucket].push(r)
    })
    return groups
  }, [filteredReminders, now])

  const pastOneTimeCount = reminders.filter(
    (r) => new Date(r.remindAt) <= now && !r.interval
  ).length

  const resetForm = () => {
    setForm({ title: "", content: "", remindAt: "", intervalValue: "", intervalUnit: "minutes" })
    setEditingId(null)
    setShowForm(false)
    setShowRepeat(false)
  }

  const openFormWithPreset = (preset: QuickPreset) => {
    resetForm()
    setForm((f) => ({ ...f, remindAt: toLocalDatetimeStr(preset.getTime().toISOString()) }))
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
  }

  const startEdit = (r: Reminder) => {
    setEditingId(r.id)
    const val = r.interval
      ? r.interval >= 86400
        ? Math.floor(r.interval / 86400).toString()
        : r.interval >= 3600
        ? Math.floor(r.interval / 3600).toString()
        : Math.floor(r.interval / 60).toString()
      : ""
    const unit: "minutes" | "hours" | "days" = r.interval
      ? r.interval >= 86400
        ? "days"
        : r.interval >= 3600
        ? "hours"
        : "minutes"
      : "minutes"
    setForm({
      title: r.title || "",
      content: r.content,
      remindAt: toLocalDatetimeStr(r.remindAt),
      intervalValue: val,
      intervalUnit: unit,
    })
    setShowRepeat(!!r.interval)
    setShowForm(true)
    setMobileMenuId(null)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
  }

  const intervalInSeconds = useCallback((): number | null => {
    if (!form.intervalValue || !showRepeat) return null
    const v = parseInt(form.intervalValue)
    if (isNaN(v) || v <= 0) return null
    const multiplier = form.intervalUnit === "days" ? 86400 : form.intervalUnit === "hours" ? 3600 : 60
    return v * multiplier
  }, [form.intervalValue, form.intervalUnit, showRepeat])

  const intervalError = useMemo(() => {
    const s = intervalInSeconds()
    if (s !== null && s < MIN_INTERVAL_SECONDS) return "Minimum repeat interval is 10 minutes"
    return null
  }, [intervalInSeconds])

  const futureError = useMemo(() => {
    if (!form.remindAt) return null
    const d = new Date(form.remindAt)
    if (d.getTime() <= Date.now()) return "Time must be in the future"
    return null
  }, [form.remindAt])

  const saveReminder = async () => {
    if (!form.content.trim() || !form.remindAt) return
    if (futureError || intervalError) return
    setSaving(true)
    const interval = intervalInSeconds()
    const body: Record<string, unknown> = {
      title: form.title || null,
      content: form.content.trim(),
      remindAt: new Date(form.remindAt).toISOString(),
      interval,
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
        } else {
          const err = await res.json().catch(() => null)
          toast.error(err?.error || "Failed to update")
        }
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
        } else {
          const err = await res.json().catch(() => null)
          toast.error(err?.error || "Failed to create")
        }
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

  const handleRetry = async (r: Reminder) => {
    try {
      const retryTime = new Date(Date.now() + 60_000)
      const res = await fetch("/api/dashboard/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderId: r.id,
          remindAt: retryTime.toISOString(),
        }),
      })
      if (res.ok) {
        toast.success("Reminder rescheduled")
        mutate()
      } else toast.error("Failed to retry")
    } catch {
      toast.error("Error retrying")
    }
  }

  const handleClearPast = async () => {
    setClearingPast(true)
    try {
      const res = await fetch("/api/dashboard/reminders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_past" }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Cleared ${data.deleted} past reminder${data.deleted === 1 ? "" : "s"}`)
        mutate()
      } else toast.error("Failed to clear")
    } catch {
      toast.error("Error clearing")
    }
    setClearingPast(false)
  }

  const limitPct = Math.min((totalCount / MAX_REMINDERS) * 100, 100)
  const limitColor = totalCount >= MAX_REMINDERS ? "bg-red-500" : totalCount >= 20 ? "bg-amber-500" : "bg-indigo-500"
  const atLimit = totalCount >= MAX_REMINDERS

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: reminders.length },
    { key: "one-time", label: "One-time", count: reminders.filter((r) => !r.interval).length },
    { key: "recurring", label: "Recurring", count: reminders.filter((r) => !!r.interval).length },
    { key: "failed", label: "Failed", count: reminders.filter((r) => r.failed).length },
  ]

  const accentColor = (r: Reminder, isPast: boolean): string => {
    if (r.failed) return "border-l-red-500"
    if (isPast && !r.interval) return "border-l-muted-foreground/30"
    if (r.interval) return "border-l-purple-500"
    return "border-l-indigo-500"
  }

  const ReminderCard = ({ r }: { r: Reminder }) => {
    const d = new Date(r.remindAt)
    const isPast = d <= now
    const isOverdue = isPast && !r.interval
    const showCountdown = !isPast && d.getTime() - now.getTime() < 86_400_000

    return (
      <div
        className={`bg-card rounded-xl border border-border border-l-[3px] ${accentColor(r, isPast)} p-4 group transition-all hover:border-border/80 ${
          isOverdue ? "opacity-70" : ""
        }`}
      >
        {r.failed && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3 text-xs text-red-400">
            <AlertTriangle size={14} />
            <span className="flex-1">Delivery failed -- DMs may be closed</span>
            <button
              onClick={() => handleRetry(r)}
              className="flex items-center gap-1 text-red-300 hover:text-white transition-colors font-medium"
            >
              <RotateCcw size={12} />
              Retry
            </button>
            <button
              onClick={() => setDeleteTarget(r.id)}
              className="text-red-300 hover:text-white transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {r.title && (
              <h4 className="text-foreground font-semibold text-sm mb-0.5 truncate">{r.title}</h4>
            )}
            <p className="text-foreground/80 text-sm leading-relaxed">{r.content}</p>

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span
                className="text-xs text-muted-foreground flex items-center gap-1 cursor-help"
                title={d.toLocaleString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              >
                <Clock size={12} />
                {relativeTime(d, now)}
              </span>

              {showCountdown && <LiveCountdown targetDate={d} />}

              {r.interval && (
                <span className="text-xs flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  <Repeat size={11} />
                  {formatInterval(r.interval)}
                </span>
              )}

              {r.interval && isPast && (
                <span className="text-xs text-muted-foreground">
                  Next: {new Date(d.getTime() + r.interval * 1000).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>

            {r.createdAt && (
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                Created {relativeTime(new Date(r.createdAt), now)}
              </p>
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex gap-1 flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => startEdit(r)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeleteTarget(r.id)}
              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-400"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Mobile actions */}
          <div className="sm:hidden relative flex-shrink-0">
            <button
              onClick={() => setMobileMenuId(mobileMenuId === r.id ? null : r.id)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            >
              <MoreVertical size={16} />
            </button>
            {mobileMenuId === r.id && (
              <div className="absolute right-0 top-8 z-10 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[120px]">
                <button
                  onClick={() => startEdit(r)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget(r.id)
                    setMobileMenuId(null)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const presets = getQuickPresets()

  return (
    <Layout
      SEO={{
        title: "Reminders - LionBot Dashboard",
        description: "Manage your reminders",
      }}
    >
      <AdminGuard>
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to DashboardShell layout wrapper */}
        {/* Original: <div className="min-h-screen ..."><div className="max-w-6xl ..."><DashboardNav /><div className="flex-1 min-w-0"> */}
        <DashboardShell nav={<DashboardNav />}>
              <PageHeader
                title="Reminders"
                description="LionBot will DM you when it's time. Set one-time or recurring reminders to stay on track."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Reminders" },
                ]}
                actions={
                  <button
                    onClick={() => {
                      if (atLimit) {
                        toast.error(`You've reached the ${MAX_REMINDERS}-reminder limit`)
                        return
                      }
                      resetForm()
                      setShowForm(true)
                      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
                    }}
                    disabled={atLimit}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-xl text-sm font-medium transition-all active:scale-95"
                  >
                    <Plus size={18} />
                    New Reminder
                  </button>
                }
              />

              {/* Limit indicator */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">
                    {totalCount} / {MAX_REMINDERS} reminders
                  </span>
                  {atLimit && (
                    <span className="text-xs text-red-400 font-medium">Limit reached</span>
                  )}
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${limitColor}`}
                    style={{ width: `${limitPct}%` }}
                  />
                </div>
              </div>

              {/* Quick presets */}
              {!showForm && !atLimit && (
                <div className="mb-5 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2 pb-1">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap pr-1">
                      <Zap size={13} />
                      Quick:
                    </span>
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => openFormWithPreset(p)}
                        className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-muted hover:bg-indigo-500/15 hover:text-indigo-400 text-muted-foreground rounded-full border border-border hover:border-indigo-500/30 transition-all"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create/Edit form */}
              {showForm && (
                <div ref={formRef} className="bg-card rounded-2xl border border-indigo-500/30 p-5 mb-6 shadow-lg shadow-indigo-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground font-semibold flex items-center gap-2">
                      <Bell size={18} className="text-indigo-400" />
                      {editingId ? "Edit Reminder" : "New Reminder"}
                    </h3>
                    <button onClick={resetForm} className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full bg-muted border border-input text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                    />
                    <div className="relative">
                      <textarea
                        placeholder="What would you like to be reminded about?"
                        value={form.content}
                        rows={3}
                        maxLength={MAX_CONTENT}
                        onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                        className="w-full bg-muted border border-input text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none resize-none transition-all"
                      />
                      <span className={`absolute bottom-2 right-3 text-[10px] ${
                        form.content.length > MAX_CONTENT * 0.9 ? "text-amber-400" : "text-muted-foreground/50"
                      }`}>
                        {form.content.length} / {MAX_CONTENT}
                      </span>
                    </div>

                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">
                        When
                      </label>
                      <input
                        type="datetime-local"
                        value={form.remindAt}
                        onChange={(e) => setForm((f) => ({ ...f, remindAt: e.target.value }))}
                        className={`w-full bg-muted border text-foreground rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring outline-none transition-all ${
                          futureError ? "border-red-500/50" : "border-input focus:border-transparent"
                        }`}
                      />
                      {futureError && (
                        <p className="text-xs text-red-400 mt-1">{futureError}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                        Tip: On Discord, try <code className="bg-muted px-1 rounded">/remindme at 4pm</code> or <code className="bg-muted px-1 rounded">/remindme in 2h</code>
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          type="button"
                          onClick={() => setShowRepeat(!showRepeat)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${showRepeat ? "bg-purple-500" : "bg-muted"}`}
                        >
                          <span className={`absolute top-0.5 ${showRepeat ? "left-[18px]" : "left-0.5"} w-4 h-4 rounded-full bg-white shadow transition-all`} />
                        </button>
                        <label className="text-sm text-foreground cursor-pointer" onClick={() => setShowRepeat(!showRepeat)}>
                          Repeat this reminder
                        </label>
                      </div>
                      {showRepeat && (
                        <div className="pl-12">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="10"
                              min={1}
                              value={form.intervalValue}
                              onChange={(e) => setForm((f) => ({ ...f, intervalValue: e.target.value }))}
                              className="w-24 bg-muted border border-input text-foreground rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                            />
                            <select
                              value={form.intervalUnit}
                              onChange={(e) => setForm((f) => ({ ...f, intervalUnit: e.target.value as "minutes" | "hours" | "days" }))}
                              className="bg-muted border border-input text-foreground rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none"
                            >
                              <option value="minutes">minutes</option>
                              <option value="hours">hours</option>
                              <option value="days">days</option>
                            </select>
                          </div>
                          {intervalError && (
                            <p className="text-xs text-red-400 mt-1">{intervalError}</p>
                          )}
                          {form.intervalValue && !intervalError && (
                            <p className="text-xs text-purple-400 mt-1.5 flex items-center gap-1">
                              <Repeat size={11} />
                              Will repeat {formatInterval(intervalInSeconds()!).toLowerCase()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={saveReminder}
                        disabled={saving || !form.content.trim() || !form.remindAt || !!futureError || !!intervalError}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-xl text-sm font-medium transition-all active:scale-95"
                      >
                        {saving ? "Saving..." : editingId ? "Update Reminder" : "Create Reminder"}
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

              {/* Search, filters, and calendar toggle */}
              {!loading && reminders.length > 0 && (
                <div className="mb-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search reminders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted border border-input text-foreground rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={`p-2 rounded-xl border transition-all sm:hidden ${
                        showCalendar ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-muted border-input text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {/* --- AI-REPLACED (2026-03-24) ---
                        Reason: Migrated from custom filter chips with indigo active styling to shared TabBar component
                        --- Original code (commented out for rollback) ---
                        {filters.map((f) => (
                          <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-all ${
                              filter === f.key ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                                : "bg-muted/50 border-border text-muted-foreground ..."
                            }`}>
                            {f.label}
                            <span className={...}>{f.count}</span>
                          </button>
                        ))}
                        --- End original code --- */}
                    <TabBar
                      tabs={filters.map((f) => ({ key: f.key, label: f.label, count: f.count }))}
                      active={filter}
                      onChange={(k) => setFilter(k as FilterType)}
                      variant="pills"
                    />
                    {/* --- END AI-REPLACED --- */}

                    {pastOneTimeCount > 0 && (
                      <button
                        onClick={handleClearPast}
                        disabled={clearingPast}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-400 whitespace-nowrap transition-colors"
                      >
                        <Trash2 size={12} />
                        {clearingPast ? "Clearing..." : `Clear ${pastOneTimeCount} past`}
                      </button>
                    )}

                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-500/15 text-indigo-400 rounded-full border border-indigo-500/30"
                      >
                        <CalendarIcon size={11} />
                        Date filter
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Main content with calendar sidebar */}
              <div className="flex gap-5">
                {/* Timeline */}
                <div className="flex-1 min-w-0">
                  {/* --- AI-REPLACED (2026-03-24) --- */}
                  {/* Reason: Replaced custom animate-pulse divs with shared Skeleton component */}
                  {/* What the new code does better: Consistent loading states using the shared Skeleton component */}
                  {/* --- Original code (commented out for rollback) --- */}
                  {/* loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card rounded-xl border border-border border-l-[3px] border-l-muted p-4 animate-pulse">
                          <div className="h-3.5 bg-muted rounded w-1/4 mb-2" />
                          <div className="h-3 bg-muted rounded w-3/4 mb-3" />
                          <div className="flex gap-2">
                            <div className="h-2.5 bg-muted rounded w-20" />
                            <div className="h-2.5 bg-muted rounded w-16" />
                          </div>
                        </div>
                      ))}
                    </div> */}
                  {/* --- End original code --- */}
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card rounded-xl border border-border border-l-[3px] border-l-muted p-4">
                          <Skeleton className="h-3.5 w-1/4 mb-2" />
                          <Skeleton className="h-3 w-3/4 mb-3" />
                          <div className="flex gap-2">
                            <Skeleton className="h-2.5 w-20" />
                            <Skeleton className="h-2.5 w-16" />
                          </div>
                        </div>
                      ))}
                      {/* --- END AI-REPLACED --- */}
                    </div>
                  ) : reminders.length === 0 ? (
                    <EmptyState
                      icon={<Bell size={48} strokeWidth={1} className="text-muted-foreground" />}
                      title="No reminders yet"
                      description="Set your first reminder to stay on track."
                      action={{
                        label: "Create Reminder",
                        onClick: () => {
                          resetForm()
                          setShowForm(true)
                        },
                      }}
                    />
                  ) : filteredReminders.length === 0 ? (
                    // --- AI-MODIFIED (2026-04-25) ---
                    // Purpose: Use shared EmptyState for "no matches" state
                    <EmptyState
                      icon={<Search size={48} strokeWidth={1} />}
                      title="No matching reminders"
                      description="Try adjusting your search or filters."
                    />
                    // --- END AI-MODIFIED ---
                  ) : (
                    <div className="space-y-6">
                      {bucketOrder.map((bucket) => {
                        const items = groupedReminders[bucket]
                        if (items.length === 0) return null
                        return (
                          <div key={bucket}>
                            <div className="sticky top-0 z-[5] bg-background/90 backdrop-blur-sm py-1.5 mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className={`text-sm font-semibold ${
                                  bucket === "overdue" ? "text-red-400" : "text-foreground"
                                }`}>
                                  {bucketLabels[bucket]}
                                </h3>
                                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                  {items.length}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {items.map((r) => (
                                <ReminderCard key={r.id} r={r} />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop calendar sidebar */}
                {!loading && reminders.length > 0 && (
                  <div className="hidden sm:block w-56 flex-shrink-0">
                    <div className="sticky top-6">
                      <MiniCalendar
                        reminders={reminders}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile calendar (collapsible) */}
              {showCalendar && !loading && reminders.length > 0 && (
                <div className="sm:hidden mt-4">
                  <MiniCalendar
                    reminders={reminders}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                </div>
              )}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}

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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
// --- END AI-MODIFIED ---
