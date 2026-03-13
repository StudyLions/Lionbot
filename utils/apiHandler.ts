// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Shared API route wrapper with error handling, method
//          validation, and Cache-Control headers
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"

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

    try {
      await handler(req, res)
    } catch (err: any) {
      console.error(`API error [${req.method} ${req.url}]:`, err)
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Internal server error" })
      }
    }
  }
}
