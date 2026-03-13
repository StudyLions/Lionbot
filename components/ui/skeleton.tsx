// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: shadcn/ui-style animated placeholder skeleton
// ============================================================
import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
