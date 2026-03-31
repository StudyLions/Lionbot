// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Board activity history API (paginated audit log)
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
import { requireBoardMember } from "@/utils/boardAuth"

function parseListId(raw: unknown): number | null {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}

const PAGE_SIZE = 50

export default apiHandler({
  async GET(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardMember(req, res, listId)
    if (!ctx) return

    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined

    const entries = await prisma.shared_task_history.findMany({
      where: {
        listid: listId,
        ...(cursor ? { historyid: { lt: cursor } } : {}),
      },
      orderBy: { created_at: "desc" },
      take: PAGE_SIZE + 1,
      select: {
        historyid: true,
        taskid: true,
        userid: true,
        action: true,
        details: true,
        created_at: true,
      },
    })

    const hasMore = entries.length > PAGE_SIZE
    const page = hasMore ? entries.slice(0, PAGE_SIZE) : entries

    const userIds = Array.from(new Set(page.map((e) => e.userid)))
    const users = await prisma.user_config.findMany({
      where: { userid: { in: userIds } },
      select: { userid: true, name: true, avatar_hash: true },
    })
    const userMap = new Map(users.map((u) => [u.userid.toString(), u]))

    res.status(200).json({
      entries: page.map((e) => {
        const user = userMap.get(e.userid.toString())
        return {
          id: e.historyid,
          taskId: e.taskid,
          userId: e.userid.toString(),
          userName: user?.name ?? "Unknown",
          userAvatar: user?.avatar_hash ?? null,
          action: e.action,
          details: e.details,
          createdAt: e.created_at,
        }
      }),
      nextCursor: hasMore ? page[page.length - 1].historyid : null,
    })
  },
})
