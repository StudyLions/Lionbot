// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Three animated LionGotchi showcase sections for the
//          homepage: Pet Room, Farm, and Marketplace demos
// ============================================================
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import useSWR from "swr";
import {
  Heart,
  Sparkles,
  Palette,
  Home,
  Coins,
  Sprout,
  Droplets,
  Gem,
  TrendingUp,
  ShoppingBag,
  Tags,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets";

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || "";
function blobUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// ---------------------------------------------------------------------------
// 1. LionGotchi Hero Section — animated pet room with room cycling
// ---------------------------------------------------------------------------

const FRAME_COUNT = 4;
const FRAME_INTERVAL = 250;
const LION_PARTS = ["body", "head", "hair"] as const;

interface RoomConfig {
  prefix: string;
  wall: string;
  floor: string;
  mat: string;
}

const ROOM_CYCLE: RoomConfig[] = [
  { prefix: "rooms/default", wall: "rooms/default/wall_checker_blue.png", floor: "rooms/default/floor_blue.png", mat: "rooms/default/mat_blue.png" },
  { prefix: "rooms/castle", wall: "rooms/castle/wall_1.png", floor: "rooms/castle/floor_1.png", mat: "rooms/castle/carpet_1.png" },
  { prefix: "rooms/library", wall: "rooms/library/wall_2.png", floor: "rooms/library/floor_2.png", mat: "rooms/library/carpet_2.png" },
  { prefix: "rooms/aquarium", wall: "rooms/aquarium/wall_3.png", floor: "rooms/aquarium/floor_1.png", mat: "rooms/aquarium/carpet_3.png" },
  { prefix: "rooms/savannah", wall: "rooms/savannah/wall_1.png", floor: "rooms/savannah/floor_3.png", mat: "rooms/savannah/carpet_1.png" },
  { prefix: "rooms/beach", wall: "rooms/beach/wall_2.png", floor: "rooms/beach/floor_2.png", mat: "rooms/beach/carpet_2.png" },
  { prefix: "rooms/volcano", wall: "rooms/volcano/wall_1.png", floor: "rooms/volcano/floor_1.png", mat: "rooms/volcano/carpet_1.png" },
  { prefix: "rooms/circus", wall: "rooms/circus/wall_3.png", floor: "rooms/circus/floor_3.png", mat: "rooms/circus/carpet_3.png" },
];

const ROOM_CYCLE_INTERVAL = 3500;

const GB_W = 260;
const GB_H = 400;
const GB_SCREEN_T = 36;
const GB_SCREEN_L = 30;
const GB_SCREEN_S = 200;
const SHOWCASE_W = 340;

const SHOWCASE_SKINS = [
  { path: "gameboy/frames/wave/purple.png", label: "Wave" },
  { path: "gameboy/frames/gameboy-flowers-01.png", label: "Flowers" },
  { path: "gameboy/frames/japan_flowers/design.png", label: "Japan Flowers" },
  { path: "gameboy/frames/gameboy-hearts-01.png", label: "Hearts" },
  { path: "gameboy/frames/gameboy-candy-01.png", label: "Candy" },
  { path: "gameboy/frames/fire/red.png", label: "Fire" },
  { path: "gameboy/frames/gameboy-leaves-03.png", label: "Leaves" },
  { path: "gameboy/frames/japan_pattern/japan_pattern_4.png", label: "Sakura" },
  { path: "gameboy/frames/love/peach.png", label: "Love" },
  { path: "gameboy/frames/fish_n_flower/fish_n_flower_1.png", label: "Fish & Flower" },
];

const SKIN_CYCLE_MS = 4200;

const LION_HIGHLIGHTS = [
  { Icon: Heart, label: "highlight1", color: "text-rose-400", bg: "bg-rose-500/10" },
  { Icon: Home, label: "highlight2", color: "text-blue-400", bg: "bg-blue-500/10" },
  { Icon: Coins, label: "highlight3", color: "text-amber-400", bg: "bg-amber-500/10" },
  { Icon: Palette, label: "highlight4", color: "text-purple-400", bg: "bg-purple-500/10" },
];

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Replace plain room preview with Gameboy frame showcase that cycles
//          through beautiful skins (wave, flowers, hearts, etc.)
function PetRoomDemo() {
  const [frame, setFrame] = useState(0);
  const [roomIdx, setRoomIdx] = useState(0);
  const [skinIdx, setSkinIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAME_COUNT), FRAME_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRoomIdx((r) => (r + 1) % ROOM_CYCLE.length), ROOM_CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSkinIdx((s) => (s + 1) % SHOWCASE_SKINS.length), SKIN_CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const room = ROOM_CYCLE[roomIdx];
  const skin = SHOWCASE_SKINS[skinIdx];

  const screenTopPct = (GB_SCREEN_T / GB_H) * 100;
  const screenLeftPct = (GB_SCREEN_L / GB_W) * 100;
  const screenWPct = (GB_SCREEN_S / GB_W) * 100;
  const screenHPct = (GB_SCREEN_S / GB_H) * 100;

  return (
    <div className="relative" style={{ width: SHOWCASE_W, maxWidth: "100%" }}>
      <div className="absolute -inset-10 bg-gradient-to-br from-purple-500/25 via-blue-500/15 to-pink-500/10 rounded-3xl blur-3xl opacity-60" />

      <div className="relative" style={{ aspectRatio: `${GB_W} / ${GB_H}` }}>
        {/* Pet room screen (behind frame) */}
        <div
          className="absolute overflow-hidden z-0"
          style={{
            top: `${screenTopPct}%`,
            left: `${screenLeftPct}%`,
            width: `${screenWPct}%`,
            height: `${screenHPct}%`,
            backgroundColor: "#0a0e1a",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={room.prefix}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src={blobUrl(room.wall)} alt="" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }} draggable={false} />
              <img src={blobUrl(room.floor)} alt="" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }} draggable={false} />
              <img src={blobUrl(room.mat)} alt="" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }} draggable={false} />

              <div className="absolute" style={{ left: "30%", top: "52.5%", width: "40%", height: "40%" }}>
                {LION_PARTS.map((part) => (
                  <img
                    key={`${part}-${frame}`}
                    src={blobUrl(`lion/${part}/${part}_${frame + 1}.png`)}
                    alt=""
                    className="absolute inset-0 w-full h-full"
                    style={{ imageRendering: "pixelated" }}
                    draggable={false}
                  />
                ))}
                <img
                  key={`expr-${frame}`}
                  src={blobUrl(`lion/expressions/happy/face_${frame + 1}.png`)}
                  alt=""
                  className="absolute inset-0 w-full h-full"
                  style={{ imageRendering: "pixelated" }}
                  draggable={false}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Gameboy frame overlay — crossfades through showcase skins */}
        <AnimatePresence>
          <motion.div
            key={skin.path}
            className="absolute inset-0 z-10 pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={blobUrl(skin.path)}
              alt={skin.label}
              className="w-full"
              style={{ imageRendering: "pixelated" }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skin label below frame */}
      <div className="mt-3 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={skin.label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <Palette className="h-3 w-3" />
            {skin.label} Skin
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
// --- END AI-MODIFIED ---

export function LionGotchiHeroSection() {
  const { t } = useTranslation("homepage");

  return (
    <section className="py-20 lg:py-28 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_30%_50%,_rgba(147,51,234,0.06),_transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
        <motion.div
          className="text-center mb-14 lg:mb-18"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Virtual Pet System
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            {t("liongotchi.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t("liongotchi.subtitle")}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className="flex-shrink-0"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <PetRoomDemo />
          </motion.div>

          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              {t("liongotchi.description")}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {LION_HIGHLIGHTS.map((h) => (
                <motion.div
                  key={h.label}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:border-primary/20 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${h.bg} flex-shrink-0`}>
                    <h.Icon className={`h-4 w-4 ${h.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {t(`liongotchi.${h.label}`)}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <Link href="/pet">
                <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-colors">
                  {t("liongotchi.cta")}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. Farm Showcase Section — fixed scale, animated day/night cycle
// ---------------------------------------------------------------------------

const FARM_SCALE = 3;
const FARM_SCENE_PX = 200 * FARM_SCALE;

const PLOT_CENTERS: [number, number][] = [
  [40, 138], [32, 154], [22, 174],
  [71, 138], [66, 154], [60, 174],
  [100, 138], [100, 154], [100, 174],
  [128, 138], [132, 154], [139, 174],
  [158, 138], [166, 154], [176, 174],
];

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Reduced heights to prevent tree overflow on edge plots (matched to bot renderer)
const STAGE_HEIGHTS: Record<number, number> = {
  0: 0, 1: 18, 2: 24, 3: 30, 4: 36, 5: 44,
};
// --- END AI-MODIFIED ---

const RARITY_GLOW_CSS: Record<string, string> = {
  COMMON: "",
  UNCOMMON: "drop-shadow(0 0 3px rgba(64,128,240,0.6))",
  RARE: "drop-shadow(0 0 4px rgba(224,64,64,0.7))",
  EPIC: "drop-shadow(0 0 5px rgba(240,192,64,0.8))",
  LEGENDARY: "drop-shadow(0 0 6px rgba(208,96,240,0.9)) drop-shadow(0 0 12px rgba(208,96,240,0.4))",
};

const LEAF_PARTICLES = [
  { x: 18, y: 35 }, { x: 72, y: 28 }, { x: 145, y: 42 },
  { x: 55, y: 70 }, { x: 118, y: 52 }, { x: 35, y: 95 }, { x: 160, y: 85 },
];
const FIREFLY_POSITIONS = [
  { x: 28, y: 55 }, { x: 85, y: 40 }, { x: 155, y: 65 },
  { x: 65, y: 85 }, { x: 125, y: 48 }, { x: 40, y: 110 }, { x: 170, y: 100 },
];
const LEAF_COLORS = ["#6eaa3c", "#a0be32", "#829246", "#b4a028"];

const RARITY_COLOR_INDEX: Record<string, number> = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 };

interface MockPlot {
  stage: number;
  typeId: number;
  rarity: string;
  watered: boolean;
  readyToHarvest: boolean;
}

const ACTIVE_PLOTS = [3, 4, 5, 6, 7, 8, 9, 10, 11];

function useFarmAnimation(): MockPlot[] {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const rarities = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];
    return PLOT_CENTERS.map((_, i) => {
      if (!ACTIVE_PLOTS.includes(i)) {
        return { stage: 0, typeId: 1, rarity: "COMMON", watered: false, readyToHarvest: false };
      }
      const offset = (tick + i * 3) % 35;
      const stage = Math.min(5, Math.floor(offset / 6));
      const rarity = rarities[i % rarities.length];
      const watered = offset % 5 < 3;
      const readyToHarvest = stage === 5;
      const typeId = (i % 5) + 1;
      return { stage, typeId, rarity, watered, readyToHarvest };
    });
  }, [tick]);
}

const FARM_HIGHLIGHTS = [
  { Icon: Sprout, label: "highlight1", color: "text-green-400", bg: "bg-green-500/10" },
  { Icon: Droplets, label: "highlight2", color: "text-blue-400", bg: "bg-blue-500/10" },
  { Icon: Coins, label: "highlight3", color: "text-amber-400", bg: "bg-amber-500/10" },
  { Icon: Gem, label: "highlight4", color: "text-purple-400", bg: "bg-purple-500/10" },
];

const DAY_NIGHT_CYCLE_MS = 10000;

function FarmSceneDemo() {
  const plots = useFarmAnimation();
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setIsNight((n) => !n), DAY_NIGHT_CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative" style={{ width: FARM_SCENE_PX, height: FARM_SCENE_PX, maxWidth: "100%" }}>
      <div className="absolute -inset-6 bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-transparent rounded-3xl blur-3xl opacity-50" />

      <div
        className="relative overflow-hidden rounded-xl border-2 border-border/60 shadow-2xl"
        style={{ width: FARM_SCENE_PX, height: FARM_SCENE_PX, maxWidth: "100%" }}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${FARM_SCALE})`,
            imageRendering: "pixelated" as any,
          }}
        >
          {/* Day + Night backgrounds with crossfade */}
          <img
            src={blobUrl("farm/backgrounds/farm_day.png")}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ imageRendering: "pixelated", opacity: isNight ? 0 : 1, transition: "opacity 2s ease" }}
            draggable={false}
          />
          <img
            src={blobUrl("farm/backgrounds/farm_night.png")}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ imageRendering: "pixelated", opacity: isNight ? 1 : 0, transition: "opacity 2s ease" }}
            draggable={false}
          />

          {/* Leaf particles (daytime) */}
          {LEAF_PARTICLES.map((leaf, i) => (
            <div
              key={`leaf-${i}`}
              className="absolute animate-drift"
              style={{
                left: leaf.x, top: leaf.y,
                width: 3, height: 2,
                backgroundColor: LEAF_COLORS[i % LEAF_COLORS.length],
                animationDelay: `${i * 1.1}s`,
                animationDuration: `${6 + (i % 3) * 2}s`,
                zIndex: 5,
                opacity: isNight ? 0 : 1,
                transition: "opacity 2s ease",
              }}
            />
          ))}

          {/* Fireflies (nighttime) */}
          {FIREFLY_POSITIONS.map((ff, i) => (
            <div
              key={`firefly-${i}`}
              className="absolute animate-firefly"
              style={{
                left: ff.x, top: ff.y,
                width: 3, height: 3,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,120,0.9)",
                boxShadow: "0 0 4px 2px rgba(255,255,100,0.3)",
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + (i % 3)}s`,
                zIndex: 5,
                opacity: isNight ? 1 : 0,
                transition: "opacity 2s ease",
              }}
            />
          ))}

          {/* Soil overlays */}
          {PLOT_CENTERS.map((_, plotNum) => {
            const plot = plots[plotNum];
            const dir = plot.watered ? "watered" : "dry";
            const prefix = plot.watered ? "watered" : "dry";
            return (
              <img
                key={`soil-${plotNum}`}
                src={blobUrl(`farm/soil/${dir}/${prefix}soil${plotNum + 1}.png`)}
                alt=""
                className="absolute inset-0 w-full h-full"
                style={{ imageRendering: "pixelated" }}
                draggable={false}
              />
            );
          })}

          {/* Water shimmer on watered plots */}
          {PLOT_CENTERS.map(([cx, cy], plotNum) => {
            const plot = plots[plotNum];
            if (plot.stage < 1 || !plot.watered) return null;
            return (
              <div
                key={`shimmer-${plotNum}`}
                className="absolute animate-shimmer"
                style={{
                  left: cx - 7, top: cy - 1,
                  width: 14, height: 4,
                  backgroundColor: "rgba(100,170,255,0.25)",
                  zIndex: 10,
                  animationDelay: `${plotNum * 0.2}s`,
                }}
              />
            );
          })}

          {/* Plants */}
          {PLOT_CENTERS.map(([cx, cy], plotNum) => {
            const plot = plots[plotNum];
            if (plot.stage < 1) return null;

            const h = STAGE_HEIGHTS[plot.stage] || 20;
            const w = Math.round(h * 0.75);
            const color = RARITY_COLOR_INDEX[plot.rarity] || 1;
            const clampedStage = Math.min(Math.max(plot.stage, 1), 5);
            const idx = (plot.typeId - 1) * 25 + (color - 1) * 5 + clampedStage;
            const imgUrl = blobUrl(`farm/trees/trees_${String(idx).padStart(2, "0")}.png`);
            const glowFilter = RARITY_GLOW_CSS[plot.rarity] || "";
            const hasGlow = plot.rarity !== "COMMON" && plot.stage >= 2;
            const swayClass = plot.stage >= 4 ? "animate-sway-fast" : plot.stage >= 2 ? "animate-sway-slow" : "";

            return (
              <img
                key={`plant-${plotNum}`}
                src={imgUrl}
                alt=""
                className={`absolute ${swayClass} ${plot.readyToHarvest ? "animate-harvest-pulse" : ""}`}
                style={{
                  left: cx - w / 2,
                  top: cy - h + 4,
                  height: h,
                  width: w,
                  objectFit: "contain",
                  imageRendering: "pixelated",
                  filter: hasGlow ? glowFilter : undefined,
                  zIndex: cy,
                  animationDelay: `${plotNum * 0.3}s`,
                }}
                draggable={false}
              />
            );
          })}

          {/* Harvest sparkles + coins */}
          {PLOT_CENTERS.map(([cx, cy], plotNum) => {
            const plot = plots[plotNum];
            if (!plot.readyToHarvest) return null;
            const h = STAGE_HEIGHTS[5] || 44;
            return (
              <React.Fragment key={`fx-${plotNum}`}>
                <img
                  src={blobUrl(`farm/animations/sparkle_${String(((plotNum % 3) + 1)).padStart(2, "0")}.png`)}
                  alt=""
                  className="absolute animate-sparkle"
                  style={{
                    left: cx - 10, top: cy - h - 6,
                    width: 20, height: 12,
                    imageRendering: "pixelated",
                    zIndex: cy + 2,
                    animationDelay: `${plotNum * 0.2}s`,
                  }}
                  draggable={false}
                />
                <img
                  src={blobUrl("ui/icons/coin.png")}
                  alt=""
                  className="absolute animate-coin-bob"
                  style={{
                    left: cx + 6, top: cy - h - 12,
                    width: 8, height: 8,
                    imageRendering: "pixelated",
                    zIndex: cy + 3,
                    animationDelay: `${plotNum * 0.4}s`,
                  }}
                  draggable={false}
                />
              </React.Fragment>
            );
          })}
        </div>

        {/* Day/night indicator */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm border border-border/60 text-[11px] text-muted-foreground z-10 transition-all duration-1000">
          {isNight ? "🌙 Night" : "☀️ Day"}
        </div>
      </div>
    </div>
  );
}

export function FarmShowcaseSection() {
  const { t } = useTranslation("homepage");

  return (
    <section className="py-20 lg:py-28 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_70%_50%,_rgba(34,197,94,0.06),_transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          <motion.div
            className="flex-shrink-0 flex items-center justify-center w-full lg:w-auto overflow-hidden"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <FarmSceneDemo />
          </motion.div>

          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Sprout className="h-3.5 w-3.5" />
              Virtual Farm
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              {t("farm.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mb-4">
              {t("farm.subtitle")}
            </motion.p>
            <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              {t("farm.description")}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FARM_HIGHLIGHTS.map((h) => (
                <motion.div
                  key={h.label}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:border-primary/20 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${h.bg} flex-shrink-0`}>
                    <h.Icon className={`h-4 w-4 ${h.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {t(`farm.${h.label}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Marketplace Showcase Section — real items from API
// ---------------------------------------------------------------------------

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0",
};
const RARITY_TEXT: Record<string, string> = {
  COMMON: "#8899aa", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff",
};
const RARITY_SHADOW: Record<string, string> = {
  COMMON: "", UNCOMMON: "0 0 12px rgba(64,128,240,0.3)",
  RARE: "0 0 12px rgba(224,64,64,0.3)", EPIC: "0 0 16px rgba(240,192,64,0.4)",
  LEGENDARY: "0 0 20px rgba(208,96,240,0.5)",
};

interface ShowcaseItem {
  id: number;
  name: string;
  category: string;
  rarity: string;
  assetPath: string | null;
  goldPrice: number | null;
  gemPrice: number | null;
}

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Use real item asset_paths so actual PNGs render instead of emoji placeholders
const FALLBACK_ITEMS: ShowcaseItem[] = [
  { id: 114, name: "Sparkle Tiara", category: "HAT", rarity: "COMMON", assetPath: "hats/crown.png", goldPrice: 150, gemPrice: null },
  { id: 953, name: "Rose Petal", category: "MATERIAL", rarity: "UNCOMMON", assetPath: "materials/rose_petal.png", goldPrice: 350, gemPrice: null },
  { id: 1153, name: "Lucky Scroll", category: "SCROLL", rarity: "UNCOMMON", assetPath: "scrolls/lucky_scroll.png", goldPrice: 500, gemPrice: null },
  { id: 1156, name: "Arcane Scroll", category: "SCROLL", rarity: "RARE", assetPath: "scrolls/arcane_scroll.png", goldPrice: 1200, gemPrice: null },
  { id: 303, name: "Phantom Visage", category: "GLASSES", rarity: "EPIC", assetPath: "glasses/anonymous_mask_epic.png", goldPrice: 3500, gemPrice: null },
  { id: 1021, name: "Griffin Feather", category: "MATERIAL", rarity: "EPIC", assetPath: "materials/griffin_feather.png", goldPrice: 2800, gemPrice: null },
  { id: 454, name: "Titan Slayer Jacket", category: "SHIRT", rarity: "EPIC", assetPath: "shirts/aot_shirt_aot_shirt_epic.png", goldPrice: 4100, gemPrice: null },
  { id: 804, name: "Bouncy Kicks", category: "BOOTS", rarity: "LEGENDARY", assetPath: "boots/boots_boots_legendary_.png", goldPrice: 6500, gemPrice: null },
  { id: 1159, name: "Divine Scroll", category: "SCROLL", rarity: "LEGENDARY", assetPath: "scrolls/divine_scroll.png", goldPrice: null, gemPrice: 80 },
  { id: 1028, name: "Ethereal Orchid", category: "MATERIAL", rarity: "LEGENDARY", assetPath: "materials/ethereal_orchid.png", goldPrice: 8500, gemPrice: null },
];
// --- END AI-MODIFIED ---

const itemsFetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to load items");
    return r.json();
  });

function MockItemCard({ item }: { item: ShowcaseItem }) {
  const borderColor = RARITY_BORDER[item.rarity] || RARITY_BORDER.COMMON;
  const textColor = RARITY_TEXT[item.rarity] || RARITY_TEXT.COMMON;
  const shadow = RARITY_SHADOW[item.rarity] || "";
  const imgUrl = item.assetPath ? getItemImageUrl(item.assetPath, item.category) : null;
  const emoji = getCategoryPlaceholder(item.category);
  const price = item.goldPrice ?? item.gemPrice ?? 0;
  const isGem = item.goldPrice == null && item.gemPrice != null;

  return (
    <div className="flex-shrink-0 w-44">
      <div
        className="bg-[#0f1628] border-2 p-3 flex flex-col gap-2 hover:brightness-110 transition-all shadow-[2px_2px_0_#060810]"
        style={{ borderColor, boxShadow: shadow ? `2px 2px 0 #060810, ${shadow}` : "2px 2px 0 #060810" }}
      >
        <div className="relative w-full aspect-square flex items-center justify-center bg-[#0a0e1a] border border-[#1a2a3c]">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={item.name}
              className="w-full h-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <span className="text-4xl">{emoji}</span>
          )}
          <span
            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold border bg-[#0f1628]/90"
            style={{ borderColor, color: textColor }}
          >
            {item.rarity.slice(0, 3)}
          </span>
        </div>

        <p className="text-[13px] text-center truncate w-full font-medium" style={{ color: textColor }}>
          {item.name}
        </p>

        <div className="flex items-center justify-center gap-1.5">
          <img
            src={blobUrl(isGem ? "ui/icons/gem.png" : "ui/icons/coin.png")}
            alt=""
            width={16}
            height={16}
            style={{ imageRendering: "pixelated" }}
          />
          <span className="text-sm font-bold" style={{ color: isGem ? "#a855f7" : "#f0c040" }}>
            {price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

const MARKETPLACE_HIGHLIGHTS = [
  { Icon: ShoppingBag, label: "highlight1", color: "text-amber-400", bg: "bg-amber-500/10" },
  { Icon: Tags, label: "highlight2", color: "text-green-400", bg: "bg-green-500/10" },
  { Icon: Sparkles, label: "highlight3", color: "text-purple-400", bg: "bg-purple-500/10" },
  { Icon: TrendingUp, label: "highlight4", color: "text-blue-400", bg: "bg-blue-500/10" },
];

function MarketplaceCarousel({ items }: { items: ShowcaseItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame: number;
    let pos = 0;
    const speed = 0.5;
    const itemWidth = 192;
    const totalWidth = items.length * itemWidth;

    const scroll = () => {
      if (!isPaused) {
        pos += speed;
        if (pos >= totalWidth) pos = 0;
        el.scrollLeft = pos;
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [isPaused, items.length]);

  const doubled = [...items, ...items];

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-hidden py-4 px-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {doubled.map((item, i) => (
        <MockItemCard key={`${item.id}-${i}`} item={item} />
      ))}
    </div>
  );
}

export function MarketplaceShowcaseSection() {
  const { t } = useTranslation("homepage");
  const { data: apiItems } = useSWR<ShowcaseItem[]>("/api/public-showcase-items", itemsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600_000,
  });
  const items = apiItems && apiItems.length > 0 ? apiItems : FALLBACK_ITEMS;

  return (
    <section className="py-20 lg:py-28 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_30%,_rgba(240,192,64,0.05),_transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            <ShoppingBag className="h-3.5 w-3.5" />
            Player Marketplace
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t("marketplace.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("marketplace.subtitle")}
          </p>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mb-12"
        >
          <MarketplaceCarousel items={items} />
        </motion.div>

        <motion.div
          className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeUp} className="flex-1 text-center lg:text-left">
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              {t("marketplace.description")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MARKETPLACE_HIGHLIGHTS.map((h) => (
                <motion.div
                  key={h.label}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:border-primary/20 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${h.bg} flex-shrink-0`}>
                    <h.Icon className={`h-4 w-4 ${h.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {t(`marketplace.${h.label}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* --- AI-MODIFIED (2026-03-20) --- */}
          {/* Purpose: Replaced fake stats with a real rarity guide */}
          <motion.div variants={fadeUp} className="flex-shrink-0 w-full max-w-xs">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-lg p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Gem className="h-4 w-4 text-purple-400" />
                Item Rarities
              </div>
              <div className="space-y-2.5">
                {[
                  { rarity: "Common", dot: "#6a7a8a", desc: "Easy to find" },
                  { rarity: "Uncommon", dot: "#4080f0", desc: "A bit harder" },
                  { rarity: "Rare", dot: "#e04040", desc: "Sought after" },
                  { rarity: "Epic", dot: "#f0c040", desc: "Powerful gear" },
                  { rarity: "Legendary", dot: "#d060f0", desc: "Extremely rare" },
                ].map((tier) => (
                  <div key={tier.rarity} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tier.dot, boxShadow: `0 0 6px ${tier.dot}60` }}
                    />
                    <span className="text-sm font-medium text-foreground flex-1">{tier.rarity}</span>
                    <span className="text-xs text-muted-foreground">{tier.desc}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Higher rarity items are harder to obtain and more valuable on the marketplace.
                </p>
              </div>
            </div>
          </motion.div>
          {/* --- END AI-MODIFIED --- */}
        </motion.div>
      </div>
    </section>
  );
}
