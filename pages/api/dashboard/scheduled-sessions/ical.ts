// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-04
// Purpose: iCal feed endpoint for scheduled sessions. Generates
//          a .ics calendar feed authenticated via HMAC token so
//          calendar apps (Google Calendar, Apple Calendar, etc.)
//          can subscribe without OAuth.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import { prisma } from "@/utils/prisma"

const ICAL_SECRET = process.env.ICAL_SECRET || process.env.SECRET || "lionbot-ical-fallback"

function generateIcalToken(userId: string): string {
  return crypto.createHmac("sha256", ICAL_SECRET).update(userId).digest("hex")
}

function validateIcalToken(userId: string, token: string): boolean {
  const expected = generateIcalToken(userId)
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}

export { generateIcalToken }

function escapeIcal(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

function formatIcalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { token, userId } = req.query

  if (!token || !userId || typeof token !== "string" || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing token or userId parameter" })
  }

  if (token.length !== 64) {
    return res.status(401).json({ error: "Invalid token" })
  }

  try {
    if (!validateIcalToken(userId, token)) {
      return res.status(401).json({ error: "Invalid token" })
    }
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }

  const userIdBigInt = BigInt(userId)
  const now = Math.floor(Date.now() / 1000)
  const nowSlotId = now - (now % 3600)

  const rows = await prisma.$queryRaw<Array<{
    slotid: number
    guildid: bigint
    guild_name: string | null
  }>>`
    SELECT
      ssm.slotid,
      ssm.guildid,
      gc.guild_name
    FROM schedule_session_members ssm
    LEFT JOIN guild_config gc ON gc.guildid = ssm.guildid
    WHERE ssm.userid = ${userIdBigInt}
      AND ssm.slotid >= ${nowSlotId}
      AND ssm.slotid <= ${nowSlotId + 86400 * 30}
    ORDER BY ssm.slotid ASC
  `

  const userConfig = await prisma.user_config.findUnique({
    where: { userid: userIdBigInt },
    select: { timezone: true, name: true },
  })

  const calName = `StudyLion Sessions${userConfig?.name ? ` - ${userConfig.name}` : ""}`

  let ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LionBot//Scheduled Sessions//EN",
    `X-WR-CALNAME:${escapeIcal(calName)}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${userConfig?.timezone || "UTC"}`,
  ]

  for (const row of rows) {
    const start = new Date(row.slotid * 1000)
    const end = new Date((row.slotid + 3600) * 1000)
    const guildName = row.guild_name || "Unknown Server"
    const uid = `schedule-${row.guildid}-${row.slotid}@lionbot.org`

    ical.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART:${formatIcalDate(start)}`,
      `DTEND:${formatIcalDate(end)}`,
      `SUMMARY:${escapeIcal(`Study Session — ${guildName}`)}`,
      `DESCRIPTION:${escapeIcal(`Scheduled study session in ${guildName}. Open your Discord server to attend!`)}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Your study session starts in 15 minutes!",
      "END:VALARM",
      "END:VEVENT"
    )
  }

  ical.push("END:VCALENDAR")

  const body = ical.join("\r\n")

  res.setHeader("Content-Type", "text/calendar; charset=utf-8")
  res.setHeader("Content-Disposition", 'attachment; filename="studylion-sessions.ics"')
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
  res.status(200).send(body)
}
