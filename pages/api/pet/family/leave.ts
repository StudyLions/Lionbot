// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Leave current family with auto-leadership transfer
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    // --- AI-MODIFIED (2026-04-03) ---
    // Purpose: Include family data so we can return gold when last member leaves
    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const familyId = membership.family_id
    const family = membership.lg_families
    // --- END AI-MODIFIED ---

    const otherMembers = await prisma.lg_family_members.findMany({
      where: { family_id: familyId, userid: { not: userId }, left_at: null },
      orderBy: { joined_at: "asc" },
    })

    // --- AI-MODIFIED (2026-04-03) ---
    // Purpose: Return bank items + gold to the last member before deleting (was data loss)
    if (otherMembers.length === 0) {
      await prisma.$transaction(async (tx) => {
        const bankItems = await tx.lg_family_bank.findMany({
          where: { family_id: familyId },
        })

        for (const item of bankItems) {
          const newInv = await tx.lg_user_inventory.create({
            data: {
              userid: userId,
              itemid: item.itemid,
              enhancement_level: item.enhancement_level,
              quantity: item.quantity,
              source: "DROP" as any,
            },
          })

          if (item.scroll_data && Array.isArray(item.scroll_data)) {
            const slots = item.scroll_data as Array<{
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
        }

        if (family.gold > BigInt(0)) {
          await tx.user_config.update({
            where: { userid: userId },
            data: { gold: { increment: family.gold } },
          })
        }

        await tx.lg_family_members.update({
          where: { family_id_userid: { family_id: familyId, userid: userId } },
          data: { left_at: new Date() },
        })

        await tx.lg_families.delete({ where: { family_id: familyId } })
      })
      return res.status(200).json({ success: true, disbanded: true })
    }
    // --- END AI-MODIFIED ---

    if (membership.role === "LEADER") {
      const newLeader =
        otherMembers.find((m) => m.role === "ADMIN") ??
        otherMembers.find((m) => m.role === "MODERATOR") ??
        otherMembers[0]

      await prisma.$transaction([
        prisma.lg_family_members.update({
          where: { family_id_userid: { family_id: familyId, userid: userId } },
          data: { left_at: new Date() },
        }),
        prisma.lg_family_members.update({
          where: { family_id_userid: { family_id: familyId, userid: newLeader.userid } },
          data: { role: "LEADER" },
        }),
        prisma.lg_families.update({
          where: { family_id: familyId },
          data: { leader_userid: newLeader.userid },
        }),
      ])

      return res.status(200).json({
        success: true,
        disbanded: false,
        newLeader: newLeader.userid.toString(),
      })
    }

    await prisma.lg_family_members.update({
      where: { family_id_userid: { family_id: familyId, userid: userId } },
      data: { left_at: new Date() },
    })

    return res.status(200).json({ success: true, disbanded: false })
  },
})
