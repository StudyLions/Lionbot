// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Complete header rewrite - mobile-first with Sheet drawer, sticky positioning,
// proper z-index, Next.js Link usage, dashboard design system alignment
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, ExternalLink, Diamond, LogIn, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Banner from "@/components/Layout/Header/Banner";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Donate", href: "/donate", accent: true },
  { label: "Skins", href: "/skins" },
];

const EXTERNAL_LINKS = [
  {
    label: "Invite Bot",
    href: "https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot",
  },
  {
    label: "Tutorials",
    href: "https://izabellakis.notion.site/StudyLion-Bot-Tutorials-f493268fcd12436c9674afef2e151707",
  },
];

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      <header className="w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 lg:h-16 lg:px-6">
          <Link href="/">
            <a className="text-xl font-bold text-foreground tracking-wide">
              LionBot
            </a>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    router.pathname === link.href
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    link.accent && router.pathname !== link.href && "text-primary"
                  )}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors inline-flex items-center gap-1.5"
              >
                {link.label}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ))}
            {session && (
              <Link href="/dashboard">
                <a
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                    router.pathname.startsWith("/dashboard")
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
            {/* Desktop auth */}
            <div className="hidden lg:block">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
                  >
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                  </button>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-border bg-popover shadow-lg py-1">
                        <Link href="/dashboard">
                          <a
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-popover-foreground hover:bg-accent transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </a>
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-popover-foreground hover:bg-accent transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn("discord")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
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
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col px-4 pb-6">
                  {NAV_LINKS.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <a
                        className={cn(
                          "flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors",
                          router.pathname === link.href
                            ? "text-foreground bg-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                          link.accent && router.pathname !== link.href && "text-primary"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.accent && <Diamond className="h-4 w-4 mr-2" />}
                        {link.label}
                      </a>
                    </Link>
                  ))}
                  {EXTERNAL_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  ))}

                  <div className="my-3 border-t border-border" />

                  {session ? (
                    <>
                      <Link href="/dashboard">
                        <a
                          className="flex items-center gap-2 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </a>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          signOut();
                        }}
                        className="flex items-center gap-2 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors w-full"
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
                      className="flex items-center justify-center gap-2 mx-3 mt-2 px-4 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In with Discord
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <Banner />
    </div>
  );
}
// --- END AI-MODIFIED ---
