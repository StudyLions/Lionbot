// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Added DefaultSeo, i18n wrapping, ToastProvider, SoundProvider
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { appWithTranslation } from "next-i18next";
import Script from "next/script";
import { ToastProvider } from "@/components/dashboard/ui/Toast";
import { SoundProvider } from "@/lib/SoundContext";
import MiniSessionTimer from "@/components/dashboard/MiniSessionTimer";
import defaultSEO from "next-seo.config";

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
      {/* --- AI-MODIFIED (2026-03-14) --- */}
      {/* Purpose: Site-wide default SEO tags */}
      <DefaultSeo {...defaultSEO} />
      {/* --- END AI-MODIFIED --- */}
      {/* --- AI-MODIFIED (2026-03-20) --- */}
      {/* Purpose: Global 8-bit UI sound system wrapping all pages */}
      <SoundProvider>
        <Component {...pageProps} />
        {/* --- AI-MODIFIED (2026-03-16) --- */}
        {/* Purpose: Persistent mini-timer on all dashboard pages when user has active session */}
        <MiniSessionTimer />
        {/* --- END AI-MODIFIED --- */}
        <ToastProvider />
      </SoundProvider>
      {/* --- END AI-MODIFIED --- */}
    </SessionProvider>
  );
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Wrap app with i18n translation support
export default appWithTranslation(App);
// --- END AI-MODIFIED ---
