// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Clean study timer page with dashboard design system and i18n
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "@/components/Layout/Layout";
import Timer from "components/Timer";
import { StudySEO } from "@/constants/SeoData";

export default function StudyPage() {
  return (
    <Layout SEO={StudySEO}>
      <div className="bg-background min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <Timer />
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "study"])),
  },
});
// --- END AI-MODIFIED ---
