// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Consolidate the three separate LionGotchi homepage
//          sections (pet room / farm / marketplace) into one
//          unified section with a sub-tab strip. Reduces ~600px
//          of vertical scroll and tells a tighter "ecosystem"
//          story while reusing the existing demo components
//          unchanged.
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";
import { Sparkles, Sprout, Store } from "lucide-react";
import {
  LionGotchiHeroSection,
  FarmShowcaseSection,
  MarketplaceShowcaseSection,
} from "./LionGotchiShowcase";

type TabKey = "pet" | "farm" | "marketplace";

const TABS: Array<{
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}> = [
  {
    key: "pet",
    label: "Your Pet",
    Icon: Sparkles,
    color: "text-purple-300",
    bg: "bg-purple-500/15",
    border: "border-purple-500/40",
  },
  {
    key: "farm",
    label: "Farm",
    Icon: Sprout,
    color: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
  },
  {
    key: "marketplace",
    label: "Marketplace",
    Icon: Store,
    color: "text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
  },
];

export default function LionGotchiTabbedSection() {
  const [tab, setTab] = useState<TabKey>("pet");
  const { t } = useTranslation("homepage");

  return (
    <div className="relative border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-16 lg:pt-20 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 border border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-400" />
            {t("liongotchiTabs.eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            {t("liongotchiTabs.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t("liongotchiTabs.subtitle")}
          </p>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <div
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur-sm"
            role="tablist"
            aria-label="LionGotchi sections"
          >
            {TABS.map((opt) => {
              const isActive = tab === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(opt.key)}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? `${opt.color} ${opt.bg} border ${opt.border}`
                      : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <opt.Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Override the inner section's own border-t and reduce padding-top
          so the shared header above flows into the demo without a double rule.
          Hide the inner sections' own centered headers since we already show
          a shared one above. */}
      <style>{`
        .lg-tabbed-body > section {
          border-top: 0 !important;
          padding-top: 1.5rem !important;
        }
        @media (min-width: 1024px) {
          .lg-tabbed-body > section {
            padding-top: 2rem !important;
          }
        }
        .lg-tabbed-body > section > div.relative > div.text-center.mb-14,
        .lg-tabbed-body > section > div.relative > div.text-center.mb-10,
        .lg-tabbed-body > section > div.relative > div.text-center.mb-18,
        .lg-tabbed-body > section > div.relative > .mb-14,
        .lg-tabbed-body > section > div.relative > .mb-10 {
          display: none;
        }
      `}</style>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="lg-tabbed-body"
        >
          {tab === "pet" && <LionGotchiHeroSection />}
          {tab === "farm" && <FarmShowcaseSection />}
          {tab === "marketplace" && <MarketplaceShowcaseSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
