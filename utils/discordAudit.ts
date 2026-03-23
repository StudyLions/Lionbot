// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Discord webhook helpers for gem transaction audit logs
//          and Stripe payment audit logs. Fire-and-forget -- never
//          blocks the caller and swallows errors with console.error.
// ============================================================

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: { text: string };
}

async function postWebhook(webhookUrl: string, embeds: DiscordEmbed[]): Promise<void> {
  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds }),
    });
    if (!resp.ok) {
      console.error(`Discord webhook failed (${resp.status}): ${await resp.text().catch(() => "")}`);
    }
  } catch (err) {
    console.error("Discord webhook error:", err);
  }
}

// ------------------------------------------------------------------
// Gem transaction audit log  →  channel 1168243242039529482
// Mirrors the bot's PremiumCog.audit_log() embed format.
// ------------------------------------------------------------------

export interface GemAuditEntry {
  transactionId?: number;
  transactionType: string;
  amount: number;
  actorId: string;
  fromAccount?: string | null;
  toAccount?: string | null;
  description: string;
  note?: string | null;
  reference?: string | null;
}

export function sendGemAuditLog(entry: GemAuditEntry): void {
  const url = process.env.DISCORD_GEM_AUDIT_WEBHOOK;
  if (!url) return;

  const fields: DiscordEmbedField[] = [
    { name: "Type", value: entry.transactionType, inline: true },
    { name: "Amount", value: String(entry.amount), inline: true },
    { name: "Actor", value: `<@${entry.actorId}>`, inline: true },
    { name: "From Account", value: entry.fromAccount ? `<@${entry.fromAccount}>` : "None", inline: true },
    { name: "To Account", value: entry.toAccount ? `<@${entry.toAccount}>` : "None", inline: true },
    { name: "Description", value: entry.description, inline: false },
  ];
  if (entry.note) {
    fields.push({ name: "Note", value: entry.note, inline: false });
  }
  if (entry.reference) {
    fields.push({ name: "Reference", value: entry.reference, inline: false });
  }

  const title = entry.transactionId
    ? `Gem Transaction #${entry.transactionId}`
    : "Gem Transaction";

  postWebhook(url, [{
    title,
    color: 0xF4900C, // orange, matches bot embed
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "Website" },
  }]);
}

// ------------------------------------------------------------------
// Stripe money audit log  →  channel 1485562459208155280
// Only fires for LionBot-relevant events (filtering is handled by
// callers -- only our handler functions call this).
// ------------------------------------------------------------------

export interface StripeAuditEntry {
  eventType: string;
  title: string;
  description: string;
  fields?: DiscordEmbedField[];
}

export function sendStripeAuditLog(entry: StripeAuditEntry): void {
  const url = process.env.DISCORD_STRIPE_AUDIT_WEBHOOK;
  if (!url) return;

  const fields: DiscordEmbedField[] = [
    { name: "Event", value: entry.eventType, inline: true },
    ...(entry.fields || []),
  ];

  postWebhook(url, [{
    title: entry.title,
    description: entry.description,
    color: 0x5865F2, // blurple
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "Stripe Webhook" },
  }]);
}
