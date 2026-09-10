// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Accessible, sign-in-free unsubscribe confirmation.
//          Opening the page never changes subscription preferences.
// ============================================================
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CheckCircle2, Mail } from "lucide-react"

export default function CampaignUnsubscribePage() {
  const router = useRouter()
  const token = typeof router.query.token === "string" ? router.query.token : ""
  const [state, setState] = useState<"loading" | "ready" | "done" | "invalid" | "saving">("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!router.isReady) return
    if (!token || token === "preview") { setState("invalid"); return }
    let current = true
    fetch(`/api/email/campaign-unsubscribe?token=${encodeURIComponent(token)}`, { credentials: "omit" })
      .then(async response => {
        const result = await response.json()
        if (current) setState(response.ok && result.valid ? result.unsubscribed ? "done" : "ready" : "invalid")
      })
      .catch(() => { if (current) { setError("We couldn’t check this link. Please reload the page and try again."); setState("invalid") } })
    return () => { current = false }
  }, [token, router.isReady])

  async function unsubscribe() {
    setState("saving"); setError("")
    try {
      const response = await fetch("/api/email/campaign-unsubscribe", {
        method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      })
      if (!response.ok) throw new Error()
      setState("done")
    } catch { setError("We couldn’t save that change. Please try again."); setState("ready") }
  }

  return <>
    <Head><title>Unsubscribe — LionBot</title><meta name="robots" content="noindex,nofollow" /><meta name="referrer" content="no-referrer" /></Head>
    <main className="flex min-h-screen items-center justify-center bg-[#091a2a] px-5 py-14 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#10263a] p-7 text-center shadow-xl sm:p-10">
        <div className="mb-6 flex justify-center text-[#f6c66c]">{state === "done" ? <CheckCircle2 size={36} /> : <Mail size={36} />}</div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#f6c66c]">LionBot community letters</p>
        <h1 className="text-2xl font-semibold">{state === "done" ? "You’re unsubscribed." : state === "invalid" ? "This link couldn’t be verified." : "A little less in your inbox."}</h1>
        <div aria-live="polite">
          {state === "loading" && <p className="mt-4 text-sm text-slate-300">Checking your preferences…</p>}
          {state === "done" && <p className="mt-4 text-sm leading-relaxed text-slate-300">You won’t receive further community announcements or fundraising emails at this address. An email already being sent may still arrive. Account security emails, such as password resets you request, will still work.</p>}
          {state === "invalid" && <p className="mt-4 text-sm leading-relaxed text-slate-300">Open the unsubscribe link from your original email, or manage your email preferences in your dashboard.</p>}
          {(state === "ready" || state === "saving") && <><p className="mt-4 text-sm leading-relaxed text-slate-300">Unsubscribe from LionBot community announcements and fundraising emails. You don’t need to sign in.</p><button onClick={unsubscribe} disabled={state === "saving"} className="mt-7 w-full rounded-xl bg-[#f6c66c] px-5 py-3 font-semibold text-[#10263a] transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50">{state === "saving" ? "Saving…" : "Unsubscribe"}</button></>}
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-200">{error}</p>}
        <Link href="/dashboard/settings#email"><a className="mt-7 inline-block text-sm text-slate-300 underline underline-offset-4 hover:text-white">Manage all email preferences</a></Link>
        <p className="mt-7 text-xs text-slate-400">Ari Horesh · LionBot</p>
      </div>
    </main>
  </>
}
