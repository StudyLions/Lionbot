// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Owner campaign desk with editable letters, audience review,
//          previews, explicit launch confirmation, and delivery controls.
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react"
import type { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { DashboardShell, PageHeader } from "@/components/dashboard/ui"
import { DEFAULT_FUNDRAISER_CONTENT, CampaignContent } from "@/utils/email/campaigns/content"
import { Mail, Plus, Save, Eye, Send, Pause, Play, X, Users, CheckCircle2, AlertCircle, Monitor, Smartphone, RefreshCw } from "lucide-react"

type Counts = Record<"total" | "pending" | "sending" | "sent" | "failed" | "skipped" | "unknown", number>
type Campaign = {
  id: string; name: string; subject?: string; status: string; content?: CampaignContent;
  createdAt: string; updatedAt: string; counts: Counts; lastError?: string | null; revision: string
}
type Recipient = { id: string; status: string; error?: string; attempts: number; maskedEmail?: string; providerId?: string; deliveryStatus?: string }
type Overview = {
  campaigns: Campaign[];
  readiness: { ready: boolean; issues: string[]; sendEnabled: boolean };
  audience: { counts: Record<"total" | "eligible" | "unverified" | "unconsented" | "unsubscribed" | "invalid" | "suppressed", number> }
}

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/email/campaigns${path}`, {
    method, credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "This request could not be completed. Please try again.")
  return data
}

const inputStyle = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/60 disabled:opacity-60"
const buttonStyle = "inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
const freshContent = () => ({ ...DEFAULT_FUNDRAISER_CONTENT, body: [...DEFAULT_FUNDRAISER_CONTENT.body] })

export default function EmailCampaignsPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [name, setName] = useState("A new home for Leo")
  const [content, setContent] = useState<CampaignContent>(freshContent)
  const [bodyText, setBodyText] = useState(DEFAULT_FUNDRAISER_CONTENT.body.join("\n\n"))
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [html, setHtml] = useState("")
  const [plainText, setPlainText] = useState("")
  const [previewError, setPreviewError] = useState("")
  const [previewBusy, setPreviewBusy] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile" | "text">("desktop")
  const [launchReview, setLaunchReview] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [cancelReview, setCancelReview] = useState(false)
  const [discardReview, setDiscardReview] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const selection = useRef<string | null>(null)
  const previewSequence = useRef(0)
  const editable = !campaign || campaign.status === "draft"

  const refresh = useCallback(async () => {
    try { setOverview(await request<Overview>("")) }
    catch (e) { setError(e.message) }
    finally { setLoaded(true) }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (!campaign || !["queued", "sending", "paused"].includes(campaign.status)) return
    const id = campaign.id
    const timer = setInterval(async () => {
      try {
        const data = await request<{ campaign: Campaign; recipients: Recipient[] }>(`/${id}`)
        if (selection.current === id) { setCampaign(data.campaign); setRecipients(data.recipients || []) }
        await refresh()
      } catch (e) { setError(e.message) }
    }, 15000)
    return () => clearInterval(timer)
  }, [campaign?.id, campaign?.status, refresh])

  async function preview(value = content) {
    const sequence = ++previewSequence.current
    setPreviewBusy(true); setPreviewError("")
    try {
      const result = await request<{ html: string; text: string }>("/preview", "POST", { content: value })
      if (sequence === previewSequence.current) { setHtml(result.html); setPlainText(result.text) }
    } catch (e) { if (sequence === previewSequence.current) setPreviewError(e.message) }
    finally { if (sequence === previewSequence.current) setPreviewBusy(false) }
  }

  // Render the initial draft only after the owner-only endpoint grants access.
  useEffect(() => { if (overview && !html) preview() }, [!!overview])

  function change<K extends keyof CampaignContent>(key: K, value: CampaignContent[K]) {
    setContent(previous => ({ ...previous, [key]: value })); setDirty(true); setLaunchReview(false)
  }

  async function selectCampaign(id: string) {
    if (dirty || busy) return
    setBusy(true); setError(""); setNotice(""); setLaunchReview(false); setCancelReview(false)
    selection.current = id
    try {
      const result = await request<{ campaign: Campaign; recipients: Recipient[] }>(`/${id}`)
      setRecipients(result.recipients || [])
      setCampaign(result.campaign); setName(result.campaign.name)
      setContent(result.campaign.content!); setBodyText(result.campaign.content!.body.join("\n\n"))
      await preview(result.campaign.content!)
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  function newDraft() {
    if (dirty || busy) return
    selection.current = null; setCampaign(null); setRecipients([]); setName("A new home for Leo")
    const value = freshContent(); setContent(value); setBodyText(value.body.join("\n\n"))
    setLaunchReview(false); setCancelReview(false); setNotice(""); setError(""); preview(value)
  }

  async function save() {
    setBusy(true); setError(""); setNotice("")
    try {
      const result = await request<{ campaign: Campaign }>(campaign ? `/${campaign.id}` : "", campaign ? "PATCH" : "POST", { name, content, revision: campaign?.revision })
      selection.current = result.campaign.id; setCampaign(result.campaign); setDirty(false)
      const saved = result.campaign.content!
      setName(result.campaign.name); setContent(saved); setBodyText(saved.body.join("\n\n"))
      setNotice("Draft saved. No email has been sent."); await refresh(); await preview(saved)
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function discardEdits() {
    setBusy(true); setError("")
    try {
      const saved = campaign ? (await request<{ campaign: Campaign }>(`/${campaign.id}`)).campaign : null
      const value = saved?.content || freshContent()
      setCampaign(saved); setName(saved?.name || "A new home for Leo")
      setContent(value); setBodyText(value.body.join("\n\n")); setDirty(false); setDiscardReview(false)
      setLaunchReview(false); await preview(value); await refresh()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function action(actionName: string) {
    if (!campaign) return
    setBusy(true); setError(""); setNotice("")
    try {
      const result = await request<{ campaign: Campaign; message?: string }>(`/${campaign.id}/action`, "POST", { action: actionName, confirmSubject: confirmation, revision: campaign.revision, recipientCount: overview?.audience.counts.eligible })
      if (actionName !== "test") {
        selection.current = result.campaign.id; setCampaign(result.campaign)
        const detail = await request<{ recipients: Recipient[] }>(`/${result.campaign.id}`)
        setRecipients(detail.recipients || [])
      }
      setLaunchReview(false); setCancelReview(false); setConfirmation("")
      setNotice(result.message || "Campaign updated."); await refresh()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  return <Layout SEO={{ title: "Email campaigns — LionBot", description: "The LionBot community email desk." }}>
    <AdminGuard><DashboardShell nav={<DashboardNav />}>
      <PageHeader title="Community letters" description="A personal note from Leo’s home to your community."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Email campaigns" }]} />
      {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm"><AlertCircle size={18} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
      {notice && <div role="status" className="mb-5 flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm"><CheckCircle2 size={18} className="shrink-0" />{notice}</div>}
      {!loaded && <div role="status" className="animate-pulse rounded-2xl border border-border bg-card p-8">Opening your email desk…</div>}
      {loaded && !overview && <button className={buttonStyle} onClick={refresh}><RefreshCw size={16} />Try again</button>}
      {overview && <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Email addresses on file" value={overview.audience.counts.total} description="Unique addresses, counted once." />
          <Metric label="Ready for community letters" value={overview.audience.counts.eligible} description="Verified, opted in, and not suppressed." />
          <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Sending</p><p className="mt-2 text-xl font-semibold">{overview.readiness.ready ? "Ready for your review" : "Setup pending"}</p><p className="mt-2 text-xs text-muted-foreground">Campaigns start only after you confirm a saved draft.</p></div>
        </div>
        <details className="rounded-xl border border-border bg-card/50 p-4 text-sm">
          <summary className="cursor-pointer font-medium">Audience &amp; sending setup</summary>
          <p className="mt-3 text-muted-foreground">Having an address on file does not automatically subscribe someone. People can opt in to community updates and fundraising in their dashboard settings. Their current preferences are checked again before each email.</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {([['unverified', 'Verification missing'], ['unconsented', 'Opt-in missing'], ['unsubscribed', 'Unsubscribed'], ['invalid', 'Invalid addresses'], ['suppressed', 'Delivery suppressed']] as const).map(([key, label]) => <div key={key}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{overview.audience.counts[key].toLocaleString()}</dd></div>)}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">An address can fail more than one check, so these counts can overlap.</p>
          {!!overview.readiness.issues.length && <ul className="mt-4 list-disc space-y-1 pl-5 text-amber-300">{overview.readiness.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
        </details>
        <div className="grid min-w-0 gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <button className={`${buttonStyle} w-full`} onClick={newDraft} disabled={dirty || busy}><Plus size={16} />New letter</button>
            <p className="px-1 text-xs uppercase tracking-wider text-muted-foreground">Saved campaigns</p>
            {overview.campaigns.length === 0 && <p className="px-1 text-sm text-muted-foreground">Your first letter starts here. Save it when you’re ready.</p>}
            <div className="max-h-[440px] space-y-2 overflow-y-auto">
              {overview.campaigns.map(item => <button key={item.id} onClick={() => selectCampaign(item.id)} disabled={dirty || busy} className={`w-full rounded-xl border p-3 text-left disabled:opacity-50 ${campaign?.id === item.id ? "border-amber-400/60 bg-amber-400/10" : "border-border bg-card hover:bg-accent"}`}><span className="block truncate text-sm font-medium">{item.name}</span><span className="mt-1 block text-xs capitalize text-muted-foreground">{item.status} · {item.counts.sent.toLocaleString()} sent</span></button>)}
            </div>
            {dirty && <div className="space-y-2"><p className="text-xs text-amber-300">Save your changes before opening another letter.</p><button className={`${buttonStyle} text-xs`} disabled={busy} onClick={() => setDiscardReview(true)}>Discard edits</button></div>}
          </aside>
          <main className="min-w-0 space-y-5">
            {discardReview && <div className="rounded-xl border border-amber-400/30 bg-card p-4 text-sm"><p>Discard your unsaved edits and reload the saved draft?</p><div className="mt-3 flex flex-wrap gap-3"><button className={buttonStyle} disabled={busy} onClick={discardEdits}>Discard and reload</button><button className={buttonStyle} disabled={busy} onClick={() => setDiscardReview(false)}>Keep editing</button></div></div>}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="rounded-xl bg-amber-400/10 p-2.5 text-amber-300"><Mail size={20} /></span><div><h2 className="font-semibold">{editable ? "Write your letter" : "Campaign details"}</h2><p className="text-xs text-muted-foreground capitalize">{campaign?.status || "Unsaved draft"}{dirty ? " · Unsaved changes" : ""}</p></div></div>{editable && <button className={buttonStyle} onClick={save} disabled={busy}><Save size={16} />Save draft</button>}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Campaign name" hint="For your own records."><input className={inputStyle} value={name} maxLength={120} disabled={!editable || busy} onChange={e => { setName(e.target.value); setDirty(true) }} /></Field>
                <Field label="Subject line"><input className={inputStyle} value={content.subject} maxLength={140} disabled={!editable || busy} onChange={e => change("subject", e.target.value)} /></Field>
                <div className="sm:col-span-2"><Field label="Inbox preview" hint="The short line shown beside the subject."><input className={inputStyle} value={content.preheader} maxLength={200} disabled={!editable || busy} onChange={e => change("preheader", e.target.value)} /></Field></div>
                <Field label="Small heading"><input className={inputStyle} value={content.eyebrow} maxLength={80} disabled={!editable || busy} onChange={e => change("eyebrow", e.target.value)} /></Field>
                <Field label="Main heading"><input className={inputStyle} value={content.headline} maxLength={160} disabled={!editable || busy} onChange={e => change("headline", e.target.value)} /></Field>
                <div className="sm:col-span-2"><Field label="Your message" hint="Leave a blank line between paragraphs. Plain text keeps the letter readable everywhere."><textarea className={`${inputStyle} min-h-[280px] leading-relaxed`} value={bodyText} maxLength={15000} disabled={!editable || busy} onChange={e => { setBodyText(e.target.value); change("body", e.target.value.split(/\n\s*\n/).map(p => p.replace(/[\r\n]+/g, " ").trim()).filter(Boolean)) }} /></Field></div>
                <Field label="Button text"><input className={inputStyle} value={content.ctaLabel} maxLength={80} disabled={!editable || busy} onChange={e => change("ctaLabel", e.target.value)} /></Field>
                <Field label="Button link"><input type="url" className={inputStyle} value={content.ctaUrl} maxLength={2000} disabled={!editable || busy} onChange={e => change("ctaUrl", e.target.value)} /></Field>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Every letter includes Ari’s name, the business address, P.IVA, email preferences and an unsubscribe link. Once launched, the content is locked for a consistent send.</p>
            </div>
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><h2 className="text-sm font-semibold">Email preview</h2><div className="flex flex-wrap gap-2"><button className={buttonStyle} onClick={() => preview()} disabled={previewBusy || busy}><Eye size={15} />{previewBusy ? "Rendering…" : "Refresh preview"}</button><button aria-label="Desktop email preview" aria-pressed={previewMode === "desktop"} className={buttonStyle} onClick={() => setPreviewMode("desktop")}><Monitor size={15} /></button><button aria-label="Mobile email preview" aria-pressed={previewMode === "mobile"} className={buttonStyle} onClick={() => setPreviewMode("mobile")}><Smartphone size={15} /></button><button aria-pressed={previewMode === "text"} className={buttonStyle} onClick={() => setPreviewMode("text")}>Text</button></div></div>
              {dirty && <p className="bg-amber-400/10 px-4 py-2 text-xs text-amber-200">Refresh the preview to see your latest edits.</p>}
              {previewError && <p role="alert" className="p-4 text-sm text-red-300">{previewError}</p>}
              <div className="bg-[#161b25] p-2 sm:p-4">{previewMode === "text" ? <pre className="min-h-[450px] whitespace-pre-wrap break-words rounded-lg bg-white p-5 font-sans text-sm leading-relaxed text-slate-800">{plainText}</pre> : html ? <iframe title="LionBot email preview" sandbox="" referrerPolicy="no-referrer" srcDoc={html} className={`mx-auto block h-[780px] w-full border-0 bg-white ${previewMode === "mobile" ? "max-w-[375px]" : "max-w-[720px]"}`} /> : <div className="p-10 text-center text-sm text-slate-300">Your preview will appear here.</div>}</div>
            </section>
            {campaign && <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-semibold">{editable ? "Review & send" : "Delivery progress"}</h2>
              {editable ? <>
                <p className="mt-2 text-sm text-muted-foreground">{overview.audience.counts.eligible.toLocaleString()} subscribers are currently eligible. The recipient list is frozen at launch; later opt-outs are still honored.</p>
                <div className="mt-4 flex flex-wrap gap-3"><button className={buttonStyle} disabled={busy || dirty || !overview.readiness.ready} onClick={() => action("test")}><Mail size={16} />Send a test to my account</button><button className={`${buttonStyle} border-amber-400/30 bg-amber-400 text-slate-950 hover:bg-amber-300`} disabled={busy || dirty || !overview.readiness.ready || overview.audience.counts.eligible === 0} onClick={() => { setLaunchReview(true); setConfirmation("") }}><Send size={16} />Review launch</button></div>
                {launchReview && <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4"><p className="font-medium">Launch “{name}”?</p><p className="mt-2 text-sm text-muted-foreground">This starts sending real emails to the eligible subscribers shown above. Check the preview and test email first. Type the exact subject below to confirm:</p><p className="my-3 break-words text-sm font-medium">{content.subject}</p><label className="sr-only" htmlFor="launch-confirmation">Type the subject to confirm launch</label><input id="launch-confirmation" className={inputStyle} autoComplete="off" value={confirmation} onChange={e => setConfirmation(e.target.value)} /><div className="mt-3 flex gap-3"><button className={`${buttonStyle} bg-amber-400 text-slate-950 hover:bg-amber-300`} disabled={busy || confirmation !== content.subject} onClick={() => action("queue")}><Send size={16} />Launch campaign</button><button className={buttonStyle} disabled={busy} onClick={() => setLaunchReview(false)}>Keep drafting</button></div></div>}
              </> : <>
                {campaign.lastError && <p role="alert" className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">{campaign.lastError}</p>}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{([['sent', 'Sent'], ['pending', 'Waiting'], ['skipped', 'Skipped'], ['failed', 'Failed'], ['unknown', 'Needs review']] as const).map(([key, label]) => <div key={key}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{campaign.counts[key].toLocaleString()}</p></div>)}</div>
                <p className="mt-3 text-xs text-muted-foreground">“Sent” means the email provider accepted it. It does not prove inbox delivery. Uncertain deliveries need review and are not automatically resent after the provider’s duplicate protection expires.</p>
                <div className="mt-5 flex flex-wrap gap-3">{["queued", "sending"].includes(campaign.status) && <button className={buttonStyle} disabled={busy} onClick={() => action("pause")}><Pause size={16} />Pause</button>}{campaign.status === "paused" && <button className={buttonStyle} disabled={busy || !overview.readiness.ready} onClick={() => action("resume")}><Play size={16} />Resume</button>}{["queued", "sending", "paused"].includes(campaign.status) && <button className={buttonStyle} disabled={busy} onClick={() => setCancelReview(true)}><X size={16} />Cancel remaining emails</button>}</div>
                {cancelReview && <div className="mt-4 rounded-xl border border-red-400/30 p-4 text-sm"><p>Cancel all remaining emails? Emails already submitted to the provider cannot be recalled.</p><div className="mt-3 flex gap-3"><button className={buttonStyle} disabled={busy} onClick={() => action("cancel")}>Confirm cancellation</button><button className={buttonStyle} onClick={() => setCancelReview(false)}>Keep campaign</button></div></div>}
                {!!recipients.length && <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer text-sm font-medium">Delivery details · up to 100 records, issues first</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-border text-muted-foreground"><th className="p-2">Recipient</th><th className="p-2">State</th><th className="p-2">Attempts</th><th className="p-2">Details</th></tr></thead><tbody>{recipients.map(recipient => <tr key={recipient.id} className="border-b border-border/50 align-top"><td className="p-2">{recipient.maskedEmail || recipient.id.slice(0, 8)}</td><td className="p-2 capitalize">{recipient.deliveryStatus || recipient.status}</td><td className="p-2">{recipient.attempts}</td><td className="max-w-xs break-words p-2 text-muted-foreground">{recipient.error || "—"}{recipient.providerId && <span className="mt-1 block break-all">Provider ID: {recipient.providerId}</span>}</td></tr>)}</tbody></table></div><p className="mt-3 text-xs text-muted-foreground">For uncertain deliveries, check the provider’s records before deciding what to do. This tool never offers an automatic resend of an uncertain delivery.</p></details>}
              </>}
            </section>}
          </main>
        </div>
      </div>}
    </DashboardShell></AdminGuard>
  </Layout>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}{hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}</label>
}
function Metric({ label, value, description }: { label: string; value: number; description: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 flex items-center gap-3 text-3xl font-semibold">{value.toLocaleString()}<Users size={19} className="text-amber-300" /></p><p className="mt-2 text-xs text-muted-foreground">{description}</p></div>
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])) },
})
