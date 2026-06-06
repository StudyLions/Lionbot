// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared marketplace logic for the Anki addon (browse / my-listings
//          reads + list / buy / cancel writes). Faithfully mirrors the
//          website's pages/api/pet/marketplace/{buy,list,cancel}.ts —
//          including the TOCTOU-safe SELECT … FOR UPDATE locking on the
//          listing + both accounts, the tier-aware seller fee, the
//          scroll-preserving item transfer, and the dual audit logs — so
//          the addon's bearer path is exactly as money-safe as the web.
//
//          NOTE: the web money routes are NOT yet refactored to delegate
//          here (prudent for live-money code); this service is the
//          validated path for the BEARER routes. Reconcile web -> delegate
//          in the final-release pass.
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError, assertIntId } from "@/lib/pet/careService"
import {
  getExpiresAt,
  MAX_PRICE_PER_UNIT,
  snapshotScrollSlots,
  computeTotalBonus,
  restoreInventoryWithScrolls,
  expireListingsDebounced,
  notifySellerDM,
  type ScrollSlotSnapshot,
} from "@/utils/marketplace"
import { getUserTier, getMaxActiveListings, getMarketplaceFeePercent, type LionHeartTier } from "@/utils/subscription"
import { sendGemAuditLog } from "@/utils/discordAudit"

const SAFE_TOTAL = 2_000_000_000

// ============================== READS ==============================

export async function browseMarketplace(
  userId: bigint,
  opts: { search?: string; rarity?: string; currency?: string; sort?: string; page?: number; pageSize?: number }
) {
  await expireListingsDebounced().catch(() => {})
  const take = Math.min(Math.max(Number(opts.pageSize) || 30, 1), 50)
  const page = Math.max(Number(opts.page) || 1, 1)

  const where: any = { status: "ACTIVE", expires_at: { gt: new Date() } }
  if (opts.currency === "GOLD" || opts.currency === "GEMS") where.currency = opts.currency
  const itemWhere: any = {}
  if (opts.rarity) itemWhere.rarity = opts.rarity
  if (opts.search) itemWhere.name = { contains: opts.search, mode: "insensitive" }
  if (Object.keys(itemWhere).length) where.lg_items = itemWhere

  const orderBy =
    opts.sort === "price_asc" ? { price_per_unit: "asc" as const }
    : opts.sort === "price_desc" ? { price_per_unit: "desc" as const }
    : opts.sort === "ending_soon" ? { expires_at: "asc" as const }
    : { created_at: "desc" as const }

  const [rows, total] = await Promise.all([
    prisma.lg_marketplace_listings.findMany({
      where, orderBy, take, skip: (page - 1) * take,
      include: { lg_items: { select: { name: true, rarity: true, category: true, asset_path: true } } },
    }),
    prisma.lg_marketplace_listings.count({ where }),
  ])

  const sellerIds = Array.from(new Set(rows.map((r) => r.seller_userid)))
  const sellers = sellerIds.length
    ? await prisma.user_config.findMany({ where: { userid: { in: sellerIds } }, select: { userid: true, name: true } })
    : []
  const sMap = new Map(sellers.map((s) => [s.userid.toString(), s.name]))

  return {
    listings: rows.map((r) => ({
      listingId: r.listingid,
      sellerId: r.seller_userid.toString(),
      sellerName: sMap.get(r.seller_userid.toString()) ?? null,
      isMine: r.seller_userid === userId,
      itemName: r.lg_items.name,
      rarity: r.lg_items.rarity,
      category: r.lg_items.category,
      assetPath: r.lg_items.asset_path,
      enhancementLevel: r.enhancement_level,
      totalBonus: r.total_bonus,
      pricePerUnit: r.price_per_unit,
      currency: r.currency,
      quantityRemaining: r.quantity_remaining,
      expiresAt: r.expires_at.toISOString(),
    })),
    total, page, pageSize: take,
  }
}

export async function getMyListings(userId: bigint) {
  await expireListingsDebounced().catch(() => {})
  const active = await prisma.lg_marketplace_listings.findMany({
    where: { seller_userid: userId, status: "ACTIVE" },
    orderBy: { created_at: "desc" },
    include: { lg_items: { select: { name: true, rarity: true, category: true, asset_path: true } } },
  })
  return {
    active: active.map((r) => ({
      listingId: r.listingid,
      itemName: r.lg_items.name,
      rarity: r.lg_items.rarity,
      category: r.lg_items.category,
      assetPath: r.lg_items.asset_path,
      enhancementLevel: r.enhancement_level,
      pricePerUnit: r.price_per_unit,
      currency: r.currency,
      quantityRemaining: r.quantity_remaining,
      expiresAt: r.expires_at.toISOString(),
    })),
  }
}

// ============================== WRITES ==============================

export async function createListing(
  userId: bigint,
  params: { itemId?: number; quantity?: number; pricePerUnit?: number; currency?: string; enhancementLevel?: number }
) {
  const itemId = assertIntId(params.itemId, "itemId")
  const quantity = Math.floor(Number(params.quantity))
  const pricePerUnit = Math.floor(Number(params.pricePerUnit))
  const enhancementLevel = Math.floor(Number(params.enhancementLevel ?? 0))
  const currency = params.currency

  if (!itemId || !Number.isFinite(quantity) || quantity < 1) throw new PetServiceError(400, "bad_quantity", "Quantity must be a positive integer")
  if (!Number.isFinite(pricePerUnit) || pricePerUnit < 1) throw new PetServiceError(400, "bad_price", "Price must be at least 1")
  if (pricePerUnit > MAX_PRICE_PER_UNIT) throw new PetServiceError(400, "price_too_high", `Price cannot exceed ${MAX_PRICE_PER_UNIT.toLocaleString()}`)
  if (currency !== "GOLD" && currency !== "GEMS") throw new PetServiceError(400, "bad_currency", "Currency must be GOLD or GEMS")
  if (pricePerUnit * quantity > SAFE_TOTAL) throw new PetServiceError(400, "total_too_high", "Total listing value exceeds maximum safe value")

  const item = await prisma.lg_items.findUnique({ where: { itemid: itemId } })
  if (!item) throw new PetServiceError(404, "item_not_found", "Item not found")
  if (!item.tradeable) throw new PetServiceError(400, "not_tradeable", "This item cannot be traded")

  const sellerTier = await getUserTier(userId)
  const cap = getMaxActiveListings(sellerTier)

  await prisma.$transaction(async (tx) => {
    const activeCount = await tx.lg_marketplace_listings.count({ where: { seller_userid: userId, status: "ACTIVE" } })
    if (activeCount >= cap) {
      throw new PetServiceError(403, "listing_cap", `You have ${activeCount} active listings (your limit is ${cap}). Wait for some to sell or expire.`)
    }
    const equipped = await tx.lg_pet_equipment.findFirst({ where: { userid: userId, itemid: itemId } })
    if (equipped) throw new PetServiceError(400, "equipped", "Unequip this item before listing it for sale")

    const inventoryRows = await tx.$queryRaw<any[]>`
      SELECT * FROM lg_user_inventory
      WHERE userid = ${userId} AND itemid = ${itemId} AND enhancement_level = ${enhancementLevel}
      FOR UPDATE
    `
    const inventoryRow = inventoryRows[0]
    if (!inventoryRow || inventoryRow.quantity < quantity) {
      throw new PetServiceError(400, "insufficient_qty", `You don't have enough of this item (have ${inventoryRow?.quantity ?? 0}, need ${quantity})`)
    }
    if (inventoryRow.is_locked) throw new PetServiceError(400, "item_locked", "This item is locked. Unlock it from your inventory before selling.")

    const rawSlots = await tx.lg_enhancement_slots.findMany({
      where: { inventoryid: inventoryRow.inventoryid },
      orderBy: { slot_number: "asc" },
      include: { lg_items: { select: { name: true, lg_scroll_properties: { select: { success_rate: true } } } } },
    })
    const scrollData = rawSlots.length > 0 ? snapshotScrollSlots(rawSlots) : null
    const totalBonus = computeTotalBonus(scrollData)

    if (inventoryRow.quantity === quantity) {
      await tx.lg_user_inventory.delete({ where: { inventoryid: inventoryRow.inventoryid } })
    } else {
      await tx.lg_user_inventory.update({ where: { inventoryid: inventoryRow.inventoryid }, data: { quantity: { decrement: quantity } } })
    }

    await tx.lg_marketplace_listings.create({
      data: {
        seller_userid: userId, itemid: itemId, enhancement_level: enhancementLevel,
        quantity_listed: quantity, quantity_remaining: quantity, price_per_unit: pricePerUnit,
        currency, status: "ACTIVE", expires_at: getExpiresAt(sellerTier),
        scroll_data: scrollData ? (scrollData as any) : undefined, total_bonus: totalBonus,
      },
    })
  })

  return { success: true, message: `Listed ${quantity}x ${item.name} for ${pricePerUnit} ${currency} each` }
}

export async function buyListing(userId: bigint, listingIdRaw: unknown, quantityRaw: unknown) {
  const buyerId = userId
  const listingId = Math.floor(Number(listingIdRaw))
  const quantity = Math.floor(Number(quantityRaw))
  if (!listingId || !Number.isFinite(quantity) || quantity < 1) {
    throw new PetServiceError(400, "bad_input", "Missing listingId or invalid quantity")
  }

  const result = await prisma.$transaction(async (tx) => {
    const listings = await tx.$queryRaw<any[]>`
      SELECT l.*, i.name as item_name
      FROM lg_marketplace_listings l
      JOIN lg_items i ON i.itemid = l.itemid
      WHERE l.listingid = ${listingId}
      FOR UPDATE OF l
    `
    const listing = listings[0]
    if (!listing) throw new PetServiceError(404, "not_found", "Listing not found")
    if (listing.status !== "ACTIVE") throw new PetServiceError(400, "not_active", "Listing is no longer active")
    if (new Date() > new Date(listing.expires_at)) throw new PetServiceError(400, "expired", "Listing has expired")
    if (listing.quantity_remaining < quantity) throw new PetServiceError(400, "insufficient_stock", `Only ${listing.quantity_remaining} available`)
    const sellerUserId = BigInt(listing.seller_userid)
    if (sellerUserId === buyerId) throw new PetServiceError(400, "own_listing", "You cannot buy your own listing")

    const totalPrice = listing.price_per_unit * quantity
    if (totalPrice > SAFE_TOTAL) throw new PetServiceError(400, "total_too_high", "Total price exceeds maximum safe value")

    const sellerSubRow = await tx.user_subscriptions.findUnique({ where: { userid: sellerUserId }, select: { tier: true, status: true } })
    let sellerTier: LionHeartTier = "FREE"
    if (sellerSubRow && (sellerSubRow.status === "ACTIVE" || sellerSubRow.status === "CANCELLING") &&
        (sellerSubRow.tier === "LIONHEART" || sellerSubRow.tier === "LIONHEART_PLUS" || sellerSubRow.tier === "LIONHEART_PLUS_PLUS")) {
      sellerTier = sellerSubRow.tier
    }
    const fee = Math.floor((totalPrice * getMarketplaceFeePercent(sellerTier)) / 100)
    const sellerReceives = totalPrice - fee

    const buyers = await tx.$queryRaw<any[]>`SELECT * FROM user_config WHERE userid = ${buyerId} FOR UPDATE`
    const buyer = buyers[0]
    if (!buyer) throw new PetServiceError(400, "no_account", "Buyer account not found")
    if (listing.currency === "GOLD") {
      if (Number(buyer.gold) < totalPrice) throw new PetServiceError(400, "insufficient_gold", `Not enough Gold (have ${buyer.gold}, need ${totalPrice})`)
    } else {
      if ((buyer.gems ?? 0) < totalPrice) throw new PetServiceError(400, "insufficient_gems", `Not enough Gems (have ${buyer.gems ?? 0}, need ${totalPrice})`)
    }
    await tx.$queryRaw`SELECT 1 FROM user_config WHERE userid = ${sellerUserId} FOR UPDATE`

    const newRemaining = listing.quantity_remaining - quantity
    const newStatus = newRemaining === 0 ? "SOLD" : "ACTIVE"

    if (listing.currency === "GOLD") {
      await tx.user_config.update({ where: { userid: buyerId }, data: { gold: { decrement: totalPrice } } })
      await tx.user_config.update({ where: { userid: sellerUserId }, data: { gold: { increment: sellerReceives } } })
      await tx.lg_gold_transactions.create({ data: { transaction_type: "MARKETPLACE_PURCHASE", actorid: buyerId, from_account: buyerId, to_account: sellerUserId, amount: totalPrice, description: `Bought ${quantity}x ${listing.item_name}` } })
      await tx.lg_gold_transactions.create({ data: { transaction_type: "MARKETPLACE_SALE", actorid: buyerId, from_account: buyerId, to_account: sellerUserId, amount: sellerReceives, description: `Sold ${quantity}x ${listing.item_name}${fee > 0 ? ` (fee: ${fee})` : ""}` } })
    } else {
      await tx.user_config.update({ where: { userid: buyerId }, data: { gems: { decrement: totalPrice } } })
      await tx.user_config.update({ where: { userid: sellerUserId }, data: { gems: { increment: sellerReceives } } })
      await tx.gem_transactions.create({ data: { transaction_type: "PURCHASE", actorid: buyerId, from_account: buyerId, to_account: sellerUserId, amount: totalPrice, description: `Marketplace: Bought ${quantity}x ${listing.item_name}` } })
      await tx.gem_transactions.create({ data: { transaction_type: "PURCHASE", actorid: sellerUserId, from_account: buyerId, to_account: sellerUserId, amount: sellerReceives, description: `Marketplace: Sold ${quantity}x ${listing.item_name}${fee > 0 ? ` (fee: ${fee})` : ""}` } })
    }

    const scrollData: ScrollSlotSnapshot[] | null = listing.scroll_data ?? null
    const listingTotalBonus: number = listing.total_bonus ?? 0
    await restoreInventoryWithScrolls(tx, buyerId, listing.itemid, listing.enhancement_level, quantity, scrollData)

    await tx.lg_marketplace_listings.update({ where: { listingid: listingId }, data: { quantity_remaining: newRemaining, status: newStatus } })
    await tx.lg_marketplace_sales.create({
      data: {
        listingid: listingId, buyer_userid: buyerId, seller_userid: sellerUserId, itemid: listing.itemid,
        enhancement_level: listing.enhancement_level, quantity, price_per_unit: listing.price_per_unit,
        total_price: totalPrice, currency: listing.currency,
        scroll_data: scrollData ? (scrollData as any) : undefined, total_bonus: listingTotalBonus,
      },
    })

    return {
      itemName: listing.item_name as string,
      buyerName: (buyer.name ?? `Player${buyerId.toString().slice(-4)}`) as string,
      sellerUserId: sellerUserId.toString(),
      currency: listing.currency as string,
      totalPrice, sellerReceives, fee, newRemaining,
    }
  })

  notifySellerDM({
    sellerUserId: result.sellerUserId, buyerName: result.buyerName, itemName: result.itemName,
    quantity, totalPrice: result.sellerReceives, currency: result.currency, remaining: result.newRemaining,
  }).catch(() => {})
  if (result.currency === "GEMS") {
    sendGemAuditLog({ transactionType: "PURCHASE", amount: result.totalPrice, actorId: buyerId.toString(), fromAccount: buyerId.toString(), toAccount: result.sellerUserId, description: `Marketplace: Bought ${quantity}x ${result.itemName}` })
    sendGemAuditLog({ transactionType: "PURCHASE", amount: result.sellerReceives, actorId: result.sellerUserId, fromAccount: buyerId.toString(), toAccount: result.sellerUserId, description: `Marketplace: Sold ${quantity}x ${result.itemName}${result.fee > 0 ? ` (fee: ${result.fee})` : ""}` })
  }

  return {
    success: true,
    message: `Bought ${quantity}x ${result.itemName} for ${result.totalPrice} ${result.currency}${result.fee > 0 ? ` (${result.fee} fee)` : ""}`,
    totalPrice: result.totalPrice, currency: result.currency,
  }
}

export async function cancelListing(userId: bigint, listingIdRaw: unknown) {
  const listingId = Math.floor(Number(listingIdRaw))
  if (!listingId) throw new PetServiceError(400, "bad_input", "Missing listingId")

  const result = await prisma.$transaction(async (tx) => {
    const listings = await tx.$queryRaw<any[]>`
      SELECT l.*, i.name as item_name
      FROM lg_marketplace_listings l
      JOIN lg_items i ON i.itemid = l.itemid
      WHERE l.listingid = ${listingId}
      FOR UPDATE OF l
    `
    const listing = listings[0]
    if (!listing) throw new PetServiceError(404, "not_found", "Listing not found")
    if (BigInt(listing.seller_userid) !== userId) throw new PetServiceError(403, "not_yours", "Not your listing")
    if (listing.status !== "ACTIVE") throw new PetServiceError(400, "not_active", "Listing is not active")

    await tx.lg_marketplace_listings.update({ where: { listingid: listingId }, data: { status: "CANCELLED" } })
    const scrollData: ScrollSlotSnapshot[] | null = listing.scroll_data ?? null
    await restoreInventoryWithScrolls(tx, userId, listing.itemid, listing.enhancement_level, listing.quantity_remaining, scrollData)

    return { quantityRemaining: listing.quantity_remaining, itemName: listing.item_name as string }
  })

  return { success: true, message: `Cancelled listing. ${result.quantityRemaining}x ${result.itemName} returned to your inventory.` }
}
