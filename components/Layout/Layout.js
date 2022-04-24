import Header from "@/components/Layout/Header/Header";
import Footer from "@/components/Layout/Footer/Footer";
import Head from "next/head";

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>StudyBot | title</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="meta description/" />
        <meta itemProp="name" content="itemprop meta name" />
        <meta itemProp="description" content="itemprop meta description" />
      </Head>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
