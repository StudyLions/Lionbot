// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Hyper-sarcastic Gen-Z Leo dialogue for the 12-step
//          setup wizard. {serverName} is replaced at runtime.
// ============================================================

export interface StepMessages {
  intro: string
  hint: string
  exit: string
}

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Clarity pass -- every joke now rides on top of a clear explanation, not instead of one.
// Removed developer jargon ("Deployed", "ecosystem", "Pavlovian") and softened creepy lines.
export const LEO_MESSAGES: Record<string, StepMessages> = {
  welcome: {
    intro: "73,803 servers and counting. This wizard will walk you through everything I can do -- and trust me, it's a lot. Each step explains a feature and lets you configure it. Ready?",
    hint: "No pressure, but every second you DON'T click that button, a potential study session goes unwasted. Wait, that came out wrong.",
    exit: "AND WE'RE OFF. Buckle up, bestie.",
  },
  basics: {
    intro: "Time to set up the foundation -- your timezone (so leaderboards reset at the right time), welcome messages for new members, and which roles get to boss me around. Don't worry, I'll explain everything.",
    hint: "Pro tip: set a welcome message. Nothing says 'we care' like a bot greeting people before any human does. Peak 2026 energy.",
    exit: "Basics? Locked in. You're basically a Discord admin prodigy now.",
  },
  economy: {
    intro: "LionCoins. Yes, we named our currency after ourselves. Narcissistic? Maybe. Effective? Absolutely. Members earn coins by being active in voice channels, and spend them in your server shop, on private rooms, or send them to friends.",
    hint: "Servers with 50k+ members typically set rewards between 100-200 coins/hour. Start there and adjust based on how generous you're feeling. Or don't. I'm a bot, not your financial advisor.",
    exit: "Your economy is SET. Members are about to become coin-obsessed little grinders.",
  },
  ranks: {
    intro: "Ranks are how your members level up and flex on each other. They earn XP (experience points) from voice time and messages, climb the leaderboard, and get a profile card to show off. Everyone loves a good leaderboard -- it's basically Discord's love language.",
    hint: "The profile card is where the magic happens. Members type /profile in Discord to see their stats, rank, and customize their card with skins. It's like LinkedIn but actually cool.",
    exit: "Rank system is ready! Time to watch your members compete like their lives depend on it.",
  },
  tasks: {
    intro: "Members type /task in Discord to manage their personal to-do list. Every completed task earns them LionCoins. It's a built-in productivity reward system -- and honestly, some of your members need it.",
    hint: "Members earn coins for completing tasks. It rewards productivity and keeps people engaged. I'm not apologizing for how effective it is.",
    exit: "Task system configured. Your members now have NO excuse to procrastinate. Well, they do, but now they'll feel guilty about it.",
  },
  pomodoro: {
    intro: "The Pomodoro Technique: 25 minutes of focus, then a 5-minute break, then repeat. Members type /pomodoro in Discord and study together with synchronized timers. Simple, effective, and scientifically backed. Unlike my jokes, which are just effective.",
    hint: "Set a dedicated Pomodoro channel so members can focus together. Nothing motivates studying like knowing someone else is also suffering.",
    exit: "Timer's set! Your members are about to become productivity machines. Or they'll ignore it. Either way, I tried.",
  },
  schedule: {
    intro: "Accountability sessions. Members pay a small entry fee in LionCoins to join a scheduled study session. Show up? They get their coins back plus a reward. Don't show up? The entry fee is gone forever. It's the ultimate motivation.",
    hint: "Set the entry fee high enough that missing hurts, but low enough that joining doesn't feel like a mortgage payment. Balance is key. Like yoga, but for Discord.",
    exit: "Schedule system locked and loaded. Your members are now financially accountable for their study habits. You're welcome, their future selves.",
  },
  community: {
    intro: "Now for the fun stuff -- role menus (let members pick their own roles), private rooms (temporary voice channels members can create), camera-required channels, and moderation tools. This is where {serverName} goes from 'just another server' to 'wow, they have their stuff together.'",
    hint: "Private rooms let members create temporary voice channels for study groups or hanging out. It's like giving them their own room, except you don't have to pay rent. Everyone wins.",
    exit: "Community tools? STACKED. {serverName} is about to feel like a five-star Discord resort.",
  },
  liongotchi: {
    intro: "WAIT. Your members get VIRTUAL PET LIONS. With farming. And a marketplace. And room decorating. I'm NOT making this up. It's a full pet game running inside Discord, with its own currency (gold) separate from LionCoins.",
    hint: "Enable item drops in a channel and watch your members race to grab rare loot like it's Black Friday. LionGotchi has pets, rooms, furniture, crops, families -- it's a whole game world inside your server.",
    exit: "LionGotchi is LIVE. Your members are about to adopt virtual lions and honestly? That's the most valid thing anyone's done on Discord.",
  },
  premium: {
    intro: "Real talk for a second. LionBot is a small family project. Built by Ari because studying alone sucked. Now we serve 73k+ servers because apparently everyone agreed.",
    hint: "Premium admins get direct contact with the developers. Like, you can literally DM us feature ideas and we'll build them. We ship updates weekly. It's kinda insane, not gonna lie.",
    exit: "Whether you go premium or not -- we're here for you. Join the support server, report bugs, say hi. We fix stuff FAST because we actually care. Cringe? Maybe. True? Absolutely.",
  },
  commands: {
    intro: "Here's your cheat sheet. Every slash command your members and admins need. Members type / in any Discord channel and the bot shows all available commands as they type.",
    hint: "Your members will use /me and /profile the most -- that's where they see their stats and profile card. Admins should check out /config and /settings. You're welcome for the organization.",
    exit: "Commands memorized? Good. No? That's fine too, this page isn't going anywhere.",
  },
  celebration: {
    intro: "YOU DID IT. {serverName} is officially set up and ready to go. I'm not crying, you're crying. Okay maybe I'm crying a little. Tears of binary code.",
    hint: "Don't forget to check out the Ranks Editor and Shop Editor next -- that's where you really make {serverName} shine. Or just vibe, I don't control you.",
    exit: "Go forth and conquer, admin. {serverName} is about to become everyone's favorite server. And if it doesn't? Come back here and I'll personally roast your settings.",
  },
}
// --- END AI-MODIFIED ---

export function getLeoMessage(
  step: string,
  type: keyof StepMessages,
  serverName?: string
): string {
  const messages = LEO_MESSAGES[step]
  if (!messages) return "..."
  const msg = messages[type]
  return msg.replace(/\{serverName\}/g, serverName || "your server")
}
