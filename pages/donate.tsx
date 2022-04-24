import Layout from "@/components/Layout/Layout";
import LionGemsHeader from "@/components/liongems/LionGemsHeader";
import LionGemsBuySection from "@/components/liongems/LionGemsBuySection";
import LionGemsFAQSection from "@/components/liongems/LionGemsFAQSection";
import LionGemsPerks from "@/components/liongems/LionGemsPerks";
import LionGemsPremiumPlan from "@/components/liongems/LionGemsPremiumPlan";
import { DonationSEO } from "@/constants/SeoData";

export default function Donate() {
  return (
    <Layout SEO={DonationSEO}>
      <div
        style={{ background: "linear-gradient(174deg, #2F2956 4.76%, #384EA0 51.98%, #191D29 97.42%)" }}
        id={"donate_page"}
      >
        <LionGemsHeader />
        <LionGemsPerks />
        <LionGemsPremiumPlan />
        <LionGemsBuySection />
        <LionGemsFAQSection />
      </div>
    </Layout>
  );
}
