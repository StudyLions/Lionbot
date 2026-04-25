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
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- aria-label on breadcrumb nav for screen readers,
  // modernize Next.js <Link> (drop nested <span> wrapper), focus-visible rings on links,
  // current-page breadcrumb gets aria-current="page", title gets responsive bump on lg+
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <ol className="flex items-center gap-1 flex-wrap">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={12} className="text-muted-foreground/60" aria-hidden="true" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="rounded hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background px-0.5"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-foreground/80 font-medium" : "text-muted-foreground"} aria-current={isLast ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-[1.625rem] font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
  // --- END AI-MODIFIED ---
}
