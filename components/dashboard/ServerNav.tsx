// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server sub-navigation with permission-aware tabs
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"
import { ReactNode } from "react"
import {
  BarChart3, Users, Shield, Coins, Settings, Trophy,
  ShoppingBag, ListChecks, Wand2, ArrowLeft, Calendar, Timer, Video
} from "lucide-react"

interface ServerNavProps {
  serverId: string
  serverName: string
  isAdmin?: boolean
  isMod?: boolean
}

interface NavLink {
  href: string
  label: string
  icon: ReactNode
}

const memberLinks: NavLink[] = [
  { href: "", label: "Overview", icon: <BarChart3 size={16} /> },
]

const modLinks: NavLink[] = [
  { href: "/members", label: "Members", icon: <Users size={16} /> },
  { href: "/moderation", label: "Moderation", icon: <Shield size={16} /> },
  { href: "/economy", label: "Economy", icon: <Coins size={16} /> },
]

const adminLinks: NavLink[] = [
  { href: "/settings", label: "Settings", icon: <Settings size={16} /> },
  { href: "/ranks", label: "Ranks", icon: <Trophy size={16} /> },
  { href: "/shop", label: "Shop", icon: <ShoppingBag size={16} /> },
  { href: "/rolemenus", label: "Role Menus", icon: <ListChecks size={16} /> },
  { href: "/schedule", label: "Schedule", icon: <Calendar size={16} /> },
  { href: "/pomodoro", label: "Pomodoro", icon: <Timer size={16} /> },
  { href: "/videochannels", label: "Video Channels", icon: <Video size={16} /> },
  { href: "/setup", label: "Setup Wizard", icon: <Wand2 size={16} /> },
]

export default function ServerNav({ serverId, serverName, isAdmin, isMod }: ServerNavProps) {
  const router = useRouter()
  const basePath = `/dashboard/servers/${serverId}`

  const allLinks = [
    ...memberLinks,
    ...(isMod || isAdmin ? modLinks : []),
    ...(isAdmin ? adminLinks : []),
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard/servers">
          <span className="text-gray-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5 text-sm">
            <ArrowLeft size={14} />
            All Servers
          </span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white mb-4 truncate sm:text-xl">{serverName}</h1>
      <nav className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide" aria-label="Server sections">
        {allLinks.map((link) => {
          const fullPath = basePath + link.href
          const isActive = link.href === ""
            ? router.asPath === fullPath
            : router.asPath.startsWith(fullPath)

          return (
            <Link key={link.href} href={fullPath}>
              <span className={`
                flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all
                ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `} aria-current={isActive ? "page" : undefined}>
                {link.icon}
                {link.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
