import Layout from "@/components/Layout/Layout";
import LionGemsHeader from "@/components/liongems/LionGemsHeader";
import LionGemsBuySection from "@/components/liongems/LionGemsBuySection";
import LionGemsFAQSection from "@/components/liongems/LionGemsFAQSection";


export default function Liongems() {
  return <Layout>
    <LionGemsHeader/>
    <LionGemsBuySection/>
    <LionGemsFAQSection/>
  </Layout>
}
