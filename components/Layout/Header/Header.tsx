// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Header redesign - branded logo with "by Ari Horesh", Radix DropdownMenu for user account,
// CTA button hierarchy (Invite Bot primary, Donate accent), sectioned mobile Sheet,
// mobile hamburger hidden on dashboard pages to prevent conflict with DashboardNav
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Menu,
  ExternalLink,
  Diamond,
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
  Globe,
  Home,
  Palette,
  BookOpen,
  Bot,
  // --- AI-MODIFIED (2026-03-15) ---
  // Purpose: icon for Support nav link
  HelpCircle,
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: GraduationCap icon for "How to Use" nav link
  GraduationCap,
  // --- END AI-MODIFIED ---
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Banner from "@/components/Layout/Header/Banner";

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: added Support link to Discord server
const SUPPORT_URL = "https://discord.gg/the-study-lions-780195610154237993";

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Added Guides link, "How to Use" tutorials link, reordered nav
// --- Original code (commented out for rollback) ---
// const NAV_LINKS = [
//   { label: "Home", href: "/", icon: Home, matchExact: true },
//   { label: "Features", href: "/features", icon: Sparkles },
//   { label: "Skins", href: "/skins", icon: Palette },
//   { label: "Tutorials", href: "/tutorials", icon: BookOpen },
//   { label: "Support", href: SUPPORT_URL, icon: HelpCircle, external: true },
// ];
// --- End original code ---
const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home, matchExact: true },
  { label: "Features", href: "/features", icon: Sparkles },
  { label: "Guides", href: "/guides", icon: BookOpen },
  { label: "How to Use", href: "/tutorials", icon: GraduationCap },
  { label: "Skins", href: "/skins", icon: Palette },
  { label: "Support", href: SUPPORT_URL, icon: HelpCircle, external: true },
];
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Updated invite URL to include applications.commands scope for slash commands
// --- Original code (commented out for rollback) ---
// const INVITE_URL =
//   "https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot";
// --- End original code ---
const INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=889078613817831495&permissions=1376674495606&scope=bot+applications.commands";
// --- END AI-MODIFIED ---

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = router.pathname.startsWith("/dashboard");

  function isActive(href: string, exact?: boolean) {
    return exact ? router.pathname === href : router.pathname.startsWith(href);
  }

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      <header className="w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 lg:h-16 lg:px-6">
          {/* Brand */}
          <Link href="/">
            <a className="flex items-center gap-2.5 group">
              <img
                src="/images/lionbot-avatar.png"
                alt="LionBot"
                className="w-9 h-9 rounded-full ring-2 ring-border group-hover:ring-primary/40 transition-all shadow-sm"
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

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* --- AI-MODIFIED (2026-03-15) --- */}
            {/* Purpose: handle external nav links (Support -> Discord) */}
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50 inline-flex items-center gap-1"
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              ) : (
                <Link key={link.href} href={link.href}>
                  <a
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(link.href, link.matchExact)
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {link.label}
                  </a>
                </Link>
              )
            )}
            {/* --- END AI-MODIFIED --- */}

            {/* Donate — golden accent */}
            <Link href="/donate">
              <a
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                  isActive("/donate", true)
                    ? "text-amber-400 bg-amber-500/15"
                    : "text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10"
                )}
              >
                <Diamond className="h-3.5 w-3.5" />
                Donate
              </a>
            </Link>

            <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />

            {/* Invite Bot — primary CTA */}
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="ml-0.5 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2 shadow-sm shadow-primary/20"
            >
              <Bot className="h-4 w-4" />
              Invite Bot
            </a>

            {session && (
              <Link href="/dashboard">
                <a
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                    isDashboard
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </a>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {/* Desktop auth — Radix DropdownMenu */}
            <div className="hidden lg:block">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* --- AI-MODIFIED (2026-03-24) --- */}
                    {/* Purpose: Added aria-label for screen reader accessibility */}
                    <button aria-label="User menu" className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/30 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                    {/* --- END AI-MODIFIED --- */}
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="Avatar"
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3 py-1">
                        {session.user?.image && (
                          <img
                            src={session.user.image}
                            alt=""
                            className="h-9 w-9 rounded-full"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Signed in
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => router.push("/dashboard")}
                      className="cursor-pointer gap-3"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => router.push("/dashboard/profile")}
                      className="cursor-pointer gap-3"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="justify-between text-muted-foreground"
                      disabled
                    >
                      <span className="flex items-center gap-3">
                        <Globe className="h-4 w-4" />
                        Language
                      </span>
                      <span className="text-xs">EN</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => signOut()}
                      className="cursor-pointer gap-3 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => signIn("discord")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger — hidden on dashboard pages to avoid overlap with DashboardNav */}
            {!isDashboard && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <SheetHeader className="p-6 pb-2">
                    <SheetTitle className="flex items-center gap-2">
                      <img
                        src="/images/lionbot-avatar.png"
                        alt="LionBot"
                        className="w-7 h-7 rounded-full"
                      />
                      <span>LionBot</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col px-4 pb-6">
                    <p className="px-3 mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Navigate
                    </p>
                    {/* --- AI-MODIFIED (2026-03-15) --- */}
                    {/* Purpose: handle external nav links in mobile menu */}
                    {NAV_LINKS.map((link) => {
                      const Icon = link.icon;
                      return link.external ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Icon className="h-4 w-4 opacity-70" />
                          {link.label}
                          <ExternalLink className="h-3 w-3 opacity-50 ml-auto" />
                        </a>
                      ) : (
                        <Link key={link.href} href={link.href}>
                          <a
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                              isActive(link.href, link.matchExact)
                                ? "text-foreground bg-accent"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon className="h-4 w-4 opacity-70" />
                            {link.label}
                          </a>
                        </Link>
                      );
                    })}
                    {/* --- END AI-MODIFIED --- */}
                    <Link href="/donate">
                      <a
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                          isActive("/donate", true)
                            ? "text-amber-400 bg-amber-500/15"
                            : "text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Diamond className="h-4 w-4" />
                        Donate
                      </a>
                    </Link>

                    <div className="my-3 border-t border-border" />

                    <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Quick Actions
                    </p>
                    <a
                      href={INVITE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Bot className="h-4 w-4" />
                      Invite Bot
                      <ExternalLink className="h-3 w-3 opacity-50 ml-auto" />
                    </a>

                    {session && (
                      <Link href="/dashboard">
                        <a
                          className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </a>
                      </Link>
                    )}

                    <div className="my-3 border-t border-border" />

                    {session ? (
                      <>
                        <div className="flex items-center gap-3 px-3 py-2 mb-1">
                          {session.user?.image && (
                            <img
                              src={session.user.image}
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {session.user?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Signed in
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          signIn("discord");
                        }}
                        className="flex items-center justify-center gap-2 mx-1 mt-2 px-4 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In with Discord
                      </button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>
      <Banner />
    </div>
  );
}
// --- END AI-MODIFIED ---
