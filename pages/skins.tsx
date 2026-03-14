// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Skins page with profile card preview overlays on skin backgrounds
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { Diamond, X, Search } from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { SkinsSEO } from "@/constants/SeoData";
import { SkinsList } from "@/constants/SkinsList";
import { SkinCardPreview } from "@/components/SkinCardPreview";

function SkinModal({
  skin,
  onClose,
}: {
  skin: (typeof SkinsList)[0];
  onClose: () => void;
}) {
  const { t } = useTranslation("skins");
  const { data: session } = useSession();
  const cardBgs = [
    { src: skin.image.imageOne, label: "Profile" },
    { src: skin.image.imageTwo, label: "Weekly Activity" },
    { src: skin.image.imageFour, label: "Monthly Stats" },
    { src: skin.image.imageFive, label: "Leaderboard" },
  ];
  const [selectedBg, setSelectedBg] = useState(0);

  const userData = session?.user ? {
    username: session.user.name || "User",
    discriminator: "",
    avatarUrl: session.user.image || null,
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-md bg-card/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{skin.label}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Diamond className="h-4 w-4 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  {skin.price.toLocaleString()} gems
                </span>
              </div>
            </div>
          </div>

          {/* Full card preview */}
          <div className="rounded-xl overflow-hidden shadow-lg mb-4">
            <SkinCardPreview
              backgroundSrc={cardBgs[selectedBg].src}
              skinName={skin.label}
              userData={userData}
            />
          </div>

          {/* Card type selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {cardBgs.map((bg, i) => (
              <button
                key={i}
                onClick={() => setSelectedBg(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  i === selectedBg
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>

          <div className="border-t border-border my-4" />

          <p className="text-sm text-muted-foreground mb-4">
            To purchase, use the <span className="font-semibold text-foreground">/skin</span> command in Discord.
            {!session && " Sign in to see a preview with your own data."}
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
  );
}

export default function Skins() {
  const { t } = useTranslation("skins");
  const [selectedSkin, setSelectedSkin] = useState<(typeof SkinsList)[0] | null>(null);
  const [search, setSearch] = useState("");

  const filtered = SkinsList.filter((skin) =>
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
                    <div className="overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                      <SkinCardPreview
                        backgroundSrc={skin.image.imageOne}
                        skinName={skin.label}
                        compact
                      />
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
