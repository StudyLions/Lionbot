import Layout from "@/components/Layout/Layout";
import { SkinsSEO } from "@/constants/SeoData";
import SkinsHeader from "@/components/lionskins/SkinsHeader";
import SkinsBrowser from "@/components/lionskins/SkinsBrowser";

export default function Skins() {
  return (
    <Layout SEO={SkinsSEO}>
      <div style={{ backgroundColor: "#131524" }} className={"lg:px-[30px]"} id={"donate_page"}>
        <SkinsHeader />
        <SkinsBrowser />
      </div>
    </Layout>
  );
}

