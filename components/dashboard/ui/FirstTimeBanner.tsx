// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Contextual first-time banner for unconfigured features
// ============================================================
import { Lightbulb, X } from "lucide-react"
import { useState, ReactNode } from "react"

interface FirstTimeBannerProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
  storageKey?: string
}

export default function FirstTimeBanner({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  storageKey,
}: FirstTimeBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined" || !storageKey) return false
    return localStorage.getItem(`banner_${storageKey}`) === "1"
  })

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    if (storageKey) localStorage.setItem(`banner_${storageKey}`, "1")
  }

  return (
    <div className="relative bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-6">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 flex-shrink-0">
          {icon || <Lightbulb size={22} />}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-3 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
