// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Single source of truth for the Anki addon bearer JWT
//          version sentinel. Mirrors the iOS pattern at
//          lib/ios/version.ts — bumping this value invalidates
//          every existing Anki addon session atomically.
//
//          Used by lib/anki/auth.ts (mint + verify). If a future
//          edge-runtime middleware ever needs to verify an Anki
//          bearer (we have no use case today), it should import
//          from here too, to avoid the split-brain that
//          lib/ios/version.ts was created to fix.
//
//          Pure constant module — no imports, safe to load from
//          both Node and Edge runtimes.
// ============================================================

export const ANKI_JWT_VERSION = process.env.ANKI_JWT_VERSION || "anki-1"

/// Anki bearer TTL. Deliberately short (1h) because the addon has
/// a refresh-token flow with reuse detection, so frequent rotation
/// limits the blast radius of a stolen bearer. The iOS app uses
/// 30d because it has no rotation flow on the device.
export const ANKI_JWT_TTL = "1h"

/// Refresh tokens are opaque random strings (NOT JWTs). They live
/// in the anki_devices table as sha256 hashes. This constant is
/// the byte length passed to crypto.randomBytes when minting one.
export const ANKI_REFRESH_TOKEN_BYTES = 32
