// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Single source of truth for the iOS bearer JWT version
//          sentinel. Imported by BOTH `lib/ios/auth.ts` (Node
//          runtime, used by API route handlers) AND
//          `lib/ios/edgeAuth.ts` (Edge runtime, used by
//          middleware.js). The two files were carrying a
//          duplicated `const IOS_JWT_VERSION = "ios-1"` literal,
//          which meant a bump in one without the other would
//          cause middleware to reject every newly-minted token
//          while the route handler still accepted them -- a
//          silent split-brain. Centralising here closes that gap.
//
//          To rotate iOS sessions en masse, bump this value and
//          redeploy. All previously-issued bearers immediately
//          fail signature verification AND middleware verification
//          atomically, forcing every iOS user to re-sign-in.
//
//          Pure constant module -- no imports, safe to load from
//          both Node and Edge runtimes.
// ============================================================

export const IOS_JWT_VERSION = "ios-1"

/// Bearer TTL handed to `jose.SignJWT.setExpirationTime`. Kept
/// here so that any change to session lifetime is visible next
/// to the version sentinel -- they are the two knobs that
/// control session-rotation behaviour.
export const IOS_JWT_TTL = "30d"
