// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-25
// Purpose: Comprehensive server debug info page for admin diagnostics
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { DashboardShell, PageHeader, toast } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useMemo, useCallback } from "react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import {
  ChevronDown, ChevronRight, Copy, ExternalLink,
  CheckCircle2, XCircle, AlertTriangle, Clock,
  Shield, Coins, Trophy, Timer, Volume2, Pin,
  ListChecks, Bug, Server, Crown, Zap, Eye,
} from "lucide-react"

interface DiscordChannel {
  id: string; name: string; type: number; parent_id: string | null
}
interface DiscordRole {
  id: string; name: string; color: number; position: number; managed: boolean
}

const PERM_FLAGS: Record<string, { bit: number; features: string[] }> = {
  "Send Messages": { bit: 1 << 11, features: ["Core"] },
  "Embed Links": { bit: 1 << 14, features: ["Core"] },
  "Read Message History": { bit: 1 << 16, features: ["Core"] },
  "Use External Emojis": { bit: 1 << 18, features: ["Core"] },
  "Attach Files": { bit: 1 << 15, features: ["Core"] },
  "Manage Webhooks": { bit: 1 << 29, features: ["Event Log", "Pomodoro", "Schedule"] },
  "Manage Roles": { bit: 1 << 28, features: ["Ranks", "Private Rooms", "Role Menus", "Moderation"] },
  "Manage Channels": { bit: 1 << 4, features: ["Private Rooms"] },
  "Move Members": { bit: 1 << 24, features: ["Pomodoro", "Video Channels", "Private Rooms"] },
  "Connect": { bit: 1 << 20, features: ["Pomodoro"] },
  "Speak": { bit: 1 << 21, features: ["Pomodoro"] },
  "Kick Members": { bit: 1 << 1, features: ["Moderation"] },
  "Administrator": { bit: 1 << 3, features: ["All"] },
}

function Section({ title, icon, badge, defaultOpen = true, children }: {
  title: string; icon: React.ReactNode; badge?: string | number
  defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- accordion now uses semantic tokens instead of
  // hardcoded greys, has aria-expanded, type=button, and a focus-visible ring
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {open ? <ChevronDown size={16} className="text-muted-foreground shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-medium text-foreground">{title}</span>
        {badge !== undefined && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{badge}</span>
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-2 border-t border-border/60">{children}</div>}
    </div>
  )
  // --- END AI-MODIFIED ---
}

function Row({ label, value, mono, error, warn }: {
  label: string; value: React.ReactNode; mono?: boolean; error?: boolean; warn?: boolean
}) {
  return (
    <div className={`flex items-start gap-2 py-1.5 ${error ? "bg-red-900/20 -mx-2 px-2 rounded" : warn ? "bg-amber-900/20 -mx-2 px-2 rounded" : ""}`}>
      <span className="text-muted-foreground text-sm min-w-[160px] shrink-0">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""} ${error ? "text-red-300" : warn ? "text-amber-300" : "text-foreground"}`}>
        {value ?? <span className="text-muted-foreground/70 italic">Not set</span>}
      </span>
    </div>
  )
}

function IdVal({ id, name, prefix }: { id: string | null; name?: string; prefix?: string }) {
  if (!id) return <span className="text-gray-500 italic">Not set</span>
  return (
    <span className="font-mono text-sm">
      {name ? <><span className="text-gray-300">{prefix}{name}</span> <span className="text-gray-500">({id})</span></> : id}
    </span>
  )
}

function IdList({ ids, names, prefix = "" }: { ids: string[]; names: Map<string, string>; prefix?: string }) {
  if (ids.length === 0) return <span className="text-gray-500 italic">None</span>
  return (
    <div className="flex flex-wrap gap-1">
      {ids.map(id => (
        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-700/50 font-mono text-xs">
          {names.get(id) ? <><span className="text-gray-300">{prefix}{names.get(id)}</span> <span className="text-gray-500">{id}</span></> : id}
        </span>
      ))}
    </div>
  )
}

function PermRow({ name, has, features }: { name: string; has: boolean; features: string[] }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {has ? <CheckCircle2 size={14} className="text-green-400 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
      <span className={`text-sm ${has ? "text-gray-200" : "text-red-300"}`}>{name}</span>
      <span className="text-xs text-gray-500 ml-auto">{features.join(", ")}</span>
    </div>
  )
}

export default function DebugInfoPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const { data, isLoading } = useDashboard<any>(
    id && session ? `/api/dashboard/servers/${id}/debug-info` : null
  )

  const { data: channels } = useDashboard<DiscordChannel[]>(
    id && session ? `/api/discord/guild/${id}/channels` : null
  )

  const { data: roles } = useDashboard<DiscordRole[]>(
    id && session ? `/api/discord/guild/${id}/roles` : null
  )

  const channelMap = useMemo(() => {
    const m = new Map<string, string>()
    if (channels) channels.forEach(c => m.set(c.id, c.name))
    return m
  }, [channels])

  const roleMap = useMemo(() => {
    const m = new Map<string, string>()
    if (roles) roles.forEach(r => m.set(r.id, r.name))
    return m
  }, [roles])

  const chName = useCallback((id: string | null) => id ? channelMap.get(id) : undefined, [channelMap])
  const rlName = useCallback((id: string | null) => id ? roleMap.get(id) : undefined, [roleMap])

  const permBits = useMemo(() => {
    if (!data?.bot_permissions?.permissions) return null
    try { return parseInt(data.bot_permissions.permissions, 10) } catch { return null }
  }, [data])

  const hasPerm = useCallback((bit: number) => {
    if (permBits === null) return false
    if (permBits & (1 << 3)) return true
    return (permBits & bit) === bit
  }, [permBits])

  const generateCopyText = useCallback(() => {
    if (!data) return ""
    const d = data
    const lines: string[] = []
    const add = (s: string) => lines.push(s)
    const br = () => lines.push("")
    const cn = (id: string | null) => {
      if (!id) return "Not set"
      const name = channelMap.get(id)
      return name ? `#${name} (${id})` : id
    }
    const rn = (id: string | null) => {
      if (!id) return "Not set"
      const name = roleMap.get(id)
      return name ? `@${name} (${id})` : id
    }
    const yesNo = (v: any) => v ? "Enabled" : "Disabled"

    add("=== LionBot Server Debug Info ===")
    add(`Generated: ${new Date().toISOString()}`)
    add(`Dashboard: ${window.location.href}`)
    br()

    add("--- Server ---")
    add(`Server ID: ${d.server.guildid}`)
    add(`Name: ${d.server.name || "Unknown"}`)
    add(`First Joined: ${d.server.first_joined_at ? new Date(d.server.first_joined_at).toLocaleDateString() : "Unknown"}`)
    if (d.server.left_at) add(`Left At: ${new Date(d.server.left_at).toLocaleDateString()}`)
    add(`Timezone: ${d.server.timezone || "Not set"}`)
    add(`Locale: ${d.server.locale || "Not set"}${d.server.force_locale ? " (forced)" : ""}`)
    add(`Season Start: ${d.server.season_start ? new Date(d.server.season_start).toLocaleDateString() : "Not set"}`)
    br()

    add("--- Shard ---")
    add(`Shard: ${d.shard.shard_number} (of ${d.shard.shard_count})`)
    if (d.shard.last_login) add(`Last Login: ${new Date(d.shard.last_login).toISOString()}`)
    if (d.shard.guild_count) add(`Guilds on Shard: ${d.shard.guild_count.toLocaleString()}`)
    br()

    add("--- Blacklist ---")
    add(`Blacklisted: ${d.blacklist.blacklisted ? `YES - ${d.blacklist.reason}` : "No"}`)
    br()

    add("--- Premium ---")
    add(`Status: ${d.premium.is_active ? "Active" : d.premium.premium_until ? "Expired" : "Never"}`)
    if (d.premium.premium_since) add(`Since: ${new Date(d.premium.premium_since).toLocaleDateString()}`)
    if (d.premium.premium_until) add(`Until: ${new Date(d.premium.premium_until).toLocaleDateString()}`)
    if (d.premium.custom_skin_id) add(`Custom Skin ID: ${d.premium.custom_skin_id}`)
    if (d.premium.subscriptions?.length > 0) {
      d.premium.subscriptions.forEach((s: any) => add(`  Subscription: ${s.plan} (${s.status}) by user ${s.userid}`))
    }
    if (d.premium.lionheart?.length > 0) {
      d.premium.lionheart.forEach((l: any) => add(`  LionHeart: user ${l.userid}`))
    }
    br()

    if (permBits !== null) {
      add("--- Bot Permissions ---")
      const ok: string[] = []
      const missing: string[] = []
      Object.entries(PERM_FLAGS).forEach(([name, { bit, features }]) => {
        if (hasPerm(bit)) ok.push(name)
        else missing.push(`${name} (needed by: ${features.join(", ")})`)
      })
      add(`[OK] ${ok.join(", ")}`)
      if (missing.length > 0) missing.forEach(m => add(`[MISSING] ${m}`))
      br()
    }

    add("--- Quick Stats ---")
    add(`Members: ${d.stats.members.toLocaleString()} | Timers: ${d.stats.timers} | Ongoing Sessions: ${d.stats.ongoing_sessions}`)
    add(`Active Rooms: ${d.stats.active_rooms} | Open Tickets: ${d.stats.open_tickets} | Stickies: ${d.stats.active_stickies}`)
    add(`Role Menus: ${d.stats.role_menus} | Tracked Channels: ${d.stats.tracked_channels}`)
    if (d.stats.shop_items?.length > 0) add(`Shop Items: ${d.stats.shop_items.map((s: any) => `${s.type}: ${s.count}`).join(", ")}`)
    br()

    add("--- Configured Channels ---")
    add(`Event Log: ${cn(d.channels.event_log_channel)}`)
    add(`Mod Log: ${cn(d.channels.mod_log_channel)}`)
    add(`Alert: ${cn(d.channels.alert_channel)}`)
    add(`Greeting: ${cn(d.channels.greeting_channel)}`)
    add(`Pomodoro: ${cn(d.channels.pomodoro_channel)}`)
    add(`Rank Announcements: ${cn(d.channels.rank_channel)}`)
    add(`Private Rooms Category: ${cn(d.channels.renting_category)}`)
    add(`LionGotchi Drops: ${cn(d.channels.lg_drop_channel)}`)
    add(`Accountability Category: ${cn(d.channels.accountability_category)}`)
    add(`Accountability Lobby: ${cn(d.channels.accountability_lobby)}`)
    if (d.channels.tracked?.length > 0) add(`Tracked Voice (${d.channels.tracked.length}): ${d.channels.tracked.map((c: any) => cn(c.channelid)).join(", ")}`)
    if (d.channels.untracked_text?.length > 0) add(`Untracked Text (${d.channels.untracked_text.length}): ${d.channels.untracked_text.map((id: string) => cn(id)).join(", ")}`)
    if (d.channels.untracked_voice?.length > 0) add(`Untracked Voice (${d.channels.untracked_voice.length}): ${d.channels.untracked_voice.map((id: string) => cn(id)).join(", ")}`)
    if (d.channels.video?.length > 0) add(`Video Channels (${d.channels.video.length}): ${d.channels.video.map((id: string) => cn(id)).join(", ")}`)
    if (d.channels.tasklist?.length > 0) add(`Tasklist Channels (${d.channels.tasklist.length}): ${d.channels.tasklist.map((id: string) => cn(id)).join(", ")}`)
    if (d.channels.workout?.length > 0) add(`Workout Channels (${d.channels.workout.length}): ${d.channels.workout.map((id: string) => cn(id)).join(", ")}`)
    if (d.channels.schedule_lobby) add(`Schedule Lobby: ${cn(d.channels.schedule_lobby)}`)
    if (d.channels.schedule_room) add(`Schedule Room: ${cn(d.channels.schedule_room)}`)
    if (d.channels.schedule_extra?.length > 0) add(`Schedule Extra (${d.channels.schedule_extra.length}): ${d.channels.schedule_extra.map((id: string) => cn(id)).join(", ")}`)
    br()

    add("--- Configured Roles ---")
    add(`Admin: ${rn(d.roles.admin_role)}`)
    add(`Mod: ${rn(d.roles.mod_role)}`)
    add(`Study Ban: ${rn(d.roles.studyban_role)}`)
    add(`Renting: ${rn(d.roles.renting_role)}`)
    add(`LionGotchi Activity: ${rn(d.roles.lg_activity_role)}`)
    add(`Focus: ${rn(d.roles.focus_role)}`)
    add(`Schedule Blacklist: ${rn(d.roles.schedule_blacklist_role)}`)
    if (d.roles.autoroles?.length > 0) add(`Auto-Roles (${d.roles.autoroles.length}): ${d.roles.autoroles.map((id: string) => rn(id)).join(", ")}`)
    if (d.roles.bot_autoroles?.length > 0) add(`Bot Auto-Roles (${d.roles.bot_autoroles.length}): ${d.roles.bot_autoroles.map((id: string) => rn(id)).join(", ")}`)
    if (d.roles.video_exempt?.length > 0) add(`Video Exempt (${d.roles.video_exempt.length}): ${d.roles.video_exempt.map((id: string) => rn(id)).join(", ")}`)
    if (d.roles.leaderboard_filter?.length > 0) add(`LB Filter (${d.roles.leaderboard_filter.length}): ${d.roles.leaderboard_filter.map((id: string) => rn(id)).join(", ")}`)
    if (d.roles.donator_roles?.length > 0) add(`Donator (${d.roles.donator_roles.length}): ${d.roles.donator_roles.map((id: string) => rn(id)).join(", ")}`)
    if (d.roles.unranked_roles?.length > 0) add(`Unranked (${d.roles.unranked_roles.length}): ${d.roles.unranked_roles.map((id: string) => rn(id)).join(", ")}`)
    br()

    add("--- Feature Toggles ---")
    add(`Voice Ranks: ${yesNo(d.feature_toggles.voice_ranks_enabled)} | Msg Ranks: ${yesNo(d.feature_toggles.msg_ranks_enabled)} | XP Ranks: ${yesNo(d.feature_toggles.xp_ranks_enabled)}`)
    add(`Rank Type: ${d.feature_toggles.rank_type || "Not set"} | DM Ranks: ${yesNo(d.feature_toggles.dm_ranks)}`)
    add(`LionGotchi: ${yesNo(d.feature_toggles.lg_enabled)} | Teaser: ${yesNo(d.feature_toggles.lg_teaser_enabled)}`)
    add(`Transfers: ${yesNo(d.feature_toggles.allow_transfers)} | Role Persist: ${yesNo(d.feature_toggles.persist_roles)}`)
    add(`Video Studyban: ${yesNo(d.feature_toggles.video_studyban)} | Manual Sessions: ${yesNo(d.feature_toggles.manual_sessions_enabled)}`)
    add(`Leave Summary: ${yesNo(d.feature_toggles.session_leave_summary)} | LB Role Filter: ${yesNo(d.feature_toggles.leaderboard_role_filter_enabled)}`)
    br()

    add("--- Economy ---")
    add(`Hourly Reward: ${d.economy.study_hourly_reward ?? "default"} | Live Bonus: ${d.economy.study_hourly_live_bonus ?? "default"} | Starting Funds: ${d.economy.starting_funds ?? "default"}`)
    add(`Daily Cap: ${d.economy.daily_study_cap ?? "default"} | XP/Period: ${d.economy.xp_per_period ?? "default"} | Coins/XP: ${d.economy.coins_per_centixp ?? "default"}`)
    add(`Task Reward: ${d.economy.task_reward ?? "default"} | Task Limit: ${d.economy.task_reward_limit ?? "default"} | Max Tasks: ${d.economy.max_tasks ?? "default"}`)
    add(`Room Price: ${d.economy.renting_price ?? "default"} | Room Cap: ${d.economy.renting_cap ?? "default"}`)
    br()

    if (d.ranks.voice?.length > 0 || d.ranks.msg?.length > 0 || d.ranks.xp?.length > 0) {
      add("--- Ranks ---")
      const fmtRank = (r: any) => `${rn(r.roleid)} (req: ${r.required}, reward: ${r.reward})`
      if (d.ranks.voice.length > 0) add(`Voice (${d.ranks.voice.length}): ${d.ranks.voice.map(fmtRank).join(" | ")}`)
      if (d.ranks.msg.length > 0) add(`Message (${d.ranks.msg.length}): ${d.ranks.msg.map(fmtRank).join(" | ")}`)
      if (d.ranks.xp.length > 0) add(`XP (${d.ranks.xp.length}): ${d.ranks.xp.map(fmtRank).join(" | ")}`)
      br()
    }

    if (d.pomodoro.timers?.length > 0) {
      add("--- Pomodoro Timers ---")
      d.pomodoro.timers.forEach((t: any) => {
        add(`  ${cn(t.channelid)}: focus=${t.focus_length}m break=${t.break_length}m${t.voice_alerts ? " [voice]" : ""}${t.auto_restart ? " [auto]" : ""}`)
      })
      br()
    }

    if (d.ambient_sounds.configs?.length > 0) {
      add("--- Ambient Sounds ---")
      d.ambient_sounds.configs.forEach((c: any) => {
        add(`  Bot ${c.bot_number}: ${c.sound_type || "none"} in ${cn(c.channelid)} (vol: ${c.volume}, ${c.enabled ? "enabled" : "disabled"}, status: ${c.status})${c.error_msg ? ` ERROR: "${c.error_msg}"` : ""}`)
      })
      br()
    }

    if (d.ongoing_sessions?.length > 0) {
      add("--- Ongoing Voice Sessions ---")
      d.ongoing_sessions.forEach((s: any) => {
        const hours = s.start_time ? Math.round((Date.now() - new Date(s.start_time).getTime()) / 3600000 * 10) / 10 : 0
        add(`  User ${s.userid} in ${cn(s.channelid)} for ${hours}h (${s.coins_earned} coins)${hours > 24 ? " [STUCK?]" : ""}`)
      })
      br()
    }

    if (d.recent_activity?.tickets?.length > 0) {
      add("--- Recent Tickets ---")
      d.recent_activity.tickets.forEach((t: any) => {
        add(`  [${t.ticket_type}] ${t.ticket_state} - target: ${t.targetid} by mod: ${t.moderator_id} (${t.created_at ? new Date(t.created_at).toLocaleDateString() : "?"})${t.auto ? " [auto]" : ""}`)
      })
      br()
    }

    if (d.webhook_status?.length > 0) {
      add("--- Webhook Status ---")
      d.webhook_status.forEach((w: any) => add(`  ${cn(w.channelid)}: webhook ${w.webhookid}`))
      br()
    }

    return lines.join("\n")
  }, [data, channelMap, roleMap, permBits, hasPerm])

  const handleCopy = useCallback(async () => {
    const text = generateCopyText()
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Debug info copied to clipboard!")
    } catch {
      toast.error("Failed to copy — try again")
    }
  }, [generateCopyText])

  const d = data

  return (
    <Layout SEO={{ title: `Debug Info - ${d?.server?.name || "Server"} - LionBot`, description: "Server debug information" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="moderator">
          <DashboardShell nav={<ServerNav serverId={guildId} serverName={d?.server?.name || "..."} isAdmin isMod />}>
            <PageHeader
              title="Server Debug Info"
              description="Complete diagnostic snapshot of your server's LionBot configuration. Copy and share with the dev team when reporting issues."
            />

            <div className="mb-4 flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!data}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors text-sm"
              >
                <Copy size={16} />
                Copy All Debug Info
              </button>
              <a
                href="https://discord.gg/the-study-lions-780195610154237993"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors text-sm"
              >
                <Bug size={16} />
                Report a Bug
                <ExternalLink size={12} className="text-gray-400" />
              </a>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border border-border h-16 animate-pulse" />
                ))}
              </div>
            ) : d ? (
              <div className="space-y-3">

                {/* 1. Server Identity */}
                <Section title="Server Identity" icon={<Server size={16} />}>
                  <Row label="Server ID" value={d.server.guildid} mono />
                  <Row label="Name" value={d.server.name} />
                  <Row label="First Joined" value={d.server.first_joined_at ? new Date(d.server.first_joined_at).toLocaleString() : null} />
                  {d.server.left_at && <Row label="Bot Left At" value={new Date(d.server.left_at).toLocaleString()} warn />}
                  <Row label="Timezone" value={d.server.timezone} />
                  <Row label="Locale" value={d.server.locale ? `${d.server.locale}${d.server.force_locale ? " (forced)" : ""}` : null} />
                  <Row label="Season Start" value={d.server.season_start ? new Date(d.server.season_start).toLocaleDateString() : null} />
                  <div className="border-t border-gray-700/30 mt-2 pt-2">
                    <Row label="Shard" value={`${d.shard.shard_number} of ${d.shard.shard_count}`} />
                    <Row label="Shard Last Login" value={d.shard.last_login ? new Date(d.shard.last_login).toLocaleString() : null} />
                    <Row label="Guilds on Shard" value={d.shard.guild_count?.toLocaleString()} />
                  </div>
                </Section>

                {/* Blacklist */}
                {d.blacklist.blacklisted && (
                  <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-red-300 font-medium mb-1">
                      <AlertTriangle size={16} /> This server is BLACKLISTED
                    </div>
                    <div className="text-sm text-red-200">Reason: {d.blacklist.reason}</div>
                    {d.blacklist.created_at && <div className="text-xs text-red-400 mt-1">Since: {new Date(d.blacklist.created_at).toLocaleString()}</div>}
                  </div>
                )}

                {/* 2. Premium */}
                <Section title="Premium Status" icon={<Crown size={16} />} badge={d.premium.is_active ? "Active" : d.premium.premium_until ? "Expired" : "None"}>
                  <Row label="Status" value={
                    d.premium.is_active
                      ? <span className="text-green-400">Active</span>
                      : d.premium.premium_until
                        ? <span className="text-red-400">Expired</span>
                        : <span className="text-gray-500">Never activated</span>
                  } />
                  {d.premium.premium_since && <Row label="Since" value={new Date(d.premium.premium_since).toLocaleString()} />}
                  {d.premium.premium_until && <Row label="Until" value={new Date(d.premium.premium_until).toLocaleString()} />}
                  {d.premium.custom_skin_id && <Row label="Custom Skin ID" value={d.premium.custom_skin_id} mono />}
                  {d.premium.subscriptions?.map((sub: any) => (
                    <Row key={sub.id} label={`Subscription (${sub.plan})`} value={`${sub.status} — by user ${sub.userid}`} />
                  ))}
                  {d.premium.lionheart?.map((lh: any, i: number) => (
                    <Row key={i} label="LionHeart Contributor" value={`User ${lh.userid}`} />
                  ))}
                </Section>

                {/* 3. Bot Permissions */}
                <Section title="Bot Permissions" icon={<Shield size={16} />} badge={permBits !== null ? Object.entries(PERM_FLAGS).filter(([, { bit }]) => !hasPerm(bit)).length === 0 ? "All OK" : `${Object.entries(PERM_FLAGS).filter(([, { bit }]) => !hasPerm(bit)).length} missing` : "?"}>
                  {permBits !== null ? (
                    <div className="space-y-0.5 pt-2">
                      {Object.entries(PERM_FLAGS).map(([name, { bit, features }]) => (
                        <PermRow key={name} name={name} has={hasPerm(bit)} features={features} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm py-2">Could not fetch bot permissions from Discord API</div>
                  )}
                </Section>

                {/* 4. Quick Stats */}
                <Section title="Quick Stats" icon={<Zap size={16} />}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { label: "Members", value: d.stats.members },
                      { label: "Timers", value: d.stats.timers },
                      { label: "Ongoing Sessions", value: d.stats.ongoing_sessions },
                      { label: "Active Rooms", value: d.stats.active_rooms },
                      { label: "Open Tickets", value: d.stats.open_tickets },
                      { label: "Active Stickies", value: d.stats.active_stickies },
                      { label: "Role Menus", value: d.stats.role_menus },
                      { label: "Tracked Channels", value: d.stats.tracked_channels },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-700/30 rounded px-3 py-2 text-center">
                        <div className="text-lg font-semibold text-gray-100">{s.value?.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* 5. Channels */}
                <Section title="Configured Channels" icon={<Eye size={16} />}>
                  <div className="pt-2 space-y-1">
                    {([
                      ["Event Log", d.channels.event_log_channel],
                      ["Mod Log", d.channels.mod_log_channel],
                      ["Alert", d.channels.alert_channel],
                      ["Greeting", d.channels.greeting_channel],
                      ["Pomodoro", d.channels.pomodoro_channel],
                      ["Rank Announcements", d.channels.rank_channel],
                      ["Private Rooms Category", d.channels.renting_category],
                      ["LionGotchi Drops", d.channels.lg_drop_channel],
                      ["Accountability Category", d.channels.accountability_category],
                      ["Accountability Lobby", d.channels.accountability_lobby],
                      ["Schedule Lobby", d.channels.schedule_lobby],
                      ["Schedule Room", d.channels.schedule_room],
                    ] as [string, string | null][]).map(([label, id]) => (
                      <Row key={label} label={label} value={<IdVal id={id} name={chName(id)} prefix="#" />} />
                    ))}
                    {d.channels.tracked?.length > 0 && (
                      <Row label={`Tracked Voice (${d.channels.tracked.length})`} value={<IdList ids={d.channels.tracked.map((c: any) => c.channelid)} names={channelMap} prefix="#" />} />
                    )}
                    {d.channels.untracked_text?.length > 0 && (
                      <Row label={`Untracked Text (${d.channels.untracked_text.length})`} value={<IdList ids={d.channels.untracked_text} names={channelMap} prefix="#" />} />
                    )}
                    {d.channels.untracked_voice?.length > 0 && (
                      <Row label={`Untracked Voice (${d.channels.untracked_voice.length})`} value={<IdList ids={d.channels.untracked_voice} names={channelMap} prefix="#" />} />
                    )}
                    {d.channels.video?.length > 0 && (
                      <Row label={`Video Channels (${d.channels.video.length})`} value={<IdList ids={d.channels.video} names={channelMap} prefix="#" />} />
                    )}
                    {d.channels.tasklist?.length > 0 && (
                      <Row label={`Tasklist Channels (${d.channels.tasklist.length})`} value={<IdList ids={d.channels.tasklist} names={channelMap} prefix="#" />} />
                    )}
                    {d.channels.workout?.length > 0 && (
                      <Row label={`Workout Channels (${d.channels.workout.length})`} value={<IdList ids={d.channels.workout} names={channelMap} prefix="#" />} />
                    )}
                    {d.channels.schedule_extra?.length > 0 && (
                      <Row label={`Schedule Extra (${d.channels.schedule_extra.length})`} value={<IdList ids={d.channels.schedule_extra} names={channelMap} prefix="#" />} />
                    )}
                  </div>
                </Section>

                {/* 6. Roles */}
                <Section title="Configured Roles" icon={<Shield size={16} />}>
                  <div className="pt-2 space-y-1">
                    {([
                      ["Admin Role", d.roles.admin_role],
                      ["Mod Role", d.roles.mod_role],
                      ["Study Ban Role", d.roles.studyban_role],
                      ["Renting Role", d.roles.renting_role],
                      ["LionGotchi Activity", d.roles.lg_activity_role],
                      ["Focus Role", d.roles.focus_role],
                      ["Schedule Blacklist", d.roles.schedule_blacklist_role],
                    ] as [string, string | null][]).map(([label, id]) => (
                      <Row key={label} label={label} value={<IdVal id={id} name={rlName(id)} prefix="@" />} />
                    ))}
                    {d.roles.autoroles?.length > 0 && <Row label={`Auto-Roles (${d.roles.autoroles.length})`} value={<IdList ids={d.roles.autoroles} names={roleMap} prefix="@" />} />}
                    {d.roles.bot_autoroles?.length > 0 && <Row label={`Bot Auto-Roles (${d.roles.bot_autoroles.length})`} value={<IdList ids={d.roles.bot_autoroles} names={roleMap} prefix="@" />} />}
                    {d.roles.video_exempt?.length > 0 && <Row label={`Video Exempt (${d.roles.video_exempt.length})`} value={<IdList ids={d.roles.video_exempt} names={roleMap} prefix="@" />} />}
                    {d.roles.leaderboard_filter?.length > 0 && <Row label={`LB Filter (${d.roles.leaderboard_filter.length})`} value={<IdList ids={d.roles.leaderboard_filter} names={roleMap} prefix="@" />} />}
                    {d.roles.donator_roles?.length > 0 && <Row label={`Donator (${d.roles.donator_roles.length})`} value={<IdList ids={d.roles.donator_roles} names={roleMap} prefix="@" />} />}
                    {d.roles.unranked_roles?.length > 0 && <Row label={`Unranked (${d.roles.unranked_roles.length})`} value={<IdList ids={d.roles.unranked_roles} names={roleMap} prefix="@" />} />}
                  </div>
                </Section>

                {/* 7. Feature Toggles */}
                <Section title="Feature Toggles" icon={<Zap size={16} />}>
                  <div className="pt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                    {Object.entries(d.feature_toggles).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 py-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${val ? "bg-green-400" : key === "rank_type" ? "bg-gray-500" : "bg-gray-600"}`} />
                        <span className="text-sm text-gray-300">{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                        <span className="text-xs text-gray-500 ml-auto">{typeof val === "boolean" ? (val ? "ON" : "OFF") : val || "—"}</span>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* 8. Economy */}
                <Section title="Economy Settings" icon={<Coins size={16} />}>
                  <div className="pt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                    {Object.entries(d.economy).map(([key, val]) => (
                      <Row key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} value={val != null ? String(val) : null} />
                    ))}
                  </div>
                </Section>

                {/* 9. Ranks */}
                {(d.ranks.voice?.length > 0 || d.ranks.msg?.length > 0 || d.ranks.xp?.length > 0) && (
                  <Section title="Rank Configuration" icon={<Trophy size={16} />} badge={`${d.ranks.voice.length + d.ranks.msg.length + d.ranks.xp.length} tiers`}>
                    {["voice", "msg", "xp"].map(type => {
                      const ranks = d.ranks[type]
                      if (!ranks || ranks.length === 0) return null
                      return (
                        <div key={type} className="pt-2">
                          <div className="text-xs font-medium text-gray-400 uppercase mb-1">{type} Ranks ({ranks.length})</div>
                          <div className="space-y-1">
                            {ranks.map((r: any) => (
                              <div key={r.rankid} className="flex items-center gap-3 text-sm">
                                <IdVal id={r.roleid} name={rlName(r.roleid)} prefix="@" />
                                <span className="text-gray-400">req: {r.required.toLocaleString()}</span>
                                <span className="text-gray-400">reward: {r.reward}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </Section>
                )}

                {/* 10. Pomodoro */}
                {d.pomodoro.timers?.length > 0 && (
                  <Section title="Pomodoro Timers" icon={<Timer size={16} />} badge={d.pomodoro.timers.length}>
                    {d.pomodoro.timers.map((t: any) => (
                      <div key={t.channelid} className="pt-2 border-t border-gray-700/30 first:border-0 first:pt-1">
                        <Row label="Channel" value={<IdVal id={t.channelid} name={chName(t.channelid)} prefix="#" />} />
                        <Row label="Focus / Break" value={`${t.focus_length}m / ${t.break_length}m`} />
                        {t.notification_channelid && <Row label="Notification Channel" value={<IdVal id={t.notification_channelid} name={chName(t.notification_channelid)} prefix="#" />} />}
                        {t.manager_roleid && <Row label="Manager Role" value={<IdVal id={t.manager_roleid} name={rlName(t.manager_roleid)} prefix="@" />} />}
                        <Row label="Voice Alerts" value={t.voice_alerts ? "Yes" : "No"} />
                        <Row label="Auto-Restart" value={t.auto_restart ? "Yes" : "No"} />
                      </div>
                    ))}
                  </Section>
                )}

                {/* 11. Schedule */}
                {d.schedule && (
                  <Section title="Schedule Configuration" icon={<ListChecks size={16} />}>
                    <div className="pt-2">
                      <Row label="Lobby Channel" value={<IdVal id={d.schedule.lobby_channel} name={chName(d.schedule.lobby_channel)} prefix="#" />} />
                      <Row label="Room Channel" value={<IdVal id={d.schedule.room_channel} name={chName(d.schedule.room_channel)} prefix="#" />} />
                      <Row label="Cost" value={d.schedule.schedule_cost} />
                      <Row label="Reward" value={d.schedule.reward} />
                      <Row label="Bonus Reward" value={d.schedule.bonus_reward} />
                      <Row label="Min Attendance" value={d.schedule.min_attendance ? `${d.schedule.min_attendance} min` : null} />
                      <Row label="Blacklist Role" value={<IdVal id={d.schedule.blacklist_role} name={rlName(d.schedule.blacklist_role)} prefix="@" />} />
                      {d.schedule.extra_channels?.length > 0 && (
                        <Row label={`Extra Channels (${d.schedule.extra_channels.length})`} value={<IdList ids={d.schedule.extra_channels} names={channelMap} prefix="#" />} />
                      )}
                    </div>
                  </Section>
                )}

                {/* 12. Role Menus */}
                {d.role_menus?.length > 0 && (
                  <Section title="Role Menus" icon={<ListChecks size={16} />} badge={d.role_menus.length}>
                    {d.role_menus.map((m: any) => (
                      <div key={m.menuid} className="pt-2 border-t border-gray-700/30 first:border-0 first:pt-1">
                        <Row label="Menu" value={`${m.name} (#${m.menuid})`} />
                        <Row label="Channel" value={<IdVal id={m.channelid} name={chName(m.channelid)} prefix="#" />} />
                        {m.messageid && <Row label="Message ID" value={m.messageid} mono />}
                        <Row label="Type" value={m.menutype} />
                        <Row label="Roles" value={m.role_count} />
                        <Row label="Enabled" value={m.enabled ? "Yes" : "No"} />
                        {m.event_log && <Row label="Event Log" value="Enabled" />}
                      </div>
                    ))}
                  </Section>
                )}

                {/* 13. Autopost */}
                {(d.autopost.configs?.length > 0 || d.autopost.recent_history?.length > 0) && (
                  <Section title="Leaderboard Autopost" icon={<Trophy size={16} />} badge={d.autopost.configs?.length}>
                    {d.autopost.configs.map((c: any) => (
                      <div key={c.configid} className="pt-2 border-t border-gray-700/30 first:border-0 first:pt-1">
                        <Row label="Config" value={`${c.config_name} (#${c.configid})`} />
                        <Row label="Type / Freq" value={`${c.lb_type} / ${c.frequency}`} />
                        <Row label="Post Channel" value={<IdVal id={c.post_channel} name={chName(c.post_channel)} prefix="#" />} />
                        <Row label="Enabled" value={c.enabled ? "Yes" : "No"} />
                        {c.last_posted_at && <Row label="Last Posted" value={new Date(c.last_posted_at).toLocaleString()} />}
                      </div>
                    ))}
                    {d.autopost.recent_history?.length > 0 && (
                      <div className="pt-3">
                        <div className="text-xs font-medium text-gray-400 uppercase mb-2">Recent History</div>
                        {d.autopost.recent_history.map((h: any) => (
                          <div key={h.historyid} className={`text-sm py-1 ${h.status !== "success" ? "text-red-300" : "text-gray-300"}`}>
                            {new Date(h.posted_at).toLocaleString()} — {h.status}
                            {h.error_message && <span className="text-red-400 ml-1">({h.error_message})</span>}
                            <span className="text-gray-500 ml-2">roles +{h.roles_added}/-{h.roles_removed} coins:{h.coins_awarded} DMs:{h.dms_sent}/{h.dms_failed}f</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {d.autopost.pending_queue?.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-medium text-amber-400 uppercase mb-1">Pending/Failed Queue</div>
                        {d.autopost.pending_queue.map((q: any) => (
                          <Row key={q.queueid} label={q.action_type} value={`${q.status} — ${new Date(q.created_at).toLocaleString()}`} warn />
                        ))}
                      </div>
                    )}
                  </Section>
                )}

                {/* 14. Ambient Sounds & Sticky */}
                {(d.ambient_sounds.configs?.length > 0 || d.sticky_messages?.length > 0) && (
                  <Section title="Ambient Sounds & Sticky Messages" icon={<Volume2 size={16} />}>
                    {d.ambient_sounds.configs?.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">Ambient Sounds</div>
                        {d.ambient_sounds.configs.map((c: any) => (
                          <Row
                            key={c.bot_number}
                            label={`Bot ${c.bot_number}`}
                            value={`${c.sound_type || "none"} in ${chName(c.channelid) ? `#${chName(c.channelid)}` : c.channelid || "—"} (vol: ${c.volume}, ${c.status})`}
                            error={!!c.error_msg}
                          />
                        ))}
                        {d.ambient_sounds.configs.filter((c: any) => c.error_msg).map((c: any) => (
                          <Row key={`err-${c.bot_number}`} label={`Bot ${c.bot_number} Error`} value={c.error_msg} error />
                        ))}
                      </div>
                    )}
                    {d.ambient_sounds.bot_heartbeats?.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">SoundsBot Heartbeats</div>
                        {d.ambient_sounds.bot_heartbeats.map((h: any) => {
                          const ago = h.last_seen ? Math.round((Date.now() - new Date(h.last_seen).getTime()) / 1000) : null
                          return (
                            <Row
                              key={h.bot_number}
                              label={`Bot ${h.bot_number}${h.bot_username ? ` (${h.bot_username})` : ""}`}
                              value={ago !== null ? `${ago < 60 ? `${ago}s` : `${Math.round(ago / 60)}m`} ago (${h.guild_count} guilds)` : "Never seen"}
                              warn={ago !== null && ago > 30}
                            />
                          )
                        })}
                      </div>
                    )}
                    {d.sticky_messages?.length > 0 && (
                      <div className="pt-2 border-t border-gray-700/30">
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">Sticky Messages ({d.sticky_messages.length})</div>
                        {d.sticky_messages.map((sm: any) => (
                          <Row key={sm.stickyid} label={<IdVal id={sm.channelid} name={chName(sm.channelid)} prefix="#" /> as any} value={`${sm.enabled ? "Enabled" : "Disabled"} — every ${sm.interval_seconds}s`} />
                        ))}
                      </div>
                    )}
                  </Section>
                )}

                {/* 15. Webhooks */}
                {d.webhook_status?.length > 0 && (
                  <Section title="Webhook Status" icon={<Zap size={16} />} badge={d.webhook_status.length} defaultOpen={false}>
                    {d.webhook_status.map((w: any) => (
                      <Row key={w.channelid} label={<IdVal id={w.channelid} name={chName(w.channelid)} prefix="#" /> as any} value={`Webhook ID: ${w.webhookid}`} mono />
                    ))}
                  </Section>
                )}

                {/* 16. Ongoing Sessions & Recent Activity */}
                <Section title="Ongoing Voice Sessions" icon={<Clock size={16} />} badge={d.ongoing_sessions?.length || 0} defaultOpen={d.ongoing_sessions?.length > 0}>
                  {d.ongoing_sessions?.length > 0 ? (
                    <div className="pt-2 space-y-1 max-h-64 overflow-y-auto">
                      {d.ongoing_sessions.map((s: any, i: number) => {
                        const hours = s.start_time ? Math.round((Date.now() - new Date(s.start_time).getTime()) / 3600000 * 10) / 10 : 0
                        const stuck = hours > 24
                        return (
                          <Row
                            key={i}
                            label={`User ${s.userid}`}
                            value={`${chName(s.channelid) ? `#${chName(s.channelid)}` : s.channelid || "?"} — ${hours}h — ${s.coins_earned} coins${stuck ? " [STUCK?]" : ""}`}
                            warn={stuck}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm py-2">No ongoing voice sessions</div>
                  )}
                </Section>

                <Section title="Recent Activity" icon={<ListChecks size={16} />} defaultOpen={false}>
                  {d.recent_activity.tickets?.length > 0 && (
                    <div className="pt-2">
                      <div className="text-xs font-medium text-gray-400 uppercase mb-1">Recent Tickets</div>
                      {d.recent_activity.tickets.map((t: any) => (
                        <div key={t.ticketid} className="text-sm text-gray-300 py-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${t.ticket_state === "OPEN" ? "bg-red-900/40 text-red-300" : "bg-gray-700 text-gray-400"}`}>{t.ticket_state}</span>
                          {" "}{t.ticket_type} — target: <span className="font-mono text-xs">{t.targetid}</span> by <span className="font-mono text-xs">{t.moderator_id}</span>
                          {t.auto && " [auto]"}
                          <span className="text-gray-500 ml-2">{t.created_at ? new Date(t.created_at).toLocaleString() : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {d.recent_activity.admin_transactions?.length > 0 && (
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="text-xs font-medium text-gray-400 uppercase mb-1">Recent Admin Coin Actions</div>
                      {d.recent_activity.admin_transactions.map((t: any) => (
                        <div key={t.transactionid} className="text-sm text-gray-300 py-0.5">
                          {t.transactiontype} — {t.amount > 0 ? "+" : ""}{t.amount} coins by <span className="font-mono text-xs">{t.actorid}</span>
                          <span className="text-gray-500 ml-2">{t.created_at ? new Date(t.created_at).toLocaleString() : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {d.recent_activity.room_admin_log?.length > 0 && (
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="text-xs font-medium text-gray-400 uppercase mb-1">Recent Room Admin Actions</div>
                      {d.recent_activity.room_admin_log.map((l: any) => (
                        <div key={l.logid} className="text-sm text-gray-300 py-0.5">
                          {l.action} in <span className="font-mono text-xs">{chName(l.channelid) ? `#${chName(l.channelid)}` : l.channelid}</span> by <span className="font-mono text-xs">{l.adminid}</span>
                          <span className="text-gray-500 ml-2">{new Date(l.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {d.recent_activity.manual_session_log?.length > 0 && (
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="text-xs font-medium text-gray-400 uppercase mb-1">Recent Manual Session Edits</div>
                      {d.recent_activity.manual_session_log.map((l: any) => (
                        <div key={l.id} className="text-sm text-gray-300 py-0.5">
                          {l.action} — user <span className="font-mono text-xs">{l.userid}</span>
                          {l.old_duration != null && l.new_duration != null && <span className="text-gray-400"> ({Math.round(l.old_duration / 60)}m → {Math.round(l.new_duration / 60)}m)</span>}
                          {l.reason && <span className="text-gray-400"> "{l.reason}"</span>}
                          <span className="text-gray-500 ml-2">{new Date(l.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!d.recent_activity.tickets?.length && !d.recent_activity.admin_transactions?.length && !d.recent_activity.room_admin_log?.length && !d.recent_activity.manual_session_log?.length) && (
                    <div className="text-gray-500 text-sm py-2">No recent activity</div>
                  )}
                </Section>

              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">Failed to load debug info</div>
            )}
          </DashboardShell>
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
