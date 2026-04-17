// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-17
// Purpose: Send a moderation DM to a member from the dashboard
//          using the bot's Discord token. Records the action as a
//          NOTE ticket so there is a permanent audit trail.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

interface DiscordChannel {
  id: string
}

interface DiscordError {
  code?: number
  message?: string
}

const MAX_CONTENT = 1500

async function fetchGuildName(guildId: bigint): Promise<string | null> {
  if (!BOT_TOKEN) return null
  try {
    const r = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}`,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    )
    if (!r.ok) return null
    const data = (await r.json()) as { name?: string }
    return data.name ?? null
  } catch {
    return null
  }
}

async function openDmChannel(userId: bigint): Promise<{ id: string } | { error: string; status: number }> {
  if (!BOT_TOKEN) return { error: "Bot token not configured on server", status: 500 }
  const r = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: userId.toString() }),
  })
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as DiscordError
    if (r.status === 403) {
      return { error: "Discord refused to open a DM with this user (403). They may share no servers with the bot.", status: 403 }
    }
    return { error: body.message || `Discord API error ${r.status}`, status: r.status >= 500 ? 502 : 400 }
  }
  return (await r.json()) as DiscordChannel
}

async function sendDmMessage(
  channelId: string,
  payload: Record<string, unknown>
): Promise<{ ok: true } | { error: string; status: number }> {
  if (!BOT_TOKEN) return { error: "Bot token not configured on server", status: 500 }
  const r = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as DiscordError
    if (r.status === 403 || body.code === 50007) {
      return { error: "This member has DMs disabled or has blocked the bot.", status: 403 }
    }
    return { error: body.message || `Discord API error ${r.status}`, status: r.status >= 500 ? 502 : 400 }
  }
  return { ok: true }
}

export default apiHandler({
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guildId")
    const targetUserId = parseBigInt(req.query.userId, "userId")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { content, ticketId, includeContext } = req.body as {
      content?: string
      ticketId?: number
      includeContext?: boolean
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Message content is required" })
    }
    if (content.length > MAX_CONTENT) {
      return res.status(400).json({ error: `Message too long (max ${MAX_CONTENT} characters)` })
    }

    const member = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: {
        userid: true,
        display_name: true,
      },
    })
    if (!member) {
      return res.status(404).json({ error: "Member not found in this server" })
    }

    let referencedTicket:
      | {
          ticketid: number
          ticket_type: string
          ticket_state: string
          created_at: Date | null
          expiry: Date | null
          content: string | null
        }
      | null = null
    if (typeof ticketId === "number" && Number.isFinite(ticketId)) {
      const t = await prisma.tickets.findUnique({
        where: { ticketid: ticketId },
        select: {
          ticketid: true,
          ticket_type: true,
          ticket_state: true,
          created_at: true,
          expiry: true,
          content: true,
          guildid: true,
          targetid: true,
        },
      })
      if (
        !t ||
        t.guildid !== guildId ||
        t.targetid !== targetUserId ||
        !["STUDY_BAN", "SCREEN_BAN"].includes(t.ticket_type)
      ) {
        return res.status(400).json({ error: "Referenced ticket is invalid for this member" })
      }
      referencedTicket = {
        ticketid: t.ticketid,
        ticket_type: t.ticket_type,
        ticket_state: t.ticket_state,
        created_at: t.created_at,
        expiry: t.expiry,
        content: t.content,
      }
    }

    const guildName = (await fetchGuildName(guildId)) || "the moderation team"

    const fields: { name: string; value: string; inline?: boolean }[] = []
    if (includeContext && referencedTicket) {
      const typeLabel = referencedTicket.ticket_type === "STUDY_BAN" ? "Video Blacklist" : "Screen Blacklist"
      const status = referencedTicket.ticket_state === "OPEN" || referencedTicket.ticket_state === "EXPIRING"
        ? "Active"
        : referencedTicket.ticket_state === "EXPIRED"
        ? "Expired"
        : "Resolved"
      fields.push({ name: "Regarding", value: `${typeLabel} (#${referencedTicket.ticketid})`, inline: true })
      fields.push({ name: "Status", value: status, inline: true })
      if (referencedTicket.expiry) {
        const ts = Math.floor(new Date(referencedTicket.expiry).getTime() / 1000)
        fields.push({ name: "Expires", value: `<t:${ts}:R>`, inline: true })
      }
    }

    const embed: Record<string, unknown> = {
      title: `Message from ${guildName} moderators`,
      description: content.trim(),
      color: 0xed4245,
      footer: { text: `Sent via the LionBot dashboard | by a server moderator` },
      timestamp: new Date().toISOString(),
    }
    if (fields.length > 0) embed.fields = fields

    const dm = await openDmChannel(targetUserId)
    if ("error" in dm) {
      return res.status(dm.status).json({ error: dm.error })
    }

    const send = await sendDmMessage(dm.id, { embeds: [embed] })
    if ("error" in send) {
      return res.status(send.status).json({ error: send.error })
    }

    const auditPrefix = referencedTicket
      ? `[DM re: ticket #${referencedTicket.ticketid}] `
      : "[DM] "
    const note = await prisma.tickets.create({
      data: {
        guildid: guildId,
        targetid: targetUserId,
        ticket_type: "NOTE",
        ticket_state: "OPEN",
        moderator_id: auth.userId,
        content: (auditPrefix + content.trim()).slice(0, 2000),
        auto: false,
      },
    })

    return res.status(200).json({
      ok: true,
      noteTicketId: note.ticketid,
      message: "DM sent.",
    })
  },
})
