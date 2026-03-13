// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Shared sub-navigation for server dashboard pages
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"

interface ServerNavProps {
  serverId: string
  serverName: string
  isAdmin?: boolean
  isMod?: boolean
}

const memberLinks = [
  { href: "", label: "Overview", icon: "📊" },
]

const modLinks = [
  { href: "/members", label: "Members", icon: "👥" },
  { href: "/moderation", label: "Moderation", icon: "🛡️" },
  { href: "/economy", label: "Economy", icon: "💰" },
]

const adminLinks = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/ranks", label: "Ranks", icon: "🏆" },
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
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard/servers">
          <span className="text-gray-400 hover:text-white cursor-pointer text-sm">&larr; All Servers</span>
        </Link>
        <h1 className="text-2xl font-bold text-white truncate sm:text-xl">{serverName}</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {allLinks.map((link) => {
          const fullPath = basePath + link.href
          const isActive = router.asPath === fullPath ||
            (link.href !== "" && router.asPath.startsWith(fullPath))

          return (
            <Link key={link.href} href={fullPath}>
              <span className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer transition-all
                ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `}>
                <span className="text-base">{link.icon}</span>
                {link.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
