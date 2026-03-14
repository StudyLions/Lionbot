// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Complete donate page redesign - dashboard design system, mobile-first, existing assets preserved
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { signIn, useSession } from "next-auth/react";
import { Diamond, Gift, Crown, Palette, Zap, Star, X } from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { DonationSEO } from "@/constants/SeoData";
import { DonationsData } from "@/constants/DonationsData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import createPaymentSession from "@/utils/createPaymentSession";
import numberWithCommas from "@/utils/numberWithCommas";

const premiumPlans = [
  { gems: 1500, duration: "monthly", label: "Monthly" },
  { gems: 4000, duration: "3months", label: "3 Months" },
  { gems: 12000, duration: "1year", label: "1 Year", popular: true },
];

function PurchaseModal({
  item,
  onClose,
}: {
  item: (typeof DonationsData)[0];
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await createPaymentSession(item.id, quantity);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <Image
              src={item.image}
              alt={`${item.tokens} LionGems`}
              width={160}
              height={160}
              objectFit="contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center">
            {numberWithCommas(item.tokens * quantity)} LionGems
          </h2>
          {item.tokens_bonus > 0 && (
            <p className="text-sm text-primary text-center mt-1">
              +{numberWithCommas(item.tokens_bonus * quantity)} bonus
            </p>
          )}

          <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground">Quantity</label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="w-10 h-10 rounded-lg border border-border text-foreground hover:bg-accent transition-colors font-medium"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-semibold text-foreground">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-border text-foreground hover:bg-accent transition-colors font-medium"
              >
                +
              </button>
              <span className="ml-auto text-2xl font-bold text-foreground">
                &euro;{(item.amount * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {session ? (
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Purchase"}
              </button>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="w-full py-3 rounded-lg bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors"
              >
                Sign in to Purchase
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Donate() {
  const { t } = useTranslation("donate");
  const [selectedItem, setSelectedItem] = useState<(typeof DonationsData)[0] | null>(null);

  return (
    <Layout SEO={DonationSEO}>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <section className="pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  {t("header.title")}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  {t("header.subtitle")}
                </p>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  {t("header.detail")}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 justify-center lg:justify-start">
                  <a
                    href="#premium"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Crown className="h-4 w-4" />
                    {t("header.premiumPlans")}
                  </a>
                  <a
                    href="#gems"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
                  >
                    <Diamond className="h-4 w-4" />
                    {t("header.getLionGems")}
                  </a>
                  <Link href="/skins">
                    <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors">
                      <Palette className="h-4 w-4" />
                      {t("header.browseSkins")}
                    </a>
                  </Link>
                </div>
              </div>
              <div className="flex-1 max-w-sm flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-6 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12),_transparent_70%)] blur-lg" />
                  <div className="relative grid grid-cols-2 gap-3 max-w-[280px]">
                    {DonationsData.slice(2, 6).map((item, i) => (
                      <div key={i} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 flex items-center justify-center">
                        <Image src={item.image} alt={`${item.tokens} gems`} width={100} height={100} objectFit="contain" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="py-16 lg:py-20 border-t border-border bg-card/30">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">
              {t("perks.title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Palette, key: "coloredSkins" },
                { icon: Crown, key: "premium" },
                { icon: Gift, key: "gifting" },
                { icon: Zap, key: "bonuses" },
              ].map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="rounded-lg border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md hover:translate-y-[-2px] transition-all duration-200"
                >
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">
                    {t(`perks.${key}`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`perks.${key}Desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Plans */}
        <section id="premium" className="py-16 lg:py-20 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-foreground text-center">
              {t("premium.title")}
            </h2>
            <p className="text-muted-foreground text-center mt-2 mb-10">
              {t("premium.subtitle")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {premiumPlans.map((plan) => (
                <div
                  key={plan.duration}
                  className={`rounded-xl border p-6 text-center transition-all duration-200 ${
                    plan.popular
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border bg-card hover:border-primary/30 hover:translate-y-[-2px]"
                  }`}
                >
                  {plan.popular && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground mb-4">
                      <Star className="h-3 w-3" />
                      {t("premium.mostPopular")}
                    </span>
                  )}
                  <div className="text-4xl font-bold text-foreground">
                    <Diamond className="h-5 w-5 inline text-primary mr-1" />
                    {numberWithCommas(plan.gems)}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-foreground">
                    {t(`premium.${plan.duration === "3months" ? "threeMonths" : plan.duration === "1year" ? "oneYear" : "monthly"}`)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("premium.subscription")}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("premium.managePremium")}
            </p>
            <div className="text-center mt-4">
              <a
                href="#gems"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Diamond className="h-4 w-4" />
                {t("premium.getLionGems")}
              </a>
            </div>
          </div>
        </section>

        {/* Gem Packages */}
        <section id="gems" className="py-16 lg:py-20 border-t border-border bg-card/30 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              {t("gems.title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DonationsData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px] transition-all duration-200 p-5 text-left group"
                >
                  <div className="flex items-center justify-center h-36 mb-4">
                    <Image
                      src={item.image}
                      alt={`${item.tokens} LionGems`}
                      width={140}
                      height={140}
                      objectFit="contain"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {numberWithCommas(item.tokens)}
                    </div>
                    {item.tokens_bonus > 0 && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t("gems.bonus", { amount: numberWithCommas(item.tokens_bonus) })}
                      </div>
                    )}
                    <div className="mt-2 text-lg font-semibold text-foreground">
                      &euro;{item.amount}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 lg:py-16">
          <div className="max-w-2xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              {t("faq.title")}
            </h2>
            <Accordion type="single" collapsible>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger className="text-foreground">
                    {t(`faq.q${i}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t(`faq.a${i}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>

      {selectedItem && (
        <PurchaseModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "donate"])),
  },
});
// --- END AI-MODIFIED ---
