// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-05
// Purpose: Timeline/changelog data for the public /timeline page
// ============================================================

export type TimelineCategory =
  | "feature"
  | "improvement"
  | "bugfix"
  | "liongotchi"
  | "premium"
  | "website";

export type TimelineArea = "bot" | "website" | "both";

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  category: TimelineCategory;
  area: TimelineArea;
}

export const TIMELINE_ENTRIES: TimelineEntry[] = [
  // ── April 30, 2026 ─────────────────────────────────────────
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Editorial redesign of the "Feature Your Server" feature.
  {
    date: "2026-04-30",
    title: "Feature Your Server: Magazine-Style Redesign",
    description:
      "Rebuilt the server profile and directory pages to read like a magazine. Pick from five real themes — Atlantic, Wired, Kinfolk, Vogue, Frieze — each with its own serif pairing, cover treatment, and rule style instead of just an accent-colour swap.",
    category: "improvement",
    area: "website",
  },
  // --- END AI-MODIFIED ---
  {
    date: "2026-04-30",
    title: "Setup Checklist: Premium Features Section",
    description:
      "We added a Premium features section to the dashboard's Setup Checklist for premium servers. Seven new tasks let you quickly configure ambient sounds, anti-AFK in study rooms, premium Pomodoro extras, leaderboard auto-post, sticky messages, card branding, and your public server listing — all from one place. Anti-AFK and branding are configurable inline (a toggle, an action picker, a colour preset) so you don't even need to leave the checklist. Servers without premium see a single, respectful preview row that lists what premium offers without nagging — no exclamation marks, no scarcity tactics, just a quiet \"See pricing\" button if you're curious.",
    category: "premium",
    area: "website",
  },
  {
    date: "2026-04-30",
    title: "Setup Checklist: Two Bug Fixes from Real Admin Reports",
    description:
      "Fixed two annoying bugs admins flagged after the new Setup Checklist shipped. First: the dashboard sometimes warned that the bot wasn't in your server when it actually was — a transient Discord lookup glitch that got cached for a full minute. We dropped the negative cache to 5 seconds and added an inline \"Try again\" button alongside a \"Re-invite the bot\" link. Second: if you opened a setup task and were happy with the existing settings, the Save button stayed disabled because nothing had changed — you had to make a fake change, then undo it. Now every task drawer has a \"Looks good — mark as done\" option when there's nothing to save, so you can confirm a task with one tap.",
    category: "bugfix",
    area: "website",
  },
  // --- END AI-MODIFIED ---
  {
    date: "2026-04-30",
    title: "Feature Your Server: a Public Profile Page for Premium Communities",
    description:
      "Premium server admins can now publish a beautiful, customisable profile page for their community at lionbot.org/servers/your-handle. Choose a theme, accent colour, and font; upload a cover image and gallery; pick a category and tags; toggle which sections to show; and add one DoFollow link to your website (a real SEO-juicy backlink, not a redirect). Every page has a bot-managed Discord invite, optional \"Verified by Leo\" live stats (member count, study minutes, in-voice-now), an embeddable widget for your own site, and a dynamic social preview image. Pages are reviewed by us before going live, and you can boost yours to the top of the new /servers directory with LionGems.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-04-30",
    title: "New Site Section: /servers Directory",
    description:
      "We added a public directory of premium servers at lionbot.org/servers — searchable, filterable by category, country, language, and study-only. The Header navigation now shows a Servers link in place of Features (Features moved into the Guides dropdown). The directory updates automatically as new premium servers publish their listings.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-30",
    title: "Store Customizer Is Now a Full-Screen Studio",
    description:
      "Rebuilt the store customizer as a full-screen studio: your shopkeeper lion at full size on the left in the live theme, and a tabbed panel on the right (Look · Identity · Voice) for every control. Pick a theme, change a colour, or rewrite your greeting and the whole page repaints instantly. A pinned status bar shows when changes are saved or pending.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-30",
    title: "Personal Stores: Tighter Layout, Customize Button Fixed",
    description:
      "Your lion, store name, and speech bubble now sit in a sticky sidebar (a tight banner on phones) so listings show up much higher on the page. Also fixed: \"Customize Your Store\" used to load forever and never open — it now opens the moment your store config arrives.",
    category: "bugfix",
    area: "website",
  },

  // ── April 29, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-29",
    title: "Marketplace 2.0 Parts 2 & 3: Themes, Featured Listings, Vanity URLs",
    description:
      "Five store themes (Default, Stardew, Pokemon, Earthbound, Game Boy) with animated backgrounds, accent colours, and live preview. LionHeart members can now feature listings (1/3/10 slots by tier) to push them to the top of the marketplace with a rainbow frame. Every store can have a custom URL like /pet/marketplace/store/your-handle.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-29",
    title: "Marketplace 2.0 Part 1: Personal Stores and Lower Fees for Subscribers",
    description:
      "Every seller now has a personal store front at /pet/marketplace/store/{your_id} — your lion is the shopkeeper, with a custom greeting and all your active listings in one place. LionHeart subscribers also get lower fees (4/3/2% by tier), longer listings, and higher caps. Existing listings are never touched.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-29",
    title: "New Setup Checklist for Server Admins",
    description:
      "Server setup got a full rebuild. The old 12-step wizard is now an 8-task Setup Checklist on your server's dashboard, with each task opening a focused panel (slide-in on desktop, full-screen on phones). Plain-English tooltips for technical terms, every task is skippable, and the bot warns upfront if it's missing the permissions you're enabling. The old wizard lives on as \"Guided Tour\" in dashboard search.",
    category: "improvement",
    area: "website",
  },

  // ── April 26, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-26",
    title: "Fixed: Crops Were Invisible on the Family Farm",
    description:
      "Crops on the family farm were rendering as empty soil even though the plants were growing fine in the background — only the shared farm view was affected, personal farms were not. Sprites now show up correctly. Nothing was lost; refresh the page and your plants are there. Reported by Fire.",
    category: "bugfix",
    area: "website",
  },

  // ── April 25, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-25",
    title: "Farm Timers Now Show Hours Properly",
    description:
      "Farm water timers now switch to hours:minutes:seconds when you have an hour or more left. Previously a freshly watered Phoenix Bloom would tick down from \"480:00\" instead of \"8:00:00\". Suggested by Lucky.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-25",
    title: "Fixed: \"Clear All Blacklists\" Showed Error Even When It Worked",
    description:
      "The \"Clear all active blacklists\" admin tool on Video and Screen Channels was showing a red \"Internal server error\" even though it had already finished pardoning everyone successfully. The destructive work always ran; only the success response was broken. Extra clicks on Clear were no-ops, so nothing was double-pardoned.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-04-25",
    title: "LionHeart Profile Cards — Real Bloom and Smoother Animation",
    description:
      "Rebuilt the LionHeart animated profile card. Glows now use a true Gaussian-blur bloom (instead of stacked rings), snowflakes and diamonds rotate as they fall, and the animation runs noticeably smoother. The 30+ day rainbow border and 100+ day gold-streak fire boost are finally wired in, and the dashboard preview now plays the animation instead of showing a stuck frame.",
    category: "premium",
    area: "bot",
  },
  {
    date: "2026-04-25",
    title: "LionHeart Studio — A Real Studio for Your Profile Card",
    description:
      "Rebuilt the LionHeart supporter dashboard. Your live profile card now sits in a sticky Discord-style chat preview on the left, with everything else split into clean tabs (Looks · Colors · Motion · Frame · Profile). No more Save button — every change auto-saves with a status pill. New: 12 one-click curated themes, a palette node graph for recolouring, animated previews for every particle and border style, a Surprise Me randomiser, and a Compare button to diff your saved card against your draft.",
    category: "premium",
    area: "website",
  },
  {
    date: "2026-04-25",
    title: "Fixed: USD Subscribers Weren't Getting Gems or Server Premium",
    description:
      "Anyone who subscribed to LionHeart in USD wasn't getting their monthly LionGems, server premium slot, or boosted top.gg vote rewards — the Stripe webhook only recognised the older EUR price IDs, so USD subscriptions were flagged as \"no tier\". Fixed, and we made the affected accounts whole (gems credited, tiers set, server premium provisioned).",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-04-25",
    title: "Email — Welcomes, Weekly Recaps, and Full Notification Control",
    description:
      "Launched our first email program. Sign in for the first time and you'll get a warm welcome (with a setup checklist if you're a server admin). Every Sunday at 18:00 UTC, anyone who studied that week gets a recap with focus time vs last week, streak, top server, and gems earned. A new Email Notifications card on /dashboard/settings toggles each category, with one-click unsubscribe in every email.",
    category: "feature",
    area: "website",
  },
  // ── April 24, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-24",
    title: "A Refreshed Homepage and Premium Page",
    description:
      "Big visual refresh of the homepage and premium page. The homepage gets a redesigned hero with live activity, the three LionGotchi sections collapse into one tabbed block, and a bolder gradient closer. The premium page got the bigger overhaul: split hero, an always-visible tier-comparison grid, a clearly dominant \"Most Popular\" tier, gem \"Best Value\" badges, and a sticky pricing bar that slides in on scroll. Both pages now share the dashboard's design tokens.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-24",
    title: "Plant Your Whole Farm in One Click",
    description:
      "Added a \"Plant All\" button to the personal and family farm toolbars. Pick a seed and the action button shows the full batch cost upfront (e.g. \"Buy & Plant All (12) — 120G\"). Each plot still rolls its own rarity, so you can still get a lucky LEGENDARY in a batch. Family planting uses the treasury and respects the existing permission. Thanks to Gaijin Yakuza.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 23, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-23",
    title: "Mods Can Now Edit Pomodoro Timers They Created",
    description:
      "Anyone with Manage Channels could create a Pomodoro timer with /pomodoro create, but got \"You don't have permission\" when trying to /pomodoro edit it. Fixed: if you can create it, you can edit it. Private study room timers keep their stricter owner-only rules. Thanks to bug report #0041.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-23",
    title: "Manage Your Subscription: Switch Plans and Add Tax IDs",
    description:
      "Long-overdue tune-up of the Stripe subscription portal. The \"Change plan\" option now shows current pricing for all three LionHeart tiers in USD and EUR, and Server Premium subscribers can switch between monthly/yearly without cancelling. Tax ID and billing address fields are now available so EU/UK customers can get VAT-compliant invoices.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-23",
    title: "Family \"Leave\" Button Now Asks for Confirmation",
    description:
      "The \"Leave\" button on the family hub now opens a confirmation prompt first, with a clear warning about the 7-day rejoin cooldown. The leader-side \"Disband\" button gets the same treatment, plus wording that bank items and treasury gold will be returned. Thanks to Sky.",
    category: "improvement",
    area: "bot",
  },
  {
    date: "2026-04-23",
    title: "Room Decorating: Smoother Drag, No More Lost Items",
    description:
      "Two tweaks to the LionGotchi room editor. Dragging furniture on a phone is noticeably smoother now (we were re-rendering ~100 times a second; capped to 60fps). And the off-canvas guardrail now uses each item's true visible area, so you can't accidentally drag a lamp into the void where its only on-canvas pixels are transparent. Reported by a member of Comité des jeunes Lit Up.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 21, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-21",
    title: "Room Decorating: Matching Colors and Mobile-Friendly Preview",
    description:
      "Four bug fixes for the LionGotchi room editor. The big one: wallpapers and furniture were showing different colors on the website vs Discord — we re-uploaded all 312 room asset images so they now match. Items appear immediately on first equip without a blank-canvas flash, drag keeps at least 20px of every decoration on-screen, and the room preview no longer gets cut off by the Gameboy frame on phones.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 20, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-20",
    title: "Disable Auto-Blacklisting From the Dashboard",
    description:
      "The Video Channels page now has a clearly labelled \"Auto-Blacklisting\" card with a one-click Disable button — turn it off and members will only ever be kicked from camera-required channels, never blacklisted. We also built a brand-new Screen Channels page with the same controls. Both pages let you \"Clear All Active Blacklists\" in one action with a typed confirmation.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-20",
    title: "Pomodoro Voice Alerts Are Audible Again",
    description:
      "Pomodoro voice alerts had gone silent — the bot would join the channel for a few seconds each round but no chime played. We were sending raw WAV bytes to Discord, which expects a specific audio format. Now we route the alert through ffmpeg first, so the chime actually plays. Same sounds, same timing.",
    category: "bugfix",
    area: "bot",
  },
  // ── April 19, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-19",
    title: "Send a Partial Stack of Items to Friends",
    description:
      "When you gift an item to a friend on the website, you can now choose how many to send instead of being forced to ship the entire stack. Pick an item, type the quantity (or hit \"All\"), and the rest stays in your inventory. Stacks of 1 work the same as before — no extra tap. Enhanced or scrolled gear still has to be sent as the whole stack, since the bonuses are tied to the stack itself and can't be cleanly split. Requested by an admin who wanted to send a few scrolls to a friend without losing the rest of their own collection.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-19",
    title: "/strikes Now Loads Instantly for High-Offense Users",
    description:
      "If a server had a long moderation history, the /strikes command would sometimes get stuck on \"thinking…\" when looking up a member with lots of past offenses. Under the hood the bot was scanning the entire guild's ticket history just to compute the per-guild ticket numbering for everyone before it could filter to one person. We rewrote that lookup to use three small targeted queries instead, so the command now responds in under a second regardless of how many tickets the server has — and it skips the heavy file attachment data it didn't actually need.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-19",
    title: "Clearer Descriptions for the Rank Type Setting",
    description:
      "The dashboard previously labelled the \"XP\" rank type as \"Combined XP\" with a description that said it counted both voice time and messages. That was misleading — the bot's XP rank type only counts text/word activity (longer messages earn more); voice study time is its own separate metric. We've updated the labels and tooltips on the Settings page, the Ranks page, and the setup wizard so admins know exactly which activity each option counts. The setting itself didn't change — just the description of what it does.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-19",
    title: "Anti-AFK Now Respects Untracked Channels (and Untrack Whole Categories from the Dashboard)",
    description:
      "Two related improvements. First, a bug fix: the Anti-AFK system was still sending activity check prompts in voice and stage channels that you'd marked as untracked in the Voice Tracker settings — including channels inside untracked categories like hangout or chat-only spaces. From now on, if a channel doesn't count toward study stats, Anti-AFK won't ping people there either. Second, you can now untrack a whole category in one click directly from the dashboard's Tracking Exclusions section (both for voice and text). Previously the dropdown only listed individual channels, so admins had to either pick every child channel one by one or use a slash command. Same goes for stage channels — they're properly handled across both improvements.",
    category: "bugfix",
    area: "both",
  },
  // ── April 17, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-17",
    title: "Reset a Member's Tracked Stats from the Dashboard",
    description:
      "Server admins can now selectively wipe a single member's tracked study data — voice/text time and XP, pomodoros, season stats, and (optionally) coins — with a time-frame filter (24h, 7 days, 30 days, custom, or all time). Every reset shows a live preview, requires a typed name confirmation, and is fully logged.",
    category: "feature",
    area: "website",
  },
  // ── April 10, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-10",
    title: "Inventory QoL — Equip Best, Try On, and Marketplace Links",
    description:
      "We added three quality-of-life features to the pet inventory based on community feedback: an 'Equip Best' button that auto-equips your strongest items across all slots with one click, a 'Try On' preview that lets you see how any item looks on your lion before equipping or buying, and convenient marketplace links throughout the inventory page so you can easily browse for new gear.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 7, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-07",
    title: "Privacy Dashboard — GDPR Compliance",
    description:
      "We added a new Privacy section to the dashboard where you can view a summary of all data we store about you, download a full copy of your data as a JSON file, or request deletion of your account data. Deletion requests include a 14-day cooling-off period and are reviewed by an admin before processing.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-07",
    title: "Room Inactivity Auto-Delete",
    description:
      "Server admins can now enable automatic cleanup of inactive private rooms. Set a number of days, and rooms with no messages or voice activity will be deleted automatically — with the remaining balance refunded to the owner. The dashboard also shows each room's last active time so admins can monitor activity at a glance.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-07",
    title: "Configurable Schedule Reminder Timing",
    description:
      "Server admins can now customize how early scheduled session reminders are sent, anywhere from 5 to 30 minutes before the session starts. Previously this was locked at 15 minutes. Configure it with /admin config schedule or through the bot's interactive settings panel.",
    category: "improvement",
    area: "bot",
  },
  // ── April 6, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-06",
    title: "Anti AFK System — Premium Voice Activity Checks",
    description:
      "We added a new premium feature that automatically checks if users in voice channels are still active. Admins can configure check intervals, grace periods, and choose between disconnecting, pausing sessions, or moving inactive users to the AFK channel. Everything is configured from the dashboard with smart exemptions for streaming users, pomodoro sessions, and specific roles or channels.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-04-06",
    title: "Schedule Reminder Mute + Notification Fix",
    description:
      "You can now mute scheduled session reminders with a button right on the DM itself, or from the dashboard profile page. We also fixed an issue where booking consecutive hourly slots would send a separate reminder for each hour — now you only get one notification for the entire block.",
    category: "improvement",
    area: "both",
  },
  // ── April 5, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-05",
    title: "Features Page Overhaul — 12 Sections, Live Stats & FAQ",
    description:
      "We completely rebuilt the features page with 5 new sections (Private Rooms, Tasks & Boards, Scheduled Sessions, Ambient Sounds, Web Dashboard), live stats counters, sticky category navigation, a 'More Features' grid, and a FAQ section. The page now showcases 20+ features instead of just 7.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-05",
    title: "Scheduled Sessions: Calendar, iCal Sync & Server View",
    description:
      "Your study sessions now appear on a beautiful monthly calendar. You can sync them to Google Calendar or Apple Calendar with one click. Server admins also get a calendar tab showing attendance across all sessions.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-05",
    title: "Room Notifications Toggle",
    description:
      "Server admins can now turn off the join/leave notification messages that appear inside private rooms. Find it in Server Settings under Private Rooms.",
    category: "improvement",
    area: "both",
  },
  {
    date: "2026-04-05",
    title: "Study Session Notifications Fixed",
    description:
      "Session reminders now send properly as DMs before the session starts, and the channel ping actually triggers a push notification on your phone.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-05",
    title: "Session Stats Labels Fixed",
    description:
      "The attendance stats on scheduled sessions no longer have invisible text on dark theme. Each stat now has its own clear label.",
    category: "bugfix",
    area: "bot",
  },

  // ── April 4, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-04",
    title: "Sound Bot Slash Commands",
    description:
      "All ambient sound bots now support 9 slash commands: /nowplaying, /skip, /volume, /sound, /panel, /history, /queue, /blacklist, and /status. Control your server's vibes without touching the dashboard.",
    category: "feature",
    area: "bot",
  },
  {
    date: "2026-04-04",
    title: "Sound Bot Trail Messages Fixed",
    description:
      "The sound bot was leaving behind old control panel messages every 10 minutes. We tracked down the cause and fixed it — no more message clutter in voice channels.",
    category: "bugfix",
    area: "bot",
  },

  // ── April 3, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-03",
    title: "Theme Picker — 5 Color Themes",
    description:
      "The dashboard now has 5 beautiful color themes: Midnight (the classic dark look), Light, Ocean, Forest, and Sunset. Find the theme switcher at the bottom of the sidebar.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "My Rooms — Complete Redesign",
    description:
      "The rooms dashboard got a total makeover with a two-panel layout. See all your rooms on the left, click one to manage it on the right — deposit coins, rename, invite or kick members, transfer ownership, and control the pomodoro timer.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "Admin Room Management Panel",
    description:
      "Server admins get a dedicated rooms panel with analytics, health stats, room search, freeze/unfreeze controls, bulk actions, CSV export, and a full audit log of admin actions.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "Leave Room Command",
    description:
      "Members can now voluntarily leave a private room with /room leave or the new Leave button on the room panel. No more needing the owner to kick you.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-03",
    title: "Farm Growth — Accurate Time Estimates",
    description:
      "The farm embed now shows how much time is actually remaining instead of wildly wrong numbers. We were accidentally using old growth constants for the estimate.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-03",
    title: "Farm Growth Saves Properly",
    description:
      "Fixed a rare issue where farm progress could be lost if a voice session and a message counted at the exact same moment. Growth updates are now safe from overlap.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-03",
    title: "Messages Now Count Toward Farm Growth",
    description:
      "Sending messages was supposed to help your plants grow, but the math was accidentally rounding everything down to zero. Now your messages actually contribute!",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-03",
    title: "Ambient Sounds Page Fixed for Premium Servers",
    description:
      "Premium servers were seeing a 'not premium' message on the Ambient Sounds page even though they had premium. This was caused by missing database setup on the production server.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "Sounds Bot Goes Live",
    description:
      "The ambient sounds bot is now running on the live server with all 10 bot instances ready to serve premium guilds.",
    category: "premium",
    area: "bot",
  },

  // ── April 2, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-02",
    title: "Four Live Bot Bugs Fixed",
    description:
      "We went through 12 hours of logs and fixed: /warning crashing when used on a bot, the /profile command failing during startup, a database conflict when two people joined voice at the exact same time, and a logging format issue.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-02",
    title: "Website Links Temporarily Updated",
    description:
      "While lionbot.org was down, we swapped all bot links to point to the backup URL so nothing was broken for users.",
    category: "improvement",
    area: "bot",
  },

  // ── April 1, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-01",
    title: "/pet Command Crash Fixed",
    description:
      "The /pet command was crashing on all servers due to a text formatting issue introduced during the text customization work. We identified and fixed it within hours.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-01",
    title: "Text Customization System (Premium)",
    description:
      "Premium servers can now customize any bot message to say whatever they want. Change button labels, embed text, notification wording — everything is editable from the dashboard with search, categories, and backup/restore.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-04-01",
    title: "Room Owner Delete & Mod Role",
    description:
      "Room owners can now delete their own rooms (with a coin refund) using /room delete or the dashboard. Admins can also set a moderator role that automatically gets access to all rooms.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-01",
    title: "Six Room Settings Now Actually Work",
    description:
      "We found that six room settings (sync permissions, max rooms per user, name length limit, minimum deposit, auto-extend, cooldown) were showing in the dashboard but the bot wasn't reading them. Now they're fully wired up.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-01",
    title: "LoFi Music Polish Pass",
    description:
      "LoFi playback got a full quality upgrade: proper song metadata, consistent volume levels, smooth fade-in/fade-out, 'Now Playing' display, skip button, automatic crash recovery, and sub-playlists by mood.",
    category: "improvement",
    area: "bot",
  },

  // ── March 31, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-31",
    title: "Shared Kanban Boards",
    description:
      "Create collaborative task boards with your friends! Drag and drop tasks between columns, assign team members, track activity history, and use /board on Discord to check tasks quickly.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-31",
    title: "Screen Share Enforcement",
    description:
      "Just like camera-only channels, admins can now set up screen-share-only voice channels. Members who don't share their screen get warned and eventually timed out.",
    category: "feature",
    area: "bot",
  },
  {
    date: "2026-03-31",
    title: "Marketplace — Scroll Data Preserved",
    description:
      "Previously, selling an enhanced item on the marketplace would lose all its scroll bonuses. Now scroll data is fully preserved — buyers get exactly the item you listed, scrolls and all.",
    category: "bugfix",
    area: "website",
  },

  // ── March 30, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-30",
    title: "Weekly Leaderboard Post Fix",
    description:
      "If you used 'Run Now' to manually post a leaderboard during the week, it would block the scheduled weekly post from firing. Fixed — manual runs no longer interfere with the schedule.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-30",
    title: "Economy Page Loading Fix",
    description:
      "The economy dashboard was stuck on a loading spinner for large servers. We split it into two faster requests and added proper database indexes so it loads in seconds now.",
    category: "bugfix",
    area: "website",
  },

  // ── March 27, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-27",
    title: "\"Unknown\" Member Names Fixed",
    description:
      "Members who study in voice channels but never run a bot command were showing as \"Unknown\" on the dashboard. Now the bot syncs their name as soon as they join a voice channel.",
    category: "bugfix",
    area: "bot",
  },

  // ── March 25, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-25",
    title: "Multi-Rank Type Support",
    description:
      "Servers can now track Voice, XP, and Message ranks all at the same time instead of picking just one. Enable secondary rank types from the dashboard or /configure ranks.",
    category: "feature",
    area: "both",
  },

  // ── March 24, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-24",
    title: "Pet Friends — Discord Bot Integration",
    description:
      "The friends system is now fully available from Discord! Use the Friends button on /pet to browse friends, accept requests, visit pets, care for them, and water their farm — all without leaving Discord.",
    category: "liongotchi",
    area: "bot",
  },
  {
    date: "2026-03-24",
    title: "Friend Request Notifications",
    description:
      "You'll now see a gold badge on the Friends tab when you have pending friend requests, plus a banner on the pet overview page. We also added a limit of 10 friend requests per day to prevent spam.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-24",
    title: "Pet Family — Discord Bot Integration",
    description:
      "Families are now playable from Discord! Create families, invite members, view the family portrait, browse members' pets, manage the shared farm, and pick themes — all through the Family button on /pet.",
    category: "liongotchi",
    area: "bot",
  },
  {
    date: "2026-03-24",
    title: "Family Feature Fixes (15+ Bugs)",
    description:
      "We did a deep audit of the family section and fixed over 15 issues: pages not loading, actions posting to wrong places, missing member data, broken permissions, and more. The entire family system is now solid.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-24",
    title: "Equipment Drop Bonus Actually Works Now",
    description:
      "Your equipment's drop rate bonus was being displayed in the stats but wasn't actually affecting drop rolls. We tracked it down and fixed it — your gear bonuses now genuinely help you find more items.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-24",
    title: "Pet Tutorial Wizard",
    description:
      "New players get a friendly 12-step interactive tutorial that walks through every LionGotchi feature with live demos and zero jargon. It uses real game components so you see exactly what to expect.",
    category: "liongotchi",
    area: "website",
  },
  {
    date: "2026-03-24",
    title: "UI/UX Consistency Overhaul",
    description:
      "We went through every single page (111 files!) and made everything consistent: standardized tabs, cards, inputs, colors, loading states, pagination, and accessibility improvements across the entire website.",
    category: "website",
    area: "website",
  },

  // ── March 23, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-23",
    title: "Server Premium — Now a Subscription",
    description:
      "Server premium is now a proper monthly subscription (€9.99/mo or €99.99/year, save 17%) powered by Stripe. No more spending LionGems on premium — gems are now exclusively for skins and cosmetics.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "LionHeart++ Includes Server Premium",
    description:
      "LionHeart++ subscribers now get one free server premium included with their membership. You can apply it to any server you admin and transfer it between servers (7-day cooldown).",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Subscriptions Dashboard",
    description:
      "A new page to manage all your subscriptions in one place: LionHeart membership status, paid server premiums with transfer options, and LionHeart++ server premium management.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-03-23",
    title: "Setup Wizard — \"Leo's Welcome Tour\"",
    description:
      "New server admins get a beautiful 12-step guided setup with live previews, real bot-rendered profile cards, a sarcastic lion mascot named Leo, and confetti at the end. Covers timezone, economy, ranks, pomodoro, rooms, LionGotchi, and more.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-03-23",
    title: "Leaderboard Role Filter",
    description:
      "Admins can now choose which roles appear on the server leaderboard. Enable filtering from the new Leaderboard config page, pick the roles, and members can switch between filtered views.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Shop Rooms — Buy Room Rentals from the Shop",
    description:
      "Admins can now add room rental packages to the server shop. Members can buy a private room directly from the shop with /shop, and the room gets created automatically.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Ambient Sounds — Schedules, Voting & Analytics",
    description:
      "Sound bots got four big additions: usage analytics with charts, scheduled sound changes (e.g., LoFi during the day, rain at night), sound voting for members, and private room sound rental.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Daily Study Cap Fix",
    description:
      "Some servers had their daily study cap set incorrectly — the dashboard was saving hours but the bot expected seconds. This caused voice tracking to completely stop on affected servers. We fixed the conversion and restored all affected servers.",
    category: "bugfix",
    area: "both",
  },

  // ── March 22, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-22",
    title: "LionGotchi Social Features",
    description:
      "The biggest LionGotchi update yet! Friends system (add friends, care for their pets, water farms, send gifts), family system (shared bank, farms, treasury, portraits, themes, leveling), and a pet leaderboard with 4 categories.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Ambient Sounds Bot",
    description:
      "Premium servers can now have up to 5 sound bots playing rain, campfire, ocean, brown noise, white noise, or LoFi music in voice channels. Configure everything from the dashboard — just invite a bot and pick a sound.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Sticky Messages",
    description:
      "A new premium feature: set up bot-managed embeds that always stay as the last message in a channel. Great for rules, announcements, or any info you want everyone to see. Configure from the dashboard.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Scroll Success Rate Reworked",
    description:
      "We reworked how scroll success rates scale with enhancement level. The old system hit a harsh cliff where scrolling became essentially impossible at high levels. The new curve is smooth and fair — still challenging, but never hopeless.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Private Rooms Dashboard",
    description:
      "Your private rooms now have a dedicated dashboard page! See all your rooms across servers, deposit coins, rename rooms, view study leaderboards, manage members, and get warnings when rooms are about to expire.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Room Editor — Timer Controls",
    description:
      "Room owners can now create, start, stop, and configure pomodoro timers for their rooms directly from the dashboard. Focus time, break time, and auto-restart are all adjustable.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "Dashboard Global Search",
    description:
      "Press Ctrl+K (or Cmd+K) anywhere on the dashboard to instantly search across all pages, settings, and features. Results are grouped by type with keyboard navigation.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "OG Images for Every Page",
    description:
      "Every page on the website now has a unique branded preview image. When you share a link on Discord, Twitter, or anywhere else, it shows a beautiful card instead of a generic preview.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "Room Editor / Discord Sync Fixed",
    description:
      "The room editor on the website wasn't showing the same furniture as Discord. We fixed the mismatch — what you see on the website now matches what the bot renders.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "Drop Notification Buttons Fixed",
    description:
      "The 'Open Pet' and 'Mute Drops' buttons on item drop notifications used to stop working after bot restarts. They now work permanently, even on old messages.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-22",
    title: "Drop Channel Notifications Restored",
    description:
      "Servers with a dedicated drop channel stopped getting item drop notifications. We accidentally disabled them while fixing spam reports — now they work again for servers that set up a channel.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-22",
    title: "Farm Planting Controls Now Visible",
    description:
      "On the website, clicking a farm plot selected it but the plant button was hidden below the screen. Now it automatically scrolls into view so you can actually plant things.",
    category: "bugfix",
    area: "website",
  },

  // ── March 21, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-21",
    title: "LionGotchi Launched! \uD83C\uDF89",
    description:
      "The moment we've all been waiting for — LionGotchi is live on all servers! Adopt a virtual pet, take care of it, collect items from studying, decorate your room, grow a farm, enhance equipment, and explore the marketplace.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-21",
    title: "Auto Leaderboard Posts",
    description:
      "Set up automated leaderboard posts that fire on a schedule (daily, weekly, monthly, or seasonal). Comes with role assignment, coin rewards, winner DMs, and a full dashboard editor with live embed preview.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-21",
    title: "Marketplace Redesign",
    description:
      "The marketplace got a MapleStory-inspired makeover: individual item detail pages, scroll data on listings, separate gold/gem price history charts, a filter sidebar, grid/list view toggle, and a sleek buy dialog.",
    category: "liongotchi",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Enhancement Page Overhaul",
    description:
      "Enhancement got a cinematic upgrade: an animated anvil forge ceremony with sound effects, batch enhancing for repetitive scrolling, achievement badges, and session streak tracking.",
    category: "liongotchi",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Dashboard Security Hardened",
    description:
      "We discovered and fixed a security issue where any signed-in user could view other servers' admin pages. All server pages now properly check your permissions before showing anything.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Stripe Checkout Fixed",
    description:
      "LionHeart membership checkout was failing due to a subtle issue with how payment info was stored. Fixed and verified — all subscription tiers now work smoothly.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Balance Command Crash Fixed",
    description:
      "The /balance command was crashing on servers using certain languages (like German) due to a formatting issue in translated text. We added a safety net so it falls back gracefully.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-21",
    title: "Leaderboard Card Rendering Fixed",
    description:
      "Leaderboard images weren't generating correctly because one of our background services was running old code. A quick restart fixed it.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-21",
    title: "Vote Reminder DMs — No More Duplicates",
    description:
      "Top.gg vote reminder DMs were sending 2-3 copies to the same person. We added deduplication so you only get one reminder per vote cycle.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-21",
    title: "False \"Access Denied\" Fixed",
    description:
      "Dashboard pages would sometimes flash \"Access Denied\" when Discord's servers were slow to respond. Now it shows a friendly retry message instead and keeps your session alive.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Leaderboard Autopost — Cross-Server Fix",
    description:
      "Test Post and Run Now on the leaderboard autopost page weren't working for most servers because the action was processed on a different server shard. Fixed to work across all shards.",
    category: "bugfix",
    area: "bot",
  },
];

export const TIMELINE_STATS = {
  totalFeatures: TIMELINE_ENTRIES.filter(
    (e) => e.category === "feature" || e.category === "liongotchi" || e.category === "premium"
  ).length,
  totalBugFixes: TIMELINE_ENTRIES.filter((e) => e.category === "bugfix").length,
  totalUpdates: TIMELINE_ENTRIES.length,
};
