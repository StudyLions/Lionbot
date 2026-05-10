// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Discord role selector dropdown, fetches roles via API
// ============================================================
import { useEffect, useState } from "react"
import SearchSelect from "./SearchSelect"

interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  managed: boolean
}

function intToHex(color: number): string | undefined {
  if (color === 0) return undefined
  return `#${color.toString(16).padStart(6, "0")}`
}

interface RoleSelectProps {
  guildId: string
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  multiple?: boolean
  excludeManaged?: boolean
  excludeEveryone?: boolean
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: export cache map and clearCache for invalidation after config changes
const roleCache = new Map<string, { roles: DiscordRole[]; expiresAt: number }>()

export function clearRoleCache(guildId?: string) {
  if (guildId) roleCache.delete(guildId)
  else roleCache.clear()
}
// --- END AI-MODIFIED ---

export default function RoleSelect({
  guildId,
  value,
  onChange,
  label,
  placeholder = "Select a role",
  disabled = false,
  multiple = false,
  excludeManaged = true,
  excludeEveryone = true,
}: RoleSelectProps) {
  const [roles, setRoles] = useState<DiscordRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!guildId) return

    const cached = roleCache.get(guildId)
    if (cached && Date.now() < cached.expiresAt) {
      setRoles(cached.roles)
      return
    }

    setLoading(true)
    fetch(`/api/discord/guild/${guildId}/roles`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch roles")
        return r.json()
      })
      .then((data) => {
        setRoles(data)
        roleCache.set(guildId, { roles: data, expiresAt: Date.now() + 30000 })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [guildId])

  let filtered = roles.sort((a, b) => b.position - a.position)
  if (excludeManaged) filtered = filtered.filter((r) => !r.managed)
  if (excludeEveryone) filtered = filtered.filter((r) => r.name !== "@everyone")

  const options = filtered.map((role) => ({
    value: role.id,
    label: role.name,
    color: intToHex(role.color),
  }))

  // --- AI-MODIFIED (2026-05-10) ---
  // Purpose: Replace dead-end error with retry button
  if (error) {
    return (
      <div className="text-sm text-red-400">
        {label && <span className="block text-gray-300 font-medium mb-1">{label}</span>}
        Couldn&apos;t load roles.{" "}
        <button
          type="button"
          className="underline hover:text-red-300 transition-colors"
          onClick={() => {
            setError("")
            roleCache.delete(guildId)
            setLoading(true)
            fetch(`/api/discord/guild/${guildId}/roles?refresh=true`)
              .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() })
              .then((data) => { setRoles(data); roleCache.set(guildId, { roles: data, expiresAt: Date.now() + 30000 }) })
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false))
          }}
        >Try again</button>
      </div>
    )
  }
  // --- END AI-MODIFIED ---

  return (
    <SearchSelect
      options={options}
      value={value}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      multiple={multiple}
      emptyMessage="No roles found. Make sure the bot is in this server."
    />
  )
}
