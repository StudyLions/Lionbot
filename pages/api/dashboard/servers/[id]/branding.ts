// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Guild branding API - GET (mod+) returns skin config,
//          PATCH (admin + premium) updates custom skin
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const AVAILABLE_SKINS = [
  "original",
  "obsidian",
  "platinum",
  "boston_blue",
  "cotton_candy",
  "blue_bayoux",
  "bubblegum",
]

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const premium = await prisma.premium_guilds.findUnique({
      where: { guildid: guildId },
      select: { premium_until: true, custom_skin_id: true },
    })

    const now = new Date()
    const isPremium = premium && premium.premium_until > now
    const premiumUntil = premium?.premium_until?.toISOString() ?? null

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: return saved properties even if premium expired (so users see their old design on renewal)
    let baseSkinName: string | null = null
    const properties: Record<string, Record<string, string>> = {}

    if (premium?.custom_skin_id) {
      const skin = await prisma.customised_skins.findUnique({
        where: { custom_skin_id: premium.custom_skin_id },
        include: {
          customised_skin_properties: {
            include: { customised_skin_property_ids: true },
          },
          global_available_skins: true,
        },
      })

      if (skin) {
        baseSkinName = skin.global_available_skins?.skin_name ?? null
        if (skin.base_skin_id && !baseSkinName) {
          const baseSkin = await prisma.global_available_skins.findUnique({
            where: { skin_id: skin.base_skin_id },
          })
          baseSkinName = baseSkin?.skin_name ?? null
        }

        for (const prop of skin.customised_skin_properties) {
          const cardId = prop.customised_skin_property_ids.card_id
          const propName = prop.customised_skin_property_ids.property_name
          if (!properties[cardId]) properties[cardId] = {}
          properties[cardId][propName] = prop.value
        }
      }
    }
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      isPremium,
      premiumUntil,
      baseSkinName,
      properties,
      availableSkins: AVAILABLE_SKINS,
    })
  },

  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const premium = await prisma.premium_guilds.findUnique({
      where: { guildid: guildId },
      select: { premium_until: true, custom_skin_id: true },
    })

    const now = new Date()
    const isPremium = premium && premium.premium_until > now
    if (!isPremium) {
      return res.status(403).json({
        error: "Premium required",
        needsPremium: true,
      })
    }

    const { baseSkinName, properties } = req.body as {
      baseSkinName?: string
      properties?: Record<string, Record<string, string>>
    }

    let customSkinId = premium.custom_skin_id

    if (!customSkinId) {
      const newSkin = await prisma.customised_skins.create({
        data: { base_skin_id: null },
      })
      customSkinId = newSkin.custom_skin_id
      await prisma.premium_guilds.update({
        where: { guildid: guildId },
        data: { custom_skin_id: customSkinId },
      })
    }

    if (baseSkinName != null) {
      const baseSkin = await prisma.global_available_skins.findFirst({
        where: { skin_name: baseSkinName },
      })
      if (baseSkin) {
        await prisma.customised_skins.update({
          where: { custom_skin_id: customSkinId },
          data: { base_skin_id: baseSkin.skin_id },
        })
      }
    }

    if (properties && typeof properties === "object") {
      for (const [cardId, cardProps] of Object.entries(properties)) {
        if (typeof cardProps !== "object") continue
        for (const [propName, value] of Object.entries(cardProps)) {
          if (typeof value !== "string") continue

          const existing = await prisma.customised_skin_property_ids.findUnique({
            where: {
              card_id_property_name: { card_id: cardId, property_name: propName },
            },
          })

          let propertyId: number
          if (existing) {
            propertyId = existing.property_id
          } else {
            const created = await prisma.customised_skin_property_ids.create({
              data: { card_id: cardId, property_name: propName },
            })
            propertyId = created.property_id
          }

          await prisma.customised_skin_properties.upsert({
            where: {
              custom_skin_id_property_id: {
                custom_skin_id: customSkinId,
                property_id: propertyId,
              },
            },
            create: {
              custom_skin_id: customSkinId,
              property_id: propertyId,
              value,
            },
            update: { value },
          })
        }
      }
    }

    return res.status(200).json({ success: true })
  },
})
