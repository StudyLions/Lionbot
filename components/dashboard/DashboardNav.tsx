// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Main dashboard sidebar/bottom navigation
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"
import { BarChart3, Server, CheckSquare, History, Target, Bell, Palette, Gem, User } from "lucide-react"
import { ReactNode } from "react"

interface NavItem {
  href: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <BarChart3 size={18} /> },
  { href: "/dashboard/servers", label: "Servers", icon: <Server size={18} /> },
  { href: "/dashboard/tasks", label: "Tasks", icon: <CheckSquare size={18} /> },
  { href: "/dashboard/history", label: "History", icon: <History size={18} /> },
  { href: "/dashboard/goals", label: "Goals", icon: <Target size={18} /> },
  { href: "/dashboard/reminders", label: "Reminders", icon: <Bell size={18} /> },
  { href: "/dashboard/inventory", label: "Inventory", icon: <Palette size={18} /> },
  { href: "/dashboard/gems", label: "LionGems", icon: <Gem size={18} /> },
  { href: "/dashboard/profile", label: "Profile", icon: <User size={18} /> },
]

export default function DashboardNav() {
  const router = useRouter()

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden min-[1024px]:flex flex-col gap-1 w-56 flex-shrink-0 sticky top-6 self-start" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? router.pathname === "/dashboard"
            : router.pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <span className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all
                ${isActive
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }
              `} aria-current={isActive ? "page" : undefined}>
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 z-50 flex justify-around py-2 px-1 min-[1024px]:hidden" aria-label="Dashboard navigation">
        {navItems.slice(0, 5).map((item) => {
          const isActive = item.href === "/dashboard"
            ? router.pathname === "/dashboard"
            : router.pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <span className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-all min-w-[56px]
                ${isActive ? "text-indigo-400" : "text-gray-500"}
              `} aria-current={isActive ? "page" : undefined}>
                {item.icon}
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
