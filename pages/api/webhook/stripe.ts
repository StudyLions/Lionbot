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

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
  const spAmount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : "unknown";
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
  const spInvAmount = invoice.amount_paid != null ? `$${(invoice.amount_paid / 100).toFixed(2)}` : "unknown";
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

  const amountPaid = session.amount_total
    ? `$${(session.amount_total / 100).toFixed(2)}`
    : "unknown";

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

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Manage LionHeart++ included server premium lifecycle on tier changes
  const userIdBig = BigInt(discordId);
  const previousSub = await prisma.user_subscriptions.findUnique({
    where: { userid: userIdBig },
    select: { tier: true },
  });
  const effectiveTier = status === "CANCELLED" ? "NONE" : tier;

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
  const invAmount = invoice.amount_paid != null ? `$${(invoice.amount_paid / 100).toFixed(2)}` : "unknown";
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
        if (session.mode === "subscription" && session.metadata?.type === "SERVER_PREMIUM") {
          await handleServerPremiumCheckout(session);
        } else if (session.mode === "subscription") {
          console.log(`Stripe webhook: LionHeart subscription checkout completed, session ${session.id}`);
          // --- AI-MODIFIED (2026-03-23) ---
          // Purpose: Stripe audit log for LionHeart subscription checkout
          const lhTier = session.metadata?.tier || "unknown";
          const lhAmount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : "unknown";
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
        const isServerPremium = await isServerPremiumSubscription(subId);
        if (isServerPremium) {
          await handleServerPremiumSubscriptionUpdate(subscription);
        } else {
          await handleSubscriptionCreatedOrUpdated(subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;
        const isServerPremium = await isServerPremiumSubscription(subId);
        if (isServerPremium) {
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
        let handledByServerPremium = false;
        if (invoiceSubId) {
          handledByServerPremium = await handleServerPremiumInvoice(invoice);
        }
        if (!handledByServerPremium) {
          await handleInvoicePaymentSucceeded(invoice);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const failedSubId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
        if (failedSubId && await isServerPremiumSubscription(failedSubId)) {
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
