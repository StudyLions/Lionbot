// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Cross-system notification queue. Web inserts a row in
//          pending_notifications and a Python bot module polls and
//          sends the Discord DM(s). Keeps DISCORD_BOT_TOKEN out of
//          the website environment, and lets the bot use its live
//          guild member/permission cache (e.g. to enumerate admins
//          for guild_admin_dm notifications).
//
//          All helpers swallow errors and log a warning -- a failed
//          notification must never break a Stripe webhook handler.
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"

export type NotificationKind = "user_dm" | "guild_admin_dm"

export type NotificationCategory =
  | "server_gift_activated"
  | "server_gift_cancelled"
  | "lionheart_gift_claimed_by_recipient"
  | "lionheart_gift_claimed_sender_ack"
  | "lionheart_gift_cancelled"
  | "lionheart_gift_expired_sender"

export interface NotificationPayload {
  // Used by bot to format the embed title.
  category: NotificationCategory
  title: string
  // Body lines -- the bot formats each as an embed description line. Keep
  // each short and self-contained; the bot may collapse them on mobile.
  body: string
  // Optional link the bot adds as a button or footer URL.
  link_url?: string
  link_label?: string
  // Optional context the bot may surface (gifter display name, tier name,
  // gift message). Free-form -- the bot reads what it knows about and
  // ignores the rest.
  context?: Record<string, string | number | boolean | null>
}

interface EnqueueUserDmArgs {
  userId: bigint
  payload: NotificationPayload
  dedupKey?: string
}

interface EnqueueGuildAdminDmArgs {
  guildId: bigint
  payload: NotificationPayload
  dedupKey?: string
}

async function enqueue(
  kind: NotificationKind,
  args: { userId?: bigint; guildId?: bigint; payload: NotificationPayload; dedupKey?: string },
): Promise<void> {
  try {
    await prisma.pending_notifications.create({
      data: {
        kind,
        target_userid: args.userId ?? null,
        target_guildid: args.guildId ?? null,
        dedup_key: args.dedupKey ?? null,
        payload: args.payload as unknown as Prisma.InputJsonValue,
        status: "PENDING",
      },
    })
  } catch (err: any) {
    // Unique-constraint violation on dedup_key is expected (duplicate
    // webhook). Anything else gets logged but not re-thrown -- a queue
    // insert failure must never break a Stripe webhook.
    if (err?.code === "P2002") {
      console.log(`notifyQueue: deduped ${kind} dedup_key=${args.dedupKey}`)
      return
    }
    console.error(`notifyQueue: failed to enqueue ${kind} notification:`, err)
  }
}

export function notifyUser(args: EnqueueUserDmArgs): Promise<void> {
  return enqueue("user_dm", args)
}

export function notifyGuildAdmins(args: EnqueueGuildAdminDmArgs): Promise<void> {
  return enqueue("guild_admin_dm", args)
}
