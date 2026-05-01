// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Single canonical "is this guild premium?" helper for all
//          dashboard API routes that need to gate features by premium.
//
//          Before this file existed, the same 4-line query was duplicated
//          inline in 8+ API routes (anti-afk, sticky-messages, leaderboard-
//          autopost, premium-pomodoro, branding, ambient-sounds, listing,
//          text-overrides). Each one had the same shape but different
//          variable names (`row` vs `guild` vs `premium`) and slightly
//          different null-handling.
//
//          Centralizing here:
//          - Avoids accidental drift in the comparison (e.g. `>=` vs `>`
//            for the date comparison, which subtly affects the moment a
//            subscription technically expires).
//          - Gives us one place to add a grace period later (e.g. listings
//            already use a 30-day post-expiry grace; we may want similar
//            for other features).
//          - Easy to mock in tests if/when we add them.
//
//          Migration of the inline copies will happen opportunistically as
//          those files get touched for other reasons. Setup-checklist
//          adoption is the smoke test.
// ============================================================
import { prisma } from "@/utils/prisma"

/**
 * Is the guild currently a premium server?
 *
 * Returns true iff a `premium_guilds` row exists for this guild AND its
 * `premium_until` is strictly in the future. The strict-greater-than is
 * important: if a subscription expires at exactly NOW, the next request
 * should return false (otherwise a feature could keep working for a few
 * extra seconds during a Stripe webhook race).
 *
 * Safe to call from any API route that already has a parsed `bigint`
 * guild ID. No auth check inside this function -- the caller is
 * responsible for authorising the request before reading premium state.
 */
export async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row?.premium_until && row.premium_until > new Date()
}

/**
 * Same as `isPremiumGuild` but also returns the expiry timestamp so
 * callers can render "Premium until {date}" copy without a second query.
 *
 * Returns `{ isPremium: false, premiumUntil: null }` for guilds that are
 * either not premium or have never been premium.
 */
export async function getPremiumStatus(
  guildId: bigint,
): Promise<{ isPremium: boolean; premiumUntil: Date | null }> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  const premiumUntil = row?.premium_until ?? null
  return {
    isPremium: !!premiumUntil && premiumUntil > new Date(),
    premiumUntil,
  }
}
