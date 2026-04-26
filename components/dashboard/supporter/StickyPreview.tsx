// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Sticky live-preview pane for the LionHeart Studio.
//          Wraps the rendered profile-card GIF in a Discord-style
//          chat frame so users see exactly how their card lands
//          in chat, with a status pill (Saved / Rendering / Error)
//          and a compare toggle that side-by-sides the saved
//          version against the draft.
// ============================================================
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  RefreshCw,
  ImageOff,
  Check,
  AlertCircle,
  Download,
  GitCompare,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { tierPalette, mockChatTimestamp } from "./types";
import type { SubscriptionData } from "./types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface StickyPreviewProps {
  sub: SubscriptionData;
  isSupporter: boolean;
  previewUrl: string | null;
  savedPreviewUrl: string | null;
  previewLoading: boolean;
  previewError: string | null;
  saveStatus: SaveStatus;
  onRefresh: () => void;
  /**
   * Whether the local draft prefs differ from the version persisted
   * to the DB. Drives the "Compare" toggle availability.
   */
  hasUnsavedDraft: boolean;
}

/**
 * Mock Discord chat header (avatar + username + timestamp + a fake
 * "Studied 2h today" message) wrapped around the preview image.
 */
function DiscordChatFrame({
  username,
  avatarUrl,
  tierColor,
  isSupporter,
  children,
}: {
  username: string;
  avatarUrl: string | null;
  tierColor: string;
  isSupporter: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/40"
      style={{ background: "#313338" }}
    >
      <div className="px-4 pt-3 pb-2 flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
          style={{
            background: avatarUrl ? "transparent" : "linear-gradient(135deg, #5865F2, #8B5CF6)",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            (username[0] || "L").toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className="font-semibold text-sm truncate"
              style={{ color: isSupporter ? tierColor : "#FFFFFF" }}
            >
              {username}
            </span>
            <span className="text-[11px] text-[#949BA4]">{mockChatTimestamp()}</span>
          </div>
          <div className="text-[13px] text-[#DBDEE1] mt-0.5 leading-snug">
            Just hit <span className="font-semibold text-white">2h 14m</span> of focused
            study today — here&apos;s my profile
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusPill({
  saveStatus,
  loading,
}: {
  saveStatus: SaveStatus;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-[11px] font-medium text-blue-300">
        <RefreshCw size={11} className="animate-spin" />
        Rendering…
      </div>
    );
  }
  if (saveStatus === "saving") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-medium text-amber-300">
        <RefreshCw size={11} className="animate-spin" />
        Saving…
      </div>
    );
  }
  if (saveStatus === "saved") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-medium text-emerald-300">
        <Check size={11} />
        Saved
      </div>
    );
  }
  if (saveStatus === "error") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-medium text-rose-300">
        <AlertCircle size={11} />
        Save failed
      </div>
    );
  }
  return null;
}

export default function StickyPreview({
  sub,
  isSupporter,
  previewUrl,
  savedPreviewUrl,
  previewLoading,
  previewError,
  saveStatus,
  onRefresh,
  hasUnsavedDraft,
}: StickyPreviewProps) {
  const { data: session } = useSession();
  const palette = tierPalette(sub.tier);
  const [compareMode, setCompareMode] = useState(false);

  const username = session?.user?.name || "lionheart";
  const avatarUrl = session?.user?.image || null;

  const downloadPreview = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "lionheart-card-preview.gif";
    a.click();
  };

  const showCompare = compareMode && savedPreviewUrl && previewUrl && hasUnsavedDraft;

  return (
    <div className="lg:sticky lg:top-6 space-y-3">
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-2 rounded-3xl pointer-events-none blur-2xl opacity-50"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${palette.soft} 0%, transparent 60%)`,
          }}
        />

        <div className="relative space-y-3">
          {showCompare ? (
            <div className="grid grid-cols-2 gap-2">
              <DiscordChatFrame
                username={username}
                avatarUrl={avatarUrl}
                tierColor={palette.hex}
                isSupporter={isSupporter}
              >
                <div className="px-4 pb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#949BA4] mb-1.5">
                    Saved
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={savedPreviewUrl!} alt="" className="w-full rounded-md" />
                </div>
              </DiscordChatFrame>
              <DiscordChatFrame
                username={username}
                avatarUrl={avatarUrl}
                tierColor={palette.hex}
                isSupporter={isSupporter}
              >
                <div className="px-4 pb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: palette.hex }}>
                    Draft
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl!} alt="" className="w-full rounded-md" />
                </div>
              </DiscordChatFrame>
            </div>
          ) : (
            <DiscordChatFrame
              username={username}
              avatarUrl={avatarUrl}
              tierColor={palette.hex}
              isSupporter={isSupporter}
            >
              <div
                className={cn(
                  "relative w-full",
                  !previewUrl && "min-h-[180px] sm:min-h-[220px]"
                )}
              >
                {previewLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#313338]/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={22} className="text-[#DBDEE1] animate-spin" />
                      <span className="text-[11px] text-[#949BA4]">Rendering…</span>
                    </div>
                  </div>
                )}

                {!isSupporter && !previewLoading && !previewUrl && (
                  <div className="px-4 pb-4 pt-2">
                    <div
                      className="rounded-lg flex flex-col items-center justify-center text-center px-6 py-10"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(91, 141, 239, 0.08), rgba(168, 85, 247, 0.08))",
                        border: "1px dashed rgba(255,255,255,0.15)",
                      }}
                    >
                      <Sparkles size={22} className="text-[#A78BFA] mb-2" />
                      <p className="text-[12px] text-[#DBDEE1] font-medium">
                        Live preview unlocks with LionHeart
                      </p>
                      <p className="text-[11px] text-[#949BA4] mt-1 max-w-[220px]">
                        Your draft settings will render here in real time once you subscribe.
                      </p>
                    </div>
                  </div>
                )}

                {previewError && !previewLoading && (
                  <div className="px-4 pb-4 pt-2">
                    <div className="flex flex-col items-center gap-2 text-center px-6 py-10 rounded-lg bg-rose-500/5 border border-rose-500/20">
                      <ImageOff size={22} className="text-rose-300" />
                      <span className="text-[12px] text-[#DBDEE1]">{previewError}</span>
                      <Button variant="ghost" size="sm" onClick={onRefresh} className="mt-1 h-7 text-[11px]">
                        <RefreshCw size={11} className="mr-1" /> Try again
                      </Button>
                    </div>
                  </div>
                )}

                {previewUrl && !previewError && (
                  <div className="px-4 pb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Profile card preview" className="w-full rounded-md" />
                  </div>
                )}
              </div>
            </DiscordChatFrame>
          )}

          <div className="flex items-center justify-between gap-2 px-1">
            <StatusPill saveStatus={saveStatus} loading={previewLoading} />

            <div className="flex items-center gap-1">
              {isSupporter && (
                <>
                  <button
                    onClick={() => setCompareMode((v) => !v)}
                    disabled={!savedPreviewUrl || !previewUrl || !hasUnsavedDraft}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors",
                      compareMode
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-card",
                      (!savedPreviewUrl || !previewUrl || !hasUnsavedDraft) &&
                        "opacity-40 cursor-not-allowed"
                    )}
                    title="Side-by-side: saved vs draft"
                  >
                    {compareMode ? <Eye size={12} /> : <GitCompare size={12} />}
                    {compareMode ? "Single" : "Compare"}
                  </button>
                  <button
                    onClick={onRefresh}
                    disabled={previewLoading}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-40"
                    title="Re-render now"
                  >
                    <RefreshCw size={12} className={cn(previewLoading && "animate-spin")} />
                    Refresh
                  </button>
                  <button
                    onClick={downloadPreview}
                    disabled={!previewUrl}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-40"
                    title="Download GIF"
                  >
                    <Download size={12} />
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/70 px-1 leading-relaxed">
            Updates render automatically a moment after you tweak something. Saves happen in
            the background — no Save button needed.
          </p>
        </div>
      </div>
    </div>
  );
}
