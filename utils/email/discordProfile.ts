// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Preserve Discord's email verification through NextAuth's
//          normalized sign-in profile, without changing identity or avatars.
// ============================================================
export function preserveDiscordEmailVerification<T extends Record<string, unknown>>(
  rawProfile: { verified?: unknown },
  normalizedProfile: T
): T & { emailVerified: boolean | null } {
  return {
    ...normalizedProfile,
    emailVerified: typeof rawProfile.verified === "boolean" ? rawProfile.verified : null,
  }
}
