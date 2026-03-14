// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Use real bot-rendered skin previews instead of static PNG screenshots
import React, { useState } from "react";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { Diamond, X, Search, ImageOff } from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { SkinsSEO } from "@/constants/SeoData";

const SKINS = [
  { id: "obsidian", label: "Obsidian", price: 1500 },
  { id: "platinum", label: "Platinum", price: 750 },
  { id: "blue_bayoux", label: "Blue Bayoux", price: 1500 },
  { id: "boston_blue", label: "Boston Blue", price: 750 },
  { id: "bubblegum", label: "Bubblegum", price: 1500 },
  { id: "cotton_candy", label: "Cotton Candy", price: 1500 },
];

const CARD_TYPES = [
  { type: "profile", label: "Profile Card" },
  { type: "stats", label: "Stats Card" },
] as const;

function SkinPreviewImage({
  skinId,
  cardType,
  alt,
  className = "",
}: {
  skinId: string;
  cardType: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted/30 text-muted-foreground ${className}`}>
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={`/api/skins/preview?skin=${skinId}&type=${cardType}`}
        alt={alt}
        className="w-full h-auto block"
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}

function SkinModal({
  skin,
  onClose,
}: {
  skin: (typeof SKINS)[0];
  onClose: () => void;
}) {
  const { t } = useTranslation("skins");
  const [selectedType, setSelectedType] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-md bg-card/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6 bg-background/50 flex items-center justify-center min-h-[300px]">
            <SkinPreviewImage
              skinId={skin.id}
              cardType={CARD_TYPES[selectedType].type}
              alt={`${skin.label} ${CARD_TYPES[selectedType].label}`}
              className="max-w-full"
            />
          </div>

          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold text-foreground">{skin.label}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Diamond className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold text-primary">
                {skin.price.toLocaleString()} {t("modal.gems", { amount: "" }).trim()}
              </span>
            </div>

            <div className="border-t border-border my-4" />

            <p className="text-sm text-muted-foreground mb-3">Card type preview:</p>
            <div className="flex gap-2">
              {CARD_TYPES.map((ct, i) => (
                <button
                  key={ct.type}
                  onClick={() => setSelectedType(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    i === selectedType
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>

            <div className="border-t border-border my-4" />

            <p className="text-sm text-muted-foreground mb-1">
              These are actual bot-rendered card previews — exactly what you see in Discord.
            </p>

            <div className="border-t border-border my-4" />

            <p className="text-sm text-muted-foreground mb-4">
              To purchase, use the <span className="font-semibold text-foreground">/skin</span> command in Discord.
            </p>
            <Link href="/donate#gems">
              <a className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                <Diamond className="h-4 w-4" />
                {t("modal.getPurchase")}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Skins() {
  const { t } = useTranslation("skins");
  const [selectedSkin, setSelectedSkin] = useState<(typeof SKINS)[0] | null>(null);
  const [search, setSearch] = useState("");

  const filtered = SKINS.filter((skin) =>
    skin.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout SEO={SkinsSEO}>
      <div className="bg-background min-h-screen">
        <section className="pt-16 pb-8 lg:pt-24 lg:pb-12">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-center">
              {t("header.title")}
            </h1>
            <p className="mt-3 text-muted-foreground text-center max-w-xl mx-auto">
              {t("header.subtitle")}
            </p>
            <div className="relative max-w-sm mx-auto mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("browser.search")}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              />
            </div>
          </div>
        </section>

        <section className="pb-16 lg:pb-24">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {t("browser.noResults")}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => setSelectedSkin(skin)}
                    className="group rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px] transition-all duration-200 overflow-hidden text-left"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-background/80 to-card">
                      <SkinPreviewImage
                        skinId={skin.id}
                        cardType="profile"
                        alt={skin.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-semibold text-foreground text-sm">{skin.label}</h3>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Diamond className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm text-primary font-medium">
                          {skin.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedSkin && (
        <SkinModal skin={selectedSkin} onClose={() => setSelectedSkin(null)} />
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "skins"])),
  },
});
// --- END AI-MODIFIED ---
