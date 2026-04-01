// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Updated: 2026-03-24
// Purpose: Admin-facing tutorial content (11 tutorials)
// ============================================================
import type { Tutorial } from "./index"

export const adminTutorials: Tutorial[] = [
  // ── 1. Initial Server Setup ─────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Expanded setup wizard step to detail all 12 wizard steps, mention localStorage auto-save
  {
    slug: "server-setup",
    title: "Setting Up LionBot",
    description: "Add LionBot to your server, set permissions, and run the setup wizard to get everything configured.",
    audience: "admin",
    iconName: "Settings",
    estimatedMinutes: 6,
    nextSlug: "configuring-ranks",
    steps: [
      {
        id: "invite-bot",
        title: "Adding LionBot to Your Server",
        paragraphs: [
          "To add LionBot to your server, use the invite link on our homepage or click 'Invite Bot' in the navigation. You'll need the Manage Server permission in Discord to do this.",
          "During the invite process, Discord will ask which permissions to give LionBot. We recommend keeping all permissions checked — the bot needs them for features like role management, voice tracking, and sending messages.",
        ],
        tip: "LionBot needs the Administrator permission for full functionality. If you limit permissions, some features like role menus and rank roles won't work properly.",
      },
      {
        id: "first-steps",
        title: "First Steps After Adding",
        paragraphs: [
          "Once LionBot is in your server, it will work with default settings right away. Members can start using commands immediately.",
          "But to really make the most of it, you'll want to configure things like ranks, economy rates, and the shop. That's where the dashboard comes in.",
        ],
      },
      {
        id: "the-dashboard",
        title: "The Admin Dashboard",
        paragraphs: [
          "The web dashboard is your command center. Sign in with Discord, select your server, and you'll see all the configuration options in one place.",
          "From the dashboard, you can manage ranks, shop items, role menus, economy settings, moderation, and more — without typing a single Discord command.",
        ],
        command: "/dashboard",
      },
      {
        id: "setup-wizard",
        title: "The Setup Wizard",
        paragraphs: [
          "If you're setting up LionBot for the first time, the Setup Wizard walks you through everything step by step. It's a 12-step guided flow that covers:",
          "Welcome — Introduction and what to expect. Ranks — Set up rank tiers and choose voice time, XP, or message-based progression. LionGotchi — Enable or disable the virtual pet system. Economy — Configure coin earn rates and daily study caps.",
          "Tasks — Set up task completion rewards. Pomodoro — Configure focus/break timers for voice channels. Schedule — Set up bookable study time slots. Basics — Server timezone, logging channel, and core settings.",
          "Community — Study channels, notification preferences, and welcome messages. Commands — Choose which command categories to enable. Premium — Overview of premium features. Celebration — You're all set!",
          "Your progress saves automatically — if you close the browser and come back, the wizard picks up where you left off.",
        ],
        tip: "You can always come back and change settings later. The wizard just gives you a good starting point.",
      },
      {
        id: "permissions",
        title: "Understanding Permissions",
        paragraphs: [
          "LionBot has two levels of dashboard access:",
          "Moderators (Manage Guild permission) — Can view server stats, manage members, and use moderation tools.",
          "Administrators (Administrator permission) — Full access to all settings, ranks, shop, role menus, and configuration.",
          "You can also set custom mod and admin roles in the server settings if you want to give dashboard access to specific roles without giving them Discord-level permissions.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 2. Configuring Ranks ────────────────────────────────
  {
    slug: "configuring-ranks",
    title: "Configuring Ranks",
    description: "Set up a rank system so members level up as they study. Choose between voice time, XP, or message-based ranks.",
    audience: "admin",
    iconName: "BarChart3",
    estimatedMinutes: 6,
    prevSlug: "server-setup",
    nextSlug: "setting-up-shop",
    steps: [
      {
        id: "what-are-ranks",
        title: "What Are Ranks?",
        paragraphs: [
          "Ranks are milestone roles that members earn as they accumulate activity. They're one of the most popular LionBot features — they give members visible goals to work toward and recognition for their effort.",
          "When a member hits a rank threshold, they automatically get the corresponding Discord role and the bot can announce it in a channel of your choice.",
        ],
      },
      {
        id: "rank-types",
        title: "Choosing a Rank Type",
        paragraphs: [
          "You need to decide what type of activity ranks are based on:",
          "Voice Time — Members rank up by spending time in voice channels. Best for study servers and communities focused on voice activity.",
          "XP (Experience Points) — Members earn XP from both messages and voice activity. A balanced option that rewards all types of participation.",
          "Messages — Members rank up based on message count. Best for text-heavy communities.",
          "Most study servers use Voice Time since it directly measures study effort.",
        ],
      },
      {
        id: "creating-tiers",
        title: "Creating Rank Tiers",
        paragraphs: [
          "A rank tier has three things: a name, a Discord role, and a threshold (how much activity is needed to reach it).",
          "For example, you might set up tiers like: Beginner (1 hour), Regular (10 hours), Dedicated (50 hours), Expert (200 hours), Master (500 hours).",
          "Create the Discord roles first, then assign them to rank tiers in the dashboard. You can have as many tiers as you want.",
        ],
        tip: "Space out your lower tiers more closely (1h, 5h, 10h) so new members rank up quickly and feel rewarded. Spread out higher tiers more (50h, 100h, 250h) for long-term goals.",
      },
      {
        id: "rank-channel",
        title: "Rank-Up Announcements",
        paragraphs: [
          "Set a channel where LionBot announces rank-ups. When a member reaches a new tier, the bot posts a congratulation message in that channel.",
          "You can also enable DM notifications so members get a private message when they rank up. Configure both options in the Ranks section of the dashboard.",
        ],
      },
      {
        id: "try-ranks",
        title: "Try It: Ranks Editor",
        paragraphs: [
          "Here's the ranks editor. If you're signed in as a server admin, you'll see your server's actual rank configuration.",
        ],
        interactive: "ranks-editor",
      },
    ],
  },

  // ── 3. Setting Up the Shop ──────────────────────────────
  {
    slug: "setting-up-shop",
    title: "Setting Up the Shop",
    description: "Create a shop where members can spend their LionCoins on colour roles and other items.",
    audience: "admin",
    iconName: "ShoppingBag",
    estimatedMinutes: 5,
    prevSlug: "configuring-ranks",
    nextSlug: "role-menus",
    steps: [
      {
        id: "shop-overview",
        title: "What Is the Shop?",
        paragraphs: [
          "The shop gives members something to spend their LionCoins on. The most common shop items are colour roles — custom-colored name roles that members can buy to stand out.",
          "Having a shop creates a goal for earning coins, which motivates members to study more and stay active.",
        ],
      },
      {
        id: "adding-items",
        title: "Adding Colour Roles",
        paragraphs: [
          "To add a colour role to the shop, you need a Discord role with the color you want. Create the role in Discord first, then add it to the shop in the dashboard or with the /editshop command.",
          "Set a price in LionCoins for each role. When a member buys it, they get the role automatically.",
        ],
        command: "/editshop",
        tip: "Make sure LionBot's role is above the colour roles in Discord's role hierarchy. Otherwise, the bot can't assign them to members.",
      },
      {
        id: "pricing-strategy",
        title: "Pricing Your Items",
        paragraphs: [
          "Think about how long it takes members to earn coins when setting prices. If a member earns about 100 coins per hour of study, a 500-coin role takes 5 hours of effort.",
          "Start with lower prices and adjust as you see how your economy develops. You can always change prices later.",
        ],
      },
      {
        id: "managing-shop",
        title: "Managing the Shop",
        paragraphs: [
          "Use the dashboard to add, remove, and reprice shop items at any time. You can also see purchase history to understand what's popular.",
          "Members browse the shop with /shop open and buy with /shop buy. It's all automated — you set it up once and it runs itself.",
        ],
      },
    ],
  },

  // ── 4. Role Menus ───────────────────────────────────────
  {
    slug: "role-menus",
    title: "Role Menus",
    description: "Let members pick their own roles with reaction, button, or dropdown menus.",
    audience: "admin",
    iconName: "Layers",
    estimatedMinutes: 5,
    prevSlug: "setting-up-shop",
    nextSlug: "server-settings",
    steps: [
      {
        id: "what-are-role-menus",
        title: "What Are Role Menus?",
        paragraphs: [
          "Role menus let members assign themselves roles by clicking a button, selecting from a dropdown, or reacting to a message. They're perfect for things like study subject roles, notification preferences, or color roles.",
          "You create the menu once, and members can interact with it anytime without needing admin help.",
        ],
      },
      {
        id: "types-of-menus",
        title: "Menu Types",
        paragraphs: [
          "LionBot supports three types of role menus:",
          "Button menus — Members click buttons under a message. Clean and modern-looking.",
          "Dropdown menus — Members select from a dropdown list. Good when you have many options.",
          "Reaction menus — Members react with emojis. The classic approach.",
          "All three work the same way — member clicks/selects, they get the role. Click/select again, the role is removed.",
        ],
      },
      {
        id: "creating-menu",
        title: "Creating a Role Menu",
        paragraphs: [
          "The easiest way to create a role menu is from the dashboard. Go to your server's Role Menus section and click Create.",
          "You can also use the Role Menu Editor in Discord by right-clicking a message and selecting it from the Apps menu.",
          "Pick your roles, choose a menu type, customize the message, and you're done.",
        ],
        tip: "Use descriptive labels for each role option. Instead of just 'Biology', write 'Biology — Get notified about biology study sessions' so members know exactly what they're signing up for.",
      },
      {
        id: "best-practices",
        title: "Best Practices",
        paragraphs: [
          "Keep role menus in a dedicated channel like #roles or #self-assign so members can always find them.",
          "Don't put too many roles in one menu — if you have more than 10 options, split them into categories (e.g., 'Subject Roles' and 'Notification Roles').",
          "Make sure LionBot's role is higher than the roles in the menu, or it won't be able to assign them.",
        ],
      },
    ],
  },

  // ── 5. Server Settings ──────────────────────────────────
  {
    slug: "server-settings",
    title: "Server Settings",
    description: "Configure your server's timezone, event logging, feature toggles, and general preferences.",
    audience: "admin",
    iconName: "Sliders",
    estimatedMinutes: 5,
    prevSlug: "role-menus",
    nextSlug: "pomodoro-and-schedule",
    steps: [
      {
        id: "timezone",
        title: "Server Timezone",
        paragraphs: [
          "Set your server's timezone so that stats, leaderboards, and scheduled events use the right clock. This is separate from each member's personal timezone.",
          "The server timezone is used for things like daily leaderboard resets and weekly statistics.",
        ],
      },
      {
        id: "event-logging",
        title: "Event Logging",
        paragraphs: [
          "LionBot can log various events to a channel you choose — rank-ups, moderation actions, and more. Set up a log channel in the settings to keep track of what's happening.",
          "This is useful for moderation and for seeing how active your server's economy is.",
        ],
      },
      {
        id: "feature-toggles",
        title: "Feature Toggles",
        paragraphs: [
          "Don't need every feature? You can enable or disable individual features from the settings. Turn off the economy, disable ranks, or hide certain commands — it's up to you.",
          "This keeps your server clean and focused on the features your community actually uses.",
        ],
      },
      {
        id: "mod-admin-roles",
        title: "Custom Mod & Admin Roles",
        paragraphs: [
          "By default, LionBot uses Discord's built-in permissions to determine who can access the dashboard. But you can set custom roles — give your moderators dashboard access without giving them the Discord Manage Guild permission.",
          "Configure this in the Settings section of the dashboard.",
        ],
      },
    ],
  },

  // ── 6. Pomodoro & Schedule ──────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Added Pomodoro Analytics step
  {
    slug: "pomodoro-and-schedule",
    title: "Pomodoro & Schedule",
    description: "Set up Pomodoro timers in voice channels and configure the schedule system for organized study sessions.",
    audience: "admin",
    iconName: "Clock",
    estimatedMinutes: 5,
    prevSlug: "server-settings",
    nextSlug: "economy-and-moderation",
    steps: [
      {
        id: "pomodoro-setup",
        title: "Setting Up Pomodoro",
        paragraphs: [
          "Pomodoro timers run in voice channels. To set one up, go to the Pomodoro section in the dashboard and configure which channels should have timers.",
          "You can set the focus duration (default 25 minutes) and break duration (default 5 minutes) for each channel.",
        ],
      },
      {
        id: "pomodoro-channels",
        title: "Pomodoro Channels",
        paragraphs: [
          "Designate specific voice channels as Pomodoro channels. When a member joins, the timer starts automatically. The bot will announce focus and break periods with sound notifications.",
          "You can have different settings for different channels — maybe a 25/5 channel and a 50/10 channel for longer sessions.",
        ],
        tip: "Name your Pomodoro channels clearly, like '🍅 Focus 25/5' and '🍅 Deep Work 50/10' so members know what to expect.",
      },
      {
        id: "schedule-system",
        title: "The Schedule System",
        paragraphs: [
          "The schedule system lets you set up organized study sessions with hourly time slots. Members can book slots ahead of time, which creates commitment and structure.",
          "Configure the schedule in the dashboard — set available hours, the schedule channel, and how booking works.",
        ],
      },
      {
        id: "schedule-config",
        title: "Configuring the Schedule",
        paragraphs: [
          "Choose which hours are available for booking, how far in advance members can book, and whether the schedule resets daily or weekly.",
          "The bot posts an interactive schedule message that members can click to book or cancel slots.",
        ],
      },
      {
        id: "pomodoro-analytics",
        title: "Pomodoro Analytics",
        paragraphs: [
          "Premium servers get access to Pomodoro Analytics — a dashboard page showing detailed usage data. See how many focus sessions your members complete, peak study hours, average session lengths, and which channels are most popular.",
          "Use these insights to optimize your Pomodoro setup. If most members study between 8-10 PM, make sure your best channels are available during those hours.",
        ],
        note: "Pomodoro Analytics is a premium feature. See the Premium Features tutorial for more details on what's included.",
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 7. Economy & Moderation ─────────────────────────────
  {
    slug: "economy-and-moderation",
    title: "Economy & Moderation",
    description: "Fine-tune coin earning rates, manage the economy, and use moderation tools to keep your server healthy.",
    audience: "admin",
    iconName: "Shield",
    estimatedMinutes: 6,
    prevSlug: "pomodoro-and-schedule",
    nextSlug: "video-and-branding",
    steps: [
      {
        id: "economy-settings",
        title: "Economy Configuration",
        paragraphs: [
          "Control how fast members earn LionCoins. You can set the coin rate (coins per hour of voice activity), task completion rewards, and daily bonuses.",
          "Find these settings in the Economy section of the dashboard. Adjust rates to match how you want your server's economy to feel.",
        ],
        tip: "Start with moderate rates and adjust based on how quickly members are accumulating coins. If everyone has millions of coins and nothing to spend them on, lower the rate or add more shop items.",
      },
      {
        id: "economy-management",
        title: "Managing the Economy",
        paragraphs: [
          "From the dashboard, you can see economy statistics — total coins in circulation, top earners, transaction history, and more.",
          "You can also manually adjust member balances if needed, like correcting a mistake or rewarding someone for a special contribution.",
        ],
      },
      {
        id: "moderation-tools",
        title: "Moderation Tools",
        paragraphs: [
          "LionBot includes basic moderation tools: warnings, notes, and a ticket system.",
          "Warnings — Issue formal warnings to members with /warn. Warnings are tracked and visible to mods.",
          "Notes — Add private mod notes to a member's record with /modnote. Only mods can see these.",
          "Tickets — Members can open support tickets that create private channels for mod discussions.",
        ],
      },
      {
        id: "dashboard-moderation",
        title: "Moderation on the Dashboard",
        paragraphs: [
          "The dashboard gives you a clean overview of all moderation activity — recent warnings, open tickets, and member records.",
          "You can also take moderation actions directly from the dashboard: warn members, add notes, restrict users, and resolve tickets without touching Discord.",
        ],
      },
    ],
  },

  // --- AI-MODIFIED (2026-04-01) ---
  // Purpose: Rename "Branding" to "Visual Branding" for text branding feature
  // ── 8. Video Channels & Visual Branding ────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated nextSlug from liongotchi-admin to ambient-sounds
  {
    slug: "video-and-branding",
    title: "Video Channels & Visual Branding",
  // --- END AI-MODIFIED ---
    description: "Require video in certain channels and customize LionBot's appearance for your server.",
    audience: "admin",
    iconName: "Video",
    estimatedMinutes: 4,
    prevSlug: "economy-and-moderation",
    nextSlug: "ambient-sounds",
    steps: [
      {
        id: "video-channels",
        title: "Video-On Channels",
        paragraphs: [
          "Want to make sure members have their cameras on during study sessions? Designate specific voice channels as video-required channels.",
          "When a member joins a video channel without their camera on, the bot will notify them. This creates accountability and helps build a focused study environment.",
        ],
      },
      {
        id: "setting-up-video",
        title: "Setting Up Video Channels",
        paragraphs: [
          "Go to the Video Channels section in the dashboard and select which voice channels should require video.",
          "You can choose what happens when someone doesn't have their camera on — a gentle reminder, a warning, or automatic disconnect after a grace period.",
        ],
      },
      {
        id: "branding",
        // --- AI-MODIFIED (2026-04-01) ---
        // Purpose: Rename "Branding" to "Visual Branding" for text branding feature
        title: "Visual Branding",
        paragraphs: [
          "Customize how LionBot looks in your server. You can set a custom embed color, server icon, and other visual branding options that make the bot feel like part of your community.",
          "Find visual branding settings in the dashboard. These affect how bot messages and embeds appear in your server.",
        ],
        note: "Advanced visual branding options (custom embed colors, icons, and more) are available with a premium subscription. See the Premium Features tutorial for details.",
        // --- END AI-MODIFIED ---
      },
      {
        id: "putting-it-together",
        title: "Putting It All Together",
        paragraphs: [
          "You've covered the core LionBot features. The next tutorials cover premium add-ons — Ambient Sounds for background audio in study channels, and a roundup of all premium features.",
          "Remember, you can always come back to the dashboard to tweak settings. And if you need help, join the LionBot Discord server for support.",
        ],
        tip: "Don't enable everything at once. Start with the features your community will use most (usually study tracking + ranks), then add the shop, role menus, and other features over time.",
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 9. Ambient Sounds ───────────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for Ambient Sounds / SoundsBot configuration (premium feature)
  {
    slug: "ambient-sounds",
    title: "Ambient Sounds",
    description: "Add background audio to your study channels — rain, campfire, ocean waves, and white noise — powered by the SoundsBot.",
    audience: "admin",
    iconName: "Volume2",
    estimatedMinutes: 4,
    prevSlug: "video-and-branding",
    nextSlug: "premium-features",
    steps: [
      {
        id: "what-are-ambient-sounds",
        title: "What Are Ambient Sounds?",
        paragraphs: [
          "Ambient Sounds adds background audio to your voice channels — rain, campfire, ocean waves, brown noise, or white noise. It's powered by the SoundsBot, a companion bot that joins voice channels and plays looped audio.",
          "Members studying in a channel with ambient sounds get a calming background that helps them focus. It's one of the most-loved premium features.",
        ],
        note: "Ambient Sounds requires a premium server subscription to enable.",
      },
      {
        id: "enabling-sounds",
        title: "Enabling Ambient Sounds",
        paragraphs: [
          "To set up Ambient Sounds, go to the Ambient Sounds page in your server's dashboard (under the premium section). You need an active premium subscription to access this.",
          "The page shows up to 5 bot slots. Each slot represents one SoundsBot instance that can sit in a voice channel and play audio.",
        ],
      },
      {
        id: "configuring-slots",
        title: "Configuring Bot Slots",
        paragraphs: [
          "For each slot, you choose three things: a sound type (rain, campfire, ocean, brown noise, or white noise), a voice channel for the bot to join, and a volume level.",
          "Different channels can have different sounds. For example, put rain in your main study channel and campfire in a cozy late-night channel.",
        ],
        tip: "Start with one or two slots and see what your members prefer. You can always add more later. Rain and brown noise are the most popular choices.",
      },
      {
        id: "channel-assignment",
        title: "Assigning Channels",
        paragraphs: [
          "Select a voice channel from the dropdown for each active bot slot. The SoundsBot will automatically join that channel and start playing when enabled.",
          "Make sure the SoundsBot has Connect and Speak permissions in the target channels. If it's not joining, check the channel permission overrides.",
        ],
      },
      {
        id: "schedule-analytics",
        title: "Schedule & Analytics",
        paragraphs: [
          "You can set a schedule for when ambient sounds are active. For example, only play sounds during study hours (8 AM to midnight) to save resources during off-hours.",
          "The analytics section shows usage data — how many members studied with ambient sounds, peak hours, and which sound types are most popular in your server.",
        ],
      },
      {
        id: "member-voting",
        title: "Member Sound Voting",
        paragraphs: [
          "Enable sound voting to let members vote on which sound type plays in a channel. When voting is on, members can use a command to cast their preference, and the most popular choice wins.",
          "This is a fun way to involve your community in the decision and keeps things democratic.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 10. Premium Features ────────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial covering all premium admin features (sticky messages, leaderboard autopost, voice editor, analytics, branding)
  {
    slug: "premium-features",
    title: "Premium Features",
    // --- AI-MODIFIED (2026-04-01) ---
    // Purpose: Rename "Branding" to "Visual Branding" for text branding feature
    description: "A roundup of all premium features for server admins — sticky messages, leaderboard auto-posts, voice editing, analytics, and visual branding.",
    // --- END AI-MODIFIED ---
    audience: "admin",
    iconName: "Crown",
    estimatedMinutes: 5,
    prevSlug: "ambient-sounds",
    nextSlug: "liongotchi-admin",
    steps: [
      {
        id: "premium-overview",
        title: "What's Included in Premium?",
        paragraphs: [
          "Premium servers unlock a suite of advanced features that help you run a more polished, data-driven study community. These features are available as long as your server has an active premium subscription.",
          "This tutorial covers each premium feature at a glance. Each one has its own section in the server dashboard.",
        ],
      },
      {
        id: "sticky-messages",
        title: "Sticky Messages",
        paragraphs: [
          "Sticky messages are persistent messages that stay pinned to the bottom of a channel. When new messages push them up, LionBot automatically reposts them so they're always visible.",
          "Use sticky messages for rules, study guidelines, important links, or any information you want members to always see. Configure them from the Sticky Messages page in the dashboard.",
        ],
        tip: "Sticky messages work great in channels like #rules, #resources, or #study-tips where you want key information always visible without members scrolling up.",
      },
      {
        id: "leaderboard-autopost",
        title: "Leaderboard Auto-Post",
        paragraphs: [
          "Set up automatic leaderboard posts on a daily, weekly, or monthly schedule. LionBot posts the current leaderboard to a channel of your choice at the time you configure.",
          "You can also set up rewards — automatically give bonus coins or a special role to the top N members each period. This creates healthy competition and motivates members to study consistently.",
        ],
      },
      {
        id: "voice-time-editor-admin",
        title: "Voice Time Editor",
        paragraphs: [
          "The Voice Time Editor lets members adjust their study session records — fix missing sessions, correct durations, and remove incorrect entries. As an admin, you control whether this feature is available and its limits.",
          "Configure the maximum number of monthly edits, how far back members can edit, and any other restrictions from the Voice Time Editor settings page.",
        ],
        warning: "The Voice Time Editor gives members the ability to modify their study records. Set reasonable limits to prevent abuse while still being helpful for genuine corrections.",
      },
      {
        id: "pomodoro-analytics-premium",
        title: "Pomodoro Analytics",
        paragraphs: [
          "Pomodoro Analytics gives you detailed insights into how your members use Pomodoro timers. See completion rates, popular time slots, average focus durations, and which channels get the most use.",
          "These insights help you optimize your Pomodoro setup — adjust timer durations, add or remove Pomodoro channels, and understand when your community is most active.",
        ],
      },
      {
        id: "server-branding-premium",
        // --- AI-MODIFIED (2026-04-01) ---
        // Purpose: Rename "Branding" to "Visual Branding" for text branding feature
        title: "Visual Branding",
        paragraphs: [
          "Premium visual branding lets you fully customize LionBot's appearance in your server. Set a custom embed color that matches your server's theme, upload a custom bot icon, and adjust how messages look.",
          "This makes LionBot feel like a native part of your server rather than a generic third-party bot. It's a small touch that goes a long way for professional-looking communities.",
        ],
        // --- END AI-MODIFIED ---
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 11. LionGotchi Admin ─────────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated prevSlug from video-and-branding to premium-features
  {
    slug: "liongotchi-admin",
    title: "LionGotchi Admin",
    description: "Set up the LionGotchi pet system for your server — configure drop notifications and help members get started.",
    audience: "admin",
    iconName: "Cat",
    estimatedMinutes: 3,
    prevSlug: "premium-features",
    steps: [
      {
        id: "liongotchi-overview",
        title: "LionGotchi for Your Server",
        paragraphs: [
          "LionGotchi is an optional virtual pet system that adds a gamification layer on top of LionBot's study tracking. Members adopt a pet lion, care for it, collect equipment drops, farm resources, and trade on a marketplace.",
          "As a server admin, there's minimal setup required — the system works out of the box once members start using /pet. But there's one key thing you should configure: the drop notification channel.",
        ],
      },
      {
        id: "drop-channel",
        title: "Setting Up Drop Notifications",
        paragraphs: [
          "When members study in voice channels or chat in text channels, they have a chance to receive equipment drops. By default, these drop notifications are sent as DMs.",
          "Use /petdrops to set a channel where drop notifications are posted publicly. This creates excitement — members see each other's drops and it encourages more activity.",
        ],
        command: "/petdrops <#channel>",
        tip: "Pick a channel where some chatter is fine, like a general or bot-commands channel. Drop notifications are brief but frequent in active servers.",
      },
      {
        id: "what-members-see",
        title: "What Members Can Do",
        paragraphs: [
          "Here's a quick overview of the LionGotchi features your members have access to, so you know what to expect:",
          "/pet — Adopt a pet, feed/bathe/rest it, check inventory and farm. The entry point for everything.",
          "Website /pet section — Full-featured pages for inventory management, room decoration, farming, crafting, enhancement, marketplace trading, friends, family groups, item wiki, and Gameboy skins.",
          "Members earn equipment drops passively from studying and chatting. They can farm resources, craft items, enhance gear with scrolls, buy and sell items with other players, join families, and decorate their pet's room.",
        ],
      },
      {
        id: "communicating",
        title: "Getting Members Started",
        paragraphs: [
          "The best way to introduce LionGotchi is with a quick announcement in your server. Let members know they can use /pet to adopt their pet, and point them to the LionGotchi tutorials on this website for a full walkthrough.",
          "Consider creating a dedicated channel for pet-related discussion and marketplace trades. It helps build community around the feature without cluttering your main study channels.",
        ],
        tip: "Pin a message in your pet channel with links to the LionGotchi member tutorials. Members will have most of their questions answered there.",
      },
    ],
  },
  // --- END AI-MODIFIED ---
]
