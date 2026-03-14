// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Complete skins page redesign - dashboard design system, mobile-first grid
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

function SkinModal({
  skin,
  onClose,
}: {
  skin: (typeof SkinsList)[0];
  onClose: () => void;
}) {
  const { t } = useTranslation("skins");
  const images = [
    { full: skin.image.imageOne, thumb: skin.image.imageOneThumbnail },
    { full: skin.image.imageTwo, thumb: skin.image.imageTwoThumbnail },
    { full: skin.image.imageThree, thumb: skin.image.imageThreeThumbnail },
    { full: skin.image.imageFour, thumb: skin.image.imageFourThumbnail },
    { full: skin.image.imageFive, thumb: skin.image.imageFiveThumbnail },
    { full: skin.image.imageSix, thumb: skin.image.imageSixThumbnail },
    { full: skin.image.imageSeven, thumb: skin.image.imageSevenThumbnail },
    { full: skin.image.imageEight, thumb: skin.image.imageEightThumbnail },
  ];
  const [selectedImage, setSelectedImage] = useState(0);

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
          {/* Main image */}
          <div className="flex-1 p-6 bg-background/50 flex items-center justify-center min-h-[300px]">
            <Image
              src={images[selectedImage].full}
              alt={skin.label}
              width={400}
              height={400}
              objectFit="contain"
            />
          </div>

          {/* Info panel */}
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold text-foreground">{skin.label}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Diamond className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold text-primary">
                {skin.price.toLocaleString()} {t("modal.gems", { amount: "" }).trim()}
              </span>
            </div>

            <div className="border-t border-border my-4" />

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-border hover:border-primary/30"
                  }`}
                >
                  <Image
                    src={img.thumb}
                    alt={`${skin.label} preview ${i + 1}`}
                    width={80}
                    height={80}
                    objectFit="cover"
                  />
                </button>
              ))}
            </div>

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
                    className="group rounded-lg border border-border bg-card hover:border-primary/30 transition-all overflow-hidden text-left"
                  >
                    <div className="relative aspect-square overflow-hidden bg-background/50 p-4">
                      <Image
                        src={skin.image.imageOne}
                        alt={skin.label}
                        layout="fill"
                        objectFit="contain"
                        className="group-hover:scale-105 transition-transform duration-300 p-3"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-foreground text-sm">{skin.label}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Diamond className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-medium">
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
