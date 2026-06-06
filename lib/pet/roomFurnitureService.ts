// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-06
// Purpose: Shared, server-authoritative ROOM FURNISHING logic for the Anki
//          addon (native "Furnish" picker). Lets a user place a furniture
//          asset into each of the 9 room layers (wall/floor/mat/table/chair/
//          bed/lamp/picture/window) and clear it back to the room default.
//
//          Unlike the web route (pages/api/pet/room/furniture.ts) which
//          trusts the client's {slot, assetPath}, this path is CHEAT-PROOF:
//          a placement is only accepted if the asset is either
//            (a) a colour variant of a room theme the user OWNS, or
//            (b) an owned FURNITURE item whose asset matches that layer.
//          (the advanced free-form drag/scale/flip layout stays on the web.)
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"
import { getRoomDefaults, getRoomVariants, ROOM_THEME_CONFIG } from "@/utils/roomDefaults"

export const ROOM_LAYERS = [
  "wall", "floor", "mat", "table", "chair", "bed", "lamp", "picture", "window",
] as const
export type RoomLayer = (typeof ROOM_LAYERS)[number]

// keyword -> layer, ported verbatim from components/pet/room/FurniturePanel
// (SLOT_FILTERS). An asset belongs to a layer if its path contains one of the
// layer's keywords. This is exactly how the web decides which tab shows an item.
const SLOT_FILTERS: Record<RoomLayer, string[]> = {
  wall: ["wall"],
  floor: ["floor"],
  mat: ["mat", "carpet"],
  table: ["table", "desk", "bench-table", "teatable", "computer-desk", "drums", "guitar", "saxaphone"],
  chair: ["chair", "stool", "benchchair"],
  bed: ["bed", "queensize", "royalbed", "bunk", "cuved"],
  lamp: ["lamp", "plants", "potplant"],
  picture: ["picture"],
  window: ["window"],
}

function isLayer(s: unknown): s is RoomLayer {
  return typeof s === "string" && (ROOM_LAYERS as readonly string[]).includes(s)
}

function assetMatchesLayer(assetPath: string, layer: RoomLayer): boolean {
  const lower = assetPath.toLowerCase()
  return (SLOT_FILTERS[layer] || []).some((kw) => lower.includes(kw))
}

// lg_items stores furniture either as a full "rooms/..." path or a bare
// filename that only exists under rooms/furniture/ on the CDN. Normalise so
// stored placements + render lookups always use a full path.
function normalizeForRoom(assetPath: string): string {
  if (assetPath.startsWith("rooms/")) return assetPath
  return `rooms/furniture/${assetPath}`
}

/** All room-theme variant full-paths for a layer, e.g.
 *  getRoomVariants("rooms/default","wall") -> ["wall_checker_blue", ...] resolved
 *  to ["rooms/default/wall_checker_blue.png", ...]. */
function themeVariantPaths(roomPrefix: string, layer: RoomLayer): string[] {
  return getRoomVariants(roomPrefix, layer).map((v) => `${roomPrefix}/${v}.png`)
}

/**
 * The user's furnishing state for the Furnish picker:
 *  - layers: the 9 layer keys in render order
 *  - current[slot]: the effective asset in that slot (user placement or the
 *    active-room default) + whether it was explicitly placed by the user
 *  - options[slot]: the assets the user may place there — the active room's
 *    colour variants (free, since they own the active room) followed by any
 *    owned FURNITURE shop items that match the layer
 *  - gold/gems for display
 */
export async function getFurnishing(userId: bigint) {
  const [pet, userConfig, ownedRooms, furnitureItems, ownedRows, placedRows] = await Promise.all([
    prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { active_room_id: true },
    }),
    prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true, gems: true },
    }),
    prisma.lg_user_rooms.findMany({ where: { userid: userId }, select: { room_id: true } }),
    prisma.lg_items.findMany({
      where: { category: "FURNITURE" },
      select: { itemid: true, name: true, asset_path: true, rarity: true, gold_price: true, gem_price: true },
      orderBy: { itemid: "asc" },
    }),
    prisma.lg_user_inventory.findMany({ where: { userid: userId }, select: { itemid: true } }),
    prisma.$queryRawUnsafe<{ slot: string; asset_path: string }[]>(
      `SELECT slot, asset_path FROM lg_user_furniture WHERE userid = $1`,
      userId
    ),
  ])

  // Resolve the active room's asset prefix (defaults to rooms/default).
  let activeRoomPrefix = "rooms/default"
  if (pet?.active_room_id) {
    const room = await prisma.lg_rooms.findUnique({
      where: { room_id: pet.active_room_id },
      select: { asset_prefix: true },
    })
    if (room?.asset_prefix) activeRoomPrefix = room.asset_prefix
  }

  const ownedItemIds = new Set(ownedRows.map((r) => r.itemid))

  // Effective current placement per slot: room default, overridden by the
  // user's explicit lg_user_furniture rows.
  const defaults = getRoomDefaults(activeRoomPrefix)
  const placedMap = new Map<string, string>()
  for (const row of placedRows) placedMap.set(row.slot, normalizeForRoom(row.asset_path))

  const current: Record<string, { assetPath: string | null; custom: boolean }> = {}
  for (const layer of ROOM_LAYERS) {
    if (placedMap.has(layer)) current[layer] = { assetPath: placedMap.get(layer)!, custom: true }
    else current[layer] = { assetPath: defaults[layer] ?? null, custom: false }
  }

  // Placement options per layer.
  type Opt = {
    key: string; name: string; assetPath: string; rarity: string
    owned: boolean; kind: "theme" | "item"; goldPrice: number | null; gemPrice: number | null
  }
  const isThemedRoom = activeRoomPrefix !== "rooms/default" && !!ROOM_THEME_CONFIG[activeRoomPrefix]
  const options: Record<string, Opt[]> = {}
  for (const layer of ROOM_LAYERS) {
    const opts: Opt[] = []

    // (a) Colour variants bundled with a themed (non-default) active room —
    //     free to apply because the user already owns the active room.
    if (isThemedRoom) {
      for (const p of themeVariantPaths(activeRoomPrefix, layer)) {
        opts.push({
          key: `theme:${p}`, name: prettyVariantName(p), assetPath: p,
          rarity: "COMMON", owned: true, kind: "theme", goldPrice: null, gemPrice: null,
        })
      }
    }

    // (b) Furniture shop items matching this layer. Owned ones are placeable;
    //     the rest carry a price so the UI can offer them.
    for (const it of furnitureItems) {
      if (!assetMatchesLayer(it.asset_path, layer)) continue
      opts.push({
        key: `item:${it.itemid}`,
        name: it.name,
        assetPath: normalizeForRoom(it.asset_path),
        rarity: it.rarity,
        owned: ownedItemIds.has(it.itemid),
        kind: "item",
        goldPrice: it.gold_price ?? null,
        gemPrice: it.gem_price ?? null,
      })
    }

    options[layer] = opts
  }

  return {
    layers: [...ROOM_LAYERS],
    activeRoomPrefix,
    gold: (userConfig?.gold ?? BigInt(0)).toString(),
    gems: userConfig?.gems ?? 0,
    current,
    options,
  }
}

function prettyVariantName(fullPath: string): string {
  // "rooms/default/wall_checker_blue.png" -> "Checker Blue"; "rooms/castle/wall_1.png" -> "Wall 1"
  const base = fullPath.split("/").pop()?.replace(/\.png$/i, "") ?? fullPath
  const parts = base.split("_")
  if (parts.length > 1) parts.shift() // drop the leading layer word
  const rest = parts.join(" ").trim() || base
  return rest.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Place a furniture asset into a slot. Cheat-proof: the asset must be either
 *  a colour variant of a room theme the user owns, or an owned FURNITURE item
 *  that matches the layer. */
export async function setFurniture(userId: bigint, slotRaw: unknown, assetPathRaw: unknown) {
  if (!isLayer(slotRaw)) {
    throw new PetServiceError(400, "bad_slot", `slot must be one of: ${ROOM_LAYERS.join(", ")}`)
  }
  const slot: RoomLayer = slotRaw
  if (typeof assetPathRaw !== "string" || !assetPathRaw) {
    throw new PetServiceError(400, "bad_asset", "assetPath is required")
  }
  // Defend against path traversal / junk before any DB/CDN use.
  if (!/^[a-zA-Z0-9/_.\-]+$/.test(assetPathRaw) || assetPathRaw.includes("..")) {
    throw new PetServiceError(400, "bad_asset", "Invalid assetPath")
  }
  const assetPath = normalizeForRoom(assetPathRaw)

  // --- Authorize the placement (cheat-proof) -------------------------------
  let authorized = false
  let themeMatched = false

  // (a) A colour variant bundled with a THEMED room (castle/library/…): free,
  //     but only if the user owns that room. rooms/default styles are priced
  //     items, so they fall through to the ownership check in (b).
  const prefix = Object.keys(ROOM_THEME_CONFIG).find(
    (p) => p !== "rooms/default" && assetPath.startsWith(p + "/")
  )
  if (prefix) {
    const variantPaths = themeVariantPaths(prefix, slot)
    const isDefaultPath = assetPath === (getRoomDefaults(prefix)[slot] ?? "")
    if (variantPaths.includes(assetPath) || isDefaultPath) {
      themeMatched = true
      const room = await prisma.lg_rooms.findFirst({
        where: { asset_prefix: prefix },
        select: { room_id: true },
      })
      if (room) {
        const owns = await prisma.lg_user_rooms.findUnique({
          where: { userid_room_id: { userid: userId, room_id: room.room_id } },
          select: { room_id: true },
        })
        if (owns) authorized = true
      }
      if (!authorized) {
        throw new PetServiceError(403, "room_locked", "Unlock that room theme to use its styles")
      }
    }
  }

  // (b) An owned FURNITURE item — covers every bare item AND every rooms/default style.
  if (!authorized && !themeMatched) {
    if (!assetMatchesLayer(assetPath, slot)) {
      throw new PetServiceError(400, "wrong_slot", "That item doesn't belong in this slot")
    }
    const bare = assetPath.replace(/^rooms\/furniture\//, "")
    const item = await prisma.lg_items.findFirst({
      where: { category: "FURNITURE", OR: [{ asset_path: assetPath }, { asset_path: bare }] },
      select: { itemid: true },
    })
    if (!item) throw new PetServiceError(404, "not_found", "Furniture item not found")
    const owned = await prisma.lg_user_inventory.findFirst({
      where: { userid: userId, itemid: item.itemid },
      select: { inventoryid: true },
    })
    if (!owned) throw new PetServiceError(403, "not_owned", "You don't own this furniture")
    authorized = true
  }

  if (!authorized) throw new PetServiceError(403, "not_allowed", "You can't place that here")

  await prisma.$queryRawUnsafe(
    `INSERT INTO lg_user_furniture (userid, slot, asset_path) VALUES ($1, $2, $3)
     ON CONFLICT (userid, slot) DO UPDATE SET asset_path = $3`,
    userId,
    slot,
    assetPath
  )

  return { success: true, slot, assetPath }
}

/** Clear a slot back to the room default. */
export async function clearFurniture(userId: bigint, slotRaw: unknown) {
  if (!isLayer(slotRaw)) {
    throw new PetServiceError(400, "bad_slot", `slot must be one of: ${ROOM_LAYERS.join(", ")}`)
  }
  await prisma.$queryRawUnsafe(
    `DELETE FROM lg_user_furniture WHERE userid = $1 AND slot = $2`,
    userId,
    slotRaw
  )
  return { success: true, slot: slotRaw }
}
