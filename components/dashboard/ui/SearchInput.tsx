// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Shared search input component -- replaces 15+ custom
//          search field implementations across dashboard pages
// ============================================================
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- a11y label, optional clear button, autoFocus support
  ariaLabel?: string
  showClear?: boolean
  autoFocus?: boolean
  // --- END AI-MODIFIED ---
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  ariaLabel,
  showClear = true,
  autoFocus,
}: SearchInputProps) {
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- icon turns primary on focus, optional clear (X),
  // sensible aria-label fallback, smooth border + ring transition
  return (
    <div className={cn("relative group", className)}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors duration-150 group-focus-within:text-primary"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
        className={cn(
          "w-full pl-9 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "transition-[border-color,box-shadow] duration-150",
          showClear && value ? "pr-9" : "pr-3",
        )}
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
  // --- END AI-MODIFIED ---
}
