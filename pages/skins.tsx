// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Skins page using bot-rendered static preview images
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { Diamond, X, Search } from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { SkinsSEO } from "@/constants/SeoData";
import { SkinsList } from "@/constants/SkinsList";

const botRenderedPreviews: Record<string, any> = {
  original: require("@/public/images/skins/previews/profile_original.png"),
  obsidian: require("@/public/images/skins/previews/profile_obsidian.png"),
  platinum: require("@/public/images/skins/previews/profile_platinum.png"),
  blue_bayoux: require("@/public/images/skins/previews/profile_blue_bayoux.png"),
  boston_blue: require("@/public/images/skins/previews/profile_boston_blue.png"),
  bubble_gum: require("@/public/images/skins/previews/profile_bubble_gum.png"),
  cotton_candy: require("@/public/images/skins/previews/profile_cotton_candy.png"),
};

const SKINS = [
  { id: "original", label: "Default", price: 0 },
  ...SkinsList.map((s) => ({ id: s.id, label: s.label, price: s.price })),
];

const CARD_TYPE_LABELS = [
  "Profile", "Weekly Activity", "Monthly Activity", "Monthly Stats",
  "Leaderboard", "Leaderboard Top", "Todo Profile", "Todo Tasks",
];

function getSkinGallery(skinId: string) {
  const skin = SkinsList.find((s) => s.id === skinId);
  if (!skin) return [];
  return [
    { full: skin.image.imageOne, thumb: skin.image.imageOneThumbnail },
    { full: skin.image.imageTwo, thumb: skin.image.imageTwoThumbnail },
    { full: skin.image.imageThree, thumb: skin.image.imageThreeThumbnail },
    { full: skin.image.imageFour, thumb: skin.image.imageFourThumbnail },
    { full: skin.image.imageFive, thumb: skin.image.imageFiveThumbnail },
    { full: skin.image.imageSix, thumb: skin.image.imageSixThumbnail },
    { full: skin.image.imageSeven, thumb: skin.image.imageSevenThumbnail },
    { full: skin.image.imageEight, thumb: skin.image.imageEightThumbnail },
  ];
}

function SkinModal({
  skin,
  onClose,
}: {
  skin: (typeof SKINS)[0];
  onClose: () => void;
}) {
  const { t } = useTranslation("skins");
  const gallery = getSkinGallery(skin.id);
  const botPreview = botRenderedPreviews[skin.id];
  const [selectedImage, setSelectedImage] = useState(-1);

  const mainImage = selectedImage >= 0 && gallery[selectedImage]
    ? gallery[selectedImage].full
    : botPreview || (gallery[0]?.full ?? null);

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

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{skin.label}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Diamond className="h-4 w-4 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  {skin.price === 0 ? "Free" : `${skin.price.toLocaleString()} gems`}
                </span>
              </div>
            </div>
          </div>

          {/* Main preview */}
          {mainImage && (
            <div className="rounded-xl overflow-hidden shadow-lg mb-4 bg-background/50">
              <Image
                src={mainImage}
                alt={`${skin.label} ${selectedImage >= 0 ? CARD_TYPE_LABELS[selectedImage] : "profile card"} preview`}
                layout="responsive"
                width={1540}
                height={730}
                objectFit="contain"
              />
            </div>
          )}

          {/* Card type selector */}
          {gallery.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Card Previews</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {/* Bot-rendered profile card (main) */}
                {botPreview && (
                  <button
                    onClick={() => setSelectedImage(-1)}
                    className={`rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === -1 ? "border-primary" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Image src={botPreview} alt="Profile card" width={120} height={57} objectFit="cover" />
                    <p className="text-[9px] text-center py-0.5 text-muted-foreground bg-card">Profile</p>
                  </button>
                )}
                {/* Static skin card type previews */}
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Image src={img.thumb} alt={CARD_TYPE_LABELS[i]} width={120} height={57} objectFit="cover" />
                    <p className="text-[9px] text-center py-0.5 text-muted-foreground bg-card truncate px-1">
                      {CARD_TYPE_LABELS[i]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border my-4" />

          <p className="text-sm text-muted-foreground mb-4">
            To purchase, use the <span className="font-semibold text-foreground">/skin</span> command in Discord.
          </p>
          {skin.price > 0 && (
            <Link href="/donate#gems">
              <a className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                <Diamond className="h-4 w-4" />
                {t("modal.getPurchase")}
              </a>
            </Link>
          )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => setSelectedSkin(skin)}
                    className="group rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px] transition-all duration-200 overflow-hidden text-left"
                  >
                    <div className="overflow-hidden">
                      {botRenderedPreviews[skin.id] ? (
                        <Image
                          src={botRenderedPreviews[skin.id]}
                          alt={`${skin.label} skin preview`}
                          layout="responsive"
                          width={1540}
                          height={730}
                          objectFit="contain"
                          className="group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <div className="aspect-[2.1/1] bg-muted/30 flex items-center justify-center">
                          <Diamond className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground">{skin.label}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Diamond className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm text-primary font-medium">
                          {skin.price === 0 ? "Free" : skin.price.toLocaleString()}
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
