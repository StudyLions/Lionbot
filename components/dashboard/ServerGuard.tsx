// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Server-level permission guard - blocks page rendering
//          for users who lack the required permission level
//          (member, moderator, or admin) for the current server
// ============================================================
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { ReactNode } from "react"
import { useDashboard } from "@/hooks/useDashboard"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"

type PermissionLevel = "member" | "moderator" | "admin"

interface ServerGuardProps {
  children: ReactNode
  requiredLevel: PermissionLevel
}

interface PermissionsData {
  isMember: boolean
  isModerator: boolean
  isAdmin: boolean
}

function hasPermission(perms: PermissionsData, level: PermissionLevel): boolean {
  switch (level) {
    case "admin":
      return perms.isAdmin
    case "moderator":
      return perms.isModerator || perms.isAdmin
    case "member":
      return perms.isMember || perms.isModerator || perms.isAdmin
  }
}

function levelLabel(level: PermissionLevel): string {
  switch (level) {
    case "admin":
      return "Administrator"
    case "moderator":
      return "Moderator"
    case "member":
      return "Member"
  }
}

export default function ServerGuard({ children, requiredLevel }: ServerGuardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { id } = router.query

  const { data: perms, isLoading } = useDashboard<PermissionsData>(
    id && session ? `/api/dashboard/servers/${id}/permissions` : null
  )

  if (isLoading || !perms) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-4 w-64">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    )
  }

  if (!hasPermission(perms, requiredLevel)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <ShieldAlert size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You need <strong className="text-foreground">{levelLabel(requiredLevel)}</strong> permissions
            in this server to view this page.
          </p>
          <Link href="/dashboard/servers">
            <span className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-2">
              <ArrowLeft size={14} />
              Back to your servers
            </span>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
