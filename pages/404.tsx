// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Clean 404 page with proper SEO and dashboard design system
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout/Layout";
import { Page404SEO } from "@/constants/SeoData";

export default function Custom404() {
  const { t } = useTranslation("errors");
  return (
    <Layout SEO={Page404SEO}>
      <div className="bg-background min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-7xl sm:text-9xl font-bold text-primary/20">
            {t("notFound.title")}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-4">
            {t("notFound.subtitle")}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            {t("notFound.description")}
          </p>
          <Link href="/">
            <a className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              {t("notFound.goHome")}
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
