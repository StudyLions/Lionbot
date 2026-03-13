// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Text input with validation, placeholder, and character count
// ============================================================
import { ReactNode } from "react"

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  id?: string
  multiline?: boolean
  rows?: number
  defaultValue?: string
  suffix?: ReactNode
}

export default function TextInput({
  value,
  onChange,
  label,
  placeholder,
  maxLength,
  disabled = false,
  id,
  multiline = false,
  rows = 3,
  defaultValue,
  suffix,
}: TextInputProps) {
  const inputId = id || `txt-${label?.replace(/\s+/g, "-").toLowerCase() || "default"}`
  const isDefault = defaultValue !== undefined && value === defaultValue

  const sharedClasses = `
    w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white
    placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isDefault ? "border-gray-600" : value ? "border-indigo-500/50" : "border-gray-600"}
  `

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {multiline ? (
          <textarea
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            rows={rows}
            className={`${sharedClasses} resize-y`}
          />
        ) : (
          <div className="flex items-center gap-2">
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              className={sharedClasses}
            />
            {suffix}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        {maxLength && (
          <span className={`text-xs ${value.length > maxLength * 0.9 ? "text-amber-400" : "text-gray-500"}`}>
            {value.length}/{maxLength}
          </span>
        )}
        {defaultValue !== undefined && !isDefault && value !== "" && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Reset to default
          </button>
        )}
      </div>
    </div>
  )
}
