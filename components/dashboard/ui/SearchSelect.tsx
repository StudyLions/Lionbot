// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Searchable dropdown select used as base for ChannelSelect and RoleSelect
// ============================================================
import { Search, X, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect, ReactNode } from "react"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedValues = multiple
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : []
  const singleValue = !multiple ? (value as string | null) : null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

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
            ${isSelected ? "bg-indigo-600/20 text-indigo-300" : "text-gray-300 hover:bg-gray-700/50"}
            ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {multiple && (
            <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-500"}`}>
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

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      )}
      <button
        type="button"
        id={id}
        disabled={disabled || loading}
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-800 border rounded-lg text-sm text-left
          transition-colors
          ${open ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-600 hover:border-gray-500"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className={hasValue ? "text-white truncate" : "text-gray-500 truncate"}>
          {loading ? "Loading..." : hasValue ? selectedLabel : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && hasValue && !disabled && (
            <span onClick={handleClear} className="p-0.5 hover:bg-gray-700 rounded transition-colors">
              <X size={14} className="text-gray-400" />
            </span>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-700/50 border-0 rounded text-sm text-white placeholder:text-gray-500 focus:outline-none"
                />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">{emptyMessage}</div>
            ) : (
              <>
                {ungrouped.length > 0 && renderOptions(ungrouped)}
                {groups.map((group) => (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-800/50">
                      {group}
                    </div>
                    {renderOptions(filtered.filter((o) => o.group === group))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
