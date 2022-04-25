import Header from "@/components/Layout/Header/Header";
import Footer from "@/components/Layout/Footer/Footer";
import Head from "next/head";
import { ILayout } from "@/models/layout";

export default function Layout({ children, SEO }: ILayout) {
  return (
    <>
      <Head>
        <title>{SEO.title} | StudyBot</title>
        <meta name="description" content={SEO.description} />
        <meta itemProp="name" content={SEO.title + " | StudyBot"} />
        <meta itemProp="description" content={SEO.description} />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
