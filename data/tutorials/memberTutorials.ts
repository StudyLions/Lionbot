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
          "LionGems are the premium currency. You can purchase them to unlock exclusive skins, premium features for your server, and support the bot's development.",
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
]
