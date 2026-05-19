// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: /anki/download — public landing page for the
//          LionGotchi for Anki addon. Stage 1 ships a placeholder
//          that says "coming soon" so the link in /anki/connect
//          and /dashboard/anki has somewhere to point. Stage 3
//          fills in the real .ankiaddon download + checksum.
//
//          No NextAuth required — addon downloads are public.
// ============================================================
import Head from "next/head"
import { Download as DownloadIcon, Sparkles } from "lucide-react"

export default function AnkiDownloadPage() {
  return (
    <>
      <Head>
        <title>LionGotchi for Anki | LionBot</title>
        <meta
          name="description"
          content="Earn LionBot gold and XP by reviewing your flashcards in Anki."
        />
      </Head>

      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl bg-card border border-border overflow-hidden relative">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(132,204,22,0.55), transparent)",
              }}
            />
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-2 text-emerald-500">
                <Sparkles size={18} />
                <span className="text-xs uppercase tracking-wider">
                  Coming soon
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground">
                  LionGotchi for Anki
                </h1>
                <p className="text-sm text-muted-foreground">
                  Earn LionBot gold and XP by reviewing your flashcards. Your
                  LionGotchi pet eats every time you study.
                </p>
              </div>

              <div className="rounded-lg bg-background border border-border p-5 space-y-3">
                <h2 className="text-sm font-medium text-foreground">
                  How it works
                </h2>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
                  <li>Install the addon in Anki (one .ankiaddon file).</li>
                  <li>Sign in once with Discord.</li>
                  <li>
                    Review cards in Anki as you normally would &mdash; the
                    addon credits gold and XP to your LionBot account
                    automatically.
                  </li>
                </ol>
              </div>

              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground/20 text-foreground/50 px-4 py-3 font-medium cursor-not-allowed"
              >
                <DownloadIcon size={16} /> Download (coming soon)
              </button>

              <p className="text-xs text-muted-foreground text-center">
                The addon is in private testing. A public release is being
                prepared &mdash; check back here, or follow{" "}
                <a
                  href="https://github.com/StudyLions/lionbot-anki-addon"
                  className="underline hover:text-foreground"
                >
                  the GitHub repo
                </a>{" "}
                for updates.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
