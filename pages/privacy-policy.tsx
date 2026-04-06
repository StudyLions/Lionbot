// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Complete rewrite of privacy policy to be fully transparent
//          about all data collected, used, and stored. Added interactive
//          data deletion request section requiring Discord auth.
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "@/components/Layout/Layout";
import { PrivacyPolicySEO } from "@/constants/SeoData";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";

function DeletionRequestSection() {
  const { data: session, status } = useSession();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [pendingInfo, setPendingInfo] = useState<{ requestId: number; requestedAt: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setCheckingStatus(false);
      return;
    }
    fetch("/api/privacy/deletion-request")
      .then((r) => r.json())
      .then((data) => {
        if (data.hasPending) {
          setHasPending(true);
          setPendingInfo(data.request);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [status]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/privacy/deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-red-500/20 bg-red-500/5 p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 !mt-0">Request Data Deletion</h2>
      <p className="text-muted-foreground leading-7 mb-6">
        You have the right to request deletion of all personal data we hold about you. This includes your
        study sessions, tasks, goals, economy data, pet data, moderation records, and all other information
        tied to your Discord account. Once processed, this action is <strong className="text-foreground">irreversible</strong>.
      </p>

      {status === "loading" || checkingStatus ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      ) : status === "unauthenticated" ? (
        <div>
          <p className="text-muted-foreground mb-4">
            To request deletion, you must first verify your identity by signing in with Discord.
          </p>
          <button
            onClick={() => signIn("discord")}
            className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Sign in with Discord
          </button>
        </div>
      ) : success ? (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
          <p className="text-green-400 font-medium">Your data deletion request has been submitted successfully.</p>
          <p className="text-muted-foreground mt-2">
            We will review and process your request within 30 days. You will not be able to submit another
            request while this one is pending.
          </p>
        </div>
      ) : hasPending ? (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
          <p className="text-yellow-400 font-medium">You already have a pending deletion request.</p>
          {pendingInfo && (
            <p className="text-muted-foreground mt-2">
              Request #{pendingInfo.requestId} submitted on{" "}
              {new Date(pendingInfo.requestedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              . We will process it within 30 days of the submission date.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="deletion-reason" className="block text-sm font-medium text-muted-foreground mb-2">
              Reason for deletion (optional)
            </label>
            <textarea
              id="deletion-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="You may optionally tell us why you're requesting deletion..."
              className="w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
          >
            {loading ? "Submitting..." : "Request Data Deletion"}
          </button>
          <p className="text-xs text-muted-foreground/70">
            By clicking this button, you confirm that you understand this will permanently delete all of your
            data from our systems once processed.
          </p>
        </div>
      )}
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <Layout SEO={PrivacyPolicySEO}>
      <div className="bg-background min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20 lg:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          {/* --- AI-MODIFIED (2026-04-06) --- */}
          {/* Purpose: update date for email notifications + survey data additions */}
          <p className="text-muted-foreground mb-10">Last updated: April 6, 2026</p>
          {/* --- END AI-MODIFIED --- */}

          <div className="space-y-10 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_p]:text-muted-foreground [&_p]:leading-7 [&_p]:my-3 [&_li]:text-muted-foreground [&_li]:leading-7">

            {/* Overview */}
            <section>
              <h2>Overview</h2>
              <p>
                StudyLion (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a Discord bot and web dashboard
                that helps users track study time, manage tasks, set goals, and interact with a virtual pet system
                (LionGotchi). This privacy policy explains exactly what data we collect, why we collect it, how we
                use it, and your rights regarding that data.
              </p>
              <p>
                We believe in full transparency. We do <strong className="text-foreground">not</strong> sell, rent,
                or share your personal data with third parties for advertising or marketing purposes.
              </p>
            </section>

            {/* Who We Are */}
            <section>
              <h2>Who We Are</h2>
              <p>
                StudyLion is operated by Ari Horesh. For any privacy-related questions, contact us at{" "}
                <a href="mailto:contact@arihoresh.com" className="text-primary hover:underline">
                  contact@arihoresh.com
                </a>.
              </p>
            </section>

            {/* Data We Collect */}
            <section>
              <h2>Data We Collect</h2>
              <p>
                We collect only the data necessary to provide our services. Here is a complete list of what we store:
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Identity &amp; Account Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Discord User ID</strong> — Your unique Discord snowflake ID. This is our primary identifier for your account.</li>
                <li><strong className="text-foreground">Discord Username / Display Name</strong> — Cached from Discord to display in leaderboards and the dashboard.</li>
                <li><strong className="text-foreground">Avatar Hash</strong> — Cached to render your profile picture on the dashboard.</li>
                {/* --- AI-MODIFIED (2026-04-06) --- */}
                {/* Purpose: clarify email is also used for product notifications */}
                <li><strong className="text-foreground">Email Address</strong> — Obtained through Discord OAuth when you sign in to the web dashboard. Used for authentication and to send you important product-related notifications (e.g. major feature launches, service updates, and account-related communications). By signing in, you agree to receive these communications. We will never send spam or share your email with third parties.</li>
                {/* --- END AI-MODIFIED --- */}
                <li><strong className="text-foreground">Timezone &amp; Locale</strong> — Set by you to display times correctly and localize the bot interface.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Study &amp; Productivity Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Voice Study Sessions</strong> — When you join a tracked voice channel: start time, duration, whether your camera/stream/screenshare was on, and the channel used. This is how we calculate your study hours.</li>
                <li><strong className="text-foreground">Text Activity Sessions</strong> — Message counts and word counts in tracked text channels (aggregated into sessions). We do <strong className="text-foreground">not</strong> store message content — only counts.</li>
                <li><strong className="text-foreground">Tasks</strong> — To-do list items you create, including their content, completion status, and timestamps.</li>
                <li><strong className="text-foreground">Weekly &amp; Monthly Goals</strong> — Study hour targets, task targets, and message targets you set for yourself.</li>
                <li><strong className="text-foreground">Reminders</strong> — Reminder content, scheduled times, and repeat intervals you configure.</li>
                <li><strong className="text-foreground">Workout Sessions</strong> — Start time, duration, and channel for workout tracking.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Economy &amp; Virtual Currency</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">LionCoins (per-server)</strong> — Virtual currency balance earned through studying. Tracked per server.</li>
                <li><strong className="text-foreground">LionGems (global)</strong> — Premium currency purchased with real money or earned through promotions. Tracked globally.</li>
                <li><strong className="text-foreground">Coin/Gem Transactions</strong> — Full transaction history including type (study reward, purchase, transfer, admin action), amounts, and timestamps.</li>
                <li><strong className="text-foreground">Shop Purchases &amp; Inventory</strong> — Items purchased from server shops and your current inventory.</li>
                <li><strong className="text-foreground">Skin Inventory</strong> — Profile card skins you own (purchased with gems).</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Ranking &amp; Experience</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Experience Points (XP)</strong> — Earned through voice and text activity, tracked per server and globally.</li>
                <li><strong className="text-foreground">Rank History</strong> — Which rank roles you&apos;ve earned in each server.</li>
                <li><strong className="text-foreground">Season Statistics</strong> — Aggregated voice time, XP, and message counts per competitive season.</li>
                <li><strong className="text-foreground">Profile Tags</strong> — Custom tags you add to your server profile.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">LionGotchi (Virtual Pet System)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Pet Data</strong> — Your pet&apos;s name, level, XP, mood stats (food, bath, sleep, life), and expression state.</li>
                <li><strong className="text-foreground">Pet Equipment &amp; Rooms</strong> — Equipped items, unlocked rooms, and furniture placement.</li>
                <li><strong className="text-foreground">Pet Inventory</strong> — Items you own, their enhancement levels, and how they were acquired.</li>
                <li><strong className="text-foreground">Farm Data</strong> — Planted crops, growth progress, and harvest history.</li>
                <li><strong className="text-foreground">Gold Transactions</strong> — In-game gold (LionGotchi currency) transaction history.</li>
                <li><strong className="text-foreground">Marketplace Activity</strong> — Listings you create and purchases you make on the pet marketplace.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Server Membership Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Server Memberships</strong> — Which servers you are a member of (where StudyLion is also present), join/leave dates.</li>
                <li><strong className="text-foreground">Role History</strong> — Roles you held when leaving a server (for role persistence on rejoin).</li>
                <li><strong className="text-foreground">Role Menu History</strong> — Roles obtained through role menus, when they were equipped/removed.</li>
                <li><strong className="text-foreground">Rented Rooms</strong> — Private voice channels you rented, their names, and coin balances.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Moderation Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Moderation Tickets</strong> — Warnings, study bans, message censors, and notes issued by server moderators. Includes the reason, duration, and moderator who issued it.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Scheduled Sessions</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Session Bookings</strong> — Scheduled study sessions you booked, attendance records, and associated rewards.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Payment Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Stripe Session IDs</strong> — When you purchase LionGems, we store the Stripe checkout session ID to prevent duplicate processing. We do <strong className="text-foreground">not</strong> store credit card numbers, billing addresses, or other financial details — that data stays with Stripe.</li>
                <li><strong className="text-foreground">Premium Contributions</strong> — Records of gem purchases for skins and cosmetics.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Voting Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Top.gg Votes</strong> — When you vote for StudyLion on Top.gg, we record your user ID and the vote timestamp to grant the voting bonus.</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Dashboard &amp; Website</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Discord OAuth Tokens</strong> — Temporary access and refresh tokens obtained when you sign in to the web dashboard. Stored in an encrypted JWT cookie on your browser, not in our database. Used to verify your identity and fetch your server list from Discord.</li>
                <li><strong className="text-foreground">Server List</strong> — When you use the dashboard, we temporarily cache (in memory, not in database) your Discord server list to determine which servers you can manage.</li>
              </ul>

              {/* --- AI-MODIFIED (2026-04-06) --- */}
              {/* Purpose: document survey data collection */}
              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Optional Survey Data</h3>
              <p>
                When you sign in to the web dashboard, we may ask you to fill out a short, optional survey to help us understand our audience and build better features. All survey fields are optional, and you can dismiss or skip the survey at any time. If you choose to participate, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Country</strong> — Helps us understand where our users are located so we can prioritize features and content relevant to different regions.</li>
                <li><strong className="text-foreground">Age Range</strong> — A broad age bracket (e.g. 18–24, 25–34). We never ask for your exact date of birth.</li>
                <li><strong className="text-foreground">Gender</strong> — Optional demographic information. You can skip this question entirely.</li>
                <li><strong className="text-foreground">Use Case</strong> — Whether you use LionBot primarily for studying or for a general community.</li>
                <li><strong className="text-foreground">Field of Study</strong> — Your academic discipline (e.g. Medicine, Computer Science, Business). Helps us tailor features to the subjects our users study.</li>
                <li><strong className="text-foreground">Education Level</strong> — Your current education stage (e.g. High School, Undergraduate, Graduate).</li>
              </ul>
              <p>
                This data is stored in our database and used in aggregate to guide product decisions. It is never shared with third parties or used for individual targeting.
              </p>
              {/* --- END AI-MODIFIED --- */}

            {/* What We Do NOT Collect */}
            <section>
              <h2>What We Do NOT Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do <strong className="text-foreground">not</strong> read or store the content of your Discord messages. We only count messages and words in tracked channels.</li>
                <li>We do <strong className="text-foreground">not</strong> store credit card numbers, billing addresses, or other payment details. All payment processing is handled by Stripe.</li>
                <li>We do <strong className="text-foreground">not</strong> track your activity outside of tracked channels configured by server administrators.</li>
                <li>We do <strong className="text-foreground">not</strong> collect your IP address, browser fingerprint, or use tracking cookies beyond the authentication session cookie.</li>
                <li>We do <strong className="text-foreground">not</strong> sell or share your data with any third party for advertising or marketing.</li>
              </ul>
            </section>

            {/* How We Use Your Data */}
            <section>
              <h2>How We Use Your Data</h2>
              <p>All data we collect is used for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Providing core services</strong> — Tracking study time, managing tasks, calculating XP/coins, maintaining leaderboards, and powering the LionGotchi pet system.</li>
                <li><strong className="text-foreground">Authentication</strong> — Verifying your identity on the web dashboard via Discord OAuth.</li>
                <li><strong className="text-foreground">Server moderation</strong> — Enabling server moderators to issue warnings, study bans, and enforce server rules.</li>
                <li><strong className="text-foreground">Premium features</strong> — Processing gem purchases and managing subscription billing.</li>
                <li><strong className="text-foreground">Statistics &amp; leaderboards</strong> — Displaying your study stats, rankings, and progress within servers you are a member of.</li>
                <li><strong className="text-foreground">Notifications</strong> — Sending reminders and vote reminders you opt into.</li>
                {/* --- AI-MODIFIED (2026-04-06) --- */}
                {/* Purpose: document email and survey data usage */}
                <li><strong className="text-foreground">Email communications</strong> — Sending important product-related emails such as major feature announcements, service updates, and account notifications. By signing in to the web dashboard with Discord, you agree to receive these communications. We will only send emails that are directly relevant to your use of StudyLion — never spam, never advertising, and never third-party promotions.</li>
                <li><strong className="text-foreground">Audience insights</strong> — Using aggregated, anonymized survey data to understand our user base and prioritize features that matter most to our community.</li>
                {/* --- END AI-MODIFIED --- */}
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2>Who Can See Your Data</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Server members</strong> — Your study stats, rank, and profile are visible on server leaderboards to other members of the same server.</li>
                <li><strong className="text-foreground">Server moderators/admins</strong> — Moderators can view moderation tickets, economy balances, and study stats through the dashboard for members of their server.</li>
                <li><strong className="text-foreground">Stripe</strong> — If you purchase LionGems, Stripe processes your payment. Stripe&apos;s own privacy policy governs their handling of your payment data.</li>
                <li><strong className="text-foreground">Vercel</strong> — Our website is hosted on Vercel. Vercel may process standard web server logs (IP addresses, request metadata) as part of hosting. See Vercel&apos;s privacy policy.</li>
                <li><strong className="text-foreground">Hetzner</strong> — Our database and bot are hosted on Hetzner servers in the EU. Hetzner provides infrastructure only and does not access our data.</li>
                <li>We do <strong className="text-foreground">not</strong> share your data with any other third parties.</li>
              </ul>
            </section>

            {/* Data Storage & Security */}
            <section>
              <h2>Data Storage &amp; Security</h2>
              <p>
                Your data is stored in a PostgreSQL database hosted on Hetzner Cloud servers located in the
                European Union (Finland). All connections to the database use SSL/TLS encryption.
                The web dashboard communicates over HTTPS.
              </p>
              <p>
                Access to the database is restricted to the bot application and the web dashboard backend.
                No third parties have direct database access.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2>Data Retention</h2>
              <p>
                We retain your data for as long as you use our services. Specifically:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Study session history, tasks, goals, and economy data are kept indefinitely while you are an active user.</li>
                <li>If you leave all servers where StudyLion is present, your per-server data remains stored but becomes inactive.</li>
                <li>If you request data deletion (see below), all your data will be permanently removed within 30 days.</li>
                <li>Moderation tickets may be retained for server safety purposes even after you leave a server, unless you request full deletion.</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2>Your Rights</h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Right to access</strong> — You can view most of your data through the bot commands and web dashboard.</li>
                <li><strong className="text-foreground">Right to rectification</strong> — You can update your timezone, locale, pet name, profile tags, and other user-configured settings at any time.</li>
                <li><strong className="text-foreground">Right to deletion</strong> — You can request complete deletion of all your data using the form below or by emailing <a href="mailto:contact@arihoresh.com" className="text-primary hover:underline">contact@arihoresh.com</a>.</li>
                <li><strong className="text-foreground">Right to data portability</strong> — Contact us to receive a copy of your data in a machine-readable format.</li>
                <li><strong className="text-foreground">Right to object</strong> — You can stop using our services at any time by removing the bot from your server or leaving servers where it is present.</li>
              </ul>
              <p>
                If you are a resident of the EU, UK, Liechtenstein, Norway, or Iceland, you have additional rights
                under the GDPR. All rights listed above apply to you.
              </p>
            </section>

            {/* Children */}
            <section>
              <h2>Children&apos;s Privacy</h2>
              <p>
                Our services are not intended for anyone under the age of 13, in accordance with Discord&apos;s own
                Terms of Service. We do not knowingly collect personal data from children under 13. If we become
                aware that we have collected data from a child under 13, we will delete it promptly. If you believe
                a child under 13 has used our services, please contact us at{" "}
                <a href="mailto:contact@arihoresh.com" className="text-primary hover:underline">
                  contact@arihoresh.com
                </a>.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. When we do, we will update the &ldquo;Last
                updated&rdquo; date at the top of this page. For significant changes, we may notify users through
                the bot or our Discord server.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about this privacy policy, your data, or your rights, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: <a href="mailto:contact@arihoresh.com" className="text-primary hover:underline">contact@arihoresh.com</a></li>
                <li>Discord: <a href="https://discord.gg/studylions" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">discord.gg/studylions</a></li>
              </ul>
            </section>

            {/* Deletion Request Section */}
            <section>
              <DeletionRequestSection />
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "legal"])),
  },
});
// --- END AI-MODIFIED ---
