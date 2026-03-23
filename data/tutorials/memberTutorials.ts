// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Member-facing tutorial content (8 tutorials)
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
  {
    slug: "dashboard-tour",
    title: "Using the Dashboard",
    description: "A walkthrough of LionBot's web dashboard — manage tasks, view stats, and configure settings from your browser.",
    audience: "member",
    iconName: "LayoutDashboard",
    estimatedMinutes: 4,
    prevSlug: "skins-and-shop",
    nextSlug: "goals",
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
          "Activity — Tasks, Study History, Goals, and Reminders. This is where you manage your day-to-day productivity.",
          "Collection — Skins, LionGems, and the Leaderboard. Browse cosmetics, check your gem balance, and see how you rank.",
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

  // ── 10. Goals ────────────────────────────────────────────
  {
    slug: "goals",
    title: "Goals",
    description: "Set weekly and monthly study goals to keep yourself accountable and track your progress over time.",
    audience: "member",
    iconName: "Target",
    estimatedMinutes: 3,
    prevSlug: "dashboard-tour",
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

  // ── 11. Voting & LionHeart ──────────────────────────────
  {
    slug: "voting-and-support",
    title: "Voting & LionHeart",
    description: "Vote for LionBot on top.gg for a coin bonus, and learn about LionHeart supporter perks and LionGems.",
    audience: "member",
    iconName: "Heart",
    estimatedMinutes: 4,
    prevSlug: "goals",
    nextSlug: "private-rooms",
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
          "You can purchase LionGems from the Donate page on this website. They unlock exclusive profile skins, cosmetics, and LionGotchi items.",
        ],
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

  // ── 12. Private Rooms ───────────────────────────────────
  {
    slug: "private-rooms",
    title: "Private Rooms",
    description: "Rent your own private voice channel, invite study partners, and focus without distractions.",
    audience: "member",
    iconName: "DoorOpen",
    estimatedMinutes: 3,
    prevSlug: "voting-and-support",
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

  // ── 13. LionGotchi: Your Virtual Pet ────────────────────
  {
    slug: "liongotchi-basics",
    title: "LionGotchi: Your Virtual Pet",
    description: "Adopt a virtual pet lion, learn how to care for it, and understand how your pet's mood affects your rewards.",
    audience: "member",
    iconName: "Cat",
    estimatedMinutes: 5,
    prevSlug: "private-rooms",
    nextSlug: "liongotchi-farm-equipment",
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
    ],
  },

  // ── 14. LionGotchi: Farm & Equipment ────────────────────
  {
    slug: "liongotchi-farm-equipment",
    title: "LionGotchi: Farm & Equipment",
    description: "Grow resources on your farm, collect equipment from studying, enhance gear with scrolls, and boost your rewards.",
    audience: "member",
    iconName: "Sprout",
    estimatedMinutes: 6,
    prevSlug: "liongotchi-basics",
    nextSlug: "liongotchi-marketplace",
    steps: [
      {
        id: "farming-overview",
        title: "Your Farm",
        paragraphs: [
          "Every pet owner gets a farm with 15 plots. You plant seeds, water them, and harvest materials — all from the Farm page on the website or the /pet command in Discord.",
          "Farming is one of the main ways to get resources in LionGotchi. Harvested materials can be used, sold on the marketplace, or saved for later.",
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
          "Equip items to dress up your pet and gain stat bonuses. Each piece of equipment can boost your gold earning rate, XP gains, or drop chances. The bonuses stack — a full set of enhanced gear makes a real difference.",
        ],
      },
      {
        id: "enhancement",
        title: "Enhancement & Scrolls",
        paragraphs: [
          "Scrolls are special items that enhance your equipment, boosting their stats further. The Enhancement page lets you apply scrolls to equipped gear.",
          "Be careful though — enhancement has a success rate and a destroy rate. If enhancement fails, you might lose the scroll. If it critically fails, the equipment could be destroyed. Higher-tier scrolls have better odds but are rarer.",
          "Successfully enhanced items gain visual glow effects — from bronze all the way up to celestial. The glow shows off your dedication to other players.",
        ],
        tip: "Start by enhancing cheaper, more common equipment to learn the system. Save your best scrolls for your rarest gear.",
      },
    ],
  },

  // ── 15. LionGotchi: Marketplace & Collections ───────────
  {
    slug: "liongotchi-marketplace",
    title: "LionGotchi: Marketplace & Collections",
    description: "Buy and sell items on the player marketplace, decorate your pet's room, and track your item collection.",
    audience: "member",
    iconName: "Store",
    estimatedMinutes: 5,
    prevSlug: "liongotchi-farm-equipment",
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
]
