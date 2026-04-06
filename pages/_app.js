// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Added DefaultSeo, i18n wrapping, ToastProvider, SoundProvider, site-wide JSON-LD
import { SessionProvider } from "next-auth/react";
import { DefaultSeo, OrganizationJsonLd, SoftwareAppJsonLd } from "next-seo";
import { appWithTranslation } from "next-i18next";
import Script from "next/script";
import { ToastProvider } from "@/components/dashboard/ui/Toast";
import { SoundProvider } from "@/lib/SoundContext";
import MiniSessionTimer from "@/components/dashboard/MiniSessionTimer";
// --- AI-MODIFIED (2026-04-06) ---
// Purpose: "Get to know you" survey widget for collecting user demographics
import SurveyWidget from "@/components/dashboard/SurveyWidget";
// --- END AI-MODIFIED ---
import defaultSEO from "next-seo.config";
// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Multi-theme support via next-themes
import { ThemeProvider } from "next-themes";
// --- END AI-MODIFIED ---

import "public/styles/styles.scss";
// --- END AI-MODIFIED ---

// Use of the <SessionProvider> is now mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
function App({ Component, pageProps }) {
  return (
    <SessionProvider
      // Provider options are not required but can be useful in situations where
      // you have a short session maxAge time. Shown here with default values.
      // --- AI-MODIFIED (2026-03-21) ---
      // Purpose: Enable periodic session refresh so the JWT callback runs and
      //          refreshes expired Discord access tokens. Without this, the
      //          Discord token in the JWT cookie silently expires and API calls
      //          fail, causing false "Access Denied" on dashboard pages.
      // --- Original values (for rollback) ---
      // staleTime: 0, refetchInterval: 0,
      // --- End original values ---
      options={{
        staleTime: 60,
        refetchInterval: 4 * 60,
        refetchOnWindowFocus: true,
      }}
      // --- END AI-MODIFIED ---
      session={pageProps.session}
    >
      <Script strategy={"lazyOnload"} src={"https://www.googletagmanager.com/gtag/js?id=G-5YBLTF11VW"} />
      <Script id="gtag-script" strategy={"lazyOnload"}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', 'G-5YBLTF11VW');
        `}
      </Script>
      {/* --- AI-MODIFIED (2026-03-23) --- */}
      {/* Purpose: Site-wide default SEO tags + JSON-LD structured data */}
      <DefaultSeo {...defaultSEO} />
      <OrganizationJsonLd
        type="Organization"
        name="LionBot"
        url="https://lionbot.org"
        logo="https://lionbot.org/apple-touch-icon.png"
        sameAs={[
          "https://discord.gg/studylions",
          "https://github.com/StudyLions/StudyLion",
          "https://top.gg/bot/889078613817831495",
        ]}
      />
      <SoftwareAppJsonLd
        name="LionBot"
        operatingSystem="Discord"
        applicationCategory="ProductivityApplication"
        price="0"
        priceCurrency="USD"
      />
      {/* --- END AI-MODIFIED --- */}
      {/* --- AI-MODIFIED (2026-04-03) --- */}
      {/* Purpose: Multi-theme support wrapping all pages */}
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="pink"
        themes={["midnight", "light", "ocean", "forest", "pink", "sunset"]}
        disableTransitionOnChange={false}
      >
      {/* --- END AI-MODIFIED --- */}
      {/* --- AI-MODIFIED (2026-03-20) --- */}
      {/* Purpose: Global 8-bit UI sound system wrapping all pages */}
      <SoundProvider>
        <Component {...pageProps} />
        {/* --- AI-MODIFIED (2026-03-16) --- */}
        {/* Purpose: Persistent mini-timer on all dashboard pages when user has active session */}
        <MiniSessionTimer />
        {/* --- END AI-MODIFIED --- */}
        {/* --- AI-MODIFIED (2026-04-06) --- */}
        {/* Purpose: Survey widget to collect user demographics for product/ad insights */}
        <SurveyWidget />
        {/* --- END AI-MODIFIED --- */}
        <ToastProvider />
      </SoundProvider>
      {/* --- END AI-MODIFIED --- */}
      </ThemeProvider>
    </SessionProvider>
  );
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Wrap app with i18n translation support
export default appWithTranslation(App);
// --- END AI-MODIFIED ---
