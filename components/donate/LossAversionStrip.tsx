// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: "What you give up on free" loss-aversion strip placed
//          right after the comparison grid. Loss aversion is the
//          single highest-impact psychological lever on pricing
//          pages - we frame everything as a loss instead of a gain.
// ============================================================
import { X as XIcon, Check, AlertCircle } from "lucide-react";

interface LossRow {
  loss: string;
  gain: string;
}

const ROWS: LossRow[] = [
  {
    loss: "No animated profile cards",
    gain: "Live animated cards on every level-up",
  },
  {
    loss: "5 LionGems per top.gg vote",
    gain: "Up to 12 gems per vote on LionHeart++",
  },
  {
    loss: "Plants die after 48 hours of neglect",
    gain: "Plants never die on LionHeart++",
  },
  {
    loss: "No bonus on item drops",
    gain: "Up to +75% drop-rate bonus",
  },
  {
    loss: "Slow farm growth (1×)",
    gain: "Up to 2× growth speed and harvest gold",
  },
  {
    loss: "No Server Premium for your community",
    gain: "1 free Server Premium on LionHeart+",
  },
];

export default function LossAversionStrip() {
  return (
    <section className="relative py-14 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-rose-950/15 via-card/40 to-emerald-950/15 backdrop-blur-sm overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                  Here's what you're giving up on Free
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Every day on Free is a day of slower growth and missed rewards.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="p-5 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                  <XIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400/90">
                  On Free
                </span>
              </div>
              <ul className="space-y-3">
                {ROWS.map((row, i) => (
                  <li
                    key={`loss-${i}`}
                    className="flex items-start gap-2.5 text-sm text-foreground/80"
                  >
                    <XIcon className="h-4 w-4 text-rose-400/80 flex-shrink-0 mt-0.5" />
                    <span>{row.loss}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 lg:p-6 bg-emerald-500/[0.025]">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  With LionHeart
                </span>
              </div>
              <ul className="space-y-3">
                {ROWS.map((row, i) => (
                  <li
                    key={`gain-${i}`}
                    className="flex items-start gap-2.5 text-sm text-foreground/90"
                  >
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{row.gain}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
