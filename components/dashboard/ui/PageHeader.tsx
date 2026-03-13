// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Page header with title, breadcrumb, and description
// ============================================================
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ReactNode } from "react"

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
}

export default function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-gray-600" />}
              {crumb.href ? (
                <Link href={crumb.href}>
                  <span className="hover:text-white transition-colors cursor-pointer">{crumb.label}</span>
                </Link>
              ) : (
                <span className="text-gray-300">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4 sm:flex-col">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-400 max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
