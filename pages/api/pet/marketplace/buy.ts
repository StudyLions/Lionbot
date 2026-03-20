// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Buy from a marketplace listing - atomic transaction
//          deducts currency, credits seller, transfers items,
//          records sale, sends DM notification
// ============================================================

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Fix TOCTOU race condition by moving all reads inside
//          transaction with SELECT FOR UPDATE row locking.
//          Add integer validation, inventory upsert, gem audit trail,
//          marketplace fee, overflow guard, and rate limiting.
// --- Original code (commented out for rollback) ---
// import { prisma } from "@/utils/prisma"
// import { getAuthContext } from "@/utils/adminAuth"
// import { apiHandler } from "@/utils/apiHandler"
// import { notifySellerDM } from "@/utils/marketplace"
//
// export default apiHandler({
//   async POST(req, res) {
//     const auth = await getAuthContext(req)
//     if (!auth) return res.status(401).json({ error: "Not authenticated" })
//     const buyerId = BigInt(auth.discordId)
//
//     const { listingId, quantity } = req.body
//     if (!listingId || !quantity || quantity < 1) {
//       return res.status(400).json({ error: "Missing listingId or invalid quantity" })
//     }
//
//     const listing = await prisma.lg_marketplace_listings.findUnique({
//       where: { listingid: listingId },
//       include: { lg_items: true },
//     })
//     if (!listing) return res.status(404).json({ error: "Listing not found" })
//     if (listing.status !== "ACTIVE") return res.status(400).json({ error: "Listing is no longer active" })
//     if (new Date() > listing.expires_at) return res.status(400).json({ error: "Listing has expired" })
//     if (listing.quantity_remaining < quantity) {
//       return res.status(400).json({ error: `Only ${listing.quantity_remaining} available` })
//     }
//     if (listing.seller_userid === buyerId) {
//       return res.status(400).json({ error: "You cannot buy your own listing" })
//     }
//
//     const totalPrice = listing.price_per_unit * quantity
//     const buyer = await prisma.user_config.findUnique({ where: { userid: buyerId } })
//     if (!buyer) return res.status(400).json({ error: "Buyer account not found" })
//
//     if (listing.currency === "GOLD") {
//       if (Number(buyer.gold) < totalPrice) return res.status(400).json({ error: `Not enough Gold (have ${buyer.gold}, need ${totalPrice})` })
//     } else {
//       if ((buyer.gems ?? 0) < totalPrice) return res.status(400).json({ error: `Not enough Gems (have ${buyer.gems ?? 0}, need ${totalPrice})` })
//     }
//
//     const newRemaining = listing.quantity_remaining - quantity
//     const newStatus = newRemaining === 0 ? "SOLD" : "ACTIVE"
//
//     await prisma.$transaction(async (tx) => {
//       if (listing.currency === "GOLD") {
//         await tx.user_config.update({ where: { userid: buyerId }, data: { gold: { decrement: totalPrice } } })
//         await tx.user_config.update({ where: { userid: listing.seller_userid }, data: { gold: { increment: totalPrice } } })
//         await tx.lg_gold_transactions.create({
//           data: { transaction_type: "MARKETPLACE_PURCHASE", actorid: buyerId, from_account: buyerId, to_account: listing.seller_userid, amount: totalPrice, description: `Bought ${quantity}x ${listing.lg_items.name}` },
//         })
//         await tx.lg_gold_transactions.create({
//           data: { transaction_type: "MARKETPLACE_SALE", actorid: buyerId, from_account: buyerId, to_account: listing.seller_userid, amount: totalPrice, description: `Sold ${quantity}x ${listing.lg_items.name}` },
//         })
//       } else {
//         await tx.user_config.update({ where: { userid: buyerId }, data: { gems: { decrement: totalPrice } } })
//         await tx.user_config.update({ where: { userid: listing.seller_userid }, data: { gems: { increment: totalPrice } } })
//         await tx.gem_transactions.create({
//           data: { transaction_type: "PURCHASE", actorid: buyerId, from_account: buyerId, to_account: listing.seller_userid, amount: totalPrice, description: `Marketplace: Bought ${quantity}x ${listing.lg_items.name}` },
//         })
//       }
//
//       await tx.lg_user_inventory.create({
//         data: {
//           userid: buyerId,
//           itemid: listing.itemid,
//           enhancement_level: listing.enhancement_level,
//           quantity,
//           source: "TRADE",
//         },
//       })
//
//       await tx.lg_marketplace_listings.update({
//         where: { listingid: listingId },
//         data: { quantity_remaining: newRemaining, status: newStatus },
//       })
//
//       await tx.lg_marketplace_sales.create({
//         data: {
//           listingid: listingId,
//           buyer_userid: buyerId,
//           seller_userid: listing.seller_userid,
//           itemid: listing.itemid,
//           enhancement_level: listing.enhancement_level,
//           quantity,
//           price_per_unit: listing.price_per_unit,
//           total_price: totalPrice,
//           currency: listing.currency,
//         },
//       })
//     })
//
//     const buyerName = buyer.name ?? `Player${auth.discordId.slice(-4)}`
//     notifySellerDM({
//       sellerUserId: listing.seller_userid.toString(),
//       buyerName,
//       itemName: listing.lg_items.name,
//       quantity,
//       totalPrice,
//       currency: listing.currency,
//       remaining: newRemaining,
//     }).catch(() => {})
//
//     return res.status(200).json({
//       success: true,
//       message: `Bought ${quantity}x ${listing.lg_items.name} for ${totalPrice} ${listing.currency}`,
//     })
//   },
// })
// --- End original code ---

import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { notifySellerDM, MARKETPLACE_FEE_PERCENT, upsertInventory } from "@/utils/marketplace"
import { checkRateLimit } from "@/utils/rateLimit"

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export default apiHandler({
  async POST(req, res) {
    const auth = await getAuthContext(req)
    if (!auth) return res.status(401).json({ error: "Not authenticated" })
    const buyerId = BigInt(auth.discordId)

    const { listingId, quantity: rawQuantity } = req.body
    const quantity = Math.floor(Number(rawQuantity))
    if (!listingId || !Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ error: "Missing listingId or invalid quantity (must be a positive integer)" })
    }

    if (!checkRateLimit(`buy:${auth.discordId}`, 2000)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." })
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const listings = await tx.$queryRaw<any[]>`
          SELECT l.*, i.name as item_name
          FROM lg_marketplace_listings l
          JOIN lg_items i ON i.itemid = l.itemid
          WHERE l.listingid = ${listingId}
          FOR UPDATE OF l
        `
        const listing = listings[0]
        if (!listing) throw new HttpError(404, "Listing not found")
        if (listing.status !== "ACTIVE") throw new HttpError(400, "Listing is no longer active")
        if (new Date() > new Date(listing.expires_at)) throw new HttpError(400, "Listing has expired")
        if (listing.quantity_remaining < quantity) {
          throw new HttpError(400, `Only ${listing.quantity_remaining} available`)
        }
        const sellerUserId = BigInt(listing.seller_userid)
        if (sellerUserId === buyerId) {
          throw new HttpError(400, "You cannot buy your own listing")
        }

        const totalPrice = listing.price_per_unit * quantity
        if (totalPrice > 2_000_000_000) {
          throw new HttpError(400, "Total price exceeds maximum safe value")
        }

        const fee = Math.floor(totalPrice * MARKETPLACE_FEE_PERCENT / 100)
        const sellerReceives = totalPrice - fee

        const buyers = await tx.$queryRaw<any[]>`
          SELECT * FROM user_config WHERE userid = ${buyerId} FOR UPDATE
        `
        const buyer = buyers[0]
        if (!buyer) throw new HttpError(400, "Buyer account not found")

        if (listing.currency === "GOLD") {
          if (Number(buyer.gold) < totalPrice) {
            throw new HttpError(400, `Not enough Gold (have ${buyer.gold}, need ${totalPrice})`)
          }
        } else {
          if ((buyer.gems ?? 0) < totalPrice) {
            throw new HttpError(400, `Not enough Gems (have ${buyer.gems ?? 0}, need ${totalPrice})`)
          }
        }

        await tx.$queryRaw`SELECT 1 FROM user_config WHERE userid = ${sellerUserId} FOR UPDATE`

        const newRemaining = listing.quantity_remaining - quantity
        const newStatus = newRemaining === 0 ? "SOLD" : "ACTIVE"

        if (listing.currency === "GOLD") {
          await tx.user_config.update({ where: { userid: buyerId }, data: { gold: { decrement: totalPrice } } })
          await tx.user_config.update({ where: { userid: sellerUserId }, data: { gold: { increment: sellerReceives } } })
          await tx.lg_gold_transactions.create({
            data: {
              transaction_type: "MARKETPLACE_PURCHASE", actorid: buyerId,
              from_account: buyerId, to_account: sellerUserId,
              amount: totalPrice, description: `Bought ${quantity}x ${listing.item_name}`,
            },
          })
          await tx.lg_gold_transactions.create({
            data: {
              transaction_type: "MARKETPLACE_SALE", actorid: buyerId,
              from_account: buyerId, to_account: sellerUserId,
              amount: sellerReceives,
              description: `Sold ${quantity}x ${listing.item_name}${fee > 0 ? ` (fee: ${fee})` : ""}`,
            },
          })
        } else {
          await tx.user_config.update({ where: { userid: buyerId }, data: { gems: { decrement: totalPrice } } })
          await tx.user_config.update({ where: { userid: sellerUserId }, data: { gems: { increment: sellerReceives } } })
          await tx.gem_transactions.create({
            data: {
              transaction_type: "PURCHASE", actorid: buyerId,
              from_account: buyerId, to_account: sellerUserId,
              amount: totalPrice,
              description: `Marketplace: Bought ${quantity}x ${listing.item_name}`,
            },
          })
          await tx.gem_transactions.create({
            data: {
              transaction_type: "PURCHASE", actorid: sellerUserId,
              from_account: buyerId, to_account: sellerUserId,
              amount: sellerReceives,
              description: `Marketplace: Sold ${quantity}x ${listing.item_name}${fee > 0 ? ` (fee: ${fee})` : ""}`,
            },
          })
        }

        await upsertInventory(tx, buyerId, listing.itemid, listing.enhancement_level, quantity)

        await tx.lg_marketplace_listings.update({
          where: { listingid: listingId },
          data: { quantity_remaining: newRemaining, status: newStatus },
        })

        await tx.lg_marketplace_sales.create({
          data: {
            listingid: listingId,
            buyer_userid: buyerId,
            seller_userid: sellerUserId,
            itemid: listing.itemid,
            enhancement_level: listing.enhancement_level,
            quantity,
            price_per_unit: listing.price_per_unit,
            total_price: totalPrice,
            currency: listing.currency,
          },
        })

        return {
          itemName: listing.item_name as string,
          buyerName: (buyer.name ?? `Player${auth.discordId.slice(-4)}`) as string,
          sellerUserId: sellerUserId.toString(),
          currency: listing.currency as string,
          totalPrice,
          sellerReceives,
          fee,
          newRemaining,
        }
      })

      notifySellerDM({
        sellerUserId: result.sellerUserId,
        buyerName: result.buyerName,
        itemName: result.itemName,
        quantity,
        totalPrice: result.sellerReceives,
        currency: result.currency,
        remaining: result.newRemaining,
      }).catch(() => {})

      return res.status(200).json({
        success: true,
        message: `Bought ${quantity}x ${result.itemName} for ${result.totalPrice} ${result.currency}${result.fee > 0 ? ` (${result.fee} fee)` : ""}`,
      })
    } catch (e: any) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message })
      }
      throw e
    }
  },
})

// --- END AI-MODIFIED ---
