import Layout from "@/components/Layout/Layout";
import { SkinsSEO } from "@/constants/SeoData";
import SkinsHeader from "@/components/lionskins/SkinsHeader";

export default function Skins() {
  return (
    <Layout SEO={SkinsSEO}>
      <div
        style={{ background: "linear-gradient(174deg, #2F2956 4.76%, #384EA0 51.98%, #191D29 97.42%)" }}
        className={"lg:px-[30px]"}
        id={"donate_page"}
      >
        <SkinsHeader />
      </div>
    </Layout>
  );
}

