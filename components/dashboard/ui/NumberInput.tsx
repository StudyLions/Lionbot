// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Number input with validation, unit labels, and default value display
// ============================================================

interface NumberInputProps {
  value: number | null | undefined
  onChange: (value: number | null) => void
  label?: string
  unit?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number | null
  placeholder?: string
  disabled?: boolean
  id?: string
  allowNull?: boolean
}

export default function NumberInput({
  value,
  onChange,
  label,
  unit,
  min,
  max,
  step = 1,
  defaultValue,
  placeholder,
  disabled = false,
  id,
  allowNull = false,
}: NumberInputProps) {
  const inputId = id || `num-${label?.replace(/\s+/g, "-").toLowerCase() || "default"}`
  const isDefault = defaultValue !== undefined && value === defaultValue
  const displayValue = value === null || value === undefined ? "" : value

  function handleChange(raw: string) {
    if (raw === "" && allowNull) {
      onChange(null)
      return
    }
    const num = parseFloat(raw)
    if (isNaN(num)) return
    if (min !== undefined && num < min) return
    if (max !== undefined && num > max) return
    onChange(num)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="number"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || (defaultValue !== undefined && defaultValue !== null ? `Default: ${defaultValue}` : undefined)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            w-32 px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isDefault ? "border-gray-600" : "border-indigo-500/50"}
          `}
        />
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
        {defaultValue !== undefined && defaultValue !== null && !isDefault && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title={`Reset to default (${defaultValue})`}
          >
            Default: {defaultValue}
          </button>
        )}
      </div>
    </div>
  )
}
