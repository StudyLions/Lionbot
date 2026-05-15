// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Stripe webhook handler for one-time gem purchases
//          AND LionHeart subscription lifecycle events.
// ============================================================
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/utils/prisma";
import { getTierByPriceId } from "@/constants/SubscriptionData";
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Discord audit log notifications for gem transactions and Stripe payments
import { sendGemAuditLog, sendStripeAuditLog } from "@/utils/discordAudit";
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Shared premium recalculation for LionHeart++ server premium lifecycle
import { recalculateGuildPremium } from "@/utils/premiumUtils";
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-05-15) ---
// Purpose: Queue Discord DM notifications + send sender-side transactional
//          emails for gift lifecycle events. Recipient emails for LionHeart
//          claims live in the claim endpoint (the recipient's userid isn't
//          known here until they claim). Server-gift admin emails are
//          intentionally not sent -- DM coverage handles that (admin
//          email addresses aren't always known).
import * as React from "react";
import { notifyUser, notifyGuildAdmins } from "@/utils/notifyQueue";
import { sendEmail } from "@/utils/email/send";
import GiftClaimable from "../../../emails/GiftClaimable";
// --- END AI-MODIFIED ---

const GIFT_TIER_LABELS: Record<string, string> = {
  LIONHEART: "LionHeart",
  LIONHEART_PLUS: "LionHeart+",
  LIONHEART_PLUS_PLUS: "LionHeart++",
};

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Format money amounts with correct currency symbol
function formatMoney(amountCents: number | null | undefined, currency?: string | null): string {
  if (amountCents == null) return "unknown";
  const sym = currency === "eur" ? "\u20ac" : "$";
  return `${sym}${(amountCents / 100).toFixed(2)}`;
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Monthly gem allowance amounts per subscription tier
const MONTHLY_GEM_ALLOWANCE: Record<string, number> = {
  LIONHEART: 500,
  LIONHEART_PLUS: 1200,
  LIONHEART_PLUS_PLUS: 3000,
};
// --- END AI-MODIFIED ---

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Extract Discord user ID from a Stripe customer's metadata
async function getDiscordIdFromCustomer(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).metadata?.discordId || null;
  } catch {
    return null;
  }
}

// Determine subscription tier from a Stripe subscription's price
function getTierFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!priceId) return "NONE";
  const tier = getTierByPriceId(priceId);
  return tier?.id || "NONE";
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Server premium subscription handlers -- create/renew/cancel server premium via Stripe

async function handleServerPremiumCheckout(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.discordId || !metadata?.guildId) {
    console.error("Stripe webhook: missing server premium metadata on session", session.id);
    return;
  }

  const guildIdBig = BigInt(metadata.guildId);
  const userIdBig = BigInt(metadata.discordId);
  const plan = metadata.plan || "MONTHLY";

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : (session.subscription as any)?.id ?? null;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : (session.customer as any)?.id ?? null;

  if (!subscriptionId || !customerId) {
    console.error("Stripe webhook: server premium checkout missing subscription/customer ID");
    return;
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date(Date.now() + (plan === "YEARLY" ? 365 : 30) * 86400000);
  const periodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date();

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Use findFirst + create/update instead of upsert (PK is now auto-increment id, not guildid)
  await prisma.$transaction(async (tx) => {
    const existingRow = await tx.server_premium_subscriptions.findFirst({
      where: { stripe_subscription_id: subscriptionId },
    });

    if (existingRow) {
      await tx.server_premium_subscriptions.update({
        where: { id: existingRow.id },
        data: {
          guildid: guildIdBig,
          userid: userIdBig,
          stripe_customer_id: customerId,
          plan,
          status: "ACTIVE",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date(),
        },
      });
    } else {
      await tx.server_premium_subscriptions.create({
        data: {
          guildid: guildIdBig,
          userid: userIdBig,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: "ACTIVE",
          current_period_start: periodStart,
          current_period_end: periodEnd,
        },
      });
    }

    const existing = await tx.premium_guilds.findUnique({
      where: { guildid: guildIdBig },
    });

    if (existing) {
      const newUntil = existing.premium_until > periodEnd ? existing.premium_until : periodEnd;
      await tx.premium_guilds.update({
        where: { guildid: guildIdBig },
        data: { premium_until: newUntil },
      });
    } else {
      await tx.premium_guilds.create({
        data: {
          guildid: guildIdBig,
          premium_since: periodStart,
          premium_until: periodEnd,
        },
      });
    }
  });
  // --- END AI-MODIFIED ---

  console.log(
    `Stripe webhook: server premium activated for guild ${metadata.guildId} by user ${metadata.discordId} (${plan})`
  );

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Stripe audit log for server premium checkout
  const spAmount = formatMoney(session.amount_total, session.currency);
  sendStripeAuditLog({
    eventType: "checkout.session.completed",
    title: "Server Premium Checkout",
    description: `<@${metadata.discordId}> activated **${plan}** server premium for guild \`${metadata.guildId}\``,
    fields: [
      { name: "Amount", value: spAmount, inline: true },
      { name: "Plan", value: plan, inline: true },
      { name: "Guild", value: metadata.guildId, inline: true },
      { name: "Subscription", value: subscriptionId, inline: false },
    ],
  });
  // --- END AI-MODIFIED ---
}

async function handleServerPremiumSubscriptionUpdate(subscription: Stripe.Subscription) {
  const sub = await prisma.server_premium_subscriptions.findFirst({
    where: { stripe_subscription_id: subscription.id },
  });
  if (!sub) return false;

  const status = subscription.cancel_at_period_end ? "CANCELLING"
    : subscription.status === "active" ? "ACTIVE"
    : subscription.status === "past_due" ? "PAST_DUE"
    : subscription.status === "canceled" ? "CANCELLED"
    : "INACTIVE";

  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : null;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Update by id instead of guildid (PK changed to auto-increment)
  await prisma.server_premium_subscriptions.update({
    where: { id: sub.id },
    data: {
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: new Date(),
    },
  });

  if (periodEnd && (status === "ACTIVE" || status === "CANCELLING")) {
    const existing = await prisma.premium_guilds.findUnique({
      where: { guildid: sub.guildid },
    });
    if (existing) {
      const newUntil = existing.premium_until > periodEnd ? existing.premium_until : periodEnd;
      await prisma.premium_guilds.update({
        where: { guildid: sub.guildid },
        data: { premium_until: newUntil },
      });
    }
  }
  // --- END AI-MODIFIED ---

  console.log(
    `Stripe webhook: server premium subscription ${subscription.id} -> guild ${sub.guildid}, status=${status}`
  );

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Stripe audit log for server premium subscription updates
  sendStripeAuditLog({
    eventType: "customer.subscription.updated",
    title: "Server Premium Update",
    description: `Guild \`${sub.guildid}\` server premium status changed to **${status}**`,
    fields: [
      { name: "Status", value: status, inline: true },
      { name: "Subscription", value: subscription.id, inline: true },
    ],
  });
  // --- END AI-MODIFIED ---

  return true;
}

async function handleServerPremiumSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await prisma.server_premium_subscriptions.findFirst({
    where: { stripe_subscription_id: subscription.id },
  });
  if (!sub) return false;

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Update by id instead of guildid (PK changed to auto-increment)
  await prisma.server_premium_subscriptions.update({
    where: { id: sub.id },
    data: {
      status: "CANCELLED",
      updated_at: new Date(),
    },
  });
  // --- END AI-MODIFIED ---

  console.log(`Stripe webhook: server premium subscription deleted for guild ${sub.guildid}`);

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Stripe audit log for server premium cancellation
  sendStripeAuditLog({
    eventType: "customer.subscription.deleted",
    title: "Server Premium Cancelled",
    description: `Guild \`${sub.guildid}\` server premium subscription has been cancelled`,
    fields: [
      { name: "Subscription", value: subscription.id, inline: true },
    ],
  });
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-05-15) ---
  // Purpose: Notify on gift cancellations. We only DM recipient guild admins
  //          (and the sender) when this was a gift -- self-purchased server
  //          premium cancellations are surfaced via the existing dashboard
  //          UI, not Discord DMs.
  if (sub.gifted_by_userid) {
    await notifyGuildAdmins({
      guildId: sub.guildid,
      payload: {
        category: "server_gift_cancelled",
        title: "A gift ended",
        body: sub.gift_is_anonymous
          ? "The anonymous gifter cancelled their Server Premium gift. Premium continues until the current billing period ends."
          : `<@${sub.gifted_by_userid}> cancelled their Server Premium gift. Premium continues until the current billing period ends.`,
        link_url: "/dashboard/servers/" + sub.guildid,
        link_label: "Open server dashboard",
      },
      dedupKey: `server_gift_cancelled:${subscription.id}`,
    });
    await notifyUser({
      userId: sub.gifted_by_userid,
      payload: {
        category: "server_gift_cancelled",
        title: "Your gift was cancelled",
        body: "Your Server Premium gift has been cancelled. The recipient keeps premium through the end of the current billing period.",
        link_url: "/dashboard/gifts",
        link_label: "View your gifts",
      },
      dedupKey: `server_gift_cancelled_sender_ack:${subscription.id}`,
    });
  }
  // --- END AI-MODIFIED ---

  return true;
}

async function handleServerPremiumInvoice(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return false;

  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription.id;

  const sub = await prisma.server_premium_subscriptions.findFirst({
    where: { stripe_subscription_id: subscriptionId },
  });
  if (!sub) return false;

  const reference = `server_premium_${invoice.id}`;
  const existing = await prisma.premium_guilds.findUnique({
    where: { guildid: sub.guildid },
  });

  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  if (periodEnd && existing) {
    const newUntil = existing.premium_until > periodEnd ? existing.premium_until : periodEnd;
    await prisma.premium_guilds.update({
      where: { guildid: sub.guildid },
      data: { premium_until: newUntil },
    });
  } else if (periodEnd && !existing) {
    await prisma.premium_guilds.create({
      data: {
        guildid: sub.guildid,
        premium_since: new Date(),
        premium_until: periodEnd,
      },
    });
  }

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Update by id instead of guildid (PK changed to auto-increment)
  if (periodEnd) {
    await prisma.server_premium_subscriptions.update({
      where: { id: sub.id },
      data: {
        current_period_end: periodEnd,
        current_period_start: stripeSub.current_period_start
          ? new Date(stripeSub.current_period_start * 1000)
          : undefined,
        status: "ACTIVE",
        updated_at: new Date(),
      },
    });
  }
  // --- END AI-MODIFIED ---

  console.log(
    `Stripe webhook: server premium renewed for guild ${sub.guildid} (invoice ${invoice.id})`
  );

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Stripe audit log for server premium invoice renewal
  const spInvAmount = formatMoney(invoice.amount_paid, invoice.currency);
  sendStripeAuditLog({
    eventType: "invoice.payment_succeeded",
    title: "Invoice Paid (Server Premium)",
    description: `Server premium renewed for guild \`${sub.guildid}\``,
    fields: [
      { name: "Amount", value: spInvAmount, inline: true },
      { name: "Invoice", value: invoice.id, inline: true },
    ],
  });
  // --- END AI-MODIFIED ---

  return true;
}

async function isServerPremiumSubscription(subscriptionId: string): Promise<boolean> {
  const sub = await prisma.server_premium_subscriptions.findFirst({
    where: { stripe_subscription_id: subscriptionId },
    select: { guildid: true },
  });
  return !!sub;
}

// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-05-15) ---
// Purpose: Server Premium GIFT checkout completion. Same DB shape as a
//          self-purchased server premium row, but with gifted_by_userid,
//          gift_message, gift_is_anonymous filled so the recipient
//          dashboard can render the "gifted by @X" card.
async function handleServerPremiumGiftCheckout(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.senderId || !metadata?.recipientGuildId) {
    console.error("Stripe webhook: missing gift metadata on session", session.id);
    return;
  }

  const guildIdBig = BigInt(metadata.recipientGuildId);
  const senderIdBig = BigInt(metadata.senderId);
  const isAnonymous = metadata.gift_is_anonymous === "true";
  const giftMessage = metadata.gift_message?.trim() ? metadata.gift_message.trim() : null;

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : (session.subscription as any)?.id ?? null;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : (session.customer as any)?.id ?? null;

  if (!subscriptionId || !customerId) {
    console.error("Stripe webhook: server premium gift checkout missing subscription/customer ID");
    return;
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date(Date.now() + 30 * 86400000);
  const periodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date();

  await prisma.$transaction(async (tx) => {
    // Idempotency: if we already saw this subscription_id (duplicate webhook
    // delivery), just update the existing row instead of creating a duplicate.
    const existingRow = await tx.server_premium_subscriptions.findFirst({
      where: { stripe_subscription_id: subscriptionId },
    });

    if (existingRow) {
      await tx.server_premium_subscriptions.update({
        where: { id: existingRow.id },
        data: {
          guildid: guildIdBig,
          userid: senderIdBig,
          stripe_customer_id: customerId,
          plan: "MONTHLY",
          status: "ACTIVE",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          gifted_by_userid: senderIdBig,
          gift_message: giftMessage,
          gift_is_anonymous: isAnonymous,
          updated_at: new Date(),
        },
      });
    } else {
      await tx.server_premium_subscriptions.create({
        data: {
          guildid: guildIdBig,
          userid: senderIdBig,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: "MONTHLY",
          status: "ACTIVE",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          gifted_by_userid: senderIdBig,
          gift_message: giftMessage,
          gift_is_anonymous: isAnonymous,
        },
      });
    }

    // Extend premium_guilds.premium_until to at least periodEnd. Reuses the
    // same max-expiry logic the non-gift server premium checkout uses, so
    // overlapping sources (paid sub + gift + LH++ slot) all stack correctly.
    const existing = await tx.premium_guilds.findUnique({
      where: { guildid: guildIdBig },
    });

    if (existing) {
      const newUntil = existing.premium_until > periodEnd ? existing.premium_until : periodEnd;
      await tx.premium_guilds.update({
        where: { guildid: guildIdBig },
        data: { premium_until: newUntil },
      });
    } else {
      await tx.premium_guilds.create({
        data: {
          guildid: guildIdBig,
          premium_since: periodStart,
          premium_until: periodEnd,
        },
      });
    }
  });

  console.log(
    `Stripe webhook: server premium GIFT activated for guild ${metadata.recipientGuildId} from user ${metadata.senderId} (anonymous=${isAnonymous})`
  );

  const giftAmount = formatMoney(session.amount_total, session.currency);
  sendStripeAuditLog({
    eventType: "checkout.session.completed",
    title: "Server Premium Gift",
    description: `<@${metadata.senderId}> gifted **MONTHLY** server premium to guild \`${metadata.recipientGuildId}\`${isAnonymous ? " (anonymous)" : ""}`,
    fields: [
      { name: "Amount", value: giftAmount, inline: true },
      { name: "Recipient Guild", value: metadata.recipientGuildId, inline: true },
      { name: "Anonymous", value: isAnonymous ? "Yes" : "No", inline: true },
      { name: "Subscription", value: subscriptionId, inline: false },
      ...(giftMessage ? [{ name: "Message", value: giftMessage, inline: false }] : []),
    ],
  });

  // Notify all admins of the recipient guild. The bot module resolves admin
  // userids from its live permission cache at send-time, so we don't need a
  // members list here.
  await notifyGuildAdmins({
    guildId: guildIdBig,
    payload: {
      category: "server_gift_activated",
      title: "Your server received premium",
      body: isAnonymous
        ? "An anonymous gifter just activated Server Premium on your server."
        : `<@${metadata.senderId}> just activated Server Premium on your server.`,
      link_url: "/dashboard/servers/" + metadata.recipientGuildId,
      link_label: "Open server dashboard",
      context: {
        senderId: isAnonymous ? null : metadata.senderId,
        isAnonymous,
        message: giftMessage,
      },
    },
    dedupKey: `server_gift_activated:${subscriptionId}`,
  });

  // Sender ack: confirm the gift is live.
  await notifyUser({
    userId: senderIdBig,
    payload: {
      category: "server_gift_activated",
      title: "Your gift is on its way",
      body: "Server Premium just activated on your gift's recipient server. They've been notified.",
      link_url: "/dashboard/gifts",
      link_label: "Manage your gifts",
    },
    dedupKey: `server_gift_sender_ack:${subscriptionId}`,
  });
}

// Purpose: LionHeart user-gift checkout completion. The lionheart_gifts row
//          was pre-created in PENDING_CLAIM by the checkout endpoint; here
//          we back-fill the Stripe IDs and the first period_end. The gift
//          stays PENDING_CLAIM until the recipient claims via /gift/claim
//          (or until /api/cron/expire-gifts cancels it after 30 days).
async function handleLionheartGiftCheckout(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  const claimToken = metadata?.claim_token;
  if (!claimToken) {
    console.error("Stripe webhook: missing claim_token on LIONHEART_GIFT session", session.id);
    return;
  }

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : (session.subscription as any)?.id ?? null;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : (session.customer as any)?.id ?? null;

  if (!subscriptionId || !customerId) {
    console.error("Stripe webhook: LIONHEART_GIFT checkout missing subscription/customer ID");
    return;
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date(Date.now() + 30 * 86400000);

  const gift = await prisma.lionheart_gifts.findUnique({
    where: { claim_token: claimToken },
  });
  if (!gift) {
    console.error(`Stripe webhook: LIONHEART_GIFT row not found for claim_token ${claimToken}`);
    return;
  }

  // Idempotency: only update if not already filled (duplicate webhook delivery)
  if (gift.stripe_subscription_id && gift.stripe_subscription_id !== "") {
    console.log(`Stripe webhook: LIONHEART_GIFT row ${gift.id} already linked to subscription, skipping`);
    return;
  }

  await prisma.lionheart_gifts.update({
    where: { id: gift.id },
    data: {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      current_period_end: periodEnd,
      updated_at: new Date(),
    },
  });

  console.log(
    `Stripe webhook: LIONHEART_GIFT activated (PENDING_CLAIM) -- gift id=${gift.id}, tier=${gift.tier}, sender=${gift.sender_userid}, claim_token=${claimToken}`
  );

  const giftAmount = formatMoney(session.amount_total, session.currency);
  sendStripeAuditLog({
    eventType: "checkout.session.completed",
    title: "LionHeart Gift Purchased",
    description: `<@${gift.sender_userid}> bought a **${gift.tier}** gift (awaiting claim)${gift.gift_is_anonymous ? " (anonymous)" : ""}`,
    fields: [
      { name: "Amount", value: giftAmount, inline: true },
      { name: "Tier", value: gift.tier, inline: true },
      { name: "Gift ID", value: String(gift.id), inline: true },
      { name: "Claim Token", value: claimToken, inline: false },
      ...(gift.gift_message ? [{ name: "Message", value: gift.gift_message, inline: false }] : []),
    ],
  });

  // Email the sender with the claim URL so they have a persistent record
  // they can copy from any inbox. Fire-and-forget; sendEmail handles
  // missing-email / preference / kill-switch gracefully.
  const baseUrl = process.env.NEXTAUTH_URL || "https://lionbot.org";
  const claimUrl = `${baseUrl}/gift/claim/${claimToken}`;
  const tierLabel = GIFT_TIER_LABELS[gift.tier] ?? gift.tier;
  const expiresLabel = gift.claim_expires_at.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  sendEmail({
    userid: gift.sender_userid,
    template: "gift_claimable",
    subject: `Your ${tierLabel} gift is ready to share`,
    react: React.createElement(GiftClaimable, {
      tierLabel,
      claimUrl,
      expiresAtLabel: expiresLabel,
    }),
  }).catch((err: unknown) => {
    console.warn("gift-checkout webhook: sendEmail failed (non-fatal):", err);
  });
}

async function isLionheartGiftSubscription(subscriptionId: string): Promise<boolean> {
  const gift = await prisma.lionheart_gifts.findFirst({
    where: { stripe_subscription_id: subscriptionId },
    select: { id: true },
  });
  return !!gift;
}

// When the SENDER's gift sub changes status (e.g., cancels via Stripe Portal),
// reflect it in lionheart_gifts AND -- if the gift has been claimed -- mirror
// the change to the recipient's user_subscriptions. We never touch the sender's
// own user_subscriptions row from this path; the sender may have their own
// (separate) LionHeart sub that this gift does not affect.
async function handleLionheartGiftSubscriptionUpdate(subscription: Stripe.Subscription): Promise<boolean> {
  const gift = await prisma.lionheart_gifts.findFirst({
    where: { stripe_subscription_id: subscription.id },
  });
  if (!gift) return false;

  const giftStatus = subscription.cancel_at_period_end
    ? "CANCELLING"
    : subscription.status === "active"
    ? "ACTIVE"
    : subscription.status === "past_due"
    ? "PAST_DUE"
    : subscription.status === "canceled"
    ? "CANCELLED"
    : "INACTIVE";

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  // PENDING_CLAIM gifts stay PENDING_CLAIM until claimed/cancelled/expired --
  // sub state changes here don't promote them to ACTIVE.
  const nextStatus =
    gift.status === "PENDING_CLAIM" && giftStatus !== "CANCELLED"
      ? "PENDING_CLAIM"
      : giftStatus;

  await prisma.lionheart_gifts.update({
    where: { id: gift.id },
    data: {
      status: nextStatus,
      current_period_end: periodEnd ?? gift.current_period_end,
      updated_at: new Date(),
    },
  });

  // If the gift is claimed, mirror to recipient's user_subscriptions.
  if (gift.recipient_userid && periodEnd) {
    const recipientStatus =
      giftStatus === "CANCELLED"
        ? "CANCELLED"
        : giftStatus === "CANCELLING"
        ? "CANCELLING"
        : giftStatus === "PAST_DUE"
        ? "PAST_DUE"
        : "ACTIVE";

    await prisma.user_subscriptions.update({
      where: { userid: gift.recipient_userid },
      data: {
        status: recipientStatus,
        tier: giftStatus === "CANCELLED" ? "NONE" : gift.tier,
        current_period_end: periodEnd,
        updated_at: new Date(),
      },
    });

    // LH++ slot revocation for claimed gifts that just downgraded.
    if (giftStatus === "CANCELLED" && gift.tier === "LIONHEART_PLUS_PLUS") {
      const grant = await prisma.lionheart_server_premium.findUnique({
        where: { userid: gift.recipient_userid },
      });
      if (grant) {
        const revokedGuildId = grant.guildid;
        await prisma.lionheart_server_premium.delete({
          where: { userid: gift.recipient_userid },
        });
        if (revokedGuildId) {
          await recalculateGuildPremium(revokedGuildId);
        }
      }
    }
  }

  console.log(
    `Stripe webhook: LIONHEART_GIFT subscription ${subscription.id} -> gift id=${gift.id}, status=${nextStatus}`
  );

  sendStripeAuditLog({
    eventType: "customer.subscription.updated",
    title: "LionHeart Gift Subscription Update",
    description: `Gift id \`${gift.id}\` (sender <@${gift.sender_userid}>) status changed to **${nextStatus}**`,
    fields: [
      { name: "Status", value: nextStatus, inline: true },
      { name: "Tier", value: gift.tier, inline: true },
      { name: "Claimed", value: gift.recipient_userid ? "Yes" : "No", inline: true },
    ],
  });

  // Notify recipient + sender when a claimed gift ends. We don't DM on
  // CANCELLING (just scheduled to end at period end) -- only on the actual
  // CANCELLED transition. PENDING_CLAIM cancellations are silent (the sender
  // is informed via Stripe receipt + dashboard, the recipient never knew).
  if (nextStatus === "CANCELLED" && gift.recipient_userid) {
    await notifyUser({
      userId: gift.recipient_userid,
      payload: {
        category: "lionheart_gift_cancelled",
        title: "Your gifted LionHeart subscription ended",
        body: "The gifter cancelled the subscription. Your perks stay active through the current billing period, then your tier returns to Base.",
        link_url: "/dashboard/subscriptions",
        link_label: "View your subscription",
      },
      dedupKey: `lh_gift_cancelled_recipient:${gift.id}`,
    });
    await notifyUser({
      userId: gift.sender_userid,
      payload: {
        category: "lionheart_gift_cancelled",
        title: "Your gift was cancelled",
        body: "The LionHeart subscription you gifted has been cancelled. The recipient keeps perks through the current billing period.",
        link_url: "/dashboard/gifts",
        link_label: "View your gifts",
      },
      dedupKey: `lh_gift_cancelled_sender_ack:${gift.id}`,
    });
  }

  return true;
}

async function handleLionheartGiftSubscriptionDeleted(subscription: Stripe.Subscription): Promise<boolean> {
  // Re-uses the update path -- subscription.status === "canceled" maps to
  // giftStatus = "CANCELLED" which downgrades the recipient correctly.
  return handleLionheartGiftSubscriptionUpdate(subscription);
}

async function handleLionheartGiftInvoiceSucceeded(invoice: Stripe.Invoice): Promise<boolean> {
  if (!invoice.subscription) return false;

  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription.id;

  const gift = await prisma.lionheart_gifts.findFirst({
    where: { stripe_subscription_id: subscriptionId },
  });
  if (!gift) return false;

  // Skip upgrade-proration invoices (same logic as the LionHeart self-sub
  // handler). Only renew on subscription_create or subscription_cycle.
  const billingReason = invoice.billing_reason;
  const isRenewalLike =
    billingReason === "subscription_create" ||
    billingReason === "subscription_cycle";
  if (!isRenewalLike) {
    console.log(
      `Stripe webhook: LIONHEART_GIFT invoice ${invoice.id} skipped (billing_reason=${billingReason})`
    );
    return true;
  }

  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
  const newPeriodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  if (newPeriodEnd) {
    await prisma.lionheart_gifts.update({
      where: { id: gift.id },
      data: {
        current_period_end: newPeriodEnd,
        updated_at: new Date(),
      },
    });
  }

  // Only credit gems if claimed. Pre-claim, the gift is still PENDING_CLAIM
  // and no one owns the gems yet.
  if (!gift.recipient_userid) {
    console.log(
      `Stripe webhook: LIONHEART_GIFT invoice ${invoice.id} paid but gift still PENDING_CLAIM; no gem credit`
    );
    return true;
  }

  const gemAmount = MONTHLY_GEM_ALLOWANCE[gift.tier] || 0;
  if (gemAmount <= 0) return true;

  const reference = `gift_sub_gems_${invoice.id}`;
  const existing = await prisma.gem_transactions.findFirst({
    where: { reference },
  });
  if (existing) {
    console.log(`Stripe webhook: duplicate gift gem allowance for invoice ${invoice.id}, skipping`);
    return true;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user_config.upsert({
      where: { userid: gift.recipient_userid! },
      create: { userid: gift.recipient_userid!, gems: 0 },
      update: {},
    });

    await tx.$executeRaw`
      UPDATE user_config
      SET gems = COALESCE(gems, 0) + ${gemAmount}
      WHERE userid = ${gift.recipient_userid!}
    `;

    await tx.gem_transactions.create({
      data: {
        transaction_type: "AUTOMATIC",
        actorid: gift.recipient_userid!,
        from_account: null,
        to_account: gift.recipient_userid!,
        amount: gemAmount,
        description: `LionHeart gift gem allowance: ${gemAmount} LionGems (${gift.tier})`,
        reference,
        note: `Gift id ${gift.id} from user ${gift.sender_userid}`,
      },
    });

    // Mirror new period_end to recipient's user_subscriptions
    if (newPeriodEnd) {
      await tx.user_subscriptions.update({
        where: { userid: gift.recipient_userid! },
        data: {
          current_period_end: newPeriodEnd,
          status: "ACTIVE",
          updated_at: new Date(),
        },
      });
    }
  });

  // Extend LH++ slot guild premium if recipient set one
  if (gift.tier === "LIONHEART_PLUS_PLUS" && newPeriodEnd) {
    const lhGrant = await prisma.lionheart_server_premium.findUnique({
      where: { userid: gift.recipient_userid! },
    });
    if (lhGrant?.guildid) {
      const guildPremium = await prisma.premium_guilds.findUnique({
        where: { guildid: lhGrant.guildid },
      });
      if (guildPremium) {
        const newUntil =
          guildPremium.premium_until > newPeriodEnd
            ? guildPremium.premium_until
            : newPeriodEnd;
        await prisma.premium_guilds.update({
          where: { guildid: lhGrant.guildid },
          data: { premium_until: newUntil },
        });
      } else {
        await prisma.premium_guilds.create({
          data: {
            guildid: lhGrant.guildid,
            premium_since: new Date(),
            premium_until: newPeriodEnd,
          },
        });
      }
    }
  }

  console.log(
    `Stripe webhook: credited ${gemAmount} monthly gems to gift recipient ${gift.recipient_userid} (gift ${gift.id})`
  );

  sendGemAuditLog({
    transactionType: "AUTOMATIC",
    amount: gemAmount,
    actorId: gift.recipient_userid.toString(),
    fromAccount: null,
    toAccount: gift.recipient_userid.toString(),
    description: `LionHeart gift gem allowance: ${gemAmount} LionGems (${gift.tier})`,
    note: `Gift id ${gift.id} from user ${gift.sender_userid}`,
    reference,
  });

  return true;
}
// --- END AI-MODIFIED ---

async function handleOneTimeGemPurchase(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.discordId || !metadata?.totalGems) {
    console.error("Stripe webhook: missing metadata on session", session.id);
    return;
  }

  const discordIdBig = BigInt(metadata.discordId);
  const totalGems = parseInt(metadata.totalGems, 10);

  if (isNaN(totalGems) || totalGems <= 0) {
    console.error("Stripe webhook: invalid totalGems", metadata.totalGems);
    return;
  }

  const existing = await prisma.gem_transactions.findFirst({
    where: { reference: session.id },
  });
  if (existing) {
    console.log(`Stripe webhook: duplicate session ${session.id}, skipping`);
    return;
  }

  const amountPaid = formatMoney(session.amount_total, session.currency);

  await prisma.$transaction(async (tx) => {
    await tx.user_config.upsert({
      where: { userid: discordIdBig },
      create: { userid: discordIdBig, gems: 0 },
      update: {},
    });

    await tx.$executeRaw`
      UPDATE user_config
      SET gems = COALESCE(gems, 0) + ${totalGems}
      WHERE userid = ${discordIdBig}
    `;

    await tx.gem_transactions.create({
      data: {
        transaction_type: "AUTOMATIC",
        actorid: discordIdBig,
        from_account: null,
        to_account: discordIdBig,
        amount: totalGems,
        description: `Stripe purchase: ${totalGems} LionGems (${amountPaid})`,
        reference: session.id,
        note: metadata.discordName
          ? `Discord user: ${metadata.discordName}`
          : null,
      },
    });
  });

  console.log(
    `Stripe webhook: credited ${totalGems} gems to Discord user ${metadata.discordId} (session ${session.id})`
  );

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Gem audit + Stripe money audit for one-time gem purchase
  sendGemAuditLog({
    transactionType: "AUTOMATIC",
    amount: totalGems,
    actorId: metadata.discordId,
    fromAccount: null,
    toAccount: metadata.discordId,
    description: `Stripe purchase: ${totalGems} LionGems (${amountPaid})`,
    note: metadata.discordName ? `Discord user: ${metadata.discordName}` : null,
    reference: session.id,
  });
  sendStripeAuditLog({
    eventType: "checkout.session.completed",
    title: "Gem Purchase",
    description: `<@${metadata.discordId}> bought **${totalGems} LionGems** for **${amountPaid}**`,
    fields: [
      { name: "Gems", value: String(totalGems), inline: true },
      { name: "Paid", value: amountPaid, inline: true },
      { name: "Session", value: session.id, inline: false },
    ],
  });
  // --- END AI-MODIFIED ---
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Handle subscription creation/update/deletion and monthly gem allowance

async function handleSubscriptionCreatedOrUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const discordId = await getDiscordIdFromCustomer(customerId);
  if (!discordId) {
    console.error(`Stripe webhook: no discordId for customer ${customerId}`);
    return;
  }

  const tier = getTierFromSubscription(subscription);

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Detect cancel_at_period_end so the UI can show "Cancelling" state
  //          instead of "Active" for subscriptions scheduled to cancel
  const status = subscription.cancel_at_period_end ? "CANCELLING"
    : subscription.status === "active" ? "ACTIVE"
    : subscription.status === "past_due" ? "PAST_DUE"
    : subscription.status === "canceled" ? "CANCELLED"
    : "INACTIVE";
  // --- END AI-MODIFIED ---

  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : null;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  // --- AI-MODIFIED (2026-04-26) ---
  // Purpose: Read the old tier / subscription id BEFORE the upsert so we can
  //          detect a mid-cycle tier upgrade and credit the gem delta. The
  //          legacy "previousSub" fetch below used to happen AFTER the upsert,
  //          which meant it always returned the already-updated NEW tier and
  //          was effectively dead code.
  const userIdBig = BigInt(discordId);
  const previousDbRow = await prisma.user_subscriptions.findUnique({
    where: { userid: userIdBig },
    select: { tier: true, stripe_subscription_id: true },
  });
  const oldTier: string = previousDbRow?.tier ?? "NONE";
  const sameSubscription = previousDbRow?.stripe_subscription_id === subscription.id;
  // --- END AI-MODIFIED ---

  await prisma.user_subscriptions.upsert({
    where: { userid: BigInt(discordId) },
    create: {
      userid: BigInt(discordId),
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier,
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
    },
    update: {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier: status === "CANCELLED" ? "NONE" : tier,
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: new Date(),
    },
  });

  // --- AI-MODIFIED (2026-04-26) ---
  // Purpose: Mid-cycle tier upgrade gem top-up. When a user upgrades (e.g. LH+
  //          -> LH++) mid-cycle, Stripe charges the prorated difference
  //          immediately (portal is configured with proration_behavior:
  //          "always_invoice"), but the proration invoice fires with
  //          billing_reason="subscription_update" which we now skip in
  //          handleInvoicePaymentSucceeded. So the gem top-up must happen
  //          here instead. We only credit when:
  //            - The subscription id is the same (not a brand-new sub after
  //              cancellation, which handleInvoicePaymentSucceeded already covers)
  //            - Status is ACTIVE or CANCELLING (payment succeeded -- if the
  //              card declined the sub is PAST_DUE/INCOMPLETE and no gems)
  //            - The new tier's monthly allowance is strictly greater than the
  //              old tier's (upgrade, not downgrade -- downgrades keep gems)
  //          Idempotency is per (subscription, period_start, old_tier, new_tier)
  //          so duplicate webhook deliveries don't double-credit, and a user
  //          who upgrades again in a later cycle gets a fresh credit.
  const effectiveTier = status === "CANCELLED" ? "NONE" : tier;
  const oldAllowance = MONTHLY_GEM_ALLOWANCE[oldTier] ?? 0;
  const newAllowance = MONTHLY_GEM_ALLOWANCE[effectiveTier] ?? 0;
  const isActiveLike = status === "ACTIVE" || status === "CANCELLING";
  const isUpgrade =
    sameSubscription &&
    isActiveLike &&
    oldTier !== effectiveTier &&
    newAllowance > oldAllowance;

  if (isUpgrade) {
    const gemDelta = newAllowance - oldAllowance;
    const periodStartKey = periodStart
      ? periodStart.toISOString().slice(0, 10)
      : "unknown";
    const upgradeReference = `sub_upgrade_gems_${subscription.id}_${periodStartKey}_${oldTier}_to_${effectiveTier}`;

    const existing = await prisma.gem_transactions.findFirst({
      where: { reference: upgradeReference },
    });

    if (!existing) {
      await prisma.$transaction(async (tx) => {
        await tx.user_config.upsert({
          where: { userid: userIdBig },
          create: { userid: userIdBig, gems: 0 },
          update: {},
        });

        await tx.$executeRaw`
          UPDATE user_config
          SET gems = COALESCE(gems, 0) + ${gemDelta}
          WHERE userid = ${userIdBig}
        `;

        await tx.gem_transactions.create({
          data: {
            transaction_type: "AUTOMATIC",
            actorid: userIdBig,
            from_account: null,
            to_account: userIdBig,
            amount: gemDelta,
            description: `LionHeart upgrade gem top-up: ${gemDelta} gems (${oldTier} -> ${effectiveTier})`,
            reference: upgradeReference,
            note: `Subscription: ${subscription.id}`,
          },
        });
      });

      console.log(
        `Stripe webhook: credited ${gemDelta} upgrade-delta gems to user ${discordId} (${oldTier} -> ${effectiveTier})`
      );

      sendGemAuditLog({
        transactionType: "AUTOMATIC",
        amount: gemDelta,
        actorId: discordId,
        fromAccount: null,
        toAccount: discordId,
        description: `LionHeart upgrade gem top-up: ${gemDelta} gems (${oldTier} -> ${effectiveTier})`,
        note: `Subscription: ${subscription.id}`,
        reference: upgradeReference,
      });
    } else {
      console.log(
        `Stripe webhook: upgrade gem top-up already credited for ${upgradeReference}, skipping`
      );
    }
  }
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Manage LionHeart++ included server premium lifecycle on tier changes

  if (effectiveTier === "LIONHEART_PLUS_PLUS") {
    const existingGrant = await prisma.lionheart_server_premium.findUnique({
      where: { userid: userIdBig },
    });
    if (!existingGrant) {
      await prisma.lionheart_server_premium.create({
        data: { userid: userIdBig, guildid: null },
      });
      console.log(`Stripe webhook: created lionheart_server_premium slot for user ${discordId}`);
    } else if (existingGrant.guildid && periodEnd) {
      const existing = await prisma.premium_guilds.findUnique({
        where: { guildid: existingGrant.guildid },
      });
      if (existing) {
        const newUntil = existing.premium_until > periodEnd ? existing.premium_until : periodEnd;
        await prisma.premium_guilds.update({
          where: { guildid: existingGrant.guildid },
          data: { premium_until: newUntil },
        });
      }
    }
  } else if (effectiveTier !== "LIONHEART_PLUS_PLUS") {
    const grant = await prisma.lionheart_server_premium.findUnique({
      where: { userid: userIdBig },
    });
    if (grant) {
      const revokedGuildId = grant.guildid;
      await prisma.lionheart_server_premium.delete({
        where: { userid: userIdBig },
      });
      if (revokedGuildId) {
        await recalculateGuildPremium(revokedGuildId);
        console.log(`Stripe webhook: revoked LH++ server premium from guild ${revokedGuildId} (user ${discordId} downgraded)`);
      }
    }
  }
  // --- END AI-MODIFIED ---

  console.log(
    `Stripe webhook: subscription ${subscription.id} -> user ${discordId}, tier=${tier}, status=${status}`
  );

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Stripe audit log for LionHeart subscription create/update
  sendStripeAuditLog({
    eventType: "customer.subscription.updated",
    title: "LionHeart Subscription Update",
    description: `<@${discordId}> subscription changed to **${tier}** (${status})`,
    fields: [
      { name: "Tier", value: tier, inline: true },
      { name: "Status", value: status, inline: true },
      { name: "Subscription", value: subscription.id, inline: false },
    ],
  });
  // --- END AI-MODIFIED ---
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const discordId = await getDiscordIdFromCustomer(customerId);
  if (!discordId) {
    console.error(`Stripe webhook: no discordId for customer ${customerId} on deletion`);
    return;
  }

  await prisma.user_subscriptions.upsert({
    where: { userid: BigInt(discordId) },
    create: {
      userid: BigInt(discordId),
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier: "NONE",
      status: "CANCELLED",
    },
    update: {
      tier: "NONE",
      status: "CANCELLED",
      updated_at: new Date(),
    },
  });

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Revoke LionHeart++ server premium on subscription deletion
  const deletedUserIdBig = BigInt(discordId);
  const deletedGrant = await prisma.lionheart_server_premium.findUnique({
    where: { userid: deletedUserIdBig },
  });
  if (deletedGrant) {
    const revokedGuildId = deletedGrant.guildid;
    await prisma.lionheart_server_premium.delete({
      where: { userid: deletedUserIdBig },
    });
    if (revokedGuildId) {
      await recalculateGuildPremium(revokedGuildId);
      console.log(`Stripe webhook: revoked LH++ server premium from guild ${revokedGuildId} (user ${discordId} cancelled)`);
    }
  }
  // --- END AI-MODIFIED ---

  console.log(`Stripe webhook: subscription deleted for user ${discordId}`);

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Stripe audit log for LionHeart subscription cancellation
  sendStripeAuditLog({
    eventType: "customer.subscription.deleted",
    title: "LionHeart Subscription Cancelled",
    description: `<@${discordId}> subscription has been cancelled`,
    fields: [
      { name: "Subscription", value: subscription.id, inline: true },
    ],
  });
  // --- END AI-MODIFIED ---
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  // --- AI-MODIFIED (2026-04-26) ---
  // Purpose: Skip the full monthly gem allowance for upgrade-proration invoices
  //          (billing_reason === "subscription_update"). With the Stripe portal
  //          configured to proration_behavior: "always_invoice", a mid-cycle
  //          tier upgrade generates an immediate invoice whose payment_succeeded
  //          event would otherwise double-credit gems on top of the tier-delta
  //          credit that handleSubscriptionCreatedOrUpdated already applies.
  //          Only the initial invoice (subscription_create) and monthly / yearly
  //          renewals (subscription_cycle) should grant the full allowance.
  const billingReason = invoice.billing_reason;
  const isRenewalLike =
    billingReason === "subscription_create" ||
    billingReason === "subscription_cycle";
  if (!isRenewalLike) {
    console.log(
      `Stripe webhook: skipping monthly gem allowance for invoice ${invoice.id} (billing_reason=${billingReason})`
    );
    return;
  }
  // --- END AI-MODIFIED ---

  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;
  if (!customerId) return;

  const discordId = await getDiscordIdFromCustomer(customerId);
  if (!discordId) return;

  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription.id;

  const sub = await prisma.user_subscriptions.findUnique({
    where: { userid: BigInt(discordId) },
  });
  if (!sub || sub.tier === "NONE") return;

  const gemAmount = MONTHLY_GEM_ALLOWANCE[sub.tier] || 0;
  if (gemAmount <= 0) return;

  const reference = `sub_gems_${invoice.id}`;
  const existing = await prisma.gem_transactions.findFirst({
    where: { reference },
  });
  if (existing) {
    console.log(`Stripe webhook: duplicate gem allowance for invoice ${invoice.id}, skipping`);
    return;
  }

  const discordIdBig = BigInt(discordId);

  await prisma.$transaction(async (tx) => {
    await tx.user_config.upsert({
      where: { userid: discordIdBig },
      create: { userid: discordIdBig, gems: 0 },
      update: {},
    });

    await tx.$executeRaw`
      UPDATE user_config
      SET gems = COALESCE(gems, 0) + ${gemAmount}
      WHERE userid = ${discordIdBig}
    `;

    await tx.gem_transactions.create({
      data: {
        transaction_type: "AUTOMATIC",
        actorid: discordIdBig,
        from_account: null,
        to_account: discordIdBig,
        amount: gemAmount,
        description: `LionHeart monthly gem allowance: ${gemAmount} LionGems (${sub.tier})`,
        reference,
        note: `Subscription: ${subscriptionId}`,
      },
    });
  });

  console.log(
    `Stripe webhook: credited ${gemAmount} monthly gems to user ${discordId} (${sub.tier})`
  );

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Gem audit + Stripe money audit for LionHeart monthly gem allowance
  sendGemAuditLog({
    transactionType: "AUTOMATIC",
    amount: gemAmount,
    actorId: discordId,
    fromAccount: null,
    toAccount: discordId,
    description: `LionHeart monthly gem allowance: ${gemAmount} LionGems (${sub.tier})`,
    note: `Subscription: ${subscriptionId}`,
    reference,
  });
  const invAmount = formatMoney(invoice.amount_paid, invoice.currency);
  sendStripeAuditLog({
    eventType: "invoice.payment_succeeded",
    title: "Invoice Paid (LionHeart)",
    description: `<@${discordId}> renewed **${sub.tier}** — credited **${gemAmount} gems**`,
    fields: [
      { name: "Amount", value: invAmount, inline: true },
      { name: "Tier", value: sub.tier, inline: true },
      { name: "Gems Credited", value: String(gemAmount), inline: true },
      { name: "Invoice", value: invoice.id, inline: false },
    ],
  });
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Extend LionHeart++ server premium guild on subscription renewal
  if (sub.tier === "LIONHEART_PLUS_PLUS") {
    const lhGrant = await prisma.lionheart_server_premium.findUnique({
      where: { userid: discordIdBig },
    });
    if (lhGrant?.guildid) {
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const newPeriodEnd = stripeSub.current_period_end
        ? new Date(stripeSub.current_period_end * 1000)
        : null;
      if (newPeriodEnd) {
        const guildPremium = await prisma.premium_guilds.findUnique({
          where: { guildid: lhGrant.guildid },
        });
        if (guildPremium) {
          const newUntil = guildPremium.premium_until > newPeriodEnd
            ? guildPremium.premium_until
            : newPeriodEnd;
          await prisma.premium_guilds.update({
            where: { guildid: lhGrant.guildid },
            data: { premium_until: newUntil },
          });
        } else {
          await prisma.premium_guilds.create({
            data: {
              guildid: lhGrant.guildid,
              premium_since: new Date(),
              premium_until: newPeriodEnd,
            },
          });
        }
        console.log(
          `Stripe webhook: extended LH++ server premium for guild ${lhGrant.guildid} until ${newPeriodEnd.toISOString()}`
        );
      }
    }
  }
  // --- END AI-MODIFIED ---
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;
  if (!customerId) return;

  const discordId = await getDiscordIdFromCustomer(customerId);
  if (!discordId) return;

  await prisma.user_subscriptions.updateMany({
    where: { userid: BigInt(discordId) },
    data: { status: "PAST_DUE", updated_at: new Date() },
  });

  console.log(`Stripe webhook: payment failed for user ${discordId}, set PAST_DUE`);

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Stripe audit log for LionHeart payment failure
  sendStripeAuditLog({
    eventType: "invoice.payment_failed",
    title: "Payment Failed (LionHeart)",
    description: `<@${discordId}> payment failed — subscription set to **PAST_DUE**`,
    fields: [
      { name: "Invoice", value: invoice.id, inline: true },
    ],
  });
  // --- END AI-MODIFIED ---
}

// --- END AI-MODIFIED ---

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"] as string;
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Don't leak Stripe error details to caller
  // --- Original code (commented out for rollback) ---
  // } catch (err: any) {
  //   console.error(`Stripe webhook signature verification failed: ${err.message}`);
  //   return res.status(400).send(`Webhook Error: ${err.message}`);
  // }
  // --- End original code ---
  } catch (err: any) {
    console.error(`Stripe webhook signature verification failed: ${err.message}`);
    return res.status(400).send("Webhook signature verification failed");
  }
  // --- END AI-MODIFIED ---

  try {
    switch (event.type) {
      // --- AI-MODIFIED (2026-03-22) ---
      // Purpose: Handle one-time payments, LionHeart subscriptions, AND server premium subscriptions
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.metadata?.type === "SERVER_PREMIUM_GIFT") {
          await handleServerPremiumGiftCheckout(session);
        } else if (session.mode === "subscription" && session.metadata?.type === "LIONHEART_GIFT") {
          await handleLionheartGiftCheckout(session);
        } else if (session.mode === "subscription" && session.metadata?.type === "SERVER_PREMIUM") {
          await handleServerPremiumCheckout(session);
        } else if (session.mode === "subscription") {
          console.log(`Stripe webhook: LionHeart subscription checkout completed, session ${session.id}`);
          // --- AI-MODIFIED (2026-03-23) ---
          // Purpose: Stripe audit log for LionHeart subscription checkout
          const lhTier = session.metadata?.tier || "unknown";
          const lhAmount = formatMoney(session.amount_total, session.currency);
          sendStripeAuditLog({
            eventType: "checkout.session.completed",
            title: "LionHeart Subscription Checkout",
            description: session.metadata?.discordId
              ? `<@${session.metadata.discordId}> subscribed to **${lhTier}** for **${lhAmount}/mo**`
              : `New LionHeart subscription: **${lhTier}** for **${lhAmount}/mo**`,
            fields: [
              { name: "Tier", value: lhTier, inline: true },
              { name: "Amount", value: lhAmount, inline: true },
              { name: "Session", value: session.id, inline: false },
            ],
          });
          // --- END AI-MODIFIED ---
        } else {
          await handleOneTimeGemPurchase(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;
        // LIONHEART_GIFT subs must be checked BEFORE the regular LionHeart
        // sub handler -- otherwise that handler would update the SENDER's
        // user_subscriptions row, which the sender doesn't own (the gift is
        // a separate sub paid by sender for someone else).
        if (await isLionheartGiftSubscription(subId)) {
          await handleLionheartGiftSubscriptionUpdate(subscription);
        } else if (await isServerPremiumSubscription(subId)) {
          await handleServerPremiumSubscriptionUpdate(subscription);
        } else {
          await handleSubscriptionCreatedOrUpdated(subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;
        if (await isLionheartGiftSubscription(subId)) {
          await handleLionheartGiftSubscriptionDeleted(subscription);
        } else if (await isServerPremiumSubscription(subId)) {
          await handleServerPremiumSubscriptionDeleted(subscription);
        } else {
          await handleSubscriptionDeleted(subscription);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
        let handled = false;
        if (invoiceSubId) {
          handled = await handleLionheartGiftInvoiceSucceeded(invoice);
          if (!handled) handled = await handleServerPremiumInvoice(invoice);
        }
        if (!handled) {
          await handleInvoicePaymentSucceeded(invoice);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const failedSubId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
        if (failedSubId && await isLionheartGiftSubscription(failedSubId)) {
          // Mark the gift PAST_DUE and mirror to claimed recipient if any.
          // We reuse the update path which handles both flows.
          const stripeSub = await stripe.subscriptions.retrieve(failedSubId);
          await handleLionheartGiftSubscriptionUpdate(stripeSub);
          console.log(`Stripe webhook: LIONHEART_GIFT payment failed for subscription ${failedSubId}`);
        } else if (failedSubId && await isServerPremiumSubscription(failedSubId)) {
          const sub = await prisma.server_premium_subscriptions.findFirst({
            where: { stripe_subscription_id: failedSubId },
          });
          if (sub) {
            // --- AI-MODIFIED (2026-03-23) ---
            // Purpose: Update by id instead of guildid (PK changed to auto-increment)
            await prisma.server_premium_subscriptions.update({
              where: { id: sub.id },
              data: { status: "PAST_DUE", updated_at: new Date() },
            });
            // --- END AI-MODIFIED ---
            console.log(`Stripe webhook: server premium payment failed for guild ${sub.guildid}`);
            // --- AI-MODIFIED (2026-03-23) ---
            // Purpose: Stripe audit log for server premium payment failure
            sendStripeAuditLog({
              eventType: "invoice.payment_failed",
              title: "Payment Failed (Server Premium)",
              description: `Server premium payment failed for guild \`${sub.guildid}\``,
              fields: [
                { name: "Invoice", value: invoice.id, inline: true },
              ],
            });
            // --- END AI-MODIFIED ---
          }
        } else {
          await handleInvoicePaymentFailed(invoice);
        }
        break;
      }
      // --- END AI-MODIFIED ---

      default:
        console.log(`Stripe webhook: unhandled event type ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Stripe webhook: error processing ${event.type}:`, err);
    return res.status(500).json({ error: "Processing error" });
  }

  return res.status(200).json({ received: true });
}
