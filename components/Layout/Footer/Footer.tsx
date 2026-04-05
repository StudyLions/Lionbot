// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Complete footer rewrite - modern dark theme, 4-column grid, updated links, Tailwind
import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: updated to permanent Discord invite with server name
const DISCORD_INVITE = "https://discord.gg/the-study-lions-780195610154237993";
// --- END AI-MODIFIED ---
const GITHUB_URL = "https://github.com/StudyLions/StudyLion/";
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Updated invite URL with applications.commands scope, added Features link
// --- Original code (commented out for rollback) ---
// const BOT_INVITE =
//   "https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot";
// --- End original code ---
const BOT_INVITE =
  "https://discord.com/oauth2/authorize?client_id=889078613817831495&permissions=1376674495606&scope=bot+applications.commands";
const productLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Donate", href: "/donate" },
  { label: "Skins", href: "/skins" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Invite Bot", href: BOT_INVITE, external: true },
];
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-19) ---
// Purpose: Added Stats link to resources
// --- AI-MODIFIED (2026-04-05) ---
// Purpose: Added Updates link to footer resources
const resourceLinks = [
  { label: "Tutorials", href: "/tutorials" },
  { label: "Updates", href: "/timeline" },
  { label: "Stats for Nerds", href: "/stats" },
  { label: "Support", href: DISCORD_INVITE, external: true },
  { label: "Source Code", href: GITHUB_URL, external: true },
  { label: "Contact", href: "mailto:contact@arihoresh.com" },
];
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/terms-and-conditions" },
];

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external || link.href.startsWith("mailto:") ? (
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href}>
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </a>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <a className="flex items-center gap-2.5">
                <img
                  src="/images/lionbot-avatar.png"
                  alt="LionBot"
                  className="w-9 h-9 rounded-full ring-2 ring-border shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground leading-tight tracking-wide">
                    LionBot
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight font-medium">
                    by Ari Horesh
                  </span>
                </div>
              </a>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              An open-source productivity bot for Discord communities. Activity
              tracking, economy, leaderboards, and so much more.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Discord"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <FooterLinkGroup title="Product" links={productLinks} />
          <FooterLinkGroup title="Resources" links={resourceLinks} />
          <FooterLinkGroup title="Legal" links={legalLinks} />
        </div>

        {/* --- AI-MODIFIED (2026-03-25) --- */}
        {/* Purpose: Added P.IVA and Pavia, Italy to footer bottom bar */}
        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LionBot. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Founded by Ari Horesh &middot; Pavia, Italy &middot; P.IVA IT02865360180
          </p>
        </div>
        {/* --- END AI-MODIFIED --- */}
      </div>
    </footer>
  );
}
// --- END AI-MODIFIED ---
