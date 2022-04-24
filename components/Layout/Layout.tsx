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
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
      </Head>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
