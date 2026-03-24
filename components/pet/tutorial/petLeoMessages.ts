// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Leo dialogue for the 12-step pet tutorial wizard.
//          Written for users who may have ZERO gaming experience.
//          Every joke rides on top of a clear explanation.
// ============================================================

export interface StepMessages {
  intro: string
  hint: string
  exit: string
}

export const PET_LEO_MESSAGES: Record<string, StepMessages> = {
  welcome: {
    intro: "You just got a virtual pet lion. Yes, really. It lives on your screen, grows while you study, and earns you rewards. Let me show you everything it can do.",
    hint: "This tutorial takes about 3 minutes. Each step explains a feature and shows you what it looks like. You can skip ahead or come back anytime.",
    exit: "Alright, let's dive in! First up: keeping your pet happy.",
  },
  care: {
    intro: "Your pet has 4 needs -- food, cleanliness, rest, and health. Think of them like real needs. If you ignore them, your pet gets sad and earns less gold. Take care of it and you'll earn MORE gold while studying.",
    hint: "Stats go down slowly over time. Come back and press the care buttons to fill them up. Happy pet = more gold. It's basically emotional blackmail and I'm not sorry.",
    exit: "Care system? You're a natural pet parent. Let's see your pet's room next.",
  },
  room: {
    intro: "Every pet has a room -- think of it like decorating a bedroom. You pick the walls, floor, and furniture, then arrange everything however you want by dragging things around.",
    hint: "You start with a basic room. Unlock fancier room themes and buy new furniture using gold. There's a castle theme, a garden, even a space station. Go wild.",
    exit: "Interior designer unlocked. Now let's talk about what your pet wears.",
  },
  inventory: {
    intro: "Equipment is like clothing for your pet -- hats, shirts, boots, and wings. Each item has a rarity level, which tells you how rare and powerful it is. Items appear randomly while you study or chat in Discord.",
    hint: "When you study in a voice channel or send messages, items can randomly appear -- we call these 'drops.' Rarer items show up less often, but they're worth way more. Think of it like finding treasure while doing homework.",
    exit: "You now know more about item rarity than most players. Let's customize your frame next.",
  },
  skins: {
    intro: "See that frame around your room? That's the Gameboy skin. It's purely decorative -- like a phone case. It doesn't change how your pet works, it just looks cool. Buy different ones with gold.",
    hint: "Some skins are cheap and common, others are rare and expensive. Pick whichever matches your vibe. Your pet doesn't care, but YOU will.",
    exit: "Looking stylish. Time to learn about farming!",
  },
  farm: {
    intro: "You have a small farm with 15 plots of land. Plant a seed, water it, wait for it to grow, then harvest it for gold. It's like a real garden, except your crops are worth actual in-game currency.",
    hint: "Different seeds cost different amounts and produce different rewards. Crops need water regularly or they die. Check back every few hours. Pro tip: water everything before bed.",
    exit: "Green thumb activated. Now for the exciting part -- upgrading your gear.",
  },
  enhancement: {
    intro: "Scrolls are special items that can upgrade your equipment and make it stronger. Here's how: pick one piece of equipment and one scroll, combine them on the anvil, and hope for the best. Success means your item gets a boost and starts glowing. Failure means... well, nothing happens. Or rarely, the item breaks.",
    hint: "The rarer the scroll, the bigger the bonus on success. But higher enhancement levels get harder to achieve. The glow on your items shows everyone how upgraded they are -- from a subtle bronze shimmer to a full celestial aura.",
    exit: "Enhancement master in the making. Let's check out the item encyclopedia next.",
  },
  wiki: {
    intro: "The Wiki is an encyclopedia for every item in the game. Want to know what an item looks like? How rare it is? How many people own it? It's all here. You can also track how many items you've collected out of the total.",
    hint: "Use the Wiki to decide what to buy on the marketplace, check enhancement stats, or just browse and window-shop. Every collector's best friend.",
    exit: "Knowledge is power. Speaking of shopping -- let's visit the marketplace.",
  },
  marketplace: {
    intro: "The Marketplace is where players buy and sell items with each other. Think of it like an online store, except every item is listed by another real person. You set your own prices, browse other people's listings, and trade for gold.",
    hint: "Sell items you don't need, buy items you want. There's a small fee on each sale. Prices are set by players, so check the market before listing something -- you don't want to undersell a rare item.",
    exit: "Entrepreneur mode: ON. Let's get social next.",
  },
  social: {
    intro: "LionGotchi isn't just a solo game. Add friends, visit their rooms, check out their farms, and send them gifts of gold or items. It's like social media, but for pixel lions.",
    hint: "Search for friends by their Discord username. Once you're connected, you can peek at their room, visit their farm, or send a surprise gift. Being generous earns you good karma. Probably.",
    exit: "Social butterfly status achieved. One more thing -- families!",
  },
  family: {
    intro: "A Family is a team of players who work together. You share a bigger farm with more plots, pool gold in a shared bank, and compete on a family leaderboard against other teams. Think of it like starting a club with your friends.",
    hint: "Create a family (costs some gold) or get invited to one. The leader assigns roles -- Officers help manage, Members contribute. Everyone benefits from the shared farm and treasury.",
    exit: "Family values. Love to see it. You're almost done!",
  },
  complete: {
    intro: "That's everything! You now know more about LionGotchi than most people who've been playing for weeks. Go explore, earn gold, collect items, decorate your room, and most importantly -- keep studying.",
    hint: "If you ever forget how something works, you can retake this tutorial anytime from the pet menu. Or just dive in and figure it out -- that's half the fun.",
    exit: "Go forth and conquer, pet parent. Your lion is counting on you. No pressure.",
  },
}

export function getPetLeoMessage(
  step: string,
  type: keyof StepMessages,
): string {
  const messages = PET_LEO_MESSAGES[step]
  if (!messages) return "..."
  return messages[type]
}
