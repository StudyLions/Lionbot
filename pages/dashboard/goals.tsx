// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Goals page - weekly and monthly study goals
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  Badge,
  SectionCard,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Target, TrendingUp, Calendar } from "lucide-react"

interface GoalItem {
  guildId: string
  serverName: string
  weekid?: number
  monthid?: number
  studyGoal: number | null
  taskGoal: number | null
  studyProgress: number
  tasksProgress: number
}

interface GoalsData {
  weekid: number
  monthid: number
  weekly: GoalItem[]
  monthly: GoalItem[]
}

function ProgressBar({
  current,
  goal,
  label,
}: {
  current: number
  goal: number | null
  label: string
}) {
  if (goal == null || goal <= 0) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{label}</span>
          <span className="text-gray-300">{current} / —</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-600 rounded-full"
            style={{ width: "0%" }}
          />
        </div>
      </div>
    )
  }

  const pct = Math.min(100, (current / goal) * 100)
  const status =
    pct >= 100 ? "complete" : pct >= 50 ? "on_track" : "behind"
  const barColor =
    status === "complete"
      ? "bg-emerald-500"
      : status === "on_track"
        ? "bg-green-500"
        : "bg-amber-500"

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">
          {current} / {goal}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<GoalsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetch("/api/dashboard/goals")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load goals")
        return res.json()
      })
      .then(setData)
      .catch(() => toast.error("Failed to load goals"))
      .finally(() => setLoading(false))
  }, [session])

  const hasGoals =
    data &&
    (data.weekly.length > 0 || data.monthly.length > 0)

  return (
    <Layout
      SEO={{
        title: "Goals - LionBot Dashboard",
        description: "Set and track your weekly and monthly study goals",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-4xl">
              <PageHeader
                title="Goals"
                description="Set and track your weekly and monthly study goals across your servers."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Goals" },
                ]}
              />

              {loading ? (
                <div className="space-y-6">
                  <div className="h-48 bg-gray-800 rounded-2xl animate-pulse" />
                  <div className="h-48 bg-gray-800 rounded-2xl animate-pulse" />
                </div>
              ) : !hasGoals ? (
                <EmptyState
                  icon={<Target size={48} strokeWidth={1} className="text-gray-500" />}
                  title="No goals set yet"
                  description="Set weekly and monthly study goals in Discord using LionBot commands to see your progress here."
                />
              ) : (
                <div className="space-y-6">
                  <SectionCard
                    title="This Week"
                    description="Weekly study and task goals"
                    icon={<Calendar size={18} />}
                    defaultOpen
                  >
                    <div className="space-y-6 pt-2">
                      {data!.weekly.map((g) => (
                        <div
                          key={`${g.guildId}-${g.weekid}`}
                          className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <span className="font-medium text-white">
                              {g.serverName}
                            </span>
                            <Badge variant="info" size="sm">
                              Weekly
                            </Badge>
                          </div>
                          <div className="space-y-4">
                            <ProgressBar
                              current={g.studyProgress}
                              goal={g.studyGoal}
                              label="Study hours"
                            />
                            <ProgressBar
                              current={g.tasksProgress}
                              goal={g.taskGoal}
                              label="Tasks completed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="This Month"
                    description="Monthly study and task goals"
                    icon={<TrendingUp size={18} />}
                    defaultOpen
                  >
                    <div className="space-y-6 pt-2">
                      {data!.monthly.map((g) => (
                        <div
                          key={`${g.guildId}-${g.monthid}`}
                          className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <span className="font-medium text-white">
                              {g.serverName}
                            </span>
                            <Badge variant="purple" size="sm">
                              Monthly
                            </Badge>
                          </div>
                          <div className="space-y-4">
                            <ProgressBar
                              current={g.studyProgress}
                              goal={g.studyGoal}
                              label="Study hours"
                            />
                            <ProgressBar
                              current={g.tasksProgress}
                              goal={g.taskGoal}
                              label="Tasks completed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
