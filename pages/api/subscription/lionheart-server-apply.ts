// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Apply or transfer the LionHeart++ included server
//          premium to a guild. Enforces 7-day cooldown when
//          transferring between guilds.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"
import { recalculateGuildPremium } from "@/utils/premiumUtils"

const TRANSFER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { guildId } = req.body ?? {}

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "guildId is required" })
    }

    let guildIdBig: bigint
    try {
      guildIdBig = BigInt(guildId)
    } catch {
      return res.status(400).json({ error: "Invalid guildId format" })
    }

    const userIdBig = BigInt(auth.discordId)

    const userSub = await prisma.user_subscriptions.findUnique({
      where: { userid: userIdBig },
    })

    if (
      !userSub ||
      userSub.tier !== "LIONHEART_PLUS_PLUS" ||
      (userSub.status !== "ACTIVE" && userSub.status !== "CANCELLING")
    ) {
      return res.status(403).json({
        error: "You need an active LionHeart++ subscription to use this feature",
        code: "NOT_LIONHEART_PLUS_PLUS",
      })
    }

    const guildExists = await prisma.guild_config.findUnique({
      where: { guildid: guildIdBig },
      select: { guildid: true },
    })
    if (!guildExists) {
      return res.status(404).json({
        error: "Server not found or LionBot is not in this server",
      })
    }

    const existing = await prisma.lionheart_server_premium.findUnique({
      where: { userid: userIdBig },
    })

    if (existing?.guildid === guildIdBig) {
      return res.status(200).json({
        success: true,
        message: "Server premium is already applied to this server",
        guildId,
      })
    }

    const isTransfer = existing?.guildid != null
    if (isTransfer && existing?.last_transferred_at) {
      const cooldownEnd = new Date(
        existing.last_transferred_at.getTime() + TRANSFER_COOLDOWN_MS
      )
      if (new Date() < cooldownEnd) {
        return res.status(429).json({
          error: "Transfer cooldown active. You can transfer again after the cooldown period.",
          cooldownEnds: cooldownEnd.toISOString(),
        })
      }
    }

    const oldGuildId = existing?.guildid ?? null
    const periodEnd = userSub.current_period_end || new Date(Date.now() + 30 * 86400000)

    await prisma.$transaction(async (tx) => {
      await tx.lionheart_server_premium.upsert({
        where: { userid: userIdBig },
        create: {
          userid: userIdBig,
          guildid: guildIdBig,
          last_transferred_at: isTransfer ? new Date() : null,
        },
        update: {
          guildid: guildIdBig,
          last_transferred_at: isTransfer ? new Date() : undefined,
          updated_at: new Date(),
        },
      })

      if (oldGuildId) {
        await recalculateGuildPremium(oldGuildId, tx)
      }

      const existingTarget = await tx.premium_guilds.findUnique({
        where: { guildid: guildIdBig },
      })
      if (existingTarget) {
        const newUntil = existingTarget.premium_until > periodEnd
          ? existingTarget.premium_until
          : periodEnd
        await tx.premium_guilds.update({
          where: { guildid: guildIdBig },
          data: { premium_until: newUntil },
        })
      } else {
        await tx.premium_guilds.create({
          data: {
            guildid: guildIdBig,
            premium_since: new Date(),
            premium_until: periodEnd,
          },
        })
      }
    })

    console.log(
      `LionHeart++ server premium ${isTransfer ? "transferred" : "applied"}: user ${auth.discordId} -> guild ${guildId}${oldGuildId ? ` (from guild ${oldGuildId})` : ""}`
    )

    return res.status(200).json({
      success: true,
      guildId,
      oldGuildId: oldGuildId?.toString() ?? null,
      isTransfer,
    })
  } catch (err: unknown) {
    console.error("LionHeart server premium apply error:", err)
    return res.status(500).json({ error: "Failed to apply server premium" })
  }
}
