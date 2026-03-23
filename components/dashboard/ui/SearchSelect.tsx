// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Searchable dropdown select used as base for ChannelSelect and RoleSelect
// ============================================================
import { Search, X, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect, useCallback, ReactNode } from "react"
import { createPortal } from "react-dom"

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  color?: string
  group?: string
  disabled?: boolean
}

interface SearchSelectProps {
  options: SelectOption[]
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  loading?: boolean
  multiple?: boolean
  clearable?: boolean
  id?: string
  emptyMessage?: string
}

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Render dropdown via portal to escape overflow-hidden/overflow-y-auto ancestors
// that were clipping the dropdown in the setup wizard and other scrollable containers.
export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled = false,
  loading = false,
  multiple = false,
  clearable = true,
  id,
  emptyMessage = "No options found",
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedValues = multiple
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : []
  const singleValue = !multiple ? (value as string | null) : null

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const estimatedHeight = 290
    const goUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight

    setPortalStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(goUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()

    function handleScroll(e: Event) {
      if (dropdownRef.current?.contains(e.target as Node)) return
      setOpen(false)
      setSearch("")
    }

    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (open && inputRef.current) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])
  // --- END AI-MODIFIED ---

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const groups = Array.from(new Set(filtered.map((o) => o.group).filter(Boolean))) as string[]
  const ungrouped = filtered.filter((o) => !o.group)

  function handleSelect(optValue: string) {
    if (multiple) {
      const current = selectedValues
      if (current.includes(optValue)) {
        onChange(current.filter((v) => v !== optValue))
      } else {
        onChange([...current, optValue])
      }
    } else {
      onChange(optValue)
      setOpen(false)
      setSearch("")
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(multiple ? [] : null)
  }

  function getSelectedLabel(): string {
    if (multiple) {
      if (selectedValues.length === 0) return ""
      if (selectedValues.length === 1) {
        return options.find((o) => o.value === selectedValues[0])?.label || selectedValues[0]
      }
      return `${selectedValues.length} selected`
    }
    if (!singleValue) return ""
    return options.find((o) => o.value === singleValue)?.label || singleValue
  }

  const selectedLabel = getSelectedLabel()
  const hasValue = multiple ? selectedValues.length > 0 : !!singleValue

  function renderOptions(opts: SelectOption[]) {
    return opts.map((opt) => {
      const isSelected = multiple
        ? selectedValues.includes(opt.value)
        : singleValue === opt.value
      return (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => handleSelect(opt.value)}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors
            ${isSelected ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30"}
            ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {multiple && (
            <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] ${isSelected ? "bg-primary border-primary text-foreground" : "border-gray-500"}`}>
              {isSelected && "✓"}
            </span>
          )}
          {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
          {opt.color && (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
              style={{ backgroundColor: opt.color }}
            />
          )}
          <span className="truncate">{opt.label}</span>
        </button>
      )
    })
  }

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Portal dropdown to document.body so it escapes overflow-hidden ancestors
  const dropdownContent = open ? (
    <div
      ref={dropdownRef}
      style={portalStyle}
      className="bg-card border border-input rounded-lg shadow-xl overflow-hidden"
    >
      {options.length > 5 && (
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 bg-muted/50 border-0 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      )}
      <div className="max-h-60 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          <>
            {ungrouped.length > 0 && renderOptions(ungrouped)}
            {groups.map((group) => (
              <div key={group}>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-card/50">
                  {group}
                </div>
                {renderOptions(filtered.filter((o) => o.group === group))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  ) : null
  // --- END AI-MODIFIED ---

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      )}
      <button
        type="button"
        id={id}
        disabled={disabled || loading}
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 bg-card border rounded-lg text-sm text-left
          transition-colors
          ${open ? "border-primary ring-2 ring-ring/20" : "border-input hover:border-border"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className={hasValue ? "text-foreground truncate" : "text-muted-foreground truncate"}>
          {loading ? "Loading..." : hasValue ? selectedLabel : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && hasValue && !disabled && (
            <span onClick={handleClear} className="p-0.5 hover:bg-accent rounded transition-colors">
              <X size={14} className="text-muted-foreground" />
            </span>
          )}
          <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {dropdownContent && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  )
}
