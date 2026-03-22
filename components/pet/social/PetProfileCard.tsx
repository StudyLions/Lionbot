// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Card combining MiniGameboy with pet name, level,
//          Discord avatar, and mood dots. Clickable for navigation.
// ============================================================
import Link from "next/link"
import { cn } from "@/lib/utils"
import MiniGameboy, { type PetVisualData } from "./MiniGameboy"
import PixelBadge from "@/components/pet/ui/PixelBadge"

export interface PetProfileData {
  discordId: string
  discordName: string
  avatarHash?: string | null
  petName: string
  petLevel: number
  food: number
  bath: number
  sleep: number
  petVisual: PetVisualData
}

interface PetProfileCardProps {
  profile: PetProfileData
  gameboyWidth?: number
  href?: string
  stat?: React.ReactNode
  borderColor?: string
  badge?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

function MoodDot({ value }: { value: number }) {
  const color = value >= 6 ? "bg-green-400" : value >= 3 ? "bg-yellow-400" : "bg-red-400"
  return <span className={cn("inline-block w-2 h-2 rounded-full", color)} />
}

function avatarUrl(discordId: string, hash?: string | null): string {
  if (hash) return `https://cdn.discordapp.com/avatars/${discordId}/${hash}.png?size=64`
  const idx = Number((BigInt(discordId) >> BigInt(22)) % BigInt(6))
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

function CardInner({ profile, gameboyWidth = 140, stat, badge, borderColor, className, children }: PetProfileCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--pet-card,#0f1628)] border-2 border-[var(--pet-border,#2a3a5c)]",
        "shadow-[2px_2px_0_#060810] flex flex-col items-center p-3 gap-2",
        "hover:border-[#4a6a9c] transition-colors",
        className
      )}
      style={borderColor ? { borderColor } : undefined}
    >
      <MiniGameboy petData={profile.petVisual} width={gameboyWidth} />

      <div className="flex items-center gap-2 w-full min-w-0">
        <img
          src={avatarUrl(profile.discordId, profile.avatarHash)}
          alt=""
          className="w-6 h-6 rounded-full flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">
            {profile.petName}
          </p>
          <p className="font-pixel text-[11px] text-[#6a7a8c] truncate">
            {profile.discordName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full">
        <span className="font-pixel text-[11px] text-[#8899aa]">Lv.{profile.petLevel}</span>
        {badge}
        <span className="ml-auto flex items-center gap-1">
          <MoodDot value={profile.food} />
          <MoodDot value={profile.bath} />
          <MoodDot value={profile.sleep} />
        </span>
      </div>

      {stat && <div className="w-full text-center">{stat}</div>}
      {children}
    </div>
  )
}

export default function PetProfileCard(props: PetProfileCardProps) {
  const href = props.href ?? `/pet/friends/${props.profile.discordId}`

  return (
    <Link href={href} className="block">
      <CardInner {...props} />
    </Link>
  )
}

export function PetProfileCardStatic(props: PetProfileCardProps) {
  return <CardInner {...props} />
}
