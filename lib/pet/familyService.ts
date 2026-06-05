// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared FAMILY (clan) logic for the Anki addon — the CORE loop:
//          overview / members reads + create / invite / respond / leave +
//          bank-gold (deposit/withdraw with the role-permission check and
//          UTC daily-withdraw cap). Faithfully mirrors the website's
//          pages/api/pet/family/* routes (atomic transactions, leadership
//          auto-transfer / disband-with-return on leave, member cap,
//          7-day cooldown). Governance (kick/role/permissions/settings/
//          disband), the item bank and the family farm are deferred.
//
//          Every action is membership- and permission-gated and scoped to
//          the authenticated userId (no IDOR).
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"
import { hasPermission, maxMembersForLevel, familyLevelFromXp } from "@/utils/familyPermissions"

const CREATION_COST = 10000
const COOLDOWN_DAYS = 7
const NAME_REGEX = /^[a-zA-Z0-9 ]{2,32}$/

function toBigInt(v: unknown, field: string): bigint {
  try {
    if (typeof v === "bigint") return v
    if (typeof v === "number" && Number.isInteger(v)) return BigInt(v)
    if (typeof v === "string" && /^\d{1,20}$/.test(v.trim())) return BigInt(v.trim())
  } catch {
    /* fallthrough */
  }
  throw new PetServiceError(400, "bad_id", `Invalid ${field}`)
}

async function activeMembership(userId: bigint) {
  return prisma.lg_family_members.findFirst({
    where: { userid: userId, left_at: null },
    include: { lg_families: true },
  })
}

async function cooldownRemaining(userId: bigint): Promise<number> {
  const lastLeft = await prisma.lg_family_members.findFirst({
    where: { userid: userId, left_at: { not: null } },
    orderBy: { left_at: "desc" },
  })
  if (!lastLeft?.left_at) return 0
  const daysSince = (Date.now() - lastLeft.left_at.getTime()) / (1000 * 60 * 60 * 24)
  return daysSince < COOLDOWN_DAYS ? Math.ceil(COOLDOWN_DAYS - daysSince) : 0
}

// ============================== READS ==============================

export async function getFamilyOverview(userId: bigint) {
  const membership = await activeMembership(userId)
  if (!membership) return { inFamily: false }
  const family = membership.lg_families
  const [memberCount, recentLog] = await Promise.all([
    prisma.lg_family_members.count({ where: { family_id: family.family_id, left_at: null } }),
    prisma.lg_family_gold_log.findMany({
      where: { family_id: family.family_id },
      orderBy: { created_at: "desc" },
      take: 10,
    }),
  ])
  const level = familyLevelFromXp(Number(family.xp ?? 0))
  return {
    inFamily: true,
    family: {
      familyId: family.family_id,
      name: family.name,
      description: family.description ?? "",
      level,
      xp: (family.xp ?? BigInt(0)).toString(),
      gold: (family.gold ?? BigInt(0)).toString(),
      leaderUserId: family.leader_userid.toString(),
      memberCount,
      maxMembers: Math.max(family.max_members ?? 10, maxMembersForLevel(level)),
      dailyGoldWithdrawCap: family.daily_gold_withdraw_cap ?? 0,
    },
    membership: {
      role: membership.role ?? "MEMBER",
      contributionXp: (membership.contribution_xp ?? BigInt(0)).toString(),
      joinedAt: membership.joined_at?.toISOString() ?? null,
    },
    recentActivity: recentLog.map((l) => ({
      action: l.action,
      amount: l.amount,
      description: l.description ?? "",
      createdAt: l.created_at?.toISOString() ?? null,
    })),
  }
}

export async function getMembers(userId: bigint) {
  const membership = await activeMembership(userId)
  if (!membership) throw new PetServiceError(403, "not_in_family", "You are not in a family")
  const rows = await prisma.lg_family_members.findMany({
    where: { family_id: membership.family_id, left_at: null },
    orderBy: { joined_at: "asc" },
    select: { userid: true, role: true, contribution_xp: true, joined_at: true },
  })
  const ids = rows.map((r) => r.userid)
  const [pets, configs] = await Promise.all([
    prisma.lg_pets.findMany({ where: { userid: { in: ids } }, select: { userid: true, pet_name: true, level: true } }),
    prisma.user_config.findMany({ where: { userid: { in: ids } }, select: { userid: true, name: true, avatar_hash: true } }),
  ])
  const pMap = new Map(pets.map((p) => [p.userid.toString(), p]))
  const cMap = new Map(configs.map((c) => [c.userid.toString(), c]))
  const ROLE_RANK: Record<string, number> = { LEADER: 4, ADMIN: 3, MODERATOR: 2, MEMBER: 1 }
  const members = rows.map((r) => {
    const k = r.userid.toString()
    return {
      discordId: k,
      name: cMap.get(k)?.name ?? null,
      avatarHash: cMap.get(k)?.avatar_hash ?? null,
      petName: pMap.get(k)?.pet_name ?? null,
      petLevel: pMap.get(k)?.level ?? 0,
      role: r.role ?? "MEMBER",
      contributionXp: (r.contribution_xp ?? BigInt(0)).toString(),
      joinedAt: r.joined_at?.toISOString() ?? null,
    }
  })
  members.sort((a, b) => (ROLE_RANK[b.role] ?? 0) - (ROLE_RANK[a.role] ?? 0))
  return { members, yourRole: membership.role ?? "MEMBER", leaderUserId: membership.lg_families.leader_userid.toString() }
}

export async function listFamilyInvites(userId: bigint) {
  const invites = await prisma.lg_family_invites.findMany({
    where: { to_userid: userId, status: "PENDING" },
    include: { lg_families: { select: { family_id: true, name: true, icon_url: true, level: true } } },
    orderBy: { created_at: "desc" },
  })
  const enriched = await Promise.all(
    invites.map(async (inv) => {
      const [memberCount, inviterPet] = await Promise.all([
        prisma.lg_family_members.count({ where: { family_id: inv.family_id, left_at: null } }),
        prisma.lg_pets.findUnique({ where: { userid: inv.from_userid }, select: { pet_name: true } }),
      ])
      return {
        inviteId: inv.invite_id,
        familyId: inv.family_id,
        familyName: inv.lg_families.name,
        familyLevel: inv.lg_families.level ?? 1,
        memberCount,
        invitedBy: inv.from_userid.toString(),
        inviterName: inviterPet?.pet_name ?? "Unknown",
        createdAt: inv.created_at?.toISOString() ?? null,
      }
    })
  )
  return { invites: enriched }
}

export async function getBankGold(userId: bigint) {
  const membership = await activeMembership(userId)
  if (!membership) throw new PetServiceError(403, "not_in_family", "You are not in a family")
  const family = membership.lg_families
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const [dailyWithdrawals, recentLog] = await Promise.all([
    prisma.lg_family_gold_withdrawals.aggregate({
      where: { family_id: family.family_id, userid: userId, withdrawn_at: { gte: todayStart } },
      _sum: { amount: true },
    }),
    prisma.lg_family_gold_log.findMany({ where: { family_id: family.family_id }, orderBy: { created_at: "desc" }, take: 20 }),
  ])
  const ids = Array.from(new Set(recentLog.map((l) => l.userid.toString()))).map(BigInt)
  const pets = ids.length ? await prisma.lg_pets.findMany({ where: { userid: { in: ids } }, select: { userid: true, pet_name: true } }) : []
  const nameMap = new Map(pets.map((p) => [p.userid.toString(), p.pet_name]))
  return {
    balance: (family.gold ?? BigInt(0)).toString(),
    dailyUsed: dailyWithdrawals._sum.amount ?? 0,
    dailyCap: family.daily_gold_withdraw_cap ?? 0,
    canDeposit: hasPermission(membership.role ?? "MEMBER", "deposit_gold", family.role_permissions),
    canWithdraw: hasPermission(membership.role ?? "MEMBER", "withdraw_gold", family.role_permissions),
    log: recentLog.map((l) => ({
      userName: nameMap.get(l.userid.toString()) ?? "Unknown",
      amount: l.amount,
      action: l.action,
      description: l.description ?? "",
      createdAt: l.created_at?.toISOString() ?? null,
    })),
  }
}

// ============================== WRITES ==============================

export async function createFamily(userId: bigint, name: unknown) {
  if (!name || typeof name !== "string" || !NAME_REGEX.test(name.trim())) {
    throw new PetServiceError(400, "bad_name", "Name must be 2-32 characters, letters/numbers/spaces only")
  }
  const trimmedName = name.trim()
  const [pet, membership, userConfig, nameExists] = await Promise.all([
    prisma.lg_pets.findUnique({ where: { userid: userId }, select: { userid: true } }),
    prisma.lg_family_members.findFirst({ where: { userid: userId, left_at: null } }),
    prisma.user_config.findUnique({ where: { userid: userId }, select: { gold: true } }),
    prisma.lg_families.findUnique({ where: { name: trimmedName }, select: { family_id: true } }),
  ])
  if (!pet) throw new PetServiceError(400, "no_pet", "You need a pet to create a family")
  if (membership) throw new PetServiceError(400, "already_in_family", "You are already in a family")
  if (!userConfig || userConfig.gold < BigInt(CREATION_COST)) {
    throw new PetServiceError(400, "insufficient_gold", `Not enough gold. Need ${CREATION_COST.toLocaleString()}`)
  }
  if (nameExists) throw new PetServiceError(400, "name_taken", "A family with that name already exists")
  const cd = await cooldownRemaining(userId)
  if (cd > 0) throw new PetServiceError(400, "cooldown", `Cooldown: ${cd} day(s) remaining`)

  const result = await prisma.$transaction(async (tx) => {
    await tx.user_config.update({ where: { userid: userId }, data: { gold: { decrement: CREATION_COST } } })
    const family = await tx.lg_families.create({ data: { name: trimmedName, leader_userid: userId } })
    await tx.lg_family_members.create({ data: { family_id: family.family_id, userid: userId, role: "LEADER" } })
    await tx.lg_family_farms.create({ data: { family_id: family.family_id, farm_index: 0 } })
    await tx.lg_family_farm_plots.createMany({
      data: Array.from({ length: 15 }, (_, i) => ({ family_id: family.family_id, farm_index: 0, plot_id: i })),
    })
    return family
  })
  return { success: true, familyId: result.family_id, name: result.name }
}

export async function inviteToFamily(userId: bigint, query: unknown) {
  // Accept a discord id or a username (resolve to id).
  let targetId: bigint | null = null
  if (typeof query === "string" && /^\d{17,20}$/.test(query.trim())) {
    targetId = BigInt(query.trim())
  } else if (typeof query === "number" || typeof query === "bigint") {
    targetId = toBigInt(query, "targetUserId")
  } else if (typeof query === "string" && query.trim()) {
    const c = await prisma.user_config.findFirst({ where: { name: { equals: query.trim(), mode: "insensitive" } }, select: { userid: true } })
    if (!c) throw new PetServiceError(404, "user_not_found", "User not found")
    targetId = c.userid
  }
  if (targetId === null) throw new PetServiceError(400, "bad_target", "Provide a Discord name or ID")
  if (targetId === userId) throw new PetServiceError(400, "self", "Cannot invite yourself")

  const membership = await activeMembership(userId)
  if (!membership) throw new PetServiceError(403, "not_in_family", "You are not in a family")
  if (!hasPermission(membership.role ?? "MEMBER", "invite_members", membership.lg_families.role_permissions)) {
    throw new PetServiceError(403, "no_permission", "You don't have permission to invite members")
  }

  const [targetPet, targetMembership, existingInvite] = await Promise.all([
    prisma.lg_pets.findUnique({ where: { userid: targetId }, select: { userid: true } }),
    prisma.lg_family_members.findFirst({ where: { userid: targetId, left_at: null } }),
    prisma.lg_family_invites.findFirst({ where: { family_id: membership.family_id, to_userid: targetId, status: "PENDING" } }),
  ])
  if (!targetPet) throw new PetServiceError(400, "target_no_pet", "That user doesn't have a pet")
  if (targetMembership) throw new PetServiceError(400, "target_in_family", "That user is already in a family")
  if (existingInvite) throw new PetServiceError(400, "already_invited", "That user already has a pending invite from your family")
  const cd = await cooldownRemaining(targetId)
  if (cd > 0) throw new PetServiceError(400, "target_cooldown", `Target is on cooldown: ${cd} day(s) remaining`)

  await prisma.lg_family_invites.create({ data: { family_id: membership.family_id, from_userid: userId, to_userid: targetId } })
  return { success: true }
}

export async function respondFamilyInvite(userId: bigint, inviteIdRaw: unknown, action: unknown) {
  const inviteId = Math.floor(Number(inviteIdRaw))
  if (!inviteId || (action !== "accept" && action !== "decline")) {
    throw new PetServiceError(400, "bad_input", "inviteId and action (accept|decline) required")
  }
  const invite = await prisma.lg_family_invites.findUnique({ where: { invite_id: inviteId } })
  if (!invite) throw new PetServiceError(404, "not_found", "Invite not found")
  if (invite.to_userid !== userId) throw new PetServiceError(403, "not_yours", "This invite is not for you")
  if (invite.status !== "PENDING") throw new PetServiceError(400, "not_pending", "Invite is no longer pending")

  if (action === "decline") {
    await prisma.lg_family_invites.update({ where: { invite_id: inviteId }, data: { status: "DECLINED" } })
    return { success: true, action: "declined" }
  }

  const existing = await prisma.lg_family_members.findFirst({ where: { userid: userId, left_at: null } })
  if (existing) throw new PetServiceError(400, "already_in_family", "You are already in a family")
  const cd = await cooldownRemaining(userId)
  if (cd > 0) throw new PetServiceError(400, "cooldown", `Cooldown: ${cd} day(s) remaining`)

  const [family, memberCount] = await Promise.all([
    prisma.lg_families.findUnique({ where: { family_id: invite.family_id } }),
    prisma.lg_family_members.count({ where: { family_id: invite.family_id, left_at: null } }),
  ])
  if (!family) throw new PetServiceError(404, "family_gone", "Family no longer exists")
  const level = familyLevelFromXp(Number(family.xp ?? 0))
  if (memberCount >= Math.max(family.max_members ?? 10, maxMembersForLevel(level))) {
    throw new PetServiceError(400, "family_full", "Family is full")
  }

  await prisma.$transaction(async (tx) => {
    await tx.lg_family_invites.update({ where: { invite_id: inviteId }, data: { status: "ACCEPTED" } })
    await tx.lg_family_members.upsert({
      where: { family_id_userid: { family_id: invite.family_id, userid: userId } },
      create: { family_id: invite.family_id, userid: userId, role: "MEMBER" },
      update: { role: "MEMBER", left_at: null, joined_at: new Date(), contribution_xp: BigInt(0) },
    })
  })
  return { success: true, action: "accepted", familyId: invite.family_id }
}

export async function leaveFamily(userId: bigint) {
  const membership = await activeMembership(userId)
  if (!membership) throw new PetServiceError(403, "not_in_family", "You are not in a family")
  const familyId = membership.family_id
  const family = membership.lg_families

  const otherMembers = await prisma.lg_family_members.findMany({
    where: { family_id: familyId, userid: { not: userId }, left_at: null },
    orderBy: { joined_at: "asc" },
  })

  if (otherMembers.length === 0) {
    // Last member: return bank items + gold, then disband.
    await prisma.$transaction(async (tx) => {
      const bankItems = await tx.lg_family_bank.findMany({ where: { family_id: familyId } })
      for (const item of bankItems) {
        const newInv = await tx.lg_user_inventory.create({
          data: { userid: userId, itemid: item.itemid, enhancement_level: item.enhancement_level ?? 0, quantity: item.quantity ?? 1, source: "DROP" as any },
        })
        if (item.scroll_data && Array.isArray(item.scroll_data)) {
          for (const slot of item.scroll_data as Array<{ slot_number: number; scroll_itemid: number; scroll_name?: string; bonus_value: number }>) {
            const scrollName = slot.scroll_name ?? "Scroll"
            await tx.$executeRaw`INSERT INTO lg_enhancement_slots (inventoryid, slot_number, scroll_itemid, scroll_name, bonus_value) VALUES (${newInv.inventoryid}, ${slot.slot_number}, ${slot.scroll_itemid}, ${scrollName}, ${slot.bonus_value})`
          }
        }
      }
      if ((family.gold ?? BigInt(0)) > BigInt(0)) {
        await tx.user_config.update({ where: { userid: userId }, data: { gold: { increment: family.gold ?? BigInt(0) } } })
      }
      await tx.lg_family_members.update({ where: { family_id_userid: { family_id: familyId, userid: userId } }, data: { left_at: new Date() } })
      await tx.lg_families.delete({ where: { family_id: familyId } })
    })
    return { success: true, disbanded: true }
  }

  if (membership.role === "LEADER") {
    const newLeader =
      otherMembers.find((m) => m.role === "ADMIN") ??
      otherMembers.find((m) => m.role === "MODERATOR") ??
      otherMembers[0]
    await prisma.$transaction([
      prisma.lg_family_members.update({ where: { family_id_userid: { family_id: familyId, userid: userId } }, data: { left_at: new Date() } }),
      prisma.lg_family_members.update({ where: { family_id_userid: { family_id: familyId, userid: newLeader.userid } }, data: { role: "LEADER" } }),
      prisma.lg_families.update({ where: { family_id: familyId }, data: { leader_userid: newLeader.userid } }),
    ])
    return { success: true, disbanded: false, newLeader: newLeader.userid.toString() }
  }

  await prisma.lg_family_members.update({ where: { family_id_userid: { family_id: familyId, userid: userId } }, data: { left_at: new Date() } })
  return { success: true, disbanded: false }
}

export async function bankGold(userId: bigint, action: unknown, amountRaw: unknown) {
  if (action !== "deposit" && action !== "withdraw") {
    throw new PetServiceError(400, "bad_action", "action must be 'deposit' or 'withdraw'")
  }
  const numAmount = parseInt(String(amountRaw), 10)
  if (!numAmount || numAmount <= 0) throw new PetServiceError(400, "bad_amount", "amount must be a positive integer")

  const membership = await activeMembership(userId)
  if (!membership) throw new PetServiceError(403, "not_in_family", "You are not in a family")
  const family = membership.lg_families

  if (action === "deposit") {
    if (!hasPermission(membership.role ?? "MEMBER", "deposit_gold", family.role_permissions)) {
      throw new PetServiceError(403, "no_permission", "You don't have permission to deposit gold")
    }
    const userConfig = await prisma.user_config.findUnique({ where: { userid: userId }, select: { gold: true } })
    if (!userConfig || userConfig.gold < BigInt(numAmount)) throw new PetServiceError(400, "insufficient_gold", "Not enough gold")
    await prisma.$transaction([
      prisma.user_config.update({ where: { userid: userId }, data: { gold: { decrement: numAmount } } }),
      prisma.lg_families.update({ where: { family_id: family.family_id }, data: { gold: { increment: numAmount } } }),
      prisma.lg_family_gold_log.create({
        data: { family_id: family.family_id, userid: userId, amount: numAmount, action: "DEPOSIT", description: `Deposited ${numAmount.toLocaleString()} gold` },
      }),
    ])
    return { success: true, action: "deposited", amount: numAmount }
  }

  // withdraw
  if (!hasPermission(membership.role ?? "MEMBER", "withdraw_gold", family.role_permissions)) {
    throw new PetServiceError(403, "no_permission", "You don't have permission to withdraw gold")
  }
  if ((family.gold ?? BigInt(0)) < BigInt(numAmount)) throw new PetServiceError(400, "treasury_low", "Not enough gold in the treasury")
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const dailyWithdrawals = await prisma.lg_family_gold_withdrawals.aggregate({
    where: { family_id: family.family_id, userid: userId, withdrawn_at: { gte: todayStart } },
    _sum: { amount: true },
  })
  const dailyUsed = dailyWithdrawals._sum.amount ?? 0
  const cap = family.daily_gold_withdraw_cap ?? 0
  if (dailyUsed + numAmount > cap) {
    throw new PetServiceError(400, "daily_cap", `Daily withdrawal cap exceeded. You can withdraw ${Math.max(0, cap - dailyUsed).toLocaleString()} more today.`)
  }
  await prisma.$transaction([
    prisma.lg_families.update({ where: { family_id: family.family_id }, data: { gold: { decrement: numAmount } } }),
    prisma.user_config.update({ where: { userid: userId }, data: { gold: { increment: numAmount } } }),
    prisma.lg_family_gold_log.create({
      data: { family_id: family.family_id, userid: userId, amount: -numAmount, action: "WITHDRAW", description: `Withdrew ${numAmount.toLocaleString()} gold` },
    }),
    prisma.lg_family_gold_withdrawals.create({ data: { family_id: family.family_id, userid: userId, amount: numAmount } }),
  ])
  return { success: true, action: "withdrawn", amount: numAmount }
}
