// --- AI-MODIFIED (2026-05-15) ---
// Purpose: Dismissible launch banner for the Gift Premium feature.
//          Single Gift icon at left, short headline, right-aligned pill
//          link to /donate#gift. Background reuses the existing primary
//          gradient -- we don't invent a new color language. localStorage
//          key was bumped so users who dismissed the prior expansion
//          banner see this one once.
import { useState, useEffect } from "react";
import { Gift, X } from "lucide-react";

const BANNER_DISMISSED_KEY = "lionbot-banner-gift-2026-05";

export default function Banner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "1");
  };

  return (
    <div className="relative flex flex-wrap justify-center items-center gap-x-4 gap-y-1 py-2 px-12 bg-gradient-to-r from-primary to-[#60a5fa] text-primary-foreground">
      <p className="flex items-center gap-2 text-center text-xs sm:text-sm font-medium">
        <Gift className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Gift premium to your favorite server
      </p>
      <a
        href="/donate#server-premium"
        className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 px-3 py-0.5 text-[11.5px] sm:text-xs font-semibold transition-colors"
      >
        Gift now
        <span aria-hidden>&rarr;</span>
      </a>
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/20 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
// --- END AI-MODIFIED ---
