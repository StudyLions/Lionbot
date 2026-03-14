// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Use NextSeo, add top.gg-inspired gradient mesh background for visual depth
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
      {/* Gradient mesh background orbs (top.gg-inspired) */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_0%_0%,_rgba(59,130,246,0.07),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_100%_100%,_rgba(139,92,246,0.05),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_0%,_rgba(59,130,246,0.04),_transparent_60%)]" />
      </div>
      <div className="relative z-10">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
// --- END AI-MODIFIED ---
