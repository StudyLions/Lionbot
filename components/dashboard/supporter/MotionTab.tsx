// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Motion tab for the LionHeart Studio. 6 self-animating
//          particle-style cards (no API roundtrip), an intensity
//          slider with a live density preview, a 3-segment speed
//          picker with a speedometer needle, and a clean toggle
//          row for the four card-effect on/off switches.
// ============================================================
import { Sparkles, Zap, Layers, RefreshCw, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PARTICLE_STYLES,
  EFFECT_INTENSITIES,
  ANIMATION_SPEEDS,
  type ParticleStyle,
  type EffectIntensity,
  type AnimationSpeed,
} from "@/constants/CardEffectPresets";
import type { CardPreferences } from "./types";

interface MotionTabProps {
  prefs: CardPreferences;
  onChange: (patch: Partial<CardPreferences>) => void;
  defaultParticleColor: string;
}

const STYLE_GLYPH: Record<ParticleStyle, string> = {
  stars: "\u2728",
  hearts: "\u2665",
  diamonds: "\u25C6",
  circles: "\u25CF",
  snowflakes: "\u2744",
  lightning: "\u26A1",
};

const EFFECT_LABELS: Record<
  "sparkles_enabled" | "ring_enabled" | "edge_glow_enabled" | "particles_enabled",
  { label: string; icon: React.ReactNode; desc: string }
> = {
  sparkles_enabled: {
    label: "Sparkles",
    icon: <Sparkles size={14} />,
    desc: "Tiny twinkling lights",
  },
  ring_enabled: {
    label: "Avatar ring",
    icon: <Layers size={14} />,
    desc: "Glowing halo around your avatar",
  },
  edge_glow_enabled: {
    label: "Card glow",
    icon: <Wind size={14} />,
    desc: "Soft outer light around the card",
  },
  particles_enabled: {
    label: "Particles",
    icon: <Zap size={14} />,
    desc: "Larger floating shapes",
  },
};

function StyleCard({
  styleId,
  active,
  color,
  onClick,
}: {
  styleId: ParticleStyle;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  const meta = PARTICLE_STYLES.find((s) => s.id === styleId)!;
  const animKey = `motion-${styleId}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-[4/3] rounded-2xl border overflow-hidden transition-all focus:outline-none",
        active
          ? "border-foreground shadow-[0_12px_30px_-12px_rgba(255,255,255,0.25)]"
          : "border-border/50 hover:border-foreground/30 hover:scale-[1.02]"
      )}
    >
      <style jsx>{`
        @keyframes ${animKey}-float {
          0% { transform: translateY(8px); opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        @keyframes ${animKey}-twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
          50% { transform: scale(1.4) rotate(180deg); opacity: 1; }
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          background: active
            ? `linear-gradient(160deg, ${color}25 0%, ${color}10 100%)`
            : "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {[
          { x: 22, delay: "0s", size: 14 },
          { x: 50, delay: "0.7s", size: 18 },
          { x: 75, delay: "1.4s", size: 12 },
          { x: 35, delay: "0.3s", size: 10 },
          { x: 64, delay: "1.1s", size: 16 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute font-bold"
            style={{
              left: `${p.x}%`,
              bottom: "-8px",
              fontSize: `${p.size}px`,
              color: color,
              animation: `${animKey}-float 2.4s ease-out ${p.delay} infinite, ${animKey}-twinkle 1.6s ease-in-out ${p.delay} infinite`,
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          >
            {STYLE_GLYPH[styleId]}
          </span>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/65 to-transparent">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-[12px] font-semibold",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {meta.name}
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
      </div>
    </button>
  );
}

function IntensityPreview({
  intensity,
  color,
}: {
  intensity: EffectIntensity;
  color: string;
}) {
  const counts: Record<EffectIntensity, number> = {
    subtle: 4,
    normal: 9,
    dense: 16,
    maximum: 25,
  };
  const n = counts[intensity];
  return (
    <div className="grid grid-cols-5 gap-1">
      {Array.from({ length: 25 }).map((_, i) => {
        const filled = i < n;
        return (
          <div
            key={i}
            className="aspect-square rounded-sm transition-all"
            style={{
              background: filled ? color : "rgba(255,255,255,0.08)",
              boxShadow: filled ? `0 0 6px ${color}77` : "none",
              opacity: filled ? 0.85 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

function SpeedometerNeedle({ speed }: { speed: AnimationSpeed }) {
  const angles: Record<AnimationSpeed, number> = {
    slow: -55,
    normal: 0,
    fast: 55,
  };
  const angle = angles[speed];
  return (
    <svg viewBox="0 0 100 60" className="w-full h-auto">
      <defs>
        <linearGradient id="speedo-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5B8DEF" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
      <path
        d="M10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke="url(#speedo-arc)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <g
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: "50px 50px",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <line x1="50" y1="50" x2="50" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4" fill="white" />
      </g>
    </svg>
  );
}

export default function MotionTab({ prefs, onChange, defaultParticleColor }: MotionTabProps) {
  const sparkleColor = prefs.sparkle_color || defaultParticleColor;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Particle style</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pick what falls behind your card. Each preview is live — no render needed.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PARTICLE_STYLES.map((s) => (
            <StyleCard
              key={s.id}
              styleId={s.id}
              active={prefs.particle_style === s.id}
              color={prefs.particle_color || sparkleColor}
              onClick={() => onChange({ particle_style: s.id })}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Density</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              How many particles to fill the frame.
            </p>
          </div>

          <IntensityPreview intensity={prefs.effect_intensity} color={sparkleColor} />

          <div className="flex gap-1.5 p-1 rounded-lg bg-muted/30">
            {EFFECT_INTENSITIES.map((i) => (
              <button
                key={i.id}
                onClick={() => onChange({ effect_intensity: i.id })}
                className={cn(
                  "flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                  prefs.effect_intensity === i.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {i.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Speed</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              How fast the loop animates.
            </p>
          </div>

          <SpeedometerNeedle speed={prefs.animation_speed} />

          <div className="flex gap-1.5 p-1 rounded-lg bg-muted/30">
            {ANIMATION_SPEEDS.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ animation_speed: s.id })}
                className={cn(
                  "flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                  prefs.animation_speed === s.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Effect layers</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toggle individual effects on or off without touching colors.
            </p>
          </div>
          <button
            onClick={() =>
              onChange({
                sparkles_enabled: true,
                ring_enabled: true,
                edge_glow_enabled: true,
                particles_enabled: true,
              })
            }
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={11} /> All on
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.keys(EFFECT_LABELS) as Array<keyof typeof EFFECT_LABELS>).map((key) => {
            const meta = EFFECT_LABELS[key];
            const checked = prefs[key];
            return (
              <button
                key={key}
                onClick={() => onChange({ [key]: !checked } as Partial<CardPreferences>)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                  checked
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/40 hover:border-border/60"
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0",
                    checked ? "text-primary" : "text-muted-foreground"
                  )}
                  style={{
                    background: checked ? `${sparkleColor}22` : "rgba(255,255,255,0.04)",
                  }}
                >
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-foreground">
                    {meta.label}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground truncate">
                    {meta.desc}
                  </div>
                </div>
                <div
                  className={cn(
                    "h-5 w-9 rounded-full p-0.5 transition-colors flex-shrink-0",
                    checked ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full bg-white transition-transform",
                      checked ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
