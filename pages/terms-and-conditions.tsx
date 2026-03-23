// --- AI-REPLACED (2026-03-20) ---
// Reason: Complete rewrite to cover all current products/services (LionGems,
//         LionHeart subscriptions, LionGotchi, Server Premium) with clear
//         no-refund policy, modern styling consistent with privacy policy page.
// What the new code does better: Comprehensive legal coverage, explicit
//         no-refund clauses for every digital product, proper structure.
// --- Original code (commented out for rollback) ---
// See git history for previous version — entire file was a single
// flat component with minimal refund policy referencing only LionGems.
// --- End original code ---
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "@/components/Layout/Layout";
import { TermsAndConditionsSEO } from "@/constants/SeoData";

export default function TermsAndConditions() {
  return (
    <Layout SEO={TermsAndConditionsSEO}>
      <div className="bg-background min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20 lg:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Terms and Conditions
          </h1>
          <p className="text-muted-foreground mb-10">Last updated: March 20, 2026</p>

          <div className="space-y-10 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_p]:text-muted-foreground [&_p]:leading-7 [&_p]:my-3 [&_li]:text-muted-foreground [&_li]:leading-7">

            {/* Agreement */}
            <section>
              <h2>Agreement to Terms</h2>
              <p>
                Welcome to LionBot.org. These Terms and Conditions (&ldquo;Terms&rdquo;) govern your
                use of our website(s), Discord bot (StudyLion), web dashboard, virtual pet system
                (LionGotchi), mobile applications, and all related products and services (collectively,
                the &ldquo;Services&rdquo;). By accessing or using any part of the Services, you agree
                to be bound by these Terms. If you do not agree, do not use the Services.
              </p>
              <p>
                If you have any questions, contact us at{" "}
                <a href="mailto:contact@arihoresh.com" className="text-primary hover:underline">
                  contact@arihoresh.com
                </a>.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2>Eligibility</h2>
              <p>
                You represent and warrant that you are at least 13 years of age (or the minimum age
                required by Discord&apos;s Terms of Service in your jurisdiction) and are of legal age
                to form a binding contract. If you are under the age of majority in your jurisdiction,
                you must have your parent or legal guardian&apos;s consent to use the Services and agree
                to these Terms on your behalf.
              </p>
              <p>
                If you are agreeing to these Terms on behalf of an organization or entity, you represent
                and warrant that you are authorized to bind that organization to these Terms.
              </p>
            </section>

            {/* Description of Services */}
            <section>
              <h2>Description of Services</h2>
              <p>LionBot.org provides the following services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">StudyLion Discord Bot</strong> — A productivity
                  bot that tracks study time, manages tasks, goals, reminders, and provides economy,
                  ranking, and moderation features within Discord servers.
                </li>
                <li>
                  <strong className="text-foreground">LionGotchi</strong> — A virtual pet system
                  within the bot, featuring pet care, equipment, rooms, farming, crafting,
                  enhancement, and a player marketplace.
                </li>
                <li>
                  <strong className="text-foreground">Web Dashboard</strong> — A website at
                  LionBot.org where users can manage their account, view study statistics, configure
                  server settings, and access premium features.
                </li>
                <li>
                  <strong className="text-foreground">Premium Features</strong> — Paid features
                  including LionGem purchases, LionHeart subscriptions, Server Premium, profile card
                  skins, and animated card effects.
                </li>
              </ul>
            </section>

            {/* Account & Third-Party Access */}
            <section>
              <h2>Your Account</h2>
              <p>
                You may access certain features of the Services by signing in with your Discord account
                (&ldquo;Third Party Account&rdquo;). By doing so, you permit us to access certain
                information from your Discord account as described in our{" "}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </a>.
              </p>
              <p>
                You are responsible for maintaining the security of your account. You may not use
                another person&apos;s account without their authorization. You may not transfer your
                account to anyone else without our prior written permission.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2>Intellectual Property</h2>
              <p>
                Unless otherwise stated, LionBot.org and/or its licensors own the intellectual property
                rights for all material, content, designs, code, and artwork used in the Services. All
                intellectual property rights are reserved.
              </p>
              <p>You must not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Republish, sell, rent, or sub-license material from the Services</li>
                <li>Reproduce, duplicate, or copy material from the Services</li>
                <li>Redistribute content from the Services</li>
                <li>
                  Reverse engineer, decompile, or attempt to extract source code from the Services
                </li>
              </ul>
              <p>
                We respect others&apos; intellectual property rights and reserve the right to remove
                content alleged to be infringing. To report potentially infringing content, email{" "}
                <a href="mailto:contact@arihoresh.com" className="text-primary hover:underline">
                  contact@arihoresh.com
                </a>.
              </p>
            </section>

            {/* Prohibited Conduct */}
            <section>
              <h2>Prohibited Conduct</h2>
              <p>
                You agree not to use the Services in any manner that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Infringes or violates the intellectual property rights or any other rights of anyone
                  else (including LionBot.org)
                </li>
                <li>
                  Violates any law or regulation, including export control laws and privacy laws
                </li>
                <li>
                  Is dangerous, harmful, fraudulent, deceptive, threatening, harassing, defamatory,
                  obscene, or otherwise objectionable
                </li>
                <li>
                  Jeopardizes the security of your account or anyone else&apos;s account
                </li>
                <li>
                  Attempts to obtain passwords, account information, or other security information
                  from any other user
                </li>
                <li>Violates the security of any computer network or cracks security encryption codes</li>
                <li>
                  Runs auto-responders, &ldquo;spam,&rdquo; scrapers, crawlers, or any automated process
                  that interferes with the proper working of the Services or places an unreasonable
                  load on infrastructure
                </li>
                <li>
                  Copies or stores any significant portion of the Services&apos; content or data
                </li>
                <li>
                  <strong className="text-foreground">Fakes statistics</strong> — including but not
                  limited to idling in voice channels without actually studying or working, using
                  automated tools to inflate study time, or any other method of artificially
                  boosting tracked activity
                </li>
                <li>
                  Exploits bugs, glitches, or unintended mechanics in the bot, LionGotchi, economy
                  system, or any other part of the Services for unfair advantage
                </li>
                <li>
                  Creates multiple accounts to circumvent bans, restrictions, or to gain additional
                  benefits
                </li>
              </ul>
              <p>
                A violation of any of the foregoing is grounds for immediate termination of your right
                to use or access the Services, including forfeiture of any purchased digital content
                without refund.
              </p>
            </section>

            {/* Cheating, Abuse & Account Bans */}
            <section>
              <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6 sm:p-8 mt-4">
                <h2 className="!mt-0">Cheating, Abuse &amp; Account Bans</h2>
                <p>
                  LionBot.org is committed to providing a fair, safe, and enjoyable environment for
                  all users. We take cheating and abuse extremely seriously. Any user found to be
                  engaging in the behaviors described below will be subject to{" "}
                  <strong className="text-foreground">
                    immediate and permanent account termination
                  </strong>{" "}
                  at our sole discretion.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  Behaviors That Will Result in a Ban
                </h3>
                <p>The following actions constitute cheating or abuse and are grounds for a permanent ban:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Faking study time</strong> — Idling in voice
                    channels without studying, using bots or scripts to simulate activity, or any
                    other method of artificially inflating tracked statistics
                  </li>
                  <li>
                    <strong className="text-foreground">Exploiting bugs or glitches</strong> — Knowingly
                    using any bug, glitch, exploit, or unintended mechanic to duplicate items, generate
                    currency, gain unfair advantages, or otherwise manipulate any system within the
                    Services
                  </li>
                  <li>
                    <strong className="text-foreground">Economy manipulation</strong> — Exploiting the
                    LionCoin, LionGem, or LionGold economy systems through any unauthorized means,
                    including but not limited to trade scams, currency duplication, or coordinated
                    manipulation with other users
                  </li>
                  <li>
                    <strong className="text-foreground">Account abuse</strong> — Creating multiple
                    accounts (&ldquo;alts&rdquo;) to circumvent bans, evade restrictions, farm
                    currencies or rewards, or gain any advantage not available to a single account
                  </li>
                  <li>
                    <strong className="text-foreground">Marketplace fraud</strong> — Scamming other
                    users on the LionGotchi marketplace, listing items under false pretenses, or
                    engaging in any deceptive trading practices
                  </li>
                  <li>
                    <strong className="text-foreground">Automation &amp; botting</strong> — Using
                    third-party tools, scripts, macros, self-bots, or any automated means to interact
                    with the Services in ways not intended by normal usage
                  </li>
                  <li>
                    <strong className="text-foreground">Real-money trading (RMT)</strong> — Selling,
                    buying, or trading LionCoins, LionGems, LionGold, items, accounts, or any other
                    virtual content for real-world money or goods outside of official channels
                  </li>
                  <li>
                    <strong className="text-foreground">Harassment &amp; toxicity</strong> — Persistent
                    harassment, hate speech, threats, doxxing, or any behavior that makes the Services
                    unsafe or unwelcoming for other users
                  </li>
                  <li>
                    <strong className="text-foreground">Abuse of support or moderation systems</strong> —
                    Filing false reports, spamming support channels, impersonating staff, or attempting
                    to manipulate moderation decisions
                  </li>
                  <li>
                    <strong className="text-foreground">Unauthorized access</strong> — Attempting to
                    access other users&apos; accounts, private data, or any restricted part of the
                    Services infrastructure
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  Consequences of a Ban
                </h3>
                <p>
                  If your account is banned for any of the above reasons or for any other violation of
                  these Terms:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Your account will be permanently terminated</strong> and
                    you will lose access to all Services
                  </li>
                  <li>
                    <strong className="text-foreground">All of your data, progress, and content will be
                    deleted</strong>, including but not limited to: study history, statistics, ranks,
                    tasks, goals, reminders, economy balances, LionGotchi pets, pet inventory,
                    equipment, farm data, marketplace listings, profile skins, card effects, and
                    any other content tied to your account
                  </li>
                  <li>
                    <strong className="text-foreground">All virtual currencies will be
                    forfeited</strong> — this includes LionCoins, LionGems, and LionGold, regardless
                    of whether they were purchased with real money, earned through gameplay, or
                    received as bonuses
                  </li>
                  <li>
                    <strong className="text-foreground">Active subscriptions will be
                    cancelled</strong> — any active LionHeart, LionHeart+, or LionHeart++ subscription
                    will be terminated immediately with no refund for the current or any remaining
                    billing period
                  </li>
                  <li>
                    <strong className="text-foreground">No refunds will be issued under any
                    circumstances</strong> — you will not receive a refund for any LionGems purchased,
                    any subscription payments made, any Server Premium purchased, any LionGotchi items
                    acquired, or any other digital content — regardless of the amount spent or how
                    recently the purchases were made
                  </li>
                </ul>
                <p>
                  <strong className="text-foreground">
                    By using the Services, you acknowledge and accept that a ban means you will lose
                    everything associated with your account, permanently and without compensation.
                  </strong>{" "}
                  This is non-negotiable and applies equally to free users and paying subscribers.
                </p>
              </div>
            </section>

            {/* Right to Monitor */}
            <section>
              <h2>Right to Monitor &amp; Inspect Usage</h2>
              <p>
                To maintain a safe, fair, and enjoyable environment for all users, we reserve the
                right to access, review, and analyze user data, account activity, transaction history,
                gameplay patterns, and usage behavior at any time, with or without notice to you.
              </p>
              <p>
                This includes but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Reviewing study session patterns and voice channel activity to detect fake or
                  automated usage
                </li>
                <li>
                  Inspecting economy transactions (LionCoins, LionGems, LionGold) to identify
                  suspicious activity, duplication, or exploitation
                </li>
                <li>
                  Analyzing LionGotchi inventory, marketplace transactions, and crafting/enhancement
                  history for evidence of abuse or exploitation
                </li>
                <li>
                  Monitoring account creation patterns to detect multi-accounting or ban evasion
                </li>
                <li>
                  Examining server-level data to investigate reports of abuse, harassment, or
                  moderation manipulation
                </li>
                <li>
                  Using automated systems and manual review to flag and investigate anomalous
                  behavior
                </li>
              </ul>
              <p>
                This monitoring is conducted solely for the purpose of enforcing these Terms,
                preventing abuse, protecting the integrity of the Services, and ensuring the safety
                and fairness of the community. We will not use this data for advertising or share it
                with third parties, as described in our{" "}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </a>.
              </p>
              <p>
                By using the Services, you consent to this monitoring and agree that any evidence of
                cheating, abuse, or Terms violations discovered through this process may be used as
                grounds for account termination as described above.
              </p>
            </section>

            {/* DIGITAL PURCHASES — NO REFUNDS */}
            <section>
              <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 mt-4">
                <h2 className="!mt-0">Digital Purchases &amp; No Refund Policy</h2>
                <p>
                  <strong className="text-foreground">
                    ALL PURCHASES OF DIGITAL CONTENT THROUGH THE SERVICES ARE FINAL AND
                    NON-REFUNDABLE.
                  </strong>{" "}
                  By completing any purchase, you acknowledge that you are buying digital content and
                  you expressly waive any right to cancel, return, or claim a refund once the
                  transaction is complete. This applies to all of the following:
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  LionGems (Premium Currency)
                </h3>
                <p>
                  LionGems are a virtual premium currency purchased with real money. LionGem purchases
                  are <strong className="text-foreground">non-refundable</strong> under any circumstances.
                  LionGems have no real-world monetary value, cannot be exchanged for cash, and
                  are not transferable outside the Services. We reserve the right to modify gem
                  pricing, bonus amounts, and the items available for purchase with gems at any time.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  LionHeart Subscriptions
                </h3>
                <p>
                  LionHeart, LionHeart+, and LionHeart++ are recurring monthly subscription plans
                  that provide premium perks. Subscription payments are{" "}
                  <strong className="text-foreground">non-refundable</strong>. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The initial subscription payment</li>
                  <li>All subsequent recurring monthly payments</li>
                  <li>Partial periods (no pro-rated refunds for cancellation mid-cycle)</li>
                  <li>Tier upgrades or downgrades (adjustments are handled by billing proration going forward, not refunds)</li>
                </ul>
                <p>
                  You may cancel your subscription at any time through the Stripe Customer Portal.
                  Upon cancellation, you retain access to your subscription perks until the end of
                  your current billing period. No refund will be issued for the remaining time.
                </p>

                {/* --- AI-MODIFIED (2026-03-22) --- */}
                {/* Purpose: Updated Server Premium legal text from gems to Stripe subscriptions */}
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  Server Premium
                </h3>
                <p>
                  Server Premium is a recurring subscription (&euro;9.99/month or &euro;99.99/year)
                  that unlocks cosmetic and gameplay bonuses for an entire Discord server.
                  Server Premium subscriptions are managed through Stripe and can be cancelled
                  at any time via the Stripe Customer Portal or the server dashboard.
                </p>
                <p className="mt-2">
                  Upon cancellation, the server retains premium features until the end of the
                  current billing period. No refund will be issued for the remaining time.
                  Existing premium time purchased with LionGems before the transition to
                  subscriptions will be honored until its natural expiry date.
                </p>
                {/* --- END AI-MODIFIED --- */}

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  LionGotchi Items, Equipment &amp; In-Game Purchases
                </h3>
                <p>
                  All purchases, trades, and transactions within the LionGotchi virtual pet system
                  are <strong className="text-foreground">final and non-refundable</strong>. This
                  includes but is not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pet equipment, furniture, rooms, and cosmetic items</li>
                  <li>Seeds, farm supplies, and crafting materials</li>
                  <li>Item enhancements and upgrades</li>
                  <li>Marketplace purchases between players</li>
                  <li>Any LionGold (in-game currency) spent on any item or service</li>
                  <li>Any LionGems spent on LionGotchi items, gacha pulls, or content</li>
                </ul>
                <p>
                  If an item is lost due to game mechanics (e.g., failed enhancement, crop death,
                  pet mood decay), this is part of normal gameplay and does not entitle you to a
                  refund or replacement.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  Profile Skins &amp; Cosmetics
                </h3>
                <p>
                  Profile card skins, animated card effects, and other cosmetic purchases made with
                  LionGems are <strong className="text-foreground">non-refundable</strong>. Cosmetic
                  items may be modified, updated, or retired at our discretion.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                  Chargebacks &amp; Payment Disputes
                </h3>
                <p>
                  If you initiate a chargeback or payment dispute with your bank or payment provider
                  for a legitimate transaction, we reserve the right to immediately suspend or
                  terminate your account and revoke all associated digital content, including but
                  not limited to LionGems, subscription perks, skins, and LionGotchi items. Fraudulent
                  chargebacks may be reported to the relevant authorities.
                </p>
              </div>
            </section>

            {/* Virtual Currency */}
            <section>
              <h2>Virtual Currencies &amp; Items</h2>
              <p>
                The Services include virtual currencies (LionCoins, LionGems, LionGold) and virtual
                items. These have no real-world monetary value. You do not own virtual currencies or
                items — you hold a limited, revocable license to use them within the Services.
              </p>
              <p>
                We reserve the right to manage, regulate, modify, or remove virtual currencies and
                items at any time, with or without notice. We are not liable for any changes to the
                value, availability, or functionality of virtual currencies or items.
              </p>
              <p>
                You may not sell, trade, or transfer virtual currencies or items outside of the
                Services. Any attempt to do so may result in termination of your account.
              </p>
            </section>

            {/* Changes to Services */}
            <section>
              <h2>Changes to the Services</h2>
              <p>
                LionBot.org may modify, update, suspend, or discontinue any part of the Services at
                any time without prior notice. This includes changes to features, pricing, virtual
                currency values, item stats, game mechanics, subscription benefits, and availability.
                We are not liable for any modifications or discontinuation of the Services.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2>Disclaimer of Warranties</h2>
              <p>
                THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
                IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED,
                ERROR-FREE, OR SECURE.
              </p>
              <p className="text-xs !text-muted-foreground/70">
                Some jurisdictions do not allow the exclusion of implied warranties. In those
                jurisdictions, the above exclusions may not apply to you to the extent prohibited
                by applicable law.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2>Limitation of Liability</h2>
              <p>
                Under no circumstances shall LionBot.org, its owner, developers, or affiliates be
                liable for any direct, indirect, special, incidental, consequential, or punitive
                damages arising out of your use of, or inability to use, the Services. This includes
                but is not limited to damages for loss of data, loss of profits, loss of virtual
                currency or items, business interruption, or any other losses — even if we have been
                advised of the possibility of such damages.
              </p>
              <p>
                If your use of the Services results in the need for servicing, repair, or correction
                of equipment or data, you assume all costs thereof.
              </p>
            </section>

            {/* User Communications */}
            <section>
              <h2>User Communications</h2>
              <p>
                Any material, information, or other communications you voluntarily transmit, post, or
                submit through the Services (collectively, &ldquo;Submissions&rdquo;) will be deemed
                non-confidential. Do not send any data through our Services that you believe to be
                sensitive, confidential, or proprietary information.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2>Termination</h2>
              <p>
                We reserve the right to monitor all users and servers and to terminate or suspend
                access to the Services for any user or server at our sole discretion, with or without
                cause and with or without notice. Grounds for termination include but are not limited
                to violation of these Terms, fraudulent activity, abuse of the economy system, or
                any conduct we deem harmful to other users or the Services.
              </p>
              <p>
                Upon termination, you forfeit all rights to any digital content, virtual currencies,
                virtual items, and subscription benefits associated with your account.{" "}
                <strong className="text-foreground">No refunds will be issued upon termination.</strong>
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2>Governing Law &amp; Jurisdiction</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the State
                of Israel. Any legal suit, action, or proceeding arising out of, or related to, these
                Terms or the Services shall be instituted exclusively in the judicial system of Israel,
                specifically in Tel Aviv District Court.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2>Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. When we do, we will update the
                &ldquo;Last updated&rdquo; date at the top of this page. By continuing to use the
                Services after changes are posted, you agree to the revised Terms. For significant
                changes, we may notify users through the bot or our Discord server.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Email:{" "}
                  <a href="mailto:contact@arihoresh.com" className="text-primary hover:underline">
                    contact@arihoresh.com
                  </a>
                </li>
                <li>
                  Discord:{" "}
                  <a
                    href="https://discord.gg/studylions"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    discord.gg/studylions
                  </a>
                </li>
              </ul>
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
// --- END AI-REPLACED ---
