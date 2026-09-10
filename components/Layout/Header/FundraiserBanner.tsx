// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Shared, dismissible GoFundMe announcement to help keep Leo online.
// ============================================================
import { useEffect, useState } from "react";
import { ExternalLink, Heart, X } from "lucide-react";

const FUNDRAISER_URL =
  "https://www.gofundme.com/f/keep-lionbot-online-a-new-home-for-leo";
const DISMISSED_KEY = "lionbot-fundraiser-new-home-2026-09";

export default function FundraiserBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      // Storage can be unavailable in private or restricted browsers.
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Dismissing still works for this visit without persistent storage.
    }
  }

  if (dismissed) return null;

  return (
    <aside
      aria-label="Support the LionBot fundraiser"
      // Leave space for the existing dashboard/pet mobile menu at the left.
      className="relative flex min-h-[56px] flex-wrap items-center justify-center gap-x-5 gap-y-1 border-b border-amber-300 bg-amber-100 px-16 py-2 text-amber-950"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-2 text-center text-sm leading-5">
        <Heart className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
        <span className="font-semibold">Help keep Leo online.</span>
        <span className="hidden sm:inline">Help fund Leo&apos;s new server.</span>
      </p>
      <a
        href={FUNDRAISER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
      >
        Support Leo
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only"> on GoFundMe (opens in a new tab)</span>
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss fundraiser banner"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md transition-colors hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </aside>
  );
}
