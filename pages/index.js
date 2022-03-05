import React from "react";
import HomepageTop from "@/components/Homepage_content/HomepageTopContent";
import HomepageSections from "@/components/Homepage_content/HomepageSections";
import Layout from "@/components/Layout/Layout";
import HomepageBottomContent from "@/components/Homepage_content/HomepageBottomContent";

export default function Page() {
  return (
    <Layout>
      <HomepageTop/>
      <HomepageSections/>
      <HomepageBottomContent/>
    </Layout>
  )
}
