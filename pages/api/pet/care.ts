// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Pet care endpoint -- feed/bathe/sleep from the website
//          Applies lazy decay first, then care action, enforces cooldowns
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const DECAY_INTERVAL_HOURS = 6
const CARE_COOLDOWN_MS = 120 * 1000
const CARE_BOOST = 2

const cooldowns = new Map<string, number>()

const MOOD_MULTS: Record<number, number> = {
  8: 1.25, 7: 1.20, 6: 1.10, 5: 1.00,
  4: 0.95, 3: 0.85, 2: 0.75, 1: 0.60, 0: 0.50,
}
const MOOD_LABELS: Record<number, string> = {
  8: "Ecstatic", 7: "Ecstatic", 6: "Happy", 5: "Happy",
  4: "Okay", 3: "Okay", 2: "Sad", 1: "Sad", 0: "Fainted",
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { action } = req.body as { action?: string }

    if (!action || !["feed", "bathe", "sleep"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Use: feed, bathe, sleep" })
    }

    const cooldownKey = `${userId}-${action}`
    const lastUse = cooldowns.get(cooldownKey) ?? 0
    const now = Date.now()
    if (now - lastUse < CARE_COOLDOWN_MS) {
      const remaining = Math.ceil((CARE_COOLDOWN_MS - (now - lastUse)) / 1000)
      return res.status(429).json({ error: `Try again in ${remaining}s` })
    }

    const pet = await prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { food: true, bath: true, sleep: true, last_decay_at: true },
    })

    if (!pet) {
      return res.status(404).json({ error: "No pet found. Use /pet in Discord first." })
    }

    const elapsedHours = (now - pet.last_decay_at.getTime()) / (1000 * 3600)
    const decayTicks = Math.floor(elapsedHours / DECAY_INTERVAL_HOURS)
    let food = Math.max(0, pet.food - decayTicks)
    let bath = Math.max(0, pet.bath - decayTicks)
    let sleep = Math.max(0, pet.sleep - decayTicks)

    if (action === "feed") food = Math.min(8, food + CARE_BOOST)
    else if (action === "bathe") bath = Math.min(8, bath + CARE_BOOST)
    else if (action === "sleep") sleep = Math.min(8, sleep + CARE_BOOST)

    await prisma.lg_pets.update({
      where: { userid: userId },
      data: {
        food,
        bath,
        sleep,
        last_decay_at: new Date(),
      },
    })

    cooldowns.set(cooldownKey, now)

    const mood = Math.floor((food + bath + sleep) / 3)
    const moodMult = MOOD_MULTS[mood] ?? 1.0
    const moodLabel = MOOD_LABELS[mood] ?? "Okay"

    return res.status(200).json({
      food,
      bath,
      sleep,
      mood,
      moodLabel,
      moodMult,
      nextDecayAt: new Date(now + DECAY_INTERVAL_HOURS * 3600 * 1000).toISOString(),
    })
  },
})
