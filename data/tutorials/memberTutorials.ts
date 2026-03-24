// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Updated: 2026-03-24
// Purpose: Member-facing tutorial content (24 tutorials)
// ============================================================
import type { Tutorial } from "./index"

export const memberTutorials: Tutorial[] = [
  // ── 1. Getting Started ──────────────────────────────────
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "New to LionBot? Start here. Learn what the bot does and how to set yourself up in under 5 minutes.",
    audience: "member",
    iconName: "Rocket",
    estimatedMinutes: 4,
    nextSlug: "tasks",
    steps: [
      {
        id: "what-is-lionbot",
        title: "What is LionBot?",
        paragraphs: [
          "LionBot is a Discord bot built for productivity. It tracks your study and work time, lets you manage tasks and reminders, runs a coin economy with leaderboards, and gives you tools to stay motivated.",
          "If you're part of a server that already has LionBot, you can start using it right away — no setup needed on your end. If you're an admin looking to add it to your server, check out the Admin tutorials instead.",
        ],
      },
      {
        id: "set-timezone",
        title: "Set Your Timezone",
        paragraphs: [
          "Before anything else, tell LionBot your timezone. This makes sure your stats, reminders, and study sessions use the right clock.",
          "Pick your timezone from the dropdown that appears, and you're good to go. You only need to do this once.",
        ],
        command: "/my timezone",
        tip: "Not sure what your timezone is called? Just start typing your city name — LionBot's dropdown will autocomplete it for you.",
      },
      {
        id: "explore-commands",
        title: "Explore Commands with /help",
        paragraphs: [
          "LionBot has a lot of features, and /help is the best way to see them all. Commands are grouped into categories like Statistics, Economy, and Utilities.",
          "You can also type /help followed by a specific command name to get details about what it does and how to use it.",
        ],
        command: "/help",
      },
      {
        id: "the-dashboard",
        title: "Your Web Dashboard",
        paragraphs: [
          "Everything you can do with Discord commands, you can also do from LionBot's web dashboard. Sign in with your Discord account to manage tasks, reminders, view your stats, and customize your profile — all from your browser.",
          "The dashboard syncs with Discord in real time, so changes you make here show up instantly in the bot, and vice versa.",
        ],
        tip: "You're on the website right now! If you sign in, the interactive sections in these tutorials will show your real data.",
      },
    ],
  },

  // ── 2. Tasks & To-Do Lists ──────────────────────────────
  {
    slug: "tasks",
    title: "Tasks & To-Do Lists",
    description: "Create a personal task list, check things off, and earn coins for staying productive.",
    audience: "member",
    iconName: "CheckSquare",
    estimatedMinutes: 5,
    prevSlug: "getting-started",
    nextSlug: "reminders",
    steps: [
      {
        id: "what-are-tasks",
        title: "What Are Tasks?",
        paragraphs: [
          "Tasks are your personal to-do list inside LionBot. Create them for homework, projects, reading, daily goals — whatever you need to get done.",
          "The best part? You earn LionCoins every time you complete a task. It's a small reward that keeps you motivated to check things off.",
        ],
      },
      {
        id: "creating-tasks",
        title: "Creating a Task",
        paragraphs: [
          "Creating a task is simple. Just run the command below and describe what you need to do.",
          "For example: /tasklist new Read Chapter 5 of Biology textbook",
          "Your task gets added to your personal list. You can have up to 20 active tasks at a time.",
        ],
        command: "/tasklist new <description>",
      },
      {
        id: "viewing-tasks",
        title: "Viewing Your Tasks",
        paragraphs: [
          "Want to see what's on your plate? Open your task list to see everything at a glance.",
          "Completed tasks are marked with a check. You'll also see your overall progress — how many tasks you've knocked out vs. how many are left.",
        ],
        command: "/tasklist open",
      },
      {
        id: "completing-tasks",
        title: "Completing Tasks",
        paragraphs: [
          "When you finish a task, mark it as done. You'll earn LionCoins as a reward — the exact amount depends on your server's economy settings.",
          "Completing tasks consistently also helps build your activity streak, which shows up on your profile.",
        ],
        command: "/tasklist tick <task number>",
        tip: "Try to break big projects into smaller tasks. It's easier to stay motivated when you're checking things off regularly.",
      },
      {
        id: "dashboard-tasks",
        title: "Managing Tasks on the Dashboard",
        paragraphs: [
          "You can also manage your tasks right here on the web dashboard. Create new tasks, mark them done, and delete old ones — all with a visual interface.",
          "Changes sync instantly. If you add a task on the dashboard, it shows up in Discord. If you complete one in Discord, it updates here.",
        ],
      },
      {
        id: "try-tasks",
        title: "Try It: Your Task List",
        paragraphs: [
          "Here's your actual task list. Try adding a new task, marking one as complete, or cleaning up old ones.",
        ],
        interactive: "tasks",
      },
    ],
  },

  // ── 3. Reminders ────────────────────────────────────────
  {
    slug: "reminders",
    title: "Reminders",
    description: "Set personal reminders and LionBot will DM you when it's time. Supports one-time and recurring reminders.",
    audience: "member",
    iconName: "Bell",
    estimatedMinutes: 5,
    prevSlug: "tasks",
    nextSlug: "profile-and-stats",
    steps: [
      {
        id: "what-are-reminders",
        title: "What Are Reminders?",
        paragraphs: [
          "Reminders are personal notifications that LionBot sends you via DM at a time you choose. Use them for study sessions, assignment deadlines, meeting prep — anything you don't want to forget.",
          "You can have up to 25 active reminders at a time.",
        ],
      },
      {
        id: "remind-at",
        title: "Set a Reminder by Time",
        paragraphs: [
          "To set a reminder for a specific date and time, use the /remindme at command.",
          "For example: /remindme at 3:00 PM Start working on essay",
          "LionBot will DM you at exactly that time with your message. Make sure your timezone is set correctly first (see the Getting Started tutorial).",
        ],
        command: "/remindme at <time> <message>",
      },
      {
        id: "remind-in",
        title: "Set a Reminder by Duration",
        paragraphs: [
          "Want a reminder in a certain amount of time from now? Use /remindme in instead.",
          "For example: /remindme in 2h Take a break",
          "You can use formats like 30m, 2h, 1d, or combine them like 1h30m. LionBot will DM you when the time is up.",
        ],
        command: "/remindme in <duration> <message>",
        tip: "Use short durations for study breaks (like /remindme in 25m Time for a break!) to create a simple pomodoro-style workflow.",
      },
      {
        id: "recurring",
        title: "Recurring Reminders",
        paragraphs: [
          "Need a reminder that repeats? You can set up recurring reminders from the dashboard. Set an interval (every X hours or minutes) and LionBot will keep reminding you on schedule.",
          "Great for things like: drink water every 2 hours, review notes every day, or check your task list every morning.",
        ],
      },
      {
        id: "managing-reminders",
        title: "Managing Your Reminders",
        paragraphs: [
          "See all your reminders with the /reminders command. This shows both upcoming and past reminders.",
          "On the dashboard, you get even more control — edit times, change content, set recurring intervals, or delete reminders you no longer need.",
        ],
        command: "/reminders",
      },
      {
        id: "try-reminders",
        title: "Try It: Your Reminders",
        paragraphs: [
          "Here are your reminders. Try creating a new one, editing an existing reminder, or setting up a recurring schedule.",
        ],
        interactive: "reminders",
      },
    ],
  },

  // ── 4. Profile & Stats ──────────────────────────────────
  {
    slug: "profile-and-stats",
    title: "Your Profile & Stats",
    description: "See your study stats, achievements, and customize your profile card with skins.",
    audience: "member",
    iconName: "User",
    estimatedMinutes: 5,
    prevSlug: "reminders",
    nextSlug: "study-and-pomodoro",
    steps: [
      {
        id: "your-profile",
        title: "Your LionBot Profile",
        paragraphs: [
          "Every LionBot user has a profile card that shows your stats at a glance — study time, coin balance, gems, current rank, achievements, and your activity streak.",
          "Think of it as your productivity report card, but way cooler because you can customize it.",
        ],
      },
      {
        id: "viewing-profile",
        title: "Viewing Your Profile",
        paragraphs: [
          "Use /me to see your profile card. It shows everything in one clean visual — your study hours, coins, rank, and achievements.",
          "You can also check out other people's profiles by mentioning them: /me @username",
        ],
        command: "/me",
      },
      {
        id: "detailed-stats",
        title: "Detailed Statistics",
        paragraphs: [
          "Want more detail? The /stats command breaks down your study time by today, this week, this month, and all-time.",
          "You'll also see your leaderboard position and your activity streak. The longer your streak, the more impressive your profile looks.",
        ],
        command: "/stats",
      },
      {
        id: "achievements",
        title: "Achievements",
        paragraphs: [
          "LionBot tracks your achievements automatically. Total study hours, streak length, tasks completed, and more — each milestone unlocks a badge on your profile.",
          "Use /achievements to see which ones you've unlocked and how close you are to the next ones.",
        ],
        command: "/achievements",
        tip: "Some achievements are hidden until you're close to unlocking them. Keep pushing — there might be some surprises waiting.",
      },
      {
        id: "skins",
        title: "Customizing with Skins",
        paragraphs: [
          "Want your profile card to stand out? LionBot has a skin system that changes the colors and style of your card.",
          "Browse available skins with /my skin or check out the Skins page on this website. Some skins are free, some cost LionCoins, and premium skins require LionGems.",
        ],
        command: "/my skin",
      },
      {
        id: "try-profile",
        title: "Try It: Your Profile Card",
        paragraphs: [
          "Here's what your profile looks like. If you're signed in, you're seeing your real data from LionBot.",
        ],
        interactive: "profile-card",
      },
    ],
  },

  // ── 5. Study Tracking & Pomodoro ────────────────────────
  {
    slug: "study-and-pomodoro",
    title: "Study Tracking & Pomodoro",
    description: "Learn how LionBot tracks your study time and how to use Pomodoro timers for focused sessions.",
    audience: "member",
    iconName: "Timer",
    estimatedMinutes: 5,
    prevSlug: "profile-and-stats",
    nextSlug: "economy",
    steps: [
      {
        id: "how-tracking-works",
        title: "How Study Tracking Works",
        paragraphs: [
          "LionBot automatically tracks your study time when you join a voice channel in a server that has it set up. Just join a study channel, and the clock starts ticking.",
          "You don't need to run any commands — the bot detects when you join and leave voice channels and logs the time for you. It all shows up in your stats and on the leaderboard.",
        ],
        tip: "Make sure you're in a voice channel that LionBot is monitoring. Some servers only track specific channels. Ask your server admin if you're unsure which ones count.",
      },
      {
        id: "pomodoro-timers",
        title: "Pomodoro Timers",
        paragraphs: [
          "The Pomodoro technique is simple: study for a focused block of time (usually 25 minutes), then take a short break (5 minutes). Repeat.",
          "LionBot has built-in Pomodoro timers that work in voice channels. When a timer is running, everyone in the channel follows the same focus/break cycle.",
        ],
        command: "/pomodoro",
      },
      {
        id: "using-timers",
        title: "Using Timers",
        paragraphs: [
          "Use the /timers command to see all active timers in your server. You can join a channel that already has a timer running, or ask an admin to set one up for you.",
          "When a focus period ends, the bot plays a sound and announces the break. When the break ends, it announces focus time again. It keeps everyone in sync.",
        ],
        command: "/timers",
      },
      {
        id: "pomodoro-stats",
        title: "Your Pomodoro Stats",
        paragraphs: [
          "LionBot tracks your Pomodoro sessions separately from regular voice time. You can see how many focus sessions you've completed, your total focused time, and your average session length.",
          "Check the dashboard for a visual breakdown of your Pomodoro activity over time.",
        ],
      },
    ],
  },

  // ── 6. Economy & Coins ──────────────────────────────────
  {
    slug: "economy",
    title: "Economy & LionCoins",
    description: "Earn coins by being active, send them to friends, and spend them in the shop.",
    audience: "member",
    iconName: "Coins",
    estimatedMinutes: 4,
    prevSlug: "study-and-pomodoro",
    nextSlug: "ranks-and-achievements",
    steps: [
      {
        id: "what-are-coins",
        title: "What Are LionCoins?",
        paragraphs: [
          "LionCoins are the in-server currency in LionBot. You earn them by studying in voice channels, completing tasks, and being active. You can spend them in your server's shop or send them to other members.",
          "Each server has its own economy — coins you earn in one server are separate from another.",
        ],
      },
      {
        id: "earning-coins",
        title: "How to Earn Coins",
        paragraphs: [
          "The main way to earn coins is by studying in voice channels. The longer you study, the more you earn. You also get bonus coins for completing tasks.",
          "Some servers have additional ways to earn — ask your server admin about coin rates and bonuses.",
        ],
        tip: "Voting for LionBot on top.gg gives you a 1.25x coin bonus for 12 hours. It's free and helps the bot grow!",
      },
      {
        id: "checking-balance",
        title: "Checking Your Balance",
        paragraphs: [
          "Want to see how many coins you have? Use the /economy balance command to check your current balance in the server.",
        ],
        command: "/economy balance",
      },
      {
        id: "sending-coins",
        title: "Sending Coins",
        paragraphs: [
          "You can send coins to other members with the /send command. It's a great way to thank someone for helping you study or just spread the love.",
        ],
        command: "/send <@user> <amount>",
      },
      {
        id: "leaderboard",
        title: "The Leaderboard",
        paragraphs: [
          "Curious how you stack up? The leaderboard shows who has the most study time, highest coin balance, or best streak in your server.",
          "Use /leaderboard to see where you rank. It updates in real time.",
        ],
        command: "/leaderboard",
      },
    ],
  },

  // ── 7. Ranks & Achievements ─────────────────────────────
  {
    slug: "ranks-and-achievements",
    title: "Ranks & Achievements",
    description: "Understand how the rank system works, level up, and unlock achievements.",
    audience: "member",
    iconName: "Trophy",
    estimatedMinutes: 4,
    prevSlug: "economy",
    nextSlug: "skins-and-shop",
    steps: [
      {
        id: "how-ranks-work",
        title: "How Ranks Work",
        paragraphs: [
          "Ranks are milestones you hit as you study. Your server admin sets up rank tiers — each one requires a certain amount of activity to reach.",
          "Depending on the server, ranks can be based on voice time, XP (experience points), or message count. When you hit a new rank, you get a role and the bot announces it.",
        ],
      },
      {
        id: "checking-rank",
        title: "Checking Your Rank",
        paragraphs: [
          "Use /ranks to see all the rank tiers in your server and where you currently stand. You'll see your progress toward the next rank.",
        ],
        command: "/ranks",
      },
      {
        id: "rank-types",
        title: "Types of Ranks",
        paragraphs: [
          "Servers can set up different types of ranks:",
          "Voice Time — You rank up by spending time in voice channels studying.",
          "XP — You earn XP from messages and voice activity, and rank up as your XP accumulates.",
          "Messages — You rank up based on the number of messages you send.",
          "Your server admin chooses which type to use. Most study servers use voice time.",
        ],
      },
      {
        id: "achievements-detail",
        title: "Unlocking Achievements",
        paragraphs: [
          "Achievements are personal milestones that show up on your profile. They're based on things like total study hours, streak length, tasks completed, and more.",
          "Some are easy to get, some take serious dedication. Collect them all to show off your commitment.",
        ],
        command: "/achievements",
      },
    ],
  },

  // ── 8. Skins, Shop & Premium ────────────────────────────
  {
    slug: "skins-and-shop",
    title: "Skins, Shop & Premium",
    description: "Browse skins for your profile, buy items from the shop, and learn about LionGems.",
    audience: "member",
    iconName: "Palette",
    estimatedMinutes: 4,
    prevSlug: "ranks-and-achievements",
    nextSlug: "dashboard-tour",
    steps: [
      {
        id: "the-shop",
        title: "The Server Shop",
        paragraphs: [
          "Each server can have its own shop where you spend your LionCoins. The most common items are colour roles — custom-colored name roles that make you stand out in the member list.",
          "Use /shop open to browse what's available and /shop buy to purchase an item.",
        ],
        command: "/shop open",
      },
      {
        id: "skins-overview",
        title: "Profile Skins",
        paragraphs: [
          "Skins change the look of your profile card — different color schemes, backgrounds, and styles. You can preview all available skins on the Skins page of this website.",
          "Some skins are free, some cost LionCoins, and premium skins require LionGems. Use /my skin to browse and equip skins.",
        ],
        command: "/my skin",
      },
      {
        id: "liongems",
        title: "LionGems & Premium",
        paragraphs: [
          "LionGems are the premium currency. You can purchase them to unlock exclusive profile skins, cosmetics, and support the bot's development.",
          "Visit the Donate page on this website to get LionGems. They're tied to your Discord account, so they work across all servers.",
        ],
        tip: "Buying LionGems directly supports LionBot's development and server costs. Every gem counts!",
      },
      {
        id: "rooms",
        title: "Private Rooms",
        paragraphs: [
          "Some servers let you rent private voice channels with /room rent. You get your own study room for a set amount of time, and you can invite whoever you want.",
          "Room rental costs LionCoins. The price and duration depend on your server's settings.",
        ],
        command: "/room rent",
      },
    ],
  },

  // ── 9. Using the Dashboard ───────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated navigating-sections to mention new dashboard features, changed nextSlug to study-history
  {
    slug: "dashboard-tour",
    title: "Using the Dashboard",
    description: "A walkthrough of LionBot's web dashboard — manage tasks, view stats, and configure settings from your browser.",
    audience: "member",
    iconName: "LayoutDashboard",
    estimatedMinutes: 4,
    prevSlug: "skins-and-shop",
    nextSlug: "study-history",
    steps: [
      {
        id: "what-is-dashboard",
        title: "What Is the Dashboard?",
        paragraphs: [
          "The LionBot dashboard is a full web interface for everything you can do with Discord commands — and more. Manage tasks, view study history, set reminders, browse skins, and customize your profile, all from your browser.",
          "It syncs with Discord in real time. Anything you change on the dashboard shows up instantly in the bot, and vice versa.",
        ],
      },
      {
        id: "signing-in",
        title: "Signing In",
        paragraphs: [
          "Click 'Dashboard' in the navigation bar and sign in with your Discord account. LionBot uses Discord's official OAuth system — your password is never shared with us.",
          "Once signed in, you'll land on your Overview page with a snapshot of your activity, coins, and recent stats.",
        ],
        tip: "You stay signed in across sessions. If you ever need to switch accounts, sign out from the menu in the top-right corner.",
      },
      {
        id: "navigating-sections",
        title: "Navigating the Dashboard",
        paragraphs: [
          "The sidebar organizes everything into sections:",
          "Activity — Tasks, Study History, Voice Editor, Goals, Reminders, and Live Session. This is where you manage your day-to-day productivity, review past study sessions, and enter Focus Mode for distraction-free studying.",
          "Collection — Skins, LionGems, Supporter perks, and the Leaderboard. Browse cosmetics, manage your gem balance and subscriptions, and see how you rank.",
          "Account — Your Profile page where you can customize your bio and see your stats card.",
          "If you're a server admin, you'll also see a Servers section for managing your server's LionBot configuration.",
        ],
      },
      {
        id: "mobile-usage",
        title: "Using the Dashboard on Mobile",
        paragraphs: [
          "The dashboard works on phones and tablets. On smaller screens, the sidebar collapses into a bottom navigation bar with the key sections easily accessible.",
          "It's a great way to check your stats or knock out a quick task when you're away from your computer.",
        ],
      },
      {
        id: "servers-section",
        title: "Managing Servers",
        paragraphs: [
          "If you're a moderator or admin in any server that has LionBot, your Servers page lists them all. Click a server to access its configuration dashboard.",
          "From there, you can manage ranks, shop items, role menus, economy settings, and more — no Discord commands needed.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 10. Study History ────────────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for the Study History dashboard page
  {
    slug: "study-history",
    title: "Study History",
    description: "Review your past study sessions, see daily and weekly breakdowns, and track your productivity trends over time.",
    audience: "member",
    iconName: "History",
    estimatedMinutes: 3,
    prevSlug: "dashboard-tour",
    nextSlug: "voice-editor",
    steps: [
      {
        id: "what-is-history",
        title: "What Is Study History?",
        paragraphs: [
          "Study History is a dashboard page that shows every study session LionBot has tracked for you. Each session includes when you joined a voice channel, how long you studied, which server and channel it was in, and how many coins you earned.",
          "It's your personal productivity journal — no manual logging required.",
        ],
      },
      {
        id: "viewing-sessions",
        title: "Viewing Your Sessions",
        paragraphs: [
          "Head to the Study History page from the Activity section in the dashboard sidebar. You'll see a list of your recent sessions, sorted newest first.",
          "Each session card shows the date, duration, server name, and coins earned. Longer sessions are visually distinct so you can quickly spot your best study days.",
        ],
      },
      {
        id: "charts-and-trends",
        title: "Charts & Trends",
        paragraphs: [
          "Above the session list, you'll find charts that break down your study time by day, week, or month. These help you spot patterns — which days you study the most, whether your weekly totals are going up or down, and how consistent you've been.",
          "Use these insights to adjust your study habits. If you notice a dip on Wednesdays, maybe that's the day to set a study reminder.",
        ],
        tip: "Check your Study History after each week to see if you're trending upward. Small, consistent improvements add up fast.",
      },
      {
        id: "filtering",
        title: "Filtering & Date Ranges",
        paragraphs: [
          "You can filter your history by server, date range, or session length. This is useful if you study in multiple servers and want to see your activity in just one of them.",
          "The date picker lets you zoom in on a specific week or month to analyze your study patterns during exam periods, project sprints, or any time frame you care about.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 11. Voice Time Editor ───────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for the Voice Time Editor dashboard feature
  {
    slug: "voice-editor",
    title: "Voice Time Editor",
    description: "Edit your study sessions from the dashboard — adjust times, add missed sessions, and fix mistakes on a visual week timeline.",
    audience: "member",
    iconName: "Pencil",
    estimatedMinutes: 4,
    prevSlug: "study-history",
    nextSlug: "live-session-and-focus",
    steps: [
      {
        id: "what-is-voice-editor",
        title: "What Is the Voice Editor?",
        paragraphs: [
          "The Voice Time Editor lets you adjust your study session records directly from the dashboard. If you forgot to leave a voice channel, had a session that didn't track properly, or need to log time you missed, the editor has you covered.",
          "It displays your sessions on a visual week timeline — each day is a horizontal strip where your sessions appear as blocks you can drag and resize.",
        ],
      },
      {
        id: "accessing-editor",
        title: "Accessing the Editor",
        paragraphs: [
          "Find the Voice Editor in the Activity section of the dashboard sidebar. When you open it, you'll pick which server's sessions you want to edit from a dropdown at the top.",
          "The Voice Editor is a premium feature — your server needs an active premium subscription for you to use it. If it's not available, ask your server admin about premium.",
        ],
        note: "The Voice Editor is available in servers with an active premium subscription.",
      },
      {
        id: "week-timeline",
        title: "The Week Timeline",
        paragraphs: [
          "The main view shows seven day strips, one for each day of the current week. Each strip spans 24 hours, and your study sessions appear as colored blocks at the times they occurred.",
          "Use the week navigation arrows at the top to move forward or backward through weeks. The current day is highlighted so you can orient yourself quickly.",
        ],
      },
      {
        id: "editing-sessions",
        title: "Editing Sessions",
        paragraphs: [
          "To move a session, click and drag it to a new time or even a different day. To change its duration, grab the right edge and resize it.",
          "Click on any session block to open its detail sheet, where you can set precise start and end times, or delete the session entirely.",
        ],
        warning: "Editing session times affects your coins, rank progress, and leaderboard position. Make sure your edits are accurate.",
      },
      {
        id: "adding-removing",
        title: "Adding & Removing Sessions",
        paragraphs: [
          "To add a missing session, click on an empty area of any day strip. A new session form opens where you set the start time, end time, and channel.",
          "To remove an incorrect session, open its detail sheet and click Delete. Removed sessions no longer count toward your stats.",
        ],
      },
      {
        id: "usage-limits",
        title: "Usage Limits & Rules",
        paragraphs: [
          "To keep things fair, the Voice Editor has usage limits. You can only make a certain number of edits per month, and there may be restrictions on how far back you can edit.",
          "Your remaining edits are shown at the top of the editor. If you've used up your monthly allowance, you'll need to wait until the next month.",
        ],
        tip: "Save your edits for genuine corrections. If you consistently need to fix sessions, double-check that your voice channel setup is working correctly.",
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 12. Live Session & Focus Mode ───────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for the Live Session dashboard and Focus Mode
  {
    slug: "live-session-and-focus",
    title: "Live Session & Focus Mode",
    description: "Track your active study session in real time and enter Focus Mode for distraction-free studying with ambient sounds and timers.",
    audience: "member",
    iconName: "Maximize2",
    estimatedMinutes: 4,
    prevSlug: "voice-editor",
    nextSlug: "goals",
    steps: [
      {
        id: "session-dashboard",
        title: "The Session Dashboard",
        paragraphs: [
          "When you're actively studying in a voice channel, the Session page on the dashboard comes alive. It shows your current session in real time — elapsed time, which channel you're in, who else is in the room, and your active tasks.",
          "Think of it as your study cockpit. Everything you need to stay on track is in one place.",
        ],
      },
      {
        id: "entering-focus",
        title: "Entering Focus Mode",
        paragraphs: [
          "Focus Mode is a full-screen, distraction-free interface designed for deep work. Click the Focus button on the Session page to enter it.",
          "In Focus Mode, you see a large timer, your current task list, and nothing else. No sidebar, no notifications, no distractions — just you and your work.",
        ],
      },
      {
        id: "themes-and-sounds",
        title: "Themes & Ambient Sounds",
        paragraphs: [
          "Focus Mode comes with visual themes you can switch between — dark, light, nature, and more. Pick whichever helps you concentrate best.",
          "You can also enable ambient sounds directly from Focus Mode — rain, campfire, ocean waves, or white noise. These play through your browser without affecting your Discord audio.",
        ],
        tip: "Try the rain ambient sound with the dark theme for a cozy late-night study vibe.",
      },
      {
        id: "wake-lock",
        title: "Wake Lock & Pop-out",
        paragraphs: [
          "Focus Mode can keep your screen awake so your display doesn't turn off mid-session. This is especially useful on tablets propped up as a study timer.",
          "You can also pop the timer out into a small, always-on-top window. This lets you keep the timer visible while working in other apps.",
        ],
      },
      {
        id: "focus-tips",
        title: "Tips for Deep Work",
        paragraphs: [
          "Enter Focus Mode before you start studying, not after. The act of switching into it signals your brain that it's time to concentrate.",
          "Keep your task list updated — having a clear next action in front of you removes the mental overhead of deciding what to work on. If a task is done, check it off right from Focus Mode and move to the next one.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 13. Goals ────────────────────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated prevSlug from dashboard-tour to live-session-and-focus
  {
    slug: "goals",
    title: "Goals",
    description: "Set weekly and monthly study goals to keep yourself accountable and track your progress over time.",
    audience: "member",
    iconName: "Target",
    estimatedMinutes: 3,
    prevSlug: "live-session-and-focus",
    nextSlug: "voting-and-support",
    steps: [
      {
        id: "what-are-goals",
        title: "What Are Goals?",
        paragraphs: [
          "Goals let you set study hour targets for the week or month. They give you something concrete to aim for and help you build a consistent study habit.",
          "Your progress updates automatically as LionBot tracks your voice channel time. You can see exactly how close you are to hitting your target.",
        ],
      },
      {
        id: "setting-goals",
        title: "Setting a Goal",
        paragraphs: [
          "Head to the Goals page on the dashboard (under Activity in the sidebar). Choose whether you want a weekly or monthly goal, then set your target hours.",
          "Start realistic — if you usually study 5 hours a week, try setting a goal of 7 hours. You can always adjust it later as you build momentum.",
        ],
        tip: "Weekly goals reset every Monday. Monthly goals reset on the 1st. Plan around these resets so you don't lose progress.",
      },
      {
        id: "tracking-progress",
        title: "Tracking Your Progress",
        paragraphs: [
          "The Goals page shows a visual progress bar for each active goal. You'll see your current hours, your target, and what percentage you've completed.",
          "Goals tie directly into your study stats — the same voice time that counts toward ranks and leaderboards also counts toward your goals.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 14. Voting & LionHeart ──────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated nextSlug to gems-and-supporter, expanded LionGems step to mention dashboard
  {
    slug: "voting-and-support",
    title: "Voting & LionHeart",
    description: "Vote for LionBot on top.gg for a coin bonus, and learn about LionHeart supporter perks and LionGems.",
    audience: "member",
    iconName: "Heart",
    estimatedMinutes: 4,
    prevSlug: "goals",
    nextSlug: "gems-and-supporter",
    steps: [
      {
        id: "voting-topgg",
        title: "Voting on Top.gg",
        paragraphs: [
          "You can vote for LionBot on top.gg once every 12 hours. It's free, takes about 10 seconds, and helps the bot grow by improving its visibility on the platform.",
          "As a thank-you, every vote gives you a 1.25x coin earning bonus for 12 hours. That means 25% more LionCoins from studying, completing tasks, and all other coin sources.",
        ],
        tip: "Set a reminder with /remindme in 12h Time to vote for LionBot! so you never miss a vote window.",
      },
      {
        id: "liongems",
        title: "LionGems",
        paragraphs: [
          "LionGems are the premium currency. Unlike LionCoins (which are per-server), LionGems are tied to your Discord account and work everywhere.",
          "You can purchase LionGems from the Donate page on this website, and manage your balance from the Gems page on the dashboard. They unlock exclusive profile skins, cosmetics, and LionGotchi items.",
        ],
        note: "For a full walkthrough of the Gems dashboard, supporter perks, and subscriptions, check out the next tutorial: Gems & Supporter.",
      },
      {
        id: "lionheart",
        title: "LionHeart Supporter",
        paragraphs: [
          "LionHeart is the supporter program for dedicated LionBot fans. Supporters get perks like exclusive skins, enhanced profile badges, and priority support.",
          "Visit the LionHeart page on the dashboard (under Collection) to see available perks and how to become a supporter. Every contribution directly supports the bot's development and server costs.",
        ],
      },
      {
        id: "where-gems-go",
        title: "Where Your Support Goes",
        paragraphs: [
          "LionBot runs on a dedicated server handling 70,000+ Discord servers and 10,000+ concurrent voice users. Server costs, development time, and infrastructure all add up.",
          "Every LionGem purchase and LionHeart subscription directly funds keeping the bot running, bug-free, and improving. Thank you for supporting the project!",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 15. Gems & Supporter ────────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for the dashboard Gems, Supporter, and Subscriptions pages
  {
    slug: "gems-and-supporter",
    title: "Gems & Supporter",
    description: "Manage your LionGem balance, explore supporter perks, handle subscriptions, and see where to spend your gems.",
    audience: "member",
    iconName: "Gem",
    estimatedMinutes: 3,
    prevSlug: "voting-and-support",
    nextSlug: "private-rooms",
    steps: [
      {
        id: "gem-balance",
        title: "Your Gem Balance",
        paragraphs: [
          "The Gems page on the dashboard shows your current LionGem balance and a full transaction history — every purchase, every spend, and any gems you've received as gifts.",
          "You can also see how many gems you've spent across different categories like profile skins, LionGotchi items, and marketplace purchases.",
        ],
      },
      {
        id: "buying-gems",
        title: "Buying LionGems",
        paragraphs: [
          "To buy gems, visit the Donate page on this website. Choose a gem package, complete the secure checkout through Stripe, and your gems are credited instantly to your Discord account.",
          "Gem packages come in several sizes — pick the one that fits your budget. Larger packages often offer better value per gem.",
        ],
        tip: "Gems are credited automatically within seconds of payment. If they don't appear, try refreshing the Gems page on the dashboard.",
      },
      {
        id: "supporter-perks",
        title: "Supporter Perks",
        paragraphs: [
          "The Supporter page on the dashboard showcases exclusive perks for LionBot backers. These include limited-edition profile skins, enhanced badges, priority support, and early access to new features.",
          "Some perks are one-time unlocks, while others require an active subscription to maintain.",
        ],
      },
      {
        id: "subscriptions",
        title: "Managing Subscriptions",
        paragraphs: [
          "If you have an active subscription (like LionHeart monthly), the Subscriptions page lets you view your billing cycle, update payment methods, or cancel if needed.",
          "Changes take effect at the end of your current billing period — you won't lose access mid-cycle.",
        ],
      },
      {
        id: "spending-gems",
        title: "Where to Spend Gems",
        paragraphs: [
          "LionGems can be spent on premium profile skins (from the Skins page), LionGotchi items and equipment on the marketplace, pet Gameboy skins, and other exclusive cosmetics.",
          "Since gems work across all servers, any cosmetic you buy with gems is available everywhere you use LionBot.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 16. Private Rooms ───────────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated prevSlug from voting-and-support to gems-and-supporter
  {
    slug: "private-rooms",
    title: "Private Rooms",
    description: "Rent your own private voice channel, invite study partners, and focus without distractions.",
    audience: "member",
    iconName: "DoorOpen",
    estimatedMinutes: 3,
    prevSlug: "gems-and-supporter",
    nextSlug: "liongotchi-basics",
    steps: [
      {
        id: "what-are-rooms",
        title: "What Are Private Rooms?",
        paragraphs: [
          "Private rooms are temporary voice channels you rent with LionCoins. You get your own space to study, and you control who can join.",
          "Not every server has this feature enabled — it's up to the server admin. If you don't see the /room command, ask your admin about setting it up.",
        ],
      },
      {
        id: "renting-room",
        title: "Renting a Room",
        paragraphs: [
          "Use /room rent to create your private voice channel. The cost and duration depend on your server's settings — typically you'll see the price before confirming.",
          "Once rented, a new voice channel appears that only you can access initially. The channel name usually includes your username so others know it's yours.",
        ],
        command: "/room rent",
      },
      {
        id: "managing-room",
        title: "Managing Your Room",
        paragraphs: [
          "While your room is active, you can invite other members to join you for group study sessions. The room is yours for the rental duration.",
          "When the rental period expires, the channel is automatically removed. Your study time in the room still counts toward your stats, ranks, and coin earnings just like any other tracked voice channel.",
        ],
        tip: "Private rooms are great for focused group study. Invite a few friends, turn on cameras, and hold each other accountable.",
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 17. LionGotchi: Your Virtual Pet ────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated nextSlug to liongotchi-room, added overview step listing all sub-features
  {
    slug: "liongotchi-basics",
    title: "LionGotchi: Your Virtual Pet",
    description: "Adopt a virtual pet lion, learn how to care for it, and understand how your pet's mood affects your rewards.",
    audience: "member",
    iconName: "Cat",
    estimatedMinutes: 5,
    prevSlug: "private-rooms",
    nextSlug: "liongotchi-room",
    steps: [
      {
        id: "what-is-liongotchi",
        title: "What Is LionGotchi?",
        paragraphs: [
          "LionGotchi is a virtual pet system built into LionBot. Every member can adopt their own pet lion, care for it, and watch it grow as they study.",
          "It's inspired by classic virtual pet games — your pet has needs (hunger, cleanliness, energy) that you manage through simple care actions. But there's more to it: farming, equipment, enhancement, a player marketplace, and room decoration.",
        ],
      },
      {
        id: "adopting",
        title: "Adopting Your Pet",
        paragraphs: [
          "To get started, use the /pet command in Discord. If you don't have a pet yet, you'll see a short onboarding that walks you through the basics — what pets do, how to care for them, and what features are available.",
          "At the end of the onboarding, you'll tap 'Adopt!' and give your pet a name. That's it — your LionGotchi is born!",
        ],
        command: "/pet",
        tip: "Pick a name you'll enjoy seeing every day. You can always check on your pet from the website at /pet too.",
      },
      {
        id: "caring",
        title: "Caring for Your Pet",
        paragraphs: [
          "Your pet has three needs: Hunger, Cleanliness, and Energy. Each one slowly decreases over time. To keep your pet happy, use the care actions:",
          "Feed — Fills the hunger bar. Use the Feed button on the /pet panel or the website overview.",
          "Bathe — Fills the cleanliness bar. Keeps your pet looking sharp.",
          "Rest — Fills the energy bar. A well-rested pet is a productive pet.",
          "Each action has a short 2-minute cooldown, and adds +2 to the corresponding need bar.",
        ],
      },
      {
        id: "mood-system",
        title: "Mood & Bonus Effects",
        paragraphs: [
          "Your pet's mood is calculated from its three needs. A happy, well-cared-for pet gives you bonus gold and XP from studying — up to 1.5x at peak happiness.",
          "A neglected pet with low needs drops your multiplier down to 0.5x. The takeaway: spend a few seconds caring for your pet regularly and you'll earn significantly more from your study sessions.",
        ],
        tip: "Check in on your pet once or twice a day. A quick feed-bathe-rest combo takes under a minute and keeps your bonus multiplier high.",
      },
      {
        id: "pet-website",
        title: "Your Pet on the Website",
        paragraphs: [
          "Everything you can do with /pet in Discord, you can also do from the LionGotchi section of this website. Sign in, then navigate to the Pet section from the sidebar.",
          "The website has full-featured pages for your inventory, farm, room, marketplace, and more — all with visual interfaces that make managing your pet easier than Discord commands.",
        ],
      },
      {
        id: "feature-overview",
        title: "What's Ahead",
        paragraphs: [
          "LionGotchi has a lot of depth. The next several tutorials cover each subsystem in detail:",
          "Room Decoration — Customize your pet's room with furniture, themes, and Gameboy skins.",
          "Farm & Equipment — Grow crops, collect equipment drops, and equip gear for stat bonuses.",
          "Crafting — Combine materials into new items using crafting recipes.",
          "Enhancement — Power up your equipment with scrolls for bigger bonuses (and glowing gear).",
          "Marketplace — Buy and sell items with other players in the global marketplace.",
          "Friends — Add friends, visit their pets, and send gifts.",
          "Family — Join or create a family group with shared farming, a bank, and role-based permissions.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 18. LionGotchi: Room & Skins ────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for pet room decoration and Gameboy skins
  {
    slug: "liongotchi-room",
    title: "LionGotchi: Room & Skins",
    description: "Decorate your pet's room with furniture and themes, and customize the Gameboy frame with collectible skins.",
    audience: "member",
    iconName: "Armchair",
    estimatedMinutes: 4,
    prevSlug: "liongotchi-basics",
    nextSlug: "liongotchi-farm-equipment",
    steps: [
      {
        id: "your-room",
        title: "Your Pet's Room",
        paragraphs: [
          "Every pet has a room — a personal space you can decorate with furniture and themes. Visit the Room page from the Pet section sidebar to see it.",
          "The room is displayed inside a retro Gameboy-style frame. It's a visual showcase of your pet's personality and your collecting progress.",
        ],
      },
      {
        id: "room-themes",
        title: "Room Themes",
        paragraphs: [
          "Room themes change the overall look of your pet's space — walls, floor, and background. Each theme has a different vibe, from cozy bedrooms to futuristic labs.",
          "You can purchase new themes from the Room page and switch between any you own at any time.",
        ],
      },
      {
        id: "furniture-slots",
        title: "Furniture Slots",
        paragraphs: [
          "Your room has seven furniture slots: Wall, Floor, Carpet, Bed, Chair, Desk, and Lamp. Each slot holds one item.",
          "Furniture comes in different rarities and styles. Mix and match pieces to create your ideal room. Some furniture sets look particularly good together.",
        ],
      },
      {
        id: "placing-furniture",
        title: "Placing & Arranging Furniture",
        paragraphs: [
          "From the Room page, click on a slot to see your available furniture for that position. Select a piece to place it.",
          "The room editor lets you customize the layout and layer order to get everything looking just right. Changes save automatically.",
        ],
      },
      {
        id: "buying-room-items",
        title: "Buying Room Items",
        paragraphs: [
          "New furniture and themes are available from the Room page's shop section. Items can be purchased with gold or LionGems.",
          "You can also find room items on the Marketplace — other players may be selling furniture you're looking for at good prices.",
        ],
        tip: "Check the Marketplace before buying from the shop. Player listings are often cheaper, especially for common furniture.",
      },
      {
        id: "gameboy-skins",
        title: "Gameboy Skins",
        paragraphs: [
          "The Gameboy frame that wraps your pet's room and farm can be customized with collectible skins. Each skin changes the frame's color, pattern, and style.",
          "Browse available Gameboy skins from the Pet Skins page. Some are purchasable with gold or gems, while rarer ones are earned through achievements or events.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 19. LionGotchi: Farm & Equipment ────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated prevSlug to liongotchi-room, nextSlug to liongotchi-crafting, removed enhancement step (now its own tutorial)
  {
    slug: "liongotchi-farm-equipment",
    title: "LionGotchi: Farm & Equipment",
    description: "Grow resources on your farm, collect equipment from studying, and equip gear to boost your rewards.",
    audience: "member",
    iconName: "Sprout",
    estimatedMinutes: 5,
    prevSlug: "liongotchi-room",
    nextSlug: "liongotchi-crafting",
    steps: [
      {
        id: "farming-overview",
        title: "Your Farm",
        paragraphs: [
          "Every pet owner gets a farm with 15 plots. You plant seeds, water them, and harvest materials — all from the Farm page on the website or the /pet command in Discord.",
          "Farming is one of the main ways to get resources in LionGotchi. Harvested materials can be used for crafting, sold on the marketplace, or saved for later.",
        ],
      },
      {
        id: "planting-watering",
        title: "Planting & Watering",
        paragraphs: [
          "Select an empty plot and choose a seed to plant. Seeds come in different rarities — higher rarity seeds take longer to grow but yield better materials.",
          "After planting, you need to water your crops. Growth is also driven by your activity — studying in voice channels and sending messages helps your plants grow faster.",
        ],
        tip: "Use the 'Water All' button to water every plot at once. Check your farm after study sessions to see how much your crops have grown.",
      },
      {
        id: "harvesting",
        title: "Harvesting & Rarity",
        paragraphs: [
          "When a crop is fully grown, harvest it to receive materials. Each harvest has a rarity reveal — you might get Common, Uncommon, Rare, Epic, or even Legendary drops.",
          "The 'Harvest All' button collects everything that's ready at once. Dead crops (from not watering) can be cleared to free up the plot.",
        ],
      },
      {
        id: "equipment-drops",
        title: "Equipment Drops",
        paragraphs: [
          "As you study in voice channels and chat in text channels, you have a chance to receive equipment drops. These are wearable items for your pet — hats, accessories, outfits, wings, and shoes.",
          "Equipment goes into your inventory automatically. You can also get equipment drops from harvesting crops on your farm. The more active you are, the more drops you'll collect.",
        ],
      },
      {
        id: "equipping-gear",
        title: "Equipping Gear",
        paragraphs: [
          "Visit the Inventory page to see all your equipment. Your pet has 5 equipment slots: Head, Face, Body, Back, and Feet.",
          "Equip items to dress up your pet and gain stat bonuses. Each piece of equipment can boost your gold earning rate, XP gains, or drop chances. The bonuses stack — a full set of gear makes a real difference.",
        ],
        note: "Once you have gear equipped, you can enhance it with scrolls for even bigger bonuses. See the Enhancement tutorial for a full guide.",
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 20. LionGotchi: Crafting ────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for the Crafting system
  {
    slug: "liongotchi-crafting",
    title: "LionGotchi: Crafting",
    description: "Combine harvested materials into new items using crafting recipes — turn farm resources into equipment, scrolls, and more.",
    audience: "member",
    iconName: "Hammer",
    estimatedMinutes: 3,
    prevSlug: "liongotchi-farm-equipment",
    nextSlug: "liongotchi-enhancement",
    steps: [
      {
        id: "what-is-crafting",
        title: "What Is Crafting?",
        paragraphs: [
          "Crafting lets you combine materials into new items. Instead of relying solely on equipment drops or marketplace purchases, you can create specific items from resources you've farmed.",
          "The Crafting page is in the Pet section sidebar. It shows all available recipes and what materials each one requires.",
        ],
      },
      {
        id: "viewing-recipes",
        title: "Viewing Recipes",
        paragraphs: [
          "Each recipe lists the input materials (type, rarity, and quantity) and the output item you'll receive. Recipes range from simple (combine 3 common materials) to complex (require multiple rare or epic materials).",
          "Recipes you have enough materials for are highlighted, so you can quickly see what's craftable right now.",
        ],
      },
      {
        id: "crafting-item",
        title: "Crafting an Item",
        paragraphs: [
          "Select a recipe you have the materials for and click Craft. The materials are consumed and the new item appears in your inventory.",
          "Some recipes produce equipment, others produce scrolls for enhancement, and some create decorative items for your room.",
        ],
        tip: "Before spending rare materials on crafting, check the marketplace. Sometimes buying the finished item directly is cheaper than crafting it from scratch.",
      },
      {
        id: "getting-materials",
        title: "Where to Get Materials",
        paragraphs: [
          "Materials primarily come from farming — harvest crops on your farm to collect them. Different seed types yield different material categories.",
          "You can also buy materials from other players on the Marketplace, receive them as gifts from friends, or occasionally get them from equipment drops.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 21. LionGotchi: Enhancement ─────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New dedicated tutorial for the Enhancement system (MapleStory-inspired forge ceremony)
  {
    slug: "liongotchi-enhancement",
    title: "LionGotchi: Enhancement",
    description: "Power up your equipment with scrolls, experience the forge ceremony, earn glow effects, and track enhancement achievements.",
    audience: "member",
    iconName: "Sparkles",
    estimatedMinutes: 5,
    prevSlug: "liongotchi-crafting",
    nextSlug: "liongotchi-marketplace",
    steps: [
      {
        id: "enhancement-overview",
        title: "What Is Enhancement?",
        paragraphs: [
          "Enhancement is the system for powering up your equipment. By applying scrolls to your gear, you increase their stat bonuses — more gold from studying, better XP rates, and higher drop chances.",
          "The Enhancement page is in the Pet section sidebar. It features a cinematic forge ceremony inspired by classic RPGs, complete with animations, sound effects, and visual feedback.",
        ],
      },
      {
        id: "equipment-and-scrolls",
        title: "Choosing Equipment & Scrolls",
        paragraphs: [
          "To enhance, you need two things: a piece of equipment (already in your inventory or equipped on your pet) and a scroll.",
          "Equipment can be filtered by slot, sorted by rarity, and searched by name. Scrolls can be filtered by rarity and success rate. The interface shows you exactly what each scroll will do to your chosen equipment.",
        ],
      },
      {
        id: "success-rates",
        title: "Success, Failure & Destruction",
        paragraphs: [
          "Every scroll has three rates: success rate, failure rate, and destruction rate. On success, the equipment gains a level and its stats increase. On failure, nothing happens (you lose the scroll but keep the equipment). On destruction, both the scroll and the equipment are lost.",
          "Higher-tier scrolls generally have better success rates but are rarer and more expensive. Common scrolls are plentiful but riskier.",
        ],
        warning: "Enhancement can destroy your equipment permanently. Always start with common gear to learn the system before risking your best items.",
      },
      {
        id: "the-ceremony",
        title: "The Forge Ceremony",
        paragraphs: [
          "When you enhance, the forge ceremony plays out in three phases: charging (the equipment glows and builds energy), striking (the hammer hits the anvil), and revealing (the result appears with particles and effects).",
          "Success shows a burst of golden confetti and sparkles. Failure shows a brief shake. Destruction shatters the equipment with dramatic fragments. It's tense, satisfying, and a little addictive.",
        ],
      },
      {
        id: "glow-tiers",
        title: "Glow Tiers",
        paragraphs: [
          "As you successfully enhance equipment, it gains a visual glow effect that other players can see. Glow tiers progress through: Bronze, Silver, Gold, Platinum, Diamond, and Celestial.",
          "The glow tier depends on the total enhancement level of the item. A Celestial-glowing piece of equipment is a serious flex — it means you've successfully enhanced it many times without destroying it.",
        ],
      },
      {
        id: "batch-enhance",
        title: "Batch Enhancement",
        paragraphs: [
          "If you have a stack of scrolls, you can use batch enhancement to apply them one after another automatically. Set the number of attempts and the system will run them in sequence, stopping if the equipment is destroyed.",
          "This saves time when you're enhancing common gear and don't want to click through each attempt individually.",
        ],
      },
      {
        id: "achievements-streaks",
        title: "Achievements & Streaks",
        paragraphs: [
          "The Enhancement page tracks your session stats — consecutive successes, total attempts, and destruction count. Hitting streak milestones triggers achievement badges.",
          "Achievements are displayed on your enhancement profile and unlock at various thresholds. They're a badge of honor for dedicated enhancers.",
        ],
        tip: "Check the enhancement leaderboard to see who has the highest total enhancement levels. Competition drives progress!",
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 22. LionGotchi: Marketplace & Collections ───────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Updated prevSlug to liongotchi-enhancement, added nextSlug to liongotchi-friends
  {
    slug: "liongotchi-marketplace",
    title: "LionGotchi: Marketplace & Collections",
    description: "Buy and sell items on the player marketplace, explore the item wiki, and track your collection progress.",
    audience: "member",
    iconName: "Store",
    estimatedMinutes: 5,
    prevSlug: "liongotchi-enhancement",
    nextSlug: "liongotchi-friends",
    steps: [
      {
        id: "marketplace-overview",
        title: "The Marketplace",
        paragraphs: [
          "The LionGotchi Marketplace is a player-to-player trading hub. You can buy equipment, scrolls, and materials from other players, or list your own items for sale.",
          "Browse the Marketplace page to see active listings. You can search by name, filter by category and rarity, and sort by price or recency.",
        ],
      },
      {
        id: "buying-items",
        title: "Buying Items",
        paragraphs: [
          "Found something you want? Click on a listing to see the details — item stats, seller info, and price. Items can be priced in gold or LionGems.",
          "Hit Buy to purchase instantly. The item goes straight to your inventory and the seller receives their payment.",
        ],
      },
      {
        id: "selling-items",
        title: "Selling Items",
        paragraphs: [
          "To sell items, go to the Sell page from the Marketplace. Pick an item from your inventory, set a quantity and price (in gold or gems), and list it.",
          "You can check the price reference to see what similar items have sold for recently. Your active listings and sales history are available on the My Listings page.",
        ],
        tip: "Check the trending section on the marketplace to see what's in demand before pricing your items.",
      },
      {
        id: "room-decoration",
        title: "Room Decoration",
        paragraphs: [
          "Your pet has a room that you can decorate with furniture. Visit the Room page to place items on the wall, floor, carpet, bed, chair, desk, and lamp slots.",
          "Choose a room theme, then drag furniture into place. The room editor lets you customize the layout and layer order to make your pet's space uniquely yours.",
        ],
      },
      {
        id: "gameboy-skins",
        title: "Gameboy Skins",
        paragraphs: [
          "Your pet's room and farm are displayed inside a retro Gameboy-style frame. You can buy and equip different Gameboy skins to change the look of this frame.",
          "Skins are available in themes and can be purchased with gold or gems. Visit the Pet Skins page to browse available options and track your collection.",
        ],
      },
      {
        id: "item-wiki",
        title: "Item Wiki & Collection Tracking",
        paragraphs: [
          "The Wiki page is your encyclopedia for every item in LionGotchi. Browse all equipment, scrolls, seeds, and materials with full details — stats, rarity, how to obtain them, and current marketplace prices.",
          "The collection tracker shows which items you've owned and which ones you're still missing. It also includes an enhancement calculator to plan your upgrade path before spending resources.",
        ],
        tip: "Use the Wiki's enhancement calculator to check success rates and expected costs before enhancing expensive gear.",
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 23. LionGotchi: Friends ─────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for the Friends social system
  {
    slug: "liongotchi-friends",
    title: "LionGotchi: Friends",
    description: "Add friends, visit their pets and rooms, send gifts, and interact with your LionGotchi social circle.",
    audience: "member",
    iconName: "Users2",
    estimatedMinutes: 4,
    prevSlug: "liongotchi-marketplace",
    nextSlug: "liongotchi-family",
    steps: [
      {
        id: "friends-system",
        title: "The Friends System",
        paragraphs: [
          "LionGotchi has a built-in friends system that lets you connect with other pet owners. Friends can visit each other's pets, rooms, and farms, send gifts, and interact in ways that benefit both players.",
          "Find the Friends page in the Pet section sidebar. It shows your friend list, pending requests, and a search to find new friends.",
        ],
      },
      {
        id: "adding-friends",
        title: "Adding Friends",
        paragraphs: [
          "To add a friend, use the search bar on the Friends page to find them by Discord username. Send a friend request, and once they accept, you're connected.",
          "You can also accept or decline incoming requests from the Pending tab. There's no limit to how many friends you can have.",
        ],
      },
      {
        id: "friend-profiles",
        title: "Visiting Friend Profiles",
        paragraphs: [
          "Click on a friend to see their profile — their pet's stats, equipped gear, room, farm status, and recent activity.",
          "Visiting friends gives you a peek at how they've decorated their room, what equipment they're running, and how their farm is doing. It's a great source of inspiration for your own setup.",
        ],
      },
      {
        id: "gifting",
        title: "Gifting Items",
        paragraphs: [
          "You can send items from your inventory to friends as gifts. This is useful for sharing extra materials, giving a friend a scroll they need, or just being generous.",
          "To gift, visit a friend's profile and use the Gift option. Select an item and quantity from your inventory, confirm, and it's sent instantly.",
        ],
        tip: "Gifting is a great way to help friends who are just starting out in LionGotchi. Spare seeds and common equipment go a long way for beginners.",
      },
      {
        id: "interacting",
        title: "Interacting with Friends",
        paragraphs: [
          "Beyond gifting, you can interact with friends' pets — pet them, play with them, or cheer them on. These interactions benefit both players with small mood boosts.",
          "Regular interactions keep your social circle active and can unlock social achievements over time.",
        ],
      },
      {
        id: "managing-friends",
        title: "Managing Your Friends List",
        paragraphs: [
          "From the Friends page, you can remove friends or block users if needed. Blocked users can't send you friend requests or interact with your pet.",
          "Your friends list is global across all servers — once you're friends with someone, you can see each other regardless of which server you're in.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---

  // ── 24. LionGotchi: Family ──────────────────────────────
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: New tutorial for the Family group system
  {
    slug: "liongotchi-family",
    title: "LionGotchi: Family",
    description: "Create or join a family group, share a farm and gold bank, manage roles and permissions, and grow together.",
    audience: "member",
    iconName: "Crown",
    estimatedMinutes: 5,
    prevSlug: "liongotchi-friends",
    steps: [
      {
        id: "what-are-families",
        title: "What Are Families?",
        paragraphs: [
          "Families are small groups of LionGotchi players who band together. A family shares a communal farm, a gold bank, and a member roster with role-based permissions.",
          "Think of it as a mini guild within LionGotchi. You pool resources, farm together, and benefit from collective effort.",
        ],
      },
      {
        id: "creating-family",
        title: "Creating a Family",
        paragraphs: [
          "To create a family, go to the Family page in the Pet section sidebar and click Create. You'll choose a name for your family and become its leader.",
          "As the leader, you have full control over settings, roles, and membership. You can invite other players to join.",
        ],
      },
      {
        id: "joining-family",
        title: "Joining a Family",
        paragraphs: [
          "If someone invites you to their family, you'll see the invitation on the Family page. You can view the family's info — name, members, and description — before accepting or declining.",
          "You can only be in one family at a time. If you want to join a different family, you'll need to leave your current one first.",
        ],
      },
      {
        id: "roles-permissions",
        title: "Roles & Permissions",
        paragraphs: [
          "Families have three roles: Leader, Officer, and Member. Each role has different permissions for managing the family.",
          "Leaders can do everything — invite/kick members, change settings, manage the bank, and transfer leadership. Officers can manage farming and some bank operations. Members can farm and view the bank but can't change settings.",
          "The leader can promote members to officer or demote officers back to members.",
        ],
      },
      {
        id: "family-farm",
        title: "The Family Farm",
        paragraphs: [
          "Families have a shared farm separate from your personal farm. Members can plant, water, and harvest crops on family plots, with all harvested resources going to the family bank.",
          "This is a collaborative effort — the more active your family members are, the faster your shared farm grows. Coordinate with your family on what seeds to plant for the best results.",
        ],
        tip: "Assign specific plots to different members so everyone knows what they're responsible for. It prevents overlap and keeps the farm organized.",
      },
      {
        id: "family-bank",
        title: "The Family Bank",
        paragraphs: [
          "The family bank holds shared gold and items. Gold earned from family farm harvests goes here, and members with permission can deposit or withdraw gold.",
          "The leader can set a daily withdrawal cap to prevent any single member from draining the bank. Items in the bank are available for any member to use.",
        ],
      },
      {
        id: "family-settings",
        title: "Family Settings",
        paragraphs: [
          "Leaders can customize the family from the Settings page — change the name, set the daily gold cap, transfer leadership to another member, or disband the family entirely.",
          "Disbanding is permanent and distributes remaining bank gold equally among members.",
        ],
        warning: "Disbanding a family is permanent and cannot be undone. Make sure to discuss it with your members first.",
      },
      {
        id: "leaving-family",
        title: "Leaving a Family",
        paragraphs: [
          "If you want to leave, use the Leave button on the Family overview page. You'll keep your personal items but lose access to the shared farm and bank.",
          "Leaders cannot leave — they must transfer leadership to another member first, or disband the family.",
        ],
      },
    ],
  },
  // --- END AI-MODIFIED ---
]
