// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19  (real download 2026-05-21)
// Purpose: /anki/download — public landing + download page for the
//          "LionGotchi for Anki" addon. Serves the self-hosted
//          .ankiaddon (public/anki/lionbot.ankiaddon) with its
//          version + SHA-256, plus install instructions.
//
//          No NextAuth required — addon downloads are public.
// ============================================================
import Head from "next/head"
import { Download as DownloadIcon, ShieldCheck } from "lucide-react"

const ADDON_VERSION = "0.2.2"
const ADDON_FILE = "/anki/lionbot.ankiaddon"
const ADDON_SHA256 =
  "e2d1f3f344a4ca49b634672448aaa6b2ce7c4056d6e0de3069a66bb7de382ab1"
const ADDON_SIZE = "85 KB"

export default function AnkiDownloadPage() {
  return (
    <>
      <Head>
        <title>Download LionGotchi for Anki | LionBot</title>
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
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground">
                  LionGotchi for Anki
                </h1>
                <p className="text-sm text-muted-foreground">
                  Earn LionBot gold and XP by reviewing your flashcards. Your
                  LionGotchi pet eats every time you study.
                </p>
              </div>

              <a
                href={ADDON_FILE}
                download
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-3 font-medium hover:opacity-90 transition-opacity"
              >
                <DownloadIcon size={16} /> Download v{ADDON_VERSION} (.ankiaddon, {ADDON_SIZE})
              </a>

              <div className="rounded-lg bg-background border border-border p-5 space-y-3">
                <h2 className="text-sm font-medium text-foreground">
                  How to install
                </h2>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
                  <li>Download the .ankiaddon file above.</li>
                  <li>In Anki: Tools, then Add-ons, then Install from file.</li>
                  <li>Restart Anki.</li>
                  <li>Open Tools, then LionGotchi, and sign in with Discord.</li>
                </ol>
                <p className="text-xs text-muted-foreground pt-1">
                  Requires Anki 2.1.50 or newer (qt5 or qt6). Works on macOS,
                  Windows, and Linux.
                </p>
              </div>

              <div className="rounded-md bg-background/50 border border-border/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="font-medium text-foreground">SHA-256</span>
                </div>
                <code className="block text-[11px] text-muted-foreground break-all font-mono">
                  {ADDON_SHA256}
                </code>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Open source (MIT) at{" "}
                <a
                  href="https://github.com/StudyLions/lionbot-anki-addon"
                  className="underline hover:text-foreground"
                >
                  github.com/StudyLions/lionbot-anki-addon
                </a>
                . Only review counts and timestamps leave Anki, never your card
                content.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
