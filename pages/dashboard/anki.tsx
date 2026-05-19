// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: /dashboard/anki — manage paired Anki addon devices
//          and the user's "home guild" for Anki review credit.
//
//          Stays out of the main DashboardNav sidebar in Stage 1
//          (the link is wired up at Stage 3 when the addon
//          launches publicly). The page is reachable directly
//          from /anki/connect's "Change home guild" link and from
//          inside the addon's settings panel.
//
//          Visual style follows the gift-claim shell — centered
//          card, no marketing gradients, single source of truth
//          per row.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import Head from "next/head"
import {
  Laptop, Server, RotateCcw, AlertTriangle, Check,
  ChevronDown, Download, X, Pencil,
} from "lucide-react"

interface DeviceRow {
  device_id: string
  device_name: string
  addon_version: string | null
  os_platform: string | null
  anki_version: string | null
  created_at: string
  last_seen_at: string
  revoked_at: string | null
  revoked_reason: string | null
}

interface HomeGuildOption {
  guild_id: string
  name: string
  icon_hash: string | null
  member_count: number | null
}

interface HomeGuildState {
  current: { guild_id: string; name: string } | null
  is_default_fallback: boolean
  options: HomeGuildOption[]
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000) return "just now"
  const min = Math.floor(ms / 60_000)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`
  const yr = Math.floor(mo / 12)
  return `${yr} year${yr === 1 ? "" : "s"} ago`
}

export default function AnkiDashboardPage() {
  return (
    <AdminGuard>
      <Layout
        SEO={{
          title: "Anki Devices | LionBot",
          description: "Manage Anki addons paired to your LionBot account.",
        }}
      >
        <Head>
          <title>Anki Devices | LionBot</title>
        </Head>
        <div className="flex flex-col lg:flex-row min-h-screen bg-background">
          <DashboardNav />
          <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
            <PageInner />
          </main>
        </div>
      </Layout>
    </AdminGuard>
  )
}

function PageInner() {
  const { status: sessionStatus } = useSession()

  const [devices, setDevices] = useState<DeviceRow[] | null>(null)
  const [homeGuild, setHomeGuild] = useState<HomeGuildState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const loadAll = useCallback(async () => {
    setLoadError(null)
    try {
      const [dRes, hRes] = await Promise.all([
        fetch("/api/anki/devices"),
        fetch("/api/anki/home-guild"),
      ])
      if (!dRes.ok) throw new Error("Failed to load devices")
      if (!hRes.ok) throw new Error("Failed to load home guild")
      const dData = await dRes.json()
      const hData = await hRes.json()
      setDevices(dData.devices)
      setHomeGuild(hData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load"
      setLoadError(msg)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadAll()
    }
  }, [sessionStatus, loadAll])

  async function onRevoke(deviceId: string) {
    if (!confirm("Sign out this device? The addon will need to re-pair.")) return
    setBusy(deviceId)
    try {
      const res = await fetch("/api/anki/devices?action=revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.message || "Couldn't sign out that device")
      } else {
        await loadAll()
      }
    } finally {
      setBusy(null)
    }
  }

  async function onRevokeAll() {
    if (!confirm("Sign out ALL of your Anki devices? They'll all need to re-pair.")) return
    setBusy("all")
    try {
      const res = await fetch("/api/anki/devices?action=revoke_all", {
        method: "POST",
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.message || "Couldn't sign out devices")
      } else {
        await loadAll()
      }
    } finally {
      setBusy(null)
    }
  }

  async function onRename(deviceId: string, currentName: string) {
    const next = prompt("Rename this device", currentName)
    if (!next || next === currentName) return
    setBusy(deviceId)
    try {
      const res = await fetch("/api/anki/devices?action=rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId, name: next.slice(0, 64) }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.message || "Couldn't rename")
      } else {
        await loadAll()
      }
    } finally {
      setBusy(null)
    }
  }

  async function onPickGuild(guildId: string | null) {
    setBusy("home_guild")
    try {
      const res = await fetch("/api/anki/home-guild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild_id: guildId }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.message || "Couldn't change home server")
      } else {
        setPickerOpen(false)
        await loadAll()
      }
    } finally {
      setBusy(null)
    }
  }

  if (sessionStatus === "loading") return <div className="py-20 text-center text-muted-foreground">Loading…</div>
  if (sessionStatus !== "authenticated") return null // AdminGuard handles redirect

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Anki devices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Anki addons paired to your LionBot account.
          </p>
        </div>
      </header>

      {loadError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
          <div className="text-sm">
            <p className="text-foreground font-medium">Couldn&apos;t load some data</p>
            <p className="text-muted-foreground">{loadError}</p>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-medium text-foreground flex items-center gap-2">
            <Server size={16} /> Home server
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Anki reviews credit to this server&apos;s leaderboard and member ranks.
          </p>
        </div>
        <div className="p-5">
          {!homeGuild ? (
            <div className="h-10 rounded-md bg-secondary/30 animate-pulse" />
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <span className="text-muted-foreground">Currently: </span>
                <span className="text-foreground font-medium">
                  {homeGuild.current?.name || "LionBot Support Server"}
                </span>
                {homeGuild.is_default_fallback && (
                  <span className="ml-2 text-xs text-muted-foreground italic">(default)</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
              >
                Change <ChevronDown size={14} />
              </button>
            </div>
          )}

          {pickerOpen && homeGuild && (
            <div className="mt-4 rounded-lg border border-border divide-y divide-border max-h-72 overflow-y-auto">
              {homeGuild.options.map((opt) => {
                const isCurrent = homeGuild.current?.guild_id === opt.guild_id
                return (
                  <button
                    key={opt.guild_id}
                    type="button"
                    disabled={busy === "home_guild" || isCurrent}
                    onClick={() => onPickGuild(opt.guild_id)}
                    className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-secondary/30 disabled:opacity-60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {opt.icon_hash ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${opt.guild_id}/${opt.icon_hash}.png?size=64`}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                          {opt.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{opt.name}</p>
                        {opt.member_count !== null && (
                          <p className="text-xs text-muted-foreground">
                            {opt.member_count.toLocaleString()} members
                          </p>
                        )}
                      </div>
                    </div>
                    {isCurrent && <Check size={16} className="text-emerald-500" />}
                  </button>
                )
              })}
              {homeGuild.options.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                  No eligible servers found. Invite LionBot to a server to make it
                  selectable here.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground flex items-center gap-2">
            <Laptop size={16} /> Connected devices
          </h2>
          {devices && devices.some((d) => !d.revoked_at) && (
            <button
              type="button"
              disabled={busy === "all"}
              onClick={onRevokeAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2.5 py-1 text-xs text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              <RotateCcw size={12} /> Sign out everywhere
            </button>
          )}
        </div>
        <div className="divide-y divide-border">
          {!devices ? (
            <div className="p-5 space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-12 rounded-md bg-secondary/30 animate-pulse" />
              ))}
            </div>
          ) : devices.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No Anki devices paired yet. Install the addon to get started.
            </div>
          ) : (
            devices.map((d) => (
              <div key={d.device_id} className="p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">
                      {d.device_name}
                    </span>
                    {d.revoked_at && (
                      <span className="text-[10px] uppercase tracking-wider rounded-sm bg-amber-500/15 text-amber-500 px-1.5 py-0.5">
                        Revoked
                      </span>
                    )}
                    {!d.revoked_at && d.os_platform && (
                      <span className="text-[10px] uppercase tracking-wider rounded-sm bg-secondary/60 text-muted-foreground px-1.5 py-0.5">
                        {d.os_platform}
                      </span>
                    )}
                    {!d.revoked_at && d.addon_version && (
                      <span className="text-[10px] uppercase tracking-wider rounded-sm bg-secondary/60 text-muted-foreground px-1.5 py-0.5">
                        v{d.addon_version}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paired {formatRelative(d.created_at)}
                    {d.revoked_at ? (
                      <>
                        {" "}
                        · Revoked {formatRelative(d.revoked_at)}
                        {d.revoked_reason && (
                          <span className="italic"> ({d.revoked_reason})</span>
                        )}
                      </>
                    ) : (
                      <>
                        {" "}
                        · Last seen {formatRelative(d.last_seen_at)}
                      </>
                    )}
                  </p>
                </div>
                {!d.revoked_at && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onRename(d.device_id, d.device_name)}
                      disabled={busy === d.device_id}
                      title="Rename"
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRevoke(d.device_id)}
                      disabled={busy === d.device_id}
                      title="Sign out this device"
                      className="p-2 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Don&apos;t have the addon yet?
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Install LionGotchi for Anki to start earning rewards from your reviews.
          </p>
        </div>
        <a
          href="/anki/download"
          className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download size={14} /> Download
        </a>
      </section>
    </div>
  )
}
