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

export const LEO_MESSAGES: Record<string, StepMessages> = {
  welcome: {
    intro: "73,803 servers trust me. That's more than some countries have cities. You're welcome for letting you join the family.",
    hint: "No pressure, but every second you DON'T click that button, a potential study session goes unwasted. Wait, that came out wrong.",
    exit: "AND WE'RE OFF. Buckle up, bestie.",
  },
  basics: {
    intro: "First things first -- let's teach me where on this spinning rock your server lives. Timezone matters because I track EVERYTHING.",
    hint: "Pro tip: set a welcome message. Nothing says 'we care' like a bot greeting people before any human does. Peak 2026 energy.",
    exit: "Basics? Locked in. You're basically a Discord admin prodigy now.",
  },
  economy: {
    intro: "LionCoins. Yes, we named our currency after ourselves. Narcissistic? Maybe. Effective? Absolutely. Your members earn these by actually being productive -- wild concept, I know.",
    hint: "Servers with 50k+ members typically set rewards between 100-200 coins/hour. Start there and adjust based on how generous you're feeling. Or don't. I'm a bot, not your financial advisor.",
    exit: "Your economy is SET. Members are about to become coin-obsessed little grinders.",
  },
  ranks: {
    intro: "Ranks are how your members flex on each other. Voice hours? Messages? XP? Pick your poison. Everyone loves a good hierarchy -- it's basically Discord's love language.",
    hint: "The profile card is where the magic happens. Members can see their stats, rank, and customize their look with skins. It's like LinkedIn but actually cool.",
    exit: "Rank system? Deployed. Time to watch your members compete like their lives depend on it.",
  },
  tasks: {
    intro: "Tasks: because your members need a to-do list managed by a lion bot. 12 tasks created, 3 completed -- I respect the ambition-to-execution ratio.",
    hint: "Members earn coins for completing tasks. It's basically a Pavlovian reward system but for productivity. I'm not apologizing for it.",
    exit: "Task system configured. Your members now have NO excuse to procrastinate. Well, they do, but now they'll feel guilty about it.",
  },
  pomodoro: {
    intro: "The Pomodoro Technique: 25 minutes of focus, then a break. Simple, effective, and scientifically backed. Unlike my jokes, which are just effective.",
    hint: "Set a dedicated Pomodoro channel so members can focus together. Nothing motivates studying like knowing someone else is also suffering.",
    exit: "Timer's set! Your members are about to become productivity machines. Or they'll ignore it. Either way, I tried.",
  },
  schedule: {
    intro: "Accountability sessions. Members literally BET COINS they'll show up to study. If they ghost? I keep the coins. If they show? They get rewarded. It's beautiful, honestly.",
    hint: "Set the price high enough that missing hurts, but low enough that joining doesn't feel like a mortgage payment. Balance is key. Like yoga, but for Discord.",
    exit: "Schedule system locked and loaded. Your members are now financially accountable for their study habits. You're welcome, their future selves.",
  },
  community: {
    intro: "Now for the fun stuff -- role menus, private rooms, video channels, and moderation. This is where {serverName} goes from 'just another server' to 'wow, they have their stuff together.'",
    hint: "Private rooms let members create temporary voice channels. It's like giving them their own study room, except you don't have to pay rent. Everyone wins.",
    exit: "Community tools? STACKED. {serverName} is about to feel like a five-star Discord resort.",
  },
  liongotchi: {
    intro: "WAIT. Before you go -- your members get VIRTUAL PET LIONS. With farming. And a marketplace. And room decorating. I'm NOT making this up. This is real. This exists.",
    hint: "Enable item drops in a channel and watch your members fight over rare loot like it's Black Friday. LionGotchi has pets, rooms, furniture, crops, families -- it's a whole ecosystem inside your server.",
    exit: "LionGotchi is LIVE. Your members are about to adopt virtual lions and honestly? That's the most valid thing anyone's done on Discord.",
  },
  premium: {
    intro: "Real talk for a second. LionBot is a small family project. Built by Ari because studying alone sucked. Now we serve 73k+ servers because apparently everyone agreed.",
    hint: "Premium admins get direct contact with the developers. Like, you can literally DM us feature ideas and we'll build them. We ship updates weekly. It's kinda insane, not gonna lie.",
    exit: "Whether you go premium or not -- we're here for you. Join the support server, report bugs, say hi. We fix stuff FAST because we actually care. Cringe? Maybe. True? Absolutely.",
  },
  commands: {
    intro: "Here's your cheat sheet. Every command your members and admins need, organized so cleanly it'd make Marie Kondo cry tears of joy.",
    hint: "Your members will use /me and /profile the most -- that's where they see their stats. Admins should bookmark /config and /settings. You're welcome for the organization.",
    exit: "Commands memorized? Good. No? That's fine too, this page isn't going anywhere.",
  },
  celebration: {
    intro: "YOU DID IT. {serverName} is officially set up and ready to dominate. I'm not crying, you're crying. Okay maybe I'm crying a little. Tears of binary code.",
    hint: "Don't forget to check out the Ranks Editor and Shop Editor next -- that's where you really make {serverName} shine. Or just vibe, I don't control you.",
    exit: "Go forth and conquer, admin. {serverName} is about to become everyone's favorite server. And if it doesn't? Come back here and I'll personally roast your settings.",
  },
}

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
