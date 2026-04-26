// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Profile tab for the LionHeart Studio. Bio text +
//          seasonal toggle (with a calendar tooltip showing the
//          date windows from supporter_effects.py) + embed accent
//          with a live Discord-style embed preview + timer
//          personalization (theme accent + 3 stage labels).
// ============================================================
import { useState } from "react";
import { Type, Snowflake, Calendar, Mail, Timer, Palette as PaletteIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidHexColor } from "@/constants/CardEffectPresets";
import type { CardPreferences, TimerPreferences } from "./types";

interface ProfileTabProps {
  prefs: CardPreferences;
  onPrefsChange: (patch: Partial<CardPreferences>) => void;
  timerPrefs: TimerPreferences;
  onTimerChange: (patch: Partial<TimerPreferences>) => void;
  defaultEmbedColor: string;
}

const SEASONAL_WINDOWS = [
  { label: "Snowflakes", glyph: "\u2744", range: "Dec 1 \u2192 Feb 28", style: "snowflakes" },
  { label: "Hearts (Valentine's)", glyph: "\u2665", range: "Feb 1 \u2192 Feb 14", style: "hearts" },
  { label: "Stars (Spring)", glyph: "\u2728", range: "Mar 1 \u2192 Apr 30", style: "stars" },
  { label: "Diamonds (Halloween)", glyph: "\u25C6", range: "Oct 1 \u2192 Oct 31", style: "diamonds" },
];

function isSeasonalActive(now = new Date()): { label: string; glyph: string; style: string } | null {
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();

  if ((m === 12 && d >= 1) || (m === 1) || (m === 2 && d <= 28)) {
    if (m === 2 && d <= 14) return { label: "Hearts (Valentine's)", glyph: "\u2665", style: "hearts" };
    return { label: "Snowflakes", glyph: "\u2744", style: "snowflakes" };
  }
  if ((m === 3) || (m === 4 && d <= 30)) return { label: "Stars (Spring)", glyph: "\u2728", style: "stars" };
  if (m === 10) return { label: "Diamonds (Halloween)", glyph: "\u25C6", style: "diamonds" };
  return null;
}

function MockEmbed({ color, bio }: { color: string; bio: string | null }) {
  return (
    <div
      className="relative rounded-md overflow-hidden"
      style={{ background: "#2B2D31" }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: color, boxShadow: `0 0 12px ${color}88` }}
      />
      <div className="pl-3.5 pr-3 py-2.5">
        <div className="text-[12px] font-semibold text-white">Daily Study Summary</div>
        <div className="text-[11px] text-[#DBDEE1] mt-0.5 leading-snug">
          You studied <span className="font-bold text-white">2h 14m</span> across 4 sessions.
          {bio && (
            <>
              <br />
              <span className="italic text-[#A8ABB0]">&ldquo;{bio}&rdquo;</span>
            </>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[10px] text-[#949BA4]">Streak</span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
            style={{ background: color }}
          >
            14 days
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProfileTab({
  prefs,
  onPrefsChange,
  timerPrefs,
  onTimerChange,
  defaultEmbedColor,
}: ProfileTabProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const embedColor = prefs.embed_color || defaultEmbedColor;
  const active = isSeasonalActive();

  const onEmbedHex = (v: string) => {
    const hex = v.startsWith("#") ? v.toUpperCase() : `#${v.toUpperCase()}`;
    if (isValidHexColor(hex)) onPrefsChange({ embed_color: hex });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-2">
          <Type size={14} className="text-primary mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Bio / status text</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              A short message that shows on your profile card. Up to 50 characters.
            </p>
          </div>
        </div>
        <input
          type="text"
          value={prefs.bio_text || ""}
          onChange={(e) => onPrefsChange({ bio_text: e.target.value.slice(0, 50) || null })}
          placeholder="e.g. Grinding for finals\u2026"
          maxLength={50}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            {(prefs.bio_text || "").length}/50 characters
          </p>
          {prefs.bio_text && (
            <button
              onClick={() => onPrefsChange({ bio_text: null })}
              className="text-[10px] text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Snowflake size={14} className="text-primary mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Seasonal effects</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto-switch your particle style by date — snowflakes in winter, hearts on
                Valentine&apos;s, etc.
              </p>
            </div>
          </div>

          <button
            onClick={() => onPrefsChange({ seasonal_effects: !prefs.seasonal_effects })}
            className={cn(
              "h-6 w-11 rounded-full p-0.5 transition-colors flex-shrink-0",
              prefs.seasonal_effects ? "bg-primary" : "bg-muted"
            )}
            role="switch"
            aria-checked={prefs.seasonal_effects}
          >
            <div
              className={cn(
                "h-5 w-5 rounded-full bg-white transition-transform",
                prefs.seasonal_effects ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <button
          onClick={() => setShowCalendar((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Calendar size={12} />
          {showCalendar ? "Hide" : "Show"} seasonal calendar
        </button>

        {showCalendar && (
          <div className="mt-1 pt-3 border-t border-border/50 space-y-1.5">
            {SEASONAL_WINDOWS.map((w) => {
              const isActive = active?.style === w.style;
              return (
                <div
                  key={w.style}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px]",
                    isActive
                      ? "bg-primary/15 text-foreground border border-primary/30"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{w.glyph}</span>
                    <span className="font-medium">{w.label}</span>
                  </span>
                  <span className="font-mono">{w.range}</span>
                </div>
              );
            })}
            {active && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 mt-1 text-[10px] text-primary">
                <Info size={10} />
                Currently active: <span className="font-semibold">{active.label}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Mail size={14} className="text-primary mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Embed accent</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Color of bot embeds (reminders, daily summaries, etc.).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={embedColor}
              onChange={(e) => onEmbedHex(e.target.value)}
              className="h-8 w-10 rounded-md border border-border/40 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={embedColor}
              onChange={(e) => onEmbedHex(e.target.value)}
              maxLength={7}
              className="h-8 px-2 rounded-md bg-muted/40 border border-border/40 text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-[88px]"
            />
            {prefs.embed_color && (
              <button
                onClick={() => onPrefsChange({ embed_color: null })}
                className="text-[10px] text-muted-foreground hover:text-foreground underline whitespace-nowrap"
              >
                Default
              </button>
            )}
          </div>
        </div>
        <MockEmbed color={embedColor} bio={prefs.bio_text} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-2">
          <Timer size={14} className="text-primary mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Pomodoro timer</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tweak your timer&apos;s accent color and the three stage labels.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Accent color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={timerPrefs.custom_accent_color || "#5B8DEF"}
                onChange={(e) => onTimerChange({ custom_accent_color: e.target.value.toUpperCase() })}
                className="h-8 w-10 rounded-md border border-border/40 bg-transparent cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">
                {timerPrefs.custom_accent_color || "Using theme default"}
              </span>
              {timerPrefs.custom_accent_color && (
                <button
                  onClick={() => onTimerChange({ custom_accent_color: null })}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {(
            [
              { key: "focus_label" as const, placeholder: "FOCUS", labelText: "Focus stage" },
              { key: "break_label" as const, placeholder: "BREAK", labelText: "Break stage" },
              { key: "session_label" as const, placeholder: "SESSION", labelText: "Session label" },
            ]
          ).map(({ key, placeholder, labelText }) => (
            <div key={key}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                {labelText}
              </label>
              <input
                type="text"
                value={timerPrefs[key] || ""}
                onChange={(e) => onTimerChange({ [key]: e.target.value.slice(0, 20) || null } as Partial<TimerPreferences>)}
                placeholder={placeholder}
                maxLength={20}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <PaletteIcon size={10} />
          Saves automatically a moment after you finish typing.
        </div>
      </div>
    </div>
  );
}
