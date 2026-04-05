// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Discord channel selector dropdown, fetches channels via API
// ============================================================
import { Hash, Volume2, FolderOpen } from "lucide-react"
import { useEffect, useState, ReactNode } from "react"
import SearchSelect from "./SearchSelect"

interface DiscordChannel {
  id: string
  name: string
  type: number
  position: number
  parent_id: string | null
}

const channelTypeIcons: Record<number, ReactNode> = {
  0: <Hash size={14} className="text-gray-400" />,
  2: <Volume2 size={14} className="text-emerald-400" />,
  4: <FolderOpen size={14} className="text-amber-400" />,
  5: <Hash size={14} className="text-blue-400" />,
  13: <Volume2 size={14} className="text-purple-400" />,
  15: <Hash size={14} className="text-gray-400" />,
}

const channelTypeNames: Record<number, string> = {
  0: "Text",
  2: "Voice",
  4: "Category",
  5: "Announcement",
  13: "Stage",
  15: "Forum",
}

interface ChannelSelectProps {
  guildId: string
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  multiple?: boolean
  channelTypes?: number[]
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: export cache map and clearCache for invalidation after config changes
const channelCache = new Map<string, { channels: DiscordChannel[]; expiresAt: number }>()

export function clearChannelCache(guildId?: string) {
  if (guildId) channelCache.delete(guildId)
  else channelCache.clear()
}
// --- END AI-MODIFIED ---

export default function ChannelSelect({
  guildId,
  value,
  onChange,
  label,
  placeholder = "Select a channel",
  disabled = false,
  multiple = false,
  channelTypes,
}: ChannelSelectProps) {
  const [channels, setChannels] = useState<DiscordChannel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!guildId) return

    const cached = channelCache.get(guildId)
    if (cached && Date.now() < cached.expiresAt) {
      setChannels(cached.channels)
      return
    }

    setLoading(true)
    fetch(`/api/discord/guild/${guildId}/channels`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch channels")
        return r.json()
      })
      .then((data) => {
        setChannels(data)
        channelCache.set(guildId, { channels: data, expiresAt: Date.now() + 30000 })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [guildId])

  const filtered = channelTypes
    ? channels.filter((ch) => channelTypes.includes(ch.type))
    : channels

  const categories = filtered.filter((ch) => ch.type === 4).sort((a, b) => a.position - b.position)
  const nonCategories = filtered.filter((ch) => ch.type !== 4)

  const options = nonCategories
    .sort((a, b) => a.position - b.position)
    .map((ch) => {
      const category = categories.find((cat) => cat.id === ch.parent_id)
      return {
        value: ch.id,
        label: ch.name,
        icon: channelTypeIcons[ch.type] || <Hash size={14} className="text-gray-400" />,
        group: category?.name || "No Category",
      }
    })

  if (channelTypes?.includes(4)) {
    categories.forEach((cat) => {
      options.unshift({
        value: cat.id,
        label: cat.name,
        icon: <FolderOpen size={14} className="text-amber-400" />,
        group: "Categories",
      })
    })
  }

  if (error) {
    return (
      <div className="text-sm text-red-400">
        {label && <span className="block text-gray-300 font-medium mb-1">{label}</span>}
        Could not load channels. Check bot permissions.
      </div>
    )
  }

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
      emptyMessage="No channels found. Make sure the bot is in this server."
    />
  )
}
