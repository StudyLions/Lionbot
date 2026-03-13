// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Info tooltip for explaining settings to non-technical users
// ============================================================
import { HelpCircle } from "lucide-react"
import { useState, useRef, useEffect, ReactNode } from "react"

interface TooltipProps {
  content: string | ReactNode
  className?: string
}

export default function Tooltip({ content, className = "" }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-gray-500 hover:text-gray-300 transition-colors focus:outline-none focus:text-gray-300"
        aria-label="More info"
      >
        <HelpCircle size={15} />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-gray-200 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  )
}
