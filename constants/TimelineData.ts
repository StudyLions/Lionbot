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
