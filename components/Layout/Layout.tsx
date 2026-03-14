// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Use NextSeo instead of manual Head tags for proper SEO management
import Header from "@/components/Layout/Header/Header";
import Footer from "@/components/Layout/Footer/Footer";
import { NextSeo } from "next-seo";

interface LayoutProps {
  children: React.ReactNode;
  SEO: {
    title: string;
    description: string;
    canonical?: string;
    openGraph?: Record<string, any>;
  };
}

export default function Layout({ children, SEO }: LayoutProps) {
  return (
    <>
      <NextSeo
        title={SEO.title}
        description={SEO.description}
        canonical={SEO.canonical}
        openGraph={SEO.openGraph}
      />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
// --- END AI-MODIFIED ---
