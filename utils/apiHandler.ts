// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Shared API route wrapper with error handling, method
//          validation, and Cache-Control headers
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Shared BigInt parser that returns 400 on invalid input instead of
//          crashing with a 500. Use at the top of handlers before any DB queries.
export class ValidationError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export function parseBigInt(value: unknown, fieldName = "ID"): bigint {
  try {
    if (value === undefined || value === null || value === "") {
      throw new Error("empty")
    }
    return BigInt(value as string)
  } catch {
    throw new ValidationError(`Invalid ${fieldName} format`)
  }
}
// --- END AI-MODIFIED ---

type MethodHandlers = {
  GET?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  POST?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  PATCH?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  DELETE?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  PUT?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
}

export function apiHandler(handlers: MethodHandlers) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method as keyof MethodHandlers
    const handler = handlers[method]

    if (!handler) {
      res.setHeader("Allow", Object.keys(handlers).join(", "))
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }

    if (method === "GET") {
      res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate")
    } else {
      res.setHeader("Cache-Control", "no-store")
    }

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Never return raw err.message to client -- it can expose DB errors, file paths,
    //          and internal state. Log the error server-side but return a generic message.
    // --- Original code (commented out for rollback) ---
    // try {
    //   await handler(req, res)
    // } catch (err: any) {
    //   console.error(`API error [${req.method} ${req.url}]:`, err)
    //   if (!res.headersSent) {
    //     res.status(500).json({ error: err.message || "Internal server error" })
    //   }
    // }
    // --- End original code ---
    try {
      await handler(req, res)
    } catch (err: any) {
      if (err instanceof ValidationError) {
        if (!res.headersSent) {
          return res.status(err.status).json({ error: err.message })
        }
        return
      }
      console.error(`API error [${req.method} ${req.url}]:`, err?.message || err)
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" })
      }
    }
    // --- END AI-MODIFIED ---
  }
}
