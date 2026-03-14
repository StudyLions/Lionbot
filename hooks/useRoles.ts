// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Shared hook for fetching Discord roles with a lookup
//          map for quick role name/color resolution by ID
// ============================================================
import { useState, useEffect, useMemo } from "react"

interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  managed: boolean
}

interface RoleInfo {
  name: string
  color: number
  colorHex: string
  position: number
  managed: boolean
}

const roleCache = new Map<string, { roles: DiscordRole[]; expiresAt: number }>()

export function useRoles(guildId: string | undefined) {
  const [roles, setRoles] = useState<DiscordRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!guildId) return

    const cached = roleCache.get(guildId)
    if (cached && Date.now() < cached.expiresAt) {
      setRoles(cached.roles)
      return
    }

    setLoading(true)
    setError(null)
    fetch(`/api/discord/guild/${guildId}/roles`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch roles")
        return r.json()
      })
      .then((data: DiscordRole[]) => {
        setRoles(data)
        roleCache.set(guildId, { roles: data, expiresAt: Date.now() + 300_000 })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [guildId])

  const roleMap = useMemo(() => {
    const map: Record<string, RoleInfo> = {}
    for (const r of roles) {
      map[r.id] = {
        name: r.name,
        color: r.color,
        colorHex: r.color ? `#${r.color.toString(16).padStart(6, "0")}` : "#99aab5",
        position: r.position,
        managed: r.managed,
      }
    }
    return map
  }, [roles])

  return { roles, roleMap, loading, error }
}

export function clearRolesCache(guildId?: string) {
  if (guildId) roleCache.delete(guildId)
  else roleCache.clear()
}
