// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-11
// Purpose: /anki/payment-complete — public landing for the Anki
//          addon's Stripe checkout (success_url / cancel_url).
//          Addon users (email accounts especially) have no website
//          session, so this page must work logged-out: it only
//          tells them to return to Anki. The gem credit itself is
//          driven by the Stripe webhook, not this page.
// ============================================================
import Head from "next/head"
import { useRouter } from "next/router"
import { CheckCircle2, XCircle } from "lucide-react"

export default function AnkiPaymentCompletePage() {
  const router = useRouter()
  const cancelled = router.query.status === "cancelled"

  return (
    <>
      <Head>
        <title>
          {cancelled ? "Payment cancelled" : "Payment complete"} | LionBot
        </title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border p-8 space-y-4 text-center">
            {cancelled ? (
              <>
                <XCircle size={40} className="mx-auto text-muted-foreground" />
                <h1 className="text-2xl font-semibold text-foreground">
                  Payment cancelled
                </h1>
                <p className="text-sm text-muted-foreground">
                  Nothing was charged. You can close this tab and return to
                  Anki.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                <h1 className="text-2xl font-semibold text-foreground">
                  Payment complete
                </h1>
                <p className="text-sm text-muted-foreground">
                  Thank you! You can close this tab and return to Anki — your
                  gems will appear there within a few seconds.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
