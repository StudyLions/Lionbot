// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Frame tab for the LionHeart Studio. Six border-style
//          cards each rendered as a self-contained SVG so users
//          can preview the border treatment without firing the
//          bot render API.
// ============================================================
import { cn } from "@/lib/utils";
import { BORDER_STYLES, type BorderStyle } from "@/constants/CardEffectPresets";
import type { CardPreferences } from "./types";

interface FrameTabProps {
  prefs: CardPreferences;
  onChange: (patch: Partial<CardPreferences>) => void;
  defaultBorderColor: string;
}

/**
 * SVG approximations of each border style. They're intentionally
 * stylized rather than pixel-perfect; the goal is to communicate
 * the *vibe* (clean / minimal / neon / ornate / regal / pixel)
 * not duplicate the bot renderer.
 */
function BorderPreview({ style, color, active }: { style: BorderStyle; color: string; active: boolean }) {
  const baseProps = {
    width: "100%",
    viewBox: "0 0 120 80",
    className: "block",
  };
  const cardFill = active ? `${color}10` : "rgba(255,255,255,0.03)";
  const cardStroke = active ? color : "rgba(255,255,255,0.18)";

  if (style === "clean") {
    return (
      <svg {...baseProps}>
        <rect x="6" y="6" width="108" height="68" rx="8" fill={cardFill} stroke={cardStroke} strokeWidth="1" />
      </svg>
    );
  }
  if (style === "minimal") {
    return (
      <svg {...baseProps}>
        <rect x="6" y="6" width="108" height="68" rx="8" fill={cardFill} stroke={cardStroke} strokeWidth="1.5" />
        <rect
          x="9"
          y="9"
          width="102"
          height="62"
          rx="6"
          fill="none"
          stroke={cardStroke}
          strokeWidth="0.5"
          opacity="0.5"
        />
      </svg>
    );
  }
  if (style === "neon") {
    return (
      <svg {...baseProps}>
        <defs>
          <filter id={`glow-${style}`}>
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <rect
          x="6"
          y="6"
          width="108"
          height="68"
          rx="8"
          fill="none"
          stroke={color}
          strokeWidth="3"
          opacity="0.45"
          filter={`url(#glow-${style})`}
        />
        <rect x="6" y="6" width="108" height="68" rx="8" fill={cardFill} stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }
  if (style === "ornate") {
    return (
      <svg {...baseProps}>
        <rect x="6" y="6" width="108" height="68" rx="8" fill={cardFill} stroke={cardStroke} strokeWidth="1" />
        <rect x="9" y="9" width="102" height="62" rx="6" fill="none" stroke={color} strokeWidth="0.6" />
        {[
          [10, 10],
          [110, 10],
          [10, 70],
          [110, 70],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="2.4" fill="none" stroke={color} strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="0.9" fill={color} />
          </g>
        ))}
        <line x1="60" y1="9" x2="60" y2="14" stroke={color} strokeWidth="0.6" />
        <line x1="60" y1="66" x2="60" y2="71" stroke={color} strokeWidth="0.6" />
      </svg>
    );
  }
  if (style === "regal") {
    return (
      <svg {...baseProps}>
        <rect x="6" y="6" width="108" height="68" rx="8" fill={cardFill} stroke={color} strokeWidth="2" />
        <rect x="10" y="10" width="100" height="60" rx="5" fill="none" stroke={color} strokeWidth="0.8" />
        {[14, 24, 34, 44, 54, 64, 74, 84, 94, 104].map((x) => (
          <rect key={x} x={x - 1} y="6" width="2" height="2" fill={color} />
        ))}
        {[14, 24, 34, 44, 54, 64, 74, 84, 94, 104].map((x) => (
          <rect key={x} x={x - 1} y="72" width="2" height="2" fill={color} />
        ))}
      </svg>
    );
  }
  if (style === "pixel") {
    return (
      <svg {...baseProps}>
        <rect x="6" y="6" width="108" height="68" fill={cardFill} stroke="none" />
        {[6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108].map((x) => (
          <g key={x}>
            <rect x={x} y="6" width="3" height="3" fill={color} />
            <rect x={x} y="71" width="3" height="3" fill={color} />
          </g>
        ))}
        {[6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66].map((y) => (
          <g key={y}>
            <rect x="6" y={y} width="3" height="3" fill={color} />
            <rect x="111" y={y} width="3" height="3" fill={color} />
          </g>
        ))}
      </svg>
    );
  }
  return null;
}

export default function FrameTab({ prefs, onChange, defaultBorderColor }: FrameTabProps) {
  const color = prefs.edge_glow_color || defaultBorderColor;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Border style</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            How the edge of your card is decorated. Color follows the &ldquo;Card glow&rdquo; pick from the Colors tab.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BORDER_STYLES.map((b) => {
            const active = prefs.border_style === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onChange({ border_style: b.id as BorderStyle })}
                className={cn(
                  "group relative aspect-[3/2] rounded-2xl border overflow-hidden transition-all p-3",
                  active
                    ? "border-foreground"
                    : "border-border/50 hover:border-foreground/30 hover:scale-[1.02]"
                )}
                style={{
                  background: active
                    ? `linear-gradient(160deg, ${color}18 0%, ${color}05 100%)`
                    : "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                  boxShadow: active ? `0 12px 30px -12px ${color}` : "none",
                }}
              >
                <div className="absolute inset-3 flex items-center justify-center">
                  <BorderPreview style={b.id as BorderStyle} color={color} active={active} />
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {b.name}
                  </span>
                  {active && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
