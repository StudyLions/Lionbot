// ============================================================
// AI-REPLACED FILE (2026-04-25)
// Reason: The previous 1,200-line vertical settings form felt
//         "AI sloppy". This rewrite ships the LionHeart Studio
//         redesign: tier-colored hero with animated boost shelf,
//         a sticky Discord-mock live preview pane, debounced
//         auto-render + auto-save (no Save button), tabbed
//         controls (Looks / Colors / Motion / Frame / Profile),
//         curated card looks with one-click apply, and a mini
//         delta-highlighted upgrade carousel + thank-you card.
// What the new code does better:
//   - Replaces 6 ColorSection + 14-swatch grids with a single
//     palette node graph + HSL sliders + harmony auto-fill.
//   - Sticky live preview means users see effects in real time
//     without scrolling between editor and preview.
//   - Auto-debounced save and render mean no Save / Refresh
//     Preview button hunting.
//   - Compare mode side-by-sides saved vs draft.
//   - Curated "Looks" gallery is the gateway for non-power users.
// Original 1,200-line file lives in git history under hash on
// the staging branch, ref: pages/dashboard/supporter.tsx@HEAD~1.
// --- END AI-REPLACED ---
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Sparkles, Palette, CircleDot, Frame, User } from "lucide-react";

import Layout from "@/components/Layout/Layout";
import AdminGuard from "@/components/dashboard/AdminGuard";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { DashboardShell, TabBar, toast } from "@/components/dashboard/ui";
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard";

import StudioHero from "@/components/dashboard/supporter/StudioHero";
import StickyPreview, { SaveStatus } from "@/components/dashboard/supporter/StickyPreview";
import LooksGallery from "@/components/dashboard/supporter/LooksGallery";
import ColorsTab from "@/components/dashboard/supporter/ColorsTab";
import MotionTab from "@/components/dashboard/supporter/MotionTab";
import FrameTab from "@/components/dashboard/supporter/FrameTab";
import ProfileTab from "@/components/dashboard/supporter/ProfileTab";
import UpgradeMiniCarousel from "@/components/dashboard/supporter/UpgradeMiniCarousel";

import {
  DEFAULT_CARD_PREFS,
  DEFAULT_TIMER_PREFS,
  type CardPreferences,
  type SubscriptionData,
  type TimerPreferences,
  tierPalette,
} from "@/components/dashboard/supporter/types";
import { CARD_LOOKS, randomLook, type CardLook } from "@/constants/CardLookPresets";

const RENDER_DEBOUNCE_MS = 800;
const SAVE_DEBOUNCE_MS = 600;
const SAVED_PILL_TTL_MS = 1800;

type StudioTab = "looks" | "colors" | "motion" | "frame" | "profile";

const TAB_DEFS: Array<{ key: StudioTab; label: string; icon: React.ReactNode }> = [
  { key: "looks", label: "Looks", icon: <Sparkles size={14} /> },
  { key: "colors", label: "Colors", icon: <Palette size={14} /> },
  { key: "motion", label: "Motion", icon: <CircleDot size={14} /> },
  { key: "frame", label: "Frame", icon: <Frame size={14} /> },
  { key: "profile", label: "Profile", icon: <User size={14} /> },
];

/**
 * Strip transient/local-only keys before comparing two pref
 * objects for equality. Currently no-op but keeps a stable
 * comparison helper as the schema grows.
 */
function prefsEqual(a: CardPreferences, b: CardPreferences): boolean {
  const keys = Object.keys(DEFAULT_CARD_PREFS) as Array<keyof CardPreferences>;
  for (const k of keys) {
    if ((a[k] ?? null) !== (b[k] ?? null)) return false;
  }
  return true;
}

function timerEqual(a: TimerPreferences, b: TimerPreferences): boolean {
  return (
    a.theme === b.theme &&
    (a.custom_accent_color ?? null) === (b.custom_accent_color ?? null) &&
    (a.focus_label ?? null) === (b.focus_label ?? null) &&
    (a.break_label ?? null) === (b.break_label ?? null) &&
    (a.session_label ?? null) === (b.session_label ?? null)
  );
}

function buildPreviewQuery(prefs: CardPreferences): string {
  const params = new URLSearchParams();
  params.set("effects_enabled", String(prefs.effects_enabled));
  params.set("sparkles_enabled", String(prefs.sparkles_enabled));
  params.set("ring_enabled", String(prefs.ring_enabled));
  params.set("edge_glow_enabled", String(prefs.edge_glow_enabled));
  params.set("particles_enabled", String(prefs.particles_enabled));
  params.set("effect_intensity", prefs.effect_intensity);
  params.set("particle_style", prefs.particle_style);
  params.set("animation_speed", prefs.animation_speed);
  params.set("border_style", prefs.border_style);
  params.set("seasonal_effects", String(prefs.seasonal_effects));
  if (prefs.sparkle_color) params.set("sparkle_color", prefs.sparkle_color);
  if (prefs.ring_color) params.set("ring_color", prefs.ring_color);
  if (prefs.edge_glow_color) params.set("edge_glow_color", prefs.edge_glow_color);
  if (prefs.particle_color) params.set("particle_color", prefs.particle_color);
  return params.toString();
}

/**
 * Detect which curated look (if any) a prefs object exactly
 * matches. Used to render the active dot in the Looks gallery.
 */
function detectActiveLook(prefs: CardPreferences): string | null {
  for (const look of CARD_LOOKS) {
    let matches = true;
    for (const k of Object.keys(look.prefs) as Array<keyof typeof look.prefs>) {
      if ((look.prefs[k] ?? null) !== (prefs[k] ?? null)) {
        matches = false;
        break;
      }
    }
    if (matches) return look.id;
  }
  return null;
}

export default function SupporterPage() {
  const { data: session } = useSession();

  const { data: sub, isLoading: subLoading } = useDashboard<SubscriptionData>(
    session ? "/api/dashboard/subscription" : null
  );
  const { data: prefsData, isLoading: prefsLoading } = useDashboard<CardPreferences>(
    session ? "/api/dashboard/card-preferences" : null
  );
  const { data: timerPrefsData } = useDashboard<TimerPreferences>(
    session ? "/api/dashboard/focus-preferences" : null
  );

  const [prefs, setPrefs] = useState<CardPreferences>(DEFAULT_CARD_PREFS);
  const [savedPrefs, setSavedPrefs] = useState<CardPreferences>(DEFAULT_CARD_PREFS);
  const [timerPrefs, setTimerPrefs] = useState<TimerPreferences>(DEFAULT_TIMER_PREFS);
  const [savedTimerPrefs, setSavedTimerPrefs] = useState<TimerPreferences>(DEFAULT_TIMER_PREFS);

  const [tab, setTab] = useState<StudioTab>("looks");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedPreviewUrl, setSavedPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Keep refs to latest state to avoid re-creating debounce timers on every change.
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const timerPrefsRef = useRef(timerPrefs);
  timerPrefsRef.current = timerPrefs;

  const renderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedPillTimerRef = useRef<NodeJS.Timeout | null>(null);
  const renderAbortRef = useRef<AbortController | null>(null);
  const savedPreviewAbortRef = useRef<AbortController | null>(null);
  const initialPreviewDone = useRef(false);
  const initialSavedPreviewDone = useRef(false);

  const isSupporter = sub?.status === "ACTIVE" && sub?.tier !== "NONE";
  const palette = tierPalette(sub?.tier);
  const defaultEffectColor = palette.hex;
  const activeLookId = useMemo(() => detectActiveLook(prefs), [prefs]);
  const hasUnsavedDraft = !prefsEqual(prefs, savedPrefs);

  // --- Sync server-fetched prefs into local draft state ----------------------
  useEffect(() => {
    if (prefsData) {
      const next = { ...DEFAULT_CARD_PREFS, ...prefsData };
      setPrefs(next);
      setSavedPrefs(next);
    }
  }, [prefsData]);

  useEffect(() => {
    if (timerPrefsData) {
      const next = { ...DEFAULT_TIMER_PREFS, ...timerPrefsData };
      setTimerPrefs(next);
      setSavedTimerPrefs(next);
    }
  }, [timerPrefsData]);

  // --- Render preview (debounced, abortable, in-flight dedup) ---------------
  const renderPreviewFor = useCallback(
    async (prefsToRender: CardPreferences, target: "draft" | "saved" = "draft") => {
      if (target === "draft") {
        renderAbortRef.current?.abort();
      } else {
        savedPreviewAbortRef.current?.abort();
      }
      const ac = new AbortController();
      if (target === "draft") {
        renderAbortRef.current = ac;
        setPreviewLoading(true);
        setPreviewError(null);
      } else {
        savedPreviewAbortRef.current = ac;
      }

      try {
        const url = `/api/dashboard/supporter-preview?${buildPreviewQuery(prefsToRender)}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Render failed (${res.status})`);
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (target === "draft") {
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objectUrl;
          });
        } else {
          setSavedPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objectUrl;
          });
        }
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === "AbortError") return;
        if (target === "draft") {
          const msg = (e as Error)?.message || "Card rendering service unavailable";
          setPreviewError(msg);
        }
      } finally {
        if (target === "draft") setPreviewLoading(false);
      }
    },
    []
  );

  // First render: kick off both the draft preview and the saved-snapshot baseline.
  useEffect(() => {
    if (isSupporter && prefsData && !initialPreviewDone.current) {
      initialPreviewDone.current = true;
      renderPreviewFor({ ...DEFAULT_CARD_PREFS, ...prefsData }, "draft");
    }
  }, [isSupporter, prefsData, renderPreviewFor]);

  useEffect(() => {
    if (isSupporter && prefsData && !initialSavedPreviewDone.current) {
      initialSavedPreviewDone.current = true;
      renderPreviewFor({ ...DEFAULT_CARD_PREFS, ...prefsData }, "saved");
    }
  }, [isSupporter, prefsData, renderPreviewFor]);

  // --- Auto-debounced render on prefs change --------------------------------
  useEffect(() => {
    if (!isSupporter || !initialPreviewDone.current) return;
    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    renderTimerRef.current = setTimeout(() => {
      renderPreviewFor(prefsRef.current, "draft");
    }, RENDER_DEBOUNCE_MS);
    return () => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    };
  }, [prefs, isSupporter, renderPreviewFor]);

  // --- Auto-debounced save (PATCH) ------------------------------------------
  useEffect(() => {
    if (!isSupporter || !initialPreviewDone.current) return;
    if (prefsEqual(prefs, savedPrefs)) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      const snapshot = prefsRef.current;
      try {
        const result = await dashboardMutate(
          "PATCH",
          "/api/dashboard/card-preferences",
          snapshot
        );
        const merged = { ...DEFAULT_CARD_PREFS, ...(result || snapshot) };
        setSavedPrefs(merged);
        renderPreviewFor(merged, "saved");
        setSaveStatus("saved");
        if (savedPillTimerRef.current) clearTimeout(savedPillTimerRef.current);
        savedPillTimerRef.current = setTimeout(() => setSaveStatus("idle"), SAVED_PILL_TTL_MS);
      } catch {
        setSaveStatus("error");
        toast.error("Couldn't save your changes \u2014 will retry on next edit");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [prefs, savedPrefs, isSupporter, renderPreviewFor]);

  // --- Auto-debounced save for timer prefs (separate endpoint) --------------
  useEffect(() => {
    if (!isSupporter) return;
    if (timerEqual(timerPrefs, savedTimerPrefs)) return;
    if (timerSaveTimerRef.current) clearTimeout(timerSaveTimerRef.current);
    timerSaveTimerRef.current = setTimeout(async () => {
      try {
        await dashboardMutate("PATCH", "/api/dashboard/focus-preferences", timerPrefsRef.current);
        setSavedTimerPrefs(timerPrefsRef.current);
      } catch {
        toast.error("Couldn't save timer settings");
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (timerSaveTimerRef.current) clearTimeout(timerSaveTimerRef.current);
    };
  }, [timerPrefs, savedTimerPrefs, isSupporter]);

  // --- Cleanup blob URLs on unmount -----------------------------------------
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (savedPreviewUrl) URL.revokeObjectURL(savedPreviewUrl);
      renderAbortRef.current?.abort();
      savedPreviewAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchPrefs = useCallback((patch: Partial<CardPreferences>) => {
    setPrefs((p) => ({ ...p, ...patch }));
  }, []);

  const patchTimer = useCallback((patch: Partial<TimerPreferences>) => {
    setTimerPrefs((p) => ({ ...p, ...patch }));
  }, []);

  const applyLook = useCallback(
    (look: CardLook) => {
      if (!isSupporter) return;
      setPrefs((p) => ({ ...p, ...look.prefs }));
      toast.success(`Applied "${look.name}"`);
      setTab("colors");
    },
    [isSupporter]
  );

  const onSurpriseMe = useCallback(() => {
    if (!isSupporter) return;
    const look = randomLook();
    setPrefs((p) => ({ ...p, ...look.prefs }));
    toast.success(`Surprise look: "${look.name}"`);
  }, [isSupporter]);

  const onResetAll = useCallback(() => {
    if (!isSupporter) return;
    setPrefs(DEFAULT_CARD_PREFS);
    toast.success("All card effects reset to defaults");
  }, [isSupporter]);

  const onManualRefresh = useCallback(() => {
    renderPreviewFor(prefsRef.current, "draft");
  }, [renderPreviewFor]);

  const loading = subLoading || prefsLoading;

  return (
    <Layout
      SEO={{
        title: "LionHeart Studio - LionBot Dashboard",
        description: "Customize your animated profile card and manage your LionHeart subscription.",
      }}
    >
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />} className="space-y-7" wide>
          {loading || !sub ? (
            <div className="space-y-6">
              <div className="bg-card/50 rounded-3xl h-48 animate-pulse" />
              <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6">
                <div className="bg-card/50 rounded-2xl h-80 animate-pulse" />
                <div className="bg-card/50 rounded-2xl h-96 animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <StudioHero
                sub={sub}
                isSupporter={!!isSupporter}
                onSurpriseMe={onSurpriseMe}
                onReset={onResetAll}
              />

              <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6">
                <StickyPreview
                  sub={sub}
                  isSupporter={!!isSupporter}
                  previewUrl={previewUrl}
                  savedPreviewUrl={savedPreviewUrl}
                  previewLoading={previewLoading}
                  previewError={previewError}
                  saveStatus={saveStatus}
                  onRefresh={onManualRefresh}
                  hasUnsavedDraft={hasUnsavedDraft}
                />

                <div className="space-y-5 min-w-0">
                  <TabBar
                    tabs={TAB_DEFS}
                    active={tab}
                    onChange={(k) => setTab(k as StudioTab)}
                    variant="pills"
                  />

                  <div
                    className={
                      isSupporter
                        ? ""
                        : "relative pointer-events-none opacity-60 select-none"
                    }
                  >
                    {tab === "looks" && (
                      <LooksGallery
                        activeLookId={activeLookId}
                        onPick={applyLook}
                        onSurprise={onSurpriseMe}
                        isSupporter={!!isSupporter}
                      />
                    )}
                    {tab === "colors" && (
                      <ColorsTab
                        prefs={prefs}
                        onChange={patchPrefs}
                        defaultColor={defaultEffectColor}
                      />
                    )}
                    {tab === "motion" && (
                      <MotionTab
                        prefs={prefs}
                        onChange={patchPrefs}
                        defaultParticleColor={defaultEffectColor}
                      />
                    )}
                    {tab === "frame" && (
                      <FrameTab
                        prefs={prefs}
                        onChange={patchPrefs}
                        defaultBorderColor={defaultEffectColor}
                      />
                    )}
                    {tab === "profile" && (
                      <ProfileTab
                        prefs={prefs}
                        onPrefsChange={patchPrefs}
                        timerPrefs={timerPrefs}
                        onTimerChange={patchTimer}
                        defaultEmbedColor={defaultEffectColor}
                      />
                    )}
                  </div>
                </div>
              </div>

              <UpgradeMiniCarousel currentTier={sub.tier ?? "NONE"} />
            </>
          )}
        </DashboardShell>
      </AdminGuard>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
});
