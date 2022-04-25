import React from "react";
import HomepageTop from "@/components/Homepage_content/HomepageTopContent";
import HomepageSections from "@/components/Homepage_content/HomepageSections";
import Layout from "@/components/Layout/Layout";
import HomepageBottomContent from "@/components/Homepage_content/HomepageBottomContent";
import styles from "@/components/Homepage_content/Homepage.module.scss";
import { HomepageSEO } from "@/constants/SeoData";

export default function Page() {
  return (
    <Layout SEO={HomepageSEO}>
      <div className={styles.container}>
        <HomepageTop />
        <HomepageSections />
        <HomepageBottomContent />
      </div>
    </Layout>
  );
}
