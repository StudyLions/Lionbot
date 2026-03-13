// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Stripe webhook handler that automatically credits
//          LionGems to users after successful checkout payment.
//          Replaces the manual /leo gems admin command workflow.
// ============================================================
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/utils/prisma";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
  } catch (err: any) {
    console.error(`Stripe webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata?.discordId || !metadata?.totalGems) {
      console.error("Stripe webhook: missing metadata on session", session.id);
      return res.status(200).json({ received: true, skipped: "missing metadata" });
    }

    const discordIdBig = BigInt(metadata.discordId);
    const totalGems = parseInt(metadata.totalGems, 10);

    if (isNaN(totalGems) || totalGems <= 0) {
      console.error("Stripe webhook: invalid totalGems", metadata.totalGems);
      return res.status(200).json({ received: true, skipped: "invalid gem amount" });
    }

    try {
      const existing = await prisma.gem_transactions.findFirst({
        where: { reference: session.id },
      });
      if (existing) {
        console.log(`Stripe webhook: duplicate session ${session.id}, skipping`);
        return res.status(200).json({ received: true, skipped: "duplicate" });
      }

      const amountPaid = session.amount_total
        ? `€${(session.amount_total / 100).toFixed(2)}`
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
    } catch (err: any) {
      console.error(`Stripe webhook: DB error for session ${session.id}:`, err);
      return res.status(500).json({ error: "Database error" });
    }
  }

  return res.status(200).json({ received: true });
}
