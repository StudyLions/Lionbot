// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Goals page - weekly and monthly study goals
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
  SectionCard,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { Target, TrendingUp, Calendar } from "lucide-react"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

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
          <span className="text-muted-foreground">{label}</span>
          <span className="text-foreground/80">{current} / —</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-muted/80 rounded-full"
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
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground/80">
          {current} / {goal}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
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
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data, error, isLoading: loading, mutate } = useDashboard<GoalsData>(session ? "/api/dashboard/goals" : null)
  // --- END AI-MODIFIED ---

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
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
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
                  <div className="h-48 bg-card rounded-2xl animate-pulse" />
                  <div className="h-48 bg-card rounded-2xl animate-pulse" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-red-400">{error.message}</p>
                  <button
                    onClick={() => mutate()}
                    className="text-primary hover:text-primary text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : !hasGoals ? (
                <EmptyState
                  icon={<Target size={48} strokeWidth={1} className="text-muted-foreground" />}
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
                          className="p-4 bg-card/50 rounded-xl border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <span className="font-medium text-foreground">
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
                          className="p-4 bg-card/50 rounded-xl border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <span className="font-medium text-foreground">
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

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
// --- END AI-MODIFIED ---
