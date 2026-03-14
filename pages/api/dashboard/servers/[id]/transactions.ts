// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Paginated, filterable transaction explorer with
//          member names/avatars and CSV export support
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { Prisma } from "@prisma/client"

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

const VALID_TYPES = [
  "REFUND", "TRANSFER", "SHOP_PURCHASE", "VOICE_SESSION",
  "TEXT_SESSION", "ADMIN", "TASKS", "SCHEDULE_BOOK", "SCHEDULE_REWARD", "OTHER",
]

const TYPE_LABELS: Record<string, string> = {
  VOICE_SESSION: "Voice Study",
  TEXT_SESSION: "Text Activity",
  TASKS: "Task Reward",
  SCHEDULE_BOOK: "Session Booking",
  SCHEDULE_REWARD: "Attendance Reward",
  SHOP_PURCHASE: "Shop Purchase",
  TRANSFER: "Member Transfer",
  ADMIN: "Admin Action",
  REFUND: "Refund",
  OTHER: "Other",
}

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const format = req.query.format as string | undefined
    const type = req.query.type as string | undefined
    const search = req.query.search as string | undefined
    const dateFrom = req.query.dateFrom as string | undefined
    const dateTo = req.query.dateTo as string | undefined
    const sort = (req.query.sort as string) || "newest"
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 25))

    const where: Prisma.coin_transactionsWhereInput = { guildid: guildId }

    if (type && type !== "all" && VALID_TYPES.includes(type)) {
      where.transactiontype = type as any
    }

    if (dateFrom) {
      where.created_at = { ...(where.created_at as any || {}), gte: new Date(dateFrom) }
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setUTCHours(23, 59, 59, 999)
      where.created_at = { ...(where.created_at as any || {}), lte: to }
    }

    if (search && search.trim()) {
      const s = search.trim()
      if (/^\d+$/.test(s)) {
        const searchId = BigInt(s)
        where.OR = [
          { actorid: searchId },
          { from_account: searchId },
          { to_account: searchId },
        ]
      } else {
        const matchingMembers = await prisma.members.findMany({
          where: { guildid: guildId, display_name: { contains: s, mode: "insensitive" } },
          select: { userid: true },
          take: 50,
        })
        const matchIds = matchingMembers.map((m) => m.userid)
        if (matchIds.length > 0) {
          where.OR = [
            { actorid: { in: matchIds } },
            { from_account: { in: matchIds } },
            { to_account: { in: matchIds } },
          ]
        } else {
          return res.status(200).json({
            transactions: [],
            pagination: { page, pageSize, total: 0, totalPages: 0 },
          })
        }
      }
    }

    let orderBy: Prisma.coin_transactionsOrderByWithRelationInput
    switch (sort) {
      case "oldest": orderBy = { created_at: "asc" }; break
      case "largest": orderBy = { amount: "desc" }; break
      case "smallest": orderBy = { amount: "asc" }; break
      default: orderBy = { created_at: "desc" }
    }

    const isCSV = format === "csv"
    const limit = isCSV ? 10000 : pageSize
    const skip = isCSV ? 0 : (page - 1) * pageSize

    const [transactions, total] = await Promise.all([
      prisma.coin_transactions.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          transactionid: true,
          transactiontype: true,
          amount: true,
          bonus: true,
          actorid: true,
          from_account: true,
          to_account: true,
          created_at: true,
        },
      }),
      prisma.coin_transactions.count({ where }),
    ])

    const userIds = new Set<bigint>()
    for (const tx of transactions) {
      userIds.add(tx.actorid)
      if (tx.from_account) userIds.add(tx.from_account)
      if (tx.to_account) userIds.add(tx.to_account)
    }

    const members = userIds.size > 0
      ? await prisma.members.findMany({
          where: { guildid: guildId, userid: { in: Array.from(userIds) } },
          select: { userid: true, display_name: true, user_config: { select: { avatar_hash: true } } },
        })
      : []
    const memberMap = new Map(members.map((m) => [m.userid.toString(), m]))

    function getMemberInfo(id: bigint | null) {
      if (!id) return { name: null, avatarUrl: null }
      const uid = id.toString()
      const m = memberMap.get(uid)
      return {
        name: m?.display_name || `User ...${uid.slice(-4)}`,
        avatarUrl: buildAvatarUrl(uid, m?.user_config?.avatar_hash ?? null),
      }
    }

    const mapped = transactions.map((tx) => {
      const actor = getMemberInfo(tx.actorid)
      const from = getMemberInfo(tx.from_account)
      const to = getMemberInfo(tx.to_account)
      return {
        id: tx.transactionid,
        type: tx.transactiontype,
        amount: tx.amount,
        bonus: tx.bonus,
        actorId: tx.actorid.toString(),
        actorName: actor.name || `User ...${tx.actorid.toString().slice(-4)}`,
        actorAvatarUrl: actor.avatarUrl || buildAvatarUrl(tx.actorid.toString(), null),
        fromAccount: tx.from_account?.toString() || null,
        fromName: from.name,
        toAccount: tx.to_account?.toString() || null,
        toName: to.name,
        createdAt: tx.created_at,
      }
    })

    if (isCSV) {
      const header = "ID,Type,Amount,Bonus,Actor,From,To,Date"
      const rows = mapped.map((tx) =>
        [
          tx.id,
          TYPE_LABELS[tx.type] || tx.type,
          tx.amount,
          tx.bonus,
          `"${tx.actorName}"`,
          tx.fromName ? `"${tx.fromName}"` : "",
          tx.toName ? `"${tx.toName}"` : "",
          tx.createdAt ? new Date(tx.createdAt).toISOString() : "",
        ].join(",")
      )
      const csv = [header, ...rows].join("\n")
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="transactions-${req.query.id}.csv"`)
      return res.status(200).send(csv)
    }

    res.status(200).json({
      transactions: mapped,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  },
})
