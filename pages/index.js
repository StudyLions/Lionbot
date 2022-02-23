import React from "react";
import HomepageTop from "@/components/Homepage/Homepage-top-content";
import HomepageSectionsMiddle from "@/components/Homepage/Homepage-sections-middle";
import Layout from "@/components/layout";

export default function Page() {
  return (
    <Layout>
      <HomepageTop/>
      <HomepageSectionsMiddle/>
    </Layout>
  )
}
