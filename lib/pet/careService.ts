// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Shared, transport-agnostic LionGotchi CARE logic
//          (feed / bathe / sleep). The ONE validated, economy-correct
//          code path for this action — called by BOTH:
//            - pages/api/pet/care.ts          (website, NextAuth cookie)
//            - pages/api/anki/pet/care.ts     (Anki addon, bearer)
//          so there is no duplicated/forked game logic to drift.
//
//          Pure server-side: takes a userId (bigint) + action, does
//          all validation + the DB mutation, returns the new state.
//          Throws PetServiceError(status, code, message) which each
//          route maps to its HTTP response.
//
//          Mirrors the bot's care mechanics: capped lazy decay
//          (MAX_DECAY_PER_WAKE over DECAY_INTERVAL_HOURS) then a
//          one-click fill-to-max of the chosen stat.
// ============================================================
import { prisma } from "@/utils/prisma"

const DECAY_INTERVAL_HOURS = 24
const MAX_DECAY_PER_WAKE = 4

const MOOD_MULTS: Record<number, number> = {
  8: 1.25, 7: 1.20, 6: 1.10, 5: 1.00,
  4: 0.95, 3: 0.85, 2: 0.75, 1: 0.60, 0: 0.50,
}
const MOOD_LABELS: Record<number, string> = {
  8: "Ecstatic", 7: "Ecstatic", 6: "Happy", 5: "Happy",
  4: "Okay", 3: "Okay", 2: "Sad", 1: "Sad", 0: "Fainted",
}

export const CARE_ACTIONS = ["feed", "bathe", "sleep"] as const
export type CareAction = (typeof CARE_ACTIONS)[number]

/** Derive mood (0-8) + its economy multiplier + label from the three
 *  care stats. Shared so every endpoint reports mood identically. */
export function computeMood(food: number, bath: number, sleep: number): {
  mood: number
  moodLabel: string
  moodMult: number
} {
  const mood = Math.floor((food + bath + sleep) / 3)
  return {
    mood,
    moodLabel: MOOD_LABELS[mood] ?? "Okay",
    moodMult: MOOD_MULTS[mood] ?? 1.0,
  }
}

/** Typed error so both the cookie route and the bearer route can map
 *  a single failure to the right HTTP status + machine code. */
export class PetServiceError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "PetServiceError"
  }
}

export interface CareResult {
  food: number
  bath: number
  sleep: number
  mood: number
  moodLabel: string
  moodMult: number
  nextDecayAt: string
}

/**
 * Apply a care action for `userId`. Server-authoritative: the caller
 * supplies ONLY the (already-authenticated) userId and the action
 * string — never any stat values. Returns the new pet care state.
 */
export async function applyCare(
  userId: bigint,
  action: string
): Promise<CareResult> {
  if (!action || !CARE_ACTIONS.includes(action as CareAction)) {
    throw new PetServiceError(
      400,
      "bad_action",
      "Invalid action. Use: feed, bathe, sleep"
    )
  }

  const now = Date.now()

  const pet = await prisma.lg_pets.findUnique({
    where: { userid: userId },
    select: { food: true, bath: true, sleep: true, last_decay_at: true },
  })
  if (!pet) {
    throw new PetServiceError(
      404,
      "no_pet",
      "No pet found. Use /pet in Discord first."
    )
  }

  // Capped lazy decay so a long absence can't nuke every stat at once.
  const elapsedHours = (now - pet.last_decay_at.getTime()) / (1000 * 3600)
  const decayTicks = Math.min(
    Math.floor(elapsedHours / DECAY_INTERVAL_HOURS),
    MAX_DECAY_PER_WAKE
  )
  let food = Math.max(0, pet.food - decayTicks)
  let bath = Math.max(0, pet.bath - decayTicks)
  let sleep = Math.max(0, pet.sleep - decayTicks)

  // One click fills the chosen stat to max.
  if (action === "feed") food = 8
  else if (action === "bathe") bath = 8
  else if (action === "sleep") sleep = 8

  await prisma.lg_pets.update({
    where: { userid: userId },
    data: { food, bath, sleep, last_decay_at: new Date() },
  })

  return {
    food,
    bath,
    sleep,
    ...computeMood(food, bath, sleep),
    nextDecayAt: new Date(
      now + DECAY_INTERVAL_HOURS * 3600 * 1000
    ).toISOString(),
  }
}
