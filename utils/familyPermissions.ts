// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family role permission defaults, merge logic, and
//          hasPermission checker. Used by all family API routes.
// ============================================================

export const PERMISSION_KEYS = [
  "edit_settings",
  "invite_members",
  "kick_members",
  "promote_demote",
  "withdraw_items",
  "deposit_items",
  "withdraw_gold",
  "deposit_gold",
  "plant_farm",
  "harvest_farm",
  "disband",
] as const

export type PermissionKey = typeof PERMISSION_KEYS[number]

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  edit_settings: "Edit Settings",
  invite_members: "Invite Members",
  kick_members: "Kick Members",
  promote_demote: "Promote/Demote",
  withdraw_items: "Withdraw Items",
  deposit_items: "Deposit Items",
  withdraw_gold: "Withdraw Gold",
  deposit_gold: "Deposit Gold",
  plant_farm: "Plant on Farm",
  harvest_farm: "Harvest Farm",
  disband: "Disband Family",
}

export type RolePermissions = Record<PermissionKey, boolean>
export type AllRolePermissions = Record<string, RolePermissions>

export const DEFAULT_PERMISSIONS: AllRolePermissions = {
  ADMIN: {
    edit_settings: true,
    invite_members: true,
    kick_members: true,
    promote_demote: false,
    withdraw_items: true,
    deposit_items: true,
    withdraw_gold: true,
    deposit_gold: true,
    plant_farm: true,
    harvest_farm: true,
    disband: false,
  },
  MODERATOR: {
    edit_settings: false,
    invite_members: true,
    kick_members: false,
    promote_demote: false,
    withdraw_items: true,
    deposit_items: true,
    withdraw_gold: false,
    deposit_gold: true,
    plant_farm: true,
    harvest_farm: true,
    disband: false,
  },
  MEMBER: {
    edit_settings: false,
    invite_members: false,
    kick_members: false,
    promote_demote: false,
    withdraw_items: false,
    deposit_items: true,
    withdraw_gold: false,
    deposit_gold: true,
    plant_farm: true,
    harvest_farm: true,
    disband: false,
  },
}

export function getEffectivePermissions(storedJson: unknown): AllRolePermissions {
  const stored = (typeof storedJson === "object" && storedJson !== null ? storedJson : {}) as Record<string, Record<string, boolean>>
  const result: AllRolePermissions = {} as AllRolePermissions

  for (const role of ["ADMIN", "MODERATOR", "MEMBER"]) {
    const defaults = DEFAULT_PERMISSIONS[role]
    const overrides = stored[role] ?? {}
    result[role] = {} as RolePermissions
    for (const key of PERMISSION_KEYS) {
      result[role][key] = typeof overrides[key] === "boolean" ? overrides[key] : defaults[key]
    }
  }

  return result
}

export function hasPermission(
  role: string,
  permKey: PermissionKey,
  storedJson: unknown
): boolean {
  if (role === "LEADER") return true
  const perms = getEffectivePermissions(storedJson)
  return perms[role]?.[permKey] ?? false
}

const ROLE_HIERARCHY: Record<string, number> = {
  LEADER: 4,
  ADMIN: 3,
  MODERATOR: 2,
  MEMBER: 1,
}

export function roleRank(role: string): number {
  return ROLE_HIERARCHY[role] ?? 0
}

export function canEditRolePerms(editorRole: string, targetRole: string): boolean {
  if (editorRole === "LEADER") return targetRole !== "LEADER"
  if (editorRole === "ADMIN") return targetRole === "MODERATOR" || targetRole === "MEMBER"
  return false
}

export const FAMILY_XP_PER_VOICE_MINUTE = 1
export const FAMILY_XP_PER_MESSAGE = 1

export function familyLevelThreshold(level: number): number {
  if (level <= 1) return 0
  return Math.floor(500 * Math.pow(level - 1, 1.8))
}

export function familyLevelFromXp(xp: number): number {
  let level = 1
  while (familyLevelThreshold(level + 1) <= xp) level++
  return level
}

export function maxMembersForLevel(level: number): number {
  return 10 + Math.floor((level - 1) / 2)
}

export function maxFarmsForLevel(level: number): number {
  return 1 + Math.floor(level / 5)
}
