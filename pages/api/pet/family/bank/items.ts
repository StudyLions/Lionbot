// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family bank inventory - deposit/withdraw items
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { hasPermission } from "@/utils/familyPermissions"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const bankItems = await prisma.lg_family_bank.findMany({
      where: { family_id: membership.family_id },
      include: {
        lg_items: {
          select: { name: true, category: true, rarity: true, asset_path: true },
        },
      },
      orderBy: { deposited_at: "desc" },
    })

    const depositorIds = Array.from(new Set(bankItems.map((b) => b.deposited_by.toString()))).map(BigInt)
    const depositorPets = await prisma.lg_pets.findMany({
      where: { userid: { in: depositorIds } },
      select: { userid: true, pet_name: true },
    })
    const depositorMap = new Map(depositorPets.map((p) => [p.userid.toString(), p.pet_name]))

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Include glowTier/glowIntensity for ItemGlow rendering
    const { calcGlowTier, calcGlowIntensity } = await import("@/utils/gameConstants")

    const items = bankItems.map((b) => ({
      bankEntryId: b.bank_entry_id,
      itemId: b.itemid,
      name: b.lg_items.name,
      category: b.lg_items.category,
      rarity: b.lg_items.rarity,
      assetPath: b.lg_items.asset_path,
      enhancementLevel: b.enhancement_level ?? 0,
      glowTier: calcGlowTier(b.enhancement_level ?? 0, b.total_bonus ?? 0),
      glowIntensity: calcGlowIntensity(b.enhancement_level ?? 0),
      quantity: b.quantity,
      totalBonus: b.total_bonus,
      depositedBy: b.deposited_by.toString(),
      depositedByName: depositorMap.get(b.deposited_by.toString()) ?? "Unknown",
      depositedAt: b.deposited_at.toISOString(),
    }))
    // --- END AI-MODIFIED ---

    return res.status(200).json({ items })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { action, inventoryId, bankEntryId } = req.body

    if (!action || !["deposit", "withdraw"].includes(action)) {
      return res.status(400).json({ error: "action must be 'deposit' or 'withdraw'" })
    }

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    if (action === "deposit") {
      if (!inventoryId) return res.status(400).json({ error: "inventoryId required for deposit" })

      if (!hasPermission(membership.role, "deposit_items", membership.lg_families.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to deposit items" })
      }

      const invItem = await prisma.lg_user_inventory.findUnique({
        where: { inventoryid: inventoryId },
        include: {
          lg_items: { select: { itemid: true, name: true } },
          // --- AI-MODIFIED (2026-04-03) ---
          // Purpose: Include scroll_name so it survives the bank round-trip
          lg_enhancement_slots: {
            select: { slot_number: true, scroll_itemid: true, scroll_name: true, bonus_value: true },
          },
          // --- END AI-MODIFIED ---
        },
      })
      if (!invItem) return res.status(404).json({ error: "Inventory item not found" })
      if (invItem.userid !== userId) return res.status(403).json({ error: "This item doesn't belong to you" })

      // --- AI-MODIFIED (2026-04-03) ---
      // Purpose: Persist scroll_name in scroll_data JSON for withdraw restoration
      const scrollData = invItem.lg_enhancement_slots.length > 0
        ? invItem.lg_enhancement_slots.map((s) => ({
            slot_number: s.slot_number,
            scroll_itemid: s.scroll_itemid,
            scroll_name: s.scroll_name,
            bonus_value: s.bonus_value,
          }))
        : null
      // --- END AI-MODIFIED ---

      const totalBonus = invItem.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0)

      await prisma.$transaction(async (tx) => {
        await tx.lg_family_bank.create({
          data: {
            family_id: membership.family_id,
            itemid: invItem.itemid,
            enhancement_level: invItem.enhancement_level,
            quantity: invItem.quantity,
            scroll_data: scrollData as any,
            total_bonus: totalBonus,
            deposited_by: userId,
          },
        })

        await tx.lg_enhancement_slots.deleteMany({
          where: { inventoryid: inventoryId },
        })
        await tx.lg_user_inventory.delete({
          where: { inventoryid: inventoryId },
        })
      })

      return res.status(200).json({ success: true, action: "deposited" })
    }

    if (action === "withdraw") {
      if (!bankEntryId) return res.status(400).json({ error: "bankEntryId required for withdraw" })

      if (!hasPermission(membership.role, "withdraw_items", membership.lg_families.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to withdraw items" })
      }

      const bankItem = await prisma.lg_family_bank.findUnique({
        where: { bank_entry_id: bankEntryId },
      })
      if (!bankItem) return res.status(404).json({ error: "Bank item not found" })
      if (bankItem.family_id !== membership.family_id) {
        return res.status(403).json({ error: "This item doesn't belong to your family" })
      }

      // --- AI-MODIFIED (2026-04-03) ---
      // Purpose: Include scroll_name in the INSERT (NOT NULL column) so enhanced items can be withdrawn
      await prisma.$transaction(async (tx) => {
        const newInv = await tx.lg_user_inventory.create({
          data: {
            userid: userId,
            itemid: bankItem.itemid,
            enhancement_level: bankItem.enhancement_level,
            quantity: bankItem.quantity,
            source: "DROP" as any,
          },
        })

        if (bankItem.scroll_data && Array.isArray(bankItem.scroll_data)) {
          const slots = bankItem.scroll_data as Array<{
            slot_number: number
            scroll_itemid: number
            scroll_name?: string
            bonus_value: number
          }>
          for (const slot of slots) {
            const scrollName = slot.scroll_name ?? "Scroll"
            await tx.$executeRaw`INSERT INTO lg_enhancement_slots (inventoryid, slot_number, scroll_itemid, scroll_name, bonus_value) VALUES (${newInv.inventoryid}, ${slot.slot_number}, ${slot.scroll_itemid}, ${scrollName}, ${slot.bonus_value})`
          }
        }

        await tx.lg_family_bank.delete({
          where: { bank_entry_id: bankEntryId },
        })
      })
      // --- END AI-MODIFIED ---

      return res.status(200).json({ success: true, action: "withdrawn" })
    }
  },
})
