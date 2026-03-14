// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server list page - shows all servers the user is in
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: redesigned with role badges, bot presence indicator, Discord icons, grouped sections
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { EmptyState, Badge } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import Link from "next/link"
import { Server, Shield, ShieldCheck, ChevronRight, Plus, CheckCircle2, XCircle } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

type ServerRole = "admin" | "moderator" | "member"

interface ServerInfo {
  guildId: string
  guildName: string
  displayName: string | null
  trackedTimeSeconds: number
  trackedTimeHours: number
  coins: number
  firstJoined: string | null
  role: ServerRole
  iconUrl: string | null
  botPresent: boolean
}

const roleConfig: Record<ServerRole, {
  badge: { label: string; variant: "warning" | "info" | "default" }
  borderClass: string
  hoverBorder: string
}> = {
  admin: {
    badge: { label: "Admin", variant: "warning" },
    borderClass: "border-l-4 border-l-amber-500/70",
    hoverBorder: "hover:border-amber-500/40",
  },
  moderator: {
    badge: { label: "Mod", variant: "info" },
    borderClass: "border-l-4 border-l-blue-500/70",
    hoverBorder: "hover:border-blue-500/40",
  },
  member: {
    badge: { label: "Member", variant: "default" },
    borderClass: "",
    hoverBorder: "hover:border-indigo-500/50",
  },
}

const sectionMeta: { role: ServerRole; title: string }[] = [
  { role: "admin", title: "Servers You Manage" },
  { role: "moderator", title: "Servers You Moderate" },
  { role: "member", title: "Your Servers" },
]

const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_BOT_CLIENT_ID || "889078613817831495"}&permissions=1376674495606&scope=bot+applications.commands`

function ServerIcon({ name, iconUrl }: { name: string; iconUrl: string | null }) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt=""
        className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
        loading="lazy"
      />
    )
  }
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-border/50">
      <span className="text-base font-bold text-foreground/80">{initial}</span>
    </div>
  )
}

function ServerCard({ server }: { server: ServerInfo }) {
  const config = roleConfig[server.role]

  const cardContent = (
    <div
      className={`
        bg-card rounded-2xl p-5 border border-border transition-all h-full group
        ${config.borderClass} ${config.hoverBorder}
        ${server.botPresent ? "cursor-pointer" : ""}
        ${!server.botPresent ? "opacity-75" : ""}
      `}
    >
      <div className="flex items-start gap-3.5 mb-3">
        <ServerIcon name={server.guildName} iconUrl={server.iconUrl} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold text-foreground truncate transition-colors mb-1 ${server.botPresent ? "group-hover:text-indigo-300" : ""}`}>
            {server.guildName}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={config.badge.variant} size="sm" dot>
              {config.badge.label}
            </Badge>
            {server.botPresent ? (
              <Badge variant="success" size="sm" dot>Bot Active</Badge>
            ) : (
              <Badge variant="error" size="sm" dot>No Bot</Badge>
            )}
            {server.displayName && (
              <span className="text-muted-foreground text-xs truncate">
                as {server.displayName}
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          size={18}
          className={`flex-shrink-0 mt-1 transition-colors ${server.botPresent ? "text-muted-foreground/40 group-hover:text-primary" : "text-muted-foreground/20"}`}
        />
      </div>

      <div className="flex items-center gap-5 mt-auto pt-1">
        {server.botPresent && (
          <>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Study</p>
              <p className="text-emerald-400 font-bold text-sm">{server.trackedTimeHours}h</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Coins</p>
              <p className="text-warning font-bold text-sm">{server.coins.toLocaleString()}</p>
            </div>
            {server.firstJoined && (
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Joined</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(server.firstJoined).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </>
        )}
        <div className="ml-auto">
          {server.botPresent ? (
            <span
              className={`text-xs font-medium transition-colors ${
                server.role !== "member"
                  ? "text-primary/80 group-hover:text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {server.role !== "member" ? "Manage" : "View"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <Plus size={14} />
              Add Bot
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (server.botPresent) {
    return (
      <Link href={`/dashboard/servers/${server.guildId}`}>
        {cardContent}
      </Link>
    )
  }

  return (
    <a
      href={`${BOT_INVITE_URL}&guild_id=${server.guildId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {cardContent}
    </a>
  )
}

export default function Servers() {
  const { status } = useSession()
  const { data: serversData, error, isLoading: loading } = useDashboard<{ servers: ServerInfo[] }>(
    status === "authenticated" ? "/api/dashboard/servers" : null
  )
  const servers = serversData?.servers ?? []

  const grouped = sectionMeta
    .map((section) => ({
      ...section,
      servers: servers.filter((s) => s.role === section.role),
    }))
    .filter((section) => section.servers.length > 0)

  const needsGrouping = grouped.length > 1

  return (
    <Layout SEO={{ title: "My Servers - LionBot Dashboard", description: "Your LionBot servers" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">My Servers</h1>
                <span className="text-muted-foreground text-sm">{servers.length} servers</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card rounded-2xl p-5 h-32 animate-pulse border border-border" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-destructive">{error.message}</p>
                </div>
              ) : servers.length === 0 ? (
                <EmptyState
                  icon={<Server size={48} strokeWidth={1} />}
                  title="No servers found"
                  description="Make sure LionBot is in your Discord server and you have some tracked activity."
                />
              ) : needsGrouping ? (
                <div className="space-y-8">
                  {grouped.map((section) => (
                    <div key={section.role}>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                          {section.title}
                        </h2>
                        <span className="text-xs text-muted-foreground/40">
                          {section.servers.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.servers.map((server) => (
                          <ServerCard key={server.guildId} server={server} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servers.map((server) => (
                    <ServerCard key={server.guildId} server={server} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
