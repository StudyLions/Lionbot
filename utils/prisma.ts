// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Prisma client singleton for Next.js
//          Prevents multiple instances in development
// ============================================================
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
