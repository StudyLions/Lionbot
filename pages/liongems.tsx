import Layout from "@/components/Layout/Layout";
import LionGemsHeader from "@/components/liongems/LionGemsHeader";
import LionGemsBuySection from "@/components/liongems/LionGemsBuySection";
import LionGemsFAQSection from "@/components/liongems/LionGemsFAQSection";
import LionGemsPerks from "@/components/liongems/LionGemsPerks";
import LionGemsPremiumPlan from "@/components/liongems/LionGemsPremiumPlan";

export default function Liongems() {
  return (
    <Layout>
      <LionGemsHeader />
      <LionGemsPerks />
      <LionGemsPremiumPlan />
      <LionGemsBuySection />
      <LionGemsFAQSection />
    </Layout>
  );
}
