// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared, transport-agnostic gameboy-skin logic — used by BOTH
//          the website (pages/api/pet/skins/{index,equip}.ts, NextAuth)
//          and the Anki addon (pages/api/anki/pet/skins.ts, bearer).
//          Fully user-scoped. Equipping validates unlock eligibility
//          (FREE / LEVEL / owned for GOLD|GEMS) server-side — the client
//          only ever sends a skinId.
//
//          listSkins(userId)        -> all skins + ownership/eligibility/active
//          equipSkin(userId, skinId)-> set active_gameboy_skin_id (validated)
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"
import { sendGemAuditLog } from "@/utils/discordAudit"

export async function listSkins(userId: bigint) {
  const [allSkins, pet, userConfig, ownedRows] = await Promise.all([
    prisma.lg_gameboy_skins.findMany({ orderBy: [{ theme: "asc" }, { color: "asc" }] }),
    prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { level: true, active_gameboy_skin_id: true },
    }),
    prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true, gems: true },
    }),
    prisma.lg_user_gameboy_skins.findMany({
      where: { userid: userId },
      select: { skin_id: true },
    }),
  ])

  if (!pet) {
    return { hasPet: false, skins: [], themes: [] as string[] }
  }

  const ownedSet = new Set(ownedRows.map((r) => r.skin_id))
  const petLevel = pet.level
  const gold = Number(userConfig?.gold ?? BigInt(0))
  const gems = userConfig?.gems ?? 0
  const activeSkinId = pet.active_gameboy_skin_id

  const skins = allSkins.map((s) => {
    const unlockType = String(s.unlock_type)
    const isActive = s.skin_id === activeSkinId
    let owned = false
    let eligible = false
    if (unlockType === "FREE") {
      owned = true
      eligible = true
    } else if (unlockType === "LEVEL") {
      eligible = petLevel >= (s.unlock_level ?? 999)
      owned = eligible
    } else if (unlockType === "GOLD") {
      owned = ownedSet.has(s.skin_id)
      eligible = owned || gold >= (s.gold_price ?? 0)
    } else if (unlockType === "GEMS") {
      owned = ownedSet.has(s.skin_id)
      eligible = owned || gems >= (s.gem_price ?? 0)
    }
    return {
      skinId: s.skin_id,
      theme: s.theme,
      color: s.color,
      assetPath: s.asset_path,
      unlockType,
      unlockLevel: s.unlock_level,
      goldPrice: s.gold_price,
      gemPrice: s.gem_price,
      owned,
      eligible,
      active: isActive,
    }
  })

  const themes = Array.from(new Set(allSkins.map((s) => s.theme)))
  return {
    hasPet: true,
    skins,
    themes,
    activeSkinId,
    petLevel,
    gold: gold.toString(),
    gems,
  }
}

export async function equipSkin(userId: bigint, rawSkinId: unknown) {
  if (typeof rawSkinId !== "number" || !Number.isInteger(rawSkinId)) {
    throw new PetServiceError(400, "bad_skin_id", "skinId (number) required")
  }
  const skinId = rawSkinId

  const [skin, pet] = await Promise.all([
    prisma.lg_gameboy_skins.findUnique({ where: { skin_id: skinId } }),
    prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { level: true, active_gameboy_skin_id: true },
    }),
  ])

  if (!skin) throw new PetServiceError(404, "skin_not_found", "Skin not found")
  if (!pet) throw new PetServiceError(400, "no_pet", "You don't have a pet yet")

  const unlockType = String(skin.unlock_type)
  if (unlockType === "FREE") {
    // Always allowed.
  } else if (unlockType === "LEVEL") {
    if (pet.level < (skin.unlock_level ?? 999)) {
      throw new PetServiceError(
        400,
        "level_too_low",
        `Your pet needs to be level ${skin.unlock_level} to use this skin (currently level ${pet.level})`
      )
    }
  } else {
    const owned = await prisma.lg_user_gameboy_skins.findUnique({
      where: { userid_skin_id: { userid: userId, skin_id: skinId } },
    })
    if (!owned) {
      throw new PetServiceError(400, "skin_not_owned", "You don't own this skin. Purchase it first.")
    }
  }

  await prisma.lg_pets.update({
    where: { userid: userId },
    data: { active_gameboy_skin_id: skinId },
  })
  return { success: true, activeSkinId: skinId, assetPath: skin.asset_path }
}

/** Purchase a GOLD/GEMS skin (server-checked affordability under a
 *  SELECT … FOR UPDATE row lock), grant ownership, and auto-equip. */
export async function purchaseSkin(userId: bigint, rawSkinId: unknown) {
  if (typeof rawSkinId !== "number" || !Number.isInteger(rawSkinId)) {
    throw new PetServiceError(400, "bad_skin_id", "skinId (number) required")
  }
  const skinId = rawSkinId

  const [skin, pet, alreadyOwned] = await Promise.all([
    prisma.lg_gameboy_skins.findUnique({ where: { skin_id: skinId } }),
    prisma.lg_pets.findUnique({ where: { userid: userId }, select: { level: true } }),
    prisma.lg_user_gameboy_skins.findUnique({
      where: { userid_skin_id: { userid: userId, skin_id: skinId } },
    }),
  ])
  if (!skin) throw new PetServiceError(404, "skin_not_found", "Skin not found")
  if (!pet) throw new PetServiceError(400, "no_pet", "You don't have a pet yet")
  const unlockType = String(skin.unlock_type)
  if (unlockType === "FREE") throw new PetServiceError(400, "free_skin", "This skin is free — just equip it")
  if (unlockType === "LEVEL") throw new PetServiceError(400, "level_skin", "This skin unlocks at a certain level — equip it if eligible")
  if (alreadyOwned) throw new PetServiceError(400, "already_owned", "You already own this skin")

  if (unlockType === "GOLD") {
    const price = skin.gold_price ?? 0
    const result = await prisma.$transaction(async (tx) => {
      const [locked] = await tx.$queryRawUnsafe<{ gold: bigint }[]>(
        `SELECT gold FROM user_config WHERE userid = $1 FOR UPDATE`, userId
      )
      if (!locked || Number(locked.gold) < price) {
        return { error: `Not enough gold. Need ${price - Number(locked?.gold ?? 0)} more.` }
      }
      const goldResult = await tx.$queryRawUnsafe<{ gold: bigint }[]>(
        `UPDATE user_config SET gold = gold - $2 WHERE userid = $1 AND gold >= $2 RETURNING gold`,
        userId, BigInt(price)
      )
      if (goldResult.length === 0) return { error: "Insufficient gold (race condition)" }
      await tx.lg_gold_transactions.create({
        data: {
          transaction_type: "SHOP_PURCHASE", actorid: userId, from_account: userId,
          amount: price, description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
        },
      })
      await tx.lg_user_gameboy_skins.create({ data: { userid: userId, skin_id: skinId } })
      await tx.lg_pets.update({ where: { userid: userId }, data: { active_gameboy_skin_id: skinId } })
      const updated = await tx.user_config.findUnique({
        where: { userid: userId }, select: { gold: true, gems: true },
      })
      return {
        success: true,
        newGold: (updated?.gold ?? BigInt(0)).toString(),
        newGems: updated?.gems ?? 0,
        activeSkinId: skinId,
      }
    }).catch((err: unknown) => {
      // PK (userid, skin_id): a racing second purchase hits a unique violation,
      // rolling back its debit — surface it as a clean already_owned, not a 500.
      if ((err as { code?: string }).code === "P2002") {
        throw new PetServiceError(400, "already_owned", "You already own this skin")
      }
      throw err
    })
    if ("error" in result) throw new PetServiceError(400, "insufficient_gold", result.error as string)
    return result
  }

  if (unlockType === "GEMS") {
    const price = skin.gem_price ?? 0
    const result = await prisma.$transaction(async (tx) => {
      const [locked] = await tx.$queryRawUnsafe<{ gems: number }[]>(
        `SELECT gems FROM user_config WHERE userid = $1 FOR UPDATE`, userId
      )
      if (!locked || locked.gems < price) {
        return { error: `Not enough gems. Need ${price - (locked?.gems ?? 0)} more.` }
      }
      const gemsResult = await tx.$queryRawUnsafe<{ gems: number }[]>(
        `UPDATE user_config SET gems = gems - $2 WHERE userid = $1 AND gems >= $2 RETURNING gems`,
        userId, price
      )
      if (gemsResult.length === 0) return { error: "Insufficient gems (race condition)" }
      await tx.gem_transactions.create({
        data: {
          transaction_type: "PURCHASE", actorid: userId, from_account: userId,
          amount: price, description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
        },
      })
      await tx.lg_user_gameboy_skins.create({ data: { userid: userId, skin_id: skinId } })
      await tx.lg_pets.update({ where: { userid: userId }, data: { active_gameboy_skin_id: skinId } })
      const updated = await tx.user_config.findUnique({
        where: { userid: userId }, select: { gold: true, gems: true },
      })
      return {
        success: true,
        newGold: (updated?.gold ?? BigInt(0)).toString(),
        newGems: updated?.gems ?? 0,
        activeSkinId: skinId,
      }
    }).catch((err: unknown) => {
      if ((err as { code?: string }).code === "P2002") {
        throw new PetServiceError(400, "already_owned", "You already own this skin")
      }
      throw err
    })
    if ("error" in result) throw new PetServiceError(400, "insufficient_gems", result.error as string)
    // Fire-and-forget gem audit (both transports).
    sendGemAuditLog({
      transactionType: "PURCHASE",
      amount: price,
      actorId: userId.toString(),
      fromAccount: userId.toString(),
      toAccount: null,
      description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
    })
    return result
  }

  throw new PetServiceError(400, "bad_unlock_type", "Invalid skin unlock type")
}
