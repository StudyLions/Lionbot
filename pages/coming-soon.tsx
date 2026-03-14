// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Clean coming-soon page with dashboard design system
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout/Layout";
import { ComingSoonSEO } from "@/constants/SeoData";

export default function ComingSoon() {
  const { t } = useTranslation("errors");
  return (
    <Layout SEO={ComingSoonSEO}>
      <div className="bg-background min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            {t("comingSoon.title")}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            {t("comingSoon.subtitle")}
          </p>
          <Link href="/">
            <a className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors">
              {t("comingSoon.goHome")}
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "errors"])),
  },
});
// --- END AI-MODIFIED ---
