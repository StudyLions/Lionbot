// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Sliding drawer container for one Setup Checklist task.
//          - Right-slide on desktop (\u2265 768px), 480px wide
//          - Full-screen sheet on mobile (uses 100dvh for the iOS Safari fix)
//          - Sticky header (title + close), sticky footer (action row)
//          - Footer respects env(safe-area-inset-bottom) so it sits above
//            the iOS home indicator
//          - Focus trap, ESC closes, body scroll lock, returns focus to
//            the launching trigger on close
//          - Honors prefers-reduced-motion (drops the slide transition)
// ============================================================
import { ReactNode, useEffect, useRef, useId } from "react"
import { X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  footer?: ReactNode
  // Optional id of the trigger button so we can return focus to it on close.
  // Pass a stable id (e.g. `setup-task-trigger-essentials`).
  returnFocusTo?: string
}

export default function TaskDrawer({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  returnFocusTo,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const subtitleId = useId()

  useEffect(() => {
    if (!open) return

    // Lock body scroll while the drawer is open so the page underneath
    // doesn't scroll when the user scrolls the drawer content.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Land focus on the dialog container itself (tabIndex=-1) instead
    //          of the first focusable child (which was the close X). Screen
    //          readers announce the dialog title + description from
    //          aria-labelledby/aria-describedby, then the user Tabs forward
    //          into form fields. This matches WAI-ARIA APG dialog pattern.
    dialogRef.current?.focus({ preventScroll: true })
    // --- END AI-MODIFIED ---

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleEsc)
    document.addEventListener("keydown", handleTab)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", handleEsc)
      document.removeEventListener("keydown", handleTab)
      // Return focus to the trigger that opened the drawer.
      if (returnFocusTo) {
        const el = document.getElementById(returnFocusTo)
        if (el && typeof el.focus === "function") el.focus()
      }
    }
  }, [open, onClose, returnFocusTo])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-fade-in"
      />
      {/* Panel: full-screen on mobile, right-slide on desktop. */}
      <div
        ref={dialogRef}
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: tabIndex={-1} so the dialog can receive programmatic focus
        // on open without being part of the Tab cycle. focus-visible:outline-none
        // because the panel itself shouldn't show the focus ring -- only its
        // children should when they receive keyboard focus.
        tabIndex={-1}
        // --- END AI-MODIFIED ---
        className="
          absolute inset-0
          md:left-auto md:top-0 md:right-0 md:bottom-0 md:w-[480px] md:max-w-[100vw]
          bg-card border-l border-border shadow-2xl
          flex flex-col
          motion-safe:animate-slide-up md:motion-safe:animate-fade-in
          focus-visible:outline-none
        "
        style={{ height: "100dvh" }} // iOS Safari address-bar safe
      >
        {/* Sticky header */}
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-card border-b border-border">
          {Icon && (
            <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Icon size={18} aria-hidden="true" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 id={titleId} className="text-base sm:text-lg font-semibold text-foreground truncate">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
          {/* 44x44 tap target -- mobile audit found close buttons under this size were missed. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {/* Scrollable body. min-h-0 lets the body scroll inside the flex column. */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-4 py-5 sm:px-6">
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <footer
            className="sticky bottom-0 z-10 px-4 sm:px-6 py-3 bg-card border-t border-border"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
