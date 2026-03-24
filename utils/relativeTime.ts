// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Shared relative time formatter -- replaces 7+ duplicate
//          timeAgo/relativeTime/formatRelativeTime implementations
// ============================================================

export function relativeTime(date: Date | string | number): string {
  const now = Date.now()
  const then = typeof date === "number" ? date : new Date(date).getTime()
  const diffMs = now - then

  if (diffMs < 0) return "just now"

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return "just now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks}w ago`
  }

  const d = new Date(then)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
