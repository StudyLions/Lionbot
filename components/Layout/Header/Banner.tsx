// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Dismissible banner with localStorage persistence
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const BANNER_DISMISSED_KEY = "lionbot-banner-dismissed";

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
    <div className="relative flex justify-center items-center py-2 px-10 bg-gradient-to-r from-primary to-[#60a5fa] text-primary-foreground">
      <p className="text-center text-xs sm:text-sm font-medium">
        <span className="font-semibold">We are expanding!</span>{" "}
        Leo is now available to use in non-study servers as well!
      </p>
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
