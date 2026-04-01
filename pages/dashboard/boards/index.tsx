// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Boards list page — grid of shared kanban boards
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { DashboardShell, PageHeader, EmptyState } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/router"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { KanbanSquare, Plus, Users, CheckSquare, Crown, Pencil, Eye } from "lucide-react"
import CreateBoardModal from "@/components/boards/CreateBoardModal"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface BoardMember {
  userId: string
  role: string
  name: string | null
  avatarHash: string | null
}

interface Board {
  id: number
  name: string
  description: string | null
  color: string | null
  myRole: string
  ownerId: string
  createdAt: string
  updatedAt: string
  taskCount: number
  members: BoardMember[]
}

function getDiscordAvatarUrl(userId: string, hash: string | null) {
  if (hash) return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`
  const index = Number((BigInt(userId) >> BigInt(22)) % BigInt(6))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

const ROLE_BADGE: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  owner: { label: "Owner", icon: <Crown size={12} />, cls: "bg-amber-500/20 text-amber-400" },
  editor: { label: "Editor", icon: <Pencil size={12} />, cls: "bg-blue-500/20 text-blue-400" },
  viewer: { label: "Viewer", icon: <Eye size={12} />, cls: "bg-gray-500/20 text-gray-400" },
}

export default function BoardsListPage() {
  const { data: session } = useSession()
  const { data, isLoading, mutate } = useDashboard<{ boards: Board[] }>(
    session ? "/api/dashboard/boards" : null
  )
  const boards = data?.boards || []
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <Layout SEO={{ title: "Boards - LionBot Dashboard", description: "Shared kanban boards for collaborative tasks" }}>
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />} className="max-w-5xl space-y-6">
          <PageHeader
            title="Boards"
            description="Shared kanban boards for collaborative study and projects."
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Boards" },
            ]}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {boards.length > 0 ? `${boards.length} board${boards.length !== 1 ? "s" : ""}` : ""}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              New Board
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <EmptyState
              icon={<KanbanSquare size={48} className="text-gray-500" />}
              title="No boards yet"
              description="Create your first shared board to collaborate with others on tasks and projects."
              action={{ label: "Create Your First Board", onClick: () => setShowCreate(true) }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => {
                const roleBadge = ROLE_BADGE[board.myRole] || ROLE_BADGE.viewer
                return (
                  <button
                    key={board.id}
                    onClick={() => router.push(`/dashboard/boards/${board.id}`)}
                    className="text-left bg-card border border-border rounded-xl p-4 hover:border-gray-600 transition-all group relative overflow-hidden"
                  >
                    {board.color && (
                      <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                        style={{ backgroundColor: board.color }}
                      />
                    )}
                    <div className="pt-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-white transition-colors line-clamp-1">
                          {board.name}
                        </h3>
                        <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0", roleBadge.cls)}>
                          {roleBadge.icon}
                          {roleBadge.label}
                        </span>
                      </div>
                      {board.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{board.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckSquare size={13} />
                            {board.taskCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={13} />
                            {board.members.length}
                          </span>
                        </div>
                        <div className="flex -space-x-2">
                          {board.members.slice(0, 4).map((m) => (
                            <img
                              key={m.userId}
                              src={getDiscordAvatarUrl(m.userId, m.avatarHash)}
                              alt={m.name || "Member"}
                              className="w-6 h-6 rounded-full border-2 border-gray-800"
                            />
                          ))}
                          {board.members.length > 4 && (
                            <div className="w-6 h-6 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-[10px] text-gray-300">
                              +{board.members.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <CreateBoardModal
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onCreated={() => mutate()}
          />
        </DashboardShell>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])) },
})
