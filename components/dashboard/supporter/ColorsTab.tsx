// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Colors tab for the LionHeart Studio. A palette node
//          graph + HSL sliders + harmony picker + recent colors,
//          replacing the 6-block ColorSection swatch grid that
//          previously dominated the dashboard.
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { Link2, Link2Off, RotateCcw, Pipette } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_PRESETS, isValidHexColor } from "@/constants/CardEffectPresets";
import type { CardPreferences } from "./types";

type ColorTargetKey =
  | "sparkle_color"
  | "ring_color"
  | "edge_glow_color"
  | "particle_color"
  | "username_color"
  | "embed_color";

interface ColorTarget {
  key: ColorTargetKey;
  label: string;
  short: string;
  desc: string;
}

const TARGETS: ColorTarget[] = [
  { key: "sparkle_color", label: "Sparkles", short: "S", desc: "Tiny twinkling lights drifting across the card" },
  { key: "ring_color", label: "Avatar ring", short: "R", desc: "Glowing halo around your profile picture" },
  { key: "edge_glow_color", label: "Card glow", short: "G", desc: "Soft outer light hugging the card border" },
  { key: "particle_color", label: "Particles", short: "P", desc: "Larger floating shapes in your chosen style" },
  { key: "username_color", label: "Username", short: "U", desc: "Your display name color in the card header" },
  { key: "embed_color", label: "Embed bar", short: "E", desc: "Discord embed accent strip on the side" },
];

interface ColorsTabProps {
  prefs: CardPreferences;
  onChange: (patch: Partial<CardPreferences>) => void;
  defaultColor: string;
}

// --- HSL conversion utilities -----------------------------------------------
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const v = ln - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function generateHarmony(
  hex: string,
  rule: "mono" | "analogous" | "complementary" | "triadic"
): string[] {
  const { h, s, l } = hexToHsl(hex);
  switch (rule) {
    case "mono":
      return [-30, -15, 0, 15, 30, 45].map((dl) =>
        hslToHex(h, s, Math.max(15, Math.min(85, l + dl)))
      );
    case "analogous":
      return [-30, -15, 0, 15, 30, 45].map((dh) => hslToHex((h + dh + 360) % 360, s, l));
    case "complementary":
      return [
        hex,
        hslToHex(h, Math.max(40, s - 15), l),
        hslToHex(h, s, Math.max(15, l - 10)),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 180) % 360, Math.max(40, s - 15), l),
        hslToHex((h + 180) % 360, s, Math.max(15, l - 10)),
      ];
    case "triadic":
      return [
        hex,
        hslToHex(h, Math.max(40, s - 10), l),
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 120) % 360, Math.max(40, s - 10), l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex((h + 240) % 360, Math.max(40, s - 10), l),
      ];
  }
}

function ColorSwatchNode({
  target,
  color,
  active,
  onClick,
}: {
  target: ColorTarget;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 transition-all focus:outline-none",
        active ? "scale-105" : "hover:scale-105"
      )}
      title={target.desc}
    >
      <div
        className="relative h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xs font-black"
        style={{
          background: color,
          boxShadow: active
            ? `0 12px 28px -8px ${color}, 0 0 0 3px ${color}55`
            : `0 6px 16px -8px ${color}cc`,
          border: active ? "2px solid white" : "2px solid rgba(255,255,255,0.15)",
        }}
      >
        {target.short}
        {active && (
          <div
            aria-hidden
            className="absolute -inset-1 rounded-2xl pointer-events-none"
            style={{
              boxShadow: `0 0 0 1px ${color}, 0 0 22px ${color}88`,
            }}
          />
        )}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium tracking-wide whitespace-nowrap",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {target.label}
      </span>
    </button>
  );
}

export default function ColorsTab({ prefs, onChange, defaultColor }: ColorsTabProps) {
  const [activeKey, setActiveKey] = useState<ColorTargetKey>("sparkle_color");
  const [linked, setLinked] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const lastChange = useRef(Date.now());

  const activeColor = (prefs[activeKey] || defaultColor).toUpperCase();
  const isCustom = !!prefs[activeKey];

  const hsl = useMemo(() => hexToHsl(activeColor), [activeColor]);

  const setActive = (hex: string) => {
    const upper = hex.toUpperCase();
    if (Date.now() - lastChange.current > 800 && isValidHexColor(upper)) {
      setRecent((prev) => {
        const next = [upper, ...prev.filter((c) => c !== upper)];
        return next.slice(0, 8);
      });
      lastChange.current = Date.now();
    }
    if (linked) {
      onChange({
        sparkle_color: upper,
        ring_color: upper,
        edge_glow_color: upper,
        particle_color: upper,
        username_color: upper,
        embed_color: upper,
      });
    } else {
      onChange({ [activeKey]: upper } as Partial<CardPreferences>);
    }
  };

  const clearActive = () => {
    if (linked) {
      onChange({
        sparkle_color: null,
        ring_color: null,
        edge_glow_color: null,
        particle_color: null,
        username_color: null,
        embed_color: null,
      });
    } else {
      onChange({ [activeKey]: null } as Partial<CardPreferences>);
    }
  };

  const applyHarmony = (rule: "mono" | "analogous" | "complementary" | "triadic") => {
    const palette = generateHarmony(activeColor, rule);
    onChange({
      sparkle_color: palette[0],
      ring_color: palette[1],
      edge_glow_color: palette[2],
      particle_color: palette[3],
      username_color: palette[4],
      embed_color: palette[5],
    });
  };

  // Update HSL by individual channel
  const setH = (h: number) => setActive(hslToHex(h, hsl.s, hsl.l));
  const setS = (s: number) => setActive(hslToHex(hsl.h, s, hsl.l));
  const setL = (l: number) => setActive(hslToHex(hsl.h, hsl.s, l));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Palette nodes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any node to recolor it. Active = thicker ring.
            </p>
          </div>
          <button
            onClick={() => setLinked((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
              linked
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground border border-border/40 hover:text-foreground"
            )}
            title={linked ? "Each color changes only its own target" : "Changing one color updates them all"}
          >
            {linked ? <Link2 size={12} /> : <Link2Off size={12} />}
            {linked ? "Linked" : "Independent"}
          </button>
        </div>

        <div className="relative">
          <div
            className="absolute left-6 right-6 top-6 h-px"
            style={{
              background: `linear-gradient(90deg, ${TARGETS.map(
                (t) => prefs[t.key] || defaultColor
              ).join(", ")})`,
              opacity: 0.4,
            }}
          />
          <div className="relative flex items-start justify-between gap-2 overflow-x-auto pb-1">
            {TARGETS.map((target) => (
              <ColorSwatchNode
                key={target.key}
                target={target}
                color={prefs[target.key] || defaultColor}
                active={activeKey === target.key}
                onClick={() => setActiveKey(target.key)}
              />
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          {TARGETS.find((t) => t.key === activeKey)?.desc}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl flex-shrink-0"
              style={{
                background: activeColor,
                boxShadow: `0 8px 22px -10px ${activeColor}, inset 0 0 0 1px rgba(255,255,255,0.12)`,
              }}
            />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Editing
              </div>
              <div className="text-sm font-semibold text-foreground">
                {TARGETS.find((t) => t.key === activeKey)?.label}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Pipette size={11} className="text-muted-foreground" />
                <input
                  type="text"
                  value={activeColor}
                  onChange={(e) => {
                    const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
                    if (isValidHexColor(v)) setActive(v);
                  }}
                  maxLength={7}
                  className="h-6 px-2 rounded-md bg-muted/40 border border-border/40 text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-[88px]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={clearActive}
            disabled={!isCustom && !linked}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Reset to your tier default"
          >
            <RotateCcw size={11} />
            Default
          </button>
        </div>

        <div className="space-y-3">
          <SliderRow
            label="Hue"
            value={hsl.h}
            min={0}
            max={360}
            onChange={setH}
            gradient="linear-gradient(90deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
            valueText={`${Math.round(hsl.h)}\u00b0`}
          />
          <SliderRow
            label="Saturation"
            value={hsl.s}
            min={0}
            max={100}
            onChange={setS}
            gradient={`linear-gradient(90deg, ${hslToHex(hsl.h, 0, hsl.l)} 0%, ${hslToHex(hsl.h, 100, hsl.l)} 100%)`}
            valueText={`${Math.round(hsl.s)}%`}
          />
          <SliderRow
            label="Lightness"
            value={hsl.l}
            min={5}
            max={95}
            onChange={setL}
            gradient={`linear-gradient(90deg, #000 0%, ${hslToHex(hsl.h, hsl.s, 50)} 50%, #fff 100%)`}
            valueText={`${Math.round(hsl.l)}%`}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Auto-fill harmony</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generates the other five colors from the current pick.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["mono", "analogous", "complementary", "triadic"] as const).map((rule) => {
            const palette = generateHarmony(activeColor, rule);
            return (
              <button
                key={rule}
                onClick={() => applyHarmony(rule)}
                className="group rounded-xl border border-border/40 hover:border-foreground/30 transition-colors p-2.5 text-left"
              >
                <div className="flex gap-0.5 mb-1.5">
                  {palette.map((c, i) => (
                    <div
                      key={i}
                      className="h-3 flex-1 rounded-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-semibold text-foreground capitalize">
                  {rule === "mono" ? "Monochrome" : rule}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent</h3>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className="h-8 w-8 rounded-lg ring-2 ring-offset-2 ring-offset-card ring-transparent hover:ring-foreground/30 transition-all"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Presets</h3>
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.hex)}
              className={cn(
                "h-7 w-7 rounded-lg transition-all",
                activeColor === p.hex.toUpperCase()
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
                  : "ring-2 ring-transparent hover:scale-110"
              )}
              style={{ background: p.hex }}
              title={p.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  gradient,
  valueText,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  gradient: string;
  valueText: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[11px] font-mono tabular-nums text-foreground">{valueText}</span>
      </div>
      <div className="relative h-3 rounded-full" style={{ background: gradient }}>
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={Math.round(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-lg ring-2 ring-black/10 pointer-events-none transition-all"
          style={{
            left: `calc(${((value - min) / (max - min)) * 100}% - 10px)`,
          }}
        />
      </div>
    </div>
  );
}
