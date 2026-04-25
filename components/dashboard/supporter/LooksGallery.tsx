// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Curated "Looks" gallery for the LionHeart Studio.
//          Each look renders as a mini animated SVG card so users
//          can preview the vibe instantly without firing the bot
//          render API. One click pushes the entire LookPrefs
//          object into the parent's draft state.
// ============================================================
import { useState } from "react";
import { Shuffle, Lock } from "lucide-react";
import { CARD_LOOKS, type CardLook } from "@/constants/CardLookPresets";

interface LooksGalleryProps {
  activeLookId?: string | null;
  onPick: (look: CardLook) => void;
  onSurprise: () => void;
  isSupporter: boolean;
}

/**
 * A small animated SVG card that previews the vibe of a Look:
 * gradient background, soft glow ring, particle dots in the
 * sparkle / particle / glow colors and the Look's glyph centered.
 */
function LookThumb({ look }: { look: CardLook }) {
  const sparkle = look.prefs.sparkle_color || look.preview.from;
  const particle = look.prefs.particle_color || look.preview.to;
  const glow = look.prefs.edge_glow_color || look.preview.from;

  // 7 deterministic dot positions/sizes so the layout is stable
  const dots = [
    { x: 20, y: 16, r: 1.6, c: sparkle, d: "0s" },
    { x: 84, y: 22, r: 1.2, c: particle, d: "0.6s" },
    { x: 36, y: 50, r: 1.0, c: sparkle, d: "1.1s" },
    { x: 70, y: 60, r: 1.6, c: particle, d: "0.3s" },
    { x: 14, y: 70, r: 1.0, c: sparkle, d: "0.9s" },
    { x: 90, y: 80, r: 1.4, c: particle, d: "1.4s" },
    { x: 52, y: 30, r: 1.0, c: glow, d: "1.7s" },
  ];

  const lookKey = look.id;

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={`bg-${lookKey}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={look.preview.from} />
          <stop offset="100%" stopColor={look.preview.to} />
        </linearGradient>
        <radialGradient id={`glow-${lookKey}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="100" height="100" rx="14" fill={`url(#bg-${lookKey})`} />

      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="12"
        fill="none"
        stroke={glow}
        strokeOpacity="0.55"
        strokeWidth="1.4"
        style={{
          filter: `drop-shadow(0 0 4px ${glow})`,
        }}
      />

      <circle cx="50" cy="50" r="20" fill={`url(#glow-${lookKey})`} />

      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="22"
        fill="white"
        style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.4))" }}
      >
        {look.glyph || "\u2728"}
      </text>

      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={dot.c}
          opacity="0.85"
        >
          <animate
            attributeName="opacity"
            values="0.15;1;0.15"
            dur="2.4s"
            begin={dot.d}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${dot.r * 0.6};${dot.r * 1.2};${dot.r * 0.6}`}
            dur="2.4s"
            begin={dot.d}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

function LookCard({
  look,
  active,
  onClick,
  disabled,
}: {
  look: CardLook;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const accent = look.preview.from;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      className="group relative aspect-square w-full overflow-hidden rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2"
      style={{
        borderColor: active ? accent : "rgba(255,255,255,0.08)",
        boxShadow: active
          ? `0 14px 32px -10px ${accent}, inset 0 0 0 2px ${accent}55`
          : hover
            ? `0 12px 28px -12px ${accent}88`
            : "0 4px 14px -8px rgba(0,0,0,0.4)",
        transform: hover && !disabled ? "translateY(-3px)" : "translateY(0)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <LookThumb look={look} />

      <div
        className="absolute inset-x-0 bottom-0 px-2.5 py-2"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)",
        }}
      >
        <div className="text-[11px] font-bold text-white drop-shadow leading-tight">
          {look.name}
        </div>
        <div
          className="text-[9.5px] text-white/80 truncate transition-all duration-200"
          style={{
            opacity: hover ? 1 : 0.7,
            maxHeight: hover ? "16px" : "12px",
          }}
        >
          {look.vibe}
        </div>
      </div>

      {disabled && (
        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/65 backdrop-blur-sm flex items-center justify-center">
          <Lock size={11} className="text-white/80" />
        </div>
      )}

      {active && (
        <div
          className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full"
          style={{
            background: "white",
            boxShadow: `0 0 0 2px ${accent}, 0 0 12px ${accent}`,
          }}
        />
      )}
    </button>
  );
}

export default function LooksGallery({
  activeLookId,
  onPick,
  onSurprise,
  isSupporter,
}: LooksGalleryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Curated looks</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            One click applies a coordinated palette, particle and border. Tweak from there.
          </p>
        </div>
        <button
          onClick={onSurprise}
          disabled={!isSupporter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(91, 141, 239, 0.18))",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            color: "white",
          }}
        >
          <Shuffle size={12} />
          Surprise me
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {CARD_LOOKS.map((look) => (
          <LookCard
            key={look.id}
            look={look}
            active={activeLookId === look.id}
            disabled={!isSupporter}
            onClick={() => onPick(look)}
          />
        ))}
      </div>

      {!isSupporter && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/40">
          <Lock size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Looks unlock with any LionHeart subscription. You can browse all 12 here, but
            applying a look needs an active tier.
          </p>
        </div>
      )}
    </div>
  );
}
