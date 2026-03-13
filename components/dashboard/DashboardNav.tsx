// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Main dashboard sidebar/bottom navigation
// ============================================================
import Link from "next/link"
import { useRouter } from "next/router"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/servers", label: "Servers", icon: "🏠" },
  { href: "/dashboard/tasks", label: "Tasks", icon: "✅" },
  { href: "/dashboard/history", label: "History", icon: "📖" },
  { href: "/dashboard/reminders", label: "Reminders", icon: "⏰" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "🎨" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
]

export default function DashboardNav() {
  const router = useRouter()

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:hidden xl:hidden md:hidden sm:hidden ex_sm:hidden min-[1024px]:flex flex-col gap-1 w-56 flex-shrink-0 sticky top-6 self-start">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? router.pathname === "/dashboard"
            : router.pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <span className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all
                ${isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }
              `}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 z-50 flex justify-around py-2 px-1 min-[1024px]:hidden">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? router.pathname === "/dashboard"
            : router.pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <span className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all min-w-[60px]
                ${isActive ? "text-indigo-400" : "text-gray-500"}
              `}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
