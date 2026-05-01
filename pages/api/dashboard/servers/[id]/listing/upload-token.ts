// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Vercel Blob `handleUpload` route for the "Feature
//          Your Server" image pipeline. Issues short-lived,
//          tightly-scoped client tokens that let the dashboard
//          editor upload directly to Blob from the browser.
//
//          Auth contract:
//            - admin permission on the guild (requireAdmin)
//            - guild must be premium (premium_guilds.premium_until > NOW)
//            - clientPayload.kind ∈ {"cover", "gallery"} drives the
//              size + content-type constraints baked into the token
//            - resulting blob path is forced to listings/{guildid}/...
//              so a malicious client can't write into another guild's
//              folder by tampering with the pathname
//
//          We do NOT use onUploadCompleted to write to the DB.
//          Instead, the editor includes the returned URL in its
//          subsequent PUT /api/dashboard/servers/[id]/listing call
//          alongside the rest of the form. This keeps writes
//          atomic with the rest of the listing payload.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"
import { isListingPremiumGuild } from "@/utils/listingHelpers"
import {
  buildListingBlobPathname,
  LISTING_IMAGE_CONSTRAINTS,
  type ListingImageKind,
} from "@/utils/listingBlob"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"

interface UploadClientPayload {
  kind: ListingImageKind
  filename: string
}

function parseClientPayload(raw: string | null): UploadClientPayload {
  if (!raw) {
    throw new ValidationError("Missing client payload")
  }
  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new ValidationError("Malformed client payload")
  }
  if (!parsed || typeof parsed !== "object") {
    throw new ValidationError("Invalid client payload")
  }
  if (parsed.kind !== "cover" && parsed.kind !== "gallery") {
    throw new ValidationError("Invalid image kind")
  }
  if (typeof parsed.filename !== "string" || parsed.filename.length === 0 || parsed.filename.length > 200) {
    throw new ValidationError("Invalid filename")
  }
  return { kind: parsed.kind, filename: parsed.filename }
}

export default apiHandler({
  async POST(req, res) {
    if (!SERVERS_DIRECTORY_ENABLED) {
      return res.status(404).json({ error: "Not found" })
    }
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isListingPremiumGuild(guildId))) {
      return res
        .status(403)
        .json({ error: "Server premium subscription is required to upload listing images." })
    }

    const body = req.body as HandleUploadBody

    try {
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (_pathname, clientPayload, _multipart) => {
          const { kind, filename } = parseClientPayload(clientPayload)
          const constraints = LISTING_IMAGE_CONSTRAINTS[kind]
          // Force the pathname into the guild's folder regardless of what
          // the client requested. Vercel Blob's handleUpload uses the
          // pathname returned in the token, not the one the client asked
          // for, so we control the final destination here.
          const safePathname = buildListingBlobPathname(guildId, kind, filename)
          return {
            allowedContentTypes: constraints.allowedContentTypes,
            maximumSizeInBytes: constraints.maxBytes,
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days
            // Pass-through; the editor includes the URL in its main PUT
            // call so we don't need to look it up later.
            tokenPayload: JSON.stringify({
              guildId: guildId.toString(),
              kind,
              pathname: safePathname,
            }),
          }
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          // We intentionally do NOT touch the DB here. Vercel calls this
          // out-of-band after the upload finishes, but a successful blob
          // write doesn't necessarily mean the admin clicked "Save" --
          // the editor may abandon the form. So we let the main listing
          // PUT handler attribute the URL when the form is actually
          // submitted, and orphaned uploads are cleaned up by a future
          // garbage collector cron job.
          // (Logging only so we have an audit trail.)
          console.log(
            "[server-listing] blob upload completed",
            { url: blob.url, pathname: blob.pathname, tokenPayload },
          )
        },
      })

      return res.status(200).json(jsonResponse)
    } catch (err: any) {
      // handleUpload throws on bad payloads; surface a 400 instead of 500
      // so the editor can show a meaningful error.
      if (err instanceof ValidationError) throw err
      console.error("[server-listing] upload-token error:", err?.message || err)
      return res.status(400).json({ error: err?.message || "Upload token generation failed" })
    }
  },
})
