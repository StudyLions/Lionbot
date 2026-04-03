// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Shared types, constants, and utility functions for the
//          private rooms dashboard components
// ============================================================

export interface RoomCard {
  channelId: string
  guildId: string
  guildName: string
  name: string | null
  coinBalance: number
  rentPrice: number
  daysRemaining: number
  memberCount: number
  memberCap: number
  isOwner: boolean
  ownerId: string
  createdAt: string | null
  deletedAt: string | null
  nextTick: string | null
  isExpiring: boolean
  frozenAt: string | null
  voiceOccupants: number
}

export interface ServerGroup {
  guildId: string
  guildName: string
  rooms: RoomCard[]
}

export interface RoomsData {
  servers: ServerGroup[]
  expiredRooms: RoomCard[]
  hasExpiringRooms: boolean
  totalActiveRooms: number
  walletBalanceByGuild: Record<string, number>
}

export interface RoomMember {
  userId: string
  displayName: string
  avatarUrl: string | null
  isOwner: boolean
  totalStudySeconds: number
  coinBalance: number
  isInVoice: boolean
}

export interface ActivityEntry {
  type: string
  userId: string
  displayName: string
  timestamp: string
  durationSeconds: number
  tag: string | null
}

export interface RoomTimer {
  focusMinutes: number
  breakMinutes: number
  autoRestart: boolean
  isRunning: boolean
  lastStarted: string | null
  inactivityThreshold: number | null
  voiceAlerts: boolean
}

export interface RoomDetailData {
  channelId: string
  guildId: string
  guildName: string
  name: string | null
  coinBalance: number
  rentPrice: number
  daysRemaining: number
  memberCap: number
  isOwner: boolean
  isMember: boolean
  ownerId: string
  createdAt: string | null
  deletedAt: string | null
  nextTick: string | null
  members: RoomMember[]
  activityFeed: ActivityEntry[]
  timer: RoomTimer | null
  walletBalance: number
  frozenAt: string | null
  autoExtendEnabled: boolean
}

export interface SoundRentalData {
  rental: {
    rental_id: number
    sound_type: string
    bot_number: number
    started_at: string
    expires_at: string
    total_cost: number
    userid: string
  } | null
  rentalEnabled: boolean
  hourlyRate: number
  isOwner: boolean
}

export const SOUND_OPTIONS = [
  { value: "rain", label: "Rain", description: "Gentle rainfall ambience" },
  { value: "campfire", label: "Campfire", description: "Crackling fireside warmth" },
  { value: "ocean", label: "Ocean Waves", description: "Rolling surf and sea breeze" },
  { value: "brown_noise", label: "Brown Noise", description: "Deep, warm background noise" },
  { value: "white_noise", label: "White Noise", description: "Steady, even static" },
  { value: "lofi", label: "LoFi Music", description: "Chill beats to study to" },
] as const

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function formatDate(iso: string | null): string {
  if (!iso) return "\u2014"
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "\u2014"
  const diff = new Date(iso).getTime() - Date.now()
  const hours = Math.round(diff / 3600000)
  if (hours < 0) return "overdue"
  if (hours < 1) return "< 1 hour"
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

export function healthColor(daysRemaining: number, frozenAt: string | null) {
  if (frozenAt) return { bar: "bg-blue-500", barBg: "bg-blue-500/20", text: "text-blue-400", border: "border-l-blue-500" }
  if (daysRemaining > 7) return { bar: "bg-emerald-500", barBg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-l-emerald-500" }
  if (daysRemaining > 3) return { bar: "bg-amber-500", barBg: "bg-amber-500/20", text: "text-amber-400", border: "border-l-amber-500" }
  return { bar: "bg-red-500", barBg: "bg-red-500/20", text: "text-red-400", border: "border-l-red-500" }
}
