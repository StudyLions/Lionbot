// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Sticky messages dashboard page (premium feature)
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  SectionCard, SettingRow, Toggle, NumberInput, TextInput,
  ChannelSelect, SaveBar, PageHeader, toast,
  ConfirmModal, EmptyState, Badge,
} from "@/components/dashboard/ui"
import PremiumGate from "@/components/dashboard/PremiumGate"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useCallback, useMemo } from "react"
import {
  Pin, Plus, Trash2, Pencil, X, Eye,
  MessageSquare, Clock, Hash, Megaphone, BookOpen, Info,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface StickyMessage {
  stickyid: number
  guildid: string
  channelid: string
  title: string | null
  content: string
  color: number | null
  image_url: string | null
  footer_text: string | null
  interval_seconds: number
  last_posted_id: string | null
  enabled: boolean
  created_by: string | null
  created_at: string | null
}

interface PageData {
  stickies: StickyMessage[]
  isPremium: boolean
  limit: number
}

interface StickyForm {
  channelid: string
  title: string
  content: string
  color: number
  image_url: string
  footer_text: string
  interval_seconds: number
  enabled: boolean
}

function colorIntToHex(n: number | null): string {
  if (!n) return "#3498db"
  return "#" + n.toString(16).padStart(6, "0")
}

function hexToColorInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16)
}

function makeDefaultForm(): StickyForm {
  return {
    channelid: "",
    title: "",
    content: "",
    color: 3447003,
    image_url: "",
    footer_text: "",
    interval_seconds: 60,
    enabled: true,
  }
}

function formFromSticky(s: StickyMessage): StickyForm {
  return {
    channelid: s.channelid,
    title: s.title ?? "",
    content: s.content,
    color: s.color ?? 3447003,
    image_url: s.image_url ?? "",
    footer_text: s.footer_text ?? "",
    interval_seconds: s.interval_seconds,
    enabled: s.enabled,
  }
}

function EmbedPreview({ form }: { form: StickyForm }) {
  const borderColor = colorIntToHex(form.color)
  const hasContent = form.title || form.content

  if (!hasContent) {
    return (
      <div className="rounded-lg bg-gray-800/30 border border-gray-700/40 p-6 text-center">
        <Eye size={20} className="mx-auto text-gray-600 mb-2" />
        <p className="text-xs text-gray-500">Fill in the title or content to see a preview</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-gray-800/40 border border-gray-700/40 p-4">
      <p className="text-[11px] font-medium text-gray-500 mb-3 uppercase tracking-wider">
        Preview — How it looks in Discord
      </p>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
          <Pin size={14} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">StudyLion</span>
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">BOT</span>
          </div>
          <div
            className="rounded-md overflow-hidden border-l-4 bg-[#2b2d31] max-w-md"
            style={{ borderLeftColor: borderColor }}
          >
            <div className="p-3 space-y-1.5">
              <p className="text-[11px] text-gray-400 font-medium">
                📌 Sticky Message
              </p>
              {form.title && (
                <p className="text-sm font-semibold text-white">{form.title}</p>
              )}
              {form.content && (
                <p className="text-[13px] text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                  {form.content.length > 500 ? form.content.slice(0, 500) + "..." : form.content}
                </p>
              )}
              {form.image_url && (
                <div className="mt-2 rounded bg-gray-700/40 h-32 flex items-center justify-center text-xs text-gray-500">
                  Image: {form.image_url.length > 40 ? form.image_url.slice(0, 40) + "..." : form.image_url}
                </div>
              )}
              {form.footer_text && (
                <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-700/30 mt-2">
                  {form.footer_text}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StickyEditor({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  isNew,
  serverId,
}: {
  form: StickyForm
  onChange: (f: StickyForm) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  isNew: boolean
  serverId: string
}) {
  const update = <K extends keyof StickyForm>(key: K, val: StickyForm[K]) => {
    onChange({ ...form, [key]: val })
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title={isNew ? "New Sticky Message" : "Edit Sticky Message"}
        icon={<Pin size={16} />}
        defaultOpen
      >
        <div className="space-y-4">
          <SettingRow label="Channel" description="The text channel where this sticky will appear">
            <ChannelSelect
              guildId={serverId}
              value={form.channelid}
              onChange={(v) => update("channelid", v)}
              channelTypes={[0]}
            />
          </SettingRow>

          <SettingRow label="Title" description="Optional bold heading at the top of the embed (max 256 chars)">
            <TextInput
              value={form.title}
              onChange={(v) => update("title", v)}
              maxLength={256}
              placeholder="e.g. Server Rules"
            />
          </SettingRow>

          <SettingRow label="Content" description="The main message body (max 2000 chars)">
            <TextInput
              value={form.content}
              onChange={(v) => update("content", v)}
              maxLength={2000}
              placeholder="Write your sticky message content here..."
              multiline
              rows={6}
            />
          </SettingRow>

          <SettingRow label="Embed Color" description="The colored bar on the left side of the embed">
            <input
              type="color"
              value={colorIntToHex(form.color)}
              onChange={(e) => update("color", hexToColorInt(e.target.value))}
              className="w-10 h-8 rounded cursor-pointer border border-gray-700"
            />
          </SettingRow>

          <SettingRow label="Image URL" description="Optional image displayed in the embed">
            <TextInput
              value={form.image_url}
              onChange={(v) => update("image_url", v)}
              placeholder="https://example.com/image.png"
            />
          </SettingRow>

          <SettingRow label="Footer Text" description="Small text at the bottom of the embed (max 256 chars)">
            <TextInput
              value={form.footer_text}
              onChange={(v) => update("footer_text", v)}
              maxLength={256}
              placeholder="e.g. Last updated March 2026"
            />
          </SettingRow>

          <SettingRow
            label="Repost Interval"
            description="Minimum seconds between reposts when new messages arrive (30-300)"
          >
            <NumberInput
              value={form.interval_seconds}
              onChange={(v) => update("interval_seconds", v ?? 60)}
              min={30}
              max={300}
              unit="seconds"
            />
          </SettingRow>

          <SettingRow label="Enabled" description="Toggle this sticky on or off">
            <Toggle
              checked={form.enabled}
              onChange={(v) => update("enabled", v)}
            />
          </SettingRow>
        </div>
      </SectionCard>

      <EmbedPreview form={form} />

      <SaveBar
        show
        onSave={onSave}
        onReset={onCancel}
        saving={saving}
        label={isNew ? "Create Sticky" : "Save Changes"}
      />
    </div>
  )
}

export default function StickyMessagesPage() {
  const router = useRouter()
  const serverId = router.query.id as string
  const apiUrl = serverId ? `/api/dashboard/servers/${serverId}/sticky-messages` : null

  const { data, isLoading } = useDashboard<PageData>(apiUrl)

  const [editing, setEditing] = useState<{ form: StickyForm; stickyid: number | null; isNew: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StickyMessage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const stickies = data?.stickies ?? []
  const isPremium = data?.isPremium ?? false
  const limit = data?.limit ?? 5

  const startNew = useCallback(() => {
    setEditing({ form: makeDefaultForm(), stickyid: null, isNew: true })
  }, [])

  const startEdit = useCallback((s: StickyMessage) => {
    setEditing({ form: formFromSticky(s), stickyid: s.stickyid, isNew: false })
  }, [])

  const cancelEdit = useCallback(() => setEditing(null), [])

  const handleSave = useCallback(async () => {
    if (!editing || !apiUrl) return
    setSaving(true)
    try {
      if (!editing.form.content.trim()) {
        toast.error("Content is required")
        setSaving(false)
        return
      }
      if (!editing.form.channelid) {
        toast.error("Please select a channel")
        setSaving(false)
        return
      }

      if (editing.isNew) {
        await dashboardMutate("POST", apiUrl, editing.form)
        toast.success("Sticky message created")
      } else {
        await dashboardMutate("PATCH", apiUrl, {
          stickyid: editing.stickyid,
          ...editing.form,
        })
        toast.success("Sticky message updated")
      }
      setEditing(null)
      invalidate(apiUrl)
    } catch (err: any) {
      toast.error(err.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }, [editing, apiUrl])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !apiUrl) return
    setDeleting(true)
    try {
      await dashboardMutate("DELETE", apiUrl, { stickyid: deleteTarget.stickyid })
      toast.success("Sticky message deleted")
      setDeleteTarget(null)
      invalidate(apiUrl)
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, apiUrl])

  const handleToggle = useCallback(async (s: StickyMessage, enabled: boolean) => {
    if (!apiUrl) return
    try {
      await dashboardMutate("PATCH", apiUrl, { stickyid: s.stickyid, enabled })
      invalidate(apiUrl)
      toast.success(enabled ? "Sticky enabled" : "Sticky disabled")
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }, [apiUrl])

  const pageContent = editing ? (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title={editing.isNew ? "New Sticky Message" : "Edit Sticky Message"}
        description="Configure a persistent message that stays at the bottom of a channel"
        actions={
          <button
            onClick={cancelEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} /> Cancel
          </button>
        }
      />
      <StickyEditor
        form={editing.form}
        onChange={(f) => setEditing({ ...editing, form: f })}
        onSave={handleSave}
        onCancel={cancelEdit}
        saving={saving}
        isNew={editing.isNew}
        serverId={serverId}
      />
    </main>
  ) : (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title="Sticky Messages"
        description="Keep important messages pinned to the bottom of channels. The bot automatically reposts them whenever someone sends a new message."
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-800/50 animate-pulse" />
          ))}
        </div>
      ) : !isPremium ? (
        <PremiumGate
          title="Sticky Messages"
          subtitle="Keep important announcements, rules, and links always visible at the bottom of any channel — automatically."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {[
              { icon: <Pin size={18} />, label: "Always Visible", desc: "Your message stays as the last message in the channel, always" },
              { icon: <MessageSquare size={18} />, label: "Auto-Repost", desc: "Bot detects new messages and reposts the sticky with a smart cooldown" },
              { icon: <Clock size={18} />, label: "Configurable Interval", desc: "Set how often the sticky reposts — from 30 seconds to 5 minutes" },
              { icon: <Megaphone size={18} />, label: "Rich Embeds", desc: "Custom title, color, images, and footer text — not just plain text" },
              { icon: <BookOpen size={18} />, label: "Up to 5 Per Server", desc: "Rules, announcements, links, events, and more — each in its own channel" },
              { icon: <Eye size={18} />, label: "Live Preview", desc: "See exactly how your sticky will look in Discord before saving" },
            ].map((f) => (
              <div
                key={f.label}
                className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/20 transition-colors"
              >
                <div className="text-amber-400/80 mb-2">{f.icon}</div>
                <p className="text-sm font-semibold text-gray-200">{f.label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-gray-800/40 border border-gray-700/40 p-4 sm:p-5">
            <p className="text-[11px] font-medium text-gray-500 mb-3 uppercase tracking-wider">
              Preview — What it looks like in Discord
            </p>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <Pin size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">StudyLion</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">BOT</span>
                </div>
                <div className="rounded-md overflow-hidden border-l-4 border-l-amber-500 bg-[#2b2d31] max-w-md">
                  <div className="p-3 space-y-1.5">
                    <p className="text-[11px] text-gray-400 font-medium">📌 Sticky Message</p>
                    <p className="text-sm font-semibold text-white">Server Rules</p>
                    <p className="text-[13px] text-gray-300 leading-relaxed">
                      1. Be respectful to all members{"\n"}
                      2. No spam or self-promotion{"\n"}
                      3. Use channels for their intended purpose{"\n"}
                      4. Have fun studying! 📚
                    </p>
                    <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-700/30 mt-2">
                      Updated automatically by StudyLion
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PremiumGate>
      ) : stickies.length === 0 ? (
        <EmptyState
          icon={<Pin size={32} />}
          title="No Sticky Messages Yet"
          description="Create your first sticky message to keep important information always visible at the bottom of a channel."
          action={
            <button
              onClick={startNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} /> Create Sticky
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {stickies.length}/{limit} sticky messages
            </div>
            {stickies.length < limit && (
              <button
                onClick={startNew}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary rounded-md text-sm hover:bg-primary/30 transition-colors"
              >
                <Plus size={14} /> New Sticky
              </button>
            )}
          </div>

          {stickies.map((s) => (
            <div
              key={s.stickyid}
              className="rounded-lg border border-gray-700/50 bg-gray-800/40 overflow-hidden"
            >
              <div className="flex items-start gap-4 p-4">
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ backgroundColor: colorIntToHex(s.color) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Hash size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-gray-300">
                      {s.channelid}
                    </span>
                    <Badge variant={s.enabled ? "success" : "default"}>
                      {s.enabled ? "Active" : "Disabled"}
                    </Badge>
                    <Badge variant="info">Every {s.interval_seconds}s</Badge>
                  </div>
                  {s.title && (
                    <p className="text-sm font-semibold text-white mt-1">{s.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {s.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Toggle
                    checked={s.enabled}
                    onChange={(v) => handleToggle(s, v)}
                    silent
                  />
                  <button
                    onClick={() => startEdit(s)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Sticky Message"
        message={`Are you sure you want to delete the sticky message${deleteTarget?.title ? ` "${deleteTarget.title}"` : ""}? The bot will stop reposting it immediately.`}
        variant="danger"
      />

      {/* Info box */}
      {isPremium && stickies.length > 0 && (
        <div className="mt-6 rounded-lg bg-gray-800/30 border border-gray-700/30 p-4 flex items-start gap-3">
          <Info size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-medium text-gray-400 mb-1">How it works</p>
            <p>
              When someone sends a message in a channel with a sticky, the bot deletes the old sticky
              and reposts it — keeping it as the last message. The interval setting controls how often
              it can repost (to avoid rate limits). Changes made here take effect within 5 minutes.
            </p>
          </div>
        </div>
      )}
    </main>
  )

  return (
    <Layout SEO={{ title: "Sticky Messages", description: "Configure persistent sticky messages for your channels" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-6xl mx-auto flex gap-8">
              <ServerNav serverId={serverId} serverName="..." isAdmin isMod />
              {pageContent}
            </div>
          </div>
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
