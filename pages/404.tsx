import Layout from "@/components/Layout/Layout";
import { Page404SEO } from "@/constants/SeoData";

export default function Custom404() {
  return (
    <>
      <Layout SEO={Page404SEO}>
        <div className={"alignCenter h-[57vh] bg-gradient-to-b from-[#2F2956] to-[#384EA0]"}>
          <h1 className={"text-[65px] font-bold md:text-[30px]"}>404 - Page Not Found</h1>
        </div>
      </Layout>
    </>
  );
}
