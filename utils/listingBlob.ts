// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Shared helpers for the "Feature Your Server" image
//          pipeline. Centralises:
//           - Vercel Blob path conventions so cover/gallery URLs
//             are predictable and easy to clean up later
//           - Per-kind size and content-type constraints used by
//             both the upload-token endpoint AND the editor UI
//             (so the front-end can validate before even hitting
//             the network)
//           - Path-prefix check used to enforce that the uploaded
//             blob really lives in the requesting guild's folder
// ============================================================

export type ListingImageKind = "cover" | "gallery"

export interface ListingImageConstraints {
  /** Max file size in bytes. Vercel Blob enforces this in the token. */
  maxBytes: number
  /** Allowed mime types. */
  allowedContentTypes: string[]
  /** Recommended dimensions shown in the editor copy. */
  recommended: { width: number; height: number }
  /** Hard upper bound on dimensions; we reject larger uploads in validation. */
  maxDimension: { width: number; height: number }
}

export const LISTING_IMAGE_CONSTRAINTS: Record<ListingImageKind, ListingImageConstraints> = {
  cover: {
    maxBytes: 5 * 1024 * 1024,
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    recommended: { width: 1920, height: 480 },
    maxDimension: { width: 3840, height: 1080 },
  },
  gallery: {
    maxBytes: 2 * 1024 * 1024,
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    recommended: { width: 1200, height: 800 },
    maxDimension: { width: 2400, height: 1600 },
  },
}

/**
 * Build the canonical blob pathname for a listing image. Uses a per-guild
 * folder so we can later wipe all images for a deleted listing in one
 * `del()` call:
 *
 *   listings/{guildid}/cover-{timestamp}.{ext}
 *   listings/{guildid}/gallery-{timestamp}.{ext}
 *
 * The timestamp suffix avoids cache-busting headaches when an admin
 * re-uploads -- old URLs stay valid until we explicitly delete them.
 */
export function buildListingBlobPathname(
  guildId: bigint,
  kind: ListingImageKind,
  filename: string,
): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  const ext = sanitized.includes(".") ? sanitized.slice(sanitized.lastIndexOf(".")) : ".jpg"
  const stamp = Date.now()
  return `listings/${guildId.toString()}/${kind}-${stamp}${ext}`
}

/** True if `pathname` is inside the guild's listing folder. Used to
 *  defend the upload-completed callback against tampered tokenPayload. */
export function pathBelongsToGuild(pathname: string, guildId: bigint): boolean {
  return pathname.startsWith(`listings/${guildId.toString()}/`)
}

/** Strip a Vercel Blob URL down to its pathname. We store the full URL
 *  in the DB but sometimes need the pathname for `del()` calls. */
export function pathnameFromBlobUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // Vercel Blob URLs are like https://<store>.public.blob.vercel-storage.com/<pathname>
    return u.pathname.replace(/^\//, "")
  } catch {
    return null
  }
}
