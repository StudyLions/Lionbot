// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Hardcoded mock data for the pet tutorial wizard.
//          All demos render from this data -- zero API calls.
//          Asset paths reference real blob CDN resources.
// ============================================================

import type { FarmPlot } from "@/components/pet/farm/FarmScene"
import { DEFAULT_LAYOUT } from "@/utils/roomConstraints"
import type { RoomLayout } from "@/utils/roomConstraints"

// --------------- Items (one per rarity) ---------------

export interface MockItem {
  id: number
  name: string
  category: string
  rarity: string
  assetPath: string
  description: string
  enhancementLevel?: number
  glowTier?: string
  glowIntensity?: number
  goldBonus?: number
  xpBonus?: number
}

export const MOCK_ITEMS: MockItem[] = [
  { id: 1, name: "Leather Cap", category: "HAT", rarity: "COMMON", assetPath: "hats/hat_01_common.png", description: "A simple leather cap." },
  { id: 2, name: "Frost Goggles", category: "GLASSES", rarity: "UNCOMMON", assetPath: "glasses/glasses_01_uncommon.png", description: "Cool shades with a frosty tint." },
  { id: 3, name: "Battle Tunic", category: "SHIRT", rarity: "RARE", assetPath: "shirts/shirt_01_rare.png", description: "A sturdy shirt worn by warriors." },
  { id: 4, name: "Golden Wings", category: "WINGS", rarity: "EPIC", assetPath: "wings/angel_wings_gold.png", description: "Gleaming wings of pure gold." },
  { id: 5, name: "Legendary Boots", category: "BOOTS", rarity: "LEGENDARY", assetPath: "boots/boots_boots_legendary_.png", description: "Boots forged in ancient fire." },
  { id: 6, name: "Mythical Crown", category: "HAT", rarity: "MYTHICAL", assetPath: "hats/crown.png", description: "A crown of unimaginable power." },
]

export const MOCK_SCROLL_ITEMS: MockItem[] = [
  { id: 101, name: "Common Scroll", category: "SCROLL", rarity: "COMMON", assetPath: "scrolls/scroll_common.png", description: "70% success rate." },
  { id: 102, name: "Rare Scroll", category: "SCROLL", rarity: "RARE", assetPath: "scrolls/scroll_rare.png", description: "50% success rate, stronger bonus." },
  { id: 103, name: "Legendary Scroll", category: "SCROLL", rarity: "LEGENDARY", assetPath: "scrolls/scroll_legendary.png", description: "30% success rate, massive bonus." },
]

export const RARITY_TIERS = [
  { rarity: "COMMON", label: "Common", sublabel: "Easy to find", color: "#9ca3af", border: "#3a4a6c" },
  { rarity: "UNCOMMON", label: "Uncommon", sublabel: "A bit harder to find", color: "#60a5fa", border: "#4080f0" },
  { rarity: "RARE", label: "Rare", sublabel: "Takes patience", color: "#f87171", border: "#e04040" },
  { rarity: "EPIC", label: "Epic", sublabel: "Very hard to find", color: "#facc15", border: "#f0c040" },
  { rarity: "LEGENDARY", label: "Legendary", sublabel: "Extremely rare", color: "#e879f9", border: "#d060f0" },
  { rarity: "MYTHICAL", label: "Mythical", sublabel: "Nearly impossible", color: "#fb7185", border: "#ff6080" },
]

// --------------- Equipment slots ---------------

export const EQUIPMENT_SLOTS = [
  { slot: "HEAD", label: "Head", example: "Hats, crowns, helmets" },
  { slot: "FACE", label: "Face", example: "Glasses, masks, monocles" },
  { slot: "BODY", label: "Body", example: "Shirts, tunics, costumes" },
  { slot: "BACK", label: "Back", example: "Wings, capes, backpacks" },
  { slot: "FEET", label: "Feet", example: "Boots, sneakers, sandals" },
]

export const MOCK_EQUIPMENT: Record<string, { name: string; assetPath: string; category: string; glowTier?: string; glowIntensity?: number }> = {
  HEAD: { name: "Mythical Crown", assetPath: "hats/crown.png", category: "HAT" },
  BODY: { name: "Legendary Shirt", assetPath: "shirts/shirt_10_legendary.png", category: "SHIRT" },
  BACK: { name: "Golden Wings", assetPath: "wings/angel_wings_gold.png", category: "WINGS" },
  FEET: { name: "Legendary Boots", assetPath: "boots/boots_boots_legendary_.png", category: "BOOTS" },
}

// --------------- Room ---------------

export const MOCK_ROOM = {
  roomPrefix: "rooms/castle",
  furniture: {
    wall: "rooms/castle/wall_1.png",
    floor: "rooms/castle/floor_1.png",
    bed: "rooms/castle/bed_1.png",
    chair: "rooms/castle/chair_1.png",
    table: "rooms/castle/desk_1.png",
    lamp: "rooms/castle/lamp_1.png",
    mat: "rooms/castle/carpet_1.png",
  } as Record<string, string>,
  layout: {
    ...DEFAULT_LAYOUT,
  } as RoomLayout,
}

export const ROOM_THEMES = [
  { name: "Castle", prefix: "rooms/castle" },
  { name: "Library", prefix: "rooms/library" },
  { name: "Beach", prefix: "rooms/beach" },
  { name: "Aquarium", prefix: "rooms/aquarium" },
  { name: "Volcano", prefix: "rooms/volcano" },
  { name: "Savannah", prefix: "rooms/savannah" },
]

// --------------- Gameboy skins ---------------

export const MOCK_SKINS = [
  { name: "Classic", assetPath: "gameboy/frames/gameboy-basic-01.png" },
  { name: "Candy", assetPath: "gameboy/frames/gameboy-candy-01.png" },
  { name: "Midnight", assetPath: "gameboy/frames/gameboy-midnight-01.png" },
]

// --------------- Farm ---------------

function mockPlot(
  plotId: number,
  overrides: Partial<FarmPlot> = {}
): FarmPlot {
  return {
    plotId,
    empty: true,
    dead: false,
    seed: null,
    stage: 0,
    progress: 0,
    readyToHarvest: false,
    needsWater: false,
    isWatered: false,
    rarity: "COMMON",
    growthPoints: 0,
    growthPointsNeeded: 100,
    goldInvested: 0,
    assetPrefix: null,
    plantType: null,
    typeId: null,
    nextWaterAt: null,
    estimatedSecondsRemaining: null,
    plantedAt: null,
    lastWatered: null,
    ...overrides,
  }
}

const DEMO_SEED = { id: 1, name: "Oak Sapling", plantType: "tree", harvestGold: 150, growTimeHours: 6, waterIntervalHours: 3, growthPointsNeeded: 100 }

export const MOCK_FARM_PLOTS: FarmPlot[] = [
  mockPlot(0),
  mockPlot(1),
  mockPlot(2),
  mockPlot(3, { empty: false, seed: DEMO_SEED, stage: 1, progress: 15, assetPrefix: "tree:1", plantType: "tree", typeId: 1, isWatered: true, rarity: "COMMON" }),
  mockPlot(4, { empty: false, seed: DEMO_SEED, stage: 2, progress: 35, assetPrefix: "tree:1", plantType: "tree", typeId: 1, isWatered: true, rarity: "UNCOMMON" }),
  mockPlot(5, { empty: false, seed: DEMO_SEED, stage: 3, progress: 60, assetPrefix: "tree:1", plantType: "tree", typeId: 1, needsWater: true, rarity: "RARE" }),
  mockPlot(6, { empty: false, seed: DEMO_SEED, stage: 4, progress: 85, assetPrefix: "tree:1", plantType: "tree", typeId: 1, isWatered: true, rarity: "EPIC" }),
  mockPlot(7, { empty: false, seed: { ...DEMO_SEED, name: "Golden Sapling" }, stage: 5, progress: 100, readyToHarvest: true, assetPrefix: "tree:1", plantType: "tree", typeId: 1, rarity: "LEGENDARY" }),
  mockPlot(8, { empty: false, seed: DEMO_SEED, stage: 5, progress: 100, readyToHarvest: true, assetPrefix: "tree:2", plantType: "tree", typeId: 2, rarity: "COMMON" }),
  mockPlot(9, { empty: false, dead: true, seed: DEMO_SEED, stage: 2, assetPrefix: "tree:1", plantType: "tree", typeId: 1, rarity: "COMMON" }),
  mockPlot(10),
  mockPlot(11, { empty: false, seed: DEMO_SEED, stage: 1, progress: 10, assetPrefix: "tree:3", plantType: "tree", typeId: 3, needsWater: true, rarity: "COMMON" }),
  mockPlot(12),
  mockPlot(13, { empty: false, seed: DEMO_SEED, stage: 3, progress: 55, assetPrefix: "tree:4", plantType: "tree", typeId: 4, isWatered: true, rarity: "UNCOMMON" }),
  mockPlot(14),
]

// --------------- Pet care stats ---------------

export const MOCK_PET_STATS = {
  food: 6,
  bath: 3,
  sleep: 8,
  life: 7,
  maxStat: 10,
  mood: 72,
  moodLabel: "Content",
  moodMult: 1.2,
}

export const CARE_ACTIONS = [
  { action: "feed", label: "Feed", stat: "food", icon: "🍖", description: "Fills the food bar. Your pet gets hungry over time." },
  { action: "bathe", label: "Bathe", stat: "bath", icon: "🛁", description: "Fills the bath bar. Pets get dirty over time." },
  { action: "rest", label: "Rest", stat: "sleep", icon: "💤", description: "Fills the sleep bar. Your pet needs regular rest." },
]

// --------------- Marketplace listings ---------------

export interface MockListing {
  id: number
  itemName: string
  itemCategory: string
  itemRarity: string
  itemAssetPath: string
  price: number
  sellerName: string
  listedAt: string
}

export const MOCK_MARKETPLACE_LISTINGS: MockListing[] = [
  { id: 1, itemName: "Battle Tunic", itemCategory: "SHIRT", itemRarity: "RARE", itemAssetPath: "shirts/shirt_01_rare.png", price: 2500, sellerName: "StudyKing", listedAt: "2h ago" },
  { id: 2, itemName: "Golden Wings", itemCategory: "WINGS", itemRarity: "EPIC", itemAssetPath: "wings/angel_wings_gold.png", price: 12000, sellerName: "NightOwl", listedAt: "5h ago" },
  { id: 3, itemName: "Frost Goggles", itemCategory: "GLASSES", itemRarity: "UNCOMMON", itemAssetPath: "glasses/glasses_01_uncommon.png", price: 800, sellerName: "CramQueen", listedAt: "1d ago" },
  { id: 4, itemName: "Leather Cap", itemCategory: "HAT", itemRarity: "COMMON", itemAssetPath: "hats/hat_01_common.png", price: 150, sellerName: "FreshStart", listedAt: "3d ago" },
]

// --------------- Enhancement demo ---------------

export const MOCK_ENHANCEMENT = {
  before: {
    name: "Battle Tunic",
    rarity: "RARE",
    assetPath: "shirts/shirt_01_rare.png",
    enhancementLevel: 0,
    glowTier: "none" as const,
    glowIntensity: 0,
  },
  after: {
    name: "Battle Tunic +5",
    rarity: "RARE",
    assetPath: "shirts/shirt_01_rare.png",
    enhancementLevel: 5,
    glowTier: "gold" as const,
    glowIntensity: 2,
  },
  scroll: {
    name: "Rare Scroll",
    rarity: "RARE",
    assetPath: "scrolls/scroll_rare.png",
  },
}

export const GLOW_TIER_SHOWCASE = [
  { tier: "none", label: "No Enhancement", level: 0, intensity: 0, description: "Base item, no upgrades" },
  { tier: "bronze", label: "Bronze Glow", level: 2, intensity: 0, description: "A subtle warm shimmer" },
  { tier: "silver", label: "Silver Glow", level: 5, intensity: 1, description: "A cool metallic shine" },
  { tier: "gold", label: "Gold Glow", level: 8, intensity: 2, description: "A brilliant golden aura" },
  { tier: "diamond", label: "Diamond Glow", level: 11, intensity: 2, description: "A dazzling crystal radiance" },
  { tier: "celestial", label: "Celestial Glow", level: 15, intensity: 3, description: "An otherworldly purple fire" },
]

// --------------- Family structure ---------------

export const FAMILY_ROLES = [
  { role: "Leader", description: "Creates the family, has full control", icon: "👑", count: 1 },
  { role: "Officer", description: "Helps manage members and settings", icon: "⚔️", count: "2-5" },
  { role: "Member", description: "Contributes to farm and bank", icon: "🛡️", count: "Up to 20" },
]

export const FAMILY_FEATURES = [
  { title: "Shared Farm", description: "A bigger farm that everyone plants and harvests together. More plots means more gold for everyone.", icon: "sprout" },
  { title: "Family Bank", description: "A shared gold treasury. Members deposit gold, and the leader decides how to spend it.", icon: "vault" },
  { title: "Family Leaderboard", description: "Compete with other families. The most active families climb the ranks.", icon: "trophy" },
]
