import Layout from "@/components/Layout/Layout";
import LionGemsHeader from "@/components/liongems/LionGemsHeader";
import LionGemsBuySection from "@/components/liongems/LionGemsBuySection";
import LionGemsFAQSection from "@/components/liongems/LionGemsFAQSection";
import LionGemsPerks from "@/components/liongems/LionGemsPerks";
import LionGemsPremiumPlan from "@/components/liongems/LionGemsPremiumPlan";

export default function Liongems() {
  return (
    <Layout>
      <div style={{ background: "linear-gradient(174deg, #2F2956 4.76%, #384EA0 51.98%, #191D29 97.42%)" }}>
        <LionGemsHeader />
        <LionGemsPerks />
        <LionGemsPremiumPlan />
        <LionGemsBuySection />
        <LionGemsFAQSection />
      </div>
    </Layout>
  );
}
